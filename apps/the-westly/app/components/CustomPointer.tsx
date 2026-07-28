'use client';

import { useLayoutEffect, useRef } from 'react';
import { gsap, MQ } from '../lib/motion';

export type CursorAction = 'default' | 'view' | 'reveal' | 'hide' | 'press';

export type CursorTarget = {
  id: string;
  action: CursorAction;
  label?: string;
  /** When target has aria-pressed="true" */
  actionPressed?: CursorAction;
  labelPressed?: string;
};

type CustomPointerProps = {
  targets: CursorTarget[];
};

type ActionStyle = {
  label: string;
  size: number;
  wash: string;
  border: string;
  hub: number;
  hubColor: string;
};

const INTERACTIVE = 'button, a[href], [role="button"], [data-cursor="press"]';

const ACTION_STYLE: Record<CursorAction, ActionStyle> = {
  default: {
    label: '',
    size: 36,
    wash: 'rgba(243, 241, 234, 0.18)',
    border: 'rgba(110, 122, 111, 0.42)',
    hub: 1,
    hubColor: 'rgba(110, 122, 111, 0.6)',
  },
  view: {
    label: 'VIEW',
    size: 84,
    wash: 'rgba(243, 241, 234, 0.58)',
    border: 'rgba(110, 122, 111, 0.72)',
    hub: 0,
    hubColor: 'rgba(110, 122, 111, 0.6)',
  },
  reveal: {
    label: 'SEE',
    size: 76,
    wash: 'rgba(243, 241, 234, 0.58)',
    border: 'rgba(110, 122, 111, 0.72)',
    hub: 0,
    hubColor: 'rgba(110, 122, 111, 0.6)',
  },
  hide: {
    label: 'BACK',
    size: 84,
    wash: 'rgba(243, 241, 234, 0.58)',
    border: 'rgba(110, 122, 111, 0.72)',
    hub: 0,
    hubColor: 'rgba(110, 122, 111, 0.6)',
  },
  // Buttons / links — solid olive disc, quiet cream hub. No label.
  press: {
    label: '',
    size: 44,
    wash: 'rgba(110, 122, 111, 0.88)',
    border: 'rgba(110, 122, 111, 0.88)',
    hub: 1,
    hubColor: 'rgba(243, 241, 234, 0.95)',
  },
};

const resolveRegistered = (
  target: CursorTarget,
  pressed: boolean
): ActionStyle => {
  const action =
    pressed && target.actionPressed ? target.actionPressed : target.action;
  const base = ACTION_STYLE[action];
  const label = pressed
    ? (target.labelPressed ?? base.label)
    : (target.label ?? base.label);

  return { ...base, label };
};

