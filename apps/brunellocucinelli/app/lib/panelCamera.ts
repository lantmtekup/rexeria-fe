import { gsap, MQ } from './motion';
import type { Layer } from './layers';
import type { PanelImage } from './panels';

/**
 * Camera panel theo brunellocucinelli.ai (PixiJS → DOM):
 *   S      = chiều cao màn × 1.05 / 1080   (px màn / px panel)
 *   left   = W/2 + S·(x + offsetX)          top = H/2 + S·(y + offsetY − 540)
 *   dịch   = S·(X·(1 − 0.1·z) + z·mx·20 − mx·100),  S·(z·my·10 − my·50)
 * mx, my ∈ [−0.5, 0.5] (quickTo 1.5s power3.out).
 */
export const PANEL_H = 1080;
const FIT = 1.05;
export const panelScale = (H: number) => (H / PANEL_H) * FIT;

export type PanelItem = Layer & { z: number; px: number; py: number };

export const resolveItems = (layers: Layer[], images: PanelImage[]) =>
  images.flatMap(cfg => {
    const layer = layers.find(l => l.src.includes(`/${cfg.match}-x`));
    return layer
      ? [
          {
            ...layer,
            z: cfg.z,
            px: (cfg.x ?? layer.x) + (cfg.offsetX ?? 0),
            py: (cfg.y ?? layer.y) + (cfg.offsetY ?? 0),
          },
        ]
      : [];
  });

export type Cam = { X: number; mx: number; my: number };

/** Vị trí tĩnh — ghi mỗi lần đổi khổ màn; khi cuộn chỉ ghi transform. */
export const layoutItems = (
  els: HTMLElement[],
  items: PanelItem[],
  W: number,
  H: number
) => {
  const S = panelScale(H);
  els.forEach((el, i) => {
    const it = items[i];
    el.style.left = `${W / 2 + S * it.px}px`;
    el.style.top = `${H / 2 + S * (it.py - PANEL_H / 2)}px`;
    el.style.width = `${it.w * S}px`;
  });
  return S;
};

export const createRenderer = (
  els: HTMLElement[],
  items: PanelItem[],
  cam: Cam,
  getS: () => number
) => {
  const setters = els.map((el, i) => ({
    x: gsap.quickSetter(el, 'x', 'px'),
    y: gsap.quickSetter(el, 'y', 'px'),
    z: items[i].z,
  }));
  return () => {
    const S = getS();
    for (const s of setters) {
      s.x(S * (cam.X * (1 - 0.1 * s.z) + s.z * cam.mx * 20 - cam.mx * 100));
      s.y(S * (s.z * cam.my * 10 - cam.my * 50));
    }
  };
};

/** Chuột như trang mẫu — chỉ thiết bị có chuột, bỏ khi reduced motion. */
export const attachMouse = (scope: Element, cam: Cam, render: () => void) => {
  const mm = gsap.matchMedia(scope);
  mm.add(
    `${MQ.finePointer} and (prefers-reduced-motion: no-preference)`,
    () => {
      const mxTo = gsap.quickTo(cam, 'mx', {
        duration: 1.5,
        ease: 'power3.out',
      });
      const myTo = gsap.quickTo(cam, 'my', {
        duration: 1.5,
        ease: 'power3.out',
        onUpdate: render,
      });
      const onMove = (e: PointerEvent) => {
        mxTo(e.clientX / window.innerWidth - 0.5);
        myTo(e.clientY / window.innerHeight - 0.5);
      };
      document.addEventListener('pointermove', onMove, { passive: true });
      return () => {
        document.removeEventListener('pointermove', onMove);
        cam.mx = cam.my = 0;
        render();
      };
    }
  );
  return () => mm.revert();
};

/**
 * Đáy nội dung cuối của một section (card cuối hoặc khung artwork — lấy cái
 * thấp hơn), tính từ đỉnh section theo layout (offsetTop — không dính
 * transform của animation reveal), tức là bỏ padding dưới section.
 */
export const contentBottom = (section: HTMLElement) => {
  const bottomOf = (el: HTMLElement) => {
    let top = 0;
    for (
      let n: HTMLElement | null = el;
      n && n !== section;
      n = n.offsetParent as HTMLElement | null
    )
      top += n.offsetTop;
    return top + el.offsetHeight;
  };
  const candidates = [
    ...section.querySelectorAll<HTMLElement>(
      '[data-card], [data-artwork-frame]'
    ),
  ];
  return candidates.length
    ? Math.max(...candidates.map(bottomOf))
    : section.offsetHeight;
};

/**
 * Ảnh panel chỉ tải khi section cách màn ≤ 2 màn (5 panel ≈ 100 PNG lớn).
 * Gán src + decode() trước khi cảnh hiện ra để lần đầu vào màn không nháy.
 */
export const loadWhenNear = (
  section: HTMLElement,
  imgs: HTMLImageElement[]
) => {
  const load = () =>
    imgs.forEach(img => {
      const src = img.dataset.src;
      if (!src || img.getAttribute('src')) return;
      img.src = src;
      img.decode?.().catch(() => {});
    });
  const io = new IntersectionObserver(
    entries => {
      if (entries.some(e => e.isIntersecting)) {
        load();
        io.disconnect();
      }
    },
    { rootMargin: '200% 0px' }
  );
  io.observe(section);
  return () => io.disconnect();
};
