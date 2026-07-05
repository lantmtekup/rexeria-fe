'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import { FRAME_COUNT, HERO_SECTIONS, HERO_TAGLINE } from '../app/site';

/**
 * Hero scrollytelling — mirror inline block 1 của gốc.
 *
 * Cấu trúc timeline (scrub 0.5, pin +=6800px, ease none):
 *  - canvas 240 frame cover-draw; counter.frame 0->239 duration 8 tại t=0
 *  - tagline (.titles h2) y:-100 duration 0.25 tại t=0
 *  - mỗi section i (0..4):
 *      h2 vào  y:150->0 opacity 0->1 dur 0.5 tại 0.5 + 1.5*i
 *      nhích   y:-30            dur 0.5 tại 1   + 1.5*i
 *      thoát   y:-150 opacity 0 dur 0.5 tại 1.5 + 1.5*i
 *    ("more" submenu chạy song song cùng offset)
 *
 * Frame path: /frames/fr_001.jpg ... fr_240.jpg (1-indexed).
 */
export function HeroScrollytelling() {
  const wrap = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const titlesRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);
  const moreRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const canvas = canvasRef.current;
    const trigger = wrap.current;
    if (!canvas || !trigger) return;

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    let viewW = 0;
    let viewH = 0;
    let dpr = 1;
    let lastFrame = -1;

    // Preload 240 frame.
    const images: HTMLImageElement[] = [];
    for (let i = 1; i <= FRAME_COUNT; i++) {
      const img = new Image();
      img.src = `/frames/fr_${String(i).padStart(3, '0')}.jpg`;
      images.push(img);
    }

    const counter = { frame: 0 };

    function drawFrame(i: number) {
      const img = images[Math.max(0, Math.min(FRAME_COUNT - 1, i))];
      if (!img || !img.complete || !viewW || !viewH) return;
      ctx!.clearRect(0, 0, viewW, viewH);
      const iw = img.naturalWidth || img.width;
      const ih = img.naturalHeight || img.height;
      const scale = Math.max(viewW / iw, viewH / ih); // cover
      const w = iw * scale;
      const h = ih * scale;
      ctx!.drawImage(img, (viewW - w) / 2, (viewH - h) / 2, w, h);
    }

    function render() {
      const f = Math.round(counter.frame);
      if (f === lastFrame) return;
      lastFrame = f;
      drawFrame(f);
    }

    function resizeCanvas() {
      const r = canvas!.getBoundingClientRect();
      dpr = window.devicePixelRatio || 1;
      viewW = r.width;
      viewH = r.height;
      canvas!.width = Math.round(viewW * dpr);
      canvas!.height = Math.round(viewH * dpr);
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      lastFrame = -1;
      drawFrame(counter.frame | 0);
    }

    images[0].onload = () => {
      resizeCanvas();
      drawFrame(0);
      setReady(true);
    };
    // Nếu frame 0 đã cache (onload không bắn), vẫn init.
    if (images[0].complete) {
      resizeCanvas();
      drawFrame(0);
      setReady(true);
    }

    const isTouch = ScrollTrigger.isTouch === 1;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger,
        start: 'top top',
        end: isTouch ? '+=4500px' : '+=6800px',
        pin: true,
        scrub: 0.5,
      },
    });

    tl.to(
      counter,
      { frame: FRAME_COUNT - 1, duration: 8, ease: 'none', onUpdate: render },
      0
    );

    if (titlesRef.current) {
      // Gốc chỉ y:-100; thêm fade để tagline không chồng lên section title
      // đầu tiên (fabrics vào tại t=0.5). Deviation nhỏ, có chủ đích.
      tl.to(titlesRef.current, { y: -100, duration: 0.25 }, 0).to(
        titlesRef.current,
        { opacity: 0, duration: 0.35 },
        0.15
      );
    }

    HERO_SECTIONS.forEach((_, ind) => {
      const el = sectionRefs.current[ind];
      const more = moreRefs.current[ind];
      const at = 0.5 + 1.5 * ind;
      if (el) {
        tl.to(el, { y: 0, opacity: 1, duration: 0.5 }, at)
          .to(el, { y: -30, duration: 0.5 }, 1 + 1.5 * ind)
          .to(el, { y: -150, opacity: 0, duration: 0.5 }, 1.5 + 1.5 * ind);
      }
      if (more) {
        tl.to(more, { y: 0, opacity: 1, duration: 0.5 }, at)
          .to(more, { y: -30, duration: 0.5 }, 1 + 1.5 * ind)
          .to(more, { y: -150, opacity: 0, duration: 0.5 }, 1.5 + 1.5 * ind);
      }
    });

    window.addEventListener('resize', resizeCanvas, { passive: true });
    ScrollTrigger.refresh();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      tl.scrollTrigger?.kill();
      tl.kill();
    };
  }, []);

  return (
    <section
      ref={wrap}
      className='mainImg-home relative h-screen w-full overflow-hidden'
    >
      <canvas
        ref={canvasRef}
        className='absolute inset-0 h-full w-full transition-opacity duration-500'
        style={{ opacity: ready ? 1 : 0 }}
      />

      {/* Tagline mở đầu */}
      <div
        ref={titlesRef}
        className='titles pointer-events-none absolute inset-x-0 bottom-[14vh] z-10 flex flex-col items-center px-6 text-center'
      >
        <h2 className='text-3xl leading-[1.05] font-semibold text-[var(--grey)] md:text-6xl'>
          <span className='dot'>{HERO_TAGLINE.line1.replace('.', '')}</span>
          <br />
          <span className='dot'>{HERO_TAGLINE.line2.replace('.', '')}</span>
        </h2>
        <p className='mt-4 max-w-md text-sm text-[var(--grey)]/70 md:text-base'>
          {HERO_TAGLINE.sub}
        </p>
        <span className='mt-8 text-[11px] tracking-[0.3em] text-[var(--grey)]/50 uppercase'>
          Scroll
        </span>
      </div>

      {/* Section titles cycle — mỗi cái tuyệt đối giữa màn, opacity 0 ban đầu */}
      {HERO_SECTIONS.map((s, i) => (
        <div
          key={s.key}
          className='pointer-events-none absolute inset-0 z-20 flex flex-col items-center justify-center px-6 text-center'
        >
          <div
            ref={el => {
              sectionRefs.current[i] = el;
            }}
            style={{ opacity: 0, transform: 'translateY(150px)' }}
          >
            <a
              href={s.href}
              className='dot pointer-events-auto text-5xl font-semibold text-[var(--grey)] lowercase transition-colors hover:text-[var(--yellow)] md:text-8xl'
            >
              {s.title}
            </a>
          </div>
          <div
            ref={el => {
              moreRefs.current[i] = el;
            }}
            className='mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-1'
            style={{ opacity: 0, transform: 'translateY(150px)' }}
          >
            {s.more.map(m => (
              <a
                key={m.label}
                href={m.href}
                className='pointer-events-auto text-xs font-semibold tracking-[0.14em] text-[var(--yellow)] uppercase hover:text-[var(--grey)]'
              >
                {m.label}
              </a>
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}
