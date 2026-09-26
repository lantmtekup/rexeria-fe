'use client';

import Image from 'next/image';
import { useLayoutEffect, useRef } from 'react';
import {
  gsap,
  Observer,
  ScrollTrigger,
  MOTION_CONDITIONS,
  type MotionConditions,
} from '../lib/motion';

/**
 * Layer bleed past the stage — single source for CSS inset, Image sizes,
 * and mouse-parallax clamps. Tuned for parallax headroom (not derived from PNG).
 * Must exceed scroll xPercent + mouse travel so edges never flash.
 */
const BLEED = { x: 16, y: 5 } as const;
// Stage = max(100cqw, 100cqh·1440/820) — portrait mobile bị chiều cao quyết định,
// nên sizes phải theo vh thay vì vw kẻo Next serve variant quá nhỏ (mờ).
const STAGE_RATIO = 1440 / 820;
// Dưới `md` stage bị chặn ở 160vw (xem class của [data-stage]): cover theo chiều
// cao trên máy dọc phải phóng ~3.8× nên chỉ còn thấy một góc phòng. Hai con số
// 160 này phải đi cùng nhau — Tailwind không nội suy được nên đành lặp lại.
const STAGE_WIDTH = `max(100vw, ${Math.round(STAGE_RATIO * 100)}vh)`;
const BLEED_SCALE = (100 + BLEED.x * 2) / 100;
const LAYER_SIZES = [
  `(max-width: 767px) calc(min(160vw, ${STAGE_WIDTH}) * ${BLEED_SCALE})`,
  `calc(${STAGE_WIDTH} * ${BLEED_SCALE})`,
].join(', ');
const LAYER_INSET = {
  top: `-${BLEED.y}%`,
  right: `-${BLEED.x}%`,
  bottom: `-${BLEED.y}%`,
  left: `-${BLEED.x}%`,
} as const;

const LABELS = {
  show: 'XEM CĂN 3 PHÒNG NGỦ',
  hide: 'QUAY LẠI',
} as const;

const COPY = {
  eyebrow: 'CĂN 3 PHÒNG NGỦ',
  title: 'Các phòng mở ra quanh một trục sáng chạy suốt chiều sâu căn hộ.',
} as const;

