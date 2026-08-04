'use client';

/**
 * Block "Product - Overview Scroll" (port `ProductOverview` của
 * apps/gambit-delvaux) — giữ nguyên cơ chế + timing gốc:
 *
 *  - Sân khấu cao 1 khung hình, DÁN bằng CSS `sticky` (thay `pin: true` của
 *    bản app — convention của host, an toàn iOS + editor scroller). Quãng
 *    scrub = (số panel + 1) khung hình: 1 đoạn cho s07→s08, mỗi lần trượt
 *    track 1 đoạn, và 1 đoạn exit cuối.
 *  - Panel 0: ảnh bắt đầu ở GIỮA sân khấu (offset x đo runtime) → về cột trái
 *    (desktop) hoặc nhấc lên trên khối chữ (mobile, đo runtime để không chồng
 *    chữ); song song, khối chữ reveal TỪNG DÒNG qua SplitText mask.
 *  - Track trượt: ảnh panel đang ra chạy chậm hơn (y += parallaxY), ảnh panel
 *    vào từ y = parallaxY → 0.
 *  - Panel cuối: exit tách trái/phải + mờ (mobile: ảnh ↑ / chữ ↓ — nghịch đảo
 *    của line-reveal).
 *
 * Motion chạy qua `useLandingMotion` + `gsap.context` riêng (cần cleanup
 * SplitText + đợi `document.fonts.ready` trước khi chia dòng), mọi
 * `scrollTrigger` đều nhận `scroller`.
 *
 * Canvas editor: fork sang lưới phẳng (mọi panel + mọi field hiện cùng lúc,
 * chiều cao auto, không sticky/scrub) — PreviewMode + `/p` giữ production.
 *
 * Font/màu dùng chung với cụm Delvaux (`delvauxTheme`): cùng thương hiệu, font
 * self-host đã nằm ở `public/delvaux/font`.
 */
import * as React from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';

import { useLandingMotion } from '../motion/LandingMotion';
import {
  DELVAUX_FONT_BODY,
  DELVAUX_FONT_CSS,
  DELVAUX_FONT_HEADING,
} from './delvauxTheme';
import { resolveGambitOverviewPanels } from './_registry/defs/gambitProductOverview';
import { useContainerMobile } from './useContainerMobile';
import { useIsCanvasEdit } from './useIsCanvasEdit';
import type {
  BlockBackground,
  ElementPositionsMap,
  ElementStylesMap,
  GambitProductOverviewContent,
  GambitProductOverviewPanel,
} from '../types';
import {
  blockBackgroundStyle,
  composeStyle,
  elementStyleOf,
  orderStyle,
  positionStyle,
  selectableClass,
} from './applyStyle';

gsap.registerPlugin(ScrollTrigger, SplitText);

interface Props {
  content: GambitProductOverviewContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
}

/** Nền gốc của trang app (`bg-[#F5F5F5]`). */
const OVERVIEW_BG = '#f5f5f5';
/** Mỗi bước timeline dài 1 đơn vị (giữ nguyên bản app). */
const SEGMENT_DURATION = 1;
/** Line-reveal nằm gọn trong đoạn s07→s08. */
const LINE_REVEAL_DURATION = 0.65;
const LINE_REVEAL_STAGGER = 0.35;
/** Độ trễ (px) của ảnh so với track — chữ chạy full speed, ảnh chạy chậm hơn. */
const PARALLAX_Y_DESKTOP = 180;
const PARALLAX_Y_MOBILE = 100;
/** Dự phòng khi không đo được khoảng nhấc ảnh mobile ở s07→s08. */
const MOBILE_IMAGE_SETTLE_Y = -140;
/** Exit panel cuối: tách nhẹ + mờ dần (kết thúc như bản gốc, không trắng trang). */
const EXIT_X_PERCENT = 18;
const EXIT_OPACITY = 0.25;

