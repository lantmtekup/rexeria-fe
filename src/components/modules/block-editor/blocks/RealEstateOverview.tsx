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
  RE_CONTENT_W,
  RE_SECTION_GAP,
  SAND,
  FONT_CSS,
} from './realEstateFonts';

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

  // Cùng resolver với panel Lớp + list manager → canvas không lệch với danh
  // sách hạng mục người dùng thấy khi thêm/xoá.
  const stats = React.useMemo(
    () => resolveRealEstateOverviewStats(content),
    [content]
  );

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
      // không bung cả lưới một lượt. Grid 2 cột nên lệch nhẹ theo cột.
      cards.forEach((card, i) => {
        // Lệch cột phải bằng POSITION PARAMETER trong timeline, không dùng
        // `delay`: tween của ScrollTrigger bị tạo ở trạng thái paused nên delay
        // đã trôi hết trước khi cuộn tới → 2 card cùng hàng bung đồng thời.
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
          (i % 2) * 0.12
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
    [stats.length]
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

      <div className='@container mx-auto' style={{ width: RE_CONTENT_W }}>
        <div
          className='mx-auto w-[83.3cqi]'
          style={{ paddingTop: RE_SECTION_GAP, paddingBottom: RE_SECTION_GAP }}
        >
          <h2
            data-appear='title'
            data-element-key='title'
            className={cn(
              selectableClass(activeKey === 'title'),
              'text-center whitespace-pre-line'
            )}
            style={composeStyle(
              {
                fontFamily: FONT_HEADING,
                fontSize: '6.18cqi',
                lineHeight: 1.372,
                color: BROWN,
                fontWeight: 400,
              },
              styleOf('title')
            )}
          >
            {content.title}
          </h2>

          <div
            className='grid grid-cols-2 gap-x-0 gap-y-[11.8cqi]'
            style={{
              marginTop: '10.75cqi',
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
                        width: '37.4cqi',
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
                        fontSize: '3.23cqi',
                        lineHeight: 1.479,
                        color: BROWN,
                        fontWeight: 400,
                        marginTop: '4.3cqi',
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
