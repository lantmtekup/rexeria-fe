'use client';

import * as React from 'react';
import gsap from 'gsap';

import { cn } from '@/lib/cn';

import { BlockMedia } from '../BlockMedia';
import { useBlockMotion } from '../motion/LandingMotion';
import type { RealEstateLocationContent } from '../types';
import type { BlockRenderProps } from './_registry/types';
import {
  blockBackgroundStyle,
  composeStyle,
  elementStyleOf,
  orderStyle,
  positionStyle,
  selectableClass,
} from './applyStyle';
import {
  BROWN,
  FONT_BODY,
  FONT_CSS,
  FONT_HEADING,
  GREEN,
  RE_SECTION_GAP,
} from './realEstateFonts';
import { useContainerMobile } from './useContainerMobile';

/**
 * Hai tier layout. `mobile` (<672 = CONTAINER_MOBILE_BREAKPOINT) giữ nguyên số
 * `cqi` transcribe từ canvas Framer 372px, chỉ khác là cột chạy full bề rộng
 * khung thay vì kẹp ở `RE_CONTENT_W` — bản kẹp để lại 2 dải nền sand 9px hai
 * bên ở khung 390 (đồng bộ `RealEstateHero` / `RealEstateInfo`). Vì cột = khung
 * nên `cqi` scale theo khung: ở 390 là ×1.048, giữ đúng mọi tỉ lệ gốc.
 *
 * `wide` (≥672) GIỮ NGUYÊN cấu trúc gốc (text canh giữa → map bên dưới) vì map
 * là media ngang 3840×2160: đẩy sang bố cục 2 cột như `RealEstateInfo` sẽ bóp
 * map thành cột phụ, mất chi tiết bản đồ. Chỉ nới cột và rescale: text kẹp
 * `maxWidth` 960 cho khối chữ (description không bị bóp hẹp), map kẹp 1280.
 *
 * `cqi` ở tier wide đo theo bề rộng BLOCK (834/1440) nên số mobile sẽ phình gấp
 * ~4 lần; vì vậy khai `clamp(min, N·cqi, max)` với `N = maxPx / 1440 * 100`
 * (quy ước của `RealEstateHero` / `RealEstateInfo`).
 *
 * Phải nhánh bằng JS chứ không phải `@container (...) { ... !important }`:
 * style ở đây đi qua `composeStyle(base, styleOf(key))` để override của user
 * trên canvas thắng base — `!important` sẽ thắng luôn `styleOf()`, làm toolbar
 * chỉnh font/màu mất tác dụng ở desktop.
 */
const TIER = {
  mobile: {
    section: { paddingTop: RE_SECTION_GAP } as React.CSSProperties,
    textWidth: '87.6cqi', // 326px @372
    textMaxWidth: 'none' as const,
    eyebrow: '3.76cqi', // 14px @372
    title: '6.18cqi', // 23px
    titleMt: '10.5cqi', // 39px
    desc: '3.76cqi', // 14px
    descMt: '3.2cqi', // 11.9px
    mapMaxWidth: 'none' as const,
    mapMt: '23.1cqi', // 86px
  },
  wide: {
    // `paddingTop` cố ý nhỏ hơn `SECTION_PAD` của Info: Info wide đã có
    // `paddingBottom` clamp(88–120) vì ảnh 2 cột không full-bleed — nếu Location
    // cũng lấy đủ 88–120 phía trên thì khe giữa hai section = 176–240px. Bản gốc
    // chỉ để `RE_SECTION_GAP` (~104) ở section SAU; giữ nhịp đó bằng top nhẹ.
    // `paddingBottom` vẫn đủ vì map đã thụt trong `paddingInline`, chạm đáy sẽ
    // trông như lỗi.
    section: {
      paddingTop: 'clamp(40px, 3.5cqi, 56px)',
      paddingBottom: 'clamp(88px, 8.3cqi, 120px)',
      paddingInline: 'clamp(24px, 5.5cqi, 80px)',
    } as React.CSSProperties,
    textWidth: '100%',
    // Rộng hơn 640 — đừng bóp description thành cột hẹp trên desktop.
    textMaxWidth: 960,
    eyebrow: 'clamp(14px, 1.11cqi, 16px)',
    title: 'clamp(28px, 2.9cqi, 42px)',
    titleMt: 'clamp(18px, 1.8cqi, 26px)',
    desc: 'clamp(15px, 1.2cqi, 17px)',
    descMt: 'clamp(10px, 0.97cqi, 14px)',
    mapMaxWidth: 1280,
    mapMt: 'clamp(48px, 4.44cqi, 64px)',
  },
} as const;

