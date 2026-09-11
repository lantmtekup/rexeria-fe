# The Magnolia — source analysis (clone spec)

Source: `https://magnolia-demo-black.vercel.app/` — Next.js app router (SSR HTML in `source/index.html`), Tailwind, framer-motion, plus **GSAP + ScrollTrigger** (used only for the background parallax layer and a refresh-on-load hook).

Bundles read: `source/page.pretty.js` (all sections), `source/layout.pretty.js` (preloader, fonts), `source/styles.pretty.css` (token values). Shared app modules (`2893` motion constants, `8530` siteConfig/images, `6051` i18n, `6046` logo mark, `960` LocaleProvider) were not in those two files; they were fetched from `/_next/static/chunks/11-b63f33b330f58f31.js` and are quoted verbatim below. `2345.J` (from chunk 178) is framer-motion's `useReducedMotion()`.

Minified-import legend (page bundle): `(0,l.v)`/`(0,o.v)`/`(0,c.v)`/`(0,i.v)` = `useScroll`; `(0,o.H)`/`(0,i.H)`/`(0,l.H)` = `useTransform`; `(0,o.W)`/`(0,n.W)` = `useMotionValueEvent`; `(0,h.c)` = `useMotionValue`; `(0,x.q)` = `useSpring`; `l.E.*`/`c.E.*`/`i.E.*`/`n.E.*`/`o.E.*` = `motion.*`; `(0,n.J)`/`(0,c.J)`/`(0,i.J)`/`(0,t.J)` = `useReducedMotion()`; `(0,d.b)`/`(0,l.b)`/`(0,c.b)`/`(0,i.b)` = `useLocale()` → `{ t, locale, setLocale }`; `r.default`/`n.default` = `next/image`; `(0,c.cn)`/`(0,l.cn)` = `cn()` (clsx + tailwind-merge). `o.VR`/`u.VR`/`m.VR`/`R.VR` = the ease constant `[0.22, 1, 0.36, 1]`.

---

## 0. Global page shell (order in `<body>`)

From `index.html`:

```html
<html lang="vi" class="__variable_1793ad __variable_8de0eb snap-panels" style="--snap-strictness:proximity">
<body>
  <div id="preloader" …>            <!-- layout: Preloader (AnimatePresence) -->
  <a href="#main" class="sr-only …"> <!-- SkipLink -->
  <header …>                         <!-- SiteHeader -->
  <main id="main">                   <!-- MainShell: <main id="main"> + useScrollTriggerRefresh() -->
    <section id="top">…</section>
    <section id="heritage">…</section>
    <section id="horizontal-slide">…</section>
    <section id="interactive-tour">…</section>
    <section id="units">…</section>
    <section id="grace">…</section>
    <section id="gallery">…</section>
    <section id="consultation">…</section>
  </main>
</body>
```

Head: `<title>The Magnolia — The Journey of Timeless Value — Khai Sơn City, Hà Nội</title>`, `<meta name="description" content="The Journey of Timeless Value — Khai Sơn City, Hà Nội">`, `og:title` "The Magnolia", `og:locale` `vi_VN`, `og:type` website, favicon `/favicon.ico`. `<noscript><style>#preloader{display:none!important}</style></noscript>`.

Image preloads emitted by SSR (`priority` images): hero png (imageSizes 100vw), `/images/assets/horizontal-slide/slide-1.jpg` (plain `<img fetchPriority="high">`), `/images/assets/grace/stair-01.png` (100vw), `/images/assets/day-experience/morning-01.jpg` (`(max-width: 768px) 76vw, 81vw`), `/images/assets/day-experience/morning-02.jpg` (`(max-width: 768px) 57vw, 36vw`).

`MainShell` (module 3550): `<main id="main">{children}</main>` and calls `useScrollTriggerRefresh()` (module 4294 `OZ`): on mount, if `document.fonts.status === "loaded"` call `ScrollTrigger.refresh()` else `document.fonts.ready.then(refresh)`; also `window.addEventListener("load", refresh)`.

`SkipLink` (module 2765): `<a href="#main" className="sr-only z-[100] focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:rounded-none focus:border focus:border-champagne-200 focus:bg-charcoal-950 focus:px-5 focus:py-3 focus:font-sans focus:text-xs focus:uppercase focus:tracking-luxe focus:text-champagne-50">` text `t.a11y.skipToContent` = "Chuyển tới nội dung chính" (en: "Skip to main content").

### 0.1 Preloader (layout module 7548)

State: `done` (`useState(false)`). Config from `siteConfig.preloader = { markSize: 128, spinDuration: 6, minDuration: 1400 }`.

Logic:
- Effect 1: record `performance.now()`; await window `load` (resolves immediately if `document.readyState === "complete"`, hard timeout `10000` ms); then `setTimeout(() => setDone(true), Math.max(0, minDuration − elapsed))`.
- Effect 2 (`[done]`): `document.documentElement.setAttribute("aria-busy", String(!done))`; `document.body.style.overflow = done ? "" : "hidden"`; cleanup restores both.

DOM (wrapped in `<AnimatePresence>`; rendered only while `!done`):
```
motion.div#preloader key="preloader"
  className="fixed inset-0 z-[200] grid place-items-center bg-charcoal-night"
  initial={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.9, ease: VR }}
  └ div.relative.flex.flex-col.items-center.translate-y-[10px]
      ├ motion.div className="max-w-[45vw] text-champagne-400" style={{ width: 128, height: 128 }}
      │    animate = reduced ? { opacity: [0.55, 1, 0.55] } : { rotate: 360 }
      │    transition = reduced ? { duration: 2, repeat: Infinity, ease: "easeInOut" }
      │                         : { duration: 6, repeat: Infinity, ease: "linear" }
      │    └ <MagnoliaMark size={128} className="h-full w-full" />   (module 6046, see Shared)
      └ motion.p role="status" aria-live="polite"
           className="absolute left-1/2 top-full mt-8 -translate-x-1/2 whitespace-nowrap font-sans text-[0.55rem] uppercase tracking-luxe text-champagne-100"
           animate={{ opacity: [1, 0.25, 1] }} transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
           text = t.a11y.loading = "Loading..."
```

---

## 1. Header — `SiteHeader` (module 5394)

### DOM tree
```
motion.header
  initial={{ y: -20, opacity: 0 }}  animate={{ y: 0, opacity: 1 }}
  transition={{ duration: 1, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
  className="fixed inset-x-0 top-0 z-50 bg-transparent"
├ div className="relative flex items-start justify-between px-8 py-7 md:px-10"
│  ├ <ModeTabs value={mode} onChange={setMode} labels={t.modes} className="hidden md:flex" />
│  │    div role="tablist" aria-label="Story Mode / Explore Mode"
│  │        className=cn("flex h-[30px] w-[195px] items-stretch", className)
│  │    └ for key in ["story","explore"]:
│  │        button role="tab" aria-selected={active} tabIndex={active ? 0 : -1} onClick={() => onChange(key)}
│  │          className=cn("relative flex-1 font-display text-[10.4px] leading-none text-ivory",
│  │                       "transition-opacity duration-500 ease-luxe",
│  │                       active ? "bg-white/[0.04] backdrop-blur-[35.9px]" : "opacity-[0.64] hover:opacity-90")
│  │          text = labels[key]
│  │          └ (active only) span aria-hidden className="absolute inset-x-0 bottom-0 h-px bg-ivory"
│  ├ a href="#top" className="absolute left-1/2 top-6 -translate-x-1/2" aria-label={t.hero.brand /* "The Magnolia" */}
│  │    └ <LogoLockup />  (scale = 1)
│  │        div role="img" aria-label="The Magnolia — Private Residences"
│  │            className=cn("flex items-center text-ivory", className) style={{ gap: 7 * scale }}
│  │        ├ <MagnoliaMark size={44 * scale} />
│  │        └ span className="flex flex-col" style={{ gap: 3 * scale }}
│  │            ├ span className="font-display leading-none" style={{ fontSize: 27 * scale, letterSpacing: "0.005em" }}  "The Magnolia"
│  │            └ span className="self-center font-sans font-light leading-none text-ivory/85"
│  │                   style={{ fontSize: 8 * scale, letterSpacing: `${0.3 * scale}em` }}  "PRIVATE RESIDENCES"
│  └ div className="ml-auto flex items-center gap-7"
│      ├ div role="group" aria-label={t.a11y.languageSwitcher /* "Chọn ngôn ngữ" */}
│      │     className="hidden items-center font-sans text-[10.4px] font-light text-ivory sm:flex"
│      │  └ for (code, idx) in ["vi","en"]:
│      │      span className="flex items-center"
│      │        ├ (idx > 0) span className="mx-1.5 opacity-40"  "/"
│      │        └ button type="button" onClick={() => setLocale(code)} aria-pressed={locale === code}
│      │             className=cn("transition-opacity duration-300", locale === code ? "opacity-100" : "opacity-50 hover:opacity-85")
│      │             text = { vi: "VI", en: "EN" }[code]
│      ├ a href="#consultation"
│      │     className="hidden font-sans text-[10.4px] font-light text-ivory opacity-80 transition-opacity duration-300 hover:opacity-100 sm:inline-flex"
│      │     text = t.contact.trigger = "Liên hệ"
│      └ <SoundToggle on={sound} onToggle={() => setSound(s => !s)} label={sound ? t.sound.on : t.sound.off} />
│           button type="button" aria-pressed={on}
│             className=cn("group flex items-center gap-4 text-ivory transition-opacity duration-300",
│                          on ? "opacity-100" : "opacity-60 hover:opacity-90", className)
│           ├ span aria-hidden className="flex h-5 items-center gap-[3px]"
│           │   └ for (h, i) in [9, 16, 20, 13, 7]:
│           │       motion.span className="w-px bg-ivory" style={{ height: h }}
│           │         animate = (on && !reduced) ? { scaleY: [1, 0.35, 1] } : { scaleY: on ? 1 : 0.4 }
│           │         transition = (on && !reduced)
│           │             ? { duration: 1.1 + 0.17 * i, repeat: Infinity, ease: "easeInOut", delay: 0.09 * i }
│           │             : { duration: 0.4 }
│           └ span className="font-sans text-[10.4px] font-light leading-none"  text = label
└ div className="px-8 pb-4 md:hidden"
    └ <ModeTabs value={mode} onChange={setMode} labels={t.modes} />   (mobile copy, no extra className)
```

### Copy
- Tabs: "Story Mode" / "Explore Mode" (same in vi and en). tablist aria-label: "Story Mode / Explore Mode".
- Logo: "The Magnolia", "PRIVATE RESIDENCES"; role=img label "The Magnolia — Private Residences"; link aria-label "The Magnolia".
- Language: "VI" / "EN", separator "/", group label "Chọn ngôn ngữ" (en "Select language").
- Contact link: "Liên hệ" (en "Contact").
- Sound: "Âm thanh - Bật" / "Âm thanh - Tắt" (en "Sound - On" / "Sound - Off").

### Assets
None (logo is inline SVG — see Shared → MagnoliaMark).

### Motion
- Header entrance: `initial {y:-20, opacity:0}` → `animate {y:0, opacity:1}`, `transition {duration:1, delay:0.25, ease:[0.22,1,0.36,1]}` (SSR: `style="opacity:0;transform:translateY(-20px)"`).
- Sound bars: infinite `scaleY [1, 0.35, 1]` per bar with `duration 1.1 + 0.17*i` (1.1, 1.27, 1.44, 1.61, 1.78 s) and `delay 0.09*i` (0, 0.09, 0.18, 0.27, 0.36 s), `ease "easeInOut"`; when off → `scaleY 0.4` over `0.4 s`; when on but reduced-motion → `scaleY 1` over `0.4 s`.
- Tabs: CSS `transition-opacity duration-500 ease-luxe`.

### State / interaction
- `mode = useState("story")` — purely local; nothing else in the app reads it.
- `sound = useState(true)` — purely visual toggle; there is no audio element.
- `locale/setLocale` from `LocaleProvider` (module 960): state initialised to `"vi"`, on mount reads `localStorage["magnolia.locale"]` (accepted values `["vi","en"]`), sets `document.documentElement.lang = locale`, `setLocale` persists to localStorage.
- **No hide/show-on-scroll logic** — header is always `fixed`, `bg-transparent`, `z-50`.

