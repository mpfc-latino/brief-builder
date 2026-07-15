import {
  Document,
  Paragraph,
  TextRun,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  TableLayoutType,
  WidthType,
  BorderStyle,
  AlignmentType,
} from "docx";
import type { BriefData, ClientProfile } from "./types";
import { getClient } from "./clients";
import { getCreativeType } from "./creativeTypes";
import { getSize, filesForSize } from "./sizes";
import { getWizardConfig } from "./sections";
import { htmlToDocx, htmlHasText } from "./htmlToDocx";

// Pure docx assembly for a brief — no I/O. Shared by the download route
// (/api/generate) and the Drive save route (/api/save). Styled PER CLIENT:
// fonts + accent color come from the client's brand profile.

interface DocStyle {
  heading: string; // heading font
  body: string; // body font
  accent: string; // hex without '#', e.g. "302569"
}

// Letter page (12240 twips) minus the 1080-twip side margins set below = 10080.
const TABLE_W = 10080;
const COL_LABEL = 2822; // ~28%
const COL_VALUE = 7258; // ~72%

function titleCase(s: string) {
  return s.replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Resolve the per-client document style (fonts + accent), with safe defaults. */
function styleFor(client: ClientProfile | undefined): DocStyle {
  const accentHex = client?.brand.colors.find((c) => c.hex)?.hex ?? "#302569";
  return {
    heading: client?.brand.fonts?.heading ?? "Playfair Display",
    body: client?.brand.fonts?.body ?? "Avenir",
    accent: accentHex.replace("#", "").toUpperCase(),
  };
}

// Heading/body/list builders, bound to a per-client style.
function makeHelpers(s: DocStyle) {
  const h1 = (text: string) =>
    new Paragraph({ spacing: { after: 80 }, children: [new TextRun({ text, bold: true, size: 40, font: s.heading, color: s.accent })] });

  const h2 = (text: string) =>
    new Paragraph({
      spacing: { before: 240, after: 80 },
      heading: HeadingLevel.HEADING_2,
      children: [new TextRun({ text, bold: true, size: 26, font: s.heading, color: s.accent })],
    });

  const h3 = (text: string) =>
    new Paragraph({ spacing: { before: 140, after: 40 }, children: [new TextRun({ text, bold: true, size: 22, font: s.body, color: s.accent })] });

  const body = (text: string) =>
    text
      .split(/\n\s*\n/)
      .filter((p) => p.trim())
      .map((p) => new Paragraph({ spacing: { after: 120 }, children: [new TextRun({ text: p.trim(), size: 21, font: s.body })] }));

  // Splits on explicit "•"/"*" bullet markers. A line with no marker is a
  // wrapped continuation of the previous bullet (common with pasted text),
  // not a new bullet — it's joined back on, without a stray space before
  // leading punctuation (e.g. "Feature X, Y, and Z." instead of "Feature" /
  // "X" / "," / "Y" / ", and" / "Z."). Text with no markers at all (e.g. a
  // plain one-per-line list like the color palette) falls back to one
  // bullet per line.
  const bullets = (text: string) => {
    const lines = text.split("\n").map((l) => l.trim());
    const hasMarkers = lines.some((l) => /^[•*]\s*/.test(l));

    const items: string[] = [];
    for (const line of lines) {
      if (!line) continue;
      const marker = hasMarkers ? line.match(/^[•*]\s*(.*)$/) : null;
      if (!hasMarkers || marker) {
        items.push((marker ? marker[1] : line).trim());
      } else if (items.length) {
        const sep = /^[,.;:!?]/.test(line) ? "" : " ";
        items[items.length - 1] += sep + line;
      } else {
        items.push(line);
      }
    }

    return items
      .filter(Boolean)
      .map((item) => new Paragraph({ bullet: { level: 0 }, spacing: { after: 40 }, children: [new TextRun({ text: item, size: 21, font: s.body })] }));
  };

  const metaTable = (rows: [string, string][]) =>
    new Table({
      width: { size: TABLE_W, type: WidthType.DXA },
      columnWidths: [COL_LABEL, COL_VALUE],
      layout: TableLayoutType.FIXED,
      borders: {
        top: { style: BorderStyle.SINGLE, size: 2, color: "E3E6EC" },
        bottom: { style: BorderStyle.SINGLE, size: 2, color: "E3E6EC" },
        left: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
        right: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
        insideHorizontal: { style: BorderStyle.SINGLE, size: 2, color: "E3E6EC" },
        insideVertical: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
      },
      rows: rows.map(
        ([k, v]) =>
          new TableRow({
            children: [
              new TableCell({
                width: { size: COL_LABEL, type: WidthType.DXA },
                children: [new Paragraph({ children: [new TextRun({ text: k, bold: true, size: 20, font: s.body, color: s.accent })] })],
              }),
              new TableCell({
                width: { size: COL_VALUE, type: WidthType.DXA },
                children: [new Paragraph({ children: [new TextRun({ text: v, size: 20, font: s.body })] })],
              }),
            ],
          })
      ),
    });

  return { h1, h2, h3, body, bullets, metaTable };
}

/** Build the styled Word document for a brief. Pure — no I/O. */
export function buildBriefDocx(brief: BriefData): Document {
  const client = getClient(brief.clientId);
  const ctype = getCreativeType(brief.creativeTypeId);
  const cfg = ctype ? getWizardConfig(ctype) : null;
  const campaign = client?.campaigns.find((c) => c.id === brief.campaignId);
  const sizes = (brief.sizeIds || []).map((id) => getSize(id)).filter(Boolean);

  const s = styleFor(client);
  const { h1, h2, h3, body, bullets, metaTable } = makeHelpers(s);
  const filePrefix = brief.saveAs?.trim() || brief.projectName;

  const children: (Paragraph | Table)[] = [];

  // Title
  children.push(h1(`${brief.projectName || "Untitled"} — ${ctype?.short ?? "Brief"}`));
  children.push(
    new Paragraph({
      spacing: { after: 200 },
      children: [new TextRun({ text: client?.name ?? "", italics: true, size: 22, font: s.body, color: "6B7280" })],
    })
  );

  // Meta table
  const meta: [string, string][] = [["Client", client?.name ?? ""], ["Deliverable", ctype?.short ?? ""]];
  if (brief.hasEvent) {
    if (brief.eventDate) meta.push(["Event date", brief.eventDate]);
    if (brief.venue) meta.push(["Venue", brief.venue]);
  }
  const secondaryCampaign = client?.campaigns.find((c) => c.id === brief.secondaryCampaignId);
  if (campaign) meta.push(["Campaign", [campaign.name, secondaryCampaign?.name].filter(Boolean).join(" + ")]);
  if (brief.reviewMeeting) meta.push(["Review meeting", brief.reviewMeeting]);
  meta.push(["Status", brief.status || "Draft for review"]);
  children.push(metaTable(meta));

  // Objective
  if (brief.objective) {
    children.push(h2("Objective"));
    children.push(...body(brief.objective));
  }

  // Audience
  if (brief.audience || brief.secondaryAudience) {
    children.push(h2("Target Audience"));
    if (brief.audience) {
      children.push(h3("Primary"));
      children.push(...bullets(brief.audience));
    }
    if (brief.secondaryAudience) {
      children.push(h3("Secondary"));
      children.push(...bullets(brief.secondaryAudience));
    }
  }

  // Strategic insight (Strategy & DM)
  if (brief.strategicInsight) {
    children.push(h2("Strategic Insight"));
    children.push(...body(brief.strategicInsight));
  }

  // Single-Minded Proposition (TV Commercial)
  if (brief.smp) {
    children.push(h2("Single-Minded Proposition"));
    children.push(...body(brief.smp));
  }

  // Key Messages (ads, e-blasts)
  if (brief.keyMessages) {
    children.push(h2(cfg?.keyMessagesLabel ?? "Key Messages"));
    children.push(...bullets(brief.keyMessages));
  }

  // Concept (label varies by deliverable — KV concept, ad concept, script, …)
  if (brief.concept && htmlHasText(brief.concept)) {
    children.push(h2(cfg?.conceptLabel ?? "Creative Concept"));
    children.push(...htmlToDocx(brief.concept, { font: s.body, headingColor: s.accent }));
  }

  // Tone & Direction (TV Commercial)
  if (brief.toneDirection) {
    children.push(h2("Tone & Direction"));
    children.push(...body(brief.toneDirection));
  }

  // Content direction (Social)
  if (brief.contentDirection || brief.contentFeel || brief.storyFlow) {
    children.push(h2("Content Direction"));
    if (brief.contentDirection) children.push(...body(brief.contentDirection));
    if (brief.contentFeel) {
      children.push(h3("Feel / Tone"));
      children.push(...bullets(brief.contentFeel));
    }
    if (brief.storyFlow) {
      children.push(h3("Storytelling Flow"));
      children.push(...body(brief.storyFlow));
    }
  }

  // Storyboard — per slide / frame (Social)
  if (brief.slides?.length) {
    children.push(h2("Storyboard"));
    brief.slides.forEach((sl, i) => {
      children.push(h3(sl.title ? `${i + 1}. ${sl.title}` : `Slide ${i + 1}`));
      if (sl.visual) children.push(...body(`Visual: ${sl.visual}`));
      if (sl.onImageText) children.push(...body(`On-image text: ${sl.onImageText}`));
      if (sl.proof) children.push(...body(`Proof: ${sl.proof}`));
      if (sl.purpose) children.push(...body(`Purpose: ${sl.purpose}`));
    });
  }

  // Style guide
  const hasStyle = brief.palette || brief.typography || (brief.sourceAssets?.length ?? 0) > 0 || brief.moodboardLink;
  if (hasStyle) {
    children.push(h2("Visual Concept & Style Guide"));
    if (brief.palette) {
      children.push(h3("Color Palette"));
      children.push(...bullets(brief.palette));
    }
    if (brief.typography) {
      children.push(h3("Typography"));
      children.push(...body(brief.typography));
    }
    if (brief.sourceAssets?.length) {
      children.push(h3("Source Assets"));
      for (const a of brief.sourceAssets) {
        children.push(
          new Paragraph({
            spacing: { after: 40 },
            children: [
              new TextRun({ text: `${a.file} `, bold: true, size: 21, font: s.body }),
              new TextRun({ text: a.link ? `— ${a.link}` : "", italics: true, size: 21, font: s.body, color: "6B7280" }),
            ],
          })
        );
        if (a.edits) children.push(...body(a.edits));
      }
    }
    if (brief.moodboardLink) {
      children.push(h3("Moodboard Reference"));
      children.push(...body(brief.moodboardLink));
    }
  }

  // Channels & messaging (Strategy & DM)
  if (brief.channels) {
    children.push(h2("Channels & Mix"));
    children.push(...bullets(brief.channels));
  }
  if (brief.pillars) {
    children.push(h2("Messaging & Content Pillars"));
    children.push(...bullets(brief.pillars));
  }

  // Mood
  if (brief.mood) {
    children.push(h2("Mood"));
    children.push(...bullets(brief.mood));
  }

  // In-image content (rich text — preserves the on-image hierarchy)
  if (brief.inImageContent && htmlHasText(brief.inImageContent)) {
    children.push(h2(cfg?.inImageContentLabel ?? "Content (in image)"));
    children.push(...htmlToDocx(brief.inImageContent, { font: s.body, headingColor: s.accent }));
  }

  // Caption & distribution (Social)
  if (brief.hook || brief.caption || brief.hashtags || brief.cta || brief.postingDate || brief.platform) {
    children.push(h2("Caption & Distribution"));
    if (brief.hook) {
      children.push(h3("Hook"));
      children.push(...body(brief.hook));
    }
    if (brief.caption) {
      children.push(h3("Caption"));
      children.push(...body(brief.caption));
    }
    if (brief.hashtags) {
      children.push(h3("Hashtags"));
      children.push(...body(brief.hashtags));
    }
    if (brief.cta) {
      children.push(h3("CTA"));
      children.push(...body(brief.cta));
    }
    const dist = [brief.postingDate, brief.platform].filter(Boolean).join(" · ");
    if (dist) {
      children.push(h3("Posting"));
      children.push(...body(dist));
    }
  }

  // Cadence / KPIs / Budget (Strategy & DM)
  if (brief.cadence) {
    children.push(h2("Cadence & Timeline"));
    children.push(...body(brief.cadence));
  }
  if (brief.kpis) {
    children.push(h2("KPIs & Measurement"));
    children.push(...bullets(brief.kpis));
  }
  if (brief.budget) {
    children.push(h2("Budget"));
    children.push(...body(brief.budget));
  }

  // Notes
  if (brief.designerNotes) {
    children.push(h2(cfg?.designerNotes ? titleCase(cfg.designerNotesLabel ?? "Notes for Designer") : titleCase(cfg?.notesLabel ?? "Notes for Designer")));
    children.push(...bullets(brief.designerNotes));
  }

  // Specs
  if (sizes.length || brief.duration || brief.saveAs || brief.saveLocation) {
    children.push(h2("Platforms & Specifications"));
    if (brief.saveAs) {
      children.push(h3("Save deliverables as"));
      children.push(...body(brief.saveAs));
    }
    if (sizes.length) {
      children.push(h3("Sizes"));
      for (const sz of sizes) {
        if (!sz) continue;
        const variantIds = brief.sizeVariants?.[sz.id] ?? [];
        const hasFileNaming = Boolean(sz.saveName) || (sz.variants?.length ?? 0) > 0;

        if (hasFileNaming) {
          // KV-style: spell out the exact files to save (base + each ticked variant).
          children.push(
            new Paragraph({
              spacing: { before: 80, after: 20 },
              children: [
                new TextRun({ text: sz.label, bold: true, size: 21, font: s.body, color: s.accent }),
                ...(sz.note ? [new TextRun({ text: `  — ${sz.note}`, size: 18, italics: true, color: "6B7280", font: s.body })] : []),
              ],
            })
          );
          for (const f of filesForSize(sz, variantIds, filePrefix)) {
            children.push(new Paragraph({ bullet: { level: 0 }, spacing: { after: 20 }, children: [new TextRun({ text: f, size: 20, font: s.body })] }));
          }
        } else {
          // Standard size: one bullet, label + spec note.
          children.push(
            new Paragraph({
              bullet: { level: 0 },
              spacing: { after: 30 },
              children: [
                new TextRun({ text: sz.label, size: 21, font: s.body }),
                ...(sz.note ? [new TextRun({ text: `  — ${sz.note}`, size: 18, italics: true, color: "6B7280", font: s.body })] : []),
              ],
            })
          );
        }
      }
    }
    if (brief.duration) {
      children.push(h3("Duration"));
      children.push(...body(brief.duration));
    }
    if (brief.saveLocation) {
      children.push(h3("Drive Folder"));
      children.push(...body(brief.saveLocation));
    }
  }

  // Footer line
  children.push(
    new Paragraph({
      spacing: { before: 320 },
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: "Generated with Brief Builder — Latinovation", size: 16, font: s.body, color: "9CA3AF" })],
    })
  );

  return new Document({
    creator: "Brief Builder",
    title: brief.projectName || "Brief",
    sections: [
      {
        properties: { page: { margin: { top: 1080, bottom: 1080, left: 1080, right: 1080 } } },
        children,
      },
    ],
  });
}

/** The .docx file name for a brief, e.g. "Madama Butterfly Key Visual.docx". */
export function briefFileName(brief: BriefData): string {
  // A custom name wins — keep it verbatim (spaces + case), only strip characters
  // that are illegal in file names.
  if (brief.docName?.trim()) {
    const clean = brief.docName.trim().replace(/[\\/:*?"<>|]+/g, " ").replace(/\s+/g, " ").trim();
    return /\.docx$/i.test(clean) ? clean : `${clean}.docx`;
  }
  // Auto name: "Project — Type".
  const ctype = getCreativeType(brief.creativeTypeId);
  const project = (brief.projectName || "Brief").trim();
  return ctype ? `${project} ${ctype.short}.docx` : `${project}.docx`;
}
