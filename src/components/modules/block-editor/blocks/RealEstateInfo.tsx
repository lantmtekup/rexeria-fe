'use client';

import * as React from 'react';
import gsap from 'gsap';

import { cn } from '@/lib/cn';

import { useBlockMotion } from '../motion/LandingMotion';
import type { RealEstateInfoContent } from '../types';
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
  RE_SECTION_GAP,
  SAND,
} from './realEstateFonts';
import { useContainerMobile } from './useContainerMobile';

const FALLBACK_ICON = '/real-estate/intro-sunburst.svg';
const FALLBACK_IMAGE = '/real-estate/intro-feature.jpg';

/**
 * Hai tier layout. `mobile` (<672) chép tỉ lệ Framer 372px, cột full bề rộng
 * khung (bỏ `RE_CONTENT_W`). Mask crop-in giữ như gốc.
 *
 * `wide` (≥672): split text trái / ảnh phải. Ảnh 4/3 + radius 12 (có mặt hơn
 * banner 16/9), không co mask còn ~82% (tránh “viền sand” quanh ảnh). Desc
 * `maxWidth: 38ch`. Nhánh JS + composeStyle — không `@container { !important }`.
 */
const TIER = {
  mobile: {
    icon: '16.1cqi', // 60px @372
    title: '6.18cqi', // 23px
    titleMt: '10.5cqi', // 39px
    desc: '3.76cqi', // 14px
    descMt: '6.3cqi', // 23.4px
    descW: '86.6cqi', // 322px
    descMax: 'none' as const,
    box: {
      width: '100cqi',
      height: '122.04cqi',
      marginTop: '17.2cqi',
    } as React.CSSProperties,
    imgH: '122.04cqi', // = chiều cao box (dọc 0.82)
    useMaskCrop: true,
  },
  wide: {
    icon: 'clamp(56px, 5cqi, 76px)',
    title: 'clamp(28px, 2.9cqi, 42px)',
    titleMt: 'clamp(18px, 1.8cqi, 26px)',
    desc: 'clamp(15px, 1.2cqi, 17px)',
    descMt: 'clamp(14px, 1.25cqi, 18px)',
    descW: '100%',
    descMax: '38ch',
    box: {
      width: '100%',
      aspectRatio: '4 / 3',
      marginTop: 0,
      borderRadius: 12,
    } as React.CSSProperties,
    imgH: '75cqi', // 3/4 → khớp box 4/3
    useMaskCrop: false,
  },
} as const;

/**
 * Chỉ dùng ở tier wide. Bản gốc KHÔNG có `paddingBottom` (ảnh full-bleed chạm
 * đáy block); ở bố cục 2 cột ảnh đã thụt `paddingInline` nên cần đáy.
 */
const SECTION_PAD: React.CSSProperties = {
  paddingTop: 'clamp(72px, 7cqi, 112px)',
  paddingBottom: 'clamp(72px, 7cqi, 112px)',
  paddingInline: 'clamp(24px, 5.5cqi, 80px)',
};

const ROW: React.CSSProperties = {
  maxWidth: 1280,
  gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1.2fr)',
  gap: 'clamp(40px, 4.5cqi, 72px)',
  alignItems: 'start',
};

export function RealEstateInfo({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
  className,
}: BlockRenderProps<RealEstateInfoContent>) {
  const rootRef = React.useRef<HTMLDivElement>(null);
  const isMobile = useContainerMobile(rootRef);
  const tier = isMobile ? TIER.mobile : TIER.wide;

  const iconUrl = content.iconUrl?.trim() || FALLBACK_ICON;
  const imageUrl = content.imageUrl?.trim() || FALLBACK_IMAGE;

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

      const mask = root.querySelector('.re-info-mask');
      const featureImg = root.querySelector<HTMLElement>(
        '.re-info-feature-img'
      );

      if (tier.useMaskCrop && mask) {
        // Mobile: giữ crop-in gốc (mask co → crop ảnh).
        gsap.to(mask, {
          width: '82.258%',
          height: '82.379%',
          duration: 0.55,
          delay: 0.1,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: mask,
            scroller,
            start: 'top 50%',
            toggleActions: 'play none none reverse',
          },
        });
      } else if (featureImg) {
        // Wide: ken-burns nhẹ trong box đã clip + radius — không để viền sand.
        gsap.fromTo(
          featureImg,
          { scale: 1.06 },
          {
            scale: 1,
            duration: 0.9,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: featureImg,
              scroller,
              start: 'top 70%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      }

      root.querySelectorAll('img').forEach(img => {
        if (!img.complete) {
          img.addEventListener('load', requestRefresh, { once: true });
        }
      });
    },
    [tier.useMaskCrop]
  );

  const textNodes = (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        data-appear
        data-element-key='iconUrl'
        src={iconUrl}
        alt=''
        aria-hidden
        className={selectableClass(activeKey === 'iconUrl')}
        style={composeStyle(
          {
            width: tier.icon,
            height: tier.icon,
            objectFit: 'contain',
          },
          styleOf('iconUrl')
        )}
      />

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
            width: tier.descW,
            maxWidth: tier.descMax,
          },
          styleOf('description')
        )}
      >
        {content.description}
      </p>
    </>
  );

  const imageNode = (
    // `@container` để <img> neo `cqi` vào BOX (mobile mask crop không scale ảnh).
    <div
      data-appear
      data-element-key='imageUrl'
      className={cn(
        selectableClass(activeKey === 'imageUrl'),
        '@container relative overflow-hidden'
      )}
      style={composeStyle(tier.box, styleOf('imageUrl'))}
    >
      {tier.useMaskCrop ? (
        <div
          className='re-info-mask absolute top-1/2 left-1/2 overflow-hidden'
          style={{
            width: '100%',
            height: '100%',
            transform: 'translate(-50%, -50%)',
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt=''
            className='absolute top-1/2 left-1/2 object-cover'
            style={{
              width: '100cqi',
              height: tier.imgH,
              maxWidth: 'none',
              transform: 'translate(-50%, -50%)',
            }}
          />
        </div>
      ) : (
        // Wide: fill box + scale GSAP trên wrapper (không đụng translate center).
        <div className='re-info-feature-img absolute inset-0'>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={imageUrl} alt='' className='h-full w-full object-cover' />
        </div>
      )}
    </div>
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
        {isMobile ? (
          // Cây PHẲNG y hệt bản gốc: `orderStyle` chỉ hoán vị được giữa các anh
          // em cùng cha, bọc text vào wrapper sẽ chặn `imageUrl` đảo chỗ với
          // `title` như hiện nay.
          <div
            className='flex flex-col items-center text-center'
            style={{ paddingTop: RE_SECTION_GAP }}
          >
            {textNodes}
            {imageNode}
          </div>
        ) : (
          <div style={SECTION_PAD}>
            <div className='mx-auto grid' style={ROW}>
              <div className='flex flex-col items-start pt-[clamp(8px,1cqi,16px)] text-left'>
                {textNodes}
              </div>
              {imageNode}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
