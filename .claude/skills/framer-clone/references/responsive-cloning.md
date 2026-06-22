# Responsive cloning (mobile / tablet)

How to recover Framer's responsive layout from the bundle — font sizes, paddings, row→column flips — instead of eyeballing them.

Framer publishes one CSS rule per breakpoint, keyed on the same preset class. Miss this and your mobile rendering will look right at 1440px and broken everywhere else.

---

## 1. Framer's breakpoint contract

Default Framer breakpoints (verified across multiple `.framer.website` exports):

| Variant      | CSS query                                          | Width range   |
|--------------|----------------------------------------------------|---------------|
| Desktop      | (default, no media query)                          | ≥ 1200px      |
| Tablet       | `@media (max-width: 1199px) and (min-width: 810px)`| 810 – 1199px  |
| Phone        | `@media (max-width: 809px)`                        | < 810px       |

Some sites add a 4th XL variant (`(min-width: 1600px)`); always grep before assuming.

```bash
grep -hE "@media[^{]+\{" framer-bundle/*.mjs framer-bundle/page.html \
  | sort -u | head
```

---

## 2. Extract per-breakpoint values

For each token you care about (font size, padding, gap, width, flex-direction), pull all 3 declarations of the same class. Example for the title preset on yuya.framer.website:

```bash
grep -oE "preset-bglb1i[^}]+font-size:\s*[0-9]+px[^}]+letter-spacing:\s*[\-0-9.em]+" framer-bundle/chunk-DJPCOSWV.mjs
# → 174px / -0.09em
# → 116px / -0.09em
# → 76px  / -0.09em
```

The order is **desktop → tablet → phone** because Framer emits them in that DOM order. If unsure, look for the surrounding `@media` block.

Layout values are emitted the same way — same class re-declared per breakpoint:

```bash
grep -oE "\.framer-1umilaq\s*\{[^}]+\}" framer-bundle/chunk-*.mjs
# desktop: padding: 140px 0px 80px 0px; min-height: 800px;
# phone:   padding: 140px 0px 40px 0px; min-height: unset; gap: 34px;
```

Record per token:

```jsonc
"section": {
  "paddingTop":    { "desktop": 140, "tablet": 140, "mobile": 140 },
  "paddingBottom": { "desktop": 80,  "tablet": 80,  "mobile": 40  },
  "minHeight":     { "desktop": 800, "tablet": 800, "mobile": "unset" }
}
```

---

## 3. Translate to React/CSS

Pick ONE of these patterns per token — don't mix. Each has a fit:

### A. `clamp()` — for smoothly-scaling typography & paddings

When the value changes monotonically (e.g. 76 → 116 → 174 px), one clamp is cleaner than 3 media queries:

```ts
fontSize: 'clamp(76px, 11vw, 174px)'        // covers mobile → desktop
padding:  'clamp(40px, 6vw, 80px)'
```

Pick the `vw` middle value so it hits the tablet target near 1000px wide: `target_px ÷ 1000 × 100 ≈ vw`. For 116px at ~1000px viewport → `11.6vw`.

### B. Media queries — for **structural** changes (flex direction, grid columns)

`clamp()` cannot flip `flex-direction: row → column`. Use a media query for layout shape:

```css
@media (max-width: 810px) {
  .top-row { flex-direction: column-reverse; gap: 30px; }
  .bio-row { flex-direction: column; }
}
```

Match Framer's `<810px` breakpoint exactly; arbitrary breakpoints (640, 768) will diverge from the source.

### C. Tailwind responsive prefixes — if you scaffolded with Tailwind

Framer's 810px ≈ Tailwind's `md` (768px). Close enough for most clones, but if pixel-diff matters use a custom breakpoint in `tailwind.config`:

```js
theme: { screens: { yumeTablet: '810px', yumeDesktop: '1200px' } }
```

```tsx
<div className="flex-col-reverse yumeTablet:flex-row gap-[30px] yumeTablet:gap-[10px]">
```

---

## 4. Order-flip on mobile

Framer often reorders elements in mobile via `order:` properties on flex items. Watch for these — they're easy to miss:

```css
/* Desktop: title left, avatar right */
.framer-aqkbdw { order: 0; }   /* avatar */
.framer-7o4si6 { order: 0; }   /* title */

/* Mobile: avatar appears ABOVE title */
@media (max-width:809px) {
  .framer-7o4si6 { order: 1; }
  .framer-aqkbdw { order: 0; }
}
```

In React, replicate either with the same `order` style or with `flex-direction: column-reverse`.

---

## 5. Hidden / shown per breakpoint

Framer hides elements via `display: none` per breakpoint, often for separate desktop/mobile components rendering the same content with different layouts.

```bash
grep -oE "\.framer-[a-z0-9]+\s*\{[^}]*display:\s*none" framer-bundle/chunk-*.mjs
```

If you find them, prefer **one component with responsive CSS** over duplicating markup — React renders both branches even when hidden, hurting Core Web Vitals.

---

## 6. Verification

After implementing, the visual-diff loop must run at **3 viewports**, not just desktop:

```bash
# Diff at desktop, tablet, mobile
for vw in 1440 900 390; do
  node $SKILL_DIR/scripts/visual-diff.js \
    --viewport=${vw}x900 \
    https://source.framer.website http://localhost:3000
done
```