/** Offset từ vị trí nghỉ (cột trái) → giữa sân khấu, cho panel đầu (desktop). */
const getImageCenterOffset = (imageEl: HTMLElement, isMobile: boolean) => {
  if (isMobile) return 0;

  const stage = imageEl.closest('[data-overview-stage]');
  if (!(stage instanceof HTMLElement)) return 0;

  const prevX = gsap.getProperty(imageEl, 'x');
  gsap.set(imageEl, { x: 0 });

  const stageRect = stage.getBoundingClientRect();
  const imageRect = imageEl.getBoundingClientRect();

  gsap.set(imageEl, { x: prevX });

  const targetCenterX = stageRect.left + stageRect.width / 2;
  const currentCenterX = imageRect.left + imageRect.width / 2;

  return targetCenterX - currentCenterX;
};

/**
 * Mobile s08: nhấc ảnh sao cho đáy ảnh cách khối chữ (absolute) một khoảng gap.
 * Đo tại y:0 (vị trí nghỉ, căn giữa) → trả về y âm (px).
 */
const getMobileImageSettleY = (
  imageEl: HTMLElement,
  detailsEl: HTMLElement,
  gap = 24
) => {
  const prevY = Number(gsap.getProperty(imageEl, 'y')) || 0;
  gsap.set(imageEl, { y: 0 });

  const imageBottom = imageEl.getBoundingClientRect().bottom;
  const detailsTop = detailsEl.getBoundingClientRect().top;

  gsap.set(imageEl, { y: prevY });

  const overlap = imageBottom + gap - detailsTop;
  if (overlap <= 0) return MOBILE_IMAGE_SETTLE_Y;
  return -overlap;
};