---

## 2. `#top` — Hero (module 6972)

### Component structure
`HeroSection` (default export `y`) picks one of two renders:

```js
function y() {
  let reduced = useReducedMotion(), [completed, setCompleted] = useState(false);
  return reduced ? <HeroStatic/> : completed ? <HeroStatic/> :
    <HeroScrub onComplete={() => { setCompleted(true); window.requestAnimationFrame(() => window.scrollTo(0, 0)); }} />;
}
```
So on first load the page starts with the 260svh scroll-scrubbed film. When `scrollYProgress >= 0.8` the component swaps to the 100svh static hero and scrolls the window back to `(0,0)`. The film never replays (state persists for the session).

### 2a. `HeroScrub` (function `b`) — DOM tree
```
section#top ref={sectionRef} aria-label="The Magnolia opening film"
  className="relative h-[260svh] snap-start bg-charcoal-950"
└ div className="sticky top-0 h-[100svh] min-h-[620px] overflow-hidden"
    ├ <PanelBackground src={P.hero.src} alt={P.hero.alt} tone={P.hero.tone} depth={0} priority scrim={false} layerClassName="scale-100" />
    ├ div className="absolute inset-0 z-10"
    │   └ <ScrollScrubVideo src="/videos/hero/FULL_0409.mp4" poster={P.hero.src} targetRef={sectionRef}
    │        scrollYProgress={progress} getTime={(p, dur) => Math.min(1, Math.max(0, p) / 0.8) * dur}
    │        enabled diagnosticLabel="hero" activateImmediately
    │        className="pointer-events-none absolute inset-0 h-full w-full object-cover transition-opacity duration-300" />
    └ (siteConfig.cursorGlow === true) <CursorGlow />
```
`useScroll({ target: sectionRef, offset: ["start start", "end end"] })`; `useMotionValueEvent(scrollYProgress, "change", v => { if (v >= 0.8) onComplete(); })`.

### 2b. `HeroStatic` (function `f`) — DOM tree
```
motion.section#top
  whileInView={Fv}  viewport={gT}  transition={V1}
    Fv = { y: [0, -10, 0], scale: [1, 1.006, 1] }
    gT = { once: false, amount: 0.98 }
    V1 = { duration: 0.58, times: [0, 0.45, 1], ease: VR }
  className="relative h-[100svh] min-h-[620px] snap-start overflow-hidden"
├ <PanelBackground src={P.hero.src} alt={P.hero.alt} tone={P.hero.tone} depth={0} priority scrim={false} layerClassName="scale-100" />
├ (siteConfig.cursorGlow) <CursorGlow />
└ motion.p
    initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 1.4, delay: 1.1, ease: VR }}
    className="pointer-events-none absolute inset-x-0 top-1/2 z-10 -translate-y-1/2 px-6 text-center font-display text-[clamp(2.7rem,5.4vw,4.95rem)] leading-none tracking-[-0.005em] text-ivory/85"
    text = t.hero.tagline = "The Journey of Timeless Value"
```
On mount it dispatches the diagnostic event `{ event: "mode-static-reduced-motion", label: "hero", phase: "static-reduced-motion", attempt: 0, isEligible: false, visibility: document.visibilityState }`.

### 2c. `PanelBackground` (module 6776, shared by hero + heritage)
Props: `src, alt = "", tone = "from-amber-600 via-amber-700 to-charcoal-900", depth = UQ.base (0.08), priority = false, scrim = true, className, layerClassName, imageClassName, overlayClassName`.
```
div className=cn("absolute inset-0 overflow-hidden", className)
├ div ref={parallaxRef} className=cn("absolute inset-0 scale-[1.15] will-change-transform", layerClassName)
│   └ src ? <Image src alt fill priority={priority} sizes="100vw" className=cn("object-cover", imageClassName) />
│         : div className=cn("h-full w-full bg-gradient-to-br", tone)
│             └ div className="absolute inset-0 opacity-[0.14] mix-blend-overlay" style={{ backgroundImage: noise-svg(baseFrequency 0.85) }}
└ (scrim) div aria-hidden className=cn("absolute inset-0 bg-panel-scrim", overlayClassName)
```
`useParallaxLayer(depth)` (module 4294 `YT`) — **GSAP**, not framer:
```js
if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
gsap.context(() => gsap.fromTo(el, { yPercent: -(100 * depth) }, {
  yPercent: 100 * depth, ease: "none",
  scrollTrigger: { trigger: el.parentElement ?? el, start: "top bottom", end: "bottom top", scrub: true },
}), el);
```
Hero passes `depth: 0` → tween from `yPercent:-0` to `0` (visually static); `layerClassName="scale-100"` overrides the default `scale-[1.15]` (tailwind-merge). Hero background image: `/images/assets/hero/2cb5cde9e63f1f02d524186966868fc771df1cc8.png`, alt "The Magnolia hero background", `fill`, `priority`, `sizes="100vw"`, `object-cover`, no explicit quality (Next default q=75).

### 2d. `CursorGlow` (function `v`, default `size = 520`)
```js
const reduced = useReducedMotion(); const [enabled, setEnabled] = useState(false);
const mx = useMotionValue(-9999), my = useMotionValue(-9999);
const sx = useSpring(mx, { stiffness: 90, damping: 22, mass: 0.6 });
const sy = useSpring(my, { stiffness: 90, damping: 22, mass: 0.6 });
useEffect(() => {
  if (reduced || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
  setEnabled(true);
  const onMove = e => { mx.set(e.clientX); my.set(e.clientY); };
  window.addEventListener("pointermove", onMove, { passive: true });
  return () => window.removeEventListener("pointermove", onMove);
}, [reduced, mx, my]);
```
Render (only when `enabled`):
```
motion.div aria-hidden className="pointer-events-none fixed z-[1] rounded-full mix-blend-soft-light blur-3xl"
  style={{ x: sx, y: sy, width: 520, height: 520, marginLeft: -260, marginTop: -260,
           background: "radial-gradient(circle, rgba(224,160,64,0.5) 0%, rgba(200,129,31,0.22) 40%, transparent 70%)" }}
```

### 2e. `ScrollScrubVideo` (module 5074) — full mechanics (used by hero and gallery)
Props: `src, poster, className, targetRef, scrollYProgress, getTime(progress01, duration) → seconds, enabled, diagnosticLabel, activateImmediately = false, rootMargin = "0px"`.

Constants: `RECOVERY = { maxAttempts: 3, metadataTimeoutMs: 8000, initialFrameTimeoutMs: 5000, seekTimeoutMs: 3000, retryDelaysMs: [250, 1000] }`, `FRAME = 1/24`, `HALF_FRAME = 1/48`.

Reducer state `{ phase, attempt, reason }`, initial `{ phase: "dormant", attempt: 0, reason: null }`:
- `activate`: dormant → `{ phase:"loading", attempt:1 }`
- `metadata-valid`: loading → priming
- `frame-ready`: loading|priming → ready
- `recover(reason)`: (not in fallback/retry-wait) → `attempt >= 3 ? "fallback" : "retry-wait"` with reason
- `retry`: retry-wait → `{ phase:"loading", attempt+1 }`

Eligibility `isEligible() = enabled && activeRef && documentVisible`.

Activation:
- `activateImmediately` → immediately `activate` (hero).
- else `IntersectionObserver(targetRef.current, { rootMargin })` → intersecting: `activate` (+ if already ready, re-seek); not intersecting: cancel timers/rAF (gallery uses `rootMargin: "100% 0px"`).
- `visibilitychange`: hidden → cancel; visible → restart pending timeouts / re-seek.

Desired time: `desired = clamp( getTime(clamp01(progress), duration), 0, max(0, duration − 1/24) )`.

Scroll link: `useMotionValueEvent(scrollYProgress, "change", v => { progressRef = v; if (phase === "ready") scheduleSeek(); })` → `scheduleSeek` coalesces into one `requestAnimationFrame` that calls `seek(desired, force)`.

`seek(t, force)`: only when `phase ∈ {loading, priming, ready}`; if a seek is pending, just remember `force`; skip if `!force && |t − video.currentTime| < 1/48`; else record pending `{target, attempt}`, start `seekTimeoutMs` (3000) watchdog (resolves itself if `readyState >= HAVE_CURRENT_DATA` and within half a frame, otherwise `recover("seek-timeout")`), then `video.currentTime = t` (catch → `recover("seek-assignment-failed")`).

Timeouts: `loading` phase starts an 8000 ms `metadata-timeout`; `priming` starts a 5000 ms `initial-frame-timeout`; `retry-wait` waits `retryDelaysMs[attempt-1] ?? 0` (250 ms after attempt 1, 1000 ms after attempt 2) then `retry`; after attempt 3 → `fallback` (poster image stays visible, video unmounted).

Render:
```
// always:
span aria-hidden className="hidden"
  data-scroll-scrub-label={diagnosticLabel}
  data-scroll-scrub-state={enabled ? phase : "disabled"}
  data-scroll-scrub-attempt={attempt}
  data-scroll-scrub-reason={reason ?? undefined}
// only when enabled && active && phase ∈ {loading, priming, ready}:
video key={attempt} ref aria-hidden muted playsInline preload="auto" poster={poster}
  data-scroll-scrub-label / -state / -attempt / -reason (same values)
  className={`${className} ${phase === "ready" ? "opacity-100" : "opacity-0"}`}
  onLoadedMetadata: validate duration (finite, > 0 else recover("invalid-duration")); store duration; video.pause();
                    dispatch metadata-valid; initial seek = desired > 1/48 ? desired : min(0.1, max(0, duration − 1/24)), forced;
                    start initial-frame timeout; if readyState >= HAVE_CURRENT_DATA → frame-ready
  onLoadedData / onCanPlay → frame-ready (if readyState >= HAVE_CURRENT_DATA)
  onSeeked → clear pending; frame-ready; if |desired − currentTime| >= 1/48 → scheduleSeek(force)
  onError → recover("media-error"); onWaiting/onStalled/onSuspend/onAbort → diagnostic only
  └ source src={src} type="video/mp4"
```
The video is never played — it is paused on metadata and only `currentTime` is written. Cross-fade between poster/`<Image>` and video is the `transition-opacity duration-300` + `opacity-0/100` swap. Diagnostics go to `window.dispatchEvent(new CustomEvent("scroll-scrub-video-diagnostic", { detail }))`.

SSR snapshot: `<span … data-scroll-scrub-label="hero" data-scroll-scrub-state="dormant" data-scroll-scrub-attempt="0">`.

### Copy
- Scrub: section aria-label "The Magnolia opening film" (hard-coded English). No visible text.
- Static: "The Journey of Timeless Value" (`t.hero.tagline`, identical in vi/en).
- Unused i18n keys in `hero`: `explore` "Khám phá", `playVideo` "Xem phim giới thiệu", `scroll` "Cuộn xuống".

### Assets
| Asset | Used by | Props |
|---|---|---|
| `/images/assets/hero/2cb5cde9e63f1f02d524186966868fc771df1cc8.png` | PanelBackground `<Image>` (both variants) and `poster` of the scrub video | `fill`, `priority`, `sizes="100vw"`, `object-cover`, layer `scale-100` |
| `/videos/hero/FULL_0409.mp4` | `<video><source type="video/mp4">` in `div.absolute.inset-0.z-10` | muted, playsInline, preload auto, `object-cover`, scrubbed |

### Motion summary
- Pin: `section h-[260svh]` track; `div.sticky.top-0.h-[100svh].min-h-[620px].overflow-hidden` pinned.
- Video scrub: `currentTime = min(1, progress/0.8) × duration` → film completes at 80 % of the track; remaining 20 % holds the last frame, and at `progress ≥ 0.8` the component swaps to the static hero and `scrollTo(0,0)`.
- Static hero idle: on each time the section is ≥ 98 % in view, `y: [0,-10,0]`, `scale: [1,1.006,1]`, `0.58 s`, `times [0,0.45,1]`, ease VR (repeats every re-entry since `once:false`).
- Tagline: `{opacity:0,y:16}` → `{opacity:1,y:0}`, `duration 1.4`, `delay 1.1`, ease VR.
- Cursor glow spring `{stiffness:90, damping:22, mass:0.6}`.

