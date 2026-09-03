'use client';

/**
 * Con trỏ tùy biến Westly — port từ `apps/the-westly/app/components/CustomPointer`.
 *
 * Khác app ở ba chỗ, đều do host bắt buộc:
 *
 * 1. **Chrome cấp trang, nhưng host không có chỗ mount cấp trang.** App dựng
 *    một `<CustomPointer>` trong `page.tsx`. Ở đây mỗi block Westly gọi
 *    `useWestlyPointer()`; một cuộc bầu chọn ở module scope cho instance đầu
 *    tiên làm chủ, các instance sau không dựng DOM. Chủ rời trang thì instance
 *    còn lại giành lại quyền.
 *
 * 2. **Trang `/p` có thể trộn block Westly với block brand khác.** App ẩn con
 *    trỏ thật của cả `<html>`. Ở đây con trỏ đứng lùi (trả lại con trỏ thật)
 *    khi chuột rời lãnh thổ Westly — xem `isWestlyTerritory`. Trang toàn Westly
 *    vẫn hành xử y hệt app.
 *
 * 3. **Canvas editor phải tắt.** `cursor: none` trên canvas làm không edit
 *    được. Block truyền `isCanvas` vào; canvas thì hook không dựng gì cả.
 *
 * Phần tử con trỏ luôn portal ra `document.body` và dùng `position: fixed` +
 * toạ độ viewport, nên nó nằm đúng dưới con trỏ thật ở mọi bề mặt (kể cả trong
 * device frame có transform/zoom) mà không cần toán offset. Chỉ class
 * `cursor: none` mới scope theo device frame, để chrome của editor bên ngoài
 * khung giữ con trỏ thật.
 */

import * as React from 'react';
import { createPortal } from 'react-dom';
import gsap from 'gsap';

import { WESTLY_FONT_DISPLAY } from './westlyTheme';

/**
 * Gắn lên bề mặt toggle (spread vào JSX) để con trỏ đổi sang vòng VIEW/BACK.
 * Nhãn lật theo `aria-pressed` của chính phần tử đó — mọi bề mặt toggle Westly
 * đều đã có sẵn attribute này.
 */
export const westlyCursorToggle = {
  'data-westly-cursor': 'view-toggle',
} as const;

/** Con trỏ ẩn dưới ngưỡng này (giống app) — thiết bị chạm không có hover. */
const MQ_ACTIVE =
  '(min-width: 768px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)';

/** Nút / link bất kỳ → đĩa olive đặc, không nhãn. */
const INTERACTIVE = 'button, a[href], [role="button"]';

const CURSOR_NONE_CLASS = 'westly-pointer-on';

const CURSOR_NONE_CSS = `
.${CURSOR_NONE_CLASS}, .${CURSOR_NONE_CLASS} * { cursor: none !important; }
`;

interface PointerStyle {
  label: string;
  size: number;
  wash: string;
  border: string;
  hub: number;
  hubColor: string;
}

const IDLE: PointerStyle = {
  label: '',
  size: 36,
  wash: 'rgba(243, 241, 234, 0.18)',
  border: 'rgba(110, 122, 111, 0.42)',
  hub: 1,
  hubColor: 'rgba(110, 122, 111, 0.6)',
};

const VIEW: PointerStyle = {
  label: 'VIEW',
  size: 84,
  wash: 'rgba(243, 241, 234, 0.58)',
  border: 'rgba(110, 122, 111, 0.72)',
  hub: 0,
  hubColor: 'rgba(110, 122, 111, 0.6)',
};

const BACK: PointerStyle = { ...VIEW, label: 'BACK' };

const PRESS: PointerStyle = {
  label: '',
  size: 44,
  wash: 'rgba(110, 122, 111, 0.88)',
  border: 'rgba(110, 122, 111, 0.88)',
  hub: 1,
  hubColor: 'rgba(243, 241, 234, 0.95)',
};

// ── Bầu chọn chủ sở hữu ────────────────────────────────────────────────────
// Nhiều block Westly trên một trang → chỉ MỘT con trỏ được dựng.

let ownerId: number | null = null;
let nextId = 1;
const contenders = new Set<() => void>();

function claim(id: number): boolean {
  if (ownerId === null) ownerId = id;
  return ownerId === id;
}

function release(id: number) {
  if (ownerId !== id) return;
  ownerId = null;
  // Chủ vừa unmount — đánh thức các instance còn lại để giành quyền.
  contenders.forEach(retry => retry());
}

/**
 * Mọi block Westly gọi hook này. Trả về phần tử con trỏ (portal) cho đúng một
 * instance, `null` cho các instance còn lại và cho canvas editor.
 */
