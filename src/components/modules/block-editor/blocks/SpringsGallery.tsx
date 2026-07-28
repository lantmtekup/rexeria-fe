'use client';

/**
 * Block "Springs - Gallery Intro" — port section `#l-gallery-sticky`
 * (`.l-gallery__split`) gốc của springs-estate-clone, đứng NGAY SAU Header,
 * TRƯỚC Hero (`#about`) — bị BỎ SÓT ở lần khảo sát đầu (gộp nhầm chung với
 * `#about` thành 1 "Hero"; thực tế 2 id độc lập, xem
 * `references/springs-estate-case-study.md` trong skill `site-clone-completion`).
 *
 * Gốc: `.l-gallery-container` cao 200vh, 2 cột ảnh (`col--md-6`) xoay chéo
 * `rotate(-28deg)`, mỗi cột là 1 `mask-list` 3 ảnh (thư mục gốc
 * `0.preloader/preloader-left-1/2/3` + `preloader-right-1/2/3`) đổi ảnh khi
 * cuộn, kết thúc bằng `.l-gallery__split` — 2 clip-path mở theo 2 hướng
 * ngược nhau (cột trên mở xuống, cột dưới mở lên) để bàn giao sang Hero.
 * Ở đây port bằng GSAP pin+scrub: rotate nhẹ hơn gốc (-8deg thay vì -28deg,
 * tránh lộ góc trống ở viewport hẹp) + mỗi cột crossfade tuần tự 3 ảnh +
 * cùng cơ chế clip-path curtain (`CLIP_HIDDEN_BOTTOM`→`CLIP_FULL`) đã dùng ở
 * `SpringsHero.tsx`/`SpringsMap.tsx` cho đoạn bàn giao cuối.
 *
 * Preloader: gốc dùng Locomotive `data-plugin="preloader"` chặn tương tác
 * tới khi asset sẵn sàng. Ở đây KHÔNG dựng Locomotive (đúng R1, không thêm
 * runtime nặng ngoài GSAP) — xấp xỉ bằng 1 overlay full-viewport (logo
 * "Springs" + gradient wash) fade-out bằng GSAP ngay khi block mount, hoặc
 * ẩn ngay lập tức nếu `prefers-reduced-motion`.
 *
 * Mobile (`useContainerMobile`): bản gốc gallery cũng ẩn/đổi hành vi mạnh ở
 * mobile — ở đây GIỮ tĩnh, không pin, không rotate (tránh tràn ngang), chỉ
 * hiện ảnh đầu mỗi cột xếp cạnh nhau.
 */
import * as React from 'react';
import gsap from 'gsap';

import { useBlockMotion } from '../motion/LandingMotion';
import type {
  BlockBackground,
  ElementPositionsMap,
  ElementStylesMap,
  SpringsGalleryContent,
} from '../types';
import {
  blockBackgroundStyle,
  composeStyle,
  elementStyleOf,
  orderStyle,
  positionStyle,
  selectableClass,
} from './applyStyle';
import { useContainerMobile } from './useContainerMobile';

const GALLERY_FONT_SERIF =
  "'Victor Serif', 'Cormorant Garamond', Georgia, 'Times New Roman', serif";
const GALLERY_BG = '#162d24';

/** clip-path đầy đủ — cùng quy ước `SpringsHero.tsx` (gallery không cần
 *  trạng thái ẩn-dưới-đáy vì đây là block ĐẦU TIÊN, không có curtain-reveal
 *  vào — chỉ fade ra ở cuối để bàn giao sang Hero). */
const GALLERY_CLIP_FULL = 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)';

interface Props {
  content: SpringsGalleryContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
}

