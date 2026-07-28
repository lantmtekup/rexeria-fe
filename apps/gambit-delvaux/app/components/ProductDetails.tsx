'use client';

import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
} from 'react';
import {
  gsap,
  ScrollTrigger,
  createBlockEntrySnap,
  MQ,
} from '@/app/lib/motion';

const GALLERY_IMAGES = [
  '/p1.png',
  '/p2.png',
  '/p3.png',
  '/p4.png',
  '/p5.png',
  '/p6.png',
  '/p7.png',
] as const;

const COLORS = [
  { id: 'kiwi', label: 'Kiwi', hex: '#C5B45A' },
  { id: 'noir', label: 'Noir', hex: '#1A1A1A' },
  { id: 'ivoire', label: 'Ivoire', hex: '#F2EDE6' },
  { id: 'cognac', label: 'Cognac', hex: '#A67B5B' },
] as const;

const SIZES = ['Nano', 'Mini', 'PM', 'MM'] as const;

const ACCORDIONS = [
  {
    id: 'details',
    title: 'Details',
    body: 'Smooth Box Calf leather with hand-embroidered embossed stars. Natural calfskin lining, gold metal hardware, removable and adjustable leather shoulder strap.',
  },
  {
    id: 'care',
    title: 'Care',
    body: 'Store in the protective pouch provided. Avoid prolonged exposure to direct sunlight and humidity. Clean with a soft, dry cloth.',
  },
  {
    id: 'shipping',
    title: 'Shipping And Returns',
    body: 'Complimentary shipping on all orders. Returns accepted within 14 days of delivery in original condition with packaging.',
  },
] as const;

const ACTIONS = [
  { id: 'contact', label: 'Contact Us', icon: 'plane' },
  { id: 'book', label: 'Book An Appointment', icon: 'chat' },
  { id: 'boutique', label: 'Find A Boutique', icon: 'pin' },
  {
    id: 'availability',
    label: 'Check Availability In Store',
    icon: 'search',
    primary: true,
  },
  { id: 'compare', label: 'Compare Size', icon: 'arrow' },
] as const;

/** Entrance: image strip leads from right; panel lags (later + slower) */
const ENTER_GALLERY_X = 160;
const ENTER_DRAWER_X = 120;
const ENTER_SHEET_Y = 72;
const ENTER_DELAY = 1;
const ENTER_GALLERY_DURATION = 0.9;
const ENTER_PANEL_DURATION = 1.25;
const ENTER_PANEL_DELAY = 0.28;

/** < lg: bottom sheet; ≥ lg: side drawer */
const SHEET_MQ = '(max-width: 1023px)';
const DRAWER_MQ = '(min-width: 1024px)';

const SHEET_DRAG_THRESHOLD = 48;

type ActionIcon = (typeof ACTIONS)[number]['icon'];