export function useWestlyPointer(isCanvas: boolean): React.ReactElement | null {
  const idRef = React.useRef(0);
  if (idRef.current === 0) idRef.current = nextId++;

  const [isOwner, setIsOwner] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => setMounted(true), []);

  React.useEffect(() => {
    if (isCanvas) return;
    const id = idRef.current;
    const retry = () => setIsOwner(claim(id));
    contenders.add(retry);
    retry();
    return () => {
      contenders.delete(retry);
      release(id);
      setIsOwner(false);
    };
  }, [isCanvas]);

  if (isCanvas || !isOwner || !mounted) return null;
  return createPortal(<WestlyPointerLayer />, document.body);
}

function WestlyPointerLayer() {
  const rootRef = React.useRef<HTMLDivElement>(null);
  const ringRef = React.useRef<HTMLDivElement>(null);
  const hubRef = React.useRef<HTMLSpanElement>(null);
  const labelRef = React.useRef<HTMLSpanElement>(null);

  // Chốt an toàn cuối: dù teardown của gsap.matchMedia có chạy hay không, khi
  // component biến mất thì KHÔNG được để sót `cursor: none` — sót lại là mất
  // con trỏ chuột của cả editor.
  React.useLayoutEffect(
    () => () => {
      document
        .querySelectorAll(`.${CURSOR_NONE_CLASS}`)
        .forEach(el => el.classList.remove(CURSOR_NONE_CLASS));
    },
    []
  );

  React.useLayoutEffect(() => {
    const root = rootRef.current;
    const ring = ringRef.current;
    const hub = hubRef.current;
    const labelEl = labelRef.current;
    if (!root || !ring || !hub || !labelEl) return;

    // Ẩn cho tới khi chuột thật sự di chuyển — tránh nháy một chấm ở góc.
    gsap.set(root, { autoAlpha: 0, x: -100, y: -100 });

    const mm = gsap.matchMedia();

    mm.add(MQ_ACTIVE, () => {
      gsap.set(ring, {
        width: IDLE.size,
        height: IDLE.size,
        backgroundColor: IDLE.wash,
        borderColor: IDLE.border,
      });
      gsap.set(hub, {
        autoAlpha: IDLE.hub,
        scale: 1,
        backgroundColor: IDLE.hubColor,
      });
      gsap.set(labelEl, { autoAlpha: 0, scale: 0.92 });

      const xTo = gsap.quickTo(root, 'x', {
        duration: 0.38,
        ease: 'power2.out',
      });
      const yTo = gsap.quickTo(root, 'y', {
        duration: 0.38,
        ease: 'power2.out',
      });

      let currentKey: string | null = null;
      let visible = false;
      let cursorHost: HTMLElement | null = null;
      let lastX = 0;
      let lastY = 0;

      /**
       * Lãnh thổ Westly = bên trong một phần tử tự khai báo `data-westly-scope`
       * (root của mọi block Westly, cộng bar header portal ra body). Ra khỏi đó
       * — block brand khác, chrome của trang, toolbar của editor — con trỏ đứng
       * lùi và trả lại con trỏ thật.
       *
       * Trên một trang toàn Westly thì mọi pixel nhìn thấy đều nằm trong một
       * block, nên hành vi trùng khít app gốc.
       */
      const isWestlyTerritory = (hit: Element | null): boolean =>
        !!hit?.closest('[data-westly-scope]');

      /**
       * `cursor: none` scope theo device frame khi đang preview trong editor,
       * theo `<html>` khi ở `/p`. Nhờ vậy chrome editor ngoài khung giữ con trỏ
       * thật ngay cả lúc con trỏ Westly đang chạy trong khung.
       */
      const resolveCursorHost = (hit: Element | null): HTMLElement =>
        hit?.closest<HTMLElement>('[data-device-frame]') ??
        document.documentElement;

      const setCursorHidden = (host: HTMLElement | null) => {
        if (cursorHost === host) return;
        cursorHost?.classList.remove(CURSOR_NONE_CLASS);
        cursorHost = host;
        cursorHost?.classList.add(CURSOR_NONE_CLASS);
      };

      const applyStyle = (key: string | null, style: PointerStyle) => {
        if (key === currentKey) return;
        currentKey = key;

        gsap.to(ring, {
          width: style.size,
          height: style.size,
          backgroundColor: style.wash,
          borderColor: style.border,
          duration: 0.42,
          ease: 'power2.out',
          overwrite: 'auto',
        });

        gsap.to(hub, {
          autoAlpha: style.hub,
          scale: style.hub ? 1 : 0.6,
          backgroundColor: style.hubColor,
          duration: 0.34,
          ease: 'power2.out',
          overwrite: 'auto',
        });

        if (style.label) {
          labelEl.textContent = style.label;
          gsap.fromTo(
            labelEl,
            { autoAlpha: 0, scale: 0.92 },
            {
              autoAlpha: 1,
              scale: 1,
              duration: 0.34,
              ease: 'power2.out',
              overwrite: 'auto',
            }
          );
        } else {
          gsap.to(labelEl, {
            autoAlpha: 0,
            scale: 0.92,
            duration: 0.24,
            ease: 'power2.in',
            overwrite: 'auto',
          });
        }
      };

      const show = () => {
        if (visible) return;
        visible = true;
        gsap.to(root, {
          autoAlpha: 1,
          duration: 0.34,
          ease: 'power2.out',
          overwrite: 'auto',
        });
      };

      const hide = () => {
        setCursorHidden(null);
        if (!visible) return;
        visible = false;
        currentKey = null;
        gsap.to(root, {
          autoAlpha: 0,
          duration: 0.24,
          ease: 'power2.in',
          overwrite: 'auto',
        });
        gsap.set(ring, {
          width: IDLE.size,
          height: IDLE.size,
          backgroundColor: IDLE.wash,
          borderColor: IDLE.border,
        });
        gsap.set(hub, {
          autoAlpha: IDLE.hub,
          scale: 1,
          backgroundColor: IDLE.hubColor,
        });
        gsap.set(labelEl, { autoAlpha: 0, scale: 0.92 });
      };

      const syncFromPoint = (clientX: number, clientY: number) => {
        const hit = document.elementFromPoint(clientX, clientY);

        if (!isWestlyTerritory(hit)) {
          hide();
          return;
        }

        setCursorHidden(resolveCursorHost(hit));
        show();

        const toggle = hit?.closest<HTMLElement>('[data-westly-cursor]');
        if (toggle) {
          const pressed = toggle.getAttribute('aria-pressed') === 'true';
          applyStyle(`toggle:${pressed ? '1' : '0'}`, pressed ? BACK : VIEW);
          return;
        }

        if (hit?.closest(INTERACTIVE)) {
          applyStyle('press', PRESS);
          return;
        }

        applyStyle(null, IDLE);
      };

      const onMove = (e: MouseEvent) => {
        lastX = e.clientX;
        lastY = e.clientY;
        xTo(e.clientX);
        yTo(e.clientY);
        syncFromPoint(e.clientX, e.clientY);
      };

      // Toggle đổi `aria-pressed` sau click → đọc lại ở khung hình kế tiếp.
      const onClick = () => {
        requestAnimationFrame(() => syncFromPoint(lastX, lastY));
      };

      const onDocOut = (e: MouseEvent) => {
        if (!e.relatedTarget) hide();
      };

      window.addEventListener('mousemove', onMove, { passive: true });
      window.addEventListener('click', onClick, true);
      document.documentElement.addEventListener('mouseleave', hide);
      document.addEventListener('mouseout', onDocOut);

      return () => {
        setCursorHidden(null);
        gsap.set(root, { autoAlpha: 0 });
        window.removeEventListener('mousemove', onMove);
        window.removeEventListener('click', onClick, true);
        document.documentElement.removeEventListener('mouseleave', hide);
        document.removeEventListener('mouseout', onDocOut);
      };
    });

    return () => mm.revert();
  }, []);

  return (
    <>
      <style>{CURSOR_NONE_CSS}</style>
      <div
        ref={rootRef}
        data-westly-pointer=''
        aria-hidden
        style={{
          pointerEvents: 'none',
          position: 'fixed',
          top: 0,
          left: 0,
          zIndex: 9999,
          transform: 'translate(-50%, -50%)',
          visibility: 'hidden',
        }}
      >
        <div
          ref={ringRef}
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: IDLE.size,
            height: IDLE.size,
            borderRadius: '9999px',
            border: `1px solid ${IDLE.border}`,
            backgroundColor: IDLE.wash,
            willChange: 'transform',
          }}
        >
          <span
            ref={hubRef}
            style={{
              position: 'absolute',
              width: 6,
              height: 6,
              borderRadius: '9999px',
              backgroundColor: IDLE.hubColor,
            }}
          />
          <span
            ref={labelRef}
            style={{
              position: 'absolute',
              fontFamily: WESTLY_FONT_DISPLAY,
              fontSize: 11,
              lineHeight: 1,
              fontWeight: 500,
              letterSpacing: '0.32em',
              textTransform: 'uppercase',
              color: '#6E7A6F',
            }}
          />
        </div>
      </div>
    </>
  );
}
