# Spec Quality Checklist

Run through this list before handing `spec.md` to the user. Gaps in the spec waste downstream time — every `_fill in_` or vague value forces the dev (or the next agent) to re-visit the original site.

## Completeness

- [ ] Source URL and selector recorded at top
- [ ] At least 3 screenshots exist (desktop, tablet, mobile)
- [ ] Animation video exists (unless `--no-video` was used intentionally)
- [ ] Typography table has at least one row
- [ ] Color section has at least one background and one text color
- [ ] Layout section names the display type and major properties

## Specificity

- [ ] Every measurement is a number with a unit. No "small", "medium", "large", or "some padding".
- [ ] Every color is hex (`#000000`). RGB allowed only when alpha < 1, and even then prefer hex8 (`#000000aa`).
- [ ] Font family is the actual resolved name (e.g., "Geist", "Inter Tight"), not just "sans-serif".
- [ ] Spacing values are exact (`24px`, `1.5rem`), not ranges.

## Animation

- [ ] Library is named (Framer Motion / GSAP / AOS / vanilla CSS).
- [ ] Each animation in the log has all five fields: trigger, property, duration, easing, stagger/delay.
- [ ] Estimated values flagged with `// estimated`.
- [ ] Static blocks (no animation) say "static — no animation" rather than leaving the section blank.

## Responsive

- [ ] Responsive table filled in for all three viewports. No `_fill in_` remaining.
- [ ] Layout direction changes between breakpoints are noted (e.g., row → column).
- [ ] Elements that hide/show at certain breakpoints are listed.

## Handoff

- [ ] "Ready-to-use prompt" section is complete and self-contained.
- [ ] Reading just the prompt + screenshots, another agent could produce a faithful clone without re-visiting the original.

## Common gaps to watch for

- **Hover states** — often missed. If the block has buttons or cards, check for hover transitions in the video.
- **Focus states** — not visible in screenshots. Note them as "verify in browser" if they matter.
- **Dark mode variants** — recon only captures one theme. If the source has a toggle, flag it.
- **Webfont licensing** — if the font is paid (Monotype, Hoefler), suggest a Google Fonts alternate.
- **Background videos / canvas animations** — show up poorly in screenshots; note their presence even if the visual capture is weak.
- **Conditional content** — sticky bars, modals, scroll-progress indicators that only appear in certain states.
