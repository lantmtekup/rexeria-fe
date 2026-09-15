import { gsap, MQ } from './motion';

/**
 * Mouse parallax dùng chung — một listener + một vòng lerp trên gsap.ticker
 * cho Hero (các panel lướt ngang dùng attachMouse trong panelCamera.ts). Mọi lớp đọc một con trỏ đã lerp, nên khi
 * cảnh chuyển section các lớp không bị giật về 0 rồi trôi lại.
 *
 * Biên độ px cho depth = 1. Tổng biên độ nhỏ, nhưng các lớp chênh nhau mạnh
 * (xa gần như đứng yên, gần trôi nhiều) để cảnh có chiều sâu rõ.
 */
export const PUSH = { x: 40, y: 22 } as const;
const LERP = 0.05;

type Target = { set: (v: gsap.TweenVars) => void; depth: number };

const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
const targets = new Set<Target>();
let settled = true;
let started = false;
let enabledMq: MediaQueryList | null = null;

const apply = (t: Target) =>
  t.set({
    x: -pointer.x * PUSH.x * t.depth,
    y: -pointer.y * PUSH.y * t.depth,
  });

const onMove = (e: MouseEvent) => {
  pointer.tx = (e.clientX / window.innerWidth) * 2 - 1;
  pointer.ty = (e.clientY / window.innerHeight) * 2 - 1;
  settled = false;
};
const onLeave = () => {
  pointer.tx = 0;
  pointer.ty = 0;
  settled = false;
};

const onTick = () => {
  if (settled || targets.size === 0) return;
  const t = 1 - Math.pow(1 - LERP, gsap.ticker.deltaRatio());
  pointer.x += (pointer.tx - pointer.x) * t;
  pointer.y += (pointer.ty - pointer.y) * t;
  if (
    Math.abs(pointer.tx - pointer.x) < 0.0005 &&
    Math.abs(pointer.ty - pointer.y) < 0.0005
  ) {
    pointer.x = pointer.tx;
    pointer.y = pointer.ty;
    settled = true; // ghi nốt frame này rồi im
  }
  targets.forEach(apply);
};

const start = () => {
  if (started) return;
  started = true;
  gsap.ticker.add(onTick);
  window.addEventListener('mousemove', onMove, { passive: true });
  document.documentElement.addEventListener('mouseleave', onLeave);
};

const stop = () => {
  if (!started) return;
  started = false;
  gsap.ticker.remove(onTick);
  window.removeEventListener('mousemove', onMove);
  document.documentElement.removeEventListener('mouseleave', onLeave);
  pointer.x = pointer.y = pointer.tx = pointer.ty = 0;
  settled = true;
};

/**
 * Đăng ký các lớp [data-depth] vào parallax chung. Chỉ chạy với chuột thật
 * và khi không bật reduced motion. Trả về hàm huỷ (xoá transform đã ghi).
 */
export function registerDepthLayers(els: HTMLElement[]) {
  enabledMq ??= window.matchMedia(
    `${MQ.finePointer} and (prefers-reduced-motion: no-preference)`
  );
  if (!enabledMq.matches) return () => {};

  const added = els.map(el => {
    const target: Target = {
      set: gsap.quickSetter(el, 'css') as Target['set'],
      depth: Number(el.dataset.depth) || 1,
    };
    targets.add(target);
    apply(target); // khớp ngay vị trí chuột hiện tại
    return target;
  });
  start();

  return () => {
    added.forEach(t => targets.delete(t));
    gsap.set(els, { x: 0, y: 0 });
    if (targets.size === 0) stop();
  };
}
