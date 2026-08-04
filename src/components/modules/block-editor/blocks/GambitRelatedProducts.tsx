'use client';

/**
 * Block "Product - Related Grid" (port `RelatedProducts` của
 * apps/gambit-delvaux) — giữ nguyên bố cục + timing gốc:
 *
 *  - Sân khấu cao 1 khung hình, DÁN bằng CSS `sticky` (thay `pin: true` của
 *    bản app — convention của host, an toàn iOS + editor scroller). Quãng dán
 *    thêm 40% khung hình, đúng `end: '+=40%'` của bản gốc.
 *  - Vào khung nhìn: từng túi trồi lên (y 100 → 0, stagger 0.1) sau một nhịp
 *    giữ ngắn, nhãn tên + chất liệu theo sau (chồng lấn -0.35), cuối cùng là
 *    thanh CTA đen ở đáy (-0.3). Cuộn ra khỏi khung → reset về trạng thái đầu
 *    để lần vào sau chạy lại (toggleActions gốc).
 *
 * Khác apps (đúng contract host — apps-port-host):
 *  - `pin: true` + `createBlockEntrySnap` → sticky CSS, bỏ snap (host không
 *    dùng scroll-snap giữa các block);
 *  - `scrollToSection(#buy)` hard-code → field CMS `backHref` kiểu `link`
 *    (4 dạng picker: không link / trang trong template / cuộn tới block / URL
 *    ngoài), chữ tách sang `backLabel`;
 *  - `gsap.matchMedia(MOTION_CONDITIONS)` (điều kiện viewport) → `gsap.context`
 *    + kiểm tra `prefers-reduced-motion`;
 *  - `md:` / `svh` cho ảnh → `@2xl:` / `cqi` + `useContainerMobile` (canvas
 *    responsive spec);
 *  - token thiết kế (font, cỡ chữ, màu) chuyển từ class Tailwind sang inline
 *    base + `styleOf(key)` để toolbar editor override được;
 *  - spacer đệm `ProductSectionNav` cứng của bản app → đo động: thanh nav nay
 *    là BLOCK RIÊNG (`gambit_section_nav`) và có thể không nằm trong trang,
 *    nên block này tìm phần tử dán đáy (`[data-bottom-nav]`) trong cùng portal
 *    host rồi chừa đúng chiều cao đó ở đáy sân khấu — không có nav thì chừa 0.
 *
 * Canvas editor: fork sang lưới phẳng chiều cao auto (không sticky/animation)
 * — PreviewMode + `/p` giữ production.
 *
 * Font/màu dùng chung với cụm Delvaux (`delvauxTheme`).
 */
import * as React from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import { useLandingMotion } from '../motion/LandingMotion';
import { resolveDrawerPortalHost } from '../previewPortal';
import { DELVAUX_FONT_BODY, DELVAUX_FONT_CSS } from './delvauxTheme';
import {
  GAMBIT_RELATED_PRODUCTS_DEFAULTS,
  resolveGambitRelatedProducts,
} from './_registry/defs/gambitRelatedProducts';
import { useContainerMobile } from './useContainerMobile';
import { useIsCanvasEdit } from './useIsCanvasEdit';
import type {
  BlockBackground,
  ElementPositionsMap,
  ElementStylesMap,
  GambitRelatedProductItem,
  GambitRelatedProductsContent,
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
  content: GambitRelatedProductsContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
}

/** Nền gốc của trang app (`bg-[#F5F5F5]`). */
const RELATED_BG = '#f5f5f5';
/** Timing gốc của bản app — giữ nguyên. */
const BAG_Y = 100;
const BAG_DURATION = 0.85;
const BAG_STAGGER = 0.1;
const LABEL_Y = 24;
const LABEL_DURATION = 0.55;
const LABEL_STAGGER = 0.06;
const BAR_DURATION = 0.5;
const BAR_Y = 12;
const INTRO_HOLD = 0.12;
/** `pin` gốc giữ section thêm 40% khung hình → track cao 140svh. */
const STICKY_TRACK_HEIGHT = '140svh';

