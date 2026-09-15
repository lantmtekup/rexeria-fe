'use client';

import { useLayoutEffect, useRef } from 'react';
import { gsap, ScrollTrigger } from '../lib/motion';
import type { Layer } from '../lib/layers';
import type { PanelConfig } from '../lib/panels';
import {
  PANEL_H,
  attachMouse,
  contentBottom,
  createRenderer,
  layoutItems,
  loadWhenNear,
  panelScale,
  resolveItems,
  type Cam,
} from '../lib/panelCamera';

/**
 * Cảnh kết (trang mẫu: sau chủ đề Solomeo). Panel Solomeo quay lại ở vị trí
 * lướt cuối, rồi:
 *   OUT — 80vh: Solomeo `{z 0 → 1, alpha → 0.5}` (scale 1 → 0.6);
 *   END — 80vh: panel `home-end` (trên cùng) `{z −3 → 0.3}` (scale 2.2 → 0.88),
 *         alpha 0 → 1 trong 25% đầu. Panel end = ảnh end (486×1080, trong vòm
 *         trong suốt) giữa hai dải blank 2000 — hai bên che Solomeo, trong
 *         vòm vẫn thấy Solomeo mờ phía sau.
 * Trang dừng ở khung End.
 */
const STEP = { revealAt: 0.15, show: 0.5, out: 0.8, end: 0.8, hold: 0.3 };
const zScale = (z: number) => 1 - 0.4 * z;

type EndSceneProps = {
  panel: PanelConfig;
  layers: Layer[];
  end: Layer;
  prevSelector: string;
};

