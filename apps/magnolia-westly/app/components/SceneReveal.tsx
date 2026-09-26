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
// cao trên máy dọc phải phóng ~3.8× nên chỉ còn thấy một góc bếp. Hai con số 160
// này phải đi cùng nhau — Tailwind không nội suy được nên đành lặp lại.
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

const COPY = {
  eyebrow: 'THE PAVILION LOBBY',
  title:
    'Sảnh đón đôi cao thoáng, lấy cảm hứng từ những đình các truyền thống Việt',
} as const;

/**
 * Tâm khối chữ khi nó nằm trong ô kính, tính theo % của stage. Đọc ra từ ảnh
 * design rồi quy về hệ toạ độ stage (1440×820).
 */
const WINDOW_POS = { x: 17, y: 31 } as const;

/** Xanh trên bản sketch, trắng khi nằm trên ảnh thật. */
const COPY_COLOR = { sketch: '#56625A', photo: '#FFFFFF' } as const;

export default function SceneReveal() {
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
    const next = wrap.querySelector<HTMLElement>('[data-blend-next]') ?? wrap;

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
      const copy = section.querySelector<HTMLElement>('[data-layer="copy"]');
      const copyShift = section.querySelector<HTMLElement>('[data-copy-shift]');
      const copyItems =
        section.querySelectorAll<HTMLElement>('[data-copy-item]');
      if (!photo || !far || !near || !veil || !copy || !copyShift || !stage)
        return;

      gsap.set(photo, { autoAlpha: 0 });
      // far/near hiện/ẩn theo cổng [data-stage] bên dưới, không tự tắt bật —
      // để không giẫm chân trạng thái reveal.
      gsap.set([far, near], { autoAlpha: 1 });
      gsap.set(copyItems, { autoAlpha: 0 });

      // MÉP TAN + CỔNG — y hệt cặp ProductShowcase → SceneParallax.
      // Mask: dải ngay dưới mép trong suốt rồi đục dần, dài đúng bằng khoảng
      // cách từ mép tới đỉnh màn, nên tại mép section không vẽ gì — không có
      // bậc nào để mắt bắt thành đường cắt. Không scrub: mask phải bám đúng vị
      // trí mép thật. Phủ kín màn thì gỡ hẳn cho khỏi ôm thêm lớp composite.
      // Cổng: bản vẽ chỉ hiện khi FinalResidences bên dưới đã bạc trắng hết
      // (veil bên đó kín ở mốc 65%), kẻo hai lớp chồng nhau.
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

        if (bg) {
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

        gsap.fromTo(
          [stage, copy],
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
      } else {
        gsap.set([stage, copy], { autoAlpha: 1 });
      }

      let revealed = false;
      const nearSplit = isDesktop ? 7 : 4;
      const farSplit = isDesktop ? 4 : 2.5;

      /**
       * Bề ngang quyết định câu ngắt mấy dòng: hẹp để lọt ô kính thì thành 3–4
       * dòng, rộng ra giữa thì gom lại còn 2. Tính bằng px vì cỡ chữ cũng là px
       * cố định — lấy theo % stage sẽ trôi số dòng mỗi khi đổi khổ màn.
       */
      const copyWidth = () => {
        const wide = section.clientWidth >= 1024;
        if (revealed || !isDesktop) {
          return Math.min(wide ? 600 : 420, section.clientWidth - 48);
        }
        return wide ? 340 : 280;
      };

      /** Chỗ đứng của khối chữ theo trạng thái hiện tại. */
      const copyPlacement = () => {
        if (revealed || !isDesktop || !stage) return { x: 0, y: 0 };
        const stageW = stage.offsetWidth;
        // Stage rộng hơn section thì bị xén đều hai bên; ở khổ càng thấp so với
        // 1440/820 phần xén càng lớn và kéo ô kính ra ngoài mép trái. Đẩy chữ
        // sang phải vừa đủ để nó không bị xén theo.
        const clipped = (stageW - section.clientWidth) / 2;
        const wanted = (WINDOW_POS.x / 100) * stageW;
        // Cộng cả biên độ parallax: chữ còn bị scrub kéo thêm ±farSplit% nữa,
        // không trừ hao thì đúng lúc trôi hết sang trái là chữ lẹm mất mép.
        const drift = (farSplit / 100) * stageW;
        const safe = clipped + copyWidth() / 2 + drift + 24;
        return {
          x: Math.max(wanted, safe) - stageW / 2,
          y: ((WINDOW_POS.y - 50) / 100) * stage.offsetHeight,
        };
      };

      /**
       * Đặt chỗ tức thì, không tween: bề ngang đổi thì câu ngắt lại dòng, mà
       * nội suy bề ngang qua từng frame là chữ nhảy dòng liên tục suốt đoạn
       * chuyển — chuyển cảnh của hai lớp ảnh đã đủ để che cú đổi chỗ này.
       */
      const placeCopy = () => {
        // xPercent/yPercent phải khai ở đây chứ không dựa vào `-translate-*` của
        // class: GSAP đụng vào transform là xoá luôn property `translate` của
        // Tailwind, và phần -50% theo trục y không phải lúc nào cũng được nó
        // giữ lại — khối chữ khi đó tụt xuống đúng nửa chiều cao của mình.
        gsap.set(copyShift, {
          width: copyWidth(),
          xPercent: -50,
          yPercent: -50,
          ...copyPlacement(),
        });
        copyShift.style.textAlign = revealed || !isDesktop ? 'center' : 'left';
      };

      /** Màu thì tween được mà không kéo theo reflow, nên vẫn cho nó chạy. */
      const paintCopy = (dur = 0) => {
        gsap.to(copyItems, {
          color: revealed ? COPY_COLOR.photo : COPY_COLOR.sketch,
          // Quầng trắng đọc tốt trên bản vẽ, trên ảnh thật thì đổi sang bóng tối.
          textShadow: revealed
            ? '0 2px 20px rgba(0,0,0,0.55), 0 1px 4px rgba(0,0,0,0.35)'
            : '0 0 28px #fff, 0 0 10px #fff, 0 0 3px #fff',
          duration: dur,
          ease: 'power2.inOut',
          overwrite: 'auto',
        });
      };

      placeCopy();
      paintCopy();
      // copyPlacement trả px nên phải đo lại khi khung đổi kích thước.
      window.addEventListener('resize', placeCopy);
      cleanups.push(() => window.removeEventListener('resize', placeCopy));

      // Entrance chỉ lo phần "an vị" (scale nhả ra, chữ so le) và chạy đúng lúc
      // cổng mở — phần hiện/ẩn là việc của cổng.
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
          { autoAlpha: 0, y: reduce ? 0 : 14 },
          {
            autoAlpha: 1,
            y: 0,
            duration: reduce ? 0 : 0.9,
            stagger: reduce ? 0 : 0.12,
          },
          reduce ? 0 : '-=0.6'
        );

      let covered = false;
      // Suppress section-click toggle after a horizontal drag (whole section
      // is the toggle target — drag would otherwise flip reveal on release).
      let suppressClick = false;

      if (!reduce) {
        // The section holds still via CSS sticky, so no ScrollTrigger pin: the
        // dwell spacer below it *is* the sweep's scroll budget (its own height,
        // 100svh desktop / 60svh mobile — matching the old +=100% / +=60%).
        // Nothing to enable/disable on reveal either, since document height
        // never changes and the user can always scroll out.
        // Keep splits well under BLEED so scroll + mouse never flash stage edges.
        // immediateRender stays on (the default): these from states are not the
        // layers' natural position, so deferring them would leave the layers at
        // 0 until the trigger first renders and then snap them sideways in a
        // single frame as the section reaches the top.
        gsap
          .timeline({
            defaults: { ease: 'none' },
            scrollTrigger: {
              trigger: dwell,
              start: 'top bottom',
              end: 'bottom bottom',
              scrub: true,
              id: 'scene-reveal-scrub',
            },
          })
          .fromTo(near, { xPercent: -nearSplit }, { xPercent: nearSplit }, 0)
          // Chữ trôi cùng cảnh phố chứ không đứng yên — nó nằm sau kính, mà
          // khung cửa sổ thì trượt ngược lại, nên chữ đứng yên sẽ lòi dần ra
          // ngoài ô.
          .fromTo(
            [far, copy],
            { xPercent: farSplit },
            { xPercent: -farSplit },
            0
          );

        // Hand-off to ProductReveal — mirrors the hero: a cream veil (same
        // colour as that section) washes this one out while it rides up, so the
        // two resolve to one flat colour with no seam.
        // Every from state is explicit — an empty one lets GSAP capture
        // whatever is current at first render, and a refresh mid-scroll then
        // records the end value as the start, so scrolling back never undoes it.
        gsap
          .timeline({
            defaults: { ease: 'none' },
            scrollTrigger: {
              trigger: next,
              start: 'top bottom',
              end: 'top 15%',
              scrub: 0.4,
              // The whole section is the reveal toggle and the veil is
              // click-through, so stop it swallowing clicks meant for the
              // section riding over it.
              onUpdate: self => {
                const off = self.progress > 0.6;
                if (off !== covered) {
                  covered = off;
                  section.style.pointerEvents = off ? 'none' : '';
                }
              },
            },
          })
          .fromTo(
            veil,
            { opacity: 0 },
            { opacity: 1, duration: 0.57, immediateRender: false },
            0.25
          )
          // Placeholder that pins the timeline's length to 1. A timeline is
          // only as long as its longest child, so without this the veil would
          // be stretched to fill the whole scroll range and only go solid at
          // the very end instead of at 30% from the top.
          .to({}, { duration: 1 }, 0);
      }

      const panState = { x: 0 };
      const DEPTH = { near: 1, far: 0.42, photo: 0.85 } as const;

      const applyPan = (x: number) => {
        if (revealed) {
          gsap.set(photo, { x: x * DEPTH.photo });
          gsap.set([near, far, copy], { x: 0 });
          return;
        }
        gsap.set(near, { x: x * DEPTH.near });
        gsap.set([far, copy], { x: x * DEPTH.far });
        gsap.set(photo, { x: 0 });
      };

      const resetPan = () => {
        gsap.killTweensOf(panState);
        panState.x = 0;
        gsap.set([near, far, photo, copy], { x: 0 });
      };

      const onToggle = () => {
        if (suppressClick) {
          suppressClick = false;
          return;
        }
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
        // Chữ ở lại qua cả hai chế độ, chỉ đổi chỗ: nấp trong ô kính khi xem
        // sketch, ra chính giữa khi xem ảnh thật.
        // Đổi chỗ và đổi màu trong lúc chữ còn ẩn, rồi mới cho hiện dần tại
        // chỗ mới. Trượt từ vị trí cũ sang thì bề ngang đổi giữa đường và câu
        // nhảy dòng liên tục suốt đoạn bay.
        placeCopy();
        paintCopy();
        gsap.fromTo(
          copyItems,
          { autoAlpha: 0 },
          {
            autoAlpha: 1,
            duration,
            ease: 'power2.out',
            stagger: reduce ? 0 : 0.08,
            overwrite: 'auto',
          }
        );
        section.setAttribute('aria-pressed', String(revealed));
      };

      const onKeyDown = (e: KeyboardEvent) => {
        if (e.key !== 'Enter' && e.key !== ' ') return;
        e.preventDefault();
        onToggle();
      };

      // Whole section is the toggle target — a click anywhere flips the reveal.
      section.addEventListener('click', onToggle);
      section.addEventListener('keydown', onKeyDown);
      cleanups.push(() => {
        section.style.pointerEvents = '';
        section.removeEventListener('click', onToggle);
        section.removeEventListener('keydown', onKeyDown);
      });

      if (finePointer && !reduce) {
        const follow = { duration: 0.8, ease: 'power3.out' } as const;
        const nearX = gsap.quickTo(near, 'x', follow);
        const nearY = gsap.quickTo(near, 'y', follow);
        const farX = gsap.quickTo(far, 'x', follow);
        const farY = gsap.quickTo(far, 'y', follow);
        // Chữ ăn theo cùng giá trị với lớp phố — cùng độ sâu thì cùng biên độ.
        const copyX = gsap.quickTo(copy, 'x', follow);
        const copyY = gsap.quickTo(copy, 'y', follow);

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

          const fx = gsap.utils.clamp(-fMaxX, fMaxX, nx * 28);
          const fy = gsap.utils.clamp(-fMaxY, fMaxY, ny * 10);

          nearX(gsap.utils.clamp(-nMaxX, nMaxX, -nx * 52));
          nearY(gsap.utils.clamp(-nMaxY, nMaxY, -ny * 18));
          farX(fx);
          farY(fy);
          copyX(fx);
          copyY(fy);
        };
        const onLeave = () => {
          if (revealed) return;
          gsap.to([near, far, copy], {
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
      if (isMobile && !reduce) {
        let maxOffset = 0;
        let axis: 'x' | 'y' | null = null;
        let dragTravel = 0;

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
          onPress: () => {
            axis = null;
            dragTravel = 0;
            gsap.killTweensOf(panState);
          },
          onLockAxis: self => {
            axis = self.axis as 'x' | 'y';
          },
          onDrag: self => {
            if (axis !== 'x' || maxOffset <= 0) return;
            dragTravel += Math.abs(self.deltaX);
            panState.x = gsap.utils.clamp(
              -maxOffset,
              maxOffset,
              panState.x + self.deltaX
            );
            applyPan(panState.x);
          },
          onDragEnd: self => {
            if (axis !== 'x' || maxOffset <= 0) return;
            if (dragTravel > 8) suppressClick = true;
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
      data-cursor-id='scene-reveal'
      role='button'
      tabIndex={0}
      aria-pressed='false'
      aria-label='Ảnh sảnh The Pavilion Lobby'
      className='[container-type:size] sticky top-0 z-0 h-svh min-h-120 w-full cursor-pointer overflow-hidden md:min-h-150'
    >
      {/* Nền tách lớp để mờ dần lên trên FinalResidences đang ghim. */}
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
            src='/s5-p3.webp'
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
            className='object-center'
          />
        </div>

        {/* Bản Magnolia: sketch sinh từ ảnh chụp nên không có lỗ kính trong suốt —
            chữ luôn nằm trên `near` (z-[1] ở mọi khổ) để còn đọc được.
            Ghi chú gốc: Nằm giữa `far` và `near` — đúng thứ tự DOM này mới ra hiệu ứng chữ
            hiện qua lỗ kính, phần tràn ra ngoài bị khung và tường của lớp bếp
            che. Đưa lên trên `near` là mất hẳn chiều sâu.
            Dưới `md` thì ngược lại: ô kính nằm ở 17% bề ngang stage, mà stage
            rộng hơn màn nên nó rơi ra ngoài mép trái — copyPlacement() vì vậy
            trả chữ về giữa, tức là đúng chỗ tủ bếp che kín. Cho chữ lên trên
            `near` để nó còn đọc được; hiệu ứng lỗ kính chỉ chạy từ `md`. */}
        <div
          data-layer='copy'
          className='pointer-events-none absolute inset-0 z-[1] will-change-transform'
        >
          <div
            data-copy-shift
            className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 will-change-transform'
          >
            <p
              data-copy-item
              className='font-ui invisible text-xs leading-none font-medium tracking-[0.2em] text-[#6E7A6F] uppercase [text-shadow:0_0_14px_#fff,0_0_4px_#fff]'
            >
              {COPY.eyebrow}
            </p>
            <h2
              data-copy-item
              className='invisible mt-4 text-[30px] leading-tight font-medium text-[#56625A] [text-shadow:0_0_28px_#fff,0_0_10px_#fff,0_0_3px_#fff] sm:text-[38px] lg:text-[48px]'
            >
              {COPY.title}
            </h2>
          </div>
        </div>

        <div
          data-layer='near'
          className='invisible absolute will-change-transform'
          style={LAYER_INSET}
        >
          <Image
            src='/s5-p1.webp'
            alt='Sảnh The Pavilion Lobby tại The Magnolia'
            fill
            sizes={LAYER_SIZES}
            className='object-center'
          />
        </div>
      </div>

      {/* Blend veil — same colour as ProductReveal, so this section dissolves
          into it instead of being cut off by a hard edge. */}
      <div
        data-layer='veil'
        aria-hidden
        className='pointer-events-none absolute inset-0 z-20 bg-[#F3F1EA] opacity-0'
      />
    </section>
  );
}