### State
`completed` (hero film finished), `reduced` (framer `useReducedMotion`). Reduced motion → static hero immediately (no video).

---

## 3. `#heritage` — Heritage (module 6324)

### DOM tree
```
section#heritage ref={ref} aria-labelledby="heritage-title"
  className="relative min-h-[100svh] snap-start bg-charcoal-950" style={{ height: "260vh" }}
└ div className="sticky top-0 h-[100svh] min-h-[620px] overflow-hidden"
    ├ <PanelBackground src="/images/assets/heritage/silhouette.png"
    │     alt="Silhouette against the Magnolia façade at golden hour"
    │     tone="from-amber-700 via-amber-800 to-charcoal-900" depth={UQ.subtle /* 0.05 */} scrim={false}
    │     layerClassName="scale-[1.04]" imageClassName="object-cover object-[50%_48%]" />
    ├ div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_17%_34%,rgba(255,226,170,0.38),transparent_34%),linear-gradient(90deg,rgba(245,205,141,0.18),transparent_28%,rgba(11,9,8,0.1)_72%,rgba(11,9,8,0.42)),linear-gradient(180deg,rgba(11,9,8,0.08),transparent_42%,rgba(11,9,8,0.58))]"
    ├ div aria-hidden className="pointer-events-none absolute inset-0 opacity-[0.18] mix-blend-overlay"
    │     style={{ backgroundImage: "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='140' height='140'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3'/></filter><rect width='140' height='140' filter='url(%23n)' opacity='0.7'/></svg>\")" }}
    └ motion.div initial="hidden" whileInView="visible" viewport={d1} variants={EY(0.18, 0.1)}
          className="absolute inset-x-0 top-[37.5%] z-10 flex flex-col items-center px-5 text-center sm:px-8"
        ├ motion.p#heritage-title variants={pB}
        │     className="font-display text-[clamp(1.08rem,1.72vw,2.16rem)] leading-none text-ivory drop-shadow-[0_2px_14px_rgba(0,0,0,0.22)]"
        │     text = t.heritage.brand = "The Magnolia"
        └ motion.div variants={pB} transition={{ duration: 0.9, ease: VR }}
              className="relative mt-9 flex min-h-[13rem] w-full max-w-[81rem] items-start justify-center overflow-hidden md:min-h-[17rem]"
            ├ (reduced) div className="max-w-[22ch] whitespace-normal font-display text-[clamp(2.52rem,4.68vw,6.32rem)] leading-[0.98] tracking-[-0.018em] text-ivory drop-shadow-[0_3px_22px_rgba(0,0,0,0.22)]"
            │     ├ p  taglines[0]
            │     └ p className="mt-6 whitespace-nowrap"  taglines[1]
            └ (else)
                ├ motion.div aria-hidden style={{ opacity: linesOpacity }}
                │     className="absolute w-full max-w-[22ch] whitespace-normal font-display text-[clamp(2.52rem,4.68vw,6.32rem)] leading-[0.98] tracking-[-0.018em] text-ivory drop-shadow-[0_3px_22px_rgba(0,0,0,0.22)]"
                │     ├ motion.span style={{ x: line1X }} className="block"  line1
                │     └ motion.span style={{ x: line2X }} className="block"  line2
                ├ motion.p aria-hidden style={{ y: tag2Y, opacity: tag2Opacity }}
                │     className="absolute whitespace-nowrap font-display text-[clamp(2.52rem,4.68vw,6.32rem)] leading-[0.98] tracking-[-0.018em] text-ivory drop-shadow-[0_3px_22px_rgba(0,0,0,0.22)]"
                │     text = taglines[1]
                └ span className="sr-only"  taglines.join(". ")
```

### Copy
`t.heritage.taglines = ["Hành trình xây đắp những giá trị vượt thời gian", "Phong cách sống tinh tuyến"]`.
Split rule: `taglines[0].split(" ")` → first 5 words = line1 **"Hành trình xây đắp những"**, remaining = line2 **"giá trị vượt thời gian"**. Second tagline: **"Phong cách sống tinh tuyến"**. sr-only: "Hành trình xây đắp những giá trị vượt thời gian. Phong cách sống tinh tuyến". Brand: "The Magnolia".
EN: `["A journey to build values beyond time", "A life of refined restraint"]` (same 5-word split → "A journey to build values" / "beyond time").

### Assets
`/images/assets/heritage/silhouette.png` — PanelBackground `<Image fill sizes="100vw" className="object-cover object-[50%_48%]">`, layer wrapper `scale-[1.04]` (replaces default `scale-[1.15]`), GSAP parallax `yPercent −5 → +5` over the section (`start "top bottom"`, `end "bottom top"`, `scrub:true`).

### Motion
`useScroll({ target: sectionRef, offset: ["start start", "end end"] })` → `p`.

| MotionValue | `useTransform(p, input, output)` | Drives |
|---|---|---|
| `line1X` | `[0, 0.35, 0.62, 0.88]` → `["80vw", "0vw", "0vw", "-80vw"]` | `motion.span` line1 `x` |
| `line2X` | `[0, 0.35, 0.62, 0.88]` → `["-80vw", "0vw", "0vw", "80vw"]` | `motion.span` line2 `x` |
| `linesOpacity` | `[0, 0.26, 0.66, 0.88]` → `[0, 1, 1, 0]` | wrapper `motion.div` opacity |
| `tag2Y` | `[0.72, 0.96]` → `["24vh", "0vh"]` | second tagline `y` |
| `tag2Opacity` | `[0.74, 0.96]` → `[0, 1]` | second tagline opacity |

SSR initial: line1 `translateX(80vw)`, line2 `translateX(-80vw)`, lines wrapper `opacity:0`, tagline2 `opacity:0; translateY(24vh)`.

Entrance (whileInView, `viewport {once:true, amount:0.28}`): container variants `EY(0.18, 0.1)` = `{ hidden:{}, visible:{ transition:{ staggerChildren:0.18, delayChildren:0.1 } } }`; children `pB` = `hidden {opacity:0, y:28}` → `visible {opacity:1, y:0, transition:{duration:0.8, ease:VR}}`. The inner `motion.div` also declares `transition {duration:0.9, ease:VR}` but the variant's own `transition` (0.8) takes precedence in framer-motion.

Pin: `section` 260vh track, sticky `100svh` child.

### State
Only `useReducedMotion()` branch (static two-line text, no transforms). Locale from context.

---

## 4. `#horizontal-slide` — Image journey (module 5204)

### Data
```js
const slides = [
  { src: "/images/assets/horizontal-slide/slide-1.jpg", alt: "The Place",            amenityIndex: 0, tourUrl: "https://themagnolia360.vistax.vn/?s=pano10&/tong-the-01.html" },
  { src: "/images/assets/horizontal-slide/slide-2.jpg", alt: "The Private Arrival",  amenityIndex: 1, tourUrl: "https://themagnolia360.vistax.vn/?s=pano33273&/sanh-don-tiep-pavillion.html" },
  { src: "/images/assets/horizontal-slide/slide-3.jpg", alt: "The Pavilion Lobby",   amenityIndex: 2, tourUrl: "https://themagnolia360.vistax.vn/?s=pano36996&/sanh-don-tiep-pavillion.html" },
  { src: "/images/assets/horizontal-slide/slide-4.jpg", alt: "The Car Gallery",      amenityIndex: 3, tourUrl: "https://themagnolia360.vistax.vn/?s=pano36994&/khu-trung-bay-sieu-xe-tang-b1.html" },
  { src: "/images/assets/horizontal-slide/slide-5.jpg", alt: "The Vertical Garden",  amenityIndex: 4, tourUrl: "https://themagnolia360.vistax.vn/?s=pano36997&/vuon-rieng-tang-5.html" },
];
const TITLE_SHIFT = "3rem";
```
Title = `t.amenities.items[amenityIndex].title` (falls back to `alt`).

### DOM tree
```
section#horizontal-slide ref={ref} aria-label="The Magnolia image journey"
  className="relative snap-start bg-charcoal-950" style={{ height: `${100 * slides.length}vh` /* 500vh */ }}
└ div className="sticky top-0 h-[100svh] min-h-[620px] overflow-hidden"
    └ div className="relative h-full w-full overflow-hidden"
        ├ for (slide, i): <Slide>
        │   motion.div style={{ x: slideX, zIndex: i + 1 }} className="absolute inset-0 overflow-hidden will-change-transform"
        │   ├ motion.div style={reduced ? undefined : { x: innerX, y: innerY, scale: innerScale }}
        │   │     className="absolute inset-0 h-full w-full will-change-transform"
        │   │   └ img src={slide.src} alt={title} loading={i === 0 ? "eager" : "lazy"} decoding="async"
        │   │         fetchPriority={i === 0 ? "high" : "auto"} className="h-full w-full object-cover"
        │   └ div aria-hidden className="absolute inset-0 bg-gradient-to-t from-charcoal-950/60 via-charcoal-950/10 to-charcoal-950/20"
        └ <Captions>
            div className="absolute inset-x-5 bottom-9 z-20 max-w-[92rem] sm:inset-x-8 md:left-12 md:right-auto md:bottom-16 md:w-[min(86vw,64rem)]"
            ├ div className="relative h-[clamp(8rem,12.5vw,13rem)] overflow-visible [perspective:900px]"
            │   └ for (i): <Caption>
            │       div className="absolute left-0 top-0 origin-bottom"
            │       ├ motion.p style={{ opacity, visibility }}
            │       │     className="font-display text-[clamp(1.2rem,1.6vw,2.08rem)] leading-none text-ivory/90 drop-shadow-[0_2px_14px_rgba(0,0,0,0.42)]"
            │       │     text = String(i + 1).padStart(2, "0")     // "01" … "05"
            │       ├ motion.h2 style={{ opacity, y: titleY, visibility }}
            │       │     className="mt-7 origin-bottom whitespace-nowrap font-display text-[clamp(2.96rem,5.84vw,6.56rem)] leading-[0.9] tracking-[-0.04em] text-ivory drop-shadow-[0_3px_18px_rgba(0,0,0,0.42)] will-change-transform"
            │       │     text = title
            │       └ motion.div aria-hidden style={{ opacity, visibility }}
            │             className="mt-12 h-[3px] w-full max-w-[53rem] bg-ivory/85 shadow-[0_1px_8px_rgba(0,0,0,0.18)]"
            └ a href={items[active].slide.tourUrl} target="_blank" rel="noreferrer"
                  aria-label={`${t.amenities.explore}: ${items[active].title}`}
                  className="mt-11 inline-flex min-w-[15.5rem] items-center justify-center gap-6 border border-ivory/35 bg-ivory/5 px-8 py-5 font-display text-[clamp(0.84rem,1.08vw,1.16rem)] leading-none text-ivory/90 backdrop-blur-[2px] transition hover:bg-ivory/12 hover:text-ivory focus-visible:ring-champagne-300"
                ├ span aria-hidden className="text-[1.08em] leading-none"  "✣"
                ├ t.amenities.explore  ("Khám phá")
                └ span aria-hidden className="text-[1.08em] leading-none"  "✣"
```

### Copy
- Section aria-label: "The Magnolia image journey".
- Titles (vi & en identical): "The Place", "The Private Arrival", "The Pavilion Lobby", "The Car Gallery", "The Vertical Garden". Numbers "01"–"05".
- CTA: "Khám phá" (en "Explore"), decorated with "✣" both sides; aria-label e.g. "Khám phá: The Place".
- Unused i18n: `amenities.eyebrow` "Tiện ích", and the `body` strings per item (e.g. "Điểm khởi đầu của hành trình — nơi kiến trúc và thiên nhiên giao hoà trong một tổng thể duy nhất.", "Lối vào riêng tư dành riêng cho cư dân, mở ra cảm giác trở về sau mỗi ngày dài.", "Sảnh đón đôi cao thoáng, lấy cảm hứng từ những đình các truyền thống Việt.", "Không gian trưng bày xe như một phòng tranh — nơi mỗi chiếc xe là một tác phẩm.", "Vườn treo thẳng đứng đưa mảng xanh lên cao, phủ bóng mát dọc theo từng tầng.") are not rendered.

