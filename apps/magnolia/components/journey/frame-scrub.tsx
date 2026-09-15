'use client';
import { useEffect, useLayoutEffect, useRef } from 'react';
import { gsap, ScrollTrigger } from '@/lib/journey/motion';

/**
 * Phim scrub theo scroll, vẽ từng frame lên canvas.
 *
 * KHÔNG dùng `<video>` + seek. Lý do đã nằm trong comment của `hero.tsx`: seek
 * phải decode lại từ keyframe gần nhất, nên mỗi bước scroll đòi một lần decode
 * dài — đó là cái giật mà không easing nào chữa được. Chuỗi frame thì mỗi bước
 * chỉ là một lệnh `drawImage`.
 *
 * Đổi `grace-scroll.mp4` (3.3MB, 6.04s, 24fps, 1920×1080) sang 145 frame WebP
 * 1280×720 còn 2.0MB — nhẹ hơn cả video gốc, vì WebP nén tĩnh từng frame tốt
 * hơn H.264 ở bitrate này và không cần giữ khung B/P.
 *
 * Frame tải hết trước khi vẽ, và canvas chỉ hiện khi đã có frame đầu — nếu
 * không, lần đầu cuộn tới sẽ thấy một khung trống.
 */
const MAX_DPR = 2;

/** Cover-fit: frame phủ kín canvas ở mọi tỉ lệ mà không méo. */
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

export function FrameScrub({
  dir,
  count,
  start = 1,
  targetRef,
  className = '',
  poster,
}: {
  /** Thư mục trong `public`, ví dụ `/frames/grace`. */
  dir: string;
  count: number;
  /** Số của frame đầu (ffmpeg đánh số từ 1). */
  start?: number;
  /** Phần tử quyết định tiến độ cuộn — thường là khối bọc ngoài `sticky`. */
  targetRef: React.RefObject<HTMLElement | null>;
  className?: string;
  poster?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const framesRef = useRef<HTMLImageElement[]>([]);
  const readyRef = useRef(false);

  // Tải frame một lần. Không đặt trong useLayoutEffect: nó chặn paint.
  useEffect(() => {
    let cancelled = false;
    const imgs: HTMLImageElement[] = [];
    let loaded = 0;
    for (let i = 0; i < count; i++) {
      const img = new Image();
      img.decoding = 'async';
      img.src = `${dir}/${String(start + i).padStart(4, '0')}.webp`;
      img.onload = () => {
        loaded++;
        if (loaded === 1 && !cancelled) {
          readyRef.current = true;
          ScrollTrigger.refresh();
        }
      };
      imgs.push(img);
    }
    framesRef.current = imgs;
    return () => {
      cancelled = true;
      framesRef.current = [];
    };
  }, [dir, count, start]);

  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    const target = targetRef.current;
    if (!canvas || !target) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const state = { progress: 0 };
    let cw = 0;
    let ch = 0;

    const render = () => {
      const imgs = framesRef.current;
      if (!imgs.length || !cw) return;
      const i = Math.min(
        imgs.length - 1,
        Math.max(0, Math.round(state.progress * (imgs.length - 1)))
      );
      const img = imgs[i];
      if (!img?.naturalWidth) return;
      ctx.clearRect(0, 0, cw, ch);
      drawCover(ctx, img, cw, ch);
      canvas.style.opacity = '1';
    };

    const resize = () => {
      const dpr = Math.min(MAX_DPR, window.devicePixelRatio || 1);
      const r = canvas.getBoundingClientRect();
      cw = Math.round(r.width * dpr);
      ch = Math.round(r.height * dpr);
      canvas.width = cw;
      canvas.height = ch;
      render();
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const st = ScrollTrigger.create({
      trigger: target,
      start: 'top top',
      end: 'bottom bottom',
      // Cùng catch-up với phim mở màn, nên hai đoạn phim cảm giác cùng một
      // camera chứ không phải hai cơ chế khác nhau.
      scrub: 0.6,
      onUpdate: self => {
        state.progress = self.progress;
        render();
      },
    });
    // scrub cần một tween để nội suy; ScrollTrigger.onUpdate đã đủ ở đây vì
    // Lenis đã làm mượt vị trí cuộn trước khi ScrollTrigger đọc.
    const tick = () => render();
    gsap.ticker.add(tick);

    return () => {
      ro.disconnect();
      st.kill();
      gsap.ticker.remove(tick);
    };
  }, [targetRef]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={`h-full w-full opacity-0 transition-opacity duration-500 ${className}`}
      style={
        poster
          ? {
              backgroundImage: `url(${poster})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }
          : undefined
      }
    />
  );
}
