# Reduced Motion Patterns

Every cloned block should respect `prefers-reduced-motion`. Spec.md should explicitly call out the reduced-motion fallback for each animation — otherwise the dev will skip it (or worse, copy-paste a hardcoded animation that shipping triggers vestibular issues for users who opted out).

## What "reduced motion" actually means

When a user sets `prefers-reduced-motion: reduce` (OS setting → System → Accessibility), they're not saying "I want no motion" — they're saying "motion that moves things across the screen makes me sick or distracted." Specifically:

- **Avoid:** translations, scaling, parallax, auto-play, large rotations
- **OK to keep:** opacity fades, color transitions, very small (<1px) shifts, focus indicators

So the standard fallback is **opacity-only**, not "skip animation entirely."

## Pattern: fade + slide → fade only

```jsx
const reduceMotion = useReducedMotion();

const initial = reduceMotion
  ? { opacity: 0 }
  : { opacity: 0, y: 40 };

const animate = { opacity: 1, y: 0 };

const transition = reduceMotion
  ? { duration: 0.2 }
  : { duration: 0.6, ease: [0.22, 1, 0.36, 1] };

<motion.div initial={initial} animate={animate} transition={transition}>
```

## Pattern: stagger → instant or much shorter

If the original staggers 8 cards over 1.2s, that's 8 separate animations entering one after another. Under reduced motion, either:

- **Instant:** all visible at once (`staggerChildren: 0`)
- **Brief:** stagger reduced to 30-50ms total

```jsx
const stagger = reduceMotion ? 0 : 0.1;

const parent = {
  hidden: {},
  visible: { transition: { staggerChildren: stagger } },
};
```

## Pattern: scale → opacity

Scale animations (zoom in, pop in) are translation-equivalent for vestibular impact. Drop to opacity:

```jsx
const child = reduceMotion
  ? { hidden: { opacity: 0 }, visible: { opacity: 1 } }
  : { hidden: { opacity: 0, scale: 0.9 }, visible: { opacity: 1, scale: 1 } };
```

## Pattern: parallax → no parallax

Continuous scroll-driven motion is the worst offender. Disable entirely:

```jsx
const y = useTransform(scrollY, [0, 500], reduceMotion ? [0, 0] : [0, -100]);
```

Or just skip the `useTransform` and render flat.

## Pattern: marquee / auto-scroll → paused or removed

Infinite animations are particularly bad. If reduced motion is set:

```jsx
{!reduceMotion && <Marquee>{items}</Marquee>}
{reduceMotion && <StaticGrid>{items}</StaticGrid>}
```

Or render static and let the user scroll manually.

## Pattern: character/word-spring titles → instant

For the rexerai-style per-character title animations:

```jsx
function StreamingTitle({ text }) {
  const reduceMotion = useReducedMotion();
  if (reduceMotion) return <h1>{text}</h1>;
  // ... per-char motion.span ...
}
```

This integrates with the `motion-config-sync.md` pattern in `framer-clone-host` — that helper already respects `_motionEnabled`, but it does NOT auto-respect OS `prefers-reduced-motion`. Combine both: the user's CMS toggle AND the OS pref.

## CSS-only fallback (when not using Framer Motion)

```css
.hero-title {
  opacity: 0;
  transform: translateY(40px);
  animation: rise 600ms cubic-bezier(0.22, 1, 0.36, 1) forwards;
}

@media (prefers-reduced-motion: reduce) {
  .hero-title {
    transform: none;
    animation: fade 200ms ease-out forwards;
  }
  @keyframes fade {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
}
```

## In spec.md, document the fallback explicitly

Each animation entry in Section 9 should have a "Reduced motion" line:

```markdown
Animation 1:
  Element:        .hero-title
  Trigger:        scroll-into-view, 30% visible
  Property:       opacity 0→1, translateY 40px→0
  Duration:       600ms
  Easing:         cubic-bezier(0.22, 1, 0.36, 1)
  Reduced motion: opacity 0→1 only, 200ms ease-out  ← REQUIRED LINE
```

Without this line, the downstream codegen agent (or human dev) tends to copy the main animation and forget the fallback. Skill output quality drops measurably.

## Verification

When the user (or another agent) implements the clone, ask them to test:

1. macOS: System Settings → Accessibility → Display → "Reduce motion"
2. iOS: Settings → Accessibility → Motion → "Reduce Motion"
3. Browser DevTools: Rendering panel → "Emulate CSS prefers-reduced-motion: reduce"

With the toggle on, the block should render visibly but without any element moving across the screen.
