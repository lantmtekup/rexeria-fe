'use client';

/**
 * Block "Product - Details Gallery" (port `ProductDetails` của
 * apps/gambit-delvaux) — giữ nguyên cơ chế + timing gốc:
 *
 *  - Sân khấu cao 1 khung hình, DÁN bằng CSS `sticky` (thay `pin: true` của
 *    bản app — convention của host, an toàn iOS + editor scroller). Quãng
 *    scrub = `max(travel * 1.15, 100svh)` với `travel = scrollWidth - viewport`
 *    của dải ảnh (đo runtime), đúng công thức `end` của bản gốc.
 *  - Vào màn: dải ảnh trượt vào từ phải (x 160 → 0); panel vào SAU + chậm hơn
 *    (delay 0.28, duration 1.25) — drawer trượt ngang, sheet trồi từ dưới.
 *  - Dán: dải ảnh scrub ngang hết `travel` (scrub 0.35).
 *
 * Breakpoint theo CONTAINER (`useContainerMobile`) chứ không `matchMedia` —
 * bản app dùng `(max-width:1023px)`; trong editor khung device mới là thước đo.
 * < `@2xl`: bottom sheet kéo được (tay cầm + ngưỡng 48px). ≥ `@2xl`: cột phải.
 *
 * Canvas editor: fork sang lưới phẳng (ảnh xếp lưới, accordion mở sẵn, mọi màu
 * hiện cùng lúc) — PreviewMode + `/p` giữ production.
 *
 * Font/màu dùng chung với cụm Delvaux (`delvauxTheme`): cùng thương hiệu.
 */
import * as React from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import { useLandingMotion } from '../motion/LandingMotion';
import {
  DELVAUX_FONT_BODY,
  DELVAUX_FONT_CSS,
  DELVAUX_FONT_HEADING,
} from './delvauxTheme';
import {
  resolveGambitDetailsAccordions,
  resolveGambitDetailsActions,
  resolveGambitDetailsColors,
  resolveGambitDetailsGallery,
  resolveGambitDetailsSizes,
} from './_registry/defs/gambitProductDetails';
import { useContainerMobile } from './useContainerMobile';
import { useIsCanvasEdit } from './useIsCanvasEdit';
import type {
  BlockBackground,
  ElementPositionsMap,
  ElementStylesMap,
  GambitProductDetailsAccordion,
  GambitProductDetailsActionIcon,
  GambitProductDetailsContent,
} from '../types';
import {
  blockBackgroundStyle,
  composeStyle,
  elementStyleOf,
  orderStyle,
  positionStyle,
  selectableClass,
} from './applyStyle';

gsap.registerPlugin(ScrollTrigger);

interface Props {
  content: GambitProductDetailsContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
}

/** Nền gốc của trang app (`bg-[#F5F5F5]`). */
const DETAILS_BG = '#f5f5f5';

/** Entrance: dải ảnh dẫn từ phải; panel vào sau + chậm hơn (giữ nguyên gốc). */
const ENTER_GALLERY_X = 160;
const ENTER_DRAWER_X = 120;
const ENTER_SHEET_Y = 72;
const ENTER_DELAY = 1;
const ENTER_GALLERY_DURATION = 0.9;
const ENTER_PANEL_DURATION = 1.25;
const ENTER_PANEL_DELAY = 0.28;

/**
 * Chrome CHỈ của canvas editor (thẻ + nhãn nhóm) — không phải nội dung CMS,
 * không có `data-element-key`, không ship sang PreviewMode / `/p`.
 */
const CANVAS_CARD: React.CSSProperties = {
  background: '#ffffff',
  border: '1px solid rgba(0,0,0,0.08)',
  borderRadius: 12,
  padding: 'clamp(16px, 2cqi, 28px)',
};

const CANVAS_SECTION_LABEL: React.CSSProperties = {
  margin: 0,
  marginBottom: 12,
  fontFamily: DELVAUX_FONT_BODY,
  fontSize: 11,
  fontWeight: 500,
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
  color: 'rgba(0,0,0,0.4)',
};

