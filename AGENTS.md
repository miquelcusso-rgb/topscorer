<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Brand palette + theme (NON-NEGOTIABLE — always check)

- **Only the brand palette: black / gold (`--ts-primary`) / turquoise (`--ts-teal`).**
  NEVER reintroduce the old bluish/navy/purple palette from the first
  (discarded) design (`#7070a0`, `#525278`, `#1e1a38`, `#e8edf8`, `#b0b0cc`…).
  Style everything with the `--ts-*` CSS tokens (`--ts-bg/card/card2/border/
  text/muted/faint/primary/teal/red`) so it adapts to both themes. Audit any new
  component for hardcoded blue hexes before shipping.
- **Default theme is LIGHT.** The site must always load in light mode (no dark
  flash). Anti-flash script + ThemeContext default to `light`; only an explicit
  stored `ts-theme` choice overrides it (system dark preference is ignored).

## Player data quality (search dedup) — run the guardrail

- Before shipping any dataset (`data/players.ts`, `data/curated-ids.ts`) or
  search change, run `node scripts/data-quality-check.mjs` (read-only; exits
  non-zero on duplicate players). It guards the recurring "same player listed
  twice in search" bug. See `docs/data-quality.md` for the root cause and fix.
