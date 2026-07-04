'use client';

/**
 * Block "Experience - 3D Journey" — migrate 1:1 từ quadplex80.com (Nuxt+WebGL).
 *
 * Kiến trúc mirror: bản gốc là virtual-scroll 1 viewport (scrollHeight 900);
 * ở đây dùng CSS sticky cao ~760vh (không GSAP pin — an toàn iOS/wrapper
 * transform), mọi lớp render trong viewport sticky:
 *  - canvas three.js (engine `q80/scene.ts`, thông số đo từ bundle gốc):
 *    HDR sky + 5 lớp mây + 4 tòa lân cận + GLB 111W57 + sprite mây + lens flare;
 *  - canvas gl-slides (engine `q80/slidesGL.ts`): ảnh suite fullscreen,
 *    wipe dọc bằng shader TRÍCH NGUYÊN LOGIC gốc, scrub theo scroll;
 *  - DOM: gate ENTER EXPERIENCE (giữ nguyên như gốc — chỉ khóa scroll trên /p),
 *    home text, card "0X — TITLE +", dots nav, contact card, drawer chi tiết,
 *    overlay floorplans, overlay "see the view" (press & hold), sound, cursor.
 *
 * Phối hợp với `q80_menu` qua window events:
 *  - phát  `q80:slide`   {index, total}   — slide hiện tại;
 *  - phát  `q80:overlay` {open}           — có overlay đang mở;
 *  - nghe  `q80:goto`    {target}         — 'home' | slug | 'floorplans' | 'contact'.
 *
 * Ba ngữ cảnh render:
 *  - /p (hasRoot && scroller null): đủ gate + intro bay xuyên mây + journey;
 *  - editor canvas (hasRoot && scroller element): bỏ gate (entered sẵn) để
 *    editor thấy nội dung ngay, 3D + slides scrub bình thường;
 *  - mini-preview/thumbnail (hasRoot false): poster tĩnh, KHÔNG WebGL.
 */
import * as React from 'react';
import gsap from 'gsap';

import { useLandingMotion } from '../motion/LandingMotion';
import {
  Q80_FONT_CSS,
  Q80_FONT_SANS,
  Q80_FONT_SERIF,
  Q80_GOLD,
  Q80_LOGO_LINES,
} from './q80Theme';
import type {
  BlockBackground,
  ElementPositionsMap,
  ElementStylesMap,
  Q80ExperienceContent,
  Q80SuiteItem,
} from '../types';
import {
  blockBackgroundStyle,
  composeStyle,
  elementStyleOf,
  orderStyle,
  positionStyle,
  selectableClass,
} from './applyStyle';
import type { Q80Scene } from './q80/scene';
import type { Q80Slides } from './q80/slidesGL';

interface Props {
  content: Q80ExperienceContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
}

// ── Band scroll (tỉ lệ progress của sticky range) ─────────────────────────
const HOME_HOLD = 0.1; // giữ cảnh tháp
const WIPE = 0.08; // 1 nhịp wipe slide
const HOLD = 0.08; // giữ 1 suite
const CONTACT_PULL = 0.12; // camera lùi về mây + slide fade
const STICKY_VH = 760; // tổng chiều cao block

/** Trạng thái slide tại progress p. index −1 = home (cảnh 3D), 0..S−1 = suite. */
function slideStateAt(p: number, suiteCount: number) {
  const contactStart = HOME_HOLD + suiteCount * (WIPE + HOLD);
  if (p < HOME_HOLD)
    return { from: -1, to: -1, wipe: 0, index: -1, contact: 0, contactStart };
  if (p >= contactStart) {
    const c = Math.min(1, (p - contactStart) / CONTACT_PULL);
    return {
      from: suiteCount - 1,
      to: suiteCount - 1,
      wipe: 1,
      index: suiteCount - 1,
      contact: c,
      contactStart,
    };
  }
  const q = (p - HOME_HOLD) / (WIPE + HOLD);
  const i = Math.floor(q);
  const inBand = q - i;
  const wipePart = WIPE / (WIPE + HOLD);
  if (inBand < wipePart) {
    return {
      from: i - 1,
      to: i,
      wipe: inBand / wipePart,
      index: inBand / wipePart > 0.5 ? i : i - 1,
      contact: 0,
      contactStart,
    };
  }
  return { from: i, to: i, wipe: 1, index: i, contact: 0, contactStart };
}

const CSS = `
${Q80_FONT_CSS}
.q80-exp .q80-uline { position: relative; }
.q80-exp .q80-uline::after {
  content: ''; position: absolute; left: 0; right: 0; bottom: -3px;
  border-bottom: 1px solid currentColor; opacity: .6;
}
@keyframes q80-cursor-pulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.12); } }
.q80-exp .q80-fade { transition: opacity .6s ease; }
.q80-exp .q80-drawer { transition: transform .8s cubic-bezier(.7,0,.2,1); }
.q80-exp .q80-plans { transition: transform .8s cubic-bezier(.7,0,.2,1); }
.q80-exp .q80-view { transition: opacity .5s ease; }
`;