### Assets
Plain `<img>` (not next/image): `slide-1.jpg` … `slide-5.jpg`, `h-full w-full object-cover`; slide 1 `loading="eager" fetchPriority="high"` (also `<link rel="preload">` in head), others lazy.

### Motion — translation math
`useScroll({ target: section, offset: ["start start", "end end"] })`. Track = 500vh, sticky 100svh. The journey occupies progress `0 → 0.86`; `0.86 → 1` is a hold on the last slide.

`N = 5`, `last = 4`, `step = 0.86 / 4 = 0.215`. For slide `i`: `s = i·step`, `r = min(0.86, (i+1)·step)`, `n = min(0.86, max(0,(i−1)·step) + 0.055)`, `i2 = min(0.86, s + 0.055)`.

`slideX = useTransform(p, range, xRange)`:
| i | range | xRange |
|---|---|---|
| 0 | `[0, 0.055, 0.215]` | `["0%", "0%", "-100%"]` |
| 1 | `[0.055, 0.215, 0.27, 0.43]` | `["100%", "0%", "0%", "-100%"]` |
| 2 | `[0.27, 0.43, 0.485, 0.645]` | `["100%", "0%", "0%", "-100%"]` |
| 3 | `[0.485, 0.645, 0.7, 0.86]` | `["100%", "0%", "0%", "-100%"]` |
| 4 | `[0.7, 0.86, 0.86]` | `["100%", "0%", "0%"]` |

Generic form: `i===0 → {range:[0, i2, r], x:["0%","0%","-100%"]}`, `i===last → {range:[n, s, 0.86], x:["100%","0%","0%"]}`, else `{range:[n, s, i2, r], x:["100%","0%","0%","-100%"]}`. Slide `i` enters from the right (100%→0%) over the same window in which slide `i−1` exits to the left (0%→−100%) — a synchronous push; each slide holds for `0.055` of progress; z-index `i+1` so the incoming slide is on top.

Inner Ken-Burns layer (`useTransform(p, sameRange, …)`):
| i | innerX | innerY | innerScale |
|---|---|---|---|
| 0 | `["0%","0%","2.4%"]` | `["0%","0%","-1.2%"]` | `[1.05, 1.05, 1.065]` |
| 1–3 | `["-2.4%","0%","0%","2.4%"]` | `["1.2%","0%","0%","-1.2%"]` | `[1.065, 1.05, 1.05, 1.065]` |
| 4 | `["-2.4%","0%","0%"]` | `["1.2%","0%","0%"]` | `[1.065, 1.05, 1.05]` |
Disabled (style undefined) under reduced motion. SSR: slide 1 `scale(1.05)`; others `translateX(-2.4%) translateY(1.2%) scale(1.065)` and outer `translateX(100%)`.

Caption timeline. Base window `w(i)`: `a0 = max(0, ((i−1)/4)·0.86)`, `s0 = min(0.86, ((i+1)/4)·0.86)`; `i===0 → [0, s0]`, `i===last → [a0, 0.86]`, else `[a0, (i/4)·0.86, s0]`.
`titleRange`: first `[0, 0.72·s0]`; last `[a0, 0.86]`; middle `[a0, mid, mid + (s0−mid)·0.68]`.
| i | titleRange | titleYRange | opacityRange |
|---|---|---|---|
| 0 | `[0, 0.1548]` | `["0rem", "-3rem"]` | `[1, 0]` |
| 1 | `[0, 0.215, 0.3612]` | `["3rem", "0rem", "-3rem"]` | `[0, 1, 0]` |
| 2 | `[0.215, 0.43, 0.5762]` | `["3rem", "0rem", "-3rem"]` | `[0, 1, 0]` |
| 3 | `[0.43, 0.645, 0.7912]` | `["3rem", "0rem", "-3rem"]` | `[0, 1, 0]` |
| 4 | `[0.645, 0.86]` | `["3rem", "0rem"]` | `[0, 1]` |
`visibility = useTransform(opacity, v => v <= 0.01 ? "hidden" : "visible")` on number, h2 and rule. SSR: caption 1 `opacity:1;visibility:visible;transform:none`, others `opacity:0;visibility:hidden;transform:translateY(3rem)`.

### State / interaction
`active = useState(0)`; `useMotionValueEvent(p, "change", v => setActive(clamp(round(v / 0.215), 0, 4)))` → chooses the CTA `href` (tour URL) and its `aria-label`. Hover on CTA via CSS (`hover:bg-ivory/12 hover:text-ivory`). No mobile branch other than the responsive classes on the caption container.

---

## 5. `#interactive-tour` — 360° tour (module 6389)

Config: `siteConfig.interactiveTour = { embedUrl: "https://studio.realhorizons.ai/tours/df3f63d0-0985-45de-8394-f1fadd60b1e9/view", externalUrl: "https://studio.realhorizons.ai/tours/df3f63d0-0985-45de-8394-f1fadd60b1e9", previewSrc: "/images/assets/tour/preview.png", mountRootMargin: "50% 0px", readyTimeoutMs: 15000 }` (`mountRootMargin` is defined but **not used** — the observer uses `threshold: 0` with default rootMargin).

### DOM tree
```
section#interactive-tour ref={ref} aria-labelledby="interactive-tour-heading"
  className="relative h-[100svh] snap-start overflow-hidden bg-black px-10 pt-[120px] pb-16 sm:px-10 sm:pt-32 md:px-10 md:pt-28 md:pb-16"
├ div className="flex h-full flex-col"
│  ├ div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4"
│  │   └ h2#interactive-tour-heading className="max-w-[40rem] font-display text-[clamp(1.536rem,2.72vw,3.2rem)] leading-[1.08] tracking-[-0.02em] text-ivory"
│  │        text = t.globe.heading = "Chiêm ngưỡng Magnolia từ mọi góc nhìn"
│  └ div aria-busy={status === "loading"} className="relative mt-7 min-h-0 flex-1 overflow-hidden rounded-[18px] bg-charcoal-night md:mt-8"
│      ├ img src="/images/assets/tour/preview.png" alt="" loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover"
│      ├ div aria-hidden className="absolute inset-0 bg-gradient-to-t from-charcoal-950/55 via-charcoal-950/10 to-charcoal-950/20"
│      ├ (mounted) iframe src={embedUrl} title={t.tour.title /* "Tour 360° The Magnolia" */} loading="eager"
│      │     allow="fullscreen; xr-spatial-tracking; accelerometer; gyroscope" allowFullScreen referrerPolicy="strict-origin-when-cross-origin"
│      │     onLoad={() => setStatus("ready")} onError={() => setStatus("failed")}
│      │     className={`absolute inset-0 z-10 h-full w-full border-0 ${reduced ? "" : "transition-opacity duration-500"} ${status === "ready" ? "opacity-100" : "opacity-0"}`}
│      ├ (status === "loading") div className="absolute inset-0 z-20 grid place-items-center bg-charcoal-950/30 px-6 text-center backdrop-blur-[1px]"
│      │     └ p role="status" aria-live="polite" className="font-display text-[clamp(1rem,1.7vw,1.5rem)] text-ivory/90"  "Đang tải tour 360°"
│      └ (status === "failed") div className="absolute inset-0 z-20 grid place-items-center bg-charcoal-950/35 px-6 text-center backdrop-blur-[1px]"
│            └ div
│               ├ p role="alert" className="font-display text-[clamp(1rem,1.7vw,1.5rem)] text-ivory/90"  "Không thể tải tour 360° vào lúc này."
│               └ a href={externalUrl} target="_blank" rel="noopener noreferrer"
│                    className="mt-5 inline-flex items-center gap-3 border border-ivory/45 px-5 py-3 font-sans text-[0.56rem] uppercase tracking-luxe text-ivory transition-colors hover:bg-ivory/10 focus-visible:ring-champagne-300"
│                    ├ <Sparkle size={9} />
│                    └ "Mở tour trong cửa sổ mới"
└ motion.div aria-hidden
    animate={reduced ? { opacity: 0.7 } : { y: [0, 5, 0], opacity: [0.55, 1, 0.55] }}
    transition={reduced ? undefined : { duration: 1.35, repeat: Infinity, ease: "easeInOut" }}
    className="pointer-events-none absolute bottom-[14px] left-1/2 z-20 -translate-x-1/2 text-ivory"
    └ svg width="18" height="12" viewBox="0 0 18 12" fill="none" aria-hidden
        └ path d="m2 2 7 7 7-7" stroke="currentColor" strokeWidth="1.5"
```

### Copy
- Heading: "Chiêm ngưỡng Magnolia từ mọi góc nhìn" (en "Admire Magnolia from every angle").
- iframe title: "Tour 360° The Magnolia" (en "The Magnolia 360° tour"); loading "Đang tải tour 360°" (en "Loading the 360° tour"); failed "Không thể tải tour 360° vào lúc này." (en "The 360° tour is unavailable right now."); link "Mở tour trong cửa sổ mới" (en "Open tour in a new tab").
- Unused: `globe.body` "Toàn cảnh quy hoạch được ghi lại từ trên cao, nơi từng khối kiến trúc, mảng xanh và trục cảnh quan hiện lên trọn vẹn trong một khung hình.", `globe.hint` "Kéo để xoay".

### Assets
`/images/assets/tour/preview.png` plain `<img loading="lazy">` `object-cover` behind the iframe. External iframe `https://studio.realhorizons.ai/tours/df3f63d0-0985-45de-8394-f1fadd60b1e9/view`.

### Motion
Only the chevron bob: `y [0,5,0]`, `opacity [0.55,1,0.55]`, `1.35 s`, infinite, `easeInOut` (reduced: static `opacity 0.7`). Iframe reveal is CSS `transition-opacity duration-500`. No scroll pin (plain `h-[100svh]` section).

### State
- `mounted = useState(false)`, `status = useState("dormant" | "loading" | "ready" | "failed")`.
- Effect: `IntersectionObserver(section, { threshold: 0 })` → first intersection: `setMounted(true); setStatus("loading"); disconnect()`. Fallback when IO is unavailable: `scroll`/`resize` listeners checking `getBoundingClientRect()` (`top < innerHeight && bottom > 0`).
- Effect: while `mounted && status === "loading"`, `setTimeout(() => setStatus("failed"), 15000)`.

---

## 6. `#units` — Units (module 1683)

### Data
```js
const cardImages = { "3 Bedroom": "/images/assets/units/card-3br.png", Penthouse: "/images/assets/units/card-penthouse.png", Duplex: "/images/assets/units/card-duplex.png" };
const strips = ["/images/assets/units/strip-1.png", "/images/assets/units/strip-2.png", "/images/assets/units/strip-3.png"];
P.units = { src: "/images/assets/units/townhouse-hero.png", alt: "The Townhouse — living room facing the tower façade at golden hour" };
```

