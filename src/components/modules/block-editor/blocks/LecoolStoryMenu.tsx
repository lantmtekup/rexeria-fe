'use client';

/**
 * Menu của block `lecool_story` — SUB-COMPONENT, không đăng ký BlockType.
 * Port từ apps/ecommerce-landing StoryMenu.tsx.
 *
 * Cha (`LecoolStory`) sở hữu `active` + hàm cuộn; ở đây chỉ vẽ.
 *
 * Khác apps: rail và tab bar KHÔNG cùng lúc nằm trong DOM (apps ẩn/hiện bằng
 * `lg:`). Hai bản cùng mang `data-element-key='menuLabels[i]'` sẽ làm editor
 * bắt nhầm node đang ẩn khi vẽ khung chọn, nên cha chọn đúng một bản theo
 * `isDesktop` đo từ container.
 */
import * as React from 'react';

import { composeStyle, selectableClass } from './applyStyle';
import { IconDash } from './lecoolStoryIcons';
import {
  CROWN_H,
  CROWN_W,
  DEFAULT_CROWN,
  MENU_STACK_H,
  RAIL_W,
  menuLayout,
} from './lecoolStoryData';
import {
  LECOOL_BODY_FONT,
  LECOOL_HEADER_H,
  LECOOL_INK,
  LECOOL_PAPER,
  LECOOL_STAGE_H,
} from './lecoolTheme';

const EASE = 'cubic-bezier(.4,0,.2,1)';

interface MenuProps {
  labels: string[];
  crownUrl?: string;
  activeIndex: number;
  onSelect: (index: number) => void;
  styleOf: (key: string) => React.CSSProperties | undefined;
  activeKey?: string | null;
  isCanvas: boolean;
}

const RAIL_LABEL_STYLE: React.CSSProperties = {
  fontFamily: LECOOL_BODY_FONT,
  fontSize: 16,
  lineHeight: '26px',
  fontWeight: 500,
  color: '#000000',
  textTransform: 'uppercase',
};

const TAB_LABEL_STYLE: React.CSSProperties = {
  ...RAIL_LABEL_STYLE,
  fontSize: 13,
};

function Dashes({ visible, offset }: { visible: boolean; offset: number }) {
  const base = `absolute top-1/2 h-[6px] w-[21px] -translate-y-1/2 transition-opacity duration-300 ${
    visible ? 'opacity-100' : 'opacity-0'
  }`;
  return (
    <>
      <IconDash className={base} style={{ left: -offset, color: LECOOL_INK }} />
      <IconDash
        className={base}
        style={{ right: -offset, color: LECOOL_INK }}
      />
    </>
  );
}

/** Rail dọc bên trái (container ≥ @4xl). */
export function LecoolStoryRail({
  labels,
  crownUrl,
  activeIndex,
  onSelect,
  styleOf,
  activeKey,
  isCanvas,
}: MenuProps) {
  const { crownTop, itemTop } = menuLayout(activeIndex, labels.length);

  return (
    <aside
      className='sticky shrink-0 border-r'
      style={{
        top: LECOOL_HEADER_H,
        height: LECOOL_STAGE_H,
        width: RAIL_W,
        borderColor: 'rgba(0,0,0,0.4)',
        backgroundColor: LECOOL_PAPER,
        paddingTop: 'clamp(56px, 8cqi, 120px)',
      }}
    >
      <div className='relative mx-auto w-full' style={{ height: MENU_STACK_H }}>
        {/* `data-crown-slot` — điểm dừng thứ 2 của CrownTraveler bên apps. */}
        <img
          src={crownUrl || DEFAULT_CROWN}
          alt=''
          aria-hidden
          data-crown-slot='story'
          data-element-key='crownUrl'
          width={CROWN_W}
          height={CROWN_H}
          className={selectableClass(
            activeKey === 'crownUrl',
            'absolute left-1/2 h-auto -translate-x-1/2'
          )}
          style={composeStyle(
            { width: CROWN_W, top: crownTop, transition: `top 500ms ${EASE}` },
            styleOf('crownUrl')
          )}
        />

        {labels.map((label, i) => {
          const key = `menuLabels[${i}]`;
          return (
            <button
              key={key}
              type='button'
              onClick={isCanvas ? undefined : () => onSelect(i)}
              aria-current={i === activeIndex ? 'true' : undefined}
              className='absolute left-1/2 flex h-[26px] -translate-x-1/2 items-center whitespace-nowrap'
              style={{ top: itemTop[i], transition: `top 500ms ${EASE}` }}
            >
              <span
                data-element-key={key}
                className={selectableClass(activeKey === key)}
                style={composeStyle(RAIL_LABEL_STYLE, styleOf(key))}
              >
                {label}
              </span>
              <Dashes visible={i === activeIndex} offset={26} />
            </button>
          );
        })}
      </div>
    </aside>
  );
}

/**
 * Bản phẳng CHỈ dùng trên canvas editor: vương miện + 3 nhãn nằm một hàng,
 * không sticky, không phụ thuộc bề rộng khung — để author bấm chọn được cả
 * `crownUrl` lẫn từng nhãn ở mọi khổ máy. Preview và `/p` không bao giờ thấy.
 */
export function LecoolStoryMenuFlat({
  labels,
  crownUrl,
  styleOf,
  activeKey,
}: Omit<MenuProps, 'activeIndex' | 'onSelect' | 'isCanvas'>) {
  return (
    <div
      className='flex flex-wrap items-center gap-6 border-b px-6 py-6'
      style={{
        borderColor: 'rgba(0,0,0,0.4)',
        backgroundColor: LECOOL_PAPER,
      }}
    >
      <img
        src={crownUrl || DEFAULT_CROWN}
        alt=''
        aria-hidden
        data-element-key='crownUrl'
        width={CROWN_W}
        height={CROWN_H}
        className={selectableClass(activeKey === 'crownUrl', 'h-auto')}
        style={composeStyle({ width: 96 }, styleOf('crownUrl'))}
      />
      {labels.map((label, i) => {
        const key = `menuLabels[${i}]`;
        return (
          <span
            key={key}
            data-element-key={key}
            className={selectableClass(activeKey === key)}
            style={composeStyle(RAIL_LABEL_STYLE, styleOf(key))}
          >
            {label}
          </span>
        );
      })}
    </div>
  );
}

/** Tab bar ngang dính đỉnh (container < @4xl). */
export function LecoolStoryTabBar({
  labels,
  activeIndex,
  onSelect,
  styleOf,
  activeKey,
  isCanvas,
}: Omit<MenuProps, 'crownUrl'>) {
  return (
    <nav
      aria-label='Product story'
      className='sticky z-30 flex items-center justify-center gap-4 border-b py-3'
      style={{
        top: LECOOL_HEADER_H,
        borderColor: 'rgba(0,0,0,0.4)',
        backgroundColor: LECOOL_PAPER,
      }}
    >
      {labels.map((label, i) => {
        const key = `menuLabels[${i}]`;
        return (
          <button
            key={key}
            type='button'
            onClick={isCanvas ? undefined : () => onSelect(i)}
            aria-current={i === activeIndex ? 'true' : undefined}
            className='relative flex h-[26px] items-center px-[26px] whitespace-nowrap'
          >
            <span
              data-element-key={key}
              className={selectableClass(
                activeKey === key,
                'transition-opacity'
              )}
              style={composeStyle(
                TAB_LABEL_STYLE,
                { opacity: i === activeIndex ? 1 : 0.4 },
                styleOf(key)
              )}
            >
              {label}
            </span>
            <Dashes visible={i === activeIndex} offset={0} />
          </button>
        );
      })}
    </nav>
  );
}
