# Common easings

> **Verified for:** Framer Motion v11.x (December 2025 release line).
> **Last refreshed:** 2026-01-15.
> Framer Motion v12 changed default spring physics (`stiffness` baseline) — re-verify if site uses motion@^12.
> Re-extract from latest Framer export if values feel off; this file is a quick lookup, not gospel.

Lookup table of the `cubic-bezier` curves and spring configs that appear most often in Framer exports. Use this to translate values extracted from `animations.json` into the idiomatic framer-motion config (and the Framer-UI name, when users ask "make it feel like X").

---

## Cubic-bezier map

| Framer UI name | cubic-bezier values | framer-motion literal | Feel | Use for |
|---|---|---|---|---|
| Linear | `(0, 0, 1, 1)` | `'linear'` | Constant | Marquee, progress |
| Ease In | `(0.42, 0, 1, 1)` | `'easeIn'` | Starts slow, ends fast | Exit anim, dismiss |
| Ease Out | `(0, 0, 0.58, 1)` | `'easeOut'` | Fast in, settles | Default entrance |
| Ease In Out | `(0.42, 0, 0.58, 1)` | `'easeInOut'` | Symmetric | State toggle |
| Ease Out Quart | `(0.25, 1, 0.5, 1)` | `[0.25, 1, 0.5, 1]` | Smooth decel — the Framer "default" | Reveal on scroll |
| Ease Out Expo | `(0.16, 1, 0.3, 1)` | `[0.16, 1, 0.3, 1]` | Hard snap at the end | Hero headline |
| Ease In Expo | `(0.7, 0, 0.84, 0)` | `[0.7, 0, 0.84, 0]` | Accelerating ramp | Exit slide-off |
| Ease In Out Expo | `(0.87, 0, 0.13, 1)` | `[0.87, 0, 0.13, 1]` | Dramatic S-curve | Page transition, curtain |
| Ease Out Quint | `(0.22, 1, 0.36, 1)` | `[0.22, 1, 0.36, 1]` | Slightly more aggressive than Quart | Image scale-in |
| Ease In Out Quart | `(0.76, 0, 0.24, 1)` | `[0.76, 0, 0.24, 1]` | Balanced drama | Clip-path wipes |
| Ease In Out Cubic | `(0.65, 0, 0.35, 1)` | `[0.65, 0, 0.35, 1]` | Gentle symmetric | Fade swap |
| Anticipate | — | `'anticipate'` (FM string) | Slight pull-back before forward | Fun UI element |
| Back Out | `(0.175, 0.885, 0.32, 1.275)` | `[0.175, 0.885, 0.32, 1.275]` | Overshoot + settle | Pop-in cards |

**Default pick** when bundle doesn't specify: `[0.25, 1, 0.5, 1]` (Ease Out Quart) at `duration: 0.6–0.8s`.

---

## Spring configs

When `animations.json` records `{ type: 'spring', ... }` values, match these profiles:

| Name | `{ stiffness, damping, mass? }` | Feel | Use for |
|---|---|---|---|
| Gentle | `{ stiffness: 120, damping: 14 }` | Soft wobble, lazy | Blobs, decorative |
| Smooth | `{ stiffness: 100, damping: 20 }` | No overshoot | Pointer follower |
| Snappy | `{ stiffness: 400, damping: 30 }` | Responsive, minimal bounce | Drag, hover |
| Bouncy | `{ stiffness: 260, damping: 15 }` | Visible rebound | Modal, popover open |
| Stiff | `{ stiffness: 700, damping: 40 }` | Almost instant | Micro-feedback |

Mass defaults to 1 — only override for large objects that should "drag" (mass 2–3).

### Converting Framer spring values

Framer's internal shape is `{ type: 'spring', bounce, duration }` or `{ dampingRatio, response }`. Convert:

- `response` (seconds) → controls speed. `stiffness ≈ (2π / response)² * mass`
- `bounce` 0–1 → 0 = no overshoot (`damping = 2√(stiffness * mass)`), 1 = max overshoot.

Practical: if `bounce < 0.15`, drop it and use `type: 'tween'` with Ease Out Quart — same visible feel, cheaper.

---

## Duration reference

When the source doesn't specify and feel must match a genre:

| Effect | Duration | Easing |
|---|---|---|
| Micro hover | 150–200ms | Ease Out |
| Button state | 200–250ms | Ease Out Quart |
| Card reveal | 600–800ms | Ease Out Quart |
| Hero headline entrance | 900–1200ms | Ease Out Expo |
| Page transition | 500–700ms (each half) | Ease In Out Expo |
| Image parallax span | 1200–1800ms effective | Ease Out Quart |
| Letter-by-letter stagger | 40–80ms between letters | Ease Out Cubic |

---

## Stagger guidelines

`staggerChildren`:

- Text words: `0.04–0.08s`
- Text letters: `0.02–0.04s`
- List items: `0.08–0.12s`
- Grid cells: `0.04s` (diagonal) or per-row
- Navigation links: `0.06s`

`delayChildren` (wait before first child starts):

- Usually `0.2–0.4s` after parent appears

---

## Source-reading cheatsheet

When reading the extracted bundle in `animations.json`:

| Bundle key | framer-motion equivalent |
|---|---|
| `ease: [a,b,c,d]` | `transition: { ease: [a,b,c,d] }` |
| `duration: N` (seconds) | `transition: { duration: N }` |
| `spring: { stiffness, damping }` | `transition: { type: 'spring', stiffness, damping }` |
| `stagger: N` | `transition: { staggerChildren: N }` in parent variants |
| `delay: N` | `transition: { delay: N }` |
| `repeat: true/∞` | `transition: { repeat: Infinity }` |
| `repeatType: 'reverse'` | `transition: { repeatType: 'reverse' }` |
