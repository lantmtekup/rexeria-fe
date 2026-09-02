'use client';

import Image from 'next/image';
import { useLayoutEffect, useRef, useState } from 'react';
import {
  gsap,
  ScrollTrigger,
  MQ,
  MOTION_CONDITIONS,
  type MotionConditions,
} from '../lib/motion';

/** Cam của pill/card hotspot — ước lượng từ ảnh design. */
const HOTSPOT_ACCENT = '#E1913A';

/** Lề tối thiểu giữa card hotspot và mép khung bản vẽ khi phải kẹp lại (px). */
const CARD_EDGE = 8;

type Spec = { label: string; value: string };

type Hotspot = {
  id: string;
  name: string;
  /** Vị trí theo % của khung bản vẽ — độc lập với kích thước màn hình. */
  x: number;
  y: number;
  specs: Spec[];
};

type Plan = {
  src: string;
  alt: string;
  /**
   * Tỉ lệ tự nhiên của file. Khung dựng theo *chiều cao* rồi suy ra bề ngang từ
   * tỉ lệ này — ba bản vẽ trải từ 1.34 tới 2.66, mà tính theo bề ngang thì bản
   * càng vuông càng đội chiều cao panel lên (14B từng cao gần gấp đôi).
   */
  ratio: string;
};

/**
 * '1944 / 730' → 2.663. Bề ngang khung bản vẽ là chiều cao nhân số này, nên hộp
 * luôn trùng khít ảnh: hotspot đặt bằng % của hộp mới rơi đúng vào phòng.
 */
const planRatio = (plan: Plan) => {
  const [w, h] = plan.ratio.split('/').map(Number);
  return w / h;
};

/**
 * Mọi giá trị specs dưới đây đọc thẳng từ chữ in trên chính bản vẽ: kích thước
 * phòng, tên tầng, và thiết bị được vẽ trong phòng (FP, PANTRY, W/DW/D, GRILL).
 * Bản vẽ không đánh dấu hướng la bàn nên không có field hướng nhìn.
 */
const PENTHOUSE_B_HOTSPOTS: readonly Hotspot[] = [
  {
    id: 'primary-bedroom',
    name: 'Primary Bedroom',
    x: 9,
    y: 30,
    specs: [
      { label: 'Dimension', value: '16’1" x 14’9"' },
      { label: 'Bed', value: 'King bed' },
      { label: 'Level', value: 'Main level' },
      { label: 'Closet', value: 'Two walk-ins' },
    ],
  },
  {
    id: 'bedroom-2',
    name: 'Bedroom',
    x: 18.3,
    y: 28,
    specs: [
      { label: 'Dimension', value: '12’4" x 10’0"' },
      { label: 'Bed', value: 'Queen bed' },
      { label: 'Level', value: 'Main level' },
      { label: 'Closet', value: 'Walk-in' },
    ],
  },
  {
    id: 'bedroom-3',
    name: 'Bedroom',
    x: 25.7,
    y: 28,
    specs: [
      { label: 'Dimension', value: '11’9" x 9’10"' },
      { label: 'Bed', value: 'Queen bed' },
      { label: 'Level', value: 'Main level' },
      { label: 'Bath', value: 'En suite' },
    ],
  },
  {
    id: 'bedroom-4',
    name: 'Bedroom',
    x: 33.5,
    y: 28,
    specs: [
      { label: 'Dimension', value: '12’8" x 10’5"' },
      { label: 'Bed', value: 'Queen bed' },
      { label: 'Level', value: 'Main level' },
      { label: 'Bath', value: 'En suite' },
    ],
  },
  {
    id: 'living-dining',
    name: 'Living / Dining Room',
    x: 49.5,
    y: 30,
    specs: [
      { label: 'Dimension', value: '16’9" x 34’9"' },
      { label: 'Feature', value: 'Fireplace' },
      { label: 'Level', value: 'Main level' },
      { label: 'Ceiling', value: '11 feet' },
    ],
  },
  {
    id: 'laundry',
    name: 'Laundry',
    x: 34.8,
    y: 40.5,
    specs: [
      { label: 'Feature', value: 'W / DW / D' },
      { label: 'Level', value: 'Main level' },
    ],
  },
  {
    id: 'foyer',
    name: 'Foyer',
    x: 47.5,
    y: 47,
    specs: [
      { label: 'Access', value: 'Private landing' },
      { label: 'Level', value: 'Main level' },
    ],
  },
  {
    id: 'kitchen',
    name: 'Kitchen',
    x: 58.8,
    y: 60,
    specs: [
      { label: 'Dimension', value: '19’10" x 9’5"' },
      { label: 'Feature', value: 'Pantry' },
      { label: 'Level', value: 'Main level' },
      { label: 'Layout', value: 'Island' },
    ],
  },
  {
    id: 'primary-bath',
    name: 'Primary Bath',
    x: 6,
    y: 58,
    specs: [
      { label: 'Feature', value: 'Soaking tub' },
      { label: 'Vanity', value: 'Double' },
      { label: 'Level', value: 'Main level' },
      { label: 'Shower', value: 'Separate' },
    ],
  },
  {
    id: 'wic-north',
    name: 'Walk-in Closet',
    x: 16.5,
    y: 50.5,
    specs: [
      { label: 'Serves', value: 'Bedroom 2' },
      { label: 'Level', value: 'Main level' },
    ],
  },
  {
    id: 'wic-primary',
    name: 'Walk-in Closet',
    x: 15,
    y: 75.5,
    specs: [
      { label: 'Serves', value: 'Primary suite' },
      { label: 'Level', value: 'Main level' },
    ],
  },
  {
    id: 'terrace',
    name: 'Private Terrace',
    x: 81,
    y: 32,
    specs: [
      { label: 'Dimension', value: '24’9" x 43’2"' },
      { label: 'Level', value: 'Rooftop' },
      { label: 'Access', value: 'Interior stair' },
      { label: 'Exposure', value: 'Open sky' },
    ],
  },
  {
    id: 'outdoor-kitchen',
    name: 'Outdoor Kitchen',
    x: 74,
    y: 49,
    specs: [
      { label: 'Feature', value: 'Built-in grill' },
      { label: 'Level', value: 'Rooftop' },
    ],
  },
] as const;

