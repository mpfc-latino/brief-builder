# Brief Builder — Latinovation

A guided web app that turns the creative-brief process into a repeatable team tool.
Pick a client and a creative type → step through an adaptive wizard → AI drafts the
narrative prose → export a brand-styled `.docx`.

**Phase 1 (current):** Key Visual brief, end-to-end, with `.docx` download.
**Phase 2 (next):** Google sign-in + auto-save to the right Shared Drive folder.
**Phase 3:** the other creative archetypes (collateral, ads, social, video, strategy).

## Run it locally

```bash
# Node lives in ~/.local (already installed). If `node` isn't found, run:
export PATH="$HOME/.local/bin:$PATH"

cd ~/Projects/brief-builder
npm run dev
# open http://localhost:3000
```

## Live AI writing (optional)

The app works without an API key — it assembles drafts from your notes.
To enable full AI writing:

```bash
cp .env.local.example .env.local
# paste your Anthropic API key into .env.local, then restart `npm run dev`
```

## Where things live

- `lib/creativeTypes.ts` — the briefable creative types (mirrors ClickUp "Type of Project").
- `lib/clients.ts` — structured client profiles: brand rules + campaigns + audiences.
- `lib/sizes.ts` — master catalog of deliverable sizes.
- `components/Wizard.tsx` — the Key Visual wizard.
- `app/api/ai/route.ts` — AI drafting (with no-key fallback).
- `app/api/generate/route.ts` — builds the styled `.docx`.
