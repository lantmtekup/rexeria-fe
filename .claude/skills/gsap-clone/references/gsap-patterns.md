# GSAP patterns

15 most common GSAP + ScrollTrigger patterns. Each entry shows: detection (what to look for in `animations.json`) and a minimal template.

---

## 1. Fade up on scroll

**Detect:** `gsap.from(sel, { y, opacity: 0, scrollTrigger: { start: 'top N%' } })`

```ts
gsap.from('.feature', {
  y: 60, opacity: 0,
  duration: 1, ease: 'power3.out',
  scrollTrigger: { trigger: '.feature', start: 'top 80%' },
});
```

## 2. Image scale on enter (1.15 → 1.0)

```ts
gsap.from('.hero-img', {
  scale: 1.15,
  duration: 1.4, ease: 'power4.out',
  scrollTrigger: { trigger: '.hero', start: 'top 90%' },
});
```

## 3. Pinned section with scrub

**Detect:** `pin: true` + `scrub: 1` + `start: 'top top'`

```ts
ScrollTrigger.create({
  trigger: '.story',
  start: 'top top',
  end: '+=2000',
  pin: true, scrub: 1,
  animation: gsap.timeline()
    .to('.story-bg', { scale: 1.2 })
    .to('.story-text', { y: -100 }, 0),
});
```

## 4. Parallax Y offset

```ts
gsap.to('.parallax-img', {
  yPercent: -20, ease: 'none',
  scrollTrigger: { trigger: '.parallax', start: 'top bottom', end: 'bottom top', scrub: true },
});
```

## 5. SplitType char stagger reveal

**Detect:** `new SplitType(...)` then `gsap.from(el.chars, ...)`

```ts
const split = new SplitType('.hero-title', { types: 'chars' });
gsap.from(split.chars, {
  y: 100, opacity: 0,
  duration: 0.8, ease: 'power3.out',
  stagger: 0.02,
  scrollTrigger: { trigger: '.hero-title', start: 'top 85%' },
});
```

## 6. Image clip-path reveal

```ts
gsap.from('.reveal-img', {
  clipPath: 'inset(100% 0 0 0)',
  duration: 1.2, ease: 'power4.out',
  scrollTrigger: { trigger: '.reveal-img', start: 'top 75%' },
});
```

## 7. Marquee infinite

```ts
gsap.to('.marquee-track', {
  xPercent: -50, repeat: -1, duration: 30, ease: 'none',
});
```

## 8. Counter number animation

```ts
const obj = { n: 0 };
gsap.to(obj, {
  n: 1250,
  duration: 2, ease: 'power2.out',
  onUpdate: () => { document.querySelector('.count')!.textContent = Math.floor(obj.n).toLocaleString(); },
  scrollTrigger: { trigger: '.stats', start: 'top 80%' },
});
```

## 9. Cursor follow

```ts
const cursor = document.querySelector<HTMLElement>('.cursor')!;
const xTo = gsap.quickTo(cursor, 'x', { duration: 0.3, ease: 'power3' });
const yTo = gsap.quickTo(cursor, 'y', { duration: 0.3, ease: 'power3' });
window.addEventListener('mousemove', (e) => { xTo(e.clientX); yTo(e.clientY); });
```

## 10. Page transition fade

```ts
// Fade out current, navigate, fade in new (works with View Transitions or barba.js)
gsap.to('.page', { opacity: 0, duration: 0.4, ease: 'power2.in', onComplete: () => navigate(url) });
```

## 11. Horizontal scroll panels

```ts
const sections = gsap.utils.toArray<HTMLElement>('.panel');
gsap.to(sections, {
  xPercent: -100 * (sections.length - 1),
  ease: 'none',
  scrollTrigger: {
    trigger: '.h-track',
    pin: true, scrub: 1,
    end: () => '+=' + (window.innerWidth * (sections.length - 1)),
  },
});
```

## 12. Sticky header opacity on scroll

```ts
ScrollTrigger.create({
  trigger: '.hero', start: 'bottom top',
  onEnter: () => gsap.to('.header', { backgroundColor: 'rgba(0,0,0,0.8)', duration: 0.3 }),
  onLeaveBack: () => gsap.to('.header', { backgroundColor: 'transparent', duration: 0.3 }),
});
```

## 13. Image gallery hover scale

```ts
document.querySelectorAll<HTMLElement>('.tile').forEach((tile) => {
  const img = tile.querySelector<HTMLImageElement>('img')!;
  tile.addEventListener('mouseenter', () => gsap.to(img, { scale: 1.06, duration: 0.6, ease: 'power3.out' }));
  tile.addEventListener('mouseleave', () => gsap.to(img, { scale: 1, duration: 0.6, ease: 'power3.out' }));
});
```

## 14. Text mask reveal (line-by-line)

```ts
const split = new SplitType('.body-text', { types: 'lines', lineClass: 'line' });
split.lines!.forEach((line) => {
  const wrap = document.createElement('span');
  wrap.style.cssText = 'display:block;overflow:hidden';
  line.parentNode!.insertBefore(wrap, line); wrap.appendChild(line);
});
gsap.from('.line', {
  yPercent: 110,
  duration: 1, ease: 'power4.out',
  stagger: 0.06,
  scrollTrigger: { trigger: '.body-text', start: 'top 80%' },
});
```

## 15. Sequential timeline animation

```ts
const tl = gsap.timeline({
  scrollTrigger: { trigger: '.intro', start: 'top 70%' },
});
tl.from('.intro-eyebrow', { y: 30, opacity: 0, duration: 0.6, ease: 'power3.out' })
  .from('.intro-title',   { y: 50, opacity: 0, duration: 0.9, ease: 'power3.out' }, '-=0.3')
  .from('.intro-cta',     { y: 30, opacity: 0, duration: 0.6, ease: 'power3.out' }, '-=0.4');
```

---

## Ease cheatsheet

| GSAP ease | Feel | Use for |
|---|---|---|
| `none` (linear) | Constant | Marquee, scrub-driven parallax |
| `power1.out` | Light decel | Hover micro |
| `power2.out` | Standard decel | Buttons, nav |
| `power3.out` | The "default" | Most reveals |
| `power4.out` | Hard decel | Hero entrance |
| `expo.out` | Snap at end | Display titles |
| `circ.out` | Smooth decel curve | Image reveals |
| `back.out(1.5)` | Overshoot + settle | Pop-in cards |
| `elastic.out(1, 0.4)` | Bouncy spring | Decorative |

**Default pick** when bundle doesn't specify: `power3.out` at `duration: 0.8–1.2s`.
