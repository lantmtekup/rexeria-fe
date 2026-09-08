'use client';

/**
 * Sub-component hotspot cho `West72Showcase` (KHÔNG đăng ký BlockType).
 * Port từ apps/212-west FeatureShowcaseHotspots.tsx.
 *
 * - `ShowcaseMarkers` — chấm số trên ảnh, khung hẹp
 * - `ShowcaseDots` — chấm + capsule + thẻ chi tiết, khung rộng
 * - `ShowcaseRail` — hàng pill dưới ảnh, khung rộng
 * - `ShowcaseLegend` — danh sách nhãn/mô tả; khung hẹp ở production, LUÔN hiện
 *   trên canvas để tác giả sửa được nội dung hotspot
 *
 * Text sửa được nằm ở legend (parent truyền `styleOf`/`activeKey`) — capsule và
 * thẻ chi tiết chỉ hiển thị, tránh trùng `data-element-key`.
 */

import * as React from 'react';

import { cn } from '@/lib/cn';

import type { West72ShowcaseHotspot } from '../types';
import { selectableClass } from './applyStyle';
import { narrowMarkerPositions } from './west72ShowcaseGeometry';
import {
  WEST72_BLACK,
  WEST72_BROWN,
  WEST72_FONT_DISPLAY,
  WEST72_FONT_TEXT,
  WEST72_WHITE,
} from './west72Theme';

const NUMBER_TYPE: React.CSSProperties = {
  fontFamily: WEST72_FONT_TEXT,
  fontSize: 11,
  lineHeight: 1,
  fontWeight: 600,
};

const CAPSULE_TYPE: React.CSSProperties = {
  fontFamily: WEST72_FONT_TEXT,
  fontSize: 12,
  fontWeight: 500,
  textTransform: 'uppercase',
  whiteSpace: 'nowrap',
};

type StyleOf = (key: string) => React.CSSProperties | undefined;

export function ShowcaseMarkers({
  hotspots,
  imageWidth,
  imageHeight,
  hidden,
}: {
  hotspots: West72ShowcaseHotspot[];
  imageWidth: number;
  imageHeight: number;
  hidden: boolean;
}) {
  const positions = narrowMarkerPositions(hotspots, imageWidth, imageHeight);

  return (
    <ul
      aria-hidden
      className={cn(
        'pointer-events-none absolute inset-0 z-10 m-0 list-none p-0',
        hidden && '@4xl:hidden'
      )}
    >
      {hotspots.map((hotspot, index) => (
        <li
          key={index}
          className='absolute grid -translate-x-1/2 -translate-y-1/2 place-items-center'
          style={{
            left: `${positions[index].x}%`,
            top: `${positions[index].y}%`,
            height: 24,
            width: 24,
            borderRadius: 9999,
            backgroundColor: 'rgba(255, 255, 255, 0.75)',
            boxShadow: '0 1px 6px rgba(0, 0, 0, 0.18)',
            backdropFilter: 'blur(4px)',
          }}
        >
          <span style={{ ...NUMBER_TYPE, color: WEST72_BLACK }}>
            {index + 1}
          </span>
        </li>
      ))}
    </ul>
  );
}

function PlusMark() {
  return (
    <svg
      width='7'
      height='7'
      viewBox='0 0 7 7'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
      className='block'
    >
      <path
        data-plus-stem
        d='M3.5 0.5V6.5'
        stroke='black'
        strokeLinecap='round'
      />
      <path d='M6.5 3.5L0.5 3.5' stroke='black' strokeLinecap='round' />
    </svg>
  );
}

