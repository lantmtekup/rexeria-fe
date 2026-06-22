# Accessibility Checklist (MANDATORY)

Framer sites are animation-heavy → easy to ship a11y regressions. Enforce these BEFORE marking clone "done".

## 1. Reduced motion (BLOCKING)

Users with vestibular disorders need this. Browsers expose via `prefers-reduced-motion: reduce`.

```tsx
import { useReducedMotion } from 'framer-motion';

function Hero() {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduce ? 0 : 0.8 }}
    >
```

CSS fallback (for non-motion components):

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

**Verify:** Chrome DevTools → Rendering → "Emulate CSS media feature prefers-reduced-motion" → reduce. Animations should snap to end-state.

## 2. Keyboard navigation

Every interactive element (`<button>`, `<a>`, custom click handlers) MUST be reachable via Tab + activatable via Enter/Space.

- ❌ `<div onClick={...}>` — not keyboard-accessible
- ✓ `<button onClick={...}>` with default browser semantics
- ✓ `<div role="button" tabIndex={0} onClick={...} onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && handler()}>`

**Verify:** Tab through the entire block. Every visual control should highlight + activate.

## 3. Focus indicators

NEVER `outline: none` without replacement. Visible focus ring is WCAG 2.4.7.

```css
button:focus-visible,
a:focus-visible {
  outline: 2px solid currentColor;
  outline-offset: 2px;
  border-radius: 4px;
}
```

Framer auto-strips outlines — actively add them back.

## 4. ARIA labels

Icon-only buttons + images: provide accessible name.

```tsx
<button aria-label="Close dialog"><CloseIcon /></button>
<img src="/hero.jpg" alt="Cyclist racing through forest" />
<img src="/divider.svg" alt="" role="presentation" />   {/* decorative */}
```

## 5. Color contrast (WCAG AA)

- Body text vs background ≥ **4.5:1**
- Large text (≥ 18px regular or 14px bold) ≥ **3:1**
- UI components (button border, icon) vs adjacent ≥ **3:1**

**Verify:** Chrome DevTools → Inspect element → "Contrast" line in computed styles tab. Or use [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/).

Common Framer hero pattern: white text over hero image — pass at sharpest center but fail at faded edges. Add gradient overlay (`bg-black/40`) to force baseline.

## 6. Semantic HTML

- One `<h1>` per page. Block clones typically use `<h2>` for section heading.
- `<section>` wraps each block. `<article>` for self-contained content (card, post preview).
- `<button>` for in-page action, `<a>` for navigation.

## 7. Heading hierarchy

Don't skip levels: `<h1>` → `<h2>` → `<h3>`. NOT `<h1>` → `<h3>`.

## 8. Form labels (if block has form)

Every input MUST have a `<label htmlFor>` or `aria-label`.

```tsx
<label htmlFor="email">Email</label>
<input id="email" type="email" />
```

## 9. Touch target size

Mobile interactive elements ≥ **44×44 px** (WCAG 2.5.5). Framer often uses 32px buttons — bump to 44 on mobile via clamp.

```css
.button { min-height: clamp(44px, 8cqi, 56px); min-width: clamp(44px, 8cqi, 56px); }
```

## 10. Animation duration cap

Animations >5s loop or auto-play should pause/stop (WCAG 2.2.2). Marquee infinite scrollers in particular.

```tsx
<div className="marquee" onMouseEnter={pause} onFocus={pause} onMouseLeave={resume}>
```

## Pre-commit checklist

- [ ] `useReducedMotion()` in every motion component
- [ ] All clickable divs replaced with `<button>` or have keyboard handlers
- [ ] No `outline: none` without `:focus-visible` replacement
- [ ] Icon buttons + decorative images have `aria-label` / `alt=""`
- [ ] Body text contrast ≥ 4.5:1 (verified in DevTools)
- [ ] One `<h1>` only; heading order linear
- [ ] Touch targets ≥ 44px on mobile
- [ ] Marquee/auto-play pausable
- [ ] Lighthouse a11y score ≥ 95 (run `npx lighthouse <url> --only-categories=accessibility`)
