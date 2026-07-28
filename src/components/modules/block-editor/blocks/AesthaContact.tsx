'use client';

/**
 * Aestha Contact — trang "CONTACT" (cùng site RAMSA/Aestha với `AesthaExplore`
 * / `AesthaStudio`). Port từ `app/dev/aestha-contact/page.tsx`.
 *
 * Wide (container ≥1100px): 2 cột full-viewport, không cuộn. Trái = CONTACT +
 * địa chỉ; phải = ảnh hero + hàng email/phone · social. Footer nav dưới cùng.
 * Cursor-dot bám con trỏ. Narrow (<1100px): xếp dọc — heading/địa chỉ/info →
 * ảnh → footer.
 *
 * Motion contract: entrance qua `useBlockMotion` (GSAP) — KHÔNG framer-motion.
 * `min-[1100px]:` viewport media → `useContainerMobile(rootRef, 1100)` (đo
 * container, đúng trong device frame lẫn `/p`). Tokens tuyền inline + styleOf.
 * Ảnh giữ CDN framerusercontent.com theo asset rule của skill.
 */

import * as React from 'react';
import gsap from 'gsap';

import { cn } from '@/lib/cn';

import type {
  AesthaContactContent,
  AesthaContactSocial,
  BlockBackground,
  ElementPositionsMap,
  ElementStylesMap,
} from '../types';
import {
  blockBackgroundStyle,
  composeStyle,
  elementStyleOf,
  orderStyle,
  positionStyle,
  selectableClass,
} from './applyStyle';
import { useBlockMotion, useLandingMotion } from '../motion/LandingMotion';
import { useContainerMobile } from './useContainerMobile';

interface AesthaContactProps {
  content: AesthaContactContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
  className?: string;
}

/* ── Tokens (recon: significant-sheet-415363.framer.app/contact) ──────────── */

const FONT =
  "'Switzer', 'Switzer Variable', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif";

const INK = '#0F0F0F';
const MUTED = '#4F4F4F';
const FOOTER_CURRENT = '#E0DEDE';

const HEADING_STYLE: React.CSSProperties = {
  fontFamily: FONT,
  fontSize: 'clamp(40px, 4.4cqi, 48px)',
  lineHeight: 1,
  fontWeight: 500,
  letterSpacing: '-0.96px',
  color: INK,
  margin: 0,
};

const ADDRESS_STYLE: React.CSSProperties = {
  fontFamily: FONT,
  fontSize: 'clamp(14px, 1.35cqi, 16px)',
  lineHeight: 1.4,
  fontStyle: 'normal',
  color: MUTED,
  margin: 0,
  whiteSpace: 'pre-line',
};

const CONTACT_LINK_STYLE: React.CSSProperties = {
  fontFamily: FONT,
  fontSize: 'clamp(14px, 1.35cqi, 16px)',
  lineHeight: 1.4,
  color: INK,
  textDecoration: 'none',
};

const FOOTER_LINK_STYLE: React.CSSProperties = {
  fontFamily: FONT,
  fontSize: 'clamp(16px, 1.7cqi, 20px)',
  lineHeight: 1.25,
  fontWeight: 400,
  color: INK,
  textDecoration: 'none',
};

/**
 * Cursor-dot bám con trỏ có độ trễ mượt. Đặt `absolute` TRONG section wide
 * (`position: relative`) — KHÔNG `fixed`: block root là `@container` nên `fixed`
 * neo theo root, còn `absolute` + toạ độ đo theo rect section thì luôn khớp.
 */
function CursorDot({
  containerRef,
  disabled,
}: {
  containerRef: React.RefObject<HTMLElement | null>;
  disabled: boolean;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const raf = React.useRef<number>(0);
  const pos = React.useRef({ x: 0, y: 0 });
  const target = React.useRef({ x: 0, y: 0 });

  React.useEffect(() => {
    if (disabled) return;
    const cont = containerRef.current;
    if (!cont) return;

    const onMove = (e: MouseEvent) => {
      const r = cont.getBoundingClientRect();
      target.current = { x: e.clientX - r.left, y: e.clientY - r.top };
    };
    const tick = () => {
      pos.current.x += (target.current.x - pos.current.x) * 0.18;
      pos.current.y += (target.current.y - pos.current.y) * 0.18;
      if (ref.current) {
        ref.current.style.transform = `translate3d(${pos.current.x}px, ${pos.current.y}px, 0) translate(-50%, -50%)`;
      }
      raf.current = requestAnimationFrame(tick);
    };

    window.addEventListener('mousemove', onMove);
    raf.current = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(raf.current);
    };
  }, [disabled, containerRef]);

  if (disabled) return null;
  return (
    <div
      ref={ref}
      aria-hidden='true'
      className='pointer-events-none absolute top-0 left-0 z-[13] h-3.5 w-3.5 rounded-full'
      style={{ backgroundColor: 'rgba(224, 222, 222, 0.8)' }}
    />
  );
}