/**
 * Chiều cao phần tử dán đáy khung nhìn (`gambit_section_nav` portal ra ngoài
 * `@container` với `[data-bottom-nav]`) để sân khấu chừa đúng chỗ cho nó.
 * Trang không có block nav → 0. Nav mount sau (đợi đo portal host) và cao thấp
 * theo cỡ khung → theo dõi cả cây con của host lẫn kích thước phần tử.
 */
function useBottomNavInset(
  rootRef: React.RefObject<HTMLElement | null>,
  enabled: boolean
): number {
  const [inset, setInset] = React.useState(0);

  React.useEffect(() => {
    if (!enabled) {
      setInset(0);
      return;
    }
    const root = rootRef.current;
    if (!root) return;

    const host = resolveDrawerPortalHost(root) ?? document.body;
    let navEl: HTMLElement | null = null;

    const measure = () =>
      setInset(navEl ? navEl.getBoundingClientRect().height : 0);

    const sizeObserver = new ResizeObserver(measure);

    const attach = () => {
      const next = host.querySelector<HTMLElement>('[data-bottom-nav]');
      if (next === navEl) return;
      if (navEl) sizeObserver.unobserve(navEl);
      navEl = next;
      if (navEl) sizeObserver.observe(navEl);
      measure();
    };

    attach();
    // Portal của nav là con trực tiếp của host → chỉ cần theo dõi childList.
    const treeObserver = new MutationObserver(attach);
    treeObserver.observe(host, { childList: true });

    return () => {
      treeObserver.disconnect();
      sizeObserver.disconnect();
    };
  }, [enabled, rootRef]);

  return inset;
}