export default function CustomPointer({ targets }: CustomPointerProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const hubRef = useRef<HTMLSpanElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    const root = rootRef.current;
    const ring = ringRef.current;
    const hub = hubRef.current;
    const labelEl = labelRef.current;
    if (!root || !ring || !hub || !labelEl) return;

    // Hidden until fine-pointer desktop activates — avoids flash on mobile.
    gsap.set(root, { autoAlpha: 0, x: -100, y: -100 });

    const targetMap = new Map(targets.map(t => [t.id, t]));
    const mm = gsap.matchMedia();

    // ≥768px + fine pointer. CSS also hides ≤767px so cursor:none never
    // applies without a visible custom pointer (e.g. DevTools device mode).
    mm.add(
      `${MQ.desktop} and ${MQ.finePointer} and (prefers-reduced-motion: no-preference)`,
      () => {
        const html = document.documentElement;
        html.classList.add('has-custom-pointer');

        const idle = ACTION_STYLE.default;
        gsap.set(root, { autoAlpha: 0, x: -100, y: -100 });
        gsap.set(ring, {
          width: idle.size,
          height: idle.size,
          backgroundColor: idle.wash,
          borderColor: idle.border,
        });
        gsap.set(hub, {
          autoAlpha: idle.hub,
          scale: 1,
          backgroundColor: idle.hubColor,
        });
        gsap.set(labelEl, { autoAlpha: 0, scale: 0.92 });

        const xTo = gsap.quickTo(root, 'x', {
          duration: 0.55,
          ease: 'power3.out',
        });
        const yTo = gsap.quickTo(root, 'y', {
          duration: 0.55,
          ease: 'power3.out',
        });

        let currentKey: string | null = null;
        let visible = false;
        let lastX = 0;
        let lastY = 0;

        const applyStyle = (key: string | null, style: ActionStyle) => {
          if (key === currentKey) return;
          currentKey = key;

          gsap.to(ring, {
            width: style.size,
            height: style.size,
            backgroundColor: style.wash,
            borderColor: style.border,
            duration: 0.5,
            ease: 'power2.out',
            overwrite: 'auto',
          });

          gsap.to(hub, {
            autoAlpha: style.hub,
            scale: style.hub ? 1 : 0.6,
            backgroundColor: style.hubColor,
            duration: 0.35,
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
                duration: 0.4,
                ease: 'power2.out',
                overwrite: 'auto',
              }
            );
          } else {
            gsap.to(labelEl, {
              autoAlpha: 0,
              scale: 0.92,
              duration: 0.25,
              ease: 'power2.in',
              overwrite: 'auto',
            });
          }
        };

        const resolveHit = (clientX: number, clientY: number) => {
          const hit = document.elementFromPoint(clientX, clientY);
          if (!hit || !(hit instanceof Element)) {
            return { key: null as string | null, style: idle };
          }

          const tagged = hit.closest('[data-cursor-id]');
          if (tagged) {
            const id = tagged.getAttribute('data-cursor-id');
            if (id) {
              const target = targetMap.get(id);
              if (target) {
                const pressed = tagged.getAttribute('aria-pressed') === 'true';
                return {
                  key: `${id}:${pressed ? '1' : '0'}`,
                  style: resolveRegistered(target, pressed),
                };
              }
            }
          }

          const interactive = hit.closest(INTERACTIVE);
          if (interactive) {
            return { key: 'press', style: ACTION_STYLE.press };
          }

          return { key: null, style: idle };
        };

        const syncFromPoint = (clientX: number, clientY: number) => {
          const { key, style } = resolveHit(clientX, clientY);
          applyStyle(key, style);
        };

        const show = () => {
          if (visible) return;
          visible = true;
          gsap.to(root, {
            autoAlpha: 1,
            duration: 0.35,
            ease: 'power2.out',
            overwrite: 'auto',
          });
        };

        const hide = () => {
          if (!visible) return;
          visible = false;
          currentKey = null;
          gsap.to(root, {
            autoAlpha: 0,
            duration: 0.25,
            ease: 'power2.in',
            overwrite: 'auto',
          });
          gsap.set(ring, {
            width: idle.size,
            height: idle.size,
            backgroundColor: idle.wash,
            borderColor: idle.border,
          });
          gsap.set(hub, {
            autoAlpha: idle.hub,
            scale: 1,
            backgroundColor: idle.hubColor,
          });
          gsap.set(labelEl, { autoAlpha: 0, scale: 0.92 });
        };

        const onMove = (e: MouseEvent) => {
          lastX = e.clientX;
          lastY = e.clientY;
          xTo(e.clientX);
          yTo(e.clientY);
          show();
          syncFromPoint(e.clientX, e.clientY);
        };

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
          html.classList.remove('has-custom-pointer');
          gsap.set(root, { autoAlpha: 0 });
          window.removeEventListener('mousemove', onMove);
          window.removeEventListener('click', onClick, true);
          document.documentElement.removeEventListener('mouseleave', hide);
          document.removeEventListener('mouseout', onDocOut);
        };
      }
    );

    return () => mm.revert();
  }, [targets]);

  return (
    <div
      ref={rootRef}
      data-custom-pointer
      aria-hidden
      className='pointer-events-none fixed top-0 left-0 z-9999 -translate-x-1/2 -translate-y-1/2'
    >
      <div
        ref={ringRef}
        className='relative flex items-center justify-center rounded-full border border-[rgba(110,122,111,0.42)] bg-[rgba(243,241,234,0.18)] will-change-transform'
        style={{ width: 36, height: 36 }}
      >
        <span
          ref={hubRef}
          className='absolute h-1.5 w-1.5 rounded-full bg-[#6E7A6F]/60'
        />
        <span
          ref={labelRef}
          className='absolute text-[11px] leading-none font-medium tracking-[0.32em] text-[#6E7A6F] uppercase'
        />
      </div>
    </div>
  );
}