export default function EndScene({
  panel,
  layers,
  end,
  prevSelector,
}: EndSceneProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const items = resolveItems(layers, panel.images);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const prev = document.querySelector<HTMLElement>(prevSelector);
    if (!section || !prev) return;

    const q = <T extends Element>(sel: string) => section.querySelector<T>(sel);
    const sticky = q<HTMLElement>('[data-panel-sticky]');
    const scene = q<HTMLElement>('[data-scene]');
    const endLayer = q<HTMLElement>('[data-end]');
    const endArt = q<HTMLElement>('[data-end-art]');
    const endImg = q<HTMLImageElement>('[data-end-img]');
    if (!sticky || !scene || !endLayer || !endArt || !endImg) return;
    const els = gsap.utils.toArray<HTMLImageElement>('[data-panel-img]', scene);
    const stopLoading = loadWhenNear(section, [...els, endImg]);

    const cam: Cam = { X: panel.pan.to, mx: 0, my: 0 };
    const m = { H: 0, S: 1, fade: 0, active: false };
    const draw = createRenderer(els, items, cam, () => m.S);
    const render = () => m.active && draw();

    const measure = () => {
      const W = sticky.offsetWidth;
      const H = sticky.offsetHeight;
      m.H = H;
      m.S = layoutItems(els, items, W, H);
      const S = panelScale(H);
      endArt.style.height = `${PANEL_H * S}px`;
      endArt.style.width = `${end.w * S}px`;
      m.fade =
        H -
        (prev.offsetHeight - contentBottom(prev)) +
        (STEP.show - STEP.revealAt) * H;
      section.style.height = `${H + m.fade + (STEP.out + STEP.end + STEP.hold) * H}px`;
      draw();
    };
    measure();
    ScrollTrigger.addEventListener('refreshInit', measure);

    const ctx = gsap.context(() => {
      gsap.set(scene, { opacity: 0 });
      gsap.set(endLayer, { opacity: 0 });
      gsap.set(endArt, { scale: zScale(-3) });

      ScrollTrigger.create({
        trigger: section,
        start: 'top bottom',
        end: 'bottom top',
        onToggle: self => {
          m.active = self.isActive;
          sticky.style.visibility = self.isActive ? '' : 'hidden';
          if (self.isActive) draw();
        },
      });

      // Solomeo quay lại khi card cuối chủ đề Solomeo gần ra hết.
      gsap.fromTo(
        scene,
        { opacity: 0 },
        {
          opacity: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: prev,
            start: () => `top+=${contentBottom(prev)} ${STEP.revealAt * 100}%`,
            end: () => `+=${STEP.show * m.H}`,
            invalidateOnRefresh: true,
            scrub: true,
          },
        }
      );

      // OUT rồi END, nối tiếp trong một timeline (đơn vị = màn).
      gsap
        .timeline({
          defaults: { ease: 'sine.inOut' },
          scrollTrigger: {
            trigger: section,
            start: () => `top+=${m.fade} top`,
            end: () => `+=${(STEP.out + STEP.end) * m.H}`,
            scrub: true,
            invalidateOnRefresh: true,
          },
        })
        // Solomeo lùi ra: scale trên lớp bọc, opacity trên sticky (scene đã có
        // tween hiện ra).
        .fromTo(
          scene.parentElement,
          { scale: 1 },
          { scale: zScale(1), duration: STEP.out },
          0
        )
        .fromTo(
          scene.parentElement,
          { opacity: 1 },
          { opacity: 0.5, duration: STEP.out },
          0
        )
        .fromTo(
          endArt,
          { scale: zScale(-3) },
          { scale: zScale(0.3), duration: STEP.end },
          STEP.out
        )
        .fromTo(
          endLayer,
          { opacity: 0 },
          { opacity: 1, duration: STEP.end * 0.25 },
          STEP.out
        );
    }, section);

    const detachMouse = attachMouse(section, cam, render);

    return () => {
      ScrollTrigger.removeEventListener('refreshInit', measure);
      stopLoading();
      detachMouse();
      ctx.revert();
      section.style.height = '';
    };
    // Dữ liệu layer tĩnh (đọc từ server) — chạy một lần.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section
      ref={sectionRef}
      data-panel='end'
      className='relative z-0 -mt-[100svh] h-[400svh]'
    >
      <div
        data-panel-sticky
        className='sticky top-0 h-svh w-full overflow-hidden bg-[#F8F8F6]'
      >
        {/* Lớp bọc Solomeo: scale/opacity lúc lùi ra (tâm = tâm màn). */}
        <div className='absolute inset-0'>
          <div
            data-scene
            className='pointer-events-none absolute inset-0 opacity-0 mix-blend-multiply'
          >
            {items.map(it => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={it.src}
                data-panel-img
                data-src={it.src}
                alt=''
                width={it.w}
                height={it.h}
                decoding='async'
                className='absolute top-0 left-0 block h-auto max-w-none will-change-transform select-none'
              />
            ))}
          </div>
        </div>

        <svg aria-hidden className='absolute h-0 w-0'>
          <filter id='end-tint' colorInterpolationFilters='sRGB'>
            {/* R, G × 248/255; B × 246/255 → trắng thành đúng #F8F8F6. */}
            <feColorMatrix
              type='matrix'
              values='0.97255 0 0 0 0  0 0.97255 0 0 0  0 0 0.96471 0 0  0 0 0 1 0'
            />
          </filter>
        </svg>

        {/* Panel end: ảnh end giữa màn + hai dải blank (2000 đơn vị) hai bên,
            cùng scale — như home-end của trang mẫu. */}
        <div
          data-end
          className='pointer-events-none absolute inset-0 grid place-items-center opacity-0'
        >
          <div data-end-art className='relative will-change-transform'>
            <div
              className='absolute top-0 right-full h-full bg-[#F8F8F6]'
              style={{ width: `${(2000 / end.w) * 100}%` }}
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              data-end-img
              data-src={end.src}
              alt='Brunello Cucinelli'
              width={end.w}
              height={end.h}
              decoding='async'
              // Tint #F8F8F6 như trang mẫu (Pixi tint = nhân từng kênh). Không
              // dùng mix-blend: lớp End có opacity riêng nên blend chỉ trộn
              // trong nhóm, nền trắng của PNG lộ thành khung sáng.
              className='block h-full w-full max-w-none [filter:url(#end-tint)]'
            />
            <div
              className='absolute top-0 left-full h-full bg-[#F8F8F6]'
              style={{ width: `${(2000 / end.w) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
