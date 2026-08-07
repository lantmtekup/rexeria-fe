'use client';

import * as React from 'react';
import gsap from 'gsap';

import { cn } from '@/lib/cn';

import { useBlockMotion } from '../motion/LandingMotion';
import type { RealEstateOverviewContent } from '../types';
import type { BlockRenderProps } from './_registry/types';
import { resolveRealEstateOverviewStats } from './_registry/defs/realEstateOverview';
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
  FONT_HEADING,
  RE_SECTION_GAP,
  SAND,
  FONT_CSS,
} from './realEstateFonts';
import { useContainerMobile } from './useContainerMobile';

/**
 * Hai tier layout. `mobile` (<672 = CONTAINER_MOBILE_BREAKPOINT) giữ nguyên số
 * `cqi` transcribe từ canvas Framer 372px, chỉ khác là cột chạy full bề rộng
 * khung thay vì kẹp ở `RE_CONTENT_W` — bản kẹp để lại 2 dải nền sand hai bên ở
 * khung 390 (đồng bộ `RealEstateHero` / `RealEstateLocation`). Vì cột = khung
 * nên `cqi` scale theo khung: ở 390 là ×1.048, giữ đúng mọi tỉ lệ gốc.
 *
 * `wide` (≥672) nới cột + rescale, đổi lưới sang 3×2 (6 hạng mục). Title bỏ
 * ngắt dòng cứng (`\n` → space) để một dòng tự nhiên. `cqi` đo theo bề rộng
 * BLOCK (834/1440) nên khai `clamp(min, N·cqi, max)` với
 * `N = maxPx / 1440 * 100`.
 *
 * Phải nhánh bằng JS chứ không phải `@container (...) { ... !important }`:
 * style ở đây đi qua `composeStyle(base, styleOf(key))` để override của user
 * trên canvas thắng base — `!important` sẽ thắng luôn `styleOf()`.
 */
const TIER = {
  mobile: {
    section: {
      paddingTop: RE_SECTION_GAP,
      paddingBottom: RE_SECTION_GAP,
    } as React.CSSProperties,
    innerW: '83.3cqi',
    contentMax: 'none' as const,
    cols: 2,
    title: '6.18cqi', // 23px @372
    gridMt: '10.75cqi', // ~40px
    gapX: '0px',
    gapY: '11.8cqi', // ~44px
    icon: '37.4cqi', // ~139px
    text: '3.23cqi', // ~12px
    textMt: '4.3cqi', // ~16px
    // Giữ `\n` trong content — canvas gốc cắt title 2 dòng.
    titlePreLine: true,
  },
  wide: {
    section: {
      paddingTop: 'clamp(40px, 3.5cqi, 56px)',
      paddingBottom: 'clamp(88px, 8.3cqi, 120px)',
      paddingInline: 'clamp(24px, 5.5cqi, 80px)',
    } as React.CSSProperties,
    innerW: '100%',
    contentMax: 1120,
    cols: 3,
    title: 'clamp(28px, 2.9cqi, 42px)',
    gridMt: 'clamp(40px, 3.5cqi, 56px)',
    gapX: 'clamp(24px, 2.5cqi, 40px)',
    gapY: 'clamp(40px, 3.5cqi, 64px)',
    icon: 'clamp(88px, 7.5cqi, 128px)',
    text: 'clamp(14px, 1.11cqi, 16px)',
    textMt: 'clamp(14px, 1.25cqi, 20px)',
    // Soft-wrap tự nhiên — không ép xuống dòng theo `\n` của bản mobile.
    titlePreLine: false,
  },
} as const;