### DOM tree
```
section#units aria-labelledby="units-heading" className="relative bg-black text-ivory"     // NOTE: no snap-start, no sticky
├ div className="mx-auto max-w-[1440px] px-8 pt-24 md:pt-28"
│  ├ motion.h2#units-heading initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={d1} transition={{ duration: 0.9, ease: VR }}
│  │     className="max-w-[36rem] font-display leading-[1.05] tracking-[-0.015em] text-ivory text-[clamp(1.88rem,3.32vw,3.48rem)]"
│  │     children = locale === "vi" ? <>Không gian sống được<br/>tinh chỉnh</> : t.units.heading
│  └ motion.ul initial="hidden" whileInView="visible" viewport={d1} variants={EY(0.12, 0.15)}
│        className="mt-20 grid grid-cols-2 gap-x-4 gap-y-14 md:grid-cols-3 md:gap-x-5 lg:gap-x-7"
│      └ for type in t.units.types:  motion.li key={title} variants={pB} className="group/card flex flex-col gap-4"
│          ├ div className="relative aspect-[329/372] w-full overflow-hidden border border-ivory/20 bg-ivory/5 md:aspect-[329/365] rounded-2xl"
│          │   ├ <Image src={cardImages[title]} alt={title} fill sizes="(max-width: 768px) 45vw, 22vw"
│          │   │     className="object-cover grayscale-[0.35] transition duration-700 ease-luxe group-hover/card:scale-105 group-hover/card:grayscale-0 group-focus-within/card:scale-105 group-focus-within/card:grayscale-0 rounded-2xl" />
│          │   └ div aria-hidden className="pointer-events-none absolute inset-0 bg-black/15 transition-opacity duration-700 group-hover/card:opacity-0 group-focus-within/card:opacity-0 rounded-2xl"
│          └ div className="flex flex-col items-start gap-6 pr-2"
│              ├ p className="font-display text-[clamp(0.84rem,1.08vw,1.16rem)] leading-none text-ivory/90"  title
│              └ button type="button" className="group inline-flex h-10 min-w-[9rem] items-center justify-center gap-4 border border-ivory/60 px-4 font-sans text-[0.75rem] leading-none text-ivory transition-colors duration-500 hover:bg-ivory hover:text-black"
│                  ├ <Compass />  (default className "h-3 w-3")
│                  ├ span  t.units.explore  ("Khám phá")
│                  └ <Compass />
├ div className="mx-auto mt-36 max-w-[1440px] px-8"
│  ├ div className="grid grid-cols-[1fr_2.08fr_1fr] gap-5 md:gap-7"
│  │   └ for (src, i) in strips:  motion.div key={src}
│  │        initial={{ opacity: 0, y: 32 }} whileInView={{ opacity: 1, y: 0 }} viewport={d1} transition={{ duration: 1, delay: 0.12 * i, ease: VR }}
│  │        className="relative aspect-[329/437] w-full overflow-hidden border border-ivory/15 rounded-2xl"
│  │        style={i === 1 ? { aspectRatio: "678 / 439" } : undefined}
│  │        └ <Image src={src} alt="" fill sizes={i === 1 ? "47vw" : "22vw"} className="object-cover grayscale-[0.2]" />
│  └ motion.div initial="hidden" whileInView="visible" viewport={d1} variants={EY(0.1, 0.35)}
│        className="mx-auto mt-16 max-w-[42rem] text-center font-display leading-[1.1] tracking-[-0.002em] text-ivory text-[clamp(1.4rem,3.12vw,2.8rem)]"
│      └ for (line, li) in [t.units.divider[0], t.units.divider[1]]:
│          span key={line} className={li === 0 ? "block" : "mt-2 block"}
│            └ for (word, wi, arr) in line.split(" "):
│                motion.span key={`${word}-${wi}`} variants={pB} className={wi === arr.length - 1 ? "inline-block text-champagne-200" : "inline-block"}
│                  children = [word, wi < arr.length - 1 ? " " : ""]
└ div className="relative mt-24 h-[min(58vw,860px)] min-h-[520px] w-full overflow-hidden bg-navy-dark"
   ├ <Image src={P.units.src ?? cardImages["3 Bedroom"]} alt={P.units.alt} fill sizes="100vw" className="object-cover" />
   ├ motion.div initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }} viewport={d1} transition={{ duration: 1.1, ease: VR }}
   │     className="absolute bottom-0 left-8 right-8 flex flex-col gap-2 pb-36 text-ivory md:left-10 md:right-auto md:pb-20"
   │   ├ p className="font-display text-[clamp(1rem,1.6vw,1.72rem)] leading-none"  "Limited Edition Collection"
   │   └ p className="font-display font-semibold leading-none tracking-[-0.018em] text-[clamp(2.72rem,5.92vw,5.6rem)]"  "The Townhouse"
   └ div className="absolute bottom-16 left-8 right-8 md:left-auto md:right-10 md:bottom-20"
       └ button type="button" className="group inline-flex h-[72px] w-full min-w-[18rem] items-center justify-center gap-[22px] border border-ivory/55 bg-black/[0.16] px-[34px] font-sans text-[0.75rem] text-ivory backdrop-blur-[5px] transition-colors duration-500 hover:bg-ivory hover:text-black md:w-auto"
           ├ <Compass className="h-5 w-5" />
           ├ span className="font-display"  t.units.hero.explore ("Khám phá")
           └ <Compass className="h-5 w-5" />
```

`Compass` (function `u`): `svg viewBox="0 0 16 16" fill="currentColor" aria-hidden className={className ?? "h-3 w-3"}` with paths: `M8 0 L8.7 6.4 L8 8 L7.3 6.4 Z`, `M8 16 L8.7 9.6 L8 8 L7.3 9.6 Z`, `M0 8 L6.4 7.3 L8 8 L6.4 8.7 Z`, `M16 8 L9.6 7.3 L8 8 L9.6 8.7 Z`, and four diagonal paths at `opacity=".55"`: `M2.34 2.34 L6.4 6.05 L8 8 L6.05 6.4 Z`, `M13.66 2.34 L9.95 6.4 L8 8 L9.6 6.05 Z`, `M2.34 13.66 L6.05 9.6 L8 8 L6.4 9.95 Z`, `M13.66 13.66 L9.95 9.6 L8 8 L9.6 9.95 Z`.

### Copy
- Heading (vi, hard-coded line break): "Không gian sống được" `<br/>` "tinh chỉnh" (i18n string "Không gian sống được tinh chỉnh"; en "Living spaces, precisely composed").
- Unit types: "3 Bedroom", "Penthouse", "Duplex" (alt = title). Card CTA "Khám phá" (en "Explore").
- Divider lines: "Tinh luyện trong hình thái" / "Tiết chế trong biểu đạt" — last word of each line ("thái", "đạt") is `text-champagne-200`. EN: "Refined in form" / "Restrained in expression".
- Townhouse block: eyebrow "Limited Edition Collection", title "The Townhouse", CTA "Khám phá" (en "explore").
- No specs/areas are rendered anywhere (types only carry `title`).

### Assets
| Asset | Element | next/image props |
|---|---|---|
| `/images/assets/units/card-3br.png`, `card-penthouse.png`, `card-duplex.png` | card `<Image>` | `fill`, `sizes="(max-width: 768px) 45vw, 22vw"`, `object-cover grayscale-[0.35]`, `rounded-2xl` |
| `/images/assets/units/strip-1.png`, `strip-3.png` | strip cols 1 & 3, aspect `329/437` | `fill`, `sizes="22vw"`, `object-cover grayscale-[0.2]` |
| `/images/assets/units/strip-2.png` | middle col, inline `aspectRatio: "678 / 439"` | `fill`, `sizes="47vw"` |
| `/images/assets/units/townhouse-hero.png` | Townhouse banner | `fill`, `sizes="100vw"`, `object-cover`; alt "The Townhouse — living room facing the tower façade at golden hour" |

### Motion (all `viewport = d1 = { once: true, amount: 0.28 }`)
- h2: `{opacity:0, y:24}` → `{opacity:1, y:0}`, `duration 0.9`, ease VR.
- Card grid: container `EY(0.12, 0.15)` (staggerChildren 0.12, delayChildren 0.15); each `li` `pB` (`{opacity:0,y:28}` → `{opacity:1,y:0}`, 0.8 s, VR).
- Card hover (CSS): image `scale-105` + `grayscale-0` over `700ms` `ease-luxe`; dark veil `bg-black/15` → `opacity-0` over 700 ms; also on `focus-within`.
- Strips: each `{opacity:0, y:32}` → `{opacity:1, y:0}`, `duration 1`, `delay 0.12*i` (0, 0.12, 0.24), VR.
- Divider words: container `EY(0.1, 0.35)`; each word `pB`.
- Townhouse text: `{opacity:0, y:28}` → `{opacity:1, y:0}`, `duration 1.1`, VR.
- Buttons: `transition-colors duration-500`, `hover:bg-ivory hover:text-black`.

### State
No unit-selection state; the "Khám phá" buttons have no handlers. Only `locale` branch for the heading.

---

## 7. `#grace` — Effortless Grace (module 3238)

### Data (local to component; the i18n `grace.subtitle` "Phong vị sống hạng thương gia." is **not** used)
```js
const frames = [
  { image: "/images/assets/grace/stair-01.png", title: "Effortless Grace", subtitle: "Phong vị sống thương gia" },
  { image: "/images/assets/grace/stair-02.png", title: undefined,          subtitle: "Khi chuẩn xác trở thành thước đo của cảm giác" },
  { image: "/images/assets/grace/stair-04.png", title: undefined,          subtitle: 'Phong cách sống cũng cần một "hạng" tương xứng' },
];
```

### DOM tree
```
section#grace ref={ref} className="relative h-[300vh] snap-start bg-black text-ivory"
└ div className="sticky top-0 h-[100svh] overflow-hidden bg-black"
    ├ for (frame, i): <GraceImage>
    │   motion.div key={image} aria-hidden style={{ opacity, scale, borderRadius }}
    │     className={`absolute inset-0 origin-center overflow-hidden ${isLast ? "z-20" : "z-0"}`}
    │     └ <Image src={image} alt="" fill priority={i === 0} sizes="100vw" className="object-cover" />
    ├ motion.div aria-hidden style={{ opacity: reduced ? 0 : endFade }}      className="pointer-events-none absolute inset-0 z-10 bg-black"
    ├ motion.div aria-hidden style={{ opacity: reduced ? 0.5 : entranceVeil }} className="pointer-events-none absolute inset-0 z-30 bg-black"
    └ div className="relative z-40 flex h-full items-center justify-center px-6 text-center"
        └ for (frame, i): <GraceCaption>
            motion.div key={image} style={{ opacity: reduced ? (i === 0 ? 1 : 0) : capOpacity, y: reduced ? 0 : capY }}
              className="absolute flex max-w-[90vw] flex-col items-center"
            ├ (title) h2 className="font-display text-[clamp(4rem,9.4vw,10rem)] leading-[0.86] tracking-[-0.055em] text-ivory"  title
            └ p className={title ? "mt-10" : "whitespace-nowrap"}
                └ span className={title
                     ? "font-display text-[clamp(1.1rem,1.8vw,2rem)] leading-none tracking-[0.01em] text-champagne-200"
                     : "font-display text-5xl leading-none tracking-[0.01em] text-champagne-200"}  subtitle
```

### Copy
Frame 1: h2 "Effortless Grace" + subtitle "Phong vị sống thương gia". Frame 2: "Khi chuẩn xác trở thành thước đo của cảm giác". Frame 3: `Phong cách sống cũng cần một "hạng" tương xứng`. Not localised.

### Assets
`/images/assets/grace/stair-01.png` (`priority`), `stair-02.png`, `stair-04.png` — all `<Image fill sizes="100vw" className="object-cover">` inside full-bleed `motion.div`s. (No `stair-03`.)

### Motion
Two scroll trackers on the same section:
- `p = useScroll({ target, offset: ["start start", "end end"] }).scrollYProgress` (pinned range, 300vh track).
- `e = useScroll({ target, offset: ["start end", "start start"] }).scrollYProgress` (entrance: 0 when section top hits viewport bottom, 1 when it reaches top).

Section-level:
- `entranceVeil = useTransform(e, [0, 1], [0, 0.5])` → z-30 black overlay (grows to 50 % black as the section arrives and stays).
- `endFade = useTransform(p, [0.86, 0.9, 1], [0, 1, 1])` → z-10 black overlay (fades everything under z-10 to black at the end; the last image is z-20 so it stays above this veil, and z-30 veil still sits on it).

Images (`N = 3`, `m = i/3`, `u = (i+1)/3`):
| i | opacity `useTransform(p, …)` | scale | borderRadius |
|---|---|---|---|
| 0 | `[0, 0.2433, 0.4233]` → `[1, 1, 0]` | `useTransform(e, [0,1], [0.7, 1])` | `"18px"` (static) |
| 1 | `[0.2433, 0.4233, 0.6, 0.64]` → `[0, 1, 1, 0]` | `1` | `0` |
| 2 | `[0.5767, 0.7567, 1]` → `[0, 1, 1]` | `useTransform(p, [0.9, 1], [1, 0.7])` | `useTransform(p, [0.9, 1], ["0px", "18px"])` |
(generic: first `[0, u−0.09, min(1,u+0.09)]`; last `[max(0,m−0.09), m+0.09, 1]`; middle `[max(0,m−0.09), m+0.09, 0.6, 0.64]`.) SSR: img1 `border-radius:18px;opacity:1;transform:scale(0.7)`.