export function AesthaContact({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
  className,
}: AesthaContactProps) {
  const rootRef = React.useRef<HTMLDivElement>(null);
  const wideRef = React.useRef<HTMLElement>(null);
  const { hasRoot } = useLandingMotion();

  const isNarrow = useContainerMobile(rootRef, 1100);

  // Chỉ BlockPreview editor — KHÔNG PreviewMode/Play/`/p`.
  const [isCanvas, setIsCanvas] = React.useState(true);
  React.useLayoutEffect(() => {
    if (!hasRoot) {
      setIsCanvas(false);
      return;
    }
    setIsCanvas(
      !!rootRef.current?.closest('[data-testid="active-block-preview"]')
    );
  }, [hasRoot]);

  const [reduce, setReduce] = React.useState(false);
  React.useLayoutEffect(() => {
    setReduce(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }, []);

  /**
   * Chiều cao bám **vùng cuộn thật** (pattern AesthaStudio), KHÔNG `100dvh`:
   * trong dev harness / PreviewMode scroller là element thấp hơn viewport.
   * Wide = full-viewport (height cố định); narrow = tối thiểu 1 màn rồi tự cao
   * theo nội dung (minHeight).
   */
  const [portH, setPortH] = React.useState<number | null>(null);
  React.useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    let el: HTMLElement | null = root.parentElement;
    while (el) {
      const ov = getComputedStyle(el).overflowY;
      if (ov === 'auto' || ov === 'scroll') break;
      el = el.parentElement;
    }

    const measure = () => setPortH(el ? el.clientHeight : window.innerHeight);
    measure();

    if (el) {
      const ro = new ResizeObserver(measure);
      ro.observe(el);
      return () => ro.disconnect();
    }
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [isCanvas, isNarrow]);

  const styleOf = (key: string) =>
    composeStyle(
      elementStyleOf(styles, key),
      orderStyle(order, key),
      positionStyle(positions, key)
    );

  const socials: AesthaContactSocial[] = Array.isArray(content.socials)
    ? content.socials
    : [];
  const footerLinks = Array.isArray(content.footerLinks)
    ? content.footerLinks
    : [];

  /**
   * Entrance on-load (recon: content wrapper fade-up delay 0.4s bezier
   * 0.44,0,0.56,1; image/right wrapper fade-up delay 0.25s bezier
   * 0.5,0,0.88,0.77). Bezier gốc xấp xỉ bằng power ease (tiền lệ AesthaStudio).
   * Không ScrollTrigger — block 1 viewport (wide) / stack ngắn (narrow).
   */
  useBlockMotion(rootRef, () => {
    const root = rootRef.current;
    if (!root || !hasRoot || isCanvas || reduce) return;

    const contentEl = root.querySelector<HTMLElement>(
      '.aestha-contact-content'
    );
    const mediaEl = root.querySelector<HTMLElement>('.aestha-contact-media');

    if (mediaEl) {
      gsap.fromTo(
        mediaEl,
        { opacity: 0, y: 12 },
        { opacity: 1, y: 0, duration: 0.5, delay: 0.25, ease: 'power2.in' }
      );
    }
    if (contentEl) {
      gsap.fromTo(
        contentEl,
        { opacity: 0, y: 8 },
        { opacity: 1, y: 0, duration: 0.6, delay: 0.4, ease: 'power1.inOut' }
      );
    }
  }, [isCanvas, hasRoot, reduce, isNarrow]);

  /* ── Editable renderers (dùng chung 2 branch) ── */

  const heading = (extraClass: string) => (
    <h1
      data-element-key='heading'
      style={composeStyle(HEADING_STYLE, styleOf('heading'))}
      className={selectableClass(activeKey === 'heading', extraClass)}
    >
      {content.heading}
    </h1>
  );

  const address = (extraClass: string) => (
    <p
      data-element-key='address'
      style={composeStyle(ADDRESS_STYLE, styleOf('address'))}
      className={selectableClass(activeKey === 'address', extraClass)}
    >
      {content.address}
    </p>
  );

  /** Link liên hệ — không gạch chân mặc định, hover/focus mới gạch chân. */
  const contactLink = (
    key: string,
    href: string,
    label: string,
    external?: boolean
  ) => (
    <a
      key={key}
      href={href}
      data-element-key={key}
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      style={composeStyle(CONTACT_LINK_STYLE, styleOf(key))}
      className={selectableClass(
        activeKey === key,
        'outline-none hover:underline focus-visible:underline'
      )}
    >
      {label}
    </a>
  );

  const contactInfo = (alignClass: string) => (
    <div className={cn('flex justify-between', alignClass)}>
      <div className='flex flex-col gap-6'>
        {contactLink('email', `mailto:${content.email}`, content.email)}
        {contactLink(
          'phone',
          `tel:${content.phone.replace(/\s/g, '')}`,
          content.phone
        )}
      </div>
      <div className='flex flex-col items-end gap-1'>
        {socials.map((s, i) =>
          contactLink(`socials[${i}].label`, s.href, s.label, true)
        )}
      </div>
    </div>
  );

  const imageBox = (wrapClass: string, wrapStyle?: React.CSSProperties) => (
    <div
      className={cn('relative overflow-hidden', wrapClass)}
      style={wrapStyle}
    >
      <div
        data-element-key='imageUrl'
        style={composeStyle(
          { position: 'absolute', inset: 0 },
          styleOf('imageUrl')
        )}
        className={selectableClass(activeKey === 'imageUrl')}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={content.imageUrl}
          alt={content.imageAlt}
          draggable={false}
          fetchPriority='high'
          className='h-full w-full object-cover select-none'
        />
      </div>
    </div>
  );

  const footerNav = (extraClass: string) => (
    <nav
      aria-label='Sections'
      className={cn('flex items-center gap-6', extraClass)}
    >
      {footerLinks.map((link, i) => {
        const isCurrent = link.label === content.currentFooterLabel;
        return (
          <a
            key={i}
            href={link.href}
            aria-current={isCurrent ? 'page' : undefined}
            data-element-key={`footerLinks[${i}].label`}
            style={composeStyle(
              FOOTER_LINK_STYLE,
              isCurrent ? { color: FOOTER_CURRENT } : undefined,
              styleOf(`footerLinks[${i}].label`)
            )}
            className={selectableClass(
              activeKey === `footerLinks[${i}].label`,
              isCurrent ? undefined : 'hover:opacity-70'
            )}
          >
            {link.label}
          </a>
        );
      })}
    </nav>
  );

  return (
    <div
      ref={rootRef}
      style={composeStyle(
        blockBackgroundStyle(background),
        isNarrow
          ? { minHeight: portH ? `${portH}px` : '100dvh' }
          : { height: portH ? `${portH}px` : '100dvh' }
      )}
      className={cn(
        '@container relative w-full bg-white text-[#0f0f0f] antialiased',
        className
      )}
    >
      {isNarrow ? (
        /* ── Narrow: xếp dọc (địa chỉ → info → ảnh) ── */
        <section className='flex h-full w-full flex-col gap-6 p-4'>
          <div className='aestha-contact-content flex flex-col gap-6'>
            {heading('')}
            {address('')}
            {contactInfo('items-start')}
          </div>

          {imageBox('aestha-contact-media w-full', {
            aspectRatio: '343 / 331',
          })}

          {footerNav('mt-auto')}
        </section>
      ) : (
        /* ── Wide: 2 cột full-viewport ── */
        <section
          ref={wideRef}
          className='relative h-full w-full overflow-hidden'
        >
          <CursorDot containerRef={wideRef} disabled={reduce || isCanvas} />

          <div className='flex h-full w-full flex-col p-8'>
            {/* pb ↔ Image wrapper padding-bottom bản gốc — đẩy info + footer lên. */}
            <div className='flex min-h-0 flex-1 gap-8 pb-16'>
              {/* Cột trái (448px): CONTACT (trên) + địa chỉ (dưới) */}
              <div className='aestha-contact-content flex w-md shrink-0 flex-col justify-between'>
                {heading('')}
                {address('')}
              </div>

              {/* Cột phải (fill): ảnh (trên) + hàng email/phone · social (dưới) */}
              <div className='aestha-contact-media flex min-w-0 flex-1 flex-col justify-between'>
                {imageBox('h-[52dvh] w-full shrink-0')}
                {contactInfo('items-end')}
              </div>
            </div>

            {footerNav('shrink-0 pt-6')}
          </div>
        </section>
      )}
    </div>
  );
}