export function RealEstateOverview({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
  className,
}: BlockRenderProps<RealEstateOverviewContent>) {
  const rootRef = React.useRef<HTMLDivElement>(null);
  const isMobile = useContainerMobile(rootRef);
  const tier = isMobile ? TIER.mobile : TIER.wide;
  const cols = tier.cols;

  // Cùng resolver với panel Lớp + list manager → canvas không lệch với danh
  // sách hạng mục người dùng thấy khi thêm/xoá.
  const stats = React.useMemo(
    () => resolveRealEstateOverviewStats(content),
    [content]
  );

  // Wide: `\n` trong default content chỉ phục vụ mobile 2 dòng — đổi thành
  // space để title một dòng tự nhiên. Mobile giữ nguyên để khớp canvas gốc.
  const titleText = tier.titlePreLine
    ? content.title
    : (content.title ?? '').replace(/\s*\n\s*/g, ' ').trim();

  const styleOf = (key: string) =>
    composeStyle(
      elementStyleOf(styles, key),
      orderStyle(order, key),
      positionStyle(positions, key)
    );

  useBlockMotion(
    rootRef,
    ({ scroller, requestRefresh }) => {
      const root = rootRef.current;
      if (!root) return;
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

      const title = root.querySelector('[data-appear="title"]');
      const cards = root.querySelectorAll<HTMLElement>('[data-appear="card"]');

      // fromTo + immediateRender → tự ẩn trước khi trigger bắn, và giữ đúng
      // trạng thái đầu để `reverse` chạy ngược được khi cuộn lên.
      gsap.fromTo(
        title,
        { opacity: 0, y: 24 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: root,
            scroller,
            start: 'top 90%',
            toggleActions: 'play none none reverse',
            invalidateOnRefresh: true,
          },
        }
      );

      // Mỗi card có ScrollTrigger riêng → xuất hiện lần lượt khi cuộn tới,
      // không bung cả lưới một lượt. Lệch nhẹ theo cột trong hàng.
      cards.forEach((card, i) => {
        // Lệch cột phải bằng POSITION PARAMETER trong timeline, không dùng
        // `delay`: tween của ScrollTrigger bị tạo ở trạng thái paused nên delay
        // đã trôi hết trước khi cuộn tới → card cùng hàng bung đồng thời.
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: card,
            scroller,
            start: 'top 90%',
            toggleActions: 'play none none reverse',
            invalidateOnRefresh: true,
          },
        });

        tl.fromTo(
          card,
          { opacity: 0, y: 24 },
          { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out' },
          (i % cols) * 0.12
        );
      });

      root.querySelectorAll('img').forEach(img => {
        if (!img.complete) {
          img.addEventListener('load', requestRefresh, { once: true });
        }
      });
      // Dựng lại khi số hạng mục đổi (thêm/xoá trong list manager): card mới nằm
      // ngoài NodeList đã query nên không có ScrollTrigger, sẽ đứng im.
    },
    [stats.length, cols]
  );

  return (
    <div
      ref={rootRef}
      style={composeStyle(
        { backgroundColor: SAND },
        blockBackgroundStyle(background)
      )}
      className={cn('@container w-full', className)}
    >
      <style>{FONT_CSS}</style>

      <div className='@container mx-auto' style={{ width: '100%' }}>
        <div
          className='mx-auto'
          style={{
            ...tier.section,
            width: tier.innerW,
            maxWidth: tier.contentMax,
          }}
        >
          <h2
            data-appear='title'
            data-element-key='title'
            className={cn(
              selectableClass(activeKey === 'title'),
              'text-center',
              tier.titlePreLine && 'whitespace-pre-line'
            )}
            style={composeStyle(
              {
                fontFamily: FONT_HEADING,
                fontSize: tier.title,
                lineHeight: 1.372,
                color: BROWN,
                fontWeight: 400,
              },
              styleOf('title')
            )}
          >
            {titleText}
          </h2>

          <div
            className={cn('grid', cols === 3 ? 'grid-cols-3' : 'grid-cols-2')}
            style={{
              marginTop: tier.gridMt,
              columnGap: tier.gapX,
              rowGap: tier.gapY,
            }}
          >
            {stats.map((stat, i) => {
              const iconKey = `stats[${i}].iconUrl`;
              const textKey = `stats[${i}].text`;
              return (
                <div
                  key={i}
                  data-appear='card'
                  className='flex flex-col items-center'
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    data-element-key={iconKey}
                    src={stat.iconUrl}
                    alt=''
                    aria-hidden
                    className={selectableClass(activeKey === iconKey)}
                    style={composeStyle(
                      {
                        width: tier.icon,
                        height: 'auto',
                        objectFit: 'contain',
                      },
                      styleOf(iconKey)
                    )}
                  />

                  <p
                    data-element-key={textKey}
                    className={cn(
                      selectableClass(activeKey === textKey),
                      'w-full text-center whitespace-pre-line'
                    )}
                    style={composeStyle(
                      {
                        fontFamily: FONT_HEADING,
                        fontSize: tier.text,
                        lineHeight: 1.479,
                        color: BROWN,
                        fontWeight: 400,
                        marginTop: tier.textMt,
                      },
                      styleOf(textKey)
                    )}
                  >
                    {stat.text}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