Captions (`l = i/3`, `m = (i+1)/3`, `u = l+0.1`, `q = m−0.1`; index 1 is special-cased):
| i | opacity range → `[0,1,1,0]` | y range → values |
|---|---|---|
| 0 | `[0, 0.1, 0.2333, 0.3333]` | `[0, 0.1, 0.2333, 0.3333]` → `[0, -42, -42, 42]` |
| 1 | `[0.3333, 0.4333, 0.9, 1]` | `[0.3333, 0.4333, 0.82, 1]` → `[36, 0, -50, -50]` |
| 2 | `[0.6667, 0.7667, 0.9, 1]` | `[0.6667, 0.7667, 0.9, 1]` → `[36, 21, 21, 36]` |
(Caption 1 and 2 overlap between 0.7667 and 0.9.) SSR: caption 0 `opacity:0;transform:none`, others `translateY(36px)`.

Reduced motion: image 0 opacity 1 / others 0, scale 1; captions 0 only; overlays fixed `0` (z-10) and `0.5` (z-30).

### State
None beyond `useReducedMotion()`.

---

## 8. `#gallery` — Day experience (module 4782)

### Data
```js
const BACKDROP = "/images/assets/units/townhouse-hero.png";
const phases = [
  { id: "morning",   images: [{ src: "/images/assets/day-experience/morning-01.jpg" },   { src: "/images/assets/day-experience/morning-02.jpg" }] },
  { id: "noon",      images: [{ src: "/images/assets/day-experience/noon-01.jpg" },      { src: "/images/assets/day-experience/noon-02.jpg" }] },
  { id: "afternoon", images: [{ src: "/images/assets/day-experience/afternoon-02.png" }, { src: "/images/assets/day-experience/afternoon-01.jpg" }] },
  { id: "evening",   images: [{ src: "/images/assets/day-experience/evening-01.png" },   { src: "/images/assets/day-experience/evening-02.jpg" }] },
];
const slidePhases = phases.slice(0, -1);  // morning, noon, afternoon
const evening = phases[3];
const PHASE_TIMELINE = [
  { entryStart: 0.27,  holdStart: 0.33,  holdEnd: 0.42, exitEnd: 0.47 },   // morning
  { entryStart: 0.437, holdStart: 0.497, holdEnd: 0.62, exitEnd: 0.67 },   // noon
  { entryStart: 0.637, holdStart: 0.697, holdEnd: 0.8,  exitEnd: 0.84 },   // afternoon
];
const EVENING_TIMELINE = { entryStart: 0.813, holdStart: 0.863, holdEnd: 0.93, exitEnd: 0.95 };
const FINALE_TIMELINE  = { revealStart: 0.93, settleStart: 0.95, holdEnd: 1 };
```
No image declares `objectPosition` (all `style={{ objectPosition: undefined }}`).

Wrapper (default export `_`): `reduced ? <GalleryStatic/> : <GalleryScroll/>`; when reduced it dispatches diagnostic `{ event:"mode-static-reduced-motion", label:"gallery", … }`.

### 8a. `GalleryScroll` (function `k`) — DOM tree
```
section#gallery ref={ref} aria-label={t.gallery.ariaLabel /* "Hành trình một ngày tại The Magnolia" */}
  className="relative snap-start bg-charcoal-950" style={{ height: "520vh" }}
└ div className="sticky top-0 h-[100svh] min-h-[620px] overflow-hidden"
    ├ div className="absolute inset-0"
    │   ├ <Image src={BACKDROP} alt="" fill sizes="100vw" className="object-cover" />
    │   ├ <ScrollScrubVideo src="/videos/grace-scroll.mp4" poster={BACKDROP} targetRef={ref} scrollYProgress={p}
    │   │     getTime={(p, dur) => p * dur} enabled diagnosticLabel="gallery" rootMargin="100% 0px"
    │   │     className="pointer-events-none absolute inset-0 h-full w-full object-cover transition-opacity duration-300" />
    │   ├ div aria-hidden className="absolute inset-0 bg-gradient-to-t from-charcoal-950/90 via-charcoal-950/50 to-charcoal-950/35"
    │   └ motion.div aria-hidden style={{ opacity: introVeil }} className="absolute inset-0 z-10 bg-black"
    ├ div className="pointer-events-none absolute inset-x-0 top-[54%] z-20 flex items-center"
    │   ├ div className="h-px flex-1 bg-champagne-100/20"
    │   ├ <Sparkle size={18} className="mx-4 text-champagne-300" />
    │   └ div className="h-px flex-1 bg-champagne-100/20"
    ├ for (phase, i) in slidePhases: <PhasePanel phase index={i} label={t.gallery.phases[phase.id]} scrollYProgress={p} />
    ├ <EveningPanel phase={evening} label={t.gallery.phases.evening} scrollYProgress={p} />
    ├ <EveningFinale phase={evening} scrollYProgress={p} />
    └ motion.p style={{ opacity: introOpacity, y: introY, filter: introBlur }}
        className="pointer-events-none absolute top-[65%] left-[10vw] z-50 max-w-[min(82vw,48rem)] px-2 font-display text-[clamp(1.8rem,3.2vw,3.2rem)] leading-[1.2] tracking-[-0.025em] whitespace-pre-line text-left text-ivory [text-shadow:0_3px_24px_rgb(0_0_0_/_0.35)]"
        text = t.gallery.intro = "Not about more. Just about right\nTrọn vẹn trong cảm nhận"
```

`PhasePanel` (function `w`, morning/noon/afternoon):
```
motion.section aria-label={label} style={{ x, opacity }}
  className="pointer-events-none absolute inset-0 z-30 flex items-center will-change-transform"
├ div className="relative h-full w-full shrink-0"
│   ├ div key={images[0].src} className="absolute bottom-[5svh] left-[2vw] h-[81svh] aspect-square overflow-hidden max-md:bottom-[10svh] max-md:left-[4vw] max-md:h-[76svh]"
│   │   └ <Image src alt={`${label}, 1`} fill sizes="(max-width: 768px) 76vw, 81vw" priority={phase.id === "morning"} className="object-cover" style={{ objectPosition }} />
│   └ div key={images[1].src} className="absolute right-[5vw] bottom-[5svh] h-[40svh] aspect-video overflow-hidden max-md:right-[4vw] max-md:bottom-[10svh] max-md:h-[32svh]"
│       └ <Image src alt={`${label}, 2`} fill sizes="(max-width: 768px) 57vw, 36vw" priority={phase.id === "morning"} className="object-cover" />
└ motion.p style={{ opacity }}
    className="absolute bottom-[11svh] left-[4vw] z-10 font-display text-[clamp(2.5rem,5vw,5.8rem)] leading-none tracking-[-0.04em] text-ivory [text-shadow:0_3px_24px_rgb(0_0_0_/_0.42)] max-md:bottom-[16svh] max-md:left-[7vw]"
    text = label
```

`EveningPanel` (function `j`): uses `images[1]` = `evening-02.jpg`.
```
motion.section aria-label={label} style={{ x, opacity }} className="pointer-events-none absolute inset-0 z-30 will-change-transform"
└ div className="absolute right-[5vw] bottom-[5svh] h-[53svh] aspect-video overflow-hidden max-md:right-[4vw] max-md:bottom-[10svh] max-md:h-[37svh]"
    ├ <Image src="/images/assets/day-experience/evening-02.jpg" alt={`${label}, 1`} fill sizes="(max-width: 768px) 66vw, 48vw" className="object-cover" />
    └ p className="absolute bottom-[8%] left-[6%] z-10 font-display text-[clamp(2.5rem,5vw,5.8rem)] leading-none tracking-[-0.04em] text-ivory [text-shadow:0_3px_24px_rgb(0_0_0_/_0.42)]"  label
```

`EveningFinale` (function `N`): uses `images[0]` = `evening-01.png`.
```
motion.div aria-label="Evening finale" style={{ x }} className="pointer-events-none absolute inset-0 z-30 overflow-hidden will-change-transform"
├ <Image src="/images/assets/day-experience/evening-01.png" alt="" fill sizes="100vw" className="object-cover" />
└ div aria-hidden className="absolute inset-0 bg-gradient-to-t from-charcoal-950/50 via-transparent to-charcoal-950/15"
```

### 8b. `GalleryStatic` (function `E`, reduced-motion) — DOM tree
```
section#gallery aria-label={t.gallery.ariaLabel} className="snap-start bg-charcoal-950"
├ div className="relative overflow-hidden px-6 py-20 sm:px-10 md:px-16"
│   ├ <Image src={BACKDROP} alt="" fill sizes="100vw" className="object-cover opacity-30" />
│   ├ div aria-hidden className="absolute inset-0 bg-charcoal-950/65"
│   └ p className="relative z-10 max-w-[min(82vw,48rem)] font-display text-[clamp(1.8rem,3.2vw,3.2rem)] leading-[1.2] tracking-[-0.025em] whitespace-pre-line text-ivory"  intro
└ div className="space-y-20 px-6 py-16 sm:px-10 md:px-16"
    ├ for phase in slidePhases: section aria-label={label}
    │   ├ h2 className="mb-8 font-display text-[clamp(2.3rem,5vw,4.5rem)] leading-none tracking-[-0.04em] text-ivory"  label
    │   └ div className="grid gap-5 md:grid-cols-2"
    │       └ for (img, i): div key className="relative aspect-[4/3] overflow-hidden"
    │           └ <Image src alt={`${label}, ${i+1}`} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />
    └ section aria-label={evening label}
        ├ h2 className="mb-8 font-display text-[clamp(2.3rem,5vw,4.5rem)] leading-none tracking-[-0.04em] text-ivory"  "Buổi tối"
        ├ div className="relative aspect-video overflow-hidden"
        │   └ <Image src="…/evening-02.jpg" alt="Buổi tối, 1" fill sizes="(max-width: 768px) 100vw, 80vw" className="object-cover" />
        └ div className="relative mt-5 aspect-[16/7] overflow-hidden"
            └ <Image src="…/evening-01.png" alt="Buổi tối, 2" fill sizes="100vw" className="object-cover" />
```

### Copy
- aria-label "Hành trình một ngày tại The Magnolia" (en "A day at The Magnolia").
- Intro (two lines, `whitespace-pre-line`): "Not about more. Just about right" ⏎ "Trọn vẹn trong cảm nhận" (same in en).
- Time-of-day labels: morning "Buổi sáng", noon "Buổi trưa", afternoon "Buổi chiều", evening "Buổi tối" (en "Morning" / "Noon" / "Afternoon" / "Evening"). Alt texts "Buổi sáng, 1", "Buổi sáng, 2", …; evening panel "Buổi tối, 1". Finale aria-label "Evening finale".

### Assets
| Asset | Element | Props |
|---|---|---|
| `/images/assets/units/townhouse-hero.png` | backdrop `<Image>` + video `poster` | `fill`, `sizes="100vw"`, `object-cover` |
| `/videos/grace-scroll.mp4` | ScrollScrubVideo (`getTime = p × duration`, IO `rootMargin "100% 0px"`) | scrubbed across the full 520vh track |
| `morning-01.jpg` | big square, bottom-left | `fill`, `sizes="(max-width: 768px) 76vw, 81vw"`, `priority` |
| `morning-02.jpg` | 16:9, bottom-right | `fill`, `sizes="(max-width: 768px) 57vw, 36vw"`, `priority` |
| `noon-01.jpg` / `noon-02.jpg` | same slots | same sizes, no priority |
| `afternoon-02.png` (slot 1) / `afternoon-01.jpg` (slot 2) | same slots (note swapped order) | same |
| `evening-02.jpg` | EveningPanel 16:9 `h-[53svh]` | `sizes="(max-width: 768px) 66vw, 48vw"` |
| `evening-01.png` | EveningFinale full-bleed | `sizes="100vw"` |

### Motion
`p = useScroll({ target: section, offset: ["start start", "end end"] })`. Track 520vh; sticky `100svh min-h-[620px]`.