const ActionIconSvg = ({ icon }: { icon: ActionIcon }) => {
  const common = {
    className: 'size-4 shrink-0',
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

export default function ProductDetails() {
  const rootRef = useRef<HTMLElement>(null);
  const galleryViewportRef = useRef<HTMLDivElement>(null);
  const galleryTrackRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLElement>(null);

  const [selectedColor, setSelectedColor] =
    useState<(typeof COLORS)[number]['id']>('kiwi');
  const [selectedSize, setSelectedSize] =
    useState<(typeof SIZES)[number]>('Mini');
  const [openAccordion, setOpenAccordion] = useState<string | null>(null);
  const [sheetExpanded, setSheetExpanded] = useState(false);

  const sheetDragRef = useRef<{
    active: boolean;
    startY: number;
    lastY: number;
    moved: boolean;
  } | null>(null);

  const selectedColorLabel =
    COLORS.find(c => c.id === selectedColor)?.label ?? 'Kiwi';

  const handleAccordionToggle = (id: string) => {
    setOpenAccordion(prev => (prev === id ? null : id));
  };

  const handleAccordionKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    id: string
  ) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    handleAccordionToggle(id);
  };

  const handleSheetToggle = () => {
    setSheetExpanded(prev => !prev);
  };

  const handleSheetToggleKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>
  ) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    handleSheetToggle();
  };

  const handleSheetPointerDown = (event: PointerEvent<HTMLButtonElement>) => {
    sheetDragRef.current = {
      active: true,
      startY: event.clientY,
      lastY: event.clientY,
      moved: false,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handleSheetPointerMove = (event: PointerEvent<HTMLButtonElement>) => {
    const drag = sheetDragRef.current;
    const panel = panelRef.current;
    if (!drag?.active || !panel) return;

    drag.lastY = event.clientY;
    const dy = event.clientY - drag.startY;
    if (Math.abs(dy) > 6) drag.moved = true;

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
    if (drag?.moved) {
      sheetDragRef.current = null;
      return;
    }
    sheetDragRef.current = null;
    handleSheetToggle();
  };

  useEffect(() => {
    const root = rootRef.current;
    const galleryViewport = galleryViewportRef.current;
    const galleryTrack = galleryTrackRef.current;
    const panel = panelRef.current;

    if (!root || !galleryViewport || !galleryTrack || !panel) return;

    const mm = gsap.matchMedia();
    let cancelled = false;

    const getGalleryTravel = () =>
      Math.max(0, galleryTrack.scrollWidth - galleryViewport.clientWidth);

    const setupMotion = () => {
      if (cancelled) return;

      mm.add(
        {
          isSheet: SHEET_MQ,
          isDrawer: DRAWER_MQ,
          reduce: MQ.reduce,
        },
        context => {
          const { isSheet, reduce } = context.conditions as {
            isSheet: boolean;
            isDrawer: boolean;
            reduce: boolean;
          };

          const ctx = gsap.context(() => {
            gsap.set(galleryViewport, { x: 0, y: 0, autoAlpha: 1 });
            gsap.set(panel, { x: 0, y: 0, autoAlpha: 1 });
            gsap.set(galleryTrack, { x: 0 });

            if (reduce) return;

            createBlockEntrySnap(root);

            gsap.set(galleryViewport, { x: ENTER_GALLERY_X, autoAlpha: 0 });
            if (isSheet) {
              gsap.set(panel, { y: ENTER_SHEET_Y, autoAlpha: 0 });
            } else {
              gsap.set(panel, { x: ENTER_DRAWER_X, autoAlpha: 0 });
            }

            // Start trước pin (`top top`) để gallery/panel hiện khi section
            // ló vào viewport — tránh blank khi snap miss hoặc đáp thiếu 1px.
            const entrance = gsap.timeline({
              delay: ENTER_DELAY,
              defaults: { ease: 'power3.out' },
              scrollTrigger: {
                trigger: root,
                start: 'top 99%',
                toggleActions: 'restart none none reset',
              },
            });

            entrance
              .to(galleryViewport, {
                x: 0,
                autoAlpha: 1,
                duration: ENTER_GALLERY_DURATION,
              })
              .to(
                panel,
                isSheet
                  ? {
                      y: 0,
                      autoAlpha: 1,
                      duration: ENTER_PANEL_DURATION,
                    }
                  : {
                      x: 0,
                      autoAlpha: 1,
                      duration: ENTER_PANEL_DURATION,
                    },
                ENTER_PANEL_DELAY
              );

            gsap.to(galleryTrack, {
              x: () => -getGalleryTravel(),
              ease: 'none',
              scrollTrigger: {
                trigger: root,
                start: 'top top',
                end: () =>
                  `+=${Math.max(getGalleryTravel() * 1.15, window.innerHeight)}`,
                pin: true,
                scrub: 0.35,
                anticipatePin: 1,
                invalidateOnRefresh: true,
              },
            });
          }, root);

          ScrollTrigger.refresh();

          return () => {
            ctx.revert();
          };
        }
      );
    };

    void document.fonts.ready.then(setupMotion);

    return () => {
      cancelled = true;
      mm.revert();
    };
  }, []);

  return (
    <section
      ref={rootRef}
      className='relative h-svh overflow-hidden bg-[#F5F5F5]'
      aria-label='Buy Brillant Mini'
    >
      <div className='relative h-full lg:flex lg:flex-row'>
        {/* Gallery — full-bleed under sheet on <lg; side column on lg+ */}
        <div
          ref={galleryViewportRef}
          className='absolute inset-0 min-h-0 overflow-hidden pb-[min(48svh,28rem)] will-change-transform lg:relative lg:inset-auto lg:h-full lg:w-[68%] lg:pb-0'
        >
          <div
            ref={galleryTrackRef}
            className='flex h-full w-max will-change-transform'
          >
            {GALLERY_IMAGES.map((src, index) => (
              <div key={src} className='flex h-full items-center'>
                <img
                  src={src}
                  alt={`Brillant Mini view ${index + 1}`}
                  className='h-full w-auto max-w-full object-contain'
                  draggable={false}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Bottom sheet (<lg) / side drawer (lg+) */}
        <aside
          ref={panelRef}
          className={`absolute inset-x-0 bottom-0 z-10 flex w-full flex-col overflow-hidden rounded-t-2xl border-t border-black/8 bg-white pb-16 shadow-[0_-8px_32px_rgba(0,0,0,0.06)] transition-[height] duration-300 ease-out will-change-transform lg:relative lg:inset-auto lg:bottom-auto lg:h-full lg:w-[32%] lg:overflow-y-auto lg:rounded-none lg:border-t-0 lg:border-l lg:pb-20 lg:shadow-none lg:transition-none ${
            sheetExpanded
              ? 'max-lg:h-[min(88svh,52rem)]'
              : 'max-lg:h-[min(48svh,28rem)]'
          }`}
          aria-label='Product information'
          data-sheet-expanded={sheetExpanded ? 'true' : 'false'}
        >
          {/* Sheet handle — mobile / tablet only */}
          <div className='shrink-0 lg:hidden'>
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
              className='flex w-full cursor-grab touch-none flex-col items-center pt-2.5 pb-1 active:cursor-grabbing'
            >
              <span aria-hidden className='h-1 w-10 rounded-full bg-black/20' />
            </button>
          </div>

          <div className='flex min-h-0 flex-1 flex-col overflow-y-auto px-5 pt-2 sm:px-6 md:px-8 md:pt-3 lg:overflow-visible lg:px-8 lg:pt-12'>
            <h1 className='font-(family-name:--font-genath) text-[clamp(1.45rem,5.2vw,2.15rem)] leading-none tracking-[0.02em] text-black uppercase'>
              Brillant Mini
            </h1>
            <p className='mt-2 text-[11px] tracking-[0.14em] text-black/70 uppercase md:text-xs'>
              Box Calf
            </p>

            {/* Color */}
            <div className='mt-5 flex items-center justify-between gap-4 sm:mt-6 md:mt-8'>
              <p className='text-sm text-black'>{selectedColorLabel}</p>
              <div
                className='flex items-center gap-2.5'
                role='radiogroup'
                aria-label='Color'
              >
                {COLORS.map(color => {
                  const isSelected = color.id === selectedColor;
                  return (
                    <button
                      key={color.id}
                      type='button'
                      role='radio'
                      aria-checked={isSelected}
                      aria-label={color.label}
                      tabIndex={0}
                      onClick={() => setSelectedColor(color.id)}
                      onKeyDown={event => {
                        if (event.key !== 'Enter' && event.key !== ' ') return;
                        event.preventDefault();
                        setSelectedColor(color.id);
                      }}
                      className={`size-5 rounded-full border ${
                        isSelected
                          ? 'border-black ring-1 ring-black ring-offset-2'
                          : 'border-black/20'
                      }`}
                      style={{ backgroundColor: color.hex }}
                    />
                  );
                })}
              </div>
            </div>

            {/* Dimensions + sizes */}
            <div className='mt-5 flex items-start justify-between gap-4 border-t border-black/10 pt-4 sm:mt-6 md:mt-7 md:pt-5'>
              <p className='text-[11px] leading-relaxed text-black/80 md:text-xs'>
                W 20 / H 16 / D 11.5 cm
                <span className='block text-black/45'>(in)</span>
              </p>
              <div
                className='flex flex-wrap justify-end gap-x-3 gap-y-1'
                role='radiogroup'
                aria-label='Size'
              >
                {SIZES.map(size => {
                  const isSelected = size === selectedSize;
                  return (
                    <button
                      key={size}
                      type='button'
                      role='radio'
                      aria-checked={isSelected}
                      tabIndex={0}
                      onClick={() => setSelectedSize(size)}
                      onKeyDown={event => {
                        if (event.key !== 'Enter' && event.key !== ' ') return;
                        event.preventDefault();
                        setSelectedSize(size);
                      }}
                      className={`text-sm ${
                        isSelected
                          ? 'text-black underline underline-offset-4'
                          : 'text-black/55'
                      }`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Accordions */}
            <div className='mt-2 border-t border-black/10'>
              {ACCORDIONS.map(item => {
                const isOpen = openAccordion === item.id;
                return (
                  <div key={item.id} className='border-b border-black/10'>
                    <button
                      type='button'
                      aria-expanded={isOpen}
                      aria-controls={`accordion-${item.id}`}
                      tabIndex={0}
                      onClick={() => handleAccordionToggle(item.id)}
                      onKeyDown={event =>
                        handleAccordionKeyDown(event, item.id)
                      }
                      className='flex w-full items-center justify-between py-3.5 text-left text-sm text-black'
                    >
                      {item.title}
                      <span aria-hidden className='text-base leading-none'>
                        {isOpen ? '−' : '+'}
                      </span>
                    </button>
                    <div
                      id={`accordion-${item.id}`}
                      role='region'
                      hidden={!isOpen}
                      className='pb-3.5 text-[13px] leading-relaxed text-black/75'
                    >
                      {item.body}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Actions */}
            <div className='mt-auto flex flex-col pt-4'>
              {ACTIONS.map(action => (
                <button
                  key={action.id}
                  type='button'
                  tabIndex={0}
                  aria-label={action.label}
                  className={`flex w-full cursor-pointer items-center justify-between border-b border-black/10 px-0 py-3.5 text-left text-sm transition-colors ${
                    'primary' in action && action.primary
                      ? 'bg-black px-4 text-white hover:bg-black/90'
                      : 'text-black hover:bg-black/3'
                  }`}
                >
                  <span>{action.label}</span>
                  <ActionIconSvg icon={action.icon} />
                </button>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