export function GambitRelatedProducts({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
}: Props) {
  const rootRef = React.useRef<HTMLElement>(null);
  const gridRef = React.useRef<HTMLDivElement>(null);
  const backBarRef = React.useRef<HTMLAnchorElement>(null);
  const isMobile = useContainerMobile(rootRef);
  const isCanvas = useIsCanvasEdit(rootRef);
  const { scroller, requestRefresh } = useLandingMotion();
  // Canvas render lưới phẳng, nav cũng in-flow → không cần chừa chỗ.
  const bottomNavInset = useBottomNavInset(rootRef, !isCanvas);

  const products = resolveGambitRelatedProducts(content);
  const backLabel =
    content?.backLabel?.trim() || GAMBIT_RELATED_PRODUCTS_DEFAULTS.backLabel;
  const backHref = content?.backHref?.trim() || '';

  const styleOf = (key: string) =>
    composeStyle(
      elementStyleOf(styles, key),
      orderStyle(order, key),
      positionStyle(positions, key)
    );

  // Đổi số sản phẩm → số phần tử stagger đổi, phải dựng lại timeline.
  const productCount = products.length;

  React.useEffect(() => {
    if (isCanvas) return;

    const root = rootRef.current;
    const grid = gridRef.current;
    const backBar = backBarRef.current;
    if (!root || !grid || !backBar) return;

    const bagEls = gsap.utils.toArray<HTMLElement>(
      grid.querySelectorAll('[data-related-bag]')
    );
    const labelEls = gsap.utils.toArray<HTMLElement>(
      grid.querySelectorAll('[data-related-label]')
    );
    if (bagEls.length === 0 || labelEls.length === 0) return;

    const reduce = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    let cancelled = false;
    let ctx: gsap.Context | null = null;

    const setupMotion = () => {
      if (cancelled) return;

      ctx = gsap.context(() => {
        const setInitialState = () => {
          gsap.set(bagEls, { y: BAG_Y, autoAlpha: 0 });
          gsap.set(labelEls, { y: LABEL_Y, autoAlpha: 0 });
          gsap.set(backBar, { y: BAR_Y, autoAlpha: 0 });
        };

        const setFinalState = () => {
          gsap.set(bagEls, { y: 0, autoAlpha: 1 });
          gsap.set(labelEls, { y: 0, autoAlpha: 1 });
          gsap.set(backBar, { y: 0, autoAlpha: 1 });
        };

        if (reduce) {
          setFinalState();
          return;
        }

        setInitialState();

        const tl = gsap.timeline({
          defaults: { ease: 'power3.out' },
          scrollTrigger: {
            trigger: root,
            scroller,
            start: 'top 98%',
            // Gốc: vào lại thì chạy lại từ đầu, ra khỏi khung thì reset.
            toggleActions: 'restart none restart reset',
            onLeave: setInitialState,
            onLeaveBack: setInitialState,
          },
        });

        tl.call(setInitialState)
          .to({}, { duration: INTRO_HOLD })
          .to(bagEls, {
            y: 0,
            autoAlpha: 1,
            duration: BAG_DURATION,
            stagger: BAG_STAGGER,
          })
          .to(
            labelEls,
            {
              y: 0,
              autoAlpha: 1,
              duration: LABEL_DURATION,
              stagger: LABEL_STAGGER,
            },
            '-=0.35'
          )
          .to(backBar, { y: 0, autoAlpha: 1, duration: BAR_DURATION }, '-=0.3');

        // R4: ảnh sản phẩm load xong → đo lại mốc trigger.
        requestRefresh();
      }, root);
    };

    // Font tải xong mới đo — nhãn tên/chất liệu đổi chiều cao khi swap font.
    void (document.fonts?.ready ?? Promise.resolve()).then(setupMotion);

    return () => {
      cancelled = true;
      ctx?.revert();
    };
  }, [isCanvas, scroller, requestRefresh, productCount]);

  // ── Style token (tuyền inline — toolbar override được) ────────────────
  const nameBase: React.CSSProperties = {
    fontFamily: DELVAUX_FONT_BODY,
    fontSize: 'clamp(10px, 1.1cqi, 12px)',
    lineHeight: 1.25,
    letterSpacing: '0.02em',
    color: '#000000',
  };

  const materialBase: React.CSSProperties = {
    flexShrink: 0,
    fontFamily: DELVAUX_FONT_BODY,
    fontSize: 'clamp(9px, 1cqi, 11px)',
    lineHeight: 1.25,
    letterSpacing: '0.02em',
    color: 'rgba(0, 0, 0, 0.45)',
  };

  const backBarBase: React.CSSProperties = {
    backgroundColor: '#000000',
    color: '#ffffff',
    paddingInline: 'clamp(16px, 2cqi, 24px)',
    paddingBlock: 'clamp(14px, 1.6cqi, 16px)',
  };

  const backLabelBase: React.CSSProperties = {
    fontFamily: DELVAUX_FONT_BODY,
    fontSize: 'clamp(11px, 1.1cqi, 14px)',
    letterSpacing: '0.04em',
    color: '#ffffff',
  };

  const imageBase: React.CSSProperties = {
    display: 'block',
    height: 'auto',
    width: '100%',
    objectFit: 'contain',
    // Gốc: max-h 28svh mobile / 36svh desktop. `svh` sai trong device frame
    // preview nên quy về bề rộng container + trần px tương đương.
    maxHeight: isMobile ? 'min(60cqi, 240px)' : 'min(26cqi, 340px)',
  };

  /** Một ô sản phẩm — dùng chung cho production + canvas. */
  const renderProduct = (product: GambitRelatedProductItem, index: number) => (
    <article key={index} className='flex flex-col items-center'>
      <div
        data-related-bag
        className='flex w-full items-end justify-center will-change-transform'
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          data-element-key={`products[${index}].imageUrl`}
          src={product.imageUrl}
          alt={product.name}
          className={selectableClass(
            activeKey === `products[${index}].imageUrl`
          )}
          style={composeStyle(
            imageBase,
            styleOf(`products[${index}].imageUrl`)
          )}
          draggable={false}
        />
      </div>
      <div
        data-related-label
        className='flex w-full items-baseline justify-between gap-2 will-change-transform'
        style={{ marginTop: 'clamp(12px, 1.4cqi, 16px)' }}
      >
        <span
          data-element-key={`products[${index}].name`}
          className={selectableClass(activeKey === `products[${index}].name`)}
          style={composeStyle(nameBase, styleOf(`products[${index}].name`))}
        >
          {product.name}
        </span>
        <span
          data-element-key={`products[${index}].material`}
          className={selectableClass(
            activeKey === `products[${index}].material`
          )}
          style={composeStyle(
            materialBase,
            styleOf(`products[${index}].material`)
          )}
        >
          {product.material}
        </span>
      </div>
    </article>
  );

  const grid = (
    <div
      ref={gridRef}
      className='mx-auto grid w-full grid-cols-2 @2xl:grid-cols-4'
      style={{
        maxWidth: '92rem',
        columnGap: 'clamp(12px, 1.8cqi, 32px)',
        rowGap: 'clamp(24px, 3cqi, 32px)',
      }}
    >
      {products.map(renderProduct)}
    </div>
  );

  /**
   * Thanh CTA đen: `<a data-element-key='backHref'>` mở link picker 4 dạng,
   * chữ bên trong là field text riêng. Trên canvas chặn navigate để click chỉ
   * dùng để chọn element.
   */
  const backBar = (
    <a
      ref={backBarRef}
      data-element-key='backHref'
      href={isCanvas ? undefined : backHref || '#'}
      onClick={isCanvas ? event => event.preventDefault() : undefined}
      aria-label={backLabel}
      className={selectableClass(
        activeKey === 'backHref',
        'flex w-full shrink-0 cursor-pointer items-center justify-between text-left will-change-transform'
      )}
      style={composeStyle(backBarBase, styleOf('backHref'))}
    >
      <span
        data-element-key='backLabel'
        className={selectableClass(activeKey === 'backLabel')}
        style={composeStyle(backLabelBase, styleOf('backLabel'))}
      >
        {backLabel}
      </span>
      <span
        aria-hidden
        style={{
          fontSize: 'clamp(14px, 1.2cqi, 16px)',
          lineHeight: 1,
          color: 'inherit',
        }}
      >
        →
      </span>
    </a>
  );

  // ── Editor canvas: lưới phẳng, chiều cao auto, không sticky/animation ──
  if (isCanvas) {
    return (
      <section
        ref={rootRef}
        data-canvas-edit='true'
        aria-label='Related products'
        className='gambit-related @container relative w-full overflow-hidden'
        style={composeStyle(
          { background: RELATED_BG },
          blockBackgroundStyle(background)
        )}
      >
        <style>{DELVAUX_FONT_CSS}</style>
        <div className='flex flex-col'>
          <div
            style={{
              padding:
                'clamp(32px, 4cqi, 64px) clamp(12px, 2cqi, 32px) clamp(24px, 3cqi, 32px)',
            }}
          >
            {grid}
          </div>
          {backBar}
        </div>
      </section>
    );
  }

  // ── Production (PreviewMode + /p): sân khấu dán 1 khung hình ───────────
  return (
    <section
      ref={rootRef}
      aria-label='You Might Also Like'
      className='gambit-related @container relative w-full'
      style={composeStyle(
        { background: RELATED_BG },
        blockBackgroundStyle(background)
      )}
    >
      <style>{DELVAUX_FONT_CSS}</style>
      <div style={{ height: STICKY_TRACK_HEIGHT }}>
        <div
          className='sticky top-0 overflow-hidden'
          style={{ height: '100svh' }}
        >
          <div
            className='flex h-full flex-col'
            style={{
              paddingTop: 'clamp(64px, 7cqi, 96px)',
              // Chừa chỗ cho thanh nav dán đáy (nếu trang có) → thanh CTA đen
              // dừng ngay trên nó thay vì bị che.
              paddingBottom: bottomNavInset || undefined,
            }}
          >
            <div
              className='flex min-h-0 flex-1 flex-col justify-center'
              style={{
                paddingInline: 'clamp(12px, 2cqi, 32px)',
                paddingBottom: 'clamp(24px, 3cqi, 32px)',
              }}
            >
              {grid}
            </div>
            {backBar}
          </div>
        </div>
      </div>
    </section>
  );
}