Intro (0 → 0.27):
| MotionValue | `useTransform(p, [0, 0.05, 0.17, 0.27], …)` | Drives |
|---|---|---|
| `introOpacity` | `[0, 1, 1, 0]` | intro `motion.p` opacity |
| `introY` | `[24, 0, 0, -18]` | intro `y` (px) |
| `introBlur` | `["blur(10px)", "blur(0px)", "blur(0px)", "blur(4px)"]` | intro `filter` |
| `introVeil` | `[1, 0.72, 0.58, 0, 1]` over input `[0, 0.05, 0.17, 0.27, 1]` | z-10 black overlay over backdrop/video. **Corrected 2026-09-11:** the shipped bundle text shows only 4 stops, but the live page measurably ramps the veil back to 1 between progress 0.27 and 1.0 (verified at 8 scroll positions, max error 3e-4). Same for `introBlur`, whose 5th stop is `blur(10px)`. Implement 5 stops. |
SSR: intro `opacity:0;filter:blur(10px);transform:translateY(24px)`, veil `opacity:1`.

Phase panels — for each `{entryStart, holdStart, holdEnd, exitEnd}`: `x = useTransform(p, [entryStart, holdStart, holdEnd, exitEnd], ["100vw", "0vw", "0vw", "-100vw"])`, `opacity = useTransform(p, same, [0, 1, 1, 0])`; label `motion.p` shares the same `opacity`.
| Phase | range |
|---|---|
| Buổi sáng | `[0.27, 0.33, 0.42, 0.47]` |
| Buổi trưa | `[0.437, 0.497, 0.62, 0.67]` |
| Buổi chiều | `[0.637, 0.697, 0.8, 0.84]` |
| Buổi tối (panel) | `[0.813, 0.863, 0.93, 0.95]` |
| Evening finale | `x = useTransform(p, [0.93, 0.95, 1], ["100vw", "0vw", "0vw"])` (no opacity transform) |
Panels overlap slightly (e.g. noon enters at 0.437 while morning exits until 0.47) — both are z-30, later siblings paint on top. SSR: all panels `opacity:0;transform:translateX(100vw)`.

### State / interaction
- **No tab UI** — the morning/noon/afternoon/evening "switching" is purely scroll-driven via the timelines above.
- `useReducedMotion()` → `GalleryStatic` (stacked sections, no video).
- Mobile differences are class-based (`max-md:` offsets/heights) only.

---

## 9. `#consultation` — Consultation + footer (module 7914)

### Derived values
```js
const tel = "tel:" + t.contact.phone.replace(/[^+\d]/g, "");        // "tel:+84951870700"
const maps = "https://maps.google.com/?q=" + encodeURIComponent(t.footer.address);
// vi → "https://maps.google.com/?q=Khai%20S%C6%A1n%20City%2C%20Long%20Bi%C3%AAn%2C%20H%C3%A0%20N%E1%BB%99i"
```

### DOM tree
```
section#consultation aria-labelledby="consultation-title"
  className="relative flex min-h-[100svh] snap-start flex-col overflow-x-hidden bg-charcoal-night px-5 pb-8 pt-20 text-ivory sm:px-8 sm:pb-10 sm:pt-24 md:px-12 md:pb-12 md:pt-28"
├ div aria-hidden className="pointer-events-none absolute inset-0"
│   └ <Image src="/images/assets/heritage/silhouette2.png" alt="" fill sizes="100vw" className="scale-[1.04] object-cover object-center" />
├ motion.div
│     initial={reduced ? false : { opacity: 0, y: 28 }}   // `!t && {…}` → `false` when reduced
│     whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
│     viewport={{ once: true, amount: 0.35 }} transition={{ duration: 0.6, ease: VR }}
│     className="relative z-10 mx-auto my-10 flex w-full max-w-[27.75rem] flex-1 items-center sm:my-12"
│   └ div className="w-full border border-ivory/30 bg-black/35 px-10 py-9 shadow-[0_18px_70px_rgba(0,0,0,0.32)] backdrop-blur-xl sm:px-14 sm:py-10"
│       ├ div className="flex flex-col items-center text-center"
│       │   ├ <MagnoliaMark className="h-14 w-14 text-ivory/90" />
│       │   ├ h2#consultation-title className="mt-3 font-display text-[clamp(2.15rem,3.15vw,3.05rem)] leading-none tracking-[-0.035em] text-ivory"  "The Magnolia"
│       │   └ p className="mt-2 font-sans text-[0.52rem] uppercase tracking-[0.34em] text-ivory/75 sm:text-[0.58rem]"  "Private Residences"
│       ├ form onSubmit={e => e.preventDefault()} className="mt-10 flex flex-col gap-5"
│       │   ├ div
│       │   │   ├ label htmlFor="consultation-name" className="mb-2 block font-display text-[0.76rem] text-ivory/90"  "Họ và tên"
│       │   │   └ input#consultation-name type="text" name="name" autoComplete="name" required placeholder="Nhập họ tên"
│       │   │        className="h-11 w-full bg-black/55 px-2 font-sans text-[0.72rem] text-ivory placeholder:text-ivory/45 focus:outline-none focus:ring-1 focus:ring-champagne-200"
│       │   ├ div
│       │   │   ├ label htmlFor="consultation-contact" className="mb-2 block font-display text-[0.76rem] text-ivory/90"  "Số điện thoại/ Email"
│       │   │   └ input#consultation-contact type="text" name="contact" autoComplete="tel" inputMode="tel" required placeholder="Nhập số điện thoại/email"
│       │   │        className="h-11 w-full bg-black/55 px-2 font-sans text-[0.72rem] text-ivory placeholder:text-ivory/45 focus:outline-none focus:ring-1 focus:ring-champagne-200"
│       │   └ button type="submit" className="mt-5 flex h-11 items-center justify-center gap-5 border border-ivory/50 bg-ivory/15 px-4 font-display text-[clamp(0.88rem,1.2vw,1.08rem)] text-ivory transition-colors hover:bg-ivory/25 focus-visible:ring-champagne-200"
│       │        ├ <Sparkle size={12} />  "Gửi yêu cầu tư vấn"  <Sparkle size={12} />
│       └ p className="mt-3 text-center font-sans text-[0.54rem] leading-relaxed text-ivory/55"  "Private Residences"   (kicker repeated)
└ div className="relative z-10 flex flex-col gap-6 border-t border-ivory/25 pt-5 sm:flex-row sm:items-end sm:justify-between sm:gap-8"
    ├ div className="flex flex-wrap items-center gap-3"
    │   ├ a href={maps} target="_blank" rel="noreferrer"
    │   │     className="inline-flex h-11 items-center gap-4 border border-ivory/45 px-5 font-display text-[clamp(0.82rem,1.2vw,1.05rem)] text-ivory/90 transition-colors hover:bg-ivory/10"
    │   │     ├ <Sparkle size={12} />  "Xem trên map"  <Sparkle size={12} />
    │   └ div aria-hidden className="flex items-center gap-2"
    │       ├ <SocialIcon icon="facebook" />  ├ <SocialIcon icon="instagram" />  └ <SocialIcon icon="whatsapp" />
    └ div className="flex flex-col items-start gap-2 sm:items-end sm:text-right"
        ├ a href={tel} className="font-display text-[clamp(1.3rem,2.3vw,2.25rem)] leading-none tracking-[-0.025em] text-ivory/95 transition-colors hover:text-champagne-200"  "+84 (951) 870-700"
        └ a href="mailto:info@magnolia.com" className="font-display text-[clamp(0.8rem,1vw,1rem)] leading-none text-ivory/85 transition-colors hover:text-champagne-200"  "info@magnolia.com"
```

`SocialIcon` (function `u`): `span className="grid h-10 w-10 place-items-center rounded-full border border-ivory/35 text-ivory/90"` containing:
- facebook: `span className="font-sans text-sm font-semibold"` "f"
- instagram: `svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6"` → `rect x=3.5 y=3.5 width=17 height=17 rx=4`, `circle cx=12 cy=12 r=3.6`, `circle cx=17.8 cy=6.3 r=0.8 fill="currentColor" stroke="none"`
- whatsapp: `svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.45"` → `path d="M19.6 4.5A10 10 0 0 0 4.1 16.6L3 21l4.5-1.2A10 10 0 1 0 19.6 4.5Z"`, `path d="M9 7.5c.2-.5.4-.5.7-.5h.6c.2 0 .4.1.5.4l.8 1.8c.1.3.1.5-.1.7l-.6.7c.7 1.3 1.7 2.3 3 3l.7-.6c.2-.2.5-.2.7-.1l1.8.8c.3.1.4.3.4.5v.6c0 .3-.1.5-.5.7-.6.3-1.5.4-3-.2-1.3-.5-3-1.8-4.3-4.1-.6-1.1-.9-2.1-.7-3.2Z"`
(social icons are `aria-hidden`, not links).

### Copy (vi / en)
- Brand "The Magnolia"; kicker "Private Residences" (shown twice).
- Labels: "Họ và tên" / "Full name"; "Số điện thoại/ Email" / "Phone number/ Email".
- Placeholders: "Nhập họ tên" / "Enter your full name"; "Nhập số điện thoại/email" / "Enter your phone number/email".
- Submit: "Gửi yêu cầu tư vấn" / "Request a consultation".
- Map: "Xem trên map" / "View on map".
- Phone "+84 (951) 870-700"; email "info@magnolia.com".
- Footer address (only used inside the maps URL): "Khai Sơn City, Long Biên, Hà Nội" / "Khai Son City, Long Bien, Hanoi".
- Unused: `contact.salesOffice` "Tư vấn cùng\nSales Office", `contact.fields.message` "Nhập nội dung yêu cầu", `contact.close` "Đóng", `footer.rights` "Bảo lưu mọi quyền.", `footer.contact`, `footer.enquire`.

### Assets
`/images/assets/heritage/silhouette2.png` — `<Image fill sizes="100vw" className="scale-[1.04] object-cover object-center">` as full-section background (`aria-hidden` wrapper).

### Motion
Card: `{opacity:0, y:28}` → `{opacity:1, y:0}`, `duration 0.6`, ease VR, `viewport {once:true, amount:0.35}`; disabled entirely (`initial:false`) under reduced motion. Hover states are CSS `transition-colors`.

### State
Form is uncontrolled; `onSubmit` only `preventDefault()` — no network call, no validation beyond `required`.

---

## Shared

### Fonts (next/font, from `layout.pretty.js` + `styles.pretty.css`)
| Var | Family | Module | Weights / styles present in CSS | Fallback |
|---|---|---|---|---|
| `--font-display` | Playfair Display (`__Playfair_Display_1793ad`) | layout module 770, className `__className_1793ad`, variable `__variable_1793ad` | 400, 500, 600 in **normal and italic** | `local('Times New Roman')` with `ascent-override: 97.25%; descent-override: 22.56%; line-gap-override: 0%; size-adjust: 111.26%` |
| `--font-sans` | Inter (`__Inter_8de0eb`) | layout module 1900, className `__className_8de0eb`, variable `__variable_8de0eb`, `font-style: normal` | 300, 400, 500 | `local('Arial')` |
Subsets (by unicode-range blocks): both fonts ship latin, latin-ext, vietnamese, cyrillic (+cyrillic-ext), Inter additionally greek/greek-ext and a symbols block (`u+1f??`). Tailwind: `.font-display { font-family: var(--font-display), Playfair Display, Georgia, serif }`, `.font-sans { font-family: var(--font-sans), Inter, system-ui, sans-serif }`. `h1,h2,h3 { font-family: var(--font-display)…; font-weight: 400; text-wrap: balance }`; `p { text-wrap: pretty }`; `body { font-weight: 300 }`.

### Colour tokens (resolved from `styles.pretty.css`)
| Token | Value |
|---|---|
| `charcoal-950` | `#0b0908` (rgb 11 9 8) — body background |
| `charcoal-900` | `#14110e` |
| `charcoal-800` | `#1f1a15` |
| `charcoal-700` | `#2c2621` |
| `charcoal-600` | `#3d352d` |
| `charcoal-night` | `#0a0e14` (rgb 10 14 20) |
| `ivory` | `#e8e5dd` (rgb 232 229 221 / hsl 44 19% 89%) |
| `champagne-50` | `#faf6ef` (rgb 250 246 239) — body text colour |
| `champagne-100` | `#f2e9da` (rgb 242 233 218 / hsl 38 48% 90%) |
| `champagne-200` | `#e6d6bc` (rgb 230 214 188 / hsl 37 46% 82%) |
| `champagne-300` | `#d8c09a` (rgb 216 192 154) |
| `champagne-400` | `#c9a961` (rgb 201 169 97) |
| `navy-dark` | `#000c1a` (rgb 0 12 26) |
| `amber-*` (tone gradients) | Tailwind defaults; only rendered when a PanelBackground has no `src` |
| `::selection` | `rgba(201, 169, 97, 0.3)` |
| `bg-panel-scrim` | `linear-gradient(0deg, rgba(11,9,8,0.88) 0, rgba(11,9,8,0.35) 45%, rgba(11,9,8,0.15))` (defined; every PanelBackground on this page passes `scrim={false}`) |

