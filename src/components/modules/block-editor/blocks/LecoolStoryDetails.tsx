'use client';

/**
 * Panel 2 (Details) của block `lecool_story` — SUB-COMPONENT, không đăng ký
 * BlockType. Port từ apps/ecommerce-landing DetailsPanel.tsx.
 *
 * 6 hotspot trên ảnh túi; bấm một hotspot (hoặc dòng tương ứng trong danh sách)
 * thì ảnh phóng 1.4× và kéo hotspot đó về giữa khung. Bấm lại thì thu về.
 *
 * Khác apps:
 * - `lg:` → `isDesktop` đo theo container.
 * - Canvas editor: luôn ở trạng thái thu nhỏ và KHÔNG nhận click, để bấm vào
 *   hotspot/dòng là chọn element chứ không phải chạy zoom.
 */
import * as React from 'react';
import gsap from 'gsap';

import { composeStyle, selectableClass } from './applyStyle';
import { IconCollapse, IconExpand } from './lecoolStoryIcons';
import {
  DEFAULT_DETAILS_IMAGE,
  PANE_H,
  PANE_W,
  resolveDetailRows,
  stagePlacement,
  type LecoolStoryPanelProps,
} from './lecoolStoryData';
import { LECOOL_BODY_FONT, LECOOL_GOLD, LECOOL_PAPER } from './lecoolTheme';

const ZOOM = 1.4;
const HOTSPOT = 32;
const ACTIVE_SPOT = 1.25;
const DURATION = 0.9;
const EASE = 'power3.inOut';

const ROW_LABEL_STYLE: React.CSSProperties = {
  fontFamily: LECOOL_BODY_FONT,
  fontSize: 'clamp(13px, 1.15cqi, 16px)',
  fontWeight: 500,
  lineHeight: '26px',
};

/**
 * Hộp ảnh theo tỷ lệ 1086/840 nằm gọn trong khung cha (contain thủ công) —
 * cần kích thước THẬT để quy toạ độ hotspot Figma ra %.
 */