export function RealEstateLocation({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
  className,
}: BlockRenderProps<RealEstateLocationContent>) {
  const rootRef = React.useRef<HTMLDivElement>(null);
  const isMobile = useContainerMobile(rootRef);
  const tier = isMobile ? TIER.mobile : TIER.wide;

  const styleOf = (key: string) =>
    composeStyle(
      elementStyleOf(styles, key),
      orderStyle(order, key),
      positionStyle(positions, key)
    );

  useBlockMotion(rootRef, ({ scroller, requestRefresh }) => {
    const root = rootRef.current;
    if (!root) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    gsap.fromTo(
      root.querySelectorAll('[data-appear]'),
      { opacity: 0, y: 10 },
      {
        opacity: 1,
        y: 0,
        duration: 0.7,
        ease: 'power2.out',
        stagger: 0.075,
        delay: 0.1,
        scrollTrigger: {
          trigger: root,
          scroller,
          start: 'top 85%',
          once: true,
        },
      }
    );

    const video = root.querySelector('video');
    video?.addEventListener('loadeddata', requestRefresh, { once: true });
  });

  return (
    <div
      ref={rootRef}
      style={composeStyle(
        { backgroundColor: '#fff' },
        blockBackgroundStyle(background)
      )}
      className={cn('@container w-full overflow-hidden', className)}
    >
      <style>{FONT_CSS}</style>

      <div className='@container mx-auto' style={{ width: '100%' }}>
        <div className='flex flex-col items-center' style={tier.section}>
          <div
            className='flex flex-col items-center text-center'
            style={{
              width: tier.textWidth,
              maxWidth: tier.textMaxWidth,
            }}
          >
            <p
              data-appear
              data-element-key='eyebrow'
              className={selectableClass(activeKey === 'eyebrow')}
              style={composeStyle(
                {
                  fontFamily: FONT_HEADING,
                  fontSize: tier.eyebrow,
                  lineHeight: 1.69,
                  color: GREEN,
                },
                styleOf('eyebrow')
              )}
            >
              {content.eyebrow}
            </p>

            <h2
              data-appear
              data-element-key='title'
              className={selectableClass(activeKey === 'title')}
              style={composeStyle(
                {
                  fontFamily: FONT_HEADING,
                  fontSize: tier.title,
                  lineHeight: 1.372,
                  color: BROWN,
                  fontWeight: 400,
                  marginTop: tier.titleMt,
                },
                styleOf('title')
              )}
            >
              {content.title}
            </h2>

            <p
              data-appear
              data-element-key='description'
              className={selectableClass(activeKey === 'description')}
              style={composeStyle(
                {
                  fontFamily: FONT_BODY,
                  fontSize: tier.desc,
                  lineHeight: 1.69,
                  color: BROWN,
                  marginTop: tier.descMt,
                },
                styleOf('description')
              )}
            >
              {content.description}
            </p>
          </div>

          <div
            data-appear
            data-element-key='videoUrl'
            className={cn(
              selectableClass(activeKey === 'videoUrl'),
              'relative aspect-[372/209] w-full overflow-hidden'
            )}
            style={composeStyle(
              {
                marginTop: tier.mapMt,
                maxWidth: tier.mapMaxWidth,
                borderRadius: 12,
              },
              styleOf('videoUrl')
            )}
          >
            {/* Field media: mặc định là mp4, nhưng user đổi sang ảnh tĩnh được
                qua picker → render theo đuôi file, không ép <video>. */}
            {content.videoUrl ? (
              <BlockMedia
                key={content.videoUrl}
                src={content.videoUrl}
                autoPlay
                loop
                muted
                playsInline
                className='h-full w-full object-cover'
              />
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