export default function SceneParallax() {
  const sectionRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    // The section is sticky, so its own rect is unreliable for ScrollTrigger
    // measurement. Everything is triggered off siblings in normal flow: the
    // wrapper for entry, the dwell spacer for the sweep, the next section for
    // the hand-off.
    const wrap = section.parentElement ?? section;
    const dwell = wrap.querySelector<HTMLElement>('[data-dwell]') ?? wrap;
    const next = document.querySelector<HTMLElement>('#residences') ?? wrap;

    const mm = gsap.matchMedia(section);

    mm.add(MOTION_CONDITIONS, ctx => {
      const { isDesktop, isMobile, finePointer, reduce } =
        ctx.conditions as MotionConditions;
      const cleanups: Array<() => void> = [];

      const bg = section.querySelector<HTMLElement>('[data-layer="bg"]');
      const photo = section.querySelector<HTMLElement>('[data-layer="photo"]');
      const far = section.querySelector<HTMLElement>('[data-layer="far"]');
      const near = section.querySelector<HTMLElement>('[data-layer="near"]');
      const veil = section.querySelector<HTMLElement>('[data-layer="veil"]');
      const stage = section.querySelector<HTMLElement>('[data-stage]');
      const reveal = section.querySelector<HTMLButtonElement>('[data-reveal]');
      const label = section.querySelector<HTMLElement>('[data-reveal-label]');
      const copyWrap = section.querySelector<HTMLElement>('[data-copy]');
      const copyItems =
        section.querySelectorAll<HTMLElement>('[data-copy-item]');
      if (!photo || !far || !near || !veil || !reveal || !label || !stage)
        return;

      gsap.set(photo, { autoAlpha: 0 });
      // far/near hiện/ẩn theo cổng [data-stage] bên dưới, không tự tắt bật —
      // để không giẫm chân trạng thái reveal.
      gsap.set([far, near], { autoAlpha: 1 });
      gsap.set(reveal, { autoAlpha: 0 });
      gsap.set(copyItems, { autoAlpha: 0 });

      // MÉP TAN — thứ giữ cho section trườn lên không thành một nhát cắt.
      // Section full-bleed: mép trên của nó quét ngang màn hình, nét vẽ bị chặt
      // cụt ngay tại đó. Mask cho dải ngay dưới mép trong suốt rồi đục dần, dài
      // đúng bằng khoảng cách từ mép tới đỉnh màn — nên tại mép section không
      // vẽ gì cả, không có bậc nào để mắt bắt thành đường.
      // Là MASK chứ không phải một lớp trắng phủ lên: nó hoà vào đúng thứ đang
      // nằm dưới, nên vẫn sạch cả lúc ProductShowcase chưa bạc trắng hẳn.
      // KHÔNG scrub: mask phải bám đúng vị trí mép thật, trễ một nhịp là hở
      // bậc. Phủ kín màn thì gỡ hẳn mask, khỏi ôm thêm một lớp composite suốt
      // phần còn lại của trang.
      if (!reduce) {
        const paintFeather = (progress: number) => {
          const px = Math.round(window.innerHeight * (1 - progress));
          const mask =
            px > 1
              ? `linear-gradient(to bottom, transparent 0px, #000 ${px}px)`
              : '';
          section.style.maskImage = mask;
          section.style.webkitMaskImage = mask;
        };

        const feather = ScrollTrigger.create({
          trigger: wrap,
          start: 'top bottom',
          end: 'top top',
          onUpdate: self => paintFeather(self.progress),
          onLeave: () => paintFeather(1),
          onLeaveBack: () => paintFeather(0),
          onRefresh: self => paintFeather(self.progress),
        });

        cleanups.push(() => {
          feather.kill();
          section.style.maskImage = '';
          section.style.webkitMaskImage = '';
        });
      }

      if (bg && !reduce) {
        // ProductShowcase bị ghim vẫn nằm ngay dưới section này cho tới khi nền
        // đục hẳn. Nền ship sẵn đục trong markup (không JS vẫn đúng) và chỉ mờ
        // dần vào SAU khi veil của section đó đã kín (mốc 65%) — tức là chồng
        // trắng lên trắng, không nhìn thấy gì, nên không có mép cứng quét qua.
        gsap.fromTo(
          bg,
          { opacity: 0 },
          {
            opacity: 1,
            ease: 'none',
            scrollTrigger: {
              trigger: wrap,
              start: 'top 64%',
              end: 'top 52%',
              scrub: 0.4,
            },
          }
        );
      }

      // CỔNG — bản vẽ chỉ được hiện khi bên dưới đã là một mảng trắng phẳng.
      // Hiện sớm hơn là hai lớp nét chì chồng lên nhau (card Penthouse B còn
      // nguyên, phòng ngấm qua nó) — rối mắt. Mốc 50% nằm sau veil (65%) và nền
      // (52%), nên lúc bản vẽ vào thì showcase đã bạc hẳn. Vẫn còn nửa màn nữa
      // để nó trườn lên, thấy rõ từng nấc.
      // Là scrub nên cuộn ngược lên nó tan ngược y hệt — chỗ `once` không lo
      // được. Gác ở hai cái bọc [data-stage]/[data-copy] mà không tween nào
      // khác đụng tới, nên trạng thái reveal bên trong không bị giẫm.
      const gate: HTMLElement[] = copyWrap ? [stage, copyWrap] : [stage];
      if (reduce) {
        gsap.set(gate, { autoAlpha: 1 });
      } else {
        gsap.fromTo(
          gate,
          { autoAlpha: 0 },
          {
            autoAlpha: 1,
            ease: 'none',
            scrollTrigger: {
              trigger: wrap,
              start: 'top 62%',
              end: 'top 50%',
              scrub: 0.4,
            },
          }
        );
      }

      // Entrance chỉ lo phần "an vị" (scale nhả ra, copy so le) và chạy đúng
      // lúc cổng mở — phần hiện/ẩn là việc của cổng.
      const enter = gsap.timeline({
        defaults: { ease: 'power3.out', duration: reduce ? 0 : 1.1 },
        scrollTrigger: { trigger: wrap, start: 'top 50%', once: true },
      });
      enter
        .fromTo([far, near], { scale: reduce ? 1 : 1.06 }, { scale: 1 })
        .fromTo(
          photo,
          { scale: reduce ? 1 : 1.04 },
          { scale: 1, duration: reduce ? 0 : 1.2 },
          0
        )
        .fromTo(
          copyItems,
          { autoAlpha: 0, y: reduce ? 0 : 16 },
          {
            autoAlpha: 1,
            y: 0,
            duration: reduce ? 0 : 0.9,
            stagger: reduce ? 0 : 0.12,
          },
          reduce ? 0 : '-=0.6'
        )
        .fromTo(
          reveal,
          { autoAlpha: 0, y: reduce ? 0 : 16 },
          { autoAlpha: 1, y: 0, duration: reduce ? 0 : 0.8 },
          reduce ? 0 : '-=0.5'
        );

      let revealed = false;
      const nearSplit = isDesktop ? 7 : 4;
      const farSplit = isDesktop ? 4 : 2.5;

      if (!reduce) {
        // The section holds still via CSS sticky, so no ScrollTrigger pin: the
        // dwell spacer below it *is* the sweep's scroll budget (its own height,
        // 100svh desktop / 60svh mobile — matching the old +=100% / +=60%).
        // Nothing to enable/disable on reveal either, since document height
        // never changes and the user can always scroll out.
        // Keep splits well under BLEED so scroll + mouse never flash stage edges.
        gsap
          .timeline({
            defaults: { ease: 'none' },
            scrollTrigger: {
              trigger: dwell,
              start: 'top bottom',
              end: 'bottom bottom',
              scrub: true,
              id: 'scene-parallax-scrub',
            },
          })
          // immediateRender stays on (the default): these from states are not
          // the layers' natural position, so deferring them would leave the
          // layers at 0 until the trigger first renders and then snap them
          // ~146px sideways in a single frame as the section reaches the top.
          .fromTo(near, { xPercent: nearSplit }, { xPercent: -nearSplit }, 0)
          .fromTo(far, { xPercent: -farSplit }, { xPercent: farSplit }, 0);

        // Hand-off to FinalResidences — mirrors the hero: a cream veil (same
        // colour as that section) washes this one out while it rides up, so
        // the two resolve to one flat colour with no seam. The veil covers the
        // reveal button, so that fades out too or it stays clickable underneath.
        // Every from state is explicit — an empty one lets GSAP capture
        // whatever is current at first render, and a refresh mid-scroll then
        // records autoAlpha 0 as the start, so scrolling back never restores it.
        //
        // Kết ở 'top 65%' như cặp ProductShowcase → section này: bản vẽ phòng
        // phải bạc hết TRƯỚC khi chữ và card của FinalResidences hiện lên, kẻo
        // hai lớp chồng nhau. Bên đó canh theo đúng mốc này (nền 64%, nội dung
        // 50%).
        gsap
          .timeline({
            defaults: { ease: 'none' },
            scrollTrigger: {
              trigger: next,
              start: 'top bottom',
              end: 'top 65%',
              scrub: 0.4,
            },
          })
          .fromTo(
            veil,
            { opacity: 0 },
            { opacity: 1, duration: 0.85, immediateRender: false },
            0
          )
          .fromTo(
            reveal,
            { autoAlpha: 1 },
            { autoAlpha: 0, duration: 0.25, immediateRender: false },
            0
          )
          // Placeholder that pins the timeline's length to 1. A timeline is
          // only as long as its longest child, so without this the veil (which
          // ends at 0.82) would be stretched to fill the whole scroll range and
          // only go solid at the very end instead of at 30% from the top.
          .to({}, { duration: 1 }, 0);
      }

      // Shared pan state — mobile drag + reveal reset both use this.
      const panState = { x: 0 };
      const DEPTH = { near: 1, far: 0.42, photo: 0.85 } as const;

      const applyPan = (x: number) => {
        if (revealed) {
          gsap.set(photo, { x: x * DEPTH.photo });
          gsap.set([near, far], { x: 0 });
          return;
        }
        gsap.set(near, { x: x * DEPTH.near });
        gsap.set(far, { x: x * DEPTH.far });
        gsap.set(photo, { x: 0 });
      };

      const resetPan = () => {
        gsap.killTweensOf(panState);
        panState.x = 0;
        gsap.set([near, far, photo], { x: 0 });
      };

      const onReveal = () => {
        revealed = !revealed;
        const duration = reduce ? 0 : 0.7;
        resetPan();

        gsap.to(photo, {
          autoAlpha: revealed ? 1 : 0,
          duration,
          ease: 'power2.inOut',
        });
        gsap.to([near, far], {
          autoAlpha: revealed ? 0 : 1,
          scale: revealed ? 1.02 : 1,
          duration,
          ease: 'power2.inOut',
          stagger: 0.06,
        });
        // Copy đứng yên qua cả hai chế độ — nó nói về căn hộ chứ không phải về
        // riêng bản sketch, nên chỉ lớp ảnh bên dưới đổi.
        label.textContent = revealed ? LABELS.hide : LABELS.show;
        reveal.setAttribute('aria-pressed', String(revealed));
        reveal.setAttribute('aria-label', revealed ? LABELS.hide : LABELS.show);
      };

      reveal.addEventListener('click', onReveal);
      cleanups.push(() => reveal.removeEventListener('click', onReveal));

      if (finePointer && !reduce) {
        const follow = { duration: 0.8, ease: 'power3.out' } as const;
        const nearX = gsap.quickTo(near, 'x', follow);
        const nearY = gsap.quickTo(near, 'y', follow);
        const farX = gsap.quickTo(far, 'x', follow);
        const farY = gsap.quickTo(far, 'y', follow);

        // Bleed is % of stage; xPercent travel is % of layer width — reserve that in px.
        const maxNearX = () => {
          const bleedPx = (section.offsetWidth * BLEED.x) / 100;
          const scrollPx = (near.offsetWidth * nearSplit) / 100;
          return Math.max(0, bleedPx - scrollPx);
        };
        const maxFarX = () => {
          const bleedPx = (section.offsetWidth * BLEED.x * 0.55) / 100;
          const scrollPx = (far.offsetWidth * farSplit) / 100;
          return Math.max(0, bleedPx - scrollPx);
        };
        const maxNearY = () => (section.offsetHeight * BLEED.y) / 100;
        const maxFarY = () =>
          (section.offsetHeight * (BLEED.y * (2 / 3))) / 100;

        const onMove = (e: MouseEvent) => {
          if (revealed) return;
          const r = section.getBoundingClientRect();
          const nx = ((e.clientX - r.left) / r.width) * 2 - 1;
          const ny = ((e.clientY - r.top) / r.height) * 2 - 1;

          const nMaxX = maxNearX();
          const fMaxX = maxFarX();
          const nMaxY = maxNearY();
          const fMaxY = maxFarY();

          nearX(gsap.utils.clamp(-nMaxX, nMaxX, -nx * 52));
          nearY(gsap.utils.clamp(-nMaxY, nMaxY, -ny * 18));
          farX(gsap.utils.clamp(-fMaxX, fMaxX, nx * 28));
          farY(gsap.utils.clamp(-fMaxY, fMaxY, ny * 10));
        };
        const onLeave = () => {
          if (revealed) return;
          gsap.to([near, far], {
            x: 0,
            y: 0,
            duration: 1,
            ease: 'power2.out',
          });
        };

        section.addEventListener('mousemove', onMove);
        section.addEventListener('mouseleave', onLeave);
        cleanups.push(() => {
          section.removeEventListener('mousemove', onMove);
          section.removeEventListener('mouseleave', onLeave);
        });
      }

      // Mobile: horizontal drag with depth parallax (near full, far slower).
      // Clamped to BLEED headroom so scroll scrub + drag never flash edges.
      if (isMobile && !reduce) {
        let maxOffset = 0;
        let axis: 'x' | 'y' | null = null;

        const refreshMaxOffset = () => {
          const bleedPx = (section.offsetWidth * BLEED.x) / 100;
          const nearScrollPx = (near.offsetWidth * nearSplit) / 100;
          const bleedRoom = Math.max(0, bleedPx - nearScrollPx);
          const stageOverflow = stage
            ? Math.max(0, (stage.offsetWidth - section.clientWidth) / 2)
            : 0;
          maxOffset = Math.max(bleedRoom, stageOverflow * 0.55);
          panState.x = gsap.utils.clamp(-maxOffset, maxOffset, panState.x);
          applyPan(panState.x);
        };

        refreshMaxOffset();
        section.style.touchAction = 'pan-y';

        const observer = Observer.create({
          target: section,
          type: 'touch,pointer',
          dragMinimum: 6,
          lockAxis: true,
          onPress: self => {
            // Let the reveal button keep its tap — don't steal the gesture.
            const t = self.event.target;
            if (t instanceof Element && t.closest('[data-reveal]')) {
              axis = 'y';
              return;
            }
            axis = null;
            gsap.killTweensOf(panState);
          },
          onLockAxis: self => {
            if (axis === 'y') return;
            axis = self.axis as 'x' | 'y';
          },
          onDrag: self => {
            if (axis !== 'x' || maxOffset <= 0) return;
            panState.x = gsap.utils.clamp(
              -maxOffset,
              maxOffset,
              panState.x + self.deltaX
            );
            applyPan(panState.x);
          },
          onDragEnd: self => {
            if (axis !== 'x' || maxOffset <= 0) return;
            const projected = gsap.utils.clamp(
              -maxOffset,
              maxOffset,
              panState.x + self.velocityX * 0.18
            );
            gsap.to(panState, {
              x: projected,
              duration: 0.55,
              ease: 'power2.out',
              onUpdate: () => {
                applyPan(panState.x);
              },
            });
          },
          onRelease: () => {
            axis = null;
          },
        });

        window.addEventListener('resize', refreshMaxOffset);
        cleanups.push(() => {
          observer.kill();
          window.removeEventListener('resize', refreshMaxOffset);
          section.style.touchAction = '';
          resetPan();
        });
      }

      if (cleanups.length === 0) return;
      return () => {
        cleanups.forEach(fn => fn());
      };
    });

    return () => mm.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className='[container-type:size] sticky top-0 z-0 h-svh min-h-120 w-full overflow-hidden md:min-h-150'
    >
      {/* Nền tách thành lớp riêng để mờ dần lên trên ProductShowcase đang ghim. */}
      <div
        data-layer='bg'
        aria-hidden
        className='absolute inset-0 -z-10 bg-white'
      />

      <div
        data-stage
        className='pointer-events-none absolute top-1/2 left-1/2 aspect-[1440/820] w-[min(160cqw,max(100cqw,calc(100cqh*1440/820)))] -translate-x-1/2 -translate-y-1/2 overflow-hidden mask-[linear-gradient(to_bottom,transparent,#000_8%,#000_92%,transparent)] md:w-[max(100cqw,calc(100cqh*1440/820))] md:mask-none'
      >
        <div
          data-layer='photo'
          className='invisible absolute inset-0 will-change-transform'
          aria-hidden
        >
          <Image
            src='/s3-p3.webp'
            alt=''
            fill
            sizes={LAYER_SIZES}
            className='object-cover object-center'
          />
        </div>

        <div
          data-layer='far'
          className='invisible absolute will-change-transform'
          style={LAYER_INSET}
        >
          <Image
            src='/blank.png'
            alt=''
            fill
            sizes={LAYER_SIZES}
            className='object-cover object-center'
          />
        </div>

        <div
          data-layer='near'
          className='invisible absolute will-change-transform'
          style={LAYER_INSET}
        >
          <Image
            src='/s3-p1.webp'
            alt='Căn 3 phòng ngủ tại The Magnolia'
            fill
            sizes={LAYER_SIZES}
            className='object-cover object-center'
          />
        </div>
      </div>

      {/* Copy + CTA ride together as one centred stack, so the group stays
          optically centred on the stage instead of the button alone. The
          wrapper is inert — only the button takes the pointer, which keeps the
          mobile drag Observer working across the whole section. */}
      <div
        data-copy
        className='pointer-events-none absolute inset-x-0 top-1/2 z-10 flex -translate-y-1/2 flex-col items-center px-6 text-center'
      >
        <p
          data-copy-item
          className='font-ui invisible text-xs leading-none font-medium tracking-[0.2em] text-[#6E7A6F] uppercase [text-shadow:0_0_14px_#fff,0_0_4px_#fff]'
        >
          {COPY.eyebrow}
        </p>

        <h2
          data-copy-item
          className='invisible max-w-[min(100%,44rem)] text-[28px] leading-tight font-medium text-[#56625A] [text-shadow:0_0_28px_#fff,0_0_10px_#fff,0_0_3px_#fff] sm:text-[36px] lg:text-5xl'
        >
          {COPY.title}
        </h2>

        <button
          data-reveal
          data-cursor-id='scene-parallax'
          type='button'
          aria-pressed='false'
          aria-label={LABELS.show}
          className='pointer-events-auto invisible mt-10 cursor-pointer border border-neutral-200 bg-white px-6 py-2.5 text-[11px] font-medium tracking-[0.2em] whitespace-nowrap text-neutral-700 shadow-sm transition-colors hover:border-[#6E7A6F] hover:bg-[#6E7A6F] hover:text-white md:px-10 md:tracking-[0.35em] lg:mt-14'
        >
          <span data-reveal-label>{LABELS.show}</span>
        </button>
      </div>

      {/* Blend veil — same colour as FinalResidences, so this section
          dissolves into it instead of being cut off by a hard edge. */}
      <div
        data-layer='veil'
        aria-hidden
        className='pointer-events-none absolute inset-0 z-20 bg-[#F3F1EA] opacity-0'
      />
    </section>
  );
}