export function GambitProductOverview({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
}: Props) {
  const rootRef = React.useRef<HTMLElement>(null);
  const trackRef = React.useRef<HTMLDivElement>(null);
  const imageRef = React.useRef<HTMLDivElement>(null);
  const detailsRef = React.useRef<HTMLDivElement>(null);
  const isMobile = useContainerMobile(rootRef);
  const isCanvas = useIsCanvasEdit(rootRef);
  const { scroller, requestRefresh } = useLandingMotion();

  const panels = resolveGambitOverviewPanels(content);
  const panelCount = panels.length;
  /** Panel đang hiển thị (aria) — suy từ progress, panel đầu chiếm 2 đoạn. */
  const [activeIndex, setActiveIndex] = React.useState(0);

  const styleOf = (key: string) =>
    composeStyle(
      elementStyleOf(styles, key),
      orderStyle(order, key),
      positionStyle(positions, key)
    );

  // Đổi nội dung (số panel / chữ) → chia dòng lại, đo lại offset.
  const contentKey = JSON.stringify(panels);

  React.useEffect(() => {
    if (isCanvas) return;

    const root = rootRef.current;
    const track = trackRef.current;
    const image = imageRef.current;
    const details = detailsRef.current;
    if (!root || !track || !image || !details) return;

    const reduce = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    let cancelled = false;
    let ctx: gsap.Context | null = null;

    const setupMotion = () => {
      if (cancelled) return;

      ctx = gsap.context(() => {
        // Ảnh của các panel sau (panel 0 dùng `image` ref riêng).
        const slideImages = gsap.utils.toArray<HTMLElement>(
          root.querySelectorAll('[data-parallax-image]')
        );
        const exitImage =
          root.querySelector<HTMLElement>('[data-exit-image]') ??
          slideImages[slideImages.length - 1] ??
          image;
        const exitCopy = root.querySelector<HTMLElement>('[data-exit-copy]');
        const parallaxY = isMobile ? PARALLAX_Y_MOBILE : PARALLAX_Y_DESKTOP;
        const mobileSettleY = () =>
          isMobile ? getMobileImageSettleY(image, details) : 0;
        const revealEls = gsap.utils.toArray<HTMLElement>(
          details.querySelectorAll('[data-line-reveal]')
        );
        const split = revealEls.length
          ? SplitText.create(revealEls, { type: 'lines', mask: 'lines' })
          : null;
        const lines = split?.lines ?? [];

        gsap.set(track, { yPercent: 0 });
        // Vị trí nghỉ = bố cục 2 cột; s07 kéo ảnh về giữa sân khấu bằng offset x.
        gsap.set(image, {
          x: () => getImageCenterOffset(image, isMobile),
          y: 0,
        });
        gsap.set(details, { autoAlpha: 1 });
        if (lines.length) gsap.set(lines, { yPercent: 110, opacity: 0 });
        // Ảnh panel sau bắt đầu lệch xuống để "trễ" so với chữ khi vào.
        slideImages.forEach(el => gsap.set(el, { y: parallaxY }));
        gsap.set(exitImage, { xPercent: 0, opacity: 1 });
        if (exitCopy) {
          gsap.set(
            exitCopy,
            isMobile
              ? { y: 0, yPercent: 0, opacity: 1 }
              : { xPercent: 0, opacity: 1 }
          );
        }

        if (reduce) {
          gsap.set(image, { x: 0, y: isMobile ? mobileSettleY() : 0 });
          if (lines.length) gsap.set(lines, { yPercent: 0, opacity: 1 });
          slideImages.forEach(el => gsap.set(el, { y: 0 }));
          return;
        }

        const segments = panelCount + 1;
        const tl = gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: {
            trigger: root,
            scroller,
            start: 'top top',
            end: 'bottom bottom',
            // Scrub thấp để panel bám scroll sát (giữ nguyên bản app).
            scrub: 0.15,
            invalidateOnRefresh: true,
            onUpdate: self => {
              // Đoạn [0,1] + [1,2] = panel 0; sau đó mỗi đoạn 1 panel; đoạn
              // cuối (exit) vẫn tính là panel cuối.
              const t = self.progress * segments;
              const next = Math.min(
                Math.max(Math.floor(t) - 1, 0),
                panelCount - 1
              );
              setActiveIndex(prev => (prev === next ? prev : next));
            },
          },
        });

        // s07 → s08: ảnh về cột trái (desktop) / nhấc lên (mobile); chữ reveal.
        tl.to(image, { x: 0, y: mobileSettleY, duration: SEGMENT_DURATION });

        if (lines.length) {
          tl.to(
            lines,
            {
              yPercent: 0,
              opacity: 1,
              duration: LINE_REVEAL_DURATION,
              stagger: { amount: LINE_REVEAL_STAGGER },
              ease: 'power3.out',
            },
            '<'
          );
        }

        // Mỗi lần trượt track: ảnh ra chạy chậm hơn, ảnh vào bắt kịp.
        for (let i = 1; i < panelCount; i += 1) {
          const outgoing = i === 1 ? image : slideImages[i - 2];
          const incoming = slideImages[i - 1];
          const outgoingRestY =
            i === 1 ? () => mobileSettleY() + parallaxY : parallaxY;

          tl.to(track, {
            yPercent: -((100 * i) / panelCount),
            duration: SEGMENT_DURATION,
          });
          if (outgoing) {
            tl.to(
              outgoing,
              { y: outgoingRestY, duration: SEGMENT_DURATION },
              '<'
            );
          }
          if (incoming) {
            tl.to(incoming, { y: 0, duration: SEGMENT_DURATION }, '<');
          }
        }

        // Exit: desktop tách trái/phải; mobile nghịch đảo s07→s08 (ảnh ↑ / chữ ↓).
        if (exitCopy) {
          if (isMobile) {
            tl.to(exitImage, {
              y: MOBILE_IMAGE_SETTLE_Y,
              opacity: EXIT_OPACITY,
              duration: SEGMENT_DURATION,
            }).to(
              exitCopy,
              {
                // Nghịch đảo line-reveal (dòng khởi điểm yPercent 110).
                yPercent: 110,
                opacity: EXIT_OPACITY,
                duration: SEGMENT_DURATION,
              },
              '<'
            );
          } else {
            tl.to(exitImage, {
              xPercent: -EXIT_X_PERCENT,
              opacity: EXIT_OPACITY,
              duration: SEGMENT_DURATION,
            }).to(
              exitCopy,
              {
                xPercent: EXIT_X_PERCENT,
                opacity: EXIT_OPACITY,
                duration: SEGMENT_DURATION,
              },
              '<'
            );
          }
        }

        // R4: chia dòng + ảnh vừa load xong → đo lại quãng scrub.
        requestRefresh();

        return () => {
          split?.revert();
        };
      }, root);
    };

    // Font tải xong mới chia dòng — nếu không, SplitText cắt sai vị trí.
    void (document.fonts?.ready ?? Promise.resolve()).then(setupMotion);

    return () => {
      cancelled = true;
      ctx?.revert();
    };
  }, [isCanvas, isMobile, scroller, requestRefresh, panelCount, contentKey]);

  // ── Style tokens (tuyền inline — toolbar override được) ──
  const titleBase: React.CSSProperties = {
    margin: 0,
    fontFamily: DELVAUX_FONT_HEADING,
    fontWeight: 400,
    fontSize: 'clamp(18px, 2.4cqi, 25px)',
    lineHeight: 1.35,
    letterSpacing: '0.01em',
    textTransform: 'uppercase',
    color: '#000000',
  };

  const bodyBase: React.CSSProperties = {
    margin: 0,
    marginTop: 'clamp(14px, 1.6cqi, 20px)',
    fontFamily: DELVAUX_FONT_BODY,
    fontSize: 'clamp(13px, 1.1cqi, 15px)',
    lineHeight: 1.7,
    color: '#000000',
  };

  const detailsLabelBase: React.CSSProperties = {
    margin: 0,
    fontFamily: DELVAUX_FONT_BODY,
    fontSize: 'clamp(13px, 1.1cqi, 14px)',
    color: '#000000',
  };

  const detailsRefBase: React.CSSProperties = {
    margin: 0,
    marginTop: 4,
    fontFamily: DELVAUX_FONT_BODY,
    fontSize: 'clamp(13px, 1.1cqi, 14px)',
    letterSpacing: '0.025em',
    color: '#000000',
  };

  const bulletBase: React.CSSProperties = {
    fontFamily: DELVAUX_FONT_BODY,
    fontSize: 'clamp(13px, 1.1cqi, 14px)',
    lineHeight: 1.625,
    color: '#000000',
  };

  const imageBase: React.CSSProperties = {
    display: 'block',
    height: 'auto',
    width: '100%',
  };

  /** Khối chữ 1 panel — dùng chung cho production + canvas. */
  const renderCopy = (
    panel: GambitProductOverviewPanel,
    index: number,
    lineReveal: boolean
  ) => {
    const bullets = Array.isArray(panel.bullets) ? panel.bullets : [];
    const hasDetails =
      Boolean(panel.detailsLabel) ||
      Boolean(panel.detailsRef) ||
      bullets.length > 0;
    const reveal = lineReveal ? '' : undefined;

    return (
      <>
        <h2
          data-element-key={`panels[${index}].title`}
          data-line-reveal={reveal}
          className={selectableClass(activeKey === `panels[${index}].title`)}
          style={composeStyle(titleBase, styleOf(`panels[${index}].title`))}
        >
          {panel.title}
        </h2>

        {panel.body ? (
          <p
            data-element-key={`panels[${index}].body`}
            data-line-reveal={reveal}
            className={selectableClass(activeKey === `panels[${index}].body`)}
            style={composeStyle(bodyBase, styleOf(`panels[${index}].body`))}
          >
            {panel.body}
          </p>
        ) : null}

        {hasDetails ? (
          <div style={{ marginTop: 'clamp(24px, 2.6cqi, 32px)' }}>
            <p
              data-element-key={`panels[${index}].detailsLabel`}
              data-line-reveal={reveal}
              className={selectableClass(
                activeKey === `panels[${index}].detailsLabel`
              )}
              style={composeStyle(
                detailsLabelBase,
                styleOf(`panels[${index}].detailsLabel`)
              )}
            >
              {panel.detailsLabel}
            </p>
            <p
              data-element-key={`panels[${index}].detailsRef`}
              data-line-reveal={reveal}
              className={selectableClass(
                activeKey === `panels[${index}].detailsRef`
              )}
              style={composeStyle(
                detailsRefBase,
                styleOf(`panels[${index}].detailsRef`)
              )}
            >
              {panel.detailsRef}
            </p>
            <ul
              style={{
                listStyle: 'none',
                margin: 0,
                marginTop: 'clamp(12px, 1.4cqi, 16px)',
                padding: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: 6,
              }}
            >
              {bullets.map((item, bi) => (
                <li
                  key={`${index}-${bi}`}
                  data-element-key={`panels[${index}].bullets[${bi}]`}
                  data-line-reveal={reveal}
                  className={selectableClass(
                    activeKey === `panels[${index}].bullets[${bi}]`
                  )}
                  style={composeStyle(
                    bulletBase,
                    styleOf(`panels[${index}].bullets[${bi}]`)
                  )}
                >
                  {`• ${item}`}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </>
    );
  };

  const renderImage = (panel: GambitProductOverviewPanel, index: number) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      data-element-key={`panels[${index}].imageUrl`}
      src={panel.imageUrl}
      alt={panel.title}
      className={selectableClass(activeKey === `panels[${index}].imageUrl`)}
      style={composeStyle(imageBase, styleOf(`panels[${index}].imageUrl`))}
    />
  );

  // ── Editor canvas: lưới phẳng, mọi panel + field hiện cùng lúc ──
  if (isCanvas) {
    return (
      <section
        ref={rootRef}
        data-canvas-edit='true'
        className='gambit-overview @container relative w-full'
        style={composeStyle(
          { background: OVERVIEW_BG },
          blockBackgroundStyle(background)
        )}
      >
        <style>{DELVAUX_FONT_CSS}</style>
        <div
          className='flex flex-col'
          style={{
            gap: 'clamp(32px, 4cqi, 64px)',
            padding: 'clamp(28px, 4cqi, 64px) clamp(20px, 5cqi, 96px)',
          }}
        >
          {panels.map((panel, index) => (
            <div
              key={index}
              className='flex flex-col items-center @2xl:flex-row @2xl:items-center @2xl:justify-center'
              style={{ gap: 'clamp(20px, 4cqi, 80px)' }}
            >
              <div className='flex w-full shrink-0 justify-center @2xl:w-[50%]'>
                <div style={{ width: 'min(60cqi, 320px)' }}>
                  {renderImage(panel, index)}
                </div>
              </div>
              <div
                className='w-full @2xl:w-[42%]'
                style={{ maxWidth: 'min(100%, 26rem)' }}
              >
                {renderCopy(panel, index, false)}
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  // ── Production (PreviewMode + /p): sticky stage + track trượt theo scroll ──
  const [overviewPanel, ...slidePanels] = panels;
  /** Quãng scrub = (số panel + 1) khung hình, cộng 1 khung hình dán. */
  const trackHeight = `${(panelCount + 2) * 100}svh`;

  return (
    <section
      ref={rootRef}
      className='gambit-overview @container relative w-full'
      aria-label='Product overview'
      style={composeStyle(
        { background: OVERVIEW_BG },
        blockBackgroundStyle(background)
      )}
    >
      <style>{DELVAUX_FONT_CSS}</style>
      <div style={{ height: trackHeight }}>
        <div
          className='sticky top-0 overflow-hidden'
          style={{ height: '100svh' }}
        >
          <div
            ref={trackRef}
            aria-live='polite'
            className='relative will-change-transform'
            style={{ height: `${panelCount * 100}%` }}
          >
            {/* Panel 0 — ảnh khởi điểm ở giữa sân khấu, chữ reveal từng dòng */}
            <div
              data-overview-stage
              className='relative overflow-hidden'
              style={{ height: `${100 / panelCount}%` }}
              aria-hidden={activeIndex !== 0}
            >
              <div
                className='flex h-full flex-col items-center justify-center @2xl:flex-row @2xl:justify-center'
                style={{
                  gap: isMobile ? 0 : 'clamp(24px, 4cqi, 80px)',
                  paddingInline: 'clamp(20px, 5cqi, 96px)',
                  paddingBottom: isMobile
                    ? 'clamp(64px, 12cqi, 80px)'
                    : 'clamp(0px, 3cqi, 64px)',
                }}
              >
                <div className='flex w-full shrink-0 justify-center @2xl:w-[50%]'>
                  <div
                    ref={imageRef}
                    className='relative z-10 will-change-transform'
                    style={{
                      width: isMobile
                        ? 'min(68cqi, 260px)'
                        : 'min(42cqi, 100%)',
                    }}
                  >
                    {renderImage(overviewPanel, 0)}
                  </div>
                </div>
                {/* Mobile: khối chữ absolute đáy (ảnh căn giữa khung); desktop: cột phải */}
                <div
                  style={{
                    position: isMobile ? 'absolute' : 'static',
                    insetInline: isMobile ? 'clamp(20px, 5cqi, 96px)' : 'auto',
                    bottom: isMobile ? 'clamp(64px, 12cqi, 80px)' : 'auto',
                    zIndex: 0,
                    marginInline: isMobile ? 'auto' : undefined,
                    width: isMobile ? 'auto' : '42%',
                    maxWidth: isMobile ? '20rem' : 'min(100%, 26rem)',
                  }}
                >
                  <div ref={detailsRef} className='will-change-transform'>
                    {renderCopy(overviewPanel, 0, true)}
                  </div>
                </div>
              </div>
            </div>

            {/* Panel sau — 2 cột, ảnh parallax trễ hơn chữ */}
            {slidePanels.map((panel, i) => {
              const index = i + 1;
              const isLast = index === panelCount - 1;
              return (
                <div
                  key={index}
                  className='relative overflow-hidden'
                  style={{ height: `${100 / panelCount}%` }}
                  aria-hidden={activeIndex !== index}
                >
                  <div
                    className='flex h-full flex-col items-center justify-start @2xl:flex-row @2xl:items-center @2xl:justify-center'
                    style={{
                      gap: 'clamp(16px, 4cqi, 80px)',
                      paddingInline: 'clamp(20px, 5cqi, 96px)',
                      paddingTop: isMobile ? 'clamp(48px, 10cqi, 64px)' : 0,
                      paddingBottom: isMobile
                        ? 'clamp(64px, 12cqi, 80px)'
                        : 'clamp(0px, 3cqi, 64px)',
                    }}
                  >
                    <div className='flex w-full shrink-0 justify-center @2xl:w-[50%]'>
                      <div
                        data-parallax-image
                        data-exit-image={isLast ? '' : undefined}
                        className='will-change-transform'
                        style={{
                          width: isMobile
                            ? 'min(68cqi, 260px)'
                            : 'min(42cqi, 100%)',
                        }}
                      >
                        {renderImage(panel, index)}
                      </div>
                    </div>
                    <div
                      data-exit-copy={isLast ? '' : undefined}
                      className='w-full will-change-transform @2xl:w-[42%]'
                      style={{
                        maxWidth: isMobile ? '20rem' : 'min(100%, 26rem)',
                      }}
                    >
                      {renderCopy(panel, index, false)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
