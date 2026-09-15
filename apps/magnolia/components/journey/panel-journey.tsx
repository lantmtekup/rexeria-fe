'use client';

import { useLayoutEffect, useRef } from 'react';
import { gsap, ScrollTrigger } from '@/lib/journey/motion';
import type { Layer } from '@/lib/journey/layers';
import type { PanelConfig } from '@/lib/journey/panel-types';
import {
  attachMouse,
  contentBottom,
  createRenderer,
  layoutItems,
  loadWhenNear,
  resolveItems,
  type Cam,
} from '@/lib/journey/panel-camera';

/**
 * Nhịp scroll (đơn vị: chiều cao khung sticky):
 *   FADE — section trước trượt lên, cảnh chưa hiện; khi đáy nội dung cuối của
 *          nó (card/artwork) còn REVEAL_AT màn tính từ mép trên, cảnh hiện dần
 *          trong SHOW màn (enter 'panelIn' kèm scale 0.92 → 1), xong mới lướt;
 *   PAN  — X from → to theo trang mẫu, dài x × 0.06vh;
 *   HOLD — sticky còn ghim thêm chừng này màn để section chủ đề kế tiếp
 *          (margin-top −100svh) trồi lên đè và cảnh mờ đi. hold 0.8 ⇒ chủ đề
 *          ló mép dưới khi còn 20vh lướt (c-home__cards margin −20vh), sticky
 *          nhả đúng lúc nó chạm mép trên.
 */
const JOURNEY = { revealAt: 0.15, show: 0.5, hold: 0.8 } as const;
// st--panel-out: cảnh mờ về 0 trong 80vh đầu khi chủ đề kế tiếp vào màn.
const PANEL_OUT = 0.8;
// st--panel-in: z 0.2 → 0, panel scale = 1 − 0.4·z.
const PANEL_IN_SCALE = 1 - 0.4 * 0.2;

type PanelJourneyProps = {
  panel: PanelConfig;
  layers: Layer[];
  /** Section ngay trước (Highlights / chủ đề trước) — mốc hiện cảnh. */
  prevSelector: string;
  /** Section chủ đề ngay sau — mốc làm mờ cảnh. */
  nextSelector?: string;
  /** Màu nền khung sticky. */
  ground?: string;
  /**
   * Blend của cả cảnh. Nền giấy: 'multiply' (nền trắng của PNG tan vào nền
   * trang). Nền tối: 'normal' — ảnh chụp có alpha thật, và lớp sáng tự khai
   * 'screen' trong cấu hình panel.
   */
  sceneBlend?: 'multiply' | 'normal';
  /**
   * Lớp phủ khoá theo MÀN, không theo canvas — vignette, dải tối trên/dưới.
   * Không đặt được thành layer của panel: layer đi theo camera nên vignette
   * sẽ trôi ngang cùng cảnh, còn vignette thì phải đứng yên ở khung nhìn.
   */
  overlay?: React.ReactNode;
};