export function Q80Experience({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
}: Props) {
  const { scroller, requestRefresh, hasRoot } = useLandingMotion();
  const isPublic = hasRoot && scroller === null;

  const rootRef = React.useRef<HTMLElement>(null);
  const stickyRef = React.useRef<HTMLDivElement>(null);
  const glRef = React.useRef<HTMLCanvasElement>(null);
  const slidesGlRef = React.useRef<HTMLCanvasElement>(null);
  const homeTextRef = React.useRef<HTMLDivElement>(null);
  const contactRef = React.useRef<HTMLDivElement>(null);
  const cardNumRef = React.useRef<HTMLSpanElement>(null);
  const cursorRef = React.useRef<HTMLDivElement>(null);
  const gateRef = React.useRef<HTMLDivElement>(null);
  const loadPctRef = React.useRef<HTMLDivElement>(null);
  const loadLineRef = React.useRef<HTMLHRElement>(null);

  const sceneRef = React.useRef<Q80Scene | null>(null);
  const slidesRef = React.useRef<Q80Slides | null>(null);
  const progressRef = React.useRef(0);
  const enteredRef = React.useRef(!isPublic);

  // entered: /p bắt đầu ở gate; editor canvas vào thẳng journey.
  const [entered, setEntered] = React.useState(!isPublic);
  const [ready, setReady] = React.useState(false);
  const [slideIndex, setSlideIndex] = React.useState(-1); // −1 = home
  const [inContact, setInContact] = React.useState(false);
  const [drawer, setDrawer] = React.useState<null | 'overview' | number>(null);
  const [plansOpen, setPlansOpen] = React.useState(false);
  const [plansFloor, setPlansFloor] = React.useState(0);
  const [viewOpen, setViewOpen] = React.useState(false);
  const [soundOn, setSoundOn] = React.useState(false);

  const suites = React.useMemo<Q80SuiteItem[]>(
    () => content.suites ?? [],
    [content.suites]
  );
  const totalDots = suites.length + 2; // home + suites + contact

  const styleOf = (key: string) =>
    composeStyle(
      elementStyleOf(styles, key),
      orderStyle(order, key),
      positionStyle(positions, key)
    );

  const ambientRef = React.useRef<HTMLAudioElement | null>(null);
  const backgroundAudioRef = React.useRef<HTMLAudioElement | null>(null);

  const anyOverlay = drawer !== null || plansOpen || viewOpen;

  // ── Phát sự kiện cho q80_menu ──
  React.useEffect(() => {
    window.dispatchEvent(
      new CustomEvent('q80:slide', {
        detail: { index: slideIndex, total: totalDots },
      })
    );
  }, [slideIndex, totalDots]);
  React.useEffect(() => {
    window.dispatchEvent(
      new CustomEvent('q80:overlay', { detail: { open: anyOverlay } })
    );
  }, [anyOverlay]);
  // Báo cho q80_menu biết đã qua gate (chrome mới hiện).
  React.useEffect(() => {
    if (entered) window.dispatchEvent(new CustomEvent('q80:entered'));
  }, [entered]);

  // ── Khóa scroll khi còn gate/intro (/p) ──
  React.useEffect(() => {
    if (!isPublic) return;
    const el = document.documentElement;
    if (!entered) {
      const prev = el.style.overflow;
      el.style.overflow = 'hidden';
      return () => {
        el.style.overflow = prev;
      };
    }
    return undefined;
  }, [isPublic, entered]);

  // ── Khởi tạo 2 engine WebGL (chỉ khi có root — không chạy trong thumbnail) ──
  React.useEffect(() => {
    if (!hasRoot) return;
    const glCanvas = glRef.current;
    const slCanvas = slidesGlRef.current;
    const sticky = stickyRef.current;
    if (!glCanvas || !slCanvas || !sticky) return;
    let dead = false;

    (async () => {
      const [{ createQ80Scene }, { createQ80Slides }] = await Promise.all([
        import('./q80/scene'),
        import('./q80/slidesGL'),
      ]);
      if (dead) return;
      const scene = await createQ80Scene(
        glCanvas,
        {
          glbUrl: content.glbUrl,
          hdrUrl: content.hdrUrl,
          cloudTintUrl: content.cloudTintUrl,
          introCloudUrl: content.introCloudUrl,
          layerUrls: content.layerUrls ?? [],
          buildingUrls: content.buildingUrls ?? [],
          flare1Url: content.flare1Url,
          flare2Url: content.flare2Url,
        },
        (n, t) => {
          // thanh loading của gate (0..100%)
          const pct = Math.round((n / t) * 100);
          if (loadPctRef.current) loadPctRef.current.textContent = `${pct}%`;
          if (loadLineRef.current)
            loadLineRef.current.style.transform = `scaleX(${pct / 100})`;
        }
      );
      if (dead) {
        scene.dispose();
        return;
      }
      sceneRef.current = scene;
      const slides = await createQ80Slides(
        slCanvas,
        suites.map(s => s.imageUrl)
      );
      if (dead) {
        scene.dispose();
        slides.dispose();
        return;
      }
      slidesRef.current = slides;

      const fit = () => {
        const w = sticky.clientWidth;
        const h = sticky.clientHeight;
        scene.resize(w, h);
        slides.resize(w, h);
      };
      fit();
      const ro = new ResizeObserver(fit);
      ro.observe(sticky);
      (scene as unknown as { _ro?: ResizeObserver })._ro = ro;

      // editor canvas: vào thẳng city (không gate)
      if (!isPublic) scene.setScroll(1);
      scene.start();

      // render loop cho gl-slides (đồng bộ rAF riêng, nhẹ)
      let raf = 0;
      const loop = () => {
        raf = requestAnimationFrame(loop);
        slides.render();
      };
      raf = requestAnimationFrame(loop);
      (slides as unknown as { _raf?: number })._raf = raf;

      setReady(true);
      requestRefresh();
    })();

    return () => {
      dead = true;
      const scene = sceneRef.current;
      const slides = slidesRef.current;
      (scene as unknown as { _ro?: ResizeObserver })?._ro?.disconnect();
      if (slides) {
        cancelAnimationFrame(
          (slides as unknown as { _raf?: number })._raf ?? 0
        );
        slides.dispose();
      }
      scene?.dispose();
      sceneRef.current = null;
      slidesRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasRoot, content.glbUrl, suites.length]);

  // ── Scroll scrub: progress sticky → trạng thái journey ──
  React.useEffect(() => {
    if (!hasRoot) return;
    const root = rootRef.current;
    if (!root) return;
    const ctx = gsap.context(() => {
      // ScrollTrigger đã được LandingMotionRoot register (R1)
      gsap
        .timeline({
          scrollTrigger: {
            trigger: root,
            scroller: scroller ?? undefined,
            start: 'top top',
            end: 'bottom bottom',
            scrub: true,
            invalidateOnRefresh: true,
            onUpdate: self => {
              progressRef.current = self.progress;
              applyProgress(self.progress);
            },
          },
        })
        .to({}, { duration: 1 }); // timeline rỗng — chỉ cần progress
    }, root);
    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasRoot, scroller, ready, suites.length]);

  const lastIndexRef = React.useRef(-2);
  const applyProgress = React.useCallback(
    (p: number) => {
      const st = slideStateAt(p, suites.length);
      const slides = slidesRef.current;
      const scene = sceneRef.current;
      if (slides) {
        slides.setTransition(st.from, st.to, st.wipe);
        // qua contact: slide fade để lộ cảnh mây
        slides.setAlpha(1 - st.contact);
      }
      if (scene && enteredRef.current) {
        // contact: camera lùi về mây (mirror cảnh contact gốc)
        scene.setScroll(1 - st.contact * 0.72);
      }
      // home text fade khi bắt đầu wipe đầu tiên
      if (homeTextRef.current) {
        const fade =
          p < HOME_HOLD ? 1 : Math.max(0, 1 - (p - HOME_HOLD) / (WIPE * 0.6));
        homeTextRef.current.style.opacity = String(fade);
        homeTextRef.current.style.pointerEvents = fade > 0.5 ? 'auto' : 'none';
      }
      if (contactRef.current) {
        const c = st.contact;
        contactRef.current.style.opacity = String(c);
        contactRef.current.style.pointerEvents = c > 0.6 ? 'auto' : 'none';
        contactRef.current.style.transform = `translateY(${(1 - c) * 40}px)`;
      }
      const uiIndex = st.contact > 0.5 ? suites.length : st.index;
      if (uiIndex !== lastIndexRef.current) {
        lastIndexRef.current = uiIndex;
        setSlideIndex(uiIndex >= suites.length ? suites.length : uiIndex);
        setInContact(uiIndex >= suites.length);
      }
    },
    [suites.length]
  );

  // ── ENTER: intro bay xuyên mây (14s như gốc ~16s) rồi mở khóa scroll ──
  const enter = React.useCallback((withSound: boolean) => {
    const scene = sceneRef.current;
    const gate = gateRef.current;
    if (withSound) {
      setSoundOn(true);
      ambientRef.current?.play().catch(() => {});
      backgroundAudioRef.current?.play().catch(() => {});
    }
    const reduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    if (gate) {
      gsap.to(gate, {
        autoAlpha: 0,
        duration: 1.2,
        ease: 'power2.out',
        onComplete: () => {
          gate.style.display = 'none';
        },
      });
    }
    if (!scene || reduced) {
      scene?.setScroll(1);
      enteredRef.current = true;
      setEntered(true);
      return;
    }
    const proxy = { v: 0 };
    gsap.to(proxy, {
      v: 1,
      duration: 14,
      ease: 'power2.inOut',
      onUpdate: () => scene.setScroll(proxy.v),
      onComplete: () => {
        enteredRef.current = true;
        setEntered(true);
      },
    });
  }, []);

  // ── q80:goto từ menu ──
  React.useEffect(() => {
    if (!hasRoot) return;
    const onGoto = (e: Event) => {
      const target = (e as CustomEvent<{ target: string }>).detail?.target;
      if (!target) return;
      if (target === 'floorplans') {
        setPlansOpen(true);
        return;
      }
      const root = rootRef.current;
      if (!root) return;
      const range = root.offsetHeight - window.innerHeight;
      let p = 0;
      if (target === 'home') p = 0;
      else if (target === 'contact')
        p = HOME_HOLD + suites.length * (WIPE + HOLD) + CONTACT_PULL;
      else {
        const i = suites.findIndex(s => s.slug === target);
        if (i >= 0) p = HOME_HOLD + i * (WIPE + HOLD) + WIPE + HOLD * 0.5;
      }
      const rootTop =
        root.getBoundingClientRect().top +
        (scroller ? scroller.scrollTop : window.scrollY);
      const top = rootTop + Math.min(1, p) * range;
      if (scroller) scroller.scrollTo({ top, behavior: 'smooth' });
      else window.scrollTo({ top, behavior: 'smooth' });
    };
    window.addEventListener('q80:goto', onGoto);
    return () => window.removeEventListener('q80:goto', onGoto);
  }, [hasRoot, scroller, suites]);

  // ── Press & hold: zoom nhẹ + mở overlay view; cursor ring theo chuột ──
  React.useEffect(() => {
    if (!isPublic || !entered) return;
    const sticky = stickyRef.current;
    if (!sticky) return;
    let holdTimer = 0;
    let zoomTween: gsap.core.Tween | null = null;

    const isInteractive = (t: EventTarget | null) =>
      t instanceof Element && !!t.closest('button, a, .q80-no-hold');

    const onDown = (e: PointerEvent) => {
      if (anyOverlay || isInteractive(e.target)) return;
      const scene = sceneRef.current;
      const zoomProxy = { v: 0 };
      zoomTween = gsap.to(zoomProxy, {
        v: 1,
        duration: 1,
        ease: 'power2.inOut',
        onUpdate: () => scene?.setZoom(zoomProxy.v),
      });
      holdTimer = window.setTimeout(() => setViewOpen(true), 700);
    };
    const cancel = () => {
      window.clearTimeout(holdTimer);
      zoomTween?.kill();
      const scene = sceneRef.current;
      if (scene) {
        const back = { v: 1 };
        gsap.to(back, {
          v: 0,
          duration: 0.8,
          ease: 'power2.out',
          onUpdate: () => scene.setZoom(back.v * (viewOpen ? 0 : 1)),
        });
      }
    };
    const onMove = (e: PointerEvent) => {
      const scene = sceneRef.current;
      const r = sticky.getBoundingClientRect();
      const nx = ((e.clientX - r.left) / r.width) * 2 - 1;
      const ny = -(((e.clientY - r.top) / r.height) * 2 - 1);
      scene?.setPointer(nx, ny);
      const cur = cursorRef.current;
      if (cur) {
        const inContactBand =
          slideStateAt(progressRef.current, suites.length).contact > 0.3;
        cur.style.transform = `translate(${e.clientX - r.left}px, ${e.clientY - r.top}px)`;
        cur.style.opacity =
          anyOverlay || inContactBand || isInteractive(e.target) ? '0' : '1';
      }
    };
    sticky.addEventListener('pointerdown', onDown);
    sticky.addEventListener('pointerup', cancel);
    sticky.addEventListener('pointercancel', cancel);
    sticky.addEventListener('pointerleave', cancel);
    sticky.addEventListener('pointermove', onMove);
    return () => {
      window.clearTimeout(holdTimer);
      sticky.removeEventListener('pointerdown', onDown);
      sticky.removeEventListener('pointerup', cancel);
      sticky.removeEventListener('pointercancel', cancel);
      sticky.removeEventListener('pointerleave', cancel);
      sticky.removeEventListener('pointermove', onMove);
    };
  }, [isPublic, entered, anyOverlay, viewOpen, suites.length]);

  // ── ESC đóng overlay ──
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      setViewOpen(false);
      setPlansOpen(false);
      setDrawer(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // ── Sound toggle ──
  React.useEffect(() => {
    const a = ambientRef.current;
    const b = backgroundAudioRef.current;
    for (const el of [a, b]) {
      if (!el) continue;
      el.muted = !soundOn;
      if (soundOn) el.play().catch(() => {});
    }
  }, [soundOn]);

  // ═══ Poster cho thumbnail (không WebGL) ═══
  if (!hasRoot) {
    return (
      <section
        style={blockBackgroundStyle(background)}
        className='q80-exp @container relative w-full overflow-hidden'
      >
        <style>{CSS}</style>
        <div
          className='relative flex w-full flex-col items-center justify-center text-center'
          style={{
            minHeight: 'clamp(280px, 56cqi, 640px)',
            background:
              'linear-gradient(#7ba7cc 0%, #cfdde9 55%, #f2f4f5 100%)',
            color: '#ffffff',
          }}
        >
          <div
            style={{
              fontFamily: Q80_FONT_SERIF,
              fontSize: 'clamp(11px, 1.2cqi, 15px)',
              letterSpacing: '.18em',
              lineHeight: 1.4,
            }}
          >
            {Q80_LOGO_LINES.map(l => (
              <div key={l}>{l}</div>
            ))}
          </div>
          <h2
            data-element-key='introTitle'
            className={selectableClass(activeKey === 'introTitle')}
            style={composeStyle(
              {
                fontFamily: Q80_FONT_SERIF,
                fontSize: 'clamp(34px, 8cqi, 92px)',
                lineHeight: 1.02,
                whiteSpace: 'pre-line',
                marginTop: 'clamp(12px, 3cqi, 32px)',
                textTransform: 'uppercase',
                letterSpacing: '.04em',
              },
              styleOf('introTitle')
            )}
          >
            {content.introTitle}
          </h2>
          <p
            data-element-key='introText'
            className={selectableClass(activeKey === 'introText')}
            style={composeStyle(
              {
                fontFamily: Q80_FONT_SANS,
                fontSize: 'clamp(11px, 1.4cqi, 15px)',
                maxWidth: 'min(80cqi, 460px)',
                marginTop: 'clamp(10px, 2cqi, 20px)',
                opacity: 0.92,
              },
              styleOf('introText')
            )}
          >
            {content.introText}
          </p>
          <div
            style={{
              marginTop: 'clamp(14px, 3cqi, 30px)',
              fontFamily: Q80_FONT_SANS,
              fontSize: 'clamp(10px, 1.2cqi, 13px)',
              letterSpacing: '.14em',
              textTransform: 'uppercase',
              borderBottom: '2px double rgba(255,255,255,.8)',
              paddingBottom: 4,
            }}
          >
            {content.enterLabel}
          </div>
        </div>
      </section>
    );
  }

  const activeSuite =
    slideIndex >= 0 && slideIndex < suites.length ? suites[slideIndex] : null;
  const drawerSuite = typeof drawer === 'number' ? suites[drawer] : null;
  const cardNo = String(Math.min(slideIndex + 2, suites.length + 1)).padStart(
    2,
    '0'
  );
  const cardTitle =
    slideIndex < 0 ? content.overviewLabel : (activeSuite?.title ?? '');
  const viewVideo =
    slideIndex < 0 || !activeSuite
      ? content.homeViewVideoUrl
      : activeSuite.viewVideoUrl;

  return (
    <section
      ref={rootRef}
      style={composeStyle(blockBackgroundStyle(background), {
        height: `${STICKY_VH}vh`,
      })}
      className='q80-exp @container relative w-full'
    >
      <style>{CSS}</style>
      {/* audio (S3) */}
      {content.ambientUrl ? (
        <audio ref={ambientRef} src={content.ambientUrl} loop preload='none' />
      ) : null}
      {content.backgroundUrl ? (
        <audio
          ref={backgroundAudioRef}
          src={content.backgroundUrl}
          loop
          preload='none'
        />
      ) : null}

      <div
        ref={stickyRef}
        className='sticky top-0 h-screen w-full overflow-hidden'
        style={{ background: '#a9c3d9' }}
      >
        {/* canvas 3D */}
        <canvas ref={glRef} className='absolute inset-0 h-full w-full' />
        {/* canvas gl-slides */}
        <canvas
          ref={slidesGlRef}
          className='pointer-events-none absolute inset-0 z-[2] h-full w-full'
        />

        {/* ── Home text (slide 01) ── */}
        <div
          ref={homeTextRef}
          className='absolute inset-0 z-[3] flex items-center'
          style={{ opacity: entered ? 1 : 0 }}
        >
          <div
            style={{ paddingLeft: 'clamp(20px, 5.5cqi, 80px)', maxWidth: 560 }}
          >
            <div
              data-element-key='homeEyebrow'
              className={selectableClass(activeKey === 'homeEyebrow')}
              style={composeStyle(
                {
                  fontFamily: Q80_FONT_SANS,
                  fontWeight: 500,
                  fontSize: 'clamp(9px, .85cqi, 12px)',
                  letterSpacing: '.16em',
                  textTransform: 'uppercase',
                  color: '#ffffff',
                },
                styleOf('homeEyebrow')
              )}
            >
              {content.homeEyebrow}
            </div>
            <h1
              data-element-key='homeTitle'
              className={selectableClass(activeKey === 'homeTitle')}
              style={composeStyle(
                {
                  fontFamily: Q80_FONT_SERIF,
                  fontSize: 'clamp(30px, 4.4cqi, 64px)',
                  lineHeight: 1.14,
                  color: '#ffffff',
                  whiteSpace: 'pre-line',
                  marginTop: 'clamp(10px, 1.6cqi, 24px)',
                },
                styleOf('homeTitle')
              )}
            >
              {content.homeTitle}
            </h1>
            <p
              data-element-key='homeText'
              className={selectableClass(activeKey === 'homeText')}
              style={composeStyle(
                {
                  fontFamily: Q80_FONT_SANS,
                  fontSize: 'clamp(12px, 1.15cqi, 16px)',
                  lineHeight: 1.5,
                  color: 'rgba(255,255,255,.92)',
                  maxWidth: 400,
                  marginTop: 'clamp(12px, 2cqi, 28px)',
                },
                styleOf('homeText')
              )}
            >
              {content.homeText}
            </p>
            <div
              data-element-key='homePrice'
              className={selectableClass(activeKey === 'homePrice')}
              style={composeStyle(
                {
                  fontFamily: Q80_FONT_SANS,
                  fontSize: 'clamp(12px, 1.15cqi, 16px)',
                  color: 'rgba(255,255,255,.92)',
                  marginTop: 'clamp(12px, 2cqi, 26px)',
                },
                styleOf('homePrice')
              )}
            >
              {content.homePrice}
            </div>
          </div>
        </div>

        {/* ── Contact (cuối journey) ── */}
        <div
          ref={contactRef}
          className='absolute inset-0 z-[4] flex items-center justify-center'
          style={{ opacity: 0, pointerEvents: 'none' }}
        >
          <div
            className='text-center'
            style={{
              background: '#ffffff',
              padding: 'clamp(28px, 4cqi, 56px) clamp(28px, 5cqi, 72px)',
              width: 'min(86cqi, 448px)',
            }}
          >
            <div
              data-element-key='contactEyebrow'
              className={selectableClass(activeKey === 'contactEyebrow')}
              style={composeStyle(
                {
                  fontFamily: Q80_FONT_SANS,
                  fontWeight: 500,
                  fontSize: 'clamp(9px, .85cqi, 12px)',
                  letterSpacing: '.16em',
                  textTransform: 'uppercase',
                  color: Q80_GOLD,
                },
                styleOf('contactEyebrow')
              )}
            >
              {content.contactEyebrow}
            </div>
            <h2
              data-element-key='contactTitle'
              className={selectableClass(activeKey === 'contactTitle')}
              style={composeStyle(
                {
                  fontFamily: Q80_FONT_SERIF,
                  fontSize: 'clamp(26px, 3cqi, 44px)',
                  lineHeight: 1.18,
                  letterSpacing: '.18em',
                  textTransform: 'uppercase',
                  color: Q80_GOLD,
                  whiteSpace: 'pre-line',
                  marginTop: 'clamp(12px, 1.6cqi, 22px)',
                },
                styleOf('contactTitle')
              )}
            >
              {content.contactTitle}
            </h2>
            <hr
              style={{
                width: 56,
                margin: 'clamp(14px, 2cqi, 24px) auto',
                borderColor: `${Q80_GOLD}66`,
              }}
            />
            <p
              data-element-key='contactSubtitle'
              className={selectableClass(activeKey === 'contactSubtitle')}
              style={composeStyle(
                {
                  fontFamily: Q80_FONT_SANS,
                  fontSize: 'clamp(12px, 1.15cqi, 16px)',
                  lineHeight: 1.5,
                  color: '#4c4a45',
                },
                styleOf('contactSubtitle')
              )}
            >
              {content.contactSubtitle}
            </p>
            <div
              style={{
                fontFamily: Q80_FONT_SANS,
                fontWeight: 500,
                fontSize: 'clamp(9px, .85cqi, 12px)',
                letterSpacing: '.16em',
                textTransform: 'uppercase',
                color: '#6b675f',
                marginTop: 'clamp(16px, 2.4cqi, 30px)',
              }}
            >
              Email
            </div>
            <a
              data-element-key='email'
              href={`mailto:${content.email}`}
              className={selectableClass(activeKey === 'email') + ' q80-uline'}
              style={composeStyle(
                {
                  fontFamily: Q80_FONT_SERIF,
                  fontSize: 'clamp(15px, 1.5cqi, 20px)',
                  color: '#4c4a45',
                  display: 'inline-block',
                  marginTop: 6,
                },
                styleOf('email')
              )}
            >
              {content.email}
            </a>
            <div
              style={{
                fontFamily: Q80_FONT_SANS,
                fontWeight: 500,
                fontSize: 'clamp(9px, .85cqi, 12px)',
                letterSpacing: '.16em',
                textTransform: 'uppercase',
                color: '#6b675f',
                marginTop: 'clamp(14px, 2cqi, 24px)',
              }}
            >
              Phone
            </div>
            <a
              data-element-key='phone'
              href={`tel:${content.phone}`}
              className={selectableClass(activeKey === 'phone') + ' q80-uline'}
              style={composeStyle(
                {
                  fontFamily: Q80_FONT_SERIF,
                  fontSize: 'clamp(15px, 1.5cqi, 20px)',
                  color: '#4c4a45',
                  display: 'inline-block',
                  marginTop: 6,
                },
                styleOf('phone')
              )}
            >
              {content.phone}
            </a>
          </div>
        </div>

        {/* ── Card "0X | TITLE | +" góc phải dưới ── */}
        <button
          type='button'
          className='q80-no-hold q80-fade absolute z-[5] flex items-center text-left'
          onClick={() => setDrawer(slideIndex < 0 ? 'overview' : slideIndex)}
          style={{
            right: 'clamp(12px, 1.5cqi, 20px)',
            bottom: 'clamp(46px, 6cqi, 64px)',
            background: '#ffffff',
            padding: 'clamp(16px, 2cqi, 26px) clamp(16px, 2cqi, 24px)',
            gap: 'clamp(12px, 1.6cqi, 22px)',
            minWidth: 'min(64cqi, 340px)',
            opacity: entered && !inContact ? 1 : 0,
            pointerEvents: entered && !inContact ? 'auto' : 'none',
          }}
        >
          <span
            ref={cardNumRef}
            style={{
              fontFamily: Q80_FONT_SERIF,
              fontSize: 'clamp(22px, 2.2cqi, 32px)',
              color: '#4c4a45',
            }}
          >
            {cardNo}
          </span>
          <span
            style={{
              width: 1,
              alignSelf: 'stretch',
              background: `${Q80_GOLD}44`,
            }}
          />
          <span
            className='flex-1'
            style={{
              fontFamily: Q80_FONT_SANS,
              fontWeight: 500,
              fontSize: 'clamp(11px, 1cqi, 14px)',
              letterSpacing: '.12em',
              textTransform: 'uppercase',
              color: '#4c4a45',
            }}
          >
            {cardTitle}
          </span>
          <span
            className='inline-flex items-center justify-center'
            style={{
              width: 34,
              height: 34,
              borderRadius: 3,
              border: `1px solid ${Q80_GOLD}66`,
              color: Q80_GOLD,
              fontSize: 18,
              lineHeight: 1,
            }}
          >
            +
          </span>
        </button>

        {/* ── Dots nav phải ── */}
        <div
          className='q80-fade absolute top-1/2 right-[14px] z-[5] flex -translate-y-1/2 flex-col items-center'
          style={{
            gap: 18,
            opacity: entered ? 1 : 0,
          }}
        >
          {Array.from({ length: totalDots }).map((_, i) => {
            const active =
              i === Math.min(slideIndex + 1, totalDots - 1) ||
              (i === totalDots - 1 && inContact);
            const targets = ['home', ...suites.map(s => s.slug), 'contact'];
            return (
              <button
                key={i}
                type='button'
                aria-label={`slide ${i + 1}`}
                className='q80-no-hold relative'
                onClick={() =>
                  window.dispatchEvent(
                    new CustomEvent('q80:goto', {
                      detail: { target: targets[i] },
                    })
                  )
                }
                style={{
                  width: 4,
                  height: 4,
                  borderRadius: 999,
                  background: '#ffffff',
                  boxShadow: active
                    ? '0 0 0 5px rgba(255,255,255,0), 0 0 0 1px #ffffff'
                    : 'none',
                  outline: active ? '1px solid #ffffff' : 'none',
                  outlineOffset: 5,
                  opacity: active ? 1 : 0.7,
                }}
              />
            );
          })}
        </div>

        {/* ── Scroll hint + sound ── */}
        <div
          className='q80-fade absolute bottom-[25px] left-1/2 z-[5] -translate-x-1/2'
          style={{
            fontFamily: Q80_FONT_SANS,
            fontWeight: 500,
            fontSize: 'clamp(9px, .8cqi, 11px)',
            letterSpacing: '.2em',
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,.75)',
            opacity: entered && !inContact ? 1 : 0,
          }}
        >
          <span
            data-element-key='scrollLabel'
            className={selectableClass(activeKey === 'scrollLabel')}
            style={styleOf('scrollLabel')}
          >
            {content.scrollLabel}
          </span>
        </div>
        <button
          type='button'
          className='q80-no-hold absolute bottom-[18px] left-[18px] z-[5] flex items-center gap-2'
          onClick={() => setSoundOn(v => !v)}
          style={{
            fontFamily: Q80_FONT_SANS,
            fontWeight: 500,
            fontSize: 'clamp(9px, .8cqi, 11px)',
            letterSpacing: '.14em',
            textTransform: 'uppercase',
            color: '#ffffff',
          }}
        >
          <span
            className='inline-flex items-center justify-center'
            style={{
              width: 26,
              height: 26,
              borderRadius: 4,
              border: '1px solid rgba(255,255,255,.5)',
              fontSize: 11,
            }}
          >
            {soundOn ? '❚❚' : '…'}
          </span>
          {content.soundLabel}
        </button>

        {/* ── Cursor "Press & Hold / See the view" (chỉ /p) ── */}
        {isPublic ? (
          <div
            ref={cursorRef}
            className='pointer-events-none absolute top-0 left-0 z-[6]'
            style={{ opacity: 0, transition: 'opacity .3s ease' }}
          >
            <div
              className='relative'
              style={{ transform: 'translate(-30px, -30px)' }}
            >
              <svg
                width='60'
                height='60'
                viewBox='0 0 64 64'
                fill='none'
                style={{
                  animation: 'q80-cursor-pulse 2.4s ease-in-out infinite',
                }}
              >
                <circle
                  cx='32'
                  cy='32'
                  r='31'
                  stroke='rgba(255,255,255,.9)'
                  strokeWidth='1.5'
                />
                <circle cx='32' cy='32' r='2.4' fill='#ffffff' />
              </svg>
              <div
                className='absolute top-1/2 left-full -translate-y-1/2 whitespace-nowrap'
                style={{
                  paddingLeft: 10,
                  fontFamily: Q80_FONT_SANS,
                  fontSize: 13,
                  color: '#ffffff',
                  textShadow: '0 1px 6px rgba(0,0,0,.25)',
                }}
              >
                <div>{content.pressHoldLabel}</div>
                <div style={{ opacity: 0.8 }}>{content.seeViewLabel}</div>
              </div>
            </div>
          </div>
        ) : null}

        {/* ── GATE intro (chỉ /p; editor bỏ qua) ── */}
        {isPublic ? (
          <div
            ref={gateRef}
            className='absolute inset-0 z-[8] flex flex-col items-center justify-center text-center'
            style={{ background: '#ffffff', color: Q80_GOLD }}
          >
            <div
              style={{
                fontFamily: Q80_FONT_SERIF,
                fontSize: 'clamp(12px, 1.1cqi, 15px)',
                letterSpacing: '.18em',
                lineHeight: 1.4,
              }}
            >
              {Q80_LOGO_LINES.map(l => (
                <div key={l}>{l}</div>
              ))}
            </div>
            <h2
              style={{
                fontFamily: Q80_FONT_SERIF,
                fontSize: 'clamp(40px, 8cqi, 110px)',
                lineHeight: 1.0,
                textTransform: 'uppercase',
                letterSpacing: '.05em',
                whiteSpace: 'pre-line',
                marginTop: 'clamp(16px, 3cqi, 40px)',
              }}
            >
              {content.introTitle}
            </h2>
            <p
              style={{
                fontFamily: Q80_FONT_SANS,
                fontSize: 'clamp(12px, 1.2cqi, 16px)',
                lineHeight: 1.6,
                maxWidth: 'min(84cqi, 520px)',
                marginTop: 'clamp(14px, 2.4cqi, 28px)',
                color: '#5d574b',
              }}
            >
              {content.introText}
            </p>
            <button
              type='button'
              onClick={() => enter(true)}
              disabled={!ready}
              style={{
                fontFamily: Q80_FONT_SANS,
                fontWeight: 500,
                fontSize: 'clamp(11px, 1.05cqi, 14px)',
                letterSpacing: '.2em',
                textTransform: 'uppercase',
                marginTop: 'clamp(20px, 3.4cqi, 44px)',
                borderBottom: `2px double ${Q80_GOLD}`,
                paddingBottom: 5,
                opacity: ready ? 1 : 0.4,
                transition: 'opacity .4s ease',
              }}
            >
              {content.enterLabel}
            </button>
            <button
              type='button'
              onClick={() => enter(false)}
              disabled={!ready}
              style={{
                fontFamily: Q80_FONT_SANS,
                fontSize: 'clamp(11px, 1cqi, 14px)',
                marginTop: 'clamp(10px, 1.6cqi, 18px)',
                textDecoration: 'underline',
                color: '#5d574b',
                opacity: ready ? 1 : 0.4,
                transition: 'opacity .4s ease',
              }}
            >
              {content.enterNoSoundLabel}
            </button>
            {/* loader — dán sát đáy như gốc (line full-width + % phía trên);
                pointer-events-none để không chặn click nút enter phía trên. */}
            <div
              className='pointer-events-none absolute inset-x-0'
              style={{ bottom: 'clamp(10px, 1.6cqi, 20px)' }}
            >
              <div
                ref={loadPctRef}
                style={{
                  fontFamily: Q80_FONT_SERIF,
                  fontSize: 'clamp(14px, 1.4cqi, 19px)',
                  textAlign: 'center',
                }}
              >
                0%
              </div>
              <hr
                ref={loadLineRef}
                style={{
                  width: '100%',
                  borderColor: `${Q80_GOLD}55`,
                  transform: 'scaleX(0)',
                  transformOrigin: 'left',
                  transition: 'transform .4s ease',
                  marginTop: 8,
                }}
              />
              <div
                style={{
                  fontFamily: Q80_FONT_SANS,
                  fontWeight: 500,
                  fontSize: 'clamp(9px, .8cqi, 11px)',
                  letterSpacing: '.2em',
                  textTransform: 'uppercase',
                  textAlign: 'center',
                  marginTop: 10,
                }}
              >
                {content.loadingLabel}
              </div>
            </div>
          </div>
        ) : null}

        {/* ── Drawer chi tiết suite / overview ── */}
        <aside
          className='q80-drawer absolute inset-y-0 right-0 z-[9] flex flex-col'
          style={{
            width: 'min(92cqi, 505px)',
            background: '#ffffff',
            transform: drawer !== null ? 'translateX(0)' : 'translateX(105%)',
            boxShadow: drawer !== null ? '0 0 60px rgba(0,0,0,.25)' : 'none',
            margin: 'clamp(8px, 1cqi, 16px)',
            height: 'calc(100% - clamp(16px, 2cqi, 32px))',
          }}
        >
          <header
            className='flex items-center justify-between'
            style={{
              padding: '0 clamp(16px, 2cqi, 24px)',
              minHeight: 58,
              borderBottom: `1px solid ${Q80_GOLD}33`,
            }}
          >
            <div
              style={{
                fontFamily: Q80_FONT_SANS,
                fontWeight: 500,
                fontSize: 12,
                letterSpacing: '.14em',
                textTransform: 'uppercase',
                color: Q80_GOLD,
              }}
            >
              {drawer === 'overview'
                ? content.homeEyebrow
                : drawerSuite
                  ? drawerSuite.floorDisplay
                  : ''}
            </div>
            <button
              type='button'
              aria-label='close'
              onClick={() => setDrawer(null)}
              className='inline-flex items-center justify-center'
              style={{
                width: 34,
                height: 34,
                borderRadius: 3,
                border: `1px solid ${Q80_GOLD}66`,
                color: Q80_GOLD,
                fontSize: 14,
              }}
            >
              ✕
            </button>
          </header>
          <div
            className='flex-1 overflow-y-auto'
            style={{
              padding: 'clamp(20px, 3cqi, 40px) clamp(16px, 2.6cqi, 36px)',
            }}
          >
            <h3
              style={{
                fontFamily: Q80_FONT_SERIF,
                fontSize: 'clamp(30px, 3.4cqi, 46px)',
                color: '#37342e',
                lineHeight: 1.08,
              }}
            >
              {drawer === 'overview'
                ? content.overviewTitle
                : (drawerSuite?.title ?? '')}
            </h3>
            {(
              drawer === 'overview'
                ? content.overviewThumbUrl
                : drawerSuite?.thumbnailUrl
            ) ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={
                  drawer === 'overview'
                    ? content.overviewThumbUrl
                    : drawerSuite?.thumbnailUrl
                }
                alt=''
                className='w-full'
                style={{
                  marginTop: 'clamp(14px, 2cqi, 24px)',
                  aspectRatio: '16 / 10',
                  objectFit: 'cover',
                }}
              />
            ) : null}
            <div
              style={{
                fontFamily: Q80_FONT_SANS,
                fontSize: 'clamp(13px, 1.2cqi, 16px)',
                lineHeight: 1.6,
                color: '#4c4a45',
                marginTop: 'clamp(14px, 2cqi, 24px)',
                whiteSpace: 'pre-line',
              }}
            >
              {drawer === 'overview'
                ? content.overviewDesc
                : (drawerSuite?.desc ?? '')}
            </div>
            <button
              type='button'
              className='flex w-full items-center justify-between'
              onClick={() => {
                setPlansFloor(typeof drawer === 'number' ? drawer : 0);
                setPlansOpen(true);
              }}
              style={{
                marginTop: 'clamp(18px, 2.6cqi, 32px)',
                border: `1px solid ${Q80_GOLD}55`,
                padding: '14px 18px',
                fontFamily: Q80_FONT_SANS,
                fontWeight: 500,
                fontSize: 12,
                letterSpacing: '.16em',
                textTransform: 'uppercase',
                color: '#4c4a45',
              }}
            >
              {content.floorplansLabel}
              <span aria-hidden>→</span>
            </button>
          </div>
        </aside>

        {/* ── Overlay floorplans ── */}
        <aside
          className='q80-plans absolute inset-0 z-[10] flex flex-col'
          style={{
            background: '#ffffff',
            transform: plansOpen ? 'translateY(0)' : 'translateY(-104%)',
          }}
        >
          <header
            className='flex items-center justify-between'
            style={{
              padding: '0 clamp(16px, 2cqi, 24px)',
              minHeight: 58,
              borderBottom: `1px solid ${Q80_GOLD}33`,
            }}
          >
            <div
              style={{
                fontFamily: Q80_FONT_SANS,
                fontWeight: 500,
                fontSize: 12,
                letterSpacing: '.14em',
                textTransform: 'uppercase',
                color: Q80_GOLD,
              }}
            >
              {content.homeEyebrow}
            </div>
            <button
              type='button'
              aria-label='close'
              onClick={() => setPlansOpen(false)}
              className='inline-flex items-center justify-center'
              style={{
                width: 34,
                height: 34,
                borderRadius: 3,
                border: `1px solid ${Q80_GOLD}66`,
                color: Q80_GOLD,
                fontSize: 14,
              }}
            >
              ✕
            </button>
          </header>
          <div className='flex flex-1 flex-col overflow-hidden @2xl:flex-row'>
            <div
              className='flex-1 overflow-y-auto'
              style={{ padding: 'clamp(16px, 2.4cqi, 34px)' }}
            >
              <div className='flex flex-wrap' style={{ gap: 8 }}>
                {suites.map((s, i) => (
                  <button
                    key={s.slug}
                    type='button'
                    onClick={() => setPlansFloor(i)}
                    style={{
                      fontFamily: Q80_FONT_SANS,
                      fontWeight: 500,
                      fontSize: 11,
                      letterSpacing: '.12em',
                      textTransform: 'uppercase',
                      padding: '8px 12px',
                      border: `1px solid ${Q80_GOLD}${plansFloor === i ? '' : '44'}`,
                      background: plansFloor === i ? Q80_GOLD : 'transparent',
                      color: plansFloor === i ? '#ffffff' : '#4c4a45',
                    }}
                  >
                    {s.floorDisplay}
                  </button>
                ))}
              </div>
              {suites[plansFloor]?.floorplanUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={suites[plansFloor].floorplanUrl}
                  alt={suites[plansFloor].title}
                  className='w-full'
                  style={{
                    marginTop: 18,
                    objectFit: 'contain',
                    maxHeight: '58vh',
                  }}
                />
              ) : null}
              <div
                className='flex flex-wrap'
                style={{ gap: 14, marginTop: 14 }}
              >
                {suites[plansFloor]?.floorplanPdfUrl ? (
                  <a
                    href={suites[plansFloor].floorplanPdfUrl}
                    target='_blank'
                    rel='noreferrer'
                    className='q80-uline'
                    style={{
                      fontFamily: Q80_FONT_SANS,
                      fontWeight: 500,
                      fontSize: 12,
                      letterSpacing: '.14em',
                      textTransform: 'uppercase',
                      color: Q80_GOLD,
                    }}
                  >
                    PDF — {suites[plansFloor].floorDisplay}
                  </a>
                ) : null}
                {content.overviewFloorplanPdfUrl ? (
                  <a
                    href={content.overviewFloorplanPdfUrl}
                    target='_blank'
                    rel='noreferrer'
                    className='q80-uline'
                    style={{
                      fontFamily: Q80_FONT_SANS,
                      fontWeight: 500,
                      fontSize: 12,
                      letterSpacing: '.14em',
                      textTransform: 'uppercase',
                      color: Q80_GOLD,
                    }}
                  >
                    PDF — {content.overviewLabel}
                  </a>
                ) : null}
              </div>
            </div>
            <div
              className='overflow-y-auto @2xl:w-[340px]'
              style={{
                padding: 'clamp(16px, 2.4cqi, 34px)',
                borderTop: `1px solid ${Q80_GOLD}22`,
              }}
            >
              <h4
                style={{
                  fontFamily: Q80_FONT_SERIF,
                  fontSize: 'clamp(20px, 2cqi, 28px)',
                  color: '#37342e',
                }}
              >
                {suites[plansFloor]?.title ?? content.overviewLabel}
              </h4>
              <dl style={{ marginTop: 14 }}>
                {(content.infoItems ?? []).map(it => (
                  <div
                    key={it.title}
                    className='flex items-baseline justify-between'
                    style={{
                      padding: '10px 0',
                      borderBottom: `1px solid ${Q80_GOLD}22`,
                    }}
                  >
                    <dt
                      style={{
                        fontFamily: Q80_FONT_SANS,
                        fontWeight: 500,
                        fontSize: 10,
                        letterSpacing: '.14em',
                        textTransform: 'uppercase',
                        color: '#8a857a',
                      }}
                    >
                      {it.title}
                    </dt>
                    <dd
                      style={{
                        fontFamily: Q80_FONT_SANS,
                        fontSize: 13,
                        color: '#37342e',
                      }}
                    >
                      {it.text}
                    </dd>
                  </div>
                ))}
              </dl>
              <div
                style={{
                  fontFamily: Q80_FONT_SANS,
                  fontWeight: 500,
                  fontSize: 10,
                  letterSpacing: '.14em',
                  textTransform: 'uppercase',
                  color: '#8a857a',
                  marginTop: 18,
                }}
              >
                Features
              </div>
              <ul style={{ marginTop: 8 }}>
                {(content.features ?? []).map(f => (
                  <li
                    key={f}
                    style={{
                      fontFamily: Q80_FONT_SANS,
                      fontSize: 13,
                      lineHeight: 1.7,
                      color: '#4c4a45',
                    }}
                  >
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </aside>

        {/* ── Overlay "see the view" (press & hold) ── */}
        <aside
          className='q80-view absolute inset-0 z-[11] flex flex-col'
          style={{
            background: '#ffffff',
            opacity: viewOpen ? 1 : 0,
            pointerEvents: viewOpen ? 'auto' : 'none',
          }}
        >
          <header
            className='flex items-center justify-between'
            style={{
              padding: '0 clamp(16px, 2cqi, 24px)',
              minHeight: 58,
            }}
          >
            <div
              style={{
                fontFamily: Q80_FONT_SANS,
                fontWeight: 500,
                fontSize: 12,
                letterSpacing: '.14em',
                textTransform: 'uppercase',
                color: Q80_GOLD,
              }}
            >
              <span
                data-element-key='homeViewVideoLabel'
                className={selectableClass(activeKey === 'homeViewVideoLabel')}
                style={styleOf('homeViewVideoLabel')}
              >
                {content.homeViewVideoLabel}
              </span>
            </div>
            <button
              type='button'
              aria-label='close'
              onClick={() => setViewOpen(false)}
              className='inline-flex items-center justify-center'
              style={{
                width: 34,
                height: 34,
                borderRadius: 3,
                border: `1px solid ${Q80_GOLD}66`,
                color: Q80_GOLD,
                fontSize: 14,
              }}
            >
              ✕
            </button>
          </header>
          {viewOpen && viewVideo ? (
            <video
              src={viewVideo}
              className='min-h-0 w-full flex-1'
              style={{ objectFit: 'cover' }}
              autoPlay
              muted
              loop
              playsInline
            />
          ) : viewOpen && activeSuite ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={activeSuite.imageUrl}
              alt=''
              className='min-h-0 w-full flex-1'
              style={{ objectFit: 'cover' }}
            />
          ) : null}
        </aside>
      </div>
    </section>
  );
}