export function SpringsGallery({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
}: Props) {
  const rootRef = React.useRef<HTMLElement>(null);
  const isMobile = useContainerMobile(rootRef);
  const images = Array.isArray(content.images) ? content.images : [];
  const left = images.slice(0, 3);
  const right = images.slice(3, 6);

  const styleOf = (key: string) =>
    composeStyle(
      elementStyleOf(styles, key),
      orderStyle(order, key),
      positionStyle(positions, key)
    );

  // Preloader: fade-out ngay khi mount, KHÔNG chặn tương tác thật (gốc dùng
  // Locomotive để block scroll tới khi asset sẵn sàng — ở đây chỉ là hiệu
  // ứng thị giác, không có cơ chế "chặn" nào để giữ đúng R1).
  React.useEffect(() => {
    const overlay = rootRef.current?.querySelector<HTMLElement>(
      '.springs-gallery-preloader'
    );
    if (!overlay) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      overlay.style.display = 'none';
      return;
    }
    // gsap.context().revert() (thay vì tween.kill()) — StrictMode dev chạy
    // effect 2 lần; kill() để lại opacity kẹt giữa chừng, revert() trả về
    // đúng trạng thái sạch trước animation nên lần chạy thứ 2 fade lại từ
    // đầu, không bị kẹt mờ mờ vĩnh viễn.
    const ctx = gsap.context(() => {
      gsap.to(overlay, {
        autoAlpha: 0,
        duration: 0.6,
        delay: 0.9,
        ease: 'power2.out',
        onComplete: () => {
          overlay.style.display = 'none';
        },
      });
    });
    return () => ctx.revert();
    // `isMobile` bắt đầu là `false` (xem `useContainerMobile`) nên lần render
    // đầu LUÔN là nhánh desktop dù màn hình thực tế hẹp; khi ResizeObserver
    // báo hẹp và React chuyển hẳn sang JSX nhánh mobile, DOM preloader cũ bị
    // unmount và 1 preloader MỚI được mount — effect phải chạy lại để tìm và
    // fade đúng phần tử hiện đang gắn trong DOM, nếu không nó sẽ đứng yên ở
    // opacity 1 vĩnh viễn (đã xảy ra thực tế khi test viewport mobile).
  }, [isMobile]);

  useBlockMotion(
    rootRef,
    ({ scroller, requestRefresh }) => {
      const root = rootRef.current;
      if (!root) return;
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        return;
      }
      if (root.clientWidth > 0 && root.clientWidth < 768) return;

      const sticky = root.querySelector<HTMLElement>('.springs-gallery-sticky');
      const wrap = root.querySelector<HTMLElement>('.springs-gallery-clip');
      const content_ = root.querySelector<HTMLElement>(
        '.springs-gallery-content'
      );
      const columns = gsap.utils.toArray<HTMLElement>(
        '.springs-gallery-col',
        root
      );
      if (!sticky) return;

      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: root,
          scroller,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 1,
          pin: sticky,
          pinSpacing: false,
          pinType: 'transform',
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      // Cả khối xoay chéo trôi nhẹ theo scroll (gốc rotate(-28deg) tĩnh —
      // ở đây thêm 1 chút chuyển động cho khối để "sống" theo cuộn).
      if (content_) {
        tl.fromTo(
          content_,
          { rotate: -10, scale: 1.18 },
          { rotate: -6, scale: 1.12, duration: 0.75 },
          0
        );
      }

      // Mỗi cột: crossfade tuần tự 3 ảnh (mask-list gốc).
      columns.forEach(col => {
        const items = col.querySelectorAll<HTMLElement>(
          '.springs-gallery-item'
        );
        items.forEach((item, i) => {
          if (i === 0) return;
          const at = (i / items.length) * 0.6;
          tl.to(items[i - 1], { autoAlpha: 0, duration: 0.15 }, at);
          tl.fromTo(
            item,
            { autoAlpha: 0 },
            { autoAlpha: 1, duration: 0.15 },
            at
          );
        });
      });

      // Bàn giao cuối: curtain khép lại (clip-path) để lộ Hero bên dưới.
      if (wrap) {
        tl.to(wrap, { autoAlpha: 0, duration: 0.15 }, 0.85);
      }

      root.querySelectorAll('img').forEach(img => {
        if (!(img as HTMLImageElement).complete) {
          img.addEventListener('load', requestRefresh, { once: true });
        }
      });
    },
    [images.join('|'), isMobile]
  );

  const preloader = (
    <div
      className='springs-gallery-preloader pointer-events-none absolute inset-0 z-[10] flex items-center justify-center'
      style={{ background: GALLERY_BG }}
      aria-hidden='true'
    >
      <span
        style={{
          fontFamily: GALLERY_FONT_SERIF,
          fontSize: 'clamp(28px, 5cqi, 44px)',
          color: '#f5e8d1',
          letterSpacing: '0.02em',
        }}
      >
        Springs
      </span>
    </div>
  );

  // ── Mobile: tĩnh, không rotate/pin — ảnh đầu mỗi cột xếp cạnh nhau. ──────
  if (isMobile) {
    return (
      <section
        ref={rootRef}
        style={composeStyle(
          { background: GALLERY_BG },
          blockBackgroundStyle(background)
        )}
        className='springs-gallery @container relative w-full overflow-hidden'
      >
        {preloader}
        <div
          data-element-key='images'
          className={selectableClass(
            activeKey === 'images',
            'grid grid-cols-2 gap-1'
          )}
          style={composeStyle({ height: '70svh' }, styleOf('images'))}
        >
          {[left[0], right[0]].filter(Boolean).map((src, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={`${src}-${i}`}
              src={src}
              alt=''
              aria-hidden='true'
              className='h-full w-full object-cover'
            />
          ))}
        </div>
      </section>
    );
  }

  // ── Desktop: sticky pin 200vh, 2 cột xoay chéo crossfade. ────────────────
  return (
    <section
      ref={rootRef}
      style={composeStyle(
        { height: '200vh', background: GALLERY_BG },
        blockBackgroundStyle(background)
      )}
      className='springs-gallery @container relative w-full'
    >
      <div className='springs-gallery-sticky relative h-[100svh] w-full overflow-hidden'>
        <div
          className='springs-gallery-clip absolute inset-0'
          style={{ clipPath: GALLERY_CLIP_FULL }}
        >
          <div
            data-element-key='images'
            className={selectableClass(
              activeKey === 'images',
              'springs-gallery-content absolute inset-[-20%] flex gap-[3%]'
            )}
            style={styleOf('images')}
          >
            {[left, right].map((col, ci) => (
              <div
                key={`col-${ci}`}
                className='springs-gallery-col relative h-full flex-1 overflow-hidden'
                style={{ borderRadius: '4px' }}
              >
                {col.map((src, i) => (
                  <div
                    key={`${src}-${i}`}
                    className='springs-gallery-item absolute inset-0'
                    style={{ opacity: i === 0 ? 1 : 0 }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={src}
                      alt=''
                      aria-hidden='true'
                      className='h-full w-full object-cover'
                    />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
        {preloader}
      </div>
    </section>
  );
}