const A15_HOTSPOTS: readonly Hotspot[] = [
  {
    id: 'primary-bedroom',
    name: 'Primary Bedroom',
    x: 14.6,
    y: 42,
    specs: [
      { label: 'Dimension', value: '15’0" x 16’1"' },
      { label: 'Bed', value: 'King bed' },
      { label: 'Bath', value: 'En suite' },
      { label: 'Closet', value: 'Walk-in' },
    ],
  },
  {
    id: 'bedroom-2',
    name: 'Bedroom',
    x: 27.5,
    y: 41,
    specs: [
      { label: 'Dimension', value: '11’7" x 11’1"' },
      { label: 'Bed', value: 'Queen bed' },
      { label: 'Closet', value: 'Reach-in' },
    ],
  },
  {
    id: 'bedroom-3',
    name: 'Bedroom',
    x: 37.6,
    y: 40,
    specs: [
      { label: 'Dimension', value: '11’1" x 10’11"' },
      { label: 'Bed', value: 'Queen bed' },
      { label: 'Bath', value: 'Shared' },
    ],
  },
  {
    id: 'bedroom-4',
    name: 'Bedroom',
    x: 49,
    y: 40,
    specs: [
      { label: 'Dimension', value: '10’6" x 10’11"' },
      { label: 'Bed', value: 'Queen bed' },
      { label: 'Bath', value: 'Shared' },
    ],
  },
  {
    id: 'bedroom-5',
    name: 'Bedroom',
    x: 59,
    y: 40,
    specs: [
      { label: 'Dimension', value: '11’3" x 11’2"' },
      { label: 'Bed', value: 'Queen bed' },
      { label: 'Bath', value: 'En suite' },
    ],
  },
  {
    id: 'living-room',
    name: 'Living Room',
    x: 84.4,
    y: 47,
    specs: [
      { label: 'Dimension', value: '19’11" x 25’0"' },
      { label: 'Exposure', value: 'Corner' },
      { label: 'Access', value: 'Terrace' },
    ],
  },
  {
    id: 'dining-room',
    name: 'Dining Room',
    x: 74,
    y: 22,
    specs: [
      { label: 'Dimension', value: '12’7" x 20’2"' },
      { label: 'Access', value: 'Terrace' },
    ],
  },
  {
    id: 'terrace-north',
    name: 'Terrace',
    x: 41,
    y: 21.5,
    specs: [
      { label: 'Dimension', value: '10’6" x 47’11"' },
      { label: 'Runs along', value: 'Bedrooms' },
    ],
  },
  {
    id: 'terrace-corner',
    name: 'Terrace',
    x: 90,
    y: 21.5,
    specs: [{ label: 'Dimension', value: '11’10" x 11’9"' }],
  },
  {
    id: 'terrace-kitchen',
    name: 'Terrace',
    x: 88.5,
    y: 79,
    specs: [
      { label: 'Dimension', value: '25’6" x 13’0"' },
      { label: 'Feature', value: 'Built-in grill' },
    ],
  },
  {
    id: 'kitchen',
    name: 'Kitchen',
    x: 76.7,
    y: 78,
    specs: [
      { label: 'Dimension', value: '23’8" x 9’4"' },
      { label: 'Feature', value: 'Pantry' },
      { label: 'Appliances', value: 'Frz · Ref · Oven' },
    ],
  },
  {
    id: 'foyer',
    name: 'Foyer',
    x: 65.4,
    y: 55,
    specs: [{ label: 'Access', value: 'Private landing' }],
  },
  {
    id: 'primary-bath',
    name: 'Primary Bath',
    x: 12,
    y: 55,
    specs: [
      { label: 'Feature', value: 'Soaking tub' },
      { label: 'Vanity', value: 'Double' },
    ],
  },
  {
    id: 'wic',
    name: 'Walk-in Closet',
    x: 25,
    y: 64.5,
    specs: [{ label: 'Serves', value: 'Primary suite' }],
  },
  {
    id: 'laundry',
    name: 'Laundry',
    x: 44,
    y: 67,
    specs: [{ label: 'Feature', value: 'Two W / D' }],
  },
] as const;

const B14_HOTSPOTS: readonly Hotspot[] = [
  {
    id: 'bedroom-a',
    name: 'Bedroom',
    x: 14.5,
    y: 27,
    specs: [
      { label: 'Dimension', value: '10’10" x 10’7"' },
      { label: 'Bed', value: 'Queen bed' },
      { label: 'Bath', value: 'Shared' },
      { label: 'Closet', value: 'Reach-in' },
    ],
  },
  {
    id: 'bedroom-b',
    name: 'Bedroom',
    x: 34,
    y: 26.5,
    specs: [
      { label: 'Dimension', value: '10’1" x 11’6"' },
      { label: 'Bed', value: 'Queen bed' },
      { label: 'Bath', value: 'Shared' },
      { label: 'Closet', value: 'Reach-in' },
    ],
  },
  {
    id: 'primary-bedroom',
    name: 'Primary Bedroom',
    x: 54,
    y: 28,
    specs: [
      { label: 'Dimension', value: '16’0" x 14’0"' },
      { label: 'Bed', value: 'King bed' },
      { label: 'Bath', value: 'En suite' },
      { label: 'Closet', value: 'Walk-in' },
    ],
  },
  {
    id: 'living-dining',
    name: 'Living / Dining Room',
    x: 78,
    y: 40,
    specs: [
      { label: 'Dimension', value: '14’8" x 26’11"' },
      { label: 'Exposure', value: 'North' },
      { label: 'Windows', value: 'Full height' },
    ],
  },
  {
    id: 'primary-bath',
    name: 'Primary Bath',
    x: 57,
    y: 50,
    specs: [
      { label: 'Vanity', value: 'Double' },
      { label: 'Feature', value: 'Soaking tub' },
      { label: 'Shower', value: 'Separate' },
    ],
  },
  {
    id: 'wic',
    name: 'Walk-in Closet',
    x: 36,
    y: 55,
    specs: [{ label: 'Serves', value: 'Primary suite' }],
  },
  {
    id: 'laundry',
    name: 'Laundry',
    x: 32,
    y: 74.5,
    specs: [{ label: 'Feature', value: 'W / D' }],
  },
  {
    id: 'kitchen',
    name: 'Kitchen',
    x: 73.5,
    y: 78,
    specs: [
      { label: 'Dimension', value: '14’8" x 9’6"' },
      { label: 'Feature', value: 'Pot filler' },
      { label: 'Appliances', value: 'DW · Ref · Oven' },
    ],
  },
  {
    id: 'foyer',
    name: 'Foyer',
    x: 41.5,
    y: 86,
    specs: [{ label: 'Access', value: 'Private landing' }],
  },
] as const;

type ResidenceDetail = {
  bedBath: string;
  intExt: string;
  price: string;
  monthlyCc: string;
  reTax: string;
  status: string;
  exposure: string;
};

type Residence = {
  id: string;
  title: string;
  plan: Plan;
  hotspots: readonly Hotspot[];
  details: ResidenceDetail;
  listingUrl: string;
  floorPlanUrl: string;
};

const RESIDENCES: readonly Residence[] = [
  {
    id: 'penthouse-b',
    title: 'Penthouse B',
    plan: {
      src: '/s4-new.png',
      alt: 'Penthouse B floor plan — main level and rooftop',
      ratio: '1944 / 730',
    },
    hotspots: PENTHOUSE_B_HOTSPOTS,
    details: {
      bedBath: '4 / 3.5',
      intExt: '3,059 / 1,079',
      price: '$11,500,000',
      monthlyCc: '$4,411',
      reTax: '$7,889',
      status: 'AVAILABLE',
      exposure: 'N,S,E',
    },
    listingUrl: '#',
    floorPlanUrl: '#',
  },
  {
    id: '15a',
    title: '15A',
    plan: {
      src: '/s4-15a.png',
      alt: '15A floor plan',
      ratio: '1562 / 990',
    },
    hotspots: A15_HOTSPOTS,
    details: {
      bedBath: '5 / 4.5',
      intExt: '3,444 / 992',
      price: '$11,995,000',
      monthlyCc: '$4,728',
      reTax: '$8,457',
      status: 'AVAILABLE',
      exposure: 'N,S,E',
    },
    listingUrl: '#',
    floorPlanUrl: '#',
  },
  {
    id: '14b',
    title: '14B',
    plan: {
      src: '/s4-14b.webp',
      alt: '14B floor plan',
      ratio: '1011 / 754',
    },
    hotspots: B14_HOTSPOTS,
    details: {
      bedBath: '3 / 2.5',
      intExt: '2,122',
      price: '$3,995,000',
      monthlyCc: '$2,262',
      reTax: '$4,369',
      status: 'AVAILABLE',
      exposure: 'N',
    },
    listingUrl: '#',
    floorPlanUrl: '#',
  },
] as const;