export function ShowcaseDots({
  hotspots,
  activeIndex,
  stackedIndex,
  onSelect,
}: {
  hotspots: West72ShowcaseHotspot[];
  activeIndex: number | null;
  stackedIndex: number | null;
  onSelect: (index: number) => void;
}) {
  return (
    <ul
      data-hotspots
      className='absolute inset-0 z-10 m-0 hidden list-none p-0 @4xl:block'
    >
      {hotspots.map((hotspot, index) => {
        const active = activeIndex === index;

        return (
          <li
            key={index}
            data-hotspot
            data-hotspot-index={index}
            className={cn(
              'absolute -translate-x-1/2 -translate-y-1/2',
              stackedIndex === index && 'z-10',
              activeIndex !== null && !active && 'pointer-events-none'
            )}
            style={{
              left: `${hotspot.dotX}%`,
              top: `${hotspot.dotY}%`,
              height: 28,
              width: 28,
            }}
          >
            <div
              data-hotspot-move
              className='relative size-full will-change-transform'
            >
              <button
                data-hotspot-fade
                type='button'
                onClick={() => onSelect(index)}
                aria-expanded={active}
                aria-label={hotspot.label}
                className='relative grid size-full cursor-pointer place-items-center border-0 bg-transparent p-0 will-change-[opacity]'
              >
                <span
                  className='absolute inset-0'
                  style={{
                    borderRadius: 9999,
                    backgroundColor: WEST72_WHITE,
                    filter: 'blur(8.1px)',
                  }}
                />
                <span
                  className='absolute'
                  style={{
                    inset: 6,
                    borderRadius: 9999,
                    backgroundColor: WEST72_WHITE,
                  }}
                />
                <span className='relative'>
                  <PlusMark />
                </span>
              </button>

              <span
                data-capsule
                className='absolute left-1/2 -translate-x-1/2'
                style={{
                  ...CAPSULE_TYPE,
                  ...(hotspot.labelSide === 'top'
                    ? { bottom: '100%', marginBottom: 8 }
                    : { top: '100%', marginTop: 8 }),
                  borderRadius: 9999,
                  backgroundColor: 'rgba(255, 255, 255, 0.5)',
                  padding: '12px 16px',
                  color: WEST72_BLACK,
                  backdropFilter: 'blur(10px)',
                }}
              >
                {hotspot.label}
              </span>

              <div
                data-detail-card
                className='invisible absolute top-full left-1/2 -translate-x-1/2 opacity-0'
                style={{
                  marginTop: 9,
                  width: 'max(16.88cqi, 180px)',
                  padding: 28,
                  borderRadius: 12,
                  border: `1px solid ${WEST72_WHITE}`,
                  backgroundColor: 'rgba(255, 255, 255, 0.5)',
                  backdropFilter: 'blur(10px)',
                }}
              >
                <span
                  style={{
                    display: 'block',
                    fontFamily: WEST72_FONT_TEXT,
                    fontSize: 18,
                    lineHeight: 1.55,
                    fontWeight: 500,
                    textTransform: 'uppercase',
                    color: WEST72_BLACK,
                  }}
                >
                  {hotspot.label}
                </span>
                {hotspot.desc ? (
                  <p
                    className='m-0'
                    style={{
                      marginTop: 7,
                      fontFamily: WEST72_FONT_TEXT,
                      fontSize: 14,
                      lineHeight: 1.14,
                      fontWeight: 500,
                      color: WEST72_BLACK,
                    }}
                  >
                    {hotspot.desc}
                  </p>
                ) : null}
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

export function ShowcaseRail({
  hotspots,
  activeIndex,
  onSelect,
}: {
  hotspots: West72ShowcaseHotspot[];
  activeIndex: number | null;
  onSelect: (index: number) => void;
}) {
  return (
    <nav
      data-rail
      aria-label='Featured details'
      className='absolute inset-x-0 z-10 hidden @4xl:block'
      style={{ bottom: '4.76%' }}
    >
      <ul
        className='m-0 mx-auto flex max-w-full list-none flex-wrap items-center justify-center p-0'
        style={{ gap: 'max(0.83cqi, 10px)' }}
      >
        {hotspots.map((hotspot, index) => {
          const active = activeIndex === index;

          return (
            <li key={index}>
              <button
                type='button'
                onClick={() => onSelect(index)}
                aria-expanded={active}
                aria-label={hotspot.label}
                className='min-h-11 cursor-pointer'
                style={{
                  ...CAPSULE_TYPE,
                  borderRadius: 9999,
                  borderWidth: 1,
                  borderStyle: 'solid',
                  padding: '12px 16px',
                  ...(active
                    ? {
                        borderColor: 'transparent',
                        backgroundColor: 'rgba(255, 255, 255, 0.5)',
                        color: WEST72_BLACK,
                        backdropFilter: 'blur(10px)',
                      }
                    : {
                        borderColor: 'rgba(255, 255, 255, 0.7)',
                        backgroundColor: 'transparent',
                        color: WEST72_WHITE,
                      }),
                }}
              >
                {hotspot.label}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export function ShowcaseLegend({
  hotspots,
  alwaysVisible,
  activeKey,
  styleOf,
}: {
  hotspots: West72ShowcaseHotspot[];
  /** Canvas: luôn hiện để sửa nội dung hotspot. Production: chỉ khung hẹp. */
  alwaysVisible: boolean;
  activeKey?: string | null;
  styleOf: StyleOf;
}) {
  const detailed = hotspots.some(hotspot => hotspot.desc);

  return (
    <ol
      data-legend
      className={cn(
        'm-0 grid list-none',
        detailed
          ? 'grid-cols-1 @2xl:grid-cols-2'
          : 'grid-cols-2 @2xl:grid-cols-3',
        !alwaysVisible && '@4xl:hidden'
      )}
      style={{
        columnGap: 24,
        rowGap: 24,
        borderTop: '1px solid rgba(0, 0, 0, 0.1)',
        padding: '40px 20px',
      }}
    >
      {hotspots.map((hotspot, index) => {
        const labelKey = `hotspots[${index}].label`;
        const descKey = `hotspots[${index}].desc`;

        return (
          <li key={index} data-legend-item className='flex' style={{ gap: 12 }}>
            <span
              className='grid shrink-0 place-items-center'
              style={{
                ...NUMBER_TYPE,
                height: 24,
                width: 24,
                backgroundColor: WEST72_BROWN,
                color: WEST72_WHITE,
              }}
            >
              {index + 1}
            </span>
            <span className='flex min-w-0 flex-col' style={{ gap: 6 }}>
              <span
                data-element-key={labelKey}
                className={selectableClass(activeKey === labelKey)}
                style={{
                  fontFamily: WEST72_FONT_DISPLAY,
                  fontSize: 'clamp(13px, 0.97cqi, 14px)',
                  lineHeight: 1.28,
                  fontWeight: 500,
                  textTransform: 'uppercase',
                  color: WEST72_BROWN,
                  ...styleOf(labelKey),
                }}
              >
                {hotspot.label}
              </span>
              {hotspot.desc ? (
                <span
                  data-element-key={descKey}
                  className={selectableClass(activeKey === descKey)}
                  style={{
                    fontFamily: WEST72_FONT_TEXT,
                    fontSize: 'clamp(12px, 0.9cqi, 13px)',
                    lineHeight: 1.5,
                    color: 'rgba(0, 0, 0, 0.65)',
                    ...styleOf(descKey),
                  }}
                >
                  {hotspot.desc}
                </span>
              ) : null}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
