'use client';
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { gsap } from '@/lib/journey/motion';
import { useLocale } from '@/components/shared/locale-provider';
import {
  DETAIL_FADE,
  MAX_ZOOM,
  OVERVIEW,
  OVERVIEW_PREVIEW,
  PHASES,
  PHASE_COPY,
  WORLD,
  type PhaseId,
} from '@/lib/journey/day-canvas';

/**
 * Trình xem tranh kéo-zoom, có bookmark — bản tự dựng của Endless Paper WebXP.
 *
 * CAMERA. Giữ một điểm world ở tâm màn: `cam = {x, y, s}`. Lớp world nhận
 *   translate(W/2 − cam.x·s, H/2 − cam.y·s) scale(s)   với transform-origin 0 0
 * Zoom bằng con trỏ thì neo điểm world dưới con trỏ, không neo tâm màn —
 * neo tâm màn làm thứ người ta đang nhắm trượt ra khỏi khung.
 *
 * `s` kẹp trong [fit, fit × MAX_ZOOM] với `fit` = mức vừa khung. Camera kẹp
 * sao cho world luôn phủ kín khung khi đã zoom; ở mức vừa khung thì căn giữa.
 *
 * ĐỘ NÉT THEO TẦNG. Tranh tổng thể là nền; zoom qua `DETAIL_FADE.from` thì
 * ảnh render gốc 2400px của từng vùng hiện dần lên đè lên nền. Ảnh gốc chỉ
 * gán `src` khi vùng của nó sắp vào khung — 8 ảnh là 3.9MB, tải hết ngay từ
 * đầu là tranh với chính tranh tổng thể.
 *
 * Bookmark bay bằng GSAP trên một object thường rồi ghi transform trong
 * onUpdate, không tween trực tiếp DOM: cam là nguồn duy nhất, và kéo tay giữa
 * lúc đang bay phải cắt được đường bay.
 */
type Cam = { x: number; y: number; s: number };

const clamp = (min: number, max: number, v: number) =>
  Math.min(max, Math.max(min, v));

