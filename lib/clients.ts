import type { ClientProfile } from "./types";

// Structured client profiles — the app's extract of each client's brand bible.
// Source of truth = the Obsidian vault: 01_CLIENTES/<Client>/Brand Guidelines.md
// (seeded from the GO Brand Book + MSD Brand Manual). Edit there first, then sync.

export const CLIENTS: ClientProfile[] = [
  {
    id: "gulfshore-opera",
    name: "Gulfshore Opera",
    brand: {
      colors: [
        { label: "Indigo (brand anchor)", hex: "#302569", note: "constant brand presence — title lockups, logo" },
        { label: "Sky", hex: "#449DD7", note: "digital support / accents" },
        { label: "Green", hex: "#40B104", note: "accent" },
        { label: "Yellow", hex: "#FFEB43", note: "accent / highlight" },
      ],
      typography:
        "Playfair Display (display) + Avenir (sans / body). Follow the GO Brand Book for lockup, sizing, clear-space.",
      fonts: { heading: "Playfair Display", body: "Avenir" },
      voice:
        "Refined, warm, cultured. Aspirational but familiar — never theatrical or transactional. Mission line: 'Enriching SWFL lives with the magic of vocal music.' Use 'classically trained artists' and 'artistic excellence'.",
      notes: [
        "Keep the indigo as the constant. Gold is mood/lighting, not a brand color.",
        "CTAs: Get Tickets · Reserve Your Seats · Donate Today. Avoid 'Buy Now', 'Click Here', 'Don't Miss Out' — too transactional for the Cultivated Patron.",
        "Each event must feel distinct from sibling events so it earns its own attendance.",
      ],
    },
    // Primary persona from the GO Brand Book.
    defaultAudience:
      "The Cultivated Patron — affluent, 55+, community-minded patrons across Collier, Lee, and Charlotte counties; value live cultural experiences, fine dining, and charitable involvement; donate and bring guests; influenced by trusted curation and peer social proof; read playbills and program notes.",
    // Real GO programs (from the Brand Book). The guideline does not define a
    // distinct audience per program, so each inherits the Cultivated Patron base
    // (lightly contextualized where the guideline supports it) — refine as needed.
    campaigns: [
      // ── Core Audience ──────────────────────────────────────────────────────
      {
        id: "go-opera-lovers",
        name: "Grand Opera / Opera Lovers",
        audience:
          "• Affluent, educated adults 55–80, primarily couples, across Collier, Lee, and Charlotte counties; heavy snowbird overlap — most patrons are seasonal residents\n• Drawn to opera itself: canonical repertoire, renowned artists, beloved titles (Puccini, Verdi, Bizet, Gershwin, Mozart), and the prestige of a grand production\n• GO's most loyal and highest-intent segment — Maestro Club members, major donors, repeat buyers; also the deepest donor overlap\n• Respond to: artistic credibility, title and composer recognition, world-class framing, prestige venue cues, polished CTAs (Reserve Your Seats, Get Tickets)\n• Avoid: generic lifestyle messaging without artistic substance; anything casual, vague, or that underplays the opera itself\n• Strategic role: Core audience — the revenue anchor, the early adopter, and the segment that stabilizes attendance and institutional loyalty",
      },
      // ── Relationship-Expansion Audience ────────────────────────────────────
      {
        id: "go-social-occasional",
        name: "Social & Occasional Attendees",
        audience:
          "• Affluent, culturally interested adults 45–75 — couples, friend groups, club and donor circles, women's social groups — across Collier, Lee, and Charlotte counties; strong snowbird and year-round mix\n• Drawn to the occasion as much as the art: elegant venues, cocktail and dinner settings, themed concerts, galas, luncheons, and community events\n• Not necessarily opera-literate — motivation is social, experiential, and lifestyle-driven; messaging must feel inviting, not academic\n• Key event types: Taste of Opera, Songs of Love, Style & Song Luncheon, Masquerade Gala, country-club soirées, Broadway crossover programs\n• Respond to: romantic, elegant, festive framing; venue and atmosphere cues; CTAs like 'Reserve Your Seats,' 'Join us for an elegant evening,' 'Bring a friend'\n• Strategic role: Relationship-expansion audience — helps GO grow beyond core opera loyalists and build broader community support",
      },
      // ── Growth Audience ────────────────────────────────────────────────────
      {
        id: "go-newcomers",
        name: "Newcomers",
        audience:
          "• Culturally curious adults 30–65 — couples, individuals, new residents, local professionals, guests of loyal patrons — across SWFL; the broadest demographic range of all segments\n• Being introduced to GO or opera for the first time; no prior relationship with the art form or the organization\n• Motivated by curiosity, recognizable titles, emotional hooks, and welcoming framing — not repertoire depth or institutional loyalty\n• Key entry points: Songs of Love, Opera to Broadway, Carmen, Porgy and Bess, community concerts, social events, high-recognition titles\n• Respond to: clarity, emotional storytelling, accessible language, warm low-pressure CTAs ('Join us,' 'Experience it live,' 'Perfect for first-time guests')\n• Biggest barrier: 'opera isn't for me' — messaging must reduce intimidation and lead with the experience, not the institution\n• Strategic role: Growth audience — where new ticket buyers and long-term audience development begins",
      },
      // ── Funding Audience ───────────────────────────────────────────────────
      {
        id: "go-donors",
        name: "Donors / Philanthropic Supporters",
        audience:
          "• Affluent to high-net-worth adults 55+, civic leaders, philanthropic households, board-connected and socially influential — concentrated in Naples, Marco Island, Bonita Springs, and luxury communities\n• Relationship with GO is defined by giving, not just attendance — major donors, Maestro Club members, gala supporters, annual fund contributors, prospective philanthropists\n• Motivated by mission impact, legacy, cultural stewardship, regional pride, and insider access — not ticket sales\n• Key touchpoints: personalized invitations, donor dinners, gala collateral, impact reports, sponsorship decks, one-to-one outreach\n• Respond to: evidence of growth and excellence, leadership trust, recognition, exclusivity, and clear articulation of community benefit\n• Biggest barrier: messaging that feels transactional or ticket-focused — requires stewardship, not promotion\n• Strategic role: Funding audience — essential to financial sustainability, mission advancement, and long-term institutional growth",
      },
      // ── Stakeholder Audience ───────────────────────────────────────────────
      {
        id: "go-community-partners",
        name: "Community Partners / Institutional Stakeholders",
        audience:
          "• Not a consumer segment — organizations, businesses, funders, media, and civic institutions; represented by marketing directors, executives, development leads, venue teams, and cultural administrators\n• Supports GO through sponsorship, hosting, venue access, media partnership, grantmaking, tourism promotion, or community alignment\n• Motivated by brand alignment, shared visibility, audience reach, regional credibility, and measurable community impact\n• Key touchpoints: sponsorship decks, grant applications, partner presentations, recognition materials, corporate email outreach\n• Respond to: GO's professionalism, strong branding, clear audience quality data, regional footprint, and documented outcomes\n• Biggest barrier: weak partnership presentation, unclear ROI, or inconsistent brand — requires polished, outcome-oriented materials\n• Strategic role: Stakeholder audience — crucial for funding, credibility, venue access, tourism alignment, and institutional growth",
      },
      // ── Mission Audience ───────────────────────────────────────────────────
      {
        id: "go-community-education",
        name: "Community / Education / Access Participants",
        audience:
          "• Children, teens, families, emerging artists, and early-career singers connected to GO through outreach and education — not traditional ticket buyers; diverse backgrounds across SWFL including underserved communities\n• Connected through Harmony Choir, youth programs, artist-development initiatives, and partner organizations\n• Motivated by access, belonging, musical growth, mentorship, and opportunity — not repertoire or event attendance\n• Key touchpoints: partner organizations, community outreach, grant reports, mission storytelling, impact pages, local nonprofit networks\n• Central to GO's grants, impact narrative, and community trust — helps define GO as a community-centered organization, not only a presenter\n• Biggest barrier: cost, transportation, awareness, and the perception that opera isn't for them\n• Strategic role: Mission audience — central to grants, impact storytelling, community trust, and long-term audience and artist development",
      },
    ],
    driveFolderHint:
      "Shared drives / Latinovation Team Drive / 01 Clients / 02 Gulfshore Opera Latinovation / Season 13 2026-27 / …",
  },
  {
    id: "my-shower-door",
    name: "MY Shower Door (MSD)",
    brand: {
      colors: [
        { label: "Teal", hex: "#3B8290", note: "primary brand color (Pantone 7698 C)" },
        { label: "Dark Teal", hex: "#2B606A", note: "depth / secondary primary" },
        { label: "Gray", hex: "#4D4C4C" },
        { label: "Light Teal", hex: "#B4D2D8", note: "secondary" },
        { label: "Yellow", hex: "#FFF200", note: "accent" },
      ],
      typography: "Barlow family — Regular (body), Bold (titles & key highlights), Italic (secondary info / CTAs).",
      fonts: { heading: "Barlow", body: "Barlow" },
      voice:
        "Refined confidence — clear, precise, warm. Reassure, guide, inspire. 'Precision engineering', never 'design'. No em dashes. Proof-led.",
      notes: [
        "Lead with quality, peace of mind, craftsmanship, customization — never lowest price.",
        "Reference proof: 4,000+ 5-star Google reviews · 120K+ installs · 21+ years · Inc. 5000.",
        "Visual: include Sophistication / Minimalist / Detail; exclude Retro / Organic / Rustic. Keep the focal center of hero shots free of text.",
      ],
    },
    // Primary persona from the MSD Brand Manual.
    defaultAudience:
      "Sarah & David, the Guided Renovators — design-focused homeowners 40–65 with $250k+ household income, mid-renovation on a primary residence in high-end neighborhoods; value quality, reliability, and expert guidance while keeping control; want sleek, frameless, spa-like bathrooms; influenced by interior designers, trusted contractors, and high-end referrals.",
    campaigns: [
      // ── Core Audience ──────────────────────────────────────────────────────
      {
        id: "msd-established-affluent-retiree",
        name: "The Established Affluent Retiree",
        audience:
          "• Full-time or majority-time FL residents 60–78 (concentrated 65–74); $150K+ household income, often 7–8 figure net worth; Naples/Collier, Sarasota, Boca Raton, affluent Tampa/St. Pete pockets\n• Married/partnered empty-nesters; primary or later-life home in coastal or gated community; active in HOAs and country clubs where neighbor comparison is common\n• Quality-first, not price-driven; expect white-glove service matching home value; distrust subcontractor chains; reward proof, longevity, and named warranties\n• Draw: in-house design/manufacture/install, 10-year MY EZ Care Shield warranty, W-2 installers, Ultra-Clear low-iron glass, local longevity since 2003\n• Channels: Houzz (55–64 female-led cohort), local Google search, luxury print (Gulfshore Life, Naples Illustrated), showroom, designer referral\n• Strategic role: Revenue anchor — sets the premium standard and funds the business; first priority in the audience model",
      },
      {
        id: "msd-snowbird-seasonal",
        name: "The Snowbird and Seasonal Homeowner",
        audience:
          "• Second-home owners 55–75; $150K+ household; FL coastal properties Oct–Apr; primary residences in the Northeast, Midwest, and Canada\n• Married couples, frequent hosts; design often female-led or designer-guided; planners who think in seasons\n• Want turnkey upgrade timed to their absence; prefer spring-quote, summer-install, fall-reveal rhythm; value remote coordination without hand-holding\n• Draw: scheduling certainty, trusted in-home coordination, clear follow-through, hosting-ready result on return\n• Channels: Houzz/Pinterest inspiration phase, local Google search, email timed to Feb–Apr and Oct–Nov demand windows, retargeting across the seasonal gap\n• Strategic role: Core demand engine — seasonal calendar should shape media flighting across all FL markets",
      },
      // ── Growth Audience ────────────────────────────────────────────────────
      {
        id: "msd-quick-replacement",
        name: "The Quick-Replacement Glow-Up Buyer",
        audience:
          "• Homeowners 40–70, upper-middle to affluent; all MSD markets; homes 10+ years old; often female primary researcher\n• Tile already in place; want door replaced only — no full remodel; outcome-focused, impatient with disruption\n• Draw: 'biggest upgrade is the shower door, not a remodel' insight; before/after transformations; custom-fit on existing tile; fast, clean installation\n• Channels: Pinterest, Meta, Houzz for inspiration; Google search ('replace old shower door,' 'frameless shower door'); before/after social; retargeting\n• Strategic role: Growth and velocity — top-of-funnel volume and natural on-ramp to future higher-value projects",
      },
      {
        id: "msd-hurricane-rebuild",
        name: "The Hurricane Rebuild Homeowner",
        audience:
          "• Lee and Collier County homeowners 50–75; asset-rich coastal owners managing insurance proceeds; Fort Myers, Cape Coral, Fort Myers Beach, broader Lee/Collier coastline\n• Forced bathroom replacement after hurricane damage; anxious and proof-seeking; did not choose this project; FEMA 50/50 rebuild rule drives full bathroom rebuilds through 2026\n• Draw: hurricane-grade glass and Florida Building Code compliance; in-house model reduces coordination chaos; insurance navigation support; visible reliability\n• Channels: local Google search, dedicated hurricane-rebuild content hub, Google reviews, BBB, Nextdoor\n• Strategic role: Situational growth — event-driven demand in Lee/Collier; serve with targeted content, not always-on spend",
      },
      {
        id: "msd-aging-in-place",
        name: "The Aging-in-Place Upgrader",
        audience:
          "• Homeowners 65+; middle-to-upper income, equity-rich; all MSD markets, strength in FL older population centers; couples or singles planning to remain 10+ years; sometimes guided by adult children\n• Safety-conscious but image-conscious; want dignity and design alongside accessibility; reject institutional/medical look\n• Draw: low-curb and curbless custom enclosures; MY EZ Care Shield easy-clean coating; secure hardware; spa-like look that hides accessibility function\n• Channels: Houzz/Pinterest, local Google search, showroom for hands-on reassurance, adult-child-targeted social\n• Strategic role: Cross-market growth — justifies aging-in-place specialist content as older population expands across all markets",
      },
      {
        id: "msd-carolinas-relocator",
        name: "The Carolinas Career-Stage Relocator",
        audience:
          "• Greater Charlotte, South Charlotte, Ballantyne, Lake Norman, Rock Hill, Fort Mill, and York County; homeowners 35–55, dual-income $90K–$150K+; finance/tech/banking/healthcare professionals; Sun Belt in-migration\n• Gen X/Millennial, digitally native, design-driven, modern-minimalist taste; unfamiliar with the MSD brand\n• Draw: 'now open' local availability; modern design proof; in-house design-to-install-and-warranty story; showroom experience\n• Persuasive sequence: Awareness → Credibility (family-owned track record) → Differentiation (in-house model) → Action\n• Channels: Instagram/Pinterest, local Google search, new showrooms as conversion theaters, builder/designer partnerships in new-construction communities\n• Strategic role: Geographic growth — performance here determines expansion pace beyond Florida",
      },
      // ── Relationship-Expansion Audience ────────────────────────────────────
      {
        id: "msd-past-customers",
        name: "Past Customers and Referral Advocates",
        audience:
          "• 145,000+ past buyers across all 11 markets; concentrated 55+ in FL and 35–55 in the Carolinas; clustered in HOAs, gated communities, and country clubs where recommendations travel fast\n• Already convinced; carry strong goodwill; willing to recommend when prompted at the right moment; have future needs (second bath, second home, aging-in-place)\n• Draw: easy review/referral moments timed to peak satisfaction; recognition and loyalty gestures; reminders of additional needs\n• Channels: email/SMS to owned database, review-request automation 7–14 days post-install, structured referral program, Nextdoor\n• Strategic role: Highest-efficiency growth lever — reactivation and referral at the lowest acquisition cost in the model",
      },
      // ── Stakeholder Audience ───────────────────────────────────────────────
      {
        id: "msd-design-specifiers",
        name: "Design Specifiers: Interior Designers and Architects",
        audience:
          "• Design and architecture professionals 30–60; concentrated in luxury coastal FL (Naples, Sarasota, Boca) and Charlotte new construction; clients skew high-net-worth; MAG extends reach to architectural/new-construction projects\n• Reputation-protective and detail-driven; loyalty to vendors who make them look good; strong preference for partners who protect the final result on the jobsite\n• Draw: in-house custom manufacturing and precise field measurement; premium glass/coatings/hardware finishes to specify; MAG for architectural scope; co-marketing and education support\n• Channels: direct trade outreach, designer partnership program with portfolio updates and events, Houzz Pro, showroom as specification resource, Instagram for designer collaborations\n• Strategic role: Demand multiplier — winning the specifier wins the buyer; formalizing this relationship is one of the highest-return moves in the model",
      },
      {
        id: "msd-trade-partners",
        name: "Trade Partners: Builders, General Contractors, and Remodelers",
        audience:
          "• Builders, GCs, and remodelers 30–60; all MSD markets, concentrated in Naples/Sarasota luxury new construction and Charlotte/Orlando production builds; sourced through Lee BIA and trade referral networks\n• Schedule- and risk-driven; prioritize on-time execution, clean jobsites, fewer callbacks; value partners who coordinate smoothly and get it right the first time\n• Draw: expert measure and install with no guesswork; durable systems and premium hardware; responsive low-friction coordination; multi-unit consistency\n• Channels: trade directories (Lee BIA), direct sales/account management, builder preferred-vendor programs, trade events, referral-adjacent homeowner content\n• Strategic role: Volume channel — recurring multi-unit pipelines and referral-adjacent homeowner demand; active but underdeveloped; priority for structured development",
      },
    ],
    driveFolderHint: "Shared drives / Latinovation Team Drive / 01 Clients / 01 MY Shower Door / …",
  },
];

export function getClient(id: string): ClientProfile | undefined {
  return CLIENTS.find((c) => c.id === id);
}