const PdfIcon = () => (
  <svg
    width='28'
    height='32'
    viewBox='0 0 28 32'
    fill='none'
    xmlns='http://www.w3.org/2000/svg'
    aria-hidden
  >
    <path
      d='M4 0h14l6 6v22a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2z'
      stroke='currentColor'
      strokeWidth='1.25'
    />
    <path d='M18 0v6h6' stroke='currentColor' strokeWidth='1.25' />
    <text
      x='14'
      y='22'
      textAnchor='middle'
      fill='currentColor'
      fontSize='7'
      fontWeight='600'
      letterSpacing='0.04em'
    >
      PDF
    </text>
  </svg>
);

/**
 * Card bung ra từ chính điểm hotspot, nên hướng bung phải tránh mép panel:
 * điểm nằm nửa phải mở sang trái, nằm nửa dưới mở lên trên.
 */
const cardAlign = (x: number, y: number) => {
  const horizontal = x > 55 ? 'right-0 ' : 'left-0 ';
  const vertical = y > 55 ? 'bottom-0 ' : 'top-0 ';
  const origin =
    y > 55
      ? x > 55
        ? 'origin-bottom-right'
        : 'origin-bottom-left'
      : x > 55
        ? 'origin-top-right'
        : 'origin-top-left';
  return horizontal + vertical + origin;
};