export function DeepCanvas({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { t, locale } = useLocale();
  const hostRef = useRef<HTMLDivElement>(null);
  const worldRef = useRef<HTMLDivElement>(null);
  const cam = useRef<Cam>({ x: WORLD.w / 2, y: WORLD.h / 2, s: 1 });
  const fit = useRef(1);
  const flight = useRef<gsap.core.Tween | null>(null);
  const [active, setActive] = useState<PhaseId | null>(null);
  const [zoomed, setZoomed] = useState(false);
  const [detailsArmed, setDetailsArmed] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [hintOpen, setHintOpen] = useState(true);

  /** Kẹp camera: world phải phủ kín khung, hoặc căn giữa nếu nhỏ hơn khung. */
  const clampCam = useCallback((c: Cam, W: number, H: number) => {
    const halfW = W / 2 / c.s;
    const halfH = H / 2 / c.s;
    c.x = WORLD.w <= halfW * 2 ? WORLD.w / 2 : clamp(halfW, WORLD.w - halfW, c.x);
    c.y = WORLD.h <= halfH * 2 ? WORLD.h / 2 : clamp(halfH, WORLD.h - halfH, c.y);
    return c;
  }, []);

  const render = useCallback(() => {
    const host = hostRef.current;
    const world = worldRef.current;
    if (!host || !world) return;
    const W = host.clientWidth;
    const H = host.clientHeight;
    const c = clampCam(cam.current, W, H);
    world.style.transform = `translate3d(${W / 2 - c.x * c.s}px, ${H / 2 - c.y * c.s}px, 0) scale(${c.s})`;

    const mult = c.s / fit.current;
    // Ảnh chi tiết hiện dần theo mức zoom.
    const k = clamp(
      0,
      1,
      (mult - DETAIL_FADE.from) / (DETAIL_FADE.to - DETAIL_FADE.from)
    );
    world.style.setProperty('--detail', String(k));
    setZoomed(mult > 1.25);
    if (mult > 1.4) setHintOpen(false);
    // Gán src cho ảnh gốc ngay TRƯỚC khi chúng bắt đầu hiện, để không thấy
    // ảnh nhảy vào giữa lúc đang mờ dần.
    if (mult > DETAIL_FADE.from - 0.25) setDetailsArmed(true);

    // Vùng nào đang ở tâm khung → sáng nhãn chương đó.
    const fx = c.x / WORLD.w;
    const fy = c.y / WORLD.h;
    const near =
      mult < 1.35
        ? null
        : (PHASES.reduce(
            (best, p) => {
              const d = (p.cx - fx) ** 2 + (p.cy - fy) ** 2;
              return d < best.d ? { d, id: p.id } : best;
            },
            { d: Infinity, id: null as PhaseId | null }
          ).id ?? null);
    setActive(near);
  }, [clampCam]);

  /** Đặt lại mức vừa khung; giữ nguyên bội số zoom hiện tại khi đổi khổ màn. */
  const measure = useCallback(() => {
    const host = hostRef.current;
    if (!host) return;
    const W = host.clientWidth;
    const H = host.clientHeight;
    const prevMult = cam.current.s / fit.current;
    // `cover` chứ không `contain`: tranh phải phủ kín khung, không viền đen.
    fit.current = Math.max(W / WORLD.w, H / WORLD.h);
    cam.current.s = fit.current * clamp(1, MAX_ZOOM, prevMult || 1);
    render();
  }, [render]);

  /** Bay tới một bookmark. `visitBookmark` của WebXP, bản của mình. */
  const travelTo = useCallback(
    (id: PhaseId, duration = 1.5) => {
      const p = PHASES.find(x => x.id === id);
      const host = hostRef.current;
      if (!p || !host) return;
      flight.current?.kill();
      const to = {
        x: p.cx * WORLD.w,
        y: p.cy * WORLD.h,
        s: fit.current * p.zoom,
      };
      flight.current = gsap.to(cam.current, {
        ...to,
        duration,
        ease: 'power3.inOut',
        onUpdate: render,
      });
      setMenuOpen(false);
      setHintOpen(false);
    },
    [render]
  );

  const reset = useCallback(() => {
    flight.current?.kill();
    flight.current = gsap.to(cam.current, {
      x: WORLD.w / 2,
      y: WORLD.h / 2,
      s: fit.current,
      duration: 1.1,
      ease: 'power3.inOut',
      onUpdate: render,
    });
  }, [render]);

  // ── Gắn tương tác ────────────────────────────────────────────────────
  useLayoutEffect(() => {
    if (!open) return;
    const host = hostRef.current;
    if (!host) return;

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(host);

    let dragging = false;
    let lastX = 0;
    let lastY = 0;
    const pointers = new Map<number, { x: number; y: number }>();
    let pinchDist = 0;
    let pinchScale = 0;

    const onDown = (e: PointerEvent) => {
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pointers.size === 1) {
        flight.current?.kill();
        dragging = true;
        lastX = e.clientX;
        lastY = e.clientY;
        host.setPointerCapture(e.pointerId);
      } else if (pointers.size === 2) {
        dragging = false;
        const [a, b] = [...pointers.values()];
        pinchDist = Math.hypot(a.x - b.x, a.y - b.y);
        pinchScale = cam.current.s;
      }
    };

    const onMove = (e: PointerEvent) => {
      if (!pointers.has(e.pointerId)) return;
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

      if (pointers.size === 2) {
        const [a, b] = [...pointers.values()];
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        if (pinchDist > 0) {
          cam.current.s = clamp(
            fit.current,
            fit.current * MAX_ZOOM,
            pinchScale * (d / pinchDist)
          );
          render();
        }
        return;
      }
      if (!dragging) return;
      cam.current.x -= (e.clientX - lastX) / cam.current.s;
      cam.current.y -= (e.clientY - lastY) / cam.current.s;
      lastX = e.clientX;
      lastY = e.clientY;
      render();
    };

    const onUp = (e: PointerEvent) => {
      pointers.delete(e.pointerId);
      if (pointers.size < 2) pinchDist = 0;
      if (pointers.size === 0) dragging = false;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      flight.current?.kill();
      const r = host.getBoundingClientRect();
      const W = r.width;
      const H = r.height;
      const c = cam.current;
      // Điểm world dưới con trỏ — phải giữ nguyên sau khi zoom.
      const px = e.clientX - r.left;
      const py = e.clientY - r.top;
      const wx = (px - (W / 2 - c.x * c.s)) / c.s;
      const wy = (py - (H / 2 - c.y * c.s)) / c.s;
      const next = clamp(
        fit.current,
        fit.current * MAX_ZOOM,
        c.s * Math.pow(0.9988, e.deltaY)
      );
      c.x = wx - (px - W / 2) / next;
      c.y = wy - (py - H / 2) / next;
      c.s = next;
      render();
    };

    host.addEventListener('pointerdown', onDown);
    host.addEventListener('pointermove', onMove, { passive: true });
    host.addEventListener('pointerup', onUp);
    host.addEventListener('pointercancel', onUp);
    host.addEventListener('wheel', onWheel, { passive: false });

    return () => {
      ro.disconnect();
      flight.current?.kill();
      host.removeEventListener('pointerdown', onDown);
      host.removeEventListener('pointermove', onMove);
      host.removeEventListener('pointerup', onUp);
      host.removeEventListener('pointercancel', onUp);
      host.removeEventListener('wheel', onWheel);
    };
  }, [open, measure, render]);

  // Mở lại thì về toàn cảnh và bật lại gợi ý.
  useEffect(() => {
    if (!open) return;
    cam.current = { x: WORLD.w / 2, y: WORLD.h / 2, s: fit.current };
    setHintOpen(true);
    setMenuOpen(false);
    render();
  }, [open, render]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (menuOpen) setMenuOpen(false);
      else onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, menuOpen, onClose]);

  if (!open) return null;

  const labels = t.gallery.phases;

  return (
    <div className='bg-charcoal-950 fixed inset-0 z-[60]'>
      {/* Khung canvas. touch-none để pinch không bị trình duyệt cuỗm. */}
      <div
        ref={hostRef}
        className='absolute inset-0 touch-none overflow-hidden'
        style={{ cursor: 'grab' }}
      >
        <div
          ref={worldRef}
          className='absolute top-0 left-0 origin-top-left will-change-transform'
          style={{ width: WORLD.w, height: WORLD.h }}
        >
          {/* Nền: tranh tổng thể. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={OVERVIEW}
            alt=''
            draggable={false}
            className='absolute inset-0 h-full w-full select-none'
          />

          {/* Ảnh gốc từng vùng — hiện dần theo biến --detail. */}
          {PHASES.map(p =>
            p.details.map(d => (
              <DetailLayer
                key={d.src}
                src={d.src}
                box={d}
                phase={p.id}
                armed={detailsArmed}
              />
            ))
          )}
        </div>
      </div>

      {/* Nhãn vùng đang ngắm. */}
      <div className='pointer-events-none absolute inset-x-0 top-20 z-10 flex justify-center px-6 md:top-24'>
        {active && (
          <div className='max-w-[34rem] text-center'>
            <p className='text-champagne-400 tracking-luxe text-[10px] uppercase'>
              {labels[active]}
            </p>
            <p className='font-display text-ivory mt-3 text-[clamp(1.3rem,2.4vw,2.1rem)] leading-[1.18] text-balance [text-shadow:0_2px_20px_rgba(0,0,0,.6)]'>
              {PHASE_COPY[active][locale].title}
            </p>
          </div>
        )}
      </div>

      {/* Menu chương — bốn buổi, theo chiều kim đồng hồ. */}
      <nav
        aria-label={t.gallery.ariaLabel}
        className={`border-charcoal-700 bg-charcoal-950/90 absolute top-0 bottom-0 left-0 z-20 w-[min(21rem,82vw)] border-r p-7 pt-24 backdrop-blur transition-transform duration-500 ${menuOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <p className='text-champagne-400 tracking-luxe text-[10px] uppercase'>
          {t.gallery.ariaLabel}
        </p>
        <ul className='mt-7 flex flex-col'>
          {PHASES.map((p, i) => (
            <li key={p.id} className='border-charcoal-700 border-b last:border-b-0'>
              <button
                type='button'
                onClick={() => travelTo(p.id)}
                className={`group flex w-full items-baseline gap-4 py-4 text-left transition-colors ${active === p.id ? 'text-champagne-200' : 'text-champagne-50/70 hover:text-champagne-50'}`}
              >
                <span className='font-display text-champagne-400 w-6 shrink-0 text-[13px]'>
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span>
                  <span className='font-display block text-[19px] leading-tight'>
                    {labels[p.id]}
                  </span>
                  <span className='mt-1 block text-[12.5px] leading-[1.5] opacity-60'>
                    {PHASE_COPY[p.id][locale].body}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Điều khiển. */}
      <div className='absolute top-6 right-5 z-30 flex gap-2 md:top-8 md:right-8'>
        {zoomed && (
          <button
            type='button'
            onClick={reset}
            className='border-charcoal-600 text-champagne-50/85 hover:border-champagne-400 tracking-luxe ease-luxe h-11 rounded-full border px-5 text-[10px] uppercase backdrop-blur transition-colors duration-300'
          >
            {locale === 'vi' ? 'Toàn cảnh' : 'Overview'}
          </button>
        )}
        <button
          type='button'
          onClick={onClose}
          aria-label={t.contact.close}
          className='border-charcoal-600 text-champagne-50 hover:border-champagne-400 ease-luxe grid size-11 place-items-center rounded-full border backdrop-blur transition-colors duration-300'
        >
          <span aria-hidden>✕</span>
        </button>
      </div>

      <button
        type='button'
        onClick={() => setMenuOpen(v => !v)}
        className='border-charcoal-600 text-champagne-50/85 hover:border-champagne-400 tracking-luxe ease-luxe absolute top-6 left-5 z-30 h-11 rounded-full border px-5 text-[10px] uppercase backdrop-blur transition-colors duration-300 md:top-8 md:left-8'
      >
        {menuOpen
          ? t.contact.close
          : locale === 'vi'
            ? 'Bốn thời điểm'
            : 'Four moments'}
      </button>

      {/* Gợi ý cách dùng — tắt ngay khi người xem đã zoom. */}
      {hintOpen && (
        <div className='text-champagne-50/55 pointer-events-none absolute inset-x-0 bottom-9 z-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-2 px-6 text-center text-[10.5px] tracking-[0.14em] uppercase'>
          <span>{locale === 'vi' ? 'Kéo để di chuyển' : 'Drag to move'}</span>
          <span>{locale === 'vi' ? 'Cuộn để phóng' : 'Scroll to zoom'}</span>
          <span>
            {locale === 'vi' ? 'Phóng sâu để thấy chi tiết' : 'Zoom in for detail'}
          </span>
        </div>
      )}
    </div>
  );
}

/**
 * Một ảnh gốc đè lên nền.
 *
 * `armed` do canvas quyết định theo MỨC ZOOM, không theo IntersectionObserver.
 * Bản đầu tôi dùng IO: sai, vì cả 8 ảnh nằm trong lớp world mà lớp world luôn
 * ở trong khung — nên IO báo "đã thấy" ngay lập tức và cả 3.9MB tải về trước
 * khi người xem zoom một lần nào. Đo được `detailArmed: 8` ở mức toàn cảnh.
 * Điều kiện đúng là "người xem đã zoom tới gần ngưỡng hiện chi tiết".
 */
function DetailLayer({
  src,
  box,
  phase,
  armed,
}: {
  src: string;
  box: { x: number; y: number; w: number; h: number; feather?: number };
  phase: PhaseId;
  armed: boolean;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={armed ? src : undefined}
      alt=''
      data-phase={phase}
      draggable={false}
      decoding='async'
      className='absolute select-none'
      style={{
        left: box.x,
        top: box.y,
        width: box.w,
        height: box.h,
        objectFit: 'cover',
        opacity: 'var(--detail, 0)' as unknown as number,
        // Tan mép bốn phía: hai gradient giao nhau. `intersect` là chỗ dễ sai
        // — `add` (mặc định) sẽ cho mép mờ ở góc nhưng vẫn cứng ở cạnh.
        ...(box.feather
          ? {
              maskImage: `linear-gradient(to right, transparent, #000 ${box.feather}%, #000 ${100 - box.feather}%, transparent), linear-gradient(to bottom, transparent, #000 ${box.feather}%, #000 ${100 - box.feather}%, transparent)`,
              WebkitMaskImage: `linear-gradient(to right, transparent, #000 ${box.feather}%, #000 ${100 - box.feather}%, transparent), linear-gradient(to bottom, transparent, #000 ${box.feather}%, #000 ${100 - box.feather}%, transparent)`,
              maskComposite: 'intersect',
              WebkitMaskComposite: 'source-in',
            }
          : null),
      }}
    />
  );
}
