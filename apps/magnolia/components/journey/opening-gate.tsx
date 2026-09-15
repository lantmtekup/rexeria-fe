'use client';
import Image from 'next/image';
import { useCallback, useEffect, useLayoutEffect, useRef } from 'react';
import { useReducedMotion } from 'framer-motion';
import { gsap, ScrollTrigger } from '@/lib/journey/motion';
import { useLocale } from '@/components/shared/locale-provider';
import { useHeroFrames } from '@/components/shared/hero-frames';
import { lockScroll, unlockScroll } from '@/lib/scroll-control';

/**
 * NHỊP MỞ MÀN — cơ chế hero của brunellocucinelli, vật liệu của Magnolia.
 *
 * Trang mẫu: một tấm khắc có ô khoét trong suốt đứng chắn toàn màn; chữ hiện
 * từng ký tự trong lúc cuộn bị khoá; rồi camera phóng xuyên qua ô vào cảnh
 * phía sau, tấm mờ hẳn, và một pill "Scroll to explore" trượt lên.
 *
 * Ở đây cảnh phía sau ô KHÔNG phải một dải tranh — nó là chính bộ 286 frame
 * phim của Magnolia. Camera phóng xuyên vòm *vào trong phim*: giữ được cả cơ
 * chế của trang mẫu lẫn đoạn phim, thay vì phải chọn một trong hai.
 *
 * HAI CAMERA, KHÔNG PHẢI MỘT — đây là chỗ quyết định nó có đọc ra "đi xuyên
 * qua" hay không. Tấm vòm phóng 1 → 1.93; phim sau ô chỉ 1 → 1.28. Vật ở xa
 * phải giãn chậm hơn vật ở gần, nếu cả hai cùng một tỉ lệ thì mắt đọc ra "cả
 * bức ảnh đang to lên", không phải "mình đang tiến tới".
 *
 * Tâm ô vòm nằm ở 50.0% / 39.05% chiều tấm (đo bằng flood-fill vùng đen:
 * x 401–1269, y 71–664 trong 1672×941). Tấm phải được dịch sao cho tâm ô rơi
 * đúng tâm màn TRƯỚC khi scale, nếu không camera phóng vào một điểm lệch và ô
 * trượt khỏi khung. Nên tấm không dùng `object-cover` — cover cắt theo khổ màn
 * làm tâm ô dịch theo và không tính được.
 *
 * NGÂN SÁCH CUỘN (đơn vị: chiều cao màn), theo trang mẫu:
 *   0 → 1.8   phóng xuyên vòm; tấm mờ trong 33% cuối đoạn này;
 *   → 4.3     phim chạy tiếp toàn màn khi tấm đã tan.
 * Phim scrub suốt cả 4.3 màn, nên trong lúc còn nhìn qua ô nó đã chuyển động.
 */
const PLATE = { w: 1672, h: 941, holeX: 0.5, holeY: 0.3905 };
/**
 * Bề rộng tối thiểu để tấm phủ kín màn SAU KHI ĐÃ DỊCH.
 *
 * Tôi tính thiếu một ràng buộc ở bản đầu và dùng `177.68vh` — đúng bằng
 * ASPECT × 100vh, tức chỉ đủ phủ màn khi tấm KHÔNG dịch. Nhưng tấm phải dịch
 * để tâm ô rơi vào tâm màn, nên phần tấm nằm TRÊN tâm ô (39.05% chiều cao
 * tấm) mới là phần phải phủ nửa màn trên:
 *
 *   0.3905 × H_tấm ≥ 0.5 × H_màn   →   H_tấm ≥ 1.2804 × H_màn
 *   0.6095 × H_tấm ≥ 0.5 × H_màn   →   H_tấm ≥ 0.8203 × H_màn   (lỏng hơn)
 *
 * Ràng buộc trên gắt hơn, nên W_tấm ≥ 1.2804 × 1.7768 × 100vh = 227.5vh.
 * Thiếu 50vh là lý do có dải đen ở mép trên khung đầu của nhịp mở màn và ở
 * mép dưới cảnh kết.
 */
const PLATE_MIN_W = `max(100vw, 228vh)`;

const TOTAL = 4.3; // chiều cao section, tính bằng màn
const GATE = 1.8; // đoạn phóng xuyên vòm
const GATE_END = GATE / TOTAL; // ≈ 0.419 của timeline
const PLATE_FADE_AT = GATE_END * 0.67;

const PLATE_ZOOM = 1.93;
const FILM_ZOOM = 1.28;

/** Ảnh đứng thay phim trước khi frame đầu được vẽ. */
const POSTER =
  '/images/assets/hero/2cb5cde9e63f1f02d524186966868fc771df1cc8.webp';