If the script doesn't accept `--viewport`, run Playwright manually:

```bash
npx playwright codegen --viewport-size=390,844 https://source.framer.website
```

Target: ≥95% similarity at each viewport. Common mobile-only gaps:

- **<80%**: forgot to flip flex-direction / order
- **80–92%**: padding or gap value mismatch (forgot the tablet declaration)
- **92–95%**: font-size doesn't track viewport scaling — switch to `clamp()`

---

## 7. Quick checklist before declaring done

- [ ] All `@media` blocks in source are reflected in clone (count them)
- [ ] Typography presets have 3 sizes mapped (desktop / tablet / mobile)
- [ ] Section paddings have per-breakpoint values, not a single guess
- [ ] Any `flex-direction` / `order` flips identified and implemented
- [ ] Visual diff at 390, 900, 1440 widths all ≥ 95%
- [ ] Tested at the exact Framer breakpoints (810px, 1200px) — those are the inflection points where bugs hide
- [ ] **No `vw` inside `clamp()`** — `grep "clamp([^)]*vw" src/blocks/<name>/`  should return 0 lines (use `cqi`)
- [ ] **No `maxWidth`/`minWidth` on EditableText/EditableImage `style` prop** — those constraints block user resize handle (see §8 Rule 2)

---

## 8. Block sizing rules (MANDATORY — past bugs)

These 2 rules prevent the 2 most common rework cycles. Apply BEFORE writing component code.

### Rule 1: Inside `clamp()`, ALWAYS use `cqi` — NEVER `vw`

```ts
// ❌ Wrong — different value in rexerai canvas (iframe 1440px) vs prod browser (1920px)
fontSize: 'clamp(58px, 11vw, 174px)'
padding: 'clamp(20px, 5vw, 80px)'

// ✓ Right — tracks block container width consistently
fontSize: 'clamp(58px, 11cqi, 174px)'
padding: 'clamp(20px, 5cqi, 80px)'
```

**Why:** `vw` = browser viewport (different in canvas iframe vs prod). `cqi` = container inline-size — block is wrapped in `BlockPreviewRenderer` which has `containerType: 'inline-size'` → cqi always resolves to actual block width.

`vw` OUTSIDE `clamp()` is fine when intentional (vd `width: 92vw` cho mobile-only width, `sizes="100vw"` cho `<img>` srcset).

### Rule 2: (Integrate path only) Never put `maxWidth` / `minWidth` on Editable* element styles

**Scope:** applies ONLY when integrating into a host with EditableText/EditableImage wrappers (e.g. `framer-clone-host` → 360-admin-cms v2 builder). Standalone Next.js (Path A) ignores this rule.

```ts
// ❌ Wrong — `maxWidth: 643` blocks user resize handle above 643px
const bioTextStyle: CSSProperties = {
  fontSize: 'clamp(16px, 2.5cqi, 40px)',
  maxWidth: 643,
};
<EditableText style={bioTextStyle}>{bio}</EditableText>

// ✓ Right — let parent control width; EditableText reads user-set _styles.width
const bioTextStyle: CSSProperties = {
  fontSize: 'clamp(16px, 2.5cqi, 40px)',
  width: '100%',
};
```

**Why:** EditableText/EditableImage reads `_styles.{field}.width` from user resize. If consumer style has `maxWidth/minWidth`, the clamp overrides user's manual resize → "ko resize được" bug. Dimension limits go on STATIC parent wrappers (`<div style={{maxWidth: 1400}}>`), not on Editable elements.

---

## 9. Mobile anti-patterns (eyeball at 390px BEFORE visual-diff)

Visual diff returns "60% similarity" with no actionable hint. Your eye catches these instantly:

| Anti-pattern | What ships broken | Fix |
|---|---|---|
| `whiteSpace: 'nowrap'` + huge wordmark with `clamp(...vw...)` | Word overflows viewport — only "Ar…" visible | Drop `nowrap`, OR clamp lower bound where `name.length * (clampMin * 0.55) < 360` |
| Only **one** `@media` rule (e.g. `max-width: 810px`) | Tablet (810–1199px) renders desktop layout — broken | Reflect every `@media` from source. If source has 2 breakpoints, clone has 2 |
| `clamp()` lower bound copied from desktop "looks fine" (`clamp(46px, 4vw, 80px)`) | At 390px font still 46px → wraps weirdly | Pull actual mobile font-size from source (§2). If source says 28px on mobile, lower bound IS 28px |
| Top row `flex; justify-content: space-between` with no mobile override | Title + right label squashed side-by-side at 390px | `@media (max-width: 810px) { flex-direction: column; }` + remove any `align-self: flex-end` |
| Big wordmark + sibling in one `space-between` row | Wordmark squeezes sibling to 1-char width | Stack on mobile (`flex-direction: column`) or wrap wordmark in own row |
| Absolute-positioned mobile-only label using desktop coords | Lands off-screen or under another element | Replace `position: absolute` with flexbox flow at <810px |

**Procedure:** start dev server → open block in admin/page at mobile preset → screenshot → verify no overflow + no cropped text + two-col rows stacked → fix BEFORE visual-diff.