/** Ngưỡng kéo (px) để bung / thu bottom sheet. */
const SHEET_DRAG_THRESHOLD = 48;
/** Chiều cao sheet (mobile) — dải ảnh chừa đúng phần collapsed. */
const SHEET_HEIGHT_COLLAPSED = 'min(48svh, 28rem)';
const SHEET_HEIGHT_EXPANDED = 'min(88svh, 52rem)';

const ActionIconSvg = ({ icon }: { icon: GambitProductDetailsActionIcon }) => {
  const common = {
    style: { width: 16, height: 16, flexShrink: 0 },
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.5,
    'aria-hidden': true as const,
  };

  if (icon === 'plane') {
    return (
      <svg {...common}>
        <path d='M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z' />
      </svg>
    );
  }
  if (icon === 'chat') {
    return (
      <svg {...common}>
        <path d='M21 11.5a8.4 8.4 0 01-1.9 5.4 8.5 8.5 0 01-6.6 3.1 8.4 8.4 0 01-2.4-.3L3 21l1.4-4.1a8.5 8.5 0 01-1.4-4.4A8.5 8.5 0 0112 3.5h.5a8.4 8.4 0 018.5 8z' />
      </svg>
    );
  }
  if (icon === 'pin') {
    return (
      <svg {...common}>
        <path d='M12 21s7-4.5 7-11a7 7 0 10-14 0c0 6.5 7 11 7 11z' />
        <circle cx='12' cy='10' r='2.5' />
      </svg>
    );
  }
  if (icon === 'search') {
    return (
      <svg {...common}>
        <circle cx='11' cy='11' r='7' />
        <path d='M20 20l-3.5-3.5' />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <path d='M5 12h14M13 6l6 6-6 6' />
    </svg>
  );
};

export function GambitProductDetails({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
}: Props) {
  const rootRef = React.useRef<HTMLElement>(null);
  const galleryViewportRef = React.useRef<HTMLDivElement>(null);
  const galleryTrackRef = React.useRef<HTMLDivElement>(null);
  const panelRef = React.useRef<HTMLElement>(null);
  const isMobile = useContainerMobile(rootRef);
  const isCanvas = useIsCanvasEdit(rootRef);
  const { scroller, requestRefresh } = useLandingMotion();

  const gallery = resolveGambitDetailsGallery(content);
  const colors = resolveGambitDetailsColors(content);
  const sizes = resolveGambitDetailsSizes(content);
  const accordions = resolveGambitDetailsAccordions(content);
  const actions = resolveGambitDetailsActions(content);

  const [selectedColor, setSelectedColor] = React.useState(0);
  const [selectedSize, setSelectedSize] = React.useState(1);
  const [openAccordion, setOpenAccordion] = React.useState<number | null>(null);
  const [sheetExpanded, setSheetExpanded] = React.useState(false);
  /** Quãng cuộn ngang của dải ảnh (px) — đo runtime, quyết định độ dài scrub. */
  const [travel, setTravel] = React.useState(0);

  const sheetDragRef = React.useRef<{
    active: boolean;
    startY: number;
    lastY: number;
    moved: boolean;
  } | null>(null);

  const styleOf = (key: string) =>
    composeStyle(
      elementStyleOf(styles, key),
      orderStyle(order, key),
      positionStyle(positions, key)
    );

  // Đổi nội dung (số ảnh / chữ) → đo lại quãng cuộn + dựng lại timeline.
  const galleryKey = gallery.join('|');

  const colorIndex = Math.min(selectedColor, colors.length - 1);
  const activeColor = colors[colorIndex];

  const handleAccordionToggle = (index: number) => {
    setOpenAccordion(prev => (prev === index ? null : index));
  };

  const handleSheetToggle = () => setSheetExpanded(prev => !prev);

  const handleSheetToggleKeyDown = (
    event: React.KeyboardEvent<HTMLButtonElement>
  ) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    handleSheetToggle();
  };

  const handleSheetPointerDown = (
    event: React.PointerEvent<HTMLButtonElement>
  ) => {
    sheetDragRef.current = {
      active: true,
      startY: event.clientY,
      lastY: event.clientY,
      moved: false,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handleSheetPointerMove = (
    event: React.PointerEvent<HTMLButtonElement>
  ) => {
    const drag = sheetDragRef.current;
    const panel = panelRef.current;
    if (!drag?.active || !panel) return;

    drag.lastY = event.clientY;
    const dy = event.clientY - drag.startY;
    if (Math.abs(dy) > 6) drag.moved = true;

    // Đã bung thì chỉ kéo xuống được, chưa bung thì chỉ kéo lên được.
    const clamped = sheetExpanded ? Math.max(0, dy) : Math.min(0, dy);
    gsap.set(panel, { y: clamped });
  };

  const handleSheetPointerUp = () => {
    const drag = sheetDragRef.current;
    const panel = panelRef.current;
    if (!drag?.active || !panel) {
      sheetDragRef.current = null;
      return;
    }

    const dy = drag.lastY - drag.startY;
    gsap.to(panel, { y: 0, duration: 0.35, ease: 'power3.out' });

    if (dy <= -SHEET_DRAG_THRESHOLD) {
      setSheetExpanded(true);
      sheetDragRef.current = { ...drag, active: false, moved: true };
      return;
    }
    if (dy >= SHEET_DRAG_THRESHOLD) {
      setSheetExpanded(false);
      sheetDragRef.current = { ...drag, active: false, moved: true };
      return;
    }

    sheetDragRef.current = { ...drag, active: false };
  };

  const handleSheetClick = () => {
    const drag = sheetDragRef.current;
    // Kéo xong nhả tay cũng phát `click` — bỏ qua để không toggle 2 lần.
    if (drag?.moved) {
      sheetDragRef.current = null;
      return;
    }
    sheetDragRef.current = null;
    handleSheetToggle();
  };

  // ── Đo quãng cuộn ngang (ảnh load xong / đổi bề rộng khung) ──
  React.useEffect(() => {
    if (isCanvas) return;

    const viewport = galleryViewportRef.current;
    const track = galleryTrackRef.current;
    if (!viewport || !track) return;

    const measure = () => {
      const next = Math.max(0, track.scrollWidth - viewport.clientWidth);
      setTravel(prev => (Math.abs(prev - next) < 1 ? prev : next));
    };

    measure();

    const ro = new ResizeObserver(measure);
    ro.observe(viewport);
    ro.observe(track);
    return () => ro.disconnect();
  }, [isCanvas, isMobile, galleryKey]);

  // ── Motion: entrance + scrub ngang ──
  React.useEffect(() => {
    if (isCanvas) return;

    const root = rootRef.current;
    const viewport = galleryViewportRef.current;
    const track = galleryTrackRef.current;
    const panel = panelRef.current;
    if (!root || !viewport || !track || !panel) return;

    const reduce = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    const ctx = gsap.context(() => {
      gsap.set(viewport, { x: 0, y: 0, autoAlpha: 1 });
      gsap.set(panel, { x: 0, y: 0, autoAlpha: 1 });
      gsap.set(track, { x: 0 });

      if (reduce) return;

      gsap.set(viewport, { x: ENTER_GALLERY_X, autoAlpha: 0 });
      gsap.set(
        panel,
        isMobile
          ? { y: ENTER_SHEET_Y, autoAlpha: 0 }
          : { x: ENTER_DRAWER_X, autoAlpha: 0 }
      );

      // Start TRƯỚC khi dán (`top 99%`) để dải ảnh/panel hiện ngay lúc section
      // ló vào khung nhìn — tránh blank nếu đáp thiếu 1px.
      const entrance = gsap.timeline({
        delay: ENTER_DELAY,
        defaults: { ease: 'power3.out' },
        scrollTrigger: {
          trigger: root,
          scroller,
          start: 'top 99%',
          toggleActions: 'restart none none reset',
        },
      });

      entrance
        .to(viewport, {
          x: 0,
          autoAlpha: 1,
          duration: ENTER_GALLERY_DURATION,
        })
        .to(
          panel,
          isMobile
            ? { y: 0, autoAlpha: 1, duration: ENTER_PANEL_DURATION }
            : { x: 0, autoAlpha: 1, duration: ENTER_PANEL_DURATION },
          ENTER_PANEL_DELAY
        );

      if (travel > 0) {
        gsap.to(track, {
          x: -travel,
          ease: 'none',
          scrollTrigger: {
            trigger: root,
            scroller,
            start: 'top top',
            end: 'bottom bottom',
            scrub: 0.35,
            invalidateOnRefresh: true,
          },
        });
      }

      // R4: quãng scrub phụ thuộc chiều cao spacer vừa đổi theo `travel`.
      requestRefresh();
    }, root);

    return () => ctx.revert();
  }, [isCanvas, isMobile, scroller, requestRefresh, travel, galleryKey]);

  // ── Style tokens (tuyền inline — toolbar override được) ──
  const titleBase: React.CSSProperties = {
    margin: 0,
    fontFamily: DELVAUX_FONT_HEADING,
    fontWeight: 400,
    fontSize: 'clamp(1.45rem, 5.2cqi, 2.15rem)',
    lineHeight: 1,
    letterSpacing: '0.02em',
    textTransform: 'uppercase',
    color: '#000000',
  };

  const subtitleBase: React.CSSProperties = {
    margin: 0,
    marginTop: 8,
    fontFamily: DELVAUX_FONT_BODY,
    fontSize: 'clamp(11px, 1cqi, 12px)',
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
    color: 'rgba(0,0,0,0.7)',
  };

  const colorLabelBase: React.CSSProperties = {
    margin: 0,
    fontFamily: DELVAUX_FONT_BODY,
    fontSize: 14,
    color: '#000000',
  };

  const dimensionsBase: React.CSSProperties = {
    margin: 0,
    fontFamily: DELVAUX_FONT_BODY,
    fontSize: 'clamp(11px, 1cqi, 12px)',
    lineHeight: 1.6,
    color: 'rgba(0,0,0,0.8)',
  };

  const dimensionsNoteBase: React.CSSProperties = {
    display: 'block',
    fontFamily: DELVAUX_FONT_BODY,
    fontSize: 'clamp(11px, 1cqi, 12px)',
    color: 'rgba(0,0,0,0.45)',
  };

  const sizeBase = (selected: boolean): React.CSSProperties => ({
    fontFamily: DELVAUX_FONT_BODY,
    fontSize: 14,
    cursor: 'pointer',
    background: 'none',
    border: 'none',
    padding: 0,
    color: selected ? '#000000' : 'rgba(0,0,0,0.55)',
    textDecoration: selected ? 'underline' : 'none',
    textUnderlineOffset: 4,
  });

  const accordionTitleBase: React.CSSProperties = {
    fontFamily: DELVAUX_FONT_BODY,
    fontSize: 14,
    color: '#000000',
  };

  const accordionBodyBase: React.CSSProperties = {
    margin: 0,
    fontFamily: DELVAUX_FONT_BODY,
    fontSize: 13,
    lineHeight: 1.65,
    color: 'rgba(0,0,0,0.75)',
  };

  const actionRowBase = (primary: boolean): React.CSSProperties => ({
    display: 'flex',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    borderBottom: '1px solid rgba(0,0,0,0.1)',
    paddingBlock: 14,
    paddingInline: primary ? 16 : 0,
    textDecoration: 'none',
    cursor: 'pointer',
    background: primary ? '#000000' : 'transparent',
    color: primary ? '#ffffff' : '#000000',
  });

  const actionLabelBase: React.CSSProperties = {
    fontFamily: DELVAUX_FONT_BODY,
    fontSize: 14,
    color: 'inherit',
  };

  const imageBase: React.CSSProperties = {
    display: 'block',
    height: '100%',
    width: 'auto',
    maxWidth: '100%',
    objectFit: 'contain',
  };

  // ── Mảnh dùng chung cho production + canvas ──

  const renderHeading = () => (
    <>
      <h2
        data-element-key='title'
        className={selectableClass(activeKey === 'title')}
        style={composeStyle(titleBase, styleOf('title'))}
      >
        {content?.title}
      </h2>
      <p
        data-element-key='subtitle'
        className={selectableClass(activeKey === 'subtitle')}
        style={composeStyle(subtitleBase, styleOf('subtitle'))}
      >
        {content?.subtitle}
      </p>
    </>
  );

  const renderSwatches = () => (
    <div
      style={{ display: 'flex', alignItems: 'center', gap: 10 }}
      role='radiogroup'
      aria-label='Color'
    >
      {colors.map((color, i) => {
        const selected = i === colorIndex;
        return (
          <button
            key={`${color.label}-${i}`}
            type='button'
            role='radio'
            aria-checked={selected}
            aria-label={color.label}
            tabIndex={0}
            onClick={() => setSelectedColor(i)}
            style={{
              width: 20,
              height: 20,
              borderRadius: '9999px',
              cursor: 'pointer',
              backgroundColor: color.hex,
              border: selected
                ? '1px solid #000000'
                : '1px solid rgba(0,0,0,0.2)',
              boxShadow: selected ? '0 0 0 2px #fff, 0 0 0 3px #000' : 'none',
            }}
          />
        );
      })}
    </div>
  );

  const renderSizes = () => (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'flex-end',
        columnGap: 12,
        rowGap: 4,
      }}
      role='radiogroup'
      aria-label='Size'
    >
      {sizes.map((size, i) => {
        const selected = i === selectedSize;
        return (
          <button
            key={`${size}-${i}`}
            type='button'
            role='radio'
            aria-checked={selected}
            tabIndex={0}
            data-element-key={`sizes[${i}]`}
            onClick={() => setSelectedSize(i)}
            className={selectableClass(activeKey === `sizes[${i}]`)}
            style={composeStyle(sizeBase(selected), styleOf(`sizes[${i}]`))}
          >
            {size}
          </button>
        );
      })}
    </div>
  );

  const renderDimensions = () => (
    <p
      data-element-key='dimensions'
      className={selectableClass(activeKey === 'dimensions')}
      style={composeStyle(dimensionsBase, styleOf('dimensions'))}
    >
      {content?.dimensions}
      <span
        data-element-key='dimensionsNote'
        className={selectableClass(activeKey === 'dimensionsNote')}
        style={composeStyle(dimensionsNoteBase, styleOf('dimensionsNote'))}
      >
        {content?.dimensionsNote}
      </span>
    </p>
  );

  const renderAccordion = (
    item: GambitProductDetailsAccordion,
    index: number,
    open: boolean
  ) => (
    <div key={index} style={{ borderBottom: '1px solid rgba(0,0,0,0.1)' }}>
      <button
        type='button'
        aria-expanded={open}
        aria-controls={`gambit-accordion-${index}`}
        tabIndex={0}
        onClick={isCanvas ? undefined : () => handleAccordionToggle(index)}
        style={{
          display: 'flex',
          width: '100%',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          paddingBlock: 14,
          textAlign: 'left',
          background: 'none',
          border: 'none',
          cursor: isCanvas ? 'default' : 'pointer',
        }}
      >
        <span
          data-element-key={`accordions[${index}].title`}
          className={selectableClass(
            activeKey === `accordions[${index}].title`
          )}
          style={composeStyle(
            accordionTitleBase,
            styleOf(`accordions[${index}].title`)
          )}
        >
          {item.title}
        </span>
        <span aria-hidden style={{ fontSize: 16, lineHeight: 1 }}>
          {open ? '−' : '+'}
        </span>
      </button>
      <div
        id={`gambit-accordion-${index}`}
        role='region'
        hidden={!open}
        style={{ paddingBottom: 14 }}
      >
        <p
          data-element-key={`accordions[${index}].body`}
          className={selectableClass(activeKey === `accordions[${index}].body`)}
          style={composeStyle(
            accordionBodyBase,
            styleOf(`accordions[${index}].body`)
          )}
        >
          {item.body}
        </p>
      </div>
    </div>
  );

  const renderActions = () => (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {actions.map((action, i) => {
        const hrefKey = `actions[${i}].href`;
        const labelKey = `actions[${i}].label`;
        const primary = Boolean(action.primary);
        return (
          <a
            key={i}
            data-element-key={hrefKey}
            href={isCanvas ? undefined : action.href || '#'}
            onClick={isCanvas ? e => e.preventDefault() : undefined}
            aria-label={action.label}
            className={selectableClass(activeKey === hrefKey)}
            style={composeStyle(actionRowBase(primary), styleOf(hrefKey))}
          >
            <span
              data-element-key={labelKey}
              className={selectableClass(activeKey === labelKey)}
              style={composeStyle(actionLabelBase, styleOf(labelKey))}
            >
              {action.label}
            </span>
            <ActionIconSvg icon={action.icon} />
          </a>
        );
      })}
    </div>
  );

  // ── Editor canvas: lưới phẳng, mọi field hiện cùng lúc ──
  if (isCanvas) {
    return (
      <section
        ref={rootRef}
        data-canvas-edit='true'
        className='gambit-details @container relative w-full'
        style={composeStyle(
          { background: DETAILS_BG },
          blockBackgroundStyle(background)
        )}
      >
        <style>{DELVAUX_FONT_CSS}</style>
        <div
          className='flex flex-col'
          style={{
            gap: 'clamp(20px, 2.4cqi, 32px)',
            padding: 'clamp(20px, 3cqi, 44px) clamp(20px, 3.5cqi, 56px)',
          }}
        >
          {/* Dải ảnh — ô vuông đều nhau để chọn từng ảnh, không so le */}
          <div style={CANVAS_CARD}>
            <p style={CANVAS_SECTION_LABEL}>Dải ảnh · {gallery.length} ảnh</p>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns:
                  'repeat(auto-fill, minmax(min(20cqi, 132px), 1fr))',
                gap: 'clamp(8px, 1cqi, 12px)',
              }}
            >
              {gallery.map((src, i) => (
                <div
                  key={`${src}-${i}`}
                  style={{
                    aspectRatio: '3 / 4',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 8,
                    borderRadius: 8,
                    background: DETAILS_BG,
                    border: '1px solid rgba(0,0,0,0.06)',
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    data-element-key={`galleryImages[${i}]`}
                    src={src}
                    alt={`${content?.title ?? ''} ${i + 1}`}
                    className={selectableClass(
                      activeKey === `galleryImages[${i}]`
                    )}
                    style={composeStyle(
                      {
                        display: 'block',
                        // Lấp đúng ô (đã trừ padding) + contain: ảnh dọc/ngang
                        // hay crop sát mép đều nằm gọn, lưới không so le.
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                      },
                      styleOf(`galleryImages[${i}]`)
                    )}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Thông tin — 2 cột trên khung rộng để không thừa nửa màn bên phải */}
          <div
            className='grid @3xl:grid-cols-2'
            style={{ gap: 'clamp(16px, 2cqi, 28px)', alignItems: 'start' }}
          >
            <div style={CANVAS_CARD}>
              <p style={CANVAS_SECTION_LABEL}>Sản phẩm</p>
              {renderHeading()}

              <p style={{ ...CANVAS_SECTION_LABEL, marginTop: 24 }}>Màu</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {colors.map((color, i) => (
                  <div
                    key={`${color.label}-${i}`}
                    style={{ display: 'flex', alignItems: 'center', gap: 10 }}
                  >
                    <span
                      aria-hidden
                      style={{
                        width: 20,
                        height: 20,
                        borderRadius: '9999px',
                        flexShrink: 0,
                        backgroundColor: color.hex,
                        border: '1px solid rgba(0,0,0,0.2)',
                      }}
                    />
                    <span
                      data-element-key={`colors[${i}].label`}
                      className={selectableClass(
                        activeKey === `colors[${i}].label`
                      )}
                      style={composeStyle(
                        colorLabelBase,
                        styleOf(`colors[${i}].label`)
                      )}
                    >
                      {color.label}
                    </span>
                  </div>
                ))}
              </div>

              <p style={{ ...CANVAS_SECTION_LABEL, marginTop: 24 }}>
                Kích thước &amp; size
              </p>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  gap: 16,
                }}
              >
                {renderDimensions()}
                {renderSizes()}
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 'clamp(16px, 2cqi, 28px)',
              }}
            >
              <div style={CANVAS_CARD}>
                <p style={CANVAS_SECTION_LABEL}>
                  Accordion · {accordions.length} mục
                </p>
                <div style={{ borderTop: '1px solid rgba(0,0,0,0.1)' }}>
                  {accordions.map((item, i) => renderAccordion(item, i, true))}
                </div>
              </div>

              <div style={CANVAS_CARD}>
                <p style={CANVAS_SECTION_LABEL}>
                  Hành động · {actions.length} dòng
                </p>
                {renderActions()}
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // ── Production (PreviewMode + /p): sân khấu dán + dải ảnh scrub ngang ──
  const scrubPx = Math.round(travel * 1.15);
  /** Spacer = 1 khung dán + quãng scrub (đúng `end` của bản gốc). */
  const spacerHeight = `calc(100svh + max(${scrubPx}px, 100svh))`;

  return (
    <section
      ref={rootRef}
      className='gambit-details @container relative w-full'
      aria-label={content?.title ? `Buy ${content.title}` : 'Product details'}
      style={composeStyle(
        { background: DETAILS_BG },
        blockBackgroundStyle(background)
      )}
    >
      <style>{DELVAUX_FONT_CSS}</style>
      <div style={{ height: spacerHeight }}>
        <div
          className='sticky top-0 overflow-hidden'
          style={{ height: '100svh' }}
        >
          <div
            style={{
              position: 'relative',
              height: '100%',
              display: isMobile ? 'block' : 'flex',
              flexDirection: 'row',
            }}
          >
            {/* Dải ảnh — full-bleed dưới sheet (mobile) / cột trái (desktop) */}
            <div
              ref={galleryViewportRef}
              className='will-change-transform'
              style={
                isMobile
                  ? {
                      position: 'absolute',
                      inset: 0,
                      minHeight: 0,
                      overflow: 'hidden',
                      paddingBottom: SHEET_HEIGHT_COLLAPSED,
                    }
                  : {
                      position: 'relative',
                      height: '100%',
                      width: '68%',
                      minHeight: 0,
                      overflow: 'hidden',
                    }
              }
            >
              <div
                ref={galleryTrackRef}
                className='will-change-transform'
                style={{
                  display: 'flex',
                  height: '100%',
                  width: 'max-content',
                }}
              >
                {gallery.map((src, i) => (
                  <div
                    key={`${src}-${i}`}
                    style={{
                      display: 'flex',
                      height: '100%',
                      alignItems: 'center',
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      data-element-key={`galleryImages[${i}]`}
                      src={src}
                      alt={`${content?.title ?? ''} view ${i + 1}`}
                      draggable={false}
                      className={selectableClass(
                        activeKey === `galleryImages[${i}]`
                      )}
                      style={composeStyle(
                        imageBase,
                        styleOf(`galleryImages[${i}]`)
                      )}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom sheet (mobile) / side drawer (desktop) */}
            <aside
              ref={panelRef}
              aria-label='Product information'
              data-sheet-expanded={sheetExpanded ? 'true' : 'false'}
              // Phần tử CUỘN thật đổi theo chế độ: desktop là chính `aside`,
              // mobile là khối nội dung bên trong (aside chỉ cắt + đổi cao).
              data-lenis-prevent={isMobile ? undefined : ''}
              className='will-change-transform'
              style={
                isMobile
                  ? {
                      position: 'absolute',
                      insetInline: 0,
                      bottom: 0,
                      zIndex: 10,
                      display: 'flex',
                      width: '100%',
                      flexDirection: 'column',
                      overflow: 'hidden',
                      height: sheetExpanded
                        ? SHEET_HEIGHT_EXPANDED
                        : SHEET_HEIGHT_COLLAPSED,
                      borderTop: '1px solid rgba(0,0,0,0.08)',
                      borderTopLeftRadius: 16,
                      borderTopRightRadius: 16,
                      background: '#ffffff',
                      paddingBottom: 64,
                      boxShadow: '0 -8px 32px rgba(0,0,0,0.06)',
                      transition: 'height 300ms ease-out',
                    }
                  : {
                      position: 'relative',
                      display: 'flex',
                      height: '100%',
                      width: '32%',
                      flexDirection: 'column',
                      overflowY: 'auto',
                      borderLeft: '1px solid rgba(0,0,0,0.08)',
                      background: '#ffffff',
                      paddingBottom: 80,
                    }
              }
            >
              {/* Tay cầm sheet — chỉ mobile */}
              {isMobile ? (
                <div style={{ flexShrink: 0 }}>
                  <button
                    type='button'
                    tabIndex={0}
                    aria-label={
                      sheetExpanded
                        ? 'Collapse product details'
                        : 'Expand product details'
                    }
                    aria-expanded={sheetExpanded}
                    onClick={handleSheetClick}
                    onKeyDown={handleSheetToggleKeyDown}
                    onPointerDown={handleSheetPointerDown}
                    onPointerMove={handleSheetPointerMove}
                    onPointerUp={handleSheetPointerUp}
                    onPointerCancel={handleSheetPointerUp}
                    className='cursor-grab active:cursor-grabbing'
                    style={{
                      display: 'flex',
                      width: '100%',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 0,
                      paddingTop: 10,
                      paddingBottom: 4,
                      background: 'none',
                      border: 'none',
                      touchAction: 'none',
                    }}
                  >
                    <span
                      aria-hidden
                      style={{
                        height: 4,
                        width: 40,
                        borderRadius: 9999,
                        background: 'rgba(0,0,0,0.2)',
                      }}
                    />
                  </button>
                </div>
              ) : null}

              <div
                data-lenis-prevent={isMobile ? '' : undefined}
                style={{
                  display: 'flex',
                  minHeight: 0,
                  flex: 1,
                  flexDirection: 'column',
                  // Desktop: nội dung tràn ra để `aside` cuộn (như bản gốc
                  // `lg:overflow-visible`) — tránh 2 lớp scroll lồng nhau.
                  overflowY: isMobile ? 'auto' : 'visible',
                  paddingInline: 'clamp(20px, 2.4cqi, 32px)',
                  paddingTop: isMobile ? 8 : 48,
                }}
              >
                {renderHeading()}

                {/* Màu */}
                <div
                  style={{
                    marginTop: 24,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 16,
                  }}
                >
                  <p
                    data-element-key={`colors[${colorIndex}].label`}
                    className={selectableClass(
                      activeKey === `colors[${colorIndex}].label`
                    )}
                    style={composeStyle(
                      colorLabelBase,
                      styleOf(`colors[${colorIndex}].label`)
                    )}
                  >
                    {activeColor?.label}
                  </p>
                  {renderSwatches()}
                </div>

                {/* Kích thước + size */}
                <div
                  style={{
                    marginTop: 24,
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    gap: 16,
                    borderTop: '1px solid rgba(0,0,0,0.1)',
                    paddingTop: 16,
                  }}
                >
                  {renderDimensions()}
                  {renderSizes()}
                </div>

                {/* Accordion */}
                <div
                  style={{
                    marginTop: 8,
                    borderTop: '1px solid rgba(0,0,0,0.1)',
                  }}
                >
                  {accordions.map((item, i) =>
                    renderAccordion(item, i, openAccordion === i)
                  )}
                </div>

                {/* Hành động */}
                <div style={{ marginTop: 'auto', paddingTop: 16 }}>
                  {renderActions()}
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </section>
  );
}