export default function PanelJourney({
  panel,
  layers,
  prevSelector,
  nextSelector,
  ground = '#F8F8F6',
  sceneBlend = 'multiply',
  overlay,
}: PanelJourneyProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const items = resolveItems(layers, panel.images);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const prev = document.querySelector<HTMLElement>(prevSelector);
    if (!section || !prev) return;

    const sticky = section.querySelector<HTMLElement>('[data-panel-sticky]');
    const scene = section.querySelector<HTMLElement>('[data-scene]');
    if (!sticky || !scene) return;
    const els = gsap.utils.toArray<HTMLImageElement>('[data-panel-img]', scene);
    const stopLoading = loadWhenNear(section, els);

    const cam: Cam = { X: panel.pan.from, mx: 0, my: 0 };
    const m = { H: 0, S: 1, fade: 0, pan: 0, active: false };
    const draw = createRenderer(els, items, cam, () => m.S);
    const render = () => m.active && draw();

    const measure = () => {
      const W = sticky.offsetWidth;
      const H = sticky.offsetHeight;
      m.H = H;
      m.S = layoutItems(els, items, W, H);
      // KHÔNG lấn lên section trước nữa. Trang mẫu cho chương `-mt-100svh`
      // vì section nội dung phía trên nó luôn có nội dung phủ kín một màn
      // cuối. Ở đây section trước (Heritage / Residences) kết thúc bằng
      // khoảng rỗng nền than, nên trong 1 màn đầu — lúc `sticky` chưa dính —
      // cảnh nằm ở nửa dưới màn và phía trên là một dải đen lớn.
      // Bỏ lấn: cảnh dính `sticky` ngay, và chỉ chừa đúng đoạn hiện dần.
      m.fade = JOURNEY.show * H;
      m.pan = panel.pan.x * 0.0006 * H;
      section.style.height = `${H + m.fade + m.pan + JOURNEY.hold * H}px`;
      draw();
    };
    measure();
    ScrollTrigger.addEventListener('refreshInit', measure);

    const ctx = gsap.context(() => {
      // opacity (không autoAlpha) khi reveal; visibility chỉ tắt khi section
      // ra hẳn khỏi vùng màn, bật lại từ lúc section chạm mép dưới — trước
      // mốc hiện cảnh rất xa nên kịp raster, không nháy.
      gsap.set(scene, {
        opacity: 0,
        scale: panel.enter === 'panelIn' ? PANEL_IN_SCALE : 1,
      });
      ScrollTrigger.create({
        trigger: section,
        start: 'top bottom',
        end: 'bottom top',
        onToggle: self => {
          m.active = self.isActive;
          scene.style.visibility = self.isActive ? '' : 'hidden';
          // `visibility: hidden` KHÔNG huỷ layer mà `will-change` đã tạo.
          // Để will-change tĩnh trên từng ảnh thì cả hai chương giữ ~30 layer
          // hợp ảnh trong GPU suốt thời gian sống của trang — đo được 2 fps ở
          // giữa trang. Bật theo trạng thái: chỉ chương đang hoạt động mới
          // được promote. Đổi lúc cảnh còn đang mờ nên không thấy nháy.
          for (const el of els)
            el.style.willChange = self.isActive ? 'transform' : 'auto';
          if (self.isActive) draw();
        },
      });

      // 1. Hiện cảnh.
      const reveal = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: prev,
          start: () => `top+=${contentBottom(prev)} ${JOURNEY.revealAt * 100}%`,
          end: () => `+=${JOURNEY.show * m.H}`,
          invalidateOnRefresh: true,
          scrub: true,
        },
      });
      reveal.fromTo(scene, { opacity: 0 }, { opacity: 1, duration: 1 }, 0);
      if (panel.enter === 'panelIn')
        reveal.fromTo(
          scene,
          { scale: PANEL_IN_SCALE },
          { scale: 1, duration: 1, ease: 'sine.inOut' },
          0
        );

      // 2. Mờ đi khi chủ đề kế tiếp trồi lên — ghi lên sticky (scene đã có
      //    tween hiện ra).
      const next = nextSelector
        ? document.querySelector<HTMLElement>(nextSelector)
        : null;
      if (next)
        gsap.fromTo(
          sticky,
          { opacity: 1 },
          {
            opacity: 0,
            ease: 'power1.out',
            immediateRender: false,
            scrollTrigger: {
              trigger: next,
              start: 'top bottom',
              end: () => `+=${PANEL_OUT * m.H}`,
              scrub: true,
              invalidateOnRefresh: true,
            },
          }
        );

      // 3. Lướt ngang — một tween trên proxy, render ghi transform từng ảnh.
      gsap.fromTo(
        cam,
        { X: panel.pan.from },
        {
          X: panel.pan.to,
          ease: 'sine.inOut',
          onUpdate: render,
          scrollTrigger: {
            trigger: section,
            start: () => `top+=${m.fade} top`,
            end: () => `+=${m.pan}`,
            scrub: true,
            invalidateOnRefresh: true,
          },
        }
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
      data-panel={panel.id}
      className='relative z-0 h-[500svh]'
    >
      <div
        data-panel-sticky
        className='sticky top-0 h-svh w-full overflow-hidden'
        style={{ background: ground }}
      >
        {/* mix-blend-multiply = tint #F8F8F6 của trang mẫu: nền PNG trắng →
            đúng màu nền. */}
        <div
          data-scene
          className='pointer-events-none absolute inset-0 opacity-0'
          style={{ mixBlendMode: sceneBlend }}
        >
          {items.map(it => (
            // PNG gốc qua data-src (loadWhenNear) — không qua /_next/image:
            // nét vẽ giữ nguyên, texture nhỏ, không đổi src theo srcset.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={it.src}
              data-panel-img
              data-src={it.src}
              alt=''
              width={it.w}
              height={it.h}
              decoding='async'
              // will-change bật/tắt theo trạng thái trong effect, không đặt
              // tĩnh ở đây — xem onToggle.
              className='absolute top-0 left-0 block h-auto max-w-none select-none'
              style={it.blend ? { mixBlendMode: it.blend } : undefined}
            />
          ))}
        </div>
        {overlay}
      </div>
    </section>
  );
}
