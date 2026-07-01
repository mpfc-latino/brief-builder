import { Paragraph, TextRun } from "docx";
import { parse, HTMLElement, TextNode, type Node } from "node-html-parser";

// Converts the rich-text HTML produced by components/RichText.tsx (Tiptap) into
// docx paragraphs/runs, so on-screen hierarchy (headings, bold, italic, lists)
// survives into the generated Word brief. Supports a constrained, predictable tag
// set: h1-h3, p, ul/ol/li, strong/b, em/i, u, s, br. Plain text is handled too.

export interface DocxTextStyle {
  font: string;
  headingColor: string; // hex without '#', e.g. "302569"
}

interface Marks {
  bold: boolean;
  italics: boolean;
  underline: boolean;
  strike: boolean;
}

const BODY_SIZE = 21;
const H1_SIZE = 26;
const H2_SIZE = 23;

function decodeEntities(s: string): string {
  return s
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function isEl(n: Node): n is HTMLElement {
  return n instanceof HTMLElement;
}

function tagOf(el: HTMLElement): string {
  return (el.tagName || "").toLowerCase();
}

/** Walk inline descendants, accumulating marks, into TextRuns. */
function inlineRuns(node: Node, style: DocxTextStyle, base: { size: number; color?: string; bold?: boolean }): TextRun[] {
  const runs: TextRun[] = [];
  const walk = (n: Node, marks: Marks) => {
    for (const child of n.childNodes) {
      if (child instanceof TextNode) {
        const text = decodeEntities(child.rawText);
        // Keep inline spacing between tags; only drop a whitespace-only node when
        // nothing has been emitted yet (leading indentation).
        if (!text) continue;
        if (text.trim() === "" && runs.length === 0) continue;
        runs.push(
          new TextRun({
            text,
            size: base.size,
            font: style.font,
            ...(base.color ? { color: base.color } : {}),
            bold: marks.bold || undefined,
            italics: marks.italics || undefined,
            strike: marks.strike || undefined,
            ...(marks.underline ? { underline: {} } : {}),
          })
        );
      } else if (isEl(child)) {
        const t = tagOf(child);
        if (t === "br") continue;
        const m: Marks = { ...marks };
        if (t === "strong" || t === "b") m.bold = true;
        if (t === "em" || t === "i") m.italics = true;
        if (t === "u") m.underline = true;
        if (t === "s" || t === "strike" || t === "del") m.strike = true;
        walk(child, m);
      }
    }
  };
  walk(node, { bold: !!base.bold, italics: false, underline: false, strike: false });
  return runs;
}

function blockParagraphs(node: Node, style: DocxTextStyle, out: Paragraph[]): void {
  if (node instanceof TextNode) {
    const text = decodeEntities(node.rawText).trim();
    if (text) out.push(new Paragraph({ spacing: { after: 80 }, children: [new TextRun({ text, size: BODY_SIZE, font: style.font })] }));
    return;
  }
  if (!isEl(node)) return;

  const t = tagOf(node);
  switch (t) {
    case "h1":
    case "h2":
      out.push(new Paragraph({ spacing: { before: 120, after: 40 }, children: inlineRuns(node, style, { size: H1_SIZE, color: style.headingColor, bold: true }) }));
      break;
    case "h3":
    case "h4":
    case "h5":
    case "h6":
      out.push(new Paragraph({ spacing: { before: 100, after: 40 }, children: inlineRuns(node, style, { size: H2_SIZE, color: style.headingColor, bold: true }) }));
      break;
    case "ul":
      for (const li of node.childNodes) {
        if (isEl(li) && tagOf(li) === "li") {
          out.push(new Paragraph({ bullet: { level: 0 }, spacing: { after: 30 }, children: inlineRuns(li, style, { size: BODY_SIZE }) }));
        }
      }
      break;
    case "ol": {
      let n = 1;
      for (const li of node.childNodes) {
        if (isEl(li) && tagOf(li) === "li") {
          out.push(
            new Paragraph({
              spacing: { after: 30 },
              children: [new TextRun({ text: `${n}. `, bold: true, size: BODY_SIZE, font: style.font }), ...inlineRuns(li, style, { size: BODY_SIZE })],
            })
          );
          n++;
        }
      }
      break;
    }
    case "br":
      break;
    default: {
      // p, div, or anything else with inline content
      const runs = inlineRuns(node, style, { size: BODY_SIZE });
      if (runs.length) out.push(new Paragraph({ spacing: { after: 80 }, children: runs }));
    }
  }
}

/** True if the HTML contains any visible text (guards against empty "<p></p>"). */
export function htmlHasText(html: string): boolean {
  if (!html) return false;
  return parse(html).text.replace(/\s+/g, "").length > 0;
}

export function htmlToDocx(html: string, style: DocxTextStyle): Paragraph[] {
  const root = parse(html || "");
  const out: Paragraph[] = [];
  for (const node of root.childNodes) blockParagraphs(node, style, out);
  return out;
}
