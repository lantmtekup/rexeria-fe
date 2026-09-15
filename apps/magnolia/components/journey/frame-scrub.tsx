'use client';
import { useEffect, useLayoutEffect, useRef } from 'react';
import { ScrollTrigger } from '@/lib/journey/motion';

/**
 * Phim scrub theo scroll, vẽ từng frame lên canvas.
 *
 * KHÔNG dùng `<video>` + seek. Lý do đã nằm trong comment của `hero.tsx`: seek
 * phải decode lại từ keyframe gần nhất, nên mỗi bước scroll đòi một lần decode
 * dài — đó là cái giật mà không easing nào chữa được. Chuỗi frame thì mỗi bước
 * chỉ là một lệnh `drawImage`.
 *
 * NGÂN SÁCH FRAME là ràng buộc thật, và không phải ràng buộc băng thông.
 * `grace-scroll.mp4` (6.04s, 24fps, 1920×1080) lấy đủ 24fps ở 1280×720 thành
 * 145 frame — chỉ 2.0MB tải về, nhưng 509 MB BITMAP GIẢI NÉN nằm thường
 * trú, cộng thêm 286 frame của nhịp mở màn. Đo được 2 fps rồi tới mức renderer
 * đứng hẳn. Kích thước file không nói gì về chi phí này.
 *
 * Giảm còn 73 frame ở 960×540 ≈ 144 MB. 12fps không làm mất gì: scrub ánh xạ theo
 * VỊ TRÍ cuộn nên người xem chỉ thấy frame gần vị trí đó, không thấy nhịp thời
 * gian. Và phim nằm trong khung ~80vw, không full-bleed, nên 960 là đủ.
 *
 * Canvas chỉ hiện khi đã vẽ được frame đầu; trước đó `poster` đứng thay, nên
 * lần đầu cuộn tới không thấy một khung trống.
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
  const lastDrawn = useRef(-1);

  /**
   * Tải frame khi section còn cách màn một quãng, không tải ngay lúc mở
   * trang: nhịp mở màn đã giữ 286 frame, thêm 145 frame nữa cùng lúc là tranh
   * băng thông với chính đoạn phim người xem đang nhìn.
   */
  useEffect(() => {
    const host = targetRef.current;
    if (!host) return;
    let cancelled = false;

    const load = () => {
      const imgs: HTMLImageElement[] = [];
      let loaded = 0;
      for (let i = 0; i < count; i++) {
        const img = new Image();
        img.decoding = 'async';
        img.src = `${dir}/${String(start + i).padStart(4, '0')}.webp`;
        img.onload = () => {
          loaded++;
          // Frame đầu về là đo lại: chiều cao section không đổi, nhưng
          // ScrollTrigger cần biết có gì để vẽ.
          if (loaded === 1 && !cancelled) ScrollTrigger.refresh();
        };
        imgs.push(img);
      }
      framesRef.current = imgs;
    };

    const io = new IntersectionObserver(
      entries => {
        if (entries.some(e => e.isIntersecting)) {
          io.disconnect();
          load();
        }
      },
      { rootMargin: '150% 0px' }
    );
    io.observe(host);

    return () => {
      cancelled = true;
      io.disconnect();
      framesRef.current = [];
    };
  }, [dir, count, start, targetRef]);

  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    const target = targetRef.current;
    if (!canvas || !target) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const state = { progress: 0 };
    let cw = 0;
    let ch = 0;

    /**
     * Chỉ vẽ khi CHỈ SỐ FRAME đổi.
     *
     * Bản đầu tôi gọi render() trên gsap.ticker mỗi frame: 60 lần drawImage
     * một ảnh 1280×720 mỗi giây, mãi mãi, kể cả khi section đã ra khỏi màn.
     * Cộng với 286 frame của nhịp mở màn thì compositor nghẽn tới mức
     * Page.captureScreenshot của DevTools timeout — trang vẫn chạy JS nhưng
     * không kịp paint. `hero.tsx` bản gốc chặn đúng chỗ này bằng lastDrawn,
     * và đây là lý do.
     */
    const render = (force = false) => {
      const imgs = framesRef.current;
      if (!imgs.length || !cw) return;
      const i = Math.min(
        imgs.length - 1,
        Math.max(0, Math.round(state.progress * (imgs.length - 1)))
      );
      if (!force && i === lastDrawn.current) return;
      const img = imgs[i];
      if (!img?.naturalWidth) return;
      lastDrawn.current = i;
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
      render(true);
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
    return () => {
      ro.disconnect();
      st.kill();
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