Other custom utilities: `tracking-luxe` = `letter-spacing: 0.28em`; `ease-luxe` = `transition-timing-function: cubic-bezier(0.22, 1, 0.36, 1)`; `animate-twinkle` = `twinkle 4s ease-in-out infinite` with keyframes `0%,100% { opacity:.45; transform:scale(.92) rotate(0deg) } 50% { opacity:1; transform:scale(1) rotate(90deg) }` (Sparkle `twinkle` prop — not used on this page). `:root { color-scheme: dark }`.

### Motion constants (module 2893, verbatim)
```js
export const VR = [0.22, 1, 0.36, 1];                              // shared ease (== ease-luxe)
export const pB = { hidden: { opacity: 0, y: 28 }, visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: VR } } };
export const EY = (stagger = 0.1, delay = 0) => ({ hidden: {}, visible: { transition: { staggerChildren: stagger, delayChildren: delay } } });
export const d1 = { once: true, amount: 0.28 };                   // default whileInView viewport
export const Fv = { y: [0, -10, 0], scale: [1, 1.006, 1] };       // hero idle bob
export const V1 = { duration: 0.58, times: [0, 0.45, 1], ease: VR };
export const gT = { once: false, amount: 0.98 };
export const UQ = { subtle: 0.05, base: 0.08, strong: 0.12 };     // GSAP parallax depth (yPercent = ±100·depth)
```

### `siteConfig` (module 8530, verbatim)
```js
{
  name: "The Magnolia",
  description: "The Journey of Timeless Value — Khai Sơn City, Hà Nội",
  scrollSnap: "proximity",          // → <html style="--snap-strictness:proximity">
  cursorGlow: true,
  promoVideoUrl: "",
  interactiveTour: { embedUrl: "https://studio.realhorizons.ai/tours/df3f63d0-0985-45de-8394-f1fadd60b1e9/view",
                     externalUrl: "https://studio.realhorizons.ai/tours/df3f63d0-0985-45de-8394-f1fadd60b1e9",
                     previewSrc: "/images/assets/tour/preview.png", mountRootMargin: "50% 0px", readyTimeoutMs: 15000 },
  preloader: { markSize: 128, spinDuration: 6, minDuration: 1400 },
}
```

### Global layout wrapper / scroll-snap
- `<html class="__variable_1793ad __variable_8de0eb snap-panels" style="--snap-strictness:proximity">` — set server-side from `siteConfig.scrollSnap`; no runtime code changes the variable.
- `.snap-panels { scroll-snap-type: y var(--snap-strictness, proximity); }` — Tailwind's own `--tw-scroll-snap-strictness: proximity` is also present but unused by this class.
- `snap-start` (`scroll-snap-align: start`) is on: `#top`, `#heritage`, `#horizontal-slide`, `#interactive-tour`, `#grace`, `#gallery`, `#consultation`. **`#units` has no snap-start.**
- `html { scroll-behavior: smooth; scroll-padding-top: 5rem; }`
- `@media (prefers-reduced-motion: reduce) { html { scroll-behavior: auto } .snap-panels { scroll-snap-type: none } *, :after, :before { animation-duration: 0.001ms !important; … } }`
- Reduced-motion in JS: framer-motion `useReducedMotion()` everywhere (`(0,x.J)()`), plus a raw `matchMedia("(prefers-reduced-motion: reduce)")` check inside the GSAP parallax hook.
- No `useIsMobile` hook exists; the only `matchMedia` branch is CursorGlow's `(hover: hover) and (pointer: fine)`. Mobile handling is via Tailwind `sm:`/`md:`/`max-md:` variants.
- GSAP: `gsap.registerPlugin(ScrollTrigger)` at module 4294 load; ScrollTrigger is refreshed on fonts-ready and window load.
- Every `next/image` on the page uses `fill` and no `quality` prop (rendered URLs are `/_next/image?url=…&w=3840&q=75`).

### `MagnoliaMark` (module 6046) — logo SVG
`svg width/height={size = 212} viewBox="0 0 212 212" fill="none" role={title ? "img" : undefined} aria-label={title} aria-hidden={!title} focusable="false" className=cn("shrink-0", className)` → `<g fill="currentColor">` with 8 petal paths (4 cardinal, 4 diagonal), `d` verbatim:
- `M85.2718 167.143C86.3804 156.85 91.9968 151.636 96.6408 142.449C101.429 134.316 105.245 122.214 106 122.498C106.839 122.378 110.224 128.74 115.004 135.476C119.578 142.82 125.543 150.533 126.728 167.143C124.608 197.248 116.775 214.125 106 211.788C99.7977 208.331 95.9653 198.793 92.2882 191.414C88.8263 183.414 85.5142 177.572 85.2718 167.143Z`
- `M85.2716 44.8598C86.3802 55.1529 91.9966 60.3662 96.6406 69.5534C101.429 77.6866 105.245 89.7883 105.999 89.505C106.838 89.6248 110.224 83.2621 115.004 76.5263C119.577 69.183 125.542 61.4693 126.727 44.8598C124.608 14.754 116.775 -2.12243 105.999 0.214557C99.7975 3.67101 95.9651 13.2096 92.288 20.5883C88.8261 28.588 85.5141 34.4305 85.2716 44.8598Z`
- `M44.8598 85.2757C55.1529 86.3842 60.3662 92.0006 69.5534 96.6447C77.6866 101.433 89.7883 105.249 89.505 106.004C89.6248 106.842 83.2621 110.228 76.5263 115.008C69.183 119.581 61.4693 125.547 44.8598 126.731C14.754 124.612 -2.12243 116.779 0.214557 106.004C3.67101 99.8015 13.2096 95.9692 20.5883 92.2921C28.588 88.8302 34.4305 85.5208 44.8598 85.2757Z`
- `M167.14 85.2757C156.847 86.3842 151.633 92.0007 142.446 96.6447C134.313 101.433 122.211 105.249 122.495 106.004C122.375 106.842 128.738 110.228 135.473 115.008C142.817 119.581 150.53 125.547 167.14 126.731C197.246 124.612 214.122 116.779 211.785 106.004C208.329 99.8015 198.79 95.9692 191.411 92.2921C183.412 88.8302 177.569 85.5208 167.14 85.2757Z`
- `M87.5378 73.9572C90.4604 77.5852 90.3324 81.0308 91.7787 85.4324C92.841 89.5425 95.4776 94.6087 95.148 94.7585C94.9192 95.0636 91.8168 94.1157 88.1534 93.4947C84.3619 92.6122 80.0093 92.0566 74.3466 87.1483C65.4399 76.8961 62.5636 69.0326 66.7364 66.347C69.8088 65.4726 74.0633 67.2894 77.5824 68.466C81.2296 69.9096 84.1413 70.7159 87.5378 73.9572Z`
- `M139.484 125.904C135.856 122.981 132.411 123.109 128.009 121.663C123.899 120.601 118.833 117.964 118.683 118.294C118.378 118.523 119.326 121.625 119.947 125.288C120.829 129.08 121.385 133.433 126.293 139.095C136.548 147.999 144.409 150.878 147.094 146.705C147.969 143.633 146.152 139.379 144.975 135.859C143.532 132.212 142.726 129.301 139.484 125.904Z`
- `M74.348 125.904C77.976 122.982 81.4216 123.11 85.8232 121.663C89.9333 120.601 94.9995 117.964 95.1493 118.294C95.4544 118.523 94.5065 121.625 93.8855 125.289C93.003 129.08 92.4474 133.433 87.5391 139.095C77.2842 147.999 69.4234 150.878 66.7378 146.706C65.8634 143.633 67.6802 139.379 68.8568 135.86C70.3004 132.212 71.1067 129.301 74.348 125.904Z`
- `M126.295 73.9571C123.373 77.5852 123.501 81.0308 122.055 85.4324C120.992 89.5425 118.356 94.6087 118.685 94.7585C118.914 95.0636 122.016 94.1157 125.68 93.4947C129.471 92.6122 133.824 92.0566 139.487 87.1483C148.393 76.8961 151.27 69.0326 147.097 66.347C144.024 65.4726 139.77 67.2894 136.251 68.466C132.604 69.9096 129.692 70.7159 126.295 73.9571Z`

`Sparkle` (module 313): `svg width={size=12} height={size} viewBox="0 0 16 16" fill="currentColor" aria-hidden focusable="false" className=cn("shrink-0", twinkle && "animate-twinkle", className)` with 4 paths: `M8 0c.55 4.3 1.2 6.1 2.2 6.9C9.1 7.3 8.5 7.5 8 8c-.5-.5-1.1-.7-2.2-1.1C6.8 6.1 7.45 4.3 8 0Z`, `M8 16c-.55-4.3-1.2-6.1-2.2-6.9C6.9 8.7 7.5 8.5 8 8c.5.5 1.1.7 2.2 1.1C9.2 9.9 8.55 11.7 8 16Z`, `M16 8c-4.3.55-6.1 1.2-6.9 2.2C8.7 9.1 8.5 8.5 8 8c.5-.5.7-1.1 1.1-2.2C9.9 6.8 11.7 7.45 16 8Z`, `M0 8c4.3-.55 6.1-1.2 6.9-2.2C7.3 6.9 7.5 7.5 8 8c-.5.5-.7 1.1-1.1 2.2C6.1 9.2 4.3 8.55 0 8Z`.

### External links
| Where | URL |
|---|---|
| Horizontal-slide CTA (per active slide) | `https://themagnolia360.vistax.vn/?s=pano10&/tong-the-01.html`, `…?s=pano33273&/sanh-don-tiep-pavillion.html`, `…?s=pano36996&/sanh-don-tiep-pavillion.html`, `…?s=pano36994&/khu-trung-bay-sieu-xe-tang-b1.html`, `…?s=pano36997&/vuon-rieng-tang-5.html` (`target="_blank" rel="noreferrer"`) |
| Interactive tour iframe | `https://studio.realhorizons.ai/tours/df3f63d0-0985-45de-8394-f1fadd60b1e9/view` |
| Tour fallback link | `https://studio.realhorizons.ai/tours/df3f63d0-0985-45de-8394-f1fadd60b1e9` (`rel="noopener noreferrer"`) |
| Map | `https://maps.google.com/?q=Khai%20S%C6%A1n%20City%2C%20Long%20Bi%C3%AAn%2C%20H%C3%A0%20N%E1%BB%99i` |
| Phone | `tel:+84951870700` |
| Email | `mailto:info@magnolia.com` |
| In-page | `#top` (logo), `#consultation` (header "Liên hệ"), `#main` (skip link) |

### Complete asset list
Images: `/images/assets/hero/2cb5cde9e63f1f02d524186966868fc771df1cc8.png`, `/images/assets/heritage/silhouette.png`, `/images/assets/heritage/silhouette2.png`, `/images/assets/horizontal-slide/slide-1.jpg` … `slide-5.jpg`, `/images/assets/tour/preview.png`, `/images/assets/units/card-3br.png`, `card-penthouse.png`, `card-duplex.png`, `strip-1.png`, `strip-2.png`, `strip-3.png`, `townhouse-hero.png`, `/images/assets/grace/stair-01.png`, `stair-02.png`, `stair-04.png`, `/images/assets/day-experience/morning-01.jpg`, `morning-02.jpg`, `noon-01.jpg`, `noon-02.jpg`, `afternoon-01.jpg`, `afternoon-02.png`, `evening-01.png`, `evening-02.jpg`. Videos: `/videos/hero/FULL_0409.mp4`, `/videos/grace-scroll.mp4`. Favicon `/favicon.ico`.