function useStageBox() {
  const ref = React.useRef<HTMLDivElement>(null);
  const [box, setBox] = React.useState({ width: 0, height: 0 });

  React.useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    const measure = () => {
      const { clientWidth: w, clientHeight: h } = el;
      if (!w || !h) return;
      const scale = Math.min(w / PANE_W, h / PANE_H);
      setBox({ width: PANE_W * scale, height: PANE_H * scale });
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return { ref, box };
}

export function LecoolStoryDetails({
  content,
  styleOf,
  activeKey,
  isCanvas,
  isDesktop,
}: LecoolStoryPanelProps) {
  const [active, setActive] = React.useState(0);
  const [zoomed, setZoomed] = React.useState(false);
  const { ref, box } = useStageBox();
  const stageRef = React.useRef<HTMLDivElement>(null);
  const spotsRef = React.useRef<(HTMLButtonElement | null)[]>([]);

  const rows = React.useMemo(() => resolveDetailRows(content), [content]);
  const imageUrl = content.detailsImageUrl?.trim() || DEFAULT_DETAILS_IMAGE;

  const select = (i: number) => {
    setZoomed(i === active ? z => !z : true);
    setActive(i);
  };

  React.useLayoutEffect(() => {
    gsap.set(stageRef.current, { transformOrigin: '0 0' });
  }, []);

  React.useLayoutEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const reduce =
      isCanvas || window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const duration = reduce ? 0 : DURATION;
    const { k, x, y } = stagePlacement(
      rows[active],
      zoomed && !isCanvas,
      ZOOM,
      HOTSPOT
    );

    const tweens = [
      gsap.to(stage, {
        xPercent: x,
        yPercent: y,
        scale: k,
        duration,
        ease: EASE,
        overwrite: 'auto',
      }),
    ];

    spotsRef.current.forEach((spot, i) => {
      if (!spot) return;
      tweens.push(
        gsap.to(spot, {
          scale: (zoomed && !isCanvas && i === active ? ACTIVE_SPOT : 1) / k,
          duration,
          ease: EASE,
          overwrite: 'auto',
        })
      );
    });

    return () => tweens.forEach(tween => tween.kill());
  }, [active, zoomed, isCanvas, rows]);

  const stage = (
    <div
      ref={ref}
      className='relative flex w-full items-center justify-center'
      style={
        isDesktop && !isCanvas
          ? { position: 'absolute', inset: 0, height: '100%' }
          : { aspectRatio: `${PANE_W} / ${PANE_H}` }
      }
    >
      <div
        className='relative overflow-hidden'
        style={{ width: box.width || '100%', height: box.height || '100%' }}
      >
        <div ref={stageRef} className='absolute inset-0'>
          <img
            src={imageUrl}
            alt=''
            aria-hidden
            data-element-key='detailsImageUrl'
            className={selectableClass(
              activeKey === 'detailsImageUrl',
              'h-full w-full object-cover'
            )}
            style={styleOf('detailsImageUrl')}
          />

          {rows.map((row, i) => (
            <button
              key={`spot-${i}`}
              ref={node => {
                spotsRef.current[i] = node;
              }}
              type='button'
              onClick={isCanvas ? undefined : () => select(i)}
              aria-label={`${zoomed && i === active ? 'Thu nhỏ' : 'Phóng to'}: ${row.label ?? ''}`}
              aria-pressed={i === active}
              className='absolute flex items-center justify-center bg-white transition-colors'
              style={{
                left: `${((row.x ?? 0) / PANE_W) * 100}%`,
                top: `${((row.y ?? 0) / PANE_H) * 100}%`,
                width: isDesktop ? 32 : 24,
                height: isDesktop ? 32 : 24,
                // Cái đang zoom nổi lên trên 5 cái còn lại khi nở to.
                zIndex: i === active ? 2 : 1,
                color: i === active ? LECOOL_GOLD : '#000000',
                boxShadow:
                  i === active ? `inset 0 0 0 1px ${LECOOL_GOLD}` : 'none',
              }}
            >
              {zoomed && !isCanvas && i === active ? (
                <IconCollapse className={isDesktop ? 'h-4 w-4' : 'h-3 w-3'} />
              ) : (
                <IconExpand className={isDesktop ? 'h-4 w-4' : 'h-3 w-3'} />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const list = (
    <ul
      className='flex list-none flex-col gap-1'
      style={
        isDesktop && !isCanvas
          ? {
              position: 'absolute',
              top: '39%',
              left: 'var(--story-gutter)',
              width: 'min(354px, 33%)',
              margin: 0,
              padding: 0,
            }
          : {
              margin: 0,
              paddingInline: 'var(--story-gutter)',
              paddingBlock: 24,
            }
      }
    >
      {rows.map((row, i) => {
        const isActive = i === active;
        const labelKey = `detailRows[${i}].label`;
        const thumbKey = `detailRows[${i}].thumbUrl`;
        return (
          <li key={labelKey}>
            <button
              type='button'
              onClick={isCanvas ? undefined : () => select(i)}
              aria-pressed={isActive}
              className='flex w-full items-center justify-end gap-6 pr-[17px] pl-4 text-right backdrop-blur-[2px] transition-colors @4xl:gap-10'
              style={{
                height: 'clamp(56px, 6cqi, 74px)',
                backgroundColor: isActive
                  ? LECOOL_GOLD
                  : 'rgba(255,255,255,.4)',
                color: isActive ? '#FFFFFF' : '#000000',
              }}
            >
              <span
                data-element-key={labelKey}
                className={selectableClass(activeKey === labelKey)}
                style={composeStyle(ROW_LABEL_STYLE, styleOf(labelKey))}
              >
                {row.label}
              </span>
              <span className='flex h-8 w-8 shrink-0 items-center justify-center'>
                <img
                  src={row.thumbUrl ?? ''}
                  alt=''
                  aria-hidden
                  data-element-key={thumbKey}
                  className={selectableClass(
                    activeKey === thumbKey,
                    'h-auto max-h-8 w-auto max-w-[26px] object-contain'
                  )}
                  style={styleOf(thumbKey)}
                />
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );

  return (
    <div
      className='relative w-full overflow-hidden'
      style={{
        backgroundColor: LECOOL_PAPER,
        height: isDesktop && !isCanvas ? '100%' : undefined,
      }}
    >
      {stage}
      {list}
    </div>
  );
}
