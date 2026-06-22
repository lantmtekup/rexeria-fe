# Framer Motion patterns

Reference catalog of the 15 most common animation patterns you will find in a Framer export. Each entry shows: detection heuristic (what to look for in `animations.json`), and a minimal React snippet.

---

## 1. Fade + slide up on scroll

**Detect:** `{ initial: { opacity: 0, y: 24 }, whileInView: { opacity: 1, y: 0 } }`

```tsx
<motion.div
  initial={{ opacity: 0, y: 24 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true, margin: '-10% 0px' }}
  transition={{ duration: 0.8, ease: [0.25, 1, 0.5, 1] }}
>
  {children}
</motion.div>
```

## 2. Scale + fade image on enter viewport

**Detect:** `scale: 1.1 → 1.0` with `opacity: 0 → 1`.

```tsx
<motion.img
  initial={{ scale: 1.08, opacity: 0 }}
  whileInView={{ scale: 1, opacity: 1 }}
  viewport={{ once: true, margin: '-15%' }}
  transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
/>
```

## 3. Sticky header with scroll-based opacity

**Detect:** `useScroll` + `useTransform(scrollY, [0, 200], [0, 1])`.

```tsx
const { scrollY } = useScroll();
const bg = useTransform(scrollY, [0, 200], ['rgba(255,255,255,0)', 'rgba(255,255,255,0.9)']);
return <motion.header style={{ backgroundColor: bg }} className="fixed top-0 w-full backdrop-blur">…</motion.header>;
```

## 4. Text stagger reveal

**Detect:** variants with `staggerChildren`.

```tsx
const parent = { visible: { transition: { staggerChildren: 0.06 } } };
const child = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 1, 0.5, 1] } },
};
<motion.h1 variants={parent} initial="hidden" whileInView="visible" viewport={{ once: true }}>
  {title.split(' ').map((w, i) => (
    <motion.span key={i} variants={child} className="inline-block mr-[0.25em]">{w}</motion.span>
  ))}
</motion.h1>
```

## 5. Parallax image

**Detect:** `useTransform(scrollYProgress, [0,1], [0, -N])` applied to `y` of a child.

```tsx
const ref = useRef(null);
const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
const y = useTransform(scrollYProgress, [0, 1], ['-10%', '10%']);
return <div ref={ref} className="overflow-hidden"><motion.img style={{ y }} src="…" /></div>;
```

## 6. Pinned / sticky section

**Detect:** `position: sticky; top: 0; height: 100vh` wrapped in a taller track.

```tsx
<section className="h-[500vh] relative">
  <div className="sticky top-0 h-screen overflow-hidden">{content}</div>
</section>
```

## 7. Cross-fade between stacked images (scroll-linked)

**Detect:** multiple absolutely-positioned images, opacity driven by scrollYProgress.

```tsx
{items.map((it, i) => {
  const opacity = useTransform(scrollYProgress, [i / n, (i + 0.5) / n, (i + 1) / n], [0, 1, 0]);
  return <motion.img key={i} style={{ opacity }} src={it.src} className="absolute inset-0" />;
})}
```

## 8. Marquee / infinite horizontal scroll

**Detect:** `animate: { x: [0, -w] }` with `repeat: Infinity`.

```tsx
<motion.div
  animate={{ x: [0, -itemsWidth] }}
  transition={{ repeat: Infinity, duration: 30, ease: 'linear' }}
  className="flex"
>
  {[...items, ...items].map((it, i) => <Card key={i} {...it} />)}
</motion.div>
```

## 9. Horizontal scroll inside vertical page (pinned)

**Detect:** pinned section + `x = useTransform(scrollYProgress, [0,1], [0, -totalWidth])`.

```tsx
const x = useTransform(scrollYProgress, [0, 1], ['0%', '-75%']);
<section ref={ref} className="h-[300vh]">
  <div className="sticky top-0 h-screen overflow-hidden">
    <motion.div style={{ x }} className="flex h-full">{panels}</motion.div>
  </div>
</section>
```

## 10. Page transition

```tsx
<AnimatePresence mode="wait">
  <motion.main key={pathname}
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.4 }}
  >
    {children}
  </motion.main>
</AnimatePresence>
```

## 11. Hover lift with spring

```tsx
<motion.a
  whileHover={{ y: -4, scale: 1.01 }}
  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
>…</motion.a>
```

## 12. Cursor follower

```tsx
const x = useMotionValue(0), y = useMotionValue(0);
const sx = useSpring(x, { stiffness: 250, damping: 30 });
const sy = useSpring(y, { stiffness: 250, damping: 30 });
useEffect(() => {
  const on = (e: MouseEvent) => { x.set(e.clientX); y.set(e.clientY); };
  window.addEventListener('mousemove', on);
  return () => window.removeEventListener('mousemove', on);
}, []);
<motion.div style={{ x: sx, y: sy }} className="pointer-events-none fixed w-8 h-8 rounded-full bg-white mix-blend-difference" />
```

## 13. Letter-by-letter display title

```tsx
const letters = title.split('');
{letters.map((l, i) => (
  <motion.span key={i}
    initial={{ opacity: 0, y: '50%' }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, delay: i * 0.03, ease: [0.33, 1, 0.68, 1] }}
    className="inline-block"
  >{l === ' ' ? ' ' : l}</motion.span>
))}
```

## 14. Clip-path reveal (wipe)

**Detect:** `clipPath: 'inset(100% 0 0 0)' → 'inset(0 0 0 0)'`.

```tsx
<motion.div
  initial={{ clipPath: 'inset(100% 0 0 0)' }}
  whileInView={{ clipPath: 'inset(0 0 0 0)' }}
  viewport={{ once: true }}
  transition={{ duration: 1.1, ease: [0.76, 0, 0.24, 1] }}
>{content}</motion.div>
```

## 15. Draw-on SVG path

```tsx
<motion.path d="…" fill="none" stroke="currentColor"
  initial={{ pathLength: 0 }}
  whileInView={{ pathLength: 1 }}
  transition={{ duration: 1.5, ease: 'easeInOut' }}
/>
```