const MAX_DPR = 2;

function drawCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  cw: number,
  ch: number
) {
  const s = Math.max(cw / img.naturalWidth, ch / img.naturalHeight);
  const dw = img.naturalWidth * s;
  const dh = img.naturalHeight * s;
  ctx.drawImage(img, (cw - dw) / 2, (ch - dh) / 2, dw, dh);
}

export function OpeningGate() {
  const { t } = useLocale();
  const reduced = useReducedMotion() ?? false;
  const { framesRef, done } = useHeroFrames();

  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const state = useRef({ progress: 0 });
  const lastDrawn = useRef(-1);

  const draw = useCallback(
    (progress: number, force = false) => {
      const canvas = canvasRef.current;
      const frames = framesRef.current;
      if (!canvas || frames.length === 0) return;
      const wanted = Math.round(
        gsap.utils.clamp(0, 1, progress) * (frames.length - 1)
      );
      // Frame lỗi thì lùi về frame gần nhất đã có, không bỏ trống khung.
      let index = wanted;
      while (index > 0 && !frames[index]) index -= 1;
      const img = frames[index];
      if (!img) return;
      if (!force && index === lastDrawn.current) return;
      const ctx = canvas.getContext('2d', { alpha: false });
      if (!ctx) return;
      lastDrawn.current = index;
      drawCover(ctx, img, canvas.width, canvas.height);
    },
    [framesRef]
  );

  // Canvas theo hộp của nó × DPR.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || reduced) return;
    const resize = () => {
      const dpr = Math.min(MAX_DPR, window.devicePixelRatio || 1);
      const r = canvas.getBoundingClientRect();
      canvas.width = Math.round(r.width * dpr);
      canvas.height = Math.round(r.height * dpr);
      draw(state.current.progress, true);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    return () => ro.disconnect();
  }, [draw, reduced]);

  // Frame đầu vừa có thì vẽ ngay, không đợi lần cuộn đầu tiên.
  useEffect(() => {
    if (done) draw(state.current.progress, true);
  }, [done, draw]);

  // ── Nhịp chữ: từng ký tự, cuộn bị khoá trong lúc đó ─────────────────
  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section || !done) return;
    // Reload ở giữa trang thì không diễn lại nhịp mở màn.
    if (window.scrollY > 4) {
      gsap.set(section.querySelectorAll('[data-char]'), { autoAlpha: 1 });
      gsap.set(section.querySelector('[data-scroll-cue]'), {
        autoAlpha: 1,
        yPercent: 0,
      });
      return;
    }

    const chars = section.querySelectorAll('[data-char]');
    const cue = section.querySelector('[data-scroll-cue]');
    const brand = section.querySelector('[data-brand]');

    if (reduced) {
      gsap.set([chars, cue, brand], { autoAlpha: 1, yPercent: 0 });
      return;
    }

    let released = false;
    const release = () => {
      if (released) return;
      released = true;
      unlockScroll();
    };

    lockScroll();
    // Chốt an toàn: dù timeline có lỗi gì thì cuộn cũng phải được mở lại.
    const guard = window.setTimeout(release, 6000);

    const tl = gsap.timeline({ onComplete: release });
    tl.fromTo(brand, { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.7, ease: 'power2.out' })
      .fromTo(
        chars,
        { autoAlpha: 0, yPercent: 40 },
        { autoAlpha: 1, yPercent: 0, duration: 0.5, ease: 'power3.out', stagger: 0.022 },
        0.25
      )
      .fromTo(
        cue,
        { autoAlpha: 0, yPercent: 120 },
        { autoAlpha: 1, yPercent: 0, duration: 0.6, ease: 'power3.out' },
        '>-0.15'
      );

    return () => {
      window.clearTimeout(guard);
      release();
      tl.kill();
    };
  }, [done, reduced]);

  // ── Nhịp cuộn: hai camera + phim ───────────────────────────────────
  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section || reduced) return;
    const plateCam = section.querySelector<HTMLElement>('[data-plate-cam]');
    const filmCam = section.querySelector<HTMLElement>('[data-film-cam]');
    const plate = section.querySelector<HTMLElement>('[data-plate]');
    const dim = section.querySelector<HTMLElement>('[data-film-dim]');
    const copy = section.querySelector<HTMLElement>('[data-copy]');
    if (!plateCam || !filmCam || !plate || !dim || !copy) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.6,
          invalidateOnRefresh: true,
          onUpdate: self => {
            state.current.progress = self.progress;
            draw(self.progress);
          },
        },
      });

      tl.fromTo(
        plateCam,
        { scale: 1 },
        { scale: PLATE_ZOOM, ease: `expoScale(1,${PLATE_ZOOM},none)`, duration: GATE_END },
        0
      );
      tl.fromTo(
        filmCam,
        { scale: 1 },
        { scale: FILM_ZOOM, ease: `expoScale(1,${FILM_ZOOM},none)`, duration: GATE_END },
        0
      );
      // Phim mờ đi khi còn nhìn qua ô, rõ hẳn khi tấm đã tan — như alpha 0.7
      // của cảnh sau lỗ cổng ở trang mẫu.
      // Lớp dim vừa là alpha 0.7 của cảnh sau lỗ cổng ở trang mẫu, vừa là thứ
      // giữ cho chữ đọc được trên một khung phim động. Nó phải còn dày cho tới
      // khi chữ rời đi, nên bắt đầu ở 0.52 và chỉ tan sau đó.
      tl.fromTo(dim, { opacity: 0.52 }, { opacity: 0, duration: GATE_END * 0.55 }, GATE_END * 0.45);
      tl.fromTo(plate, { opacity: 1 }, { opacity: 0, duration: GATE_END - PLATE_FADE_AT }, PLATE_FADE_AT);
      // Chữ rời đi trước khi tấm tan, để không đè lên phim.
      tl.to(copy, { autoAlpha: 0, y: -40, duration: PLATE_FADE_AT * 0.8 }, PLATE_FADE_AT * 0.2);
    }, section);

    return () => ctx.revert();
  }, [draw, reduced]);

  const stage = {
    width: PLATE_MIN_W,
    aspectRatio: `${PLATE.w} / ${PLATE.h}`,
    transform: `translate(${-PLATE.holeX * 100}%, ${-PLATE.holeY * 100}%)`,
  } as const;

  const tagline = t.heritage.taglines[0];

  return (
    <section
      id='opening'
      ref={sectionRef}
      aria-label={`${t.hero.brand} — ${t.hero.tagline}`}
      className='bg-charcoal-950 relative z-0'
      style={{ height: reduced ? '100svh' : `${TOTAL * 100}svh` }}
    >
      <div className='sticky top-0 h-svh w-full overflow-hidden'>
        {/* Phim — camera riêng, giãn chậm hơn tấm vòm. */}
        <div
          data-film-cam
          className='absolute inset-0 origin-center will-change-transform'
        >
          <Image
            src={POSTER}
            alt=''
            fill
            priority
            sizes='100vw'
            className='object-cover'
          />
          {!reduced && (
            <canvas ref={canvasRef} aria-hidden className='absolute inset-0 h-full w-full' />
          )}
          <div
            data-film-dim
            aria-hidden
            className='bg-charcoal-950 absolute inset-0'
          />
        </div>

        {/* Tấm vòm — lòng vòm alpha = 0 nên phim lộ ra qua đó. */}
        <div
          data-plate-cam
          className='absolute inset-0 origin-center will-change-transform'
        >
          <div data-plate className='absolute top-1/2 left-1/2' style={stage}>
            <Image
              src='/journey/gate/gate-plate.webp'
              alt=''
              fill
              priority
              sizes='100vw'
              className='object-fill'
            />
          </div>
        </div>

        {/* Chữ — hiện từng ký tự trong lúc cuộn bị khoá. */}
        <div
          data-copy
          className='pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center px-6 text-center'
        >
          <p
            data-brand
            className='font-display text-ivory/85 text-[clamp(1rem,1.5vw,1.4rem)]'
          >
            {t.hero.brand}
          </p>
          <h1 className='font-display text-ivory mt-5 max-w-[46rem] text-[clamp(2.1rem,5vw,4.6rem)] leading-[1.06] text-balance'>
            <span className='sr-only'>{tagline}</span>
            <span aria-hidden className='inline-block'>
              {tagline.split(' ').map((word, wi) => (
                <span key={`${word}-${wi}`} className='inline-block whitespace-nowrap'>
                  {word.split('').map((ch, ci) => (
                    <span
                      key={`${ch}-${ci}`}
                      data-char
                      className='inline-block will-change-transform'
                    >
                      {ch}
                    </span>
                  ))}
                  <span data-char className='inline-block'>
                    &nbsp;
                  </span>
                </span>
              ))}
            </span>
          </h1>
          <p
            data-scroll-cue
            className='border-champagne-400/35 text-champagne-50/80 tracking-luxe mt-14 rounded-full border px-5 py-2.5 text-[10.5px] uppercase'
          >
            {t.hero.scroll}
          </p>
        </div>
      </div>
    </section>
  );
}
