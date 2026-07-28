'use client';

import { useEffect, useRef, useState } from 'react';
import Header from './Header';
import StickyMenu from './StickyMenu';
import DiscoverPanel from './DiscoverPanel';
import HeroIntroSection from './sections/HeroIntroSection';
import DetailsSection from './sections/DetailsSection';
import ProductVariantSection from './sections/ProductVariantSection';
import CtaSection from './sections/CtaSection';
import { IMG } from '@/lib/image-cdn';
import type { HotspotTab } from './ProductHotspotUI';

const LOADER_MIN_MS = 700;
const LOADER_MAX_MS = 2500;
const LOADER_FADE_MS = 300;
const PNJ_NAVY = '#00274e';

// Discover + craftsmanship + information — one scroll sequence on the canvas.
// Scroll past a step → that hotspot fades out; the next one fades in.
const CANVAS_HOTSPOTS: HotspotTab[] = [
  {
    key: 'discover-specs',
    label: 'Thông số kỹ thuật',
    desc: 'Xuất xứ thương hiệu: Nhật Bản\nXuất xứ bộ máy: Nhật Bản',
    img: IMG.watchDial,
    dotX: 60,
    dotY: 42,
  },
  {
    key: 'discover-material',
    label: 'Chất liệu & hoàn thiện',
    desc: 'Vỏ thép không gỉ\nMặt kính sapphire chống trầy\nDây kim loại liên kết',
    img: IMG.watchProfile,
    dotX: 50,
    dotY: 22,
  },
  {
    key: 'craft-dial',
    label: 'Thiết kế mặt số',
    desc: 'Kim đồng hồ thanh mảnh\nVạch chỉ giờ tinh xảo\nLogo Citizen tinh tế',
    img: IMG.watchDialAlt,
    dotX: 50,
    dotY: 36,
  },
  {
    key: 'craft-eco',
    label: 'Công nghệ Eco-Drive',
    desc: 'Năng lượng ánh sáng\nKhông cần thay pin\nHoạt động bền bỉ',
    img: IMG.watchCaseback,
    dotX: 55,
    dotY: 54,
  },
];

// Shared landing body used by both the public home page (`/`) and the
// analytics route (`/analytics`). Keeping it in one place avoids drift
// between the two compositions (DRY).
export default function LandingContent() {
  const [discoverOpen, setDiscoverOpen] = useState(false);
  const [discoverView, setDiscoverView] = useState<
    'dial' | 'profile' | 'caseback'
  >('dial');
  const [isLoading, setIsLoading] = useState(true);
  const [isExiting, setIsExiting] = useState(false);
  const discoverBehindRef = useRef<HTMLDivElement>(null);
  const exitStartedRef = useRef(false);

  const handleOpenDiscover = (viewKey?: string) => {
    if (viewKey === 'dial' || viewKey === 'profile' || viewKey === 'caseback') {
      setDiscoverView(viewKey);
    }
    setDiscoverOpen(true);
  };

  useEffect(() => {
    const startedAt = performance.now();
    let ready = document.readyState === 'complete';
    let fadeTimer: ReturnType<typeof setTimeout> | undefined;
    let unmountTimer: ReturnType<typeof setTimeout> | undefined;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const startExit = () => {
      if (exitStartedRef.current) return;
      exitStartedRef.current = true;

      const elapsed = performance.now() - startedAt;
      const waitMin = Math.max(0, LOADER_MIN_MS - elapsed);

      fadeTimer = setTimeout(() => {
        setIsExiting(true);
        unmountTimer = setTimeout(() => {
          setIsLoading(false);
          document.body.style.overflow = prevOverflow;
        }, LOADER_FADE_MS);
      }, waitMin);
    };

    const handleLoad = () => {
      ready = true;
      startExit();
    };

    if (ready) {
      startExit();
    } else {
      window.addEventListener('load', handleLoad);
    }

    const maxTimer = setTimeout(startExit, LOADER_MAX_MS);

    return () => {
      window.removeEventListener('load', handleLoad);
      clearTimeout(maxTimer);
      if (fadeTimer) clearTimeout(fadeTimer);
      if (unmountTimer) clearTimeout(unmountTimer);
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  return (
    <>
      {isLoading && (
        <div
          className={`fixed inset-0 z-[9999] flex items-center justify-center transition-opacity duration-300 ease-out ${
            isExiting ? 'pointer-events-none opacity-0' : 'opacity-100'
          }`}
          style={{ backgroundColor: PNJ_NAVY }}
          aria-busy='true'
          aria-live='polite'
          role='status'
        >
          <img
            src='/icon-pnj.svg'
            alt='PNJ'
            width={96}
            height={42}
            className='h-10 w-auto animate-pulse motion-reduce:animate-none md:h-12'
            draggable={false}
          />
          <span className='sr-only'>Loading</span>
        </div>
      )}

      <Header />

      <main>
        <HeroIntroSection hotspots={CANVAS_HOTSPOTS} />

        <div className='relative z-40 bg-white'>
          <DetailsSection />

          <ProductVariantSection
            id='information'
            behindRef={discoverBehindRef}
            onOpenDiscover={handleOpenDiscover}
            variants={[
              {
                key: 'dial',
                label: 'Mặt số',
                desc: 'Mặt số xà cừ hồng với họa tiết hoa nhẹ. Kim cương thay thế vạch giờ, tạo điểm nhấn tinh tế khi ánh sáng chiếu qua.',
                image: IMG.watchDial,
                highlights: [
                  'Xà cừ hồng',
                  'Họa tiết hoa',
                  'Kim cương vạch giờ',
                ],
              },
              {
                key: 'profile',
                label: 'Góc nghiêng',
                desc: 'Vành hai tông bạc và vàng hồng ôm lấy mặt kính. Ba viên kim cương nổi trong rãnh vành là chi tiết đặc trưng khi nhìn nghiêng.',
                image: IMG.watchProfile,
                highlights: ['Vành hai tông', 'Kim cương nổi', 'Độ mỏng vỏ'],
              },
              {
                key: 'caseback',
                label: 'Mặt sau',
                desc: 'Nắp lưng thép khắc Eco-Drive. Máy chạy bằng ánh sáng, không cần thay pin trong quá trình sử dụng thông thường.',
                image: IMG.watchCaseback,
                highlights: ['Eco-Drive', 'Nắp thép', 'Không thay pin'],
              },
            ]}
          />

          <CtaSection />
        </div>
      </main>

      <DiscoverPanel
        open={discoverOpen}
        onClose={() => setDiscoverOpen(false)}
        initialView={discoverView}
        behindRef={discoverBehindRef}
        images={{
          dial: [IMG.watchDial, IMG.watchDialAlt, IMG.watchProfile],
          profile: [IMG.watchProfile, IMG.watchProfileAlt, IMG.watchDial],
          caseback: [IMG.watchCaseback, IMG.watchProfile, IMG.watchDial],
        }}
      />

      <StickyMenu />
    </>
  );
}