export default function FinalResidences() {
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const didMountRef = useRef(false);
  const [activeId, setActiveId] = useState(RESIDENCES[0].id);

  const active =
    RESIDENCES.find(residence => residence.id === activeId) ?? RESIDENCES[0];

  // Effect A — khung section. Không phụ thuộc tab nên chỉ chạy một lần.
  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    // Section ghim bằng sticky nên rect của nó không đo được: mọi mốc bám
    // anchor (cao 0, sát mép trên, luôn trong luồng). `next` là cụm SceneReveal
    // trườn lên che — cũng là một wrapper trong luồng.
    const wrap = section.parentElement ?? section;
    const anchor =
      wrap.querySelector<HTMLElement>(':scope > [data-anchor]') ?? section;
    const next = document.querySelector<HTMLElement>('#reveal') ?? section;

    // Điểm ghim: section cao hơn viewport nên phải dính bằng `top` ÂM đúng bằng
    // phần dôi ra — nó cuộn bình thường tới lúc lộ hết cả đáy rồi mới đứng lại,
    // giữ nguyên màn cuối cho SceneReveal trườn lên che. CSS không viết được
    // (percent trong `top` tính theo chiều cao khối chứa, không phải của chính
    // nó), nên đo bằng JS. Chiều cao section đổi mỗi lần đổi tab bản vẽ →
    // ResizeObserver; đổi chiều cao màn → resize.
    const stickTop = () => {
      const overflow = Math.max(0, section.offsetHeight - window.innerHeight);
      section.style.top = `${-overflow}px`;
    };
    stickTop();
    const ro = new ResizeObserver(stickTop);
    ro.observe(section);
    window.addEventListener('resize', stickTop);

    const mm = gsap.matchMedia(section);

    mm.add(MOTION_CONDITIONS, ctx => {
      const { reduce } = ctx.conditions as MotionConditions;

      const bg = section.querySelector<HTMLElement>('[data-layer="bg"]');
      const veil = section.querySelector<HTMLElement>('[data-layer="veil"]');
      const content = section.querySelector<HTMLElement>('[data-content]');
      const ui = section.querySelectorAll<HTMLElement>('[data-ui]');
      const panels = section.querySelectorAll<HTMLElement>('[data-panel]');

      if (bg && !reduce) {
        // The sticky SceneParallax shows through this section until the
        // background is solid. Ships opaque in the markup (correct without JS)
        // and fades in only *after* that section's veil has finished, i.e.
        // onto an already-flat cream viewport — cream over cream is invisible,
        // so this never draws a hard edge across the scene.
        gsap.fromTo(
          bg,
          { opacity: 0 },
          {
            opacity: 1,
            ease: 'none',
            scrollTrigger: {
              trigger: anchor,
              start: 'top 64%',
              end: 'top 52%',
              scrub: 0.4,
            },
          }
        );
      }

      // CỔNG — chữ và card chỉ được hiện khi bên dưới đã là một mảng kem phẳng.
      // Hiện sớm hơn là chồng lên bản vẽ phòng của SceneParallax đang ghim, rất
      // rối mắt. Mốc 50% nằm sau veil bên đó (65%) và sau nền (52%).
      // Là scrub nên cuộn ngược lên nó tan ngược y hệt — `once` không lo được.
      // Gác ở cái bọc [data-content] mà không tween nào khác đụng tới, nên
      // stagger của [data-ui]/[data-panel] bên trong không bị giẫm.
      if (content) {
        if (reduce) {
          gsap.set(content, { autoAlpha: 1 });
        } else {
          gsap.fromTo(
            content,
            { autoAlpha: 0 },
            {
              autoAlpha: 1,
              ease: 'none',
              scrollTrigger: {
                trigger: anchor,
                start: 'top 62%',
                end: 'top 50%',
                scrub: 0.4,
              },
            }
          );
        }
      }

      gsap
        .timeline({
          defaults: { ease: 'power3.out', duration: reduce ? 0 : 0.9 },
          scrollTrigger: { trigger: anchor, start: 'top 50%', once: true },
        })
        .fromTo(
          panels,
          { autoAlpha: 0, y: reduce ? 0 : 32 },
          { autoAlpha: 1, y: 0, stagger: reduce ? 0 : 0.15 }
        );

      let covered = false;
      if (veil && !reduce) {
        // Bàn giao sang SceneReveal — veil TRẮNG (đúng màu nền section đó) phủ
        // kín trước, rồi nền bên kia mới hiện: trắng chồng trắng, hai section
        // tan vào một mảng phẳng thay vì lộ mép chữ nhật trượt lên. Kết ở
        // 'top 65%' để bản vẽ bên đó không chồng lên chữ bên này.
        gsap
          .timeline({
            defaults: { ease: 'none' },
            scrollTrigger: {
              trigger: next,
              start: 'top bottom',
              end: 'top 65%',
              scrub: 0.4,
              // Section ghim nằm nguyên dưới SceneReveal, mà veil thì
              // click-through: không cắt pointer-events là tab và hotspot vẫn
              // ăn chuột dù đã bạc trắng không nhìn thấy gì.
              onUpdate: self => {
                const off = self.progress > 0.6;
                if (off !== covered) {
                  covered = off;
                  section.style.pointerEvents = off ? 'none' : '';
                }
              },
            },
          })
          .fromTo(
            veil,
            { opacity: 0 },
            { opacity: 1, duration: 0.85, immediateRender: false },
            0
          )
          // Neo độ dài timeline = 1, kẻo veil bị kéo giãn ra cả quãng scroll.
          .to({}, { duration: 1 }, 0);
      }

      if (reduce) {
        gsap.set(ui, { autoAlpha: 1, y: 0 });
        return;
      }

      const resetUi = () => {
        gsap.killTweensOf(ui);
        gsap.set(ui, { autoAlpha: 0, y: 24 });
      };
      const playUi = () => {
        gsap.killTweensOf(ui);
        gsap.fromTo(
          ui,
          { autoAlpha: 0, y: 24 },
          {
            autoAlpha: 1,
            y: 0,
            stagger: 0.1,
            duration: 0.9,
            ease: 'power3.out',
            overwrite: true,
          }
        );
      };

      resetUi();
      ScrollTrigger.create({
        trigger: anchor,
        start: 'top 50%',
        onEnter: playUi,
        onEnterBack: playUi,
        onLeaveBack: resetUi,
      });
    });

    return () => {
      mm.revert();
      ro.disconnect();
      window.removeEventListener('resize', stickTop);
      section.style.top = '';
    };
  }, []);

  // Effect B — nội dung của tab đang chọn. React thay cả cây DOM khi đổi tab
  // (key={activeId}), nên effect chạy lại và mm.revert() dọn sạch listener cũ.
  useLayoutEffect(() => {
    const content = contentRef.current;
    if (!content) return;

    const mm = gsap.matchMedia(content);

    // `isWide` chứ không phải `isDesktop` (768px) chung của cả trang: khung bản
    // vẽ đổi hành vi ở `lg` — dưới ngưỡng đó nó rộng hơn khung và cuộn ngang,
    // từ ngưỡng đó mới là hai cột + zoom bằng transform. Lấy mốc 768 thì ở khổ
    // tablet JS pan bằng transform trong khi CSS vẫn đang cuộn, card bung ra
    // ngoài khung.
    mm.add({ ...MOTION_CONDITIONS, isWide: '(min-width: 1024px)' }, ctx => {
      const { isWide, finePointer, reduce } =
        ctx.conditions as MotionConditions & {
          isWide: boolean;
        };
      // Không phải 0: các timeline hotspot ở trạng thái paused, mà timeline dài
      // 0 giây thì tại progress 0 đã coi như chạy xong — mọi card sẽ hiện sẵn
      // và chặn click. Một phần nghìn giây vẫn là "không thấy animation".
      const d = reduce ? 0.001 : 1;

      const panels = content.querySelectorAll<HTMLElement>('[data-panel]');
      const info = content.querySelector<HTMLElement>('[data-panel="info"]');
      const planPanel = content.querySelector<HTMLElement>(
        '[data-panel="plan"]'
      );
      const plan = content.querySelector<HTMLElement>('[data-plan]');
      const spots = content.querySelectorAll<HTMLElement>('[data-hotspot]');
      const dots = content.querySelectorAll<HTMLElement>('[data-hotspot-dot]');
      const hint = content.querySelector<HTMLElement>('[data-plan-hint]');

      // Zoom chạy hoàn toàn bằng transform: cả khung panel scale lên (neo mép
      // phải, nở sang trái vào đúng chỗ INFORMATION vừa nhường), còn bản vẽ
      // bên trong chỉ pan/phóng thêm một nấc để ngắm vào phòng. Không đụng
      // width/height/gap/padding của bất cứ thứ gì — đó mới là thứ gây giật,
      // vì mỗi frame reflow lại kéo theo repaint tấm bản vẽ 1944px.
      // Mobile không phóng thêm: bản vẽ ở đó đã rộng gấp đôi khung (bề ngang
      // suy từ --plan-h × tỉ lệ) và đang cuộn ngang, nên "zoom" chỉ là cuộn
      // phòng vào giữa.
      const INNER_ZOOM = isWide ? 1.18 : 1;
      const ZOOM_DURATION = d * 0.85;
      const ZOOM_EASE = 'power2.inOut';
      // Scale là đồng nhất hai chiều, nên hệ số đủ để khung nuốt trọn chỗ của
      // INFORMATION (~1.35) cũng làm nó cao thêm chừng ấy và trùm lên dãy tab.
      // Chặn ở mức khung chỉ ngả rộng ra một nhịp — phần chỗ trống còn lại để
      // cho bản vẽ bên trong pan vào, đỡ hơn là nở khung thật to.
      const PANEL_SCALE_MAX = 1.16;

      /** Khung ngả rộng về phía INFORMATION vừa nhường, nhưng có chừng mực. */
      const panelScale = () => {
        if (!isWide || !planPanel) return 1;
        const own = planPanel.offsetWidth;
        if (own <= 0) return 1;
        return gsap.utils.clamp(1, PANEL_SCALE_MAX, content.offsetWidth / own);
      };

      // Bản vẽ và lớp chấm scale quanh góc trên-trái, để bù trừ bằng
      // xPercent/yPercent tính thẳng từ toạ độ % của hotspot.
      gsap.set(spots, { transformOrigin: '0 0' });
      if (plan) gsap.set(plan, { transformOrigin: '0 0' });
      // Khung nở đều bốn phía quanh tâm của chính nó.
      if (planPanel) gsap.set(planPanel, { transformOrigin: '50% 50%' });

      /**
       * Khung nằm lệch phải vì INFORMATION chiếm cột trái, nên nở quanh tâm của
       * chính nó sẽ ra một khung vẫn lệch phải. Dịch thêm nửa bề rộng cột trái
       * để tâm khung trùng tâm cả hàng — lề trái và lề phải khi đó bằng nhau.
       *
       * Đọc bằng offsetLeft chứ không phải getBoundingClientRect: offsetLeft là
       * số đo layout nên không bị chính transform đang chạy làm sai.
       */
      const panelRecenter = () => {
        if (!isWide || !planPanel) return 0;
        return -(planPanel.offsetLeft - content.offsetLeft) / 2;
      };

      // Lần render đầu để Effect A lo phần vào — chạy cả hai sẽ giành nhau
      // autoAlpha của cùng hai panel đó.
      if (didMountRef.current) {
        const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
        tl.fromTo(
          panels,
          { autoAlpha: 0, y: reduce ? 0 : 12 },
          { autoAlpha: 1, y: 0, duration: d * 0.45, stagger: d * 0.08 }
        );
        if (!reduce) {
          tl.fromTo(
            dots,
            { scale: 0, autoAlpha: 0 },
            {
              scale: 1,
              autoAlpha: 1,
              duration: 0.5,
              ease: 'back.out(1.7)',
              stagger: { each: 0.04 },
            },
            '-=0.2'
          );
        }
      } else {
        didMountRef.current = true;
        if (reduce) {
          gsap.set(dots, { scale: 1, autoAlpha: 1 });
        } else {
          gsap.fromTo(
            dots,
            { scale: 0, autoAlpha: 0 },
            {
              scale: 1,
              autoAlpha: 1,
              duration: 0.5,
              ease: 'back.out(1.7)',
              stagger: { each: 0.04 },
              scrollTrigger: {
                trigger: content,
                start: 'top 70%',
                once: true,
              },
            }
          );
        }
      }

      const timelines = new Map<HTMLElement, gsap.core.Timeline>();
      const hovers = new Map<HTMLElement, gsap.core.Timeline>();
      const cleanups: Array<() => void> = [];
      let open: HTMLElement | null = null;
      let releaseOverflow: gsap.core.Tween | null = null;

      // Chỉ mời kéo khi thật sự còn gì để kéo: bản 14B trên máy rộng đã lọt
      // trọn khung. Đo lại mỗi lần đổi tab (effect này chạy theo activeId) và
      // mỗi lần đổi khổ màn.
      if (hint && planPanel && plan) {
        const syncHint = () => {
          // Đo bản vẽ chứ không đo scrollWidth của khung: card hotspot đang ẩn
          // vẫn chiếm chỗ và tự nó đã đẻ ra vài chục pixel cuộn thừa.
          const style = getComputedStyle(planPanel);
          const inner =
            planPanel.clientWidth -
            (parseFloat(style.paddingLeft) || 0) -
            (parseFloat(style.paddingRight) || 0);
          hint.hidden = plan.offsetWidth <= inner + 4;
        };
        syncHint();
        window.addEventListener('resize', syncHint);
        cleanups.push(() => window.removeEventListener('resize', syncHint));
      }

      spots.forEach(spot => {
        const dot = spot.querySelector<HTMLElement>('[data-hotspot-dot]');
        const card = spot.querySelector<HTMLElement>('[data-hotspot-card]');
        if (!dot || !card) return;

        const rows = card.querySelectorAll<HTMLElement>('[data-spec]');
        gsap.set(card, { autoAlpha: 0, scale: reduce ? 1 : 0.88 });

        // Chấm → pill có tên phòng. Chỉ trên chuột thật: touch không có hover,
        // chạm là mở thẳng card nên pill trung gian vô nghĩa.
        if (finePointer) {
          const label = dot.querySelector<HTMLElement>('[data-hotspot-label]');
          const icon = dot.querySelector<HTMLElement>('[data-hotspot-icon]');
          if (label && icon) {
            const hoverTl = gsap
              .timeline({ paused: true, defaults: { ease: 'power3.out' } })
              .to(
                dot,
                {
                  backgroundColor: HOTSPOT_ACCENT,
                  duration: d * 0.3,
                  ease: 'power2.out',
                },
                0
              )
              .to(
                icon,
                { borderColor: 'rgba(255,255,255,0.85)', duration: d * 0.3 },
                0
              )
              // width:auto để GSAP tự đo bề rộng chữ — mỗi lần chỉ một pill mở
              // nên chi phí layout không đáng kể.
              .to(label, { width: 'auto', duration: d * 0.42 }, 0)
              .fromTo(
                label,
                { autoAlpha: 0 },
                { autoAlpha: 1, duration: d * 0.28 },
                d * 0.08
              );

            hovers.set(spot, hoverTl);

            const onEnter = () => {
              if (open === spot) return;
              hoverTl.timeScale(1).play();
            };
            const onLeave = () => hoverTl.timeScale(1.25).reverse();

            dot.addEventListener('mouseenter', onEnter);
            dot.addEventListener('mouseleave', onLeave);
            dot.addEventListener('focus', onEnter);
            dot.addEventListener('blur', onLeave);
            cleanups.push(() => {
              dot.removeEventListener('mouseenter', onEnter);
              dot.removeEventListener('mouseleave', onLeave);
              dot.removeEventListener('focus', onEnter);
              dot.removeEventListener('blur', onLeave);
              hoverTl.kill();
            });
          }
        }

        // Khung mobile chỉ rộng hơn card chừng một trăm pixel, nên card ghim
        // hẳn một bên điểm là tràn ra ngoài. Kéo lại nửa bề rộng để nó nằm
        // giữa quanh hotspot — mà hotspot thì đã được pan vào giữa khung.
        const cardShift = isWide ? 0 : Number(spot.dataset.x) > 55 ? 50 : -50;

        // Chấm thu về 0 ngay, còn card đợi bản vẽ gần dừng mới bung — bung
        // sớm thì nó trôi theo cảnh đang zoom và trông chới với.
        const tl = gsap
          .timeline({ paused: true, defaults: { ease: 'power3.out' } })
          .to(dot, { scale: 0, autoAlpha: 0, duration: d * 0.28 }, 0)
          .fromTo(
            card,
            { autoAlpha: 0, scale: reduce ? 1 : 0.9, xPercent: cardShift },
            { autoAlpha: 1, scale: 1, xPercent: cardShift, duration: d * 0.5 },
            ZOOM_DURATION * 0.55
          )
          .fromTo(
            rows,
            { autoAlpha: 0, y: reduce ? 0 : 6 },
            { autoAlpha: 1, y: 0, duration: d * 0.38, stagger: d * 0.05 },
            `<${d * 0.12}`
          );

        timelines.set(spot, tl);
      });

      /**
       * Vào/ra chế độ zoom. Mọi thứ ở đây là transform + opacity, nên trình
       * duyệt chỉ compositing chứ không reflow — trước đây co `width` của
       * INFORMATION khiến panel đổi bề ngang mỗi frame và tấm bản vẽ phải vẽ
       * lại liên tục, đó là chỗ giật.
       */
      const setZoomStage = (
        on: boolean,
        activeSpot: HTMLElement | null,
        speed = 1
      ) => {
        const shared = {
          duration: ZOOM_DURATION / speed,
          ease: ZOOM_EASE,
          overwrite: true,
        } as const;
        const scale = on ? panelScale() : 1;

        if (planPanel) {
          // Khung phải nằm trên INFORMATION vì nó nở đè sang chỗ cột đó.
          if (on) gsap.set(planPanel, { zIndex: 20 });
          gsap.to(planPanel, {
            scale,
            x: on ? panelRecenter() : 0,
            force3D: true,
            ...shared,
            onReverseComplete: () => gsap.set(planPanel, { zIndex: 'auto' }),
            onComplete: on
              ? undefined
              : () => gsap.set(planPanel, { zIndex: 'auto' }),
          });
        }

        if (info && isWide) {
          // Cột nằm bên trái nên trượt hẳn ra ngoài — khung nở tới đâu thì
          // nuốt chỗ tới đó.
          gsap.to(info, {
            xPercent: on ? -100 : 0,
            autoAlpha: on ? 0 : 1,
            ...shared,
          });
        }
        // Mobile thì để yên INFORMATION. Nó nằm *phía trên* bản vẽ chứ không
        // phải bên cạnh, nên đẩy nó đi kiểu gì — co chiều cao hay cho khung
        // trượt lên — cũng làm chính cái khung người dùng đang nhìn nhảy khỏi
        // màn hình. Ở khổ này chỉ cần nội dung phóng vào phòng là đủ.

        // Chấm và card nằm trong hai lớp đang scale (khung × bản vẽ), nên phải
        // nghịch đảo đúng tích đó mới giữ nguyên kích thước hiển thị.
        // Lúc zoom chỉ giữ lại hotspot đang mở — để cả rừng chấm nằm trên bản
        // vẽ đã phóng thì rối, và chúng cũng che mất chính phòng đang xem.
        spots.forEach(other => {
          gsap.to(other, {
            scale: on ? 1 / (scale * INNER_ZOOM) : 1,
            autoAlpha: on && other !== activeSpot ? 0 : 1,
            ...shared,
          });
        });
      };

      /**
       * Ngắm bản vẽ vào một điểm, đưa điểm đó về giữa khung.
       *
       * Dùng xPercent/yPercent với origin cố định ở góc thay vì đổi
       * transformOrigin: đổi origin giữa chừng làm phần tử nhảy một nhịp, còn
       * dịch chuyển thì nội suy được — nên bấm sang phòng khác lúc đang zoom sẽ
       * trượt mượt sang phòng đó.
       *
       * `50 - scale * x` đặt điểm vào chính giữa; clamp giữ bản vẽ luôn phủ kín
       * panel, nên phòng sát mép chỉ trôi tới mép chứ không để hở nền trắng.
       */
      const focusPlan = (x: number, y: number, scale: number, speed = 1) => {
        if (!plan) return;
        const duration = ZOOM_DURATION / speed;

        // Mobile: bản vẽ rộng hơn khung và đang cuộn ngang được, nên "ngắm vào
        // phòng" là cuộn nó vào giữa. Pan bằng transform ở đây sẽ sai, vì
        // xPercent tính theo bề ngang bản vẽ chứ không theo phần nhìn thấy.
        if (!isWide) {
          if (planPanel) {
            const pad =
              parseFloat(getComputedStyle(planPanel).paddingLeft) || 0;
            gsap.to(planPanel, {
              scrollTo: {
                x:
                  pad +
                  (x / 100) * plan.offsetWidth -
                  planPanel.clientWidth / 2,
              },
              duration,
              ease: ZOOM_EASE,
              overwrite: true,
            });
          }
          return;
        }

        const clampPan = gsap.utils.clamp(-(scale - 1) * 100, 0);
        gsap.to(plan, {
          scale,
          xPercent: clampPan(50 - scale * x),
          yPercent: clampPan(50 - scale * y),
          duration,
          ease: ZOOM_EASE,
          force3D: true,
          overwrite: true,
        });
      };

      /**
       * Card bung ra từ chấm nên phòng nằm sát rìa bản vẽ là nó thò ra ngoài
       * khung — cuộn đã kịch biên, không kéo thêm được nữa. Tính trước chỗ card
       * sẽ đứng rồi bù bằng `x` px. Dùng đúng công thức cuộn của focusPlan, chỉ
       * thêm clamp để biết trình duyệt thực sự dừng ở đâu.
       */
      const clampCard = (spot: HTMLElement, x: number) => {
        const card = spot.querySelector<HTMLElement>('[data-hotspot-card]');
        if (isWide || !card || !plan || !planPanel) return;

        const pad = parseFloat(getComputedStyle(planPanel).paddingLeft) || 0;
        const view = planPanel.clientWidth;
        const maxScroll = Math.max(0, planPanel.scrollWidth - view);
        const dotX = pad + (x / 100) * plan.offsetWidth;
        const scroll = gsap.utils.clamp(0, maxScroll, dotX - view / 2);
        const center = dotX - scroll;

        const half = card.offsetWidth / 2;
        const min = CARD_EDGE + half;
        const max = view - CARD_EDGE - half;
        // Card rộng hơn cả khung thì không kẹp được, đặt giữa cho đều hai mép.
        const target =
          max < min ? view / 2 : gsap.utils.clamp(min, max, center);
        gsap.set(card, { x: target - center });
      };

      const resetPill = (spot: HTMLElement, dot: HTMLElement | null) => {
        // Chuột có thể vẫn nằm trên chấm vừa hiện lại — mouseenter sẽ không
        // bắn nữa, nên tự trả pill về đúng trạng thái con trỏ đang ở đâu.
        const hoverTl = hovers.get(spot);
        if (!hoverTl) return;
        if (dot?.matches(':hover')) hoverTl.timeScale(1).play();
        else hoverTl.progress(0).pause();
      };

      const collapseCard = (spot: HTMLElement) => {
        const tl = timelines.get(spot);
        const dot = spot.querySelector<HTMLElement>('[data-hotspot-dot]');
        if (!tl) return;
        const card = spot.querySelector<HTMLElement>('[data-hotspot-card]');
        dot?.setAttribute('aria-expanded', 'false');
        tl.eventCallback('onReverseComplete', () => {
          gsap.set(spot, { zIndex: 'auto' });
          // Bù kẹp mép chỉ đúng cho đúng lần mở đó — trả về 0 để lần sau tính lại.
          if (card) gsap.set(card, { x: 0 });
          resetPill(spot, dot);
        });
        // Thoát nhanh hơn vào một chút — đóng mà chậm bằng mở thì thấy ì.
        tl.timeScale(reduce ? 1 : 1.35).reverse();
      };

      const closeSpot = (spot: HTMLElement) => {
        collapseCard(spot);
        if (open !== spot) return;
        open = null;
        const speed = reduce ? 1 : 1.2;
        setZoomStage(false, null, speed);
        focusPlan(0, 0, 1, speed);
        // Chỉ nhả overflow sau khi khung co xong, không thì bản vẽ đang phóng
        // sẽ tràn ra ngoài panel trong suốt đoạn thu về.
        releaseOverflow?.kill();
        releaseOverflow = gsap.delayedCall(ZOOM_DURATION / speed, () => {
          if (planPanel) planPanel.style.overflow = '';
          releaseOverflow = null;
        });
      };

      const openSpot = (spot: HTMLElement) => {
        if (open === spot) return;
        const tl = timelines.get(spot);
        const dot = spot.querySelector<HTMLElement>('[data-hotspot-dot]');
        if (!tl) return;

        // Lúc zoom các chấm khác đã ẩn nên click không tới được nhánh này, chỉ
        // còn đường vào từ bàn phím. Thu card cũ và giữ nguyên chế độ zoom rồi
        // trượt sang phòng mới — đóng hẳn rồi mở lại sẽ nháy một nhịp.
        if (open) collapseCard(open);

        const x = Number(spot.dataset.x);
        const y = Number(spot.dataset.y);

        dot?.setAttribute('aria-expanded', 'true');
        // Pill thu về chấm trước khi chấm biến mất, nếu không card bung ra từ
        // một hình thù dở dang.
        hovers.get(spot)?.progress(0).pause();
        // Nâng lên trên các chấm lân cận, nếu không card bị chúng đè.
        gsap.set(spot, { zIndex: 30 });
        // Bản vẽ phóng to sẽ tràn khỏi panel nếu không khoá lại. Chỉ desktop —
        // mobile không phóng, mà khoá overflow ở đó còn xoá luôn vị trí cuộn
        // ngang vừa đặt, khiến phòng lệch khỏi giữa khung.
        releaseOverflow?.kill();
        releaseOverflow = null;
        if (planPanel && isWide) planPanel.style.overflow = 'hidden';

        setZoomStage(true, spot);
        focusPlan(x, y, INNER_ZOOM);
        clampCard(spot, x);
        tl.timeScale(1).play();
        open = spot;
      };

      const onClick = (e: MouseEvent) => {
        const target = e.target;
        if (!(target instanceof Element)) return;

        const closer = target.closest<HTMLElement>('[data-hotspot-close]');
        if (closer) {
          const spot = closer.closest<HTMLElement>('[data-hotspot]');
          if (spot) closeSpot(spot);
          return;
        }

        const dot = target.closest<HTMLElement>('[data-hotspot-dot]');
        if (!dot) return;
        const spot = dot.closest<HTMLElement>('[data-hotspot]');
        if (spot) (open === spot ? closeSpot : openSpot)(spot);
      };

      const onPointerDown = (e: PointerEvent) => {
        if (!open) return;
        const target = e.target;
        if (target instanceof Node && plan?.contains(target)) return;
        closeSpot(open);
      };

      const onKeyDown = (e: KeyboardEvent) => {
        if (e.key !== 'Escape' || !open) return;
        const dot = open.querySelector<HTMLElement>('[data-hotspot-dot]');
        closeSpot(open);
        dot?.focus();
      };

      content.addEventListener('click', onClick);
      document.addEventListener('pointerdown', onPointerDown);
      document.addEventListener('keydown', onKeyDown);

      return () => {
        content.removeEventListener('click', onClick);
        document.removeEventListener('pointerdown', onPointerDown);
        document.removeEventListener('keydown', onKeyDown);
        cleanups.forEach(fn => fn());
        timelines.forEach(tl => tl.kill());
        releaseOverflow?.kill();
      };
    });

    return () => mm.revert();
  }, [activeId]);

  const selectResidence = (id: string) => {
    if (id === activeId) return;
    const content = contentRef.current;
    if (!content) {
      setActiveId(id);
      return;
    }
    if (window.matchMedia(MQ.reduce).matches) {
      setActiveId(id);
      return;
    }
    gsap.to(content, {
      autoAlpha: 0,
      y: -8,
      duration: 0.2,
      ease: 'power2.in',
      overwrite: true,
      onComplete: () => setActiveId(id),
    });
  };

  const onTabKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    e.preventDefault();
    const step = e.key === 'ArrowRight' ? 1 : -1;
    const index = RESIDENCES.findIndex(r => r.id === activeId);
    const next =
      RESIDENCES[(index + step + RESIDENCES.length) % RESIDENCES.length];
    selectResidence(next.id);
    e.currentTarget
      .querySelector<HTMLButtonElement>(`[data-tab-id="${next.id}"]`)
      ?.focus();
  };

  return (
    <>
      {/* Mốc đo nằm nguyên trong luồng, sát mép trên section — section ghim
          bằng sticky nên rect của nó không dùng để đo được. Giữ luôn
          id='residences': cùng một toạ độ, mà veil bàn giao của SceneParallax
          (bám #residences) cũng thoát được cái bẫy đo nhầm. */}
      <div id='residences' data-anchor aria-hidden className='h-0' />

      <section
        ref={sectionRef}
        // Ghim: `top` do JS đặt (xem stickTop bên trên) chứ không phải class,
        // vì nó phải là số ÂM đúng bằng phần section cao dôi ra ngoài màn.
        // Section này cao hơn một viewport (951px desktop, 1244px mobile) nên
        // `top-0` sẽ khoá mất phần đáy — còn `bottom-0` thì sticky giữ element
        // TRƯỚC khi nó trôi tới chỗ chứ không phải sau, ngược hẳn ý. Chưa có JS
        // thì top:auto = không ghim, trang vẫn cuộn đúng.
        className='sticky z-10 w-full py-16 sm:py-20 lg:py-24'
      >
        {/* Background as its own layer so it can fade in over the sticky scene. */}
        <div
          data-layer='bg'
          aria-hidden
          className='absolute inset-0 -z-10 bg-[#F3F1EA]'
        />

        {/* Cả khối nội dung là một cổng: nó chỉ hiện khi SceneParallax bên dưới
          đã bạc hết, kẻo chữ chồng lên bản vẽ phòng. */}
        <div
          data-content
          className='mx-auto w-full max-w-[1440px] px-5 sm:px-8 lg:px-10'
        >
          <header className='mx-auto max-w-2xl text-center'>
            <p
              data-ui
              className='font-ui text-xs leading-none font-medium tracking-[0.2em] text-[#6E7A6F] uppercase'
            >
              Detailed Specifications
            </p>
            <h2
              data-ui
              className='mt-3 text-3xl font-medium text-[#6E7A6F] sm:text-4xl lg:mt-5 lg:text-5xl'
            >
              The Final Residences.
            </h2>
            <p
              data-ui
              className='font-ui mt-6 text-[15px] text-[#6E7A6F] lg:mt-8 lg:text-base'
            >
              49 of 52 homes at The Westly have found owners. These are the last
              three.
            </p>

            <div
              data-ui
              role='tablist'
              aria-label='Available residences'
              onKeyDown={onTabKeyDown}
              className='mt-8 flex flex-wrap items-center justify-center gap-3 lg:mt-12'
            >
              {RESIDENCES.map(residence => {
                const selected = residence.id === activeId;
                return (
                  <button
                    key={residence.id}
                    type='button'
                    role='tab'
                    data-tab-id={residence.id}
                    aria-selected={selected}
                    aria-controls='residence-panel'
                    tabIndex={selected ? 0 : -1}
                    onClick={() => selectResidence(residence.id)}
                    className={`cursor-pointer rounded-full border px-6 py-2.5 text-[15px] transition-colors duration-300 lg:text-base ${
                      selected
                        ? 'border-transparent bg-[#6E7A6F] text-white'
                        : 'border-[#6E7A6F]/25 bg-white text-[#6E7A6F] hover:border-[#6E7A6F]/50'
                    }`}
                  >
                    {residence.title}
                  </button>
                );
              })}
            </div>
          </header>

          <div
            key={activeId}
            ref={contentRef}
            id='residence-panel'
            role='tabpanel'
            aria-label={active.title}
            className='mt-10 flex flex-col lg:mt-14 lg:flex-row lg:items-stretch'
          >
            {/* Khoảng cách hai cột nằm trong padding của aside chứ không phải
              `gap` của flex: khi zoom, aside co về 0 thì khe đó biến mất theo,
              khỏi phải animate `gap` — một thuộc tính layout nữa mỗi frame.
              Nền/viền nằm ở lớp trong, có bề rộng cố định, nên lúc aside co lại
              chữ chỉ bị xén chứ không dồn dòng lại từng frame.
              `flex-1` trên hộp trong: hàng `items-stretch` đã kéo hai cột cao
              bằng nhau, hộp viền phải ăn theo — không thì khung ảnh chỉ cao
              bằng tấm bản vẽ và chừa dải trống dưới. */}
            <aside
              data-panel='info'
              className='overflow-hidden pb-5 lg:flex lg:w-[364px] lg:shrink-0 lg:flex-col lg:pr-6 lg:pb-0'
            >
              <div
                data-info-inner
                className='border border-[#6E7A6F]/15 bg-white px-6 py-8 sm:px-7 lg:w-[340px] lg:flex-1'
              >
                <p className='font-ui text-center text-xs leading-none font-medium tracking-[0.2em] text-[#6E7A6F] uppercase'>
                  Information
                </p>

                <div className='mt-8 grid grid-cols-2 gap-x-6 gap-y-5'>
                  <Detail label='Bed/bath' value={active.details.bedBath} />
                  <Detail label='Price' value={active.details.price} />
                  <Detail
                    label='Estimated Monthly Re Tax'
                    value={active.details.reTax}
                  />
                  <Detail
                    label='Estimated Monthly CC'
                    value={active.details.monthlyCc}
                  />
                  <Detail label='Int/Ext SF' value={active.details.intExt} />
                  <Detail label='Exposure' value={active.details.exposure} />
                  <Detail label='Status' value={active.details.status} />
                  <div>
                    <p className='text-[17px] font-medium text-[#6E7A6F]'>
                      Listing
                    </p>
                    <a
                      href={active.listingUrl}
                      aria-label={`View listing for ${active.title}`}
                      className='inline-block text-[14px] font-bold text-[#6E7A6F] underline underline-offset-2'
                    >
                      View Listing
                    </a>
                  </div>
                  <div>
                    <p className='text-[17px] font-medium text-[#6E7A6F]'>
                      Floor plan
                    </p>
                    <a
                      href={active.floorPlanUrl}
                      aria-label={`Download floor plan PDF for ${active.title}`}
                      className='mt-1 inline-flex text-[#6E7A6F]'
                    >
                      <PdfIcon />
                    </a>
                  </div>
                </div>
              </div>
            </aside>

            {/* Bản vẽ 2.66:1 — ép vừa bề ngang máy thì chấm hotspot chồng lên nhau
              và bé tới mức không bấm nổi, nên mobile cuộn ngang thay vì co ảnh
              lại. Khung + dòng gợi ý xếp dọc chung một cột. */}
            <div className='flex min-w-0 flex-1 flex-col'>
              <div
                data-panel='plan'
                className='flex overflow-x-auto border border-[#6E7A6F]/15 bg-white p-4 lg:min-h-0 lg:flex-1 lg:overflow-hidden lg:p-6'
              >
                {/* m-auto: khung đã cao bằng cột Information, canh giữa tấm bản
                  vẽ trong khoảng trắng thừa thay vì dồn xuống đáy. */}
                <div
                  data-plan
                  // Bề ngang = chiều cao × tỉ lệ, chiều cao do aspect-ratio suy
                  // ngược lại. Hộp vì thế luôn đúng bằng ảnh: `object-contain`
                  // không còn chừa dải trống nào, nên hotspot đặt theo % của hộp
                  // mới rơi trúng phòng. Dưới lg hộp cứ rộng hơn khung để cuộn
                  // ngang; từ lg khung không cuộn được nên phải kẹp min(100%,…).
                  style={
                    {
                      aspectRatio: active.plan.ratio,
                      '--plan-r': planRatio(active.plan),
                    } as React.CSSProperties
                  }
                  className='relative m-auto w-[calc(var(--plan-h)*var(--plan-r))] shrink-0 will-change-transform [--plan-h:320px] sm:[--plan-h:360px] lg:w-[min(100%,calc(var(--plan-h)*var(--plan-r)))] lg:[--plan-h:440px]'
                >
                  <Image
                    src={active.plan.src}
                    alt={active.plan.alt}
                    fill
                    className='object-contain'
                    // Rộng hơn khung thật: bản vẽ còn bị phóng lên khi mở hotspot,
                    // lấy đúng bề rộng khung thì lúc zoom chữ trên plan sẽ nhoè.
                    // Mobile vẽ ở ~745px CSS nên màn 2x cần tới ngưỡng 1536.
                    sizes='(max-width: 1023px) 1536px, 100vw'
                  />

                  {active.hotspots.map(spot => (
                    <div
                      key={spot.id}
                      data-hotspot
                      data-x={spot.x}
                      data-y={spot.y}
                      style={{ left: `${spot.x}%`, top: `${spot.y}%` }}
                      className='absolute'
                    >
                      {/* Nghỉ: chấm tròn 26px (label rộng 0). Hover: label giãn ra và
                      nền đổi cam — cùng một nút, không phải hai lớp chồng nhau. */}
                      <button
                        type='button'
                        data-hotspot-dot
                        aria-expanded='false'
                        aria-controls={`hotspot-${spot.id}`}
                        aria-label={`Show details for ${spot.name}`}
                        // before: nới vùng chạm lên 38px mà không đổi hình chấm —
                        // chỉ dưới lg, kẻo trên desktop pill hover bật sớm hơn lúc
                        // con trỏ thật sự tới chấm.
                        className='invisible relative flex h-6.5 -translate-x-1/2 -translate-y-1/2 cursor-pointer items-center rounded-full bg-[#1F1F1F] text-white shadow-[0_2px_8px_rgba(0,0,0,0.25)] max-lg:before:absolute max-lg:before:-inset-1.5 max-lg:before:content-[""] lg:h-7'
                      >
                        <span
                          data-hotspot-icon
                          className='flex h-6.5 w-6.5 shrink-0 items-center justify-center rounded-full border border-transparent lg:h-7 lg:w-7'
                        >
                          <PlusIcon />
                        </span>
                        <span
                          data-hotspot-label
                          className='w-0 overflow-hidden whitespace-nowrap'
                        >
                          <span className='font-ui block pr-3.5 pl-0.5 text-[10px] leading-none font-medium tracking-[0.14em] uppercase'>
                            {spot.name}
                          </span>
                        </span>
                      </button>

                      <div
                        id={`hotspot-${spot.id}`}
                        data-hotspot-card
                        style={{ backgroundColor: HOTSPOT_ACCENT }}
                        className={`invisible absolute w-[184px] p-3.5 text-white lg:w-[224px] ${cardAlign(
                          spot.x,
                          spot.y
                        )}`}
                      >
                        <div className='flex items-start justify-between gap-3'>
                          <p className='font-ui text-[10px] leading-tight font-medium tracking-[0.14em] uppercase'>
                            {spot.name}
                          </p>
                          <button
                            type='button'
                            data-hotspot-close
                            aria-label={`Hide details for ${spot.name}`}
                            className='-mt-1 -mr-1 flex h-5 w-5 shrink-0 cursor-pointer items-center justify-center'
                          >
                            <MinusIcon />
                          </button>
                        </div>

                        <div className='mt-3 grid grid-cols-2 gap-x-3 gap-y-2.5'>
                          {spot.specs.map(spec => (
                            <div key={spec.label} data-spec>
                              <p className='font-ui text-[9px] leading-none tracking-[0.1em] text-white/70 uppercase'>
                                {spec.label}
                              </p>
                              <p className='font-ui mt-1 text-[11px] leading-tight font-medium uppercase'>
                                {spec.value}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bản vẽ rộng gấp đôi khung ở mobile, mà mép cắt không phải lúc nào
                cũng đủ rõ. Effect B tự ẩn dòng này khi bản vẽ lọt trọn khung
                (máy rộng + bản 14B). */}
              <p
                data-plan-hint
                className='font-ui mt-2 text-center text-xs text-[#6E7A6F]/70 lg:hidden'
              >
                Kéo ngang để xem hết bản vẽ
              </p>
            </div>
          </div>
        </div>

        {/* Blend veil — cùng màu nền SceneReveal, để section này tan vào nó
            thay vì bị cắt bằng một mép chữ nhật trượt lên. */}
        <div
          data-layer='veil'
          aria-hidden
          className='pointer-events-none absolute inset-0 z-20 bg-white opacity-0'
        />
      </section>
    </>
  );
}

const PlusIcon = () => (
  <svg width='11' height='11' viewBox='0 0 11 11' fill='none' aria-hidden>
    <path
      d='M5.5 0v11M0 5.5h11'
      stroke='currentColor'
      strokeWidth='1.4'
      strokeLinecap='round'
    />
  </svg>
);

const MinusIcon = () => (
  <svg width='11' height='2' viewBox='0 0 11 2' fill='none' aria-hidden>
    <path
      d='M0 1h11'
      stroke='currentColor'
      strokeWidth='1.4'
      strokeLinecap='round'
    />
  </svg>
);

const Detail = ({ label, value }: { label: string; value: string }) => (
  <div>
    <p className='text-[17px] font-medium text-[#6E7A6F]'>{label}</p>
    <p className='text-[14px] font-bold text-[#6E7A6F]'>{value}</p>
  </div>
);
