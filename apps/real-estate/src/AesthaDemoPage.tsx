import { useEffect, useRef, useState } from 'react';

/**
 * Standalone 1:1 clone of significant-sheet-415363.framer.app home.
 * No builder/CMS integration — just a demo page with hardcoded content
 * and images from /public/images/landing-v2/.
 *
 * Route: /aestha-demo
 *
 * Animation: each image fades in + slides up from 60px below when it
 * enters the viewport (IntersectionObserver, one-shot). Image 1 is
 * pre-triggered so it's visible on load.
 */
type View = 'home' | 'explore' | 'project';

export default function AesthaDemoPage() {
  const [view, setView] = useState<View>('home');
  const [projectTitle, setProjectTitle] = useState<string>('TẦM NHÌN');

  // Scroll to top whenever view changes.
  useEffect(() => {
    if (typeof window !== 'undefined') window.scrollTo(0, 0);
  }, [view]);

  return (
    <>
      <GlobalReset />
      <main
        style={{
          background: '#FFFFFF',
          color: '#1A1A1A',
          fontFamily:
            "'Switzer Variable', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
          minHeight: '100vh',
        }}
      >
        {view === 'home' && <Stage onExplore={() => setView('explore')} />}
        {view === 'explore' && (
          <ExploreView
            onBack={() => setView('home')}
            onOpenProject={label => {
              setProjectTitle(label.toUpperCase());
              setView('project');
            }}
          />
        )}
        {view === 'project' && (
          <ProjectView
            title={projectTitle}
            onBack={() => setView('explore')}
            onNextProject={label => setProjectTitle(label.toUpperCase())}
          />
        )}
      </main>
    </>
  );
}

function GlobalReset() {
  return (
    <style>{`
      html, body { background: #fff; margin: 0; padding: 0; }
      body { font-family: 'Switzer Variable', 'Inter', sans-serif; }
      * { box-sizing: border-box; }
    `}</style>
  );
}

interface ImgSlot {
  src: string;
  alt: string;
  width: number;
  height: number;
  slotClass: 'img1' | 'img2' | 'img3';
}

const IMAGES: ImgSlot[] = [
  {
    src: '/images/landing-v2/arch-twin-towers-street-level.jpg',
    alt: 'Cặp tháp đôi nhìn từ đường phố',
    width: 1152,
    height: 1440,
    slotClass: 'img1',
  },
  {
    src: '/images/landing-v2/hero-tower-closeup-sunset.jpg',
    alt: 'Tòa tháp kiến trúc hoàng hôn',
    width: 1920,
    height: 1920,
    slotClass: 'img2',
  },
  {
    src: '/images/landing-v2/arch-three-towers-aerial-green.jpg',
    alt: 'Ba tòa tháp nhìn từ trên cao',
    width: 1840,
    height: 1440,
    slotClass: 'img3',
  },
];

function Stage({ onExplore }: { onExplore: () => void }) {
  return (
    <div className='ad-stage'>
      <style>{`
        .ad-stage {
          display: grid;
          grid-template-columns: minmax(280px, 1fr) 1.35fr;
          gap: clamp(32px, 5vw, 96px);
          max-width: none;
          margin: 0 auto;
          padding: clamp(24px, 3.5vw, 48px);
          align-items: start;
          /* NOTE: no overflow: clip/hidden here — it breaks the
             sticky context for .ad-card children, causing them to
             un-stick and scroll away. */
        }
        .ad-left {
          position: sticky;
          top: clamp(24px, 3vh, 48px);
          height: calc(100vh - clamp(48px, 6vh, 96px));
          display: flex;
          flex-direction: column;
        }
        .ad-brand {
          font-family: 'Funnel Display', 'Switzer', sans-serif;
          font-size: clamp(40px, 4.5vw, 64px);
          font-weight: 500;
          letter-spacing: -0.02em;
          line-height: 1;
          margin: 0;
        }
        .ad-tagline-row {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          flex-wrap: wrap;
          margin-top: clamp(24px, 4vh, 48px);
        }
        .ad-tagline {
          font-size: 16px;
          line-height: 1.5;
          color: #1A1A1A;
          margin: 0;
          max-width: 280px;
        }
        .ad-scroll-pill {
          display: inline-flex;
          align-items: center;
          padding: 4px 12px;
          border-radius: 999px;
          background: rgba(26,26,26,0.06);
          font-family: 'DM Mono', ui-monospace, monospace;
          font-size: 11px;
          letter-spacing: 0.14em;
          text-transform: lowercase;
          color: #555;
        }
        .ad-spacer { flex: 1 1 auto; min-height: clamp(80px, 16vh, 200px); }
        .ad-desc {
          margin-top: clamp(24px, 4vh, 48px);
          font-size: 16px;
          line-height: 1.55;
          color: #1A1A1A;
          max-width: 460px;
        }
        .ad-footer-nav {
          display: flex;
          gap: clamp(14px, 2vw, 28px);
          margin-top: clamp(24px, 4vh, 48px);
        }
        .ad-footer-nav a {
          font-family: 'DM Mono', ui-monospace, monospace;
          font-size: 12px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: #1A1A1A;
          text-decoration: none;
          transition: opacity 0.2s ease;
        }
        .ad-footer-nav a:hover { opacity: 0.55; }

        /* Right column — progressive sticky stack. Each image sticks
           at a top offset slightly below the previous, and has a
           scroll runway (margin-bottom) so the user must scroll
           before the next image starts rising. Sequence: img1
           sticks → scroll → img2 rises and sticks just below img1
           → scroll → img3 rises and sticks just below img2. */
        .ad-right {
          position: relative;
          display: flex;
          flex-direction: column;
          /* Scroll runway = sum of image margin-bottoms + CTA natural height.
             No padding-bottom so the page ends exactly when CTA pins at
             top:0 — user cannot scroll past, must click CTA to advance. */
          min-height: 600vh;
        }
        .ad-card {
          position: sticky;
          overflow: hidden;
          background: #EEE;
          /* Subtle shadow separates each card when they stack — important
             for "editorial cascade" feel (see Framer reference). */
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
          /* scroll runway after each card — gives time for it to stay
             stuck in place while the user scrolls. Includes the last
             card so img3 doesn't immediately un-stick and drag the
             stack up with it. */
          margin-bottom: 70vh;
        }
        .ad-card img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        /* Diagonal cascade — each image sits in a distinct quadrant so
           none covers more than ~30% of another when all three are stuck.
           Widths kept ≤50% of column width so gaps between them read
           clearly (Framer reference shows each image individually). */
        .ad-img1 {
          top: clamp(20px, 3vh, 40px);
          width: min(516px, 60%);
          margin-left: 0;
          margin-right: auto;
        }
        .ad-img2 {
          top: clamp(80px, 10vh, 120px);
          width: min(732px, 82%);
          margin-left: auto;
          margin-right: clamp(0px, 2vw, 24px);
        }
        .ad-img3 {
          top: clamp(440px, 50vh, 540px);
          width: min(540px, 55%);
          margin-left: clamp(48px, 12vw, 160px);
          margin-right: auto;
        }

        /* CTA card — 4th sticky card in the sequence. Slides up from below
           (like img2/img3) then pins at top:0 with solid white background,
           fully hiding the image stack so the reader sees only the CTA.
           Previously used rgba(255,255,255,0.78) + backdrop-blur which made
           images peek through — gave the impression of images "scrolling
           along" when the sticky disengaged. Solid bg + longer scroll
           runway fixes that. */
        .ad-cta-card {
          position: sticky;
          top: 0;
          z-index: 10;
          width: 100%;
          height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #ffffff;
          /* No margin-bottom — CTA is the last element; when it pins at
             top:0 the page scroll naturally ends, locking the user on CTA
             until they click through. */
        }
        .ad-cta {
          display: inline-flex;
          align-items: center;
          gap: clamp(12px, 1.5vw, 24px);
          font-family: 'Funnel Display', 'Switzer', sans-serif;
          font-size: clamp(28px, 4vw, 56px);
          font-weight: 500;
          letter-spacing: -0.01em;
          color: #1A1A1A;
          text-decoration: none;
          cursor: pointer;
          user-select: none;
          transition: opacity 0.3s ease;
        }
        .ad-cta:hover { opacity: 0.7; }
        .ad-cta .arrow {
          display: inline-block;
          transition: transform 0.4s cubic-bezier(0.22,1,0.36,1);
        }
        .ad-cta:hover .arrow { transform: translateX(10px); }

        @media (max-width: 900px) {
          .ad-stage { grid-template-columns: 1fr; gap: 40px; }
          .ad-left { position: static; height: auto; gap: 20px; }
          .ad-spacer { display: none; }
          .ad-card {
            position: relative !important; /* disable sticky on mobile */
            top: auto;
            width: 100% !important;
            margin: 0 0 40px !important;
          }
          .ad-cta-card {
            position: relative !important;
            height: auto;
            background: transparent !important;
            backdrop-filter: none !important;
            -webkit-backdrop-filter: none !important;
            padding: 32px 0;
            margin-bottom: 0 !important;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .ad-card { position: relative; top: auto; margin-bottom: 32px; }
          .ad-cta .arrow { transition: none; }
          .ad-cta-card, .ad-cta { transition: none !important; }
        }
      `}</style>

      {/* ─── Left column (sticky) ─── */}
      <aside className='ad-left'>
        <h1 className='ad-brand'>EPICTOWER</h1>
        <div className='ad-tagline-row'>
          <p className='ad-tagline'>
            Nơi kiến trúc Art Deco gặp gỡ đời sống đương đại.
          </p>
          <span className='ad-scroll-pill'>scroll</span>
        </div>
        <div className='ad-spacer' aria-hidden />
        <p className='ad-desc'>
          Kiêu hãnh vươn cao giữa tâm Cầu Giấy, Epictower là tổ hợp 45 tầng với
          500+ căn hộ cao cấp — nơi mỗi chi tiết được chăm chút từ vật liệu đến
          tiện ích, cho một nhịp sống trọn vẹn.
        </p>
        <nav className='ad-footer-nav' aria-label='Site'>
          <a href='#projects'>Dự án</a>
          <a href='/explore'>Căn hộ</a>
          <a href='#contact'>Liên hệ</a>
        </nav>
      </aside>

      {/* ─── Right column — 3 sticky image cards + 1 sticky CTA card ─── */}
      <section className='ad-right'>
        {IMAGES.map((img, i) => (
          <div
            key={img.src}
            className={`ad-card ad-${img.slotClass}`}
            style={{
              aspectRatio: `${img.width} / ${img.height}`,
              zIndex: i + 1,
            }}
          >
            <img
              src={img.src}
              alt={img.alt}
              width={img.width}
              height={img.height}
              loading={i === 0 ? 'eager' : 'lazy'}
            />
          </div>
        ))}
        {/* CTA card — 4th sticky in sequence. Scrolls up from below,
            sticks at top:0 with translucent backdrop over the image
            stack. Click = navigate to Explore view. */}
        <div className='ad-cta-card'>
          <a
            href='#explore'
            onClick={e => {
              e.preventDefault();
              onExplore();
            }}
            className='ad-cta'
            aria-label='Khám phá thêm'
          >
            KHÁM PHÁ THÊM{' '}
            <span className='arrow' aria-hidden>
              →
            </span>
          </a>
        </div>
      </section>
    </div>
  );
}

/* ─── Explore View ────────────────────────────────────────────────
 * Shown after user clicks "KHÁM PHÁ THÊM". Big EXPLORE title,
 * vertical menu list, single large image on the right that swaps
 * on hover. Back arrow returns to home view.
 * ────────────────────────────────────────────────────────────── */

interface ExploreItem {
  label: string;
  image: string;
  alt: string;
  width: number;
  height: number;
}

const EXPLORE_ITEMS: ExploreItem[] = [
  {
    label: 'Tầm nhìn',
    image: '/images/landing-v2/arch-three-towers-golden-hour.jpg',
    alt: 'Ba tòa tháp giờ vàng',
    width: 1920,
    height: 1072,
  },
  {
    label: 'Kiến trúc',
    image: '/images/landing-v2/arch-twin-towers-river-mountain.jpg',
    alt: 'Tháp đôi bên sông núi',
    width: 1440,
    height: 1440,
  },
  {
    label: 'Trải nghiệm nội thất',
    image: '/images/landing-v2/interior-living-curved-glass.png',
    alt: 'Phòng khách kính cong',
    width: 1920,
    height: 1071,
  },
  {
    label: 'Tiện ích',
    image: '/images/landing-v2/amenity-wisteria-tunnel.jpg',
    alt: 'Đường hầm tử đằng',
    width: 1440,
    height: 810,
  },
  {
    label: 'Vị trí',
    image: '/images/landing-v2/ext-masterplan-aerial-city.jpg',
    alt: 'Tổng thể quy hoạch khu vực',
    width: 1920,
    height: 1280,
  },
];

function ExploreView({
  onBack,
  onOpenProject,
}: {
  onBack: () => void;
  onOpenProject: (label: string) => void;
}) {
  const [activeIdx, setActiveIdx] = useState(0);

  return (
    <div className='ev-stage'>
      <style>{`
        .ev-stage {
          display: grid;
          grid-template-columns: 1fr 1.1fr;
          gap: clamp(32px, 5vw, 96px);
          max-width: none;
          margin: 0 auto;
          padding: clamp(24px, 3.5vw, 48px);
          /* Lock the whole view to one viewport — no vertical scroll.
             box-sizing:border-box (global reset) keeps padding inside
             the 100dvh so both columns fill exactly one screen. */
          height: 100dvh;
          overflow: hidden;
          position: relative;
        }
        .ev-left {
          display: grid;
          grid-template-rows: auto 1fr auto;
          height: 100%;
          min-height: 0;
        }
        .ev-heading {
          font-family: 'Funnel Display', 'Switzer', sans-serif;
          font-size: clamp(44px, 6vw, 88px);
          font-weight: 500;
          letter-spacing: -0.02em;
          line-height: 1;
          margin: 0;
        }
        .ev-list {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          justify-content: center;
          gap: clamp(8px, 1vh, 14px);
          padding-right: clamp(0px, 4vw, 48px);
        }
        .ev-item {
          background: transparent;
          border: none;
          padding: 4px 0;
          font-family: 'Switzer Variable', 'Inter', sans-serif;
          font-size: clamp(15px, 1.3vw, 18px);
          color: #8a8a8a;
          cursor: pointer;
          text-align: right;
          transition: color 0.3s cubic-bezier(0.22,1,0.36,1),
                      transform 0.3s cubic-bezier(0.22,1,0.36,1);
        }
        .ev-item:hover,
        .ev-item:focus-visible,
        .ev-item.is-active {
          color: #1A1A1A;
          transform: translateX(-4px);
          outline: none;
        }
        .ev-item.is-active { font-weight: 500; }

        .ev-footer-nav {
          display: flex;
          gap: clamp(14px, 2vw, 28px);
          align-items: center;
        }
        .ev-footer-nav a,
        .ev-footer-nav button {
          font-family: 'DM Mono', ui-monospace, monospace;
          font-size: 12px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: #1A1A1A;
          text-decoration: none;
          background: transparent;
          border: none;
          cursor: pointer;
          padding: 0;
          transition: opacity 0.2s ease;
        }
        .ev-footer-nav a:hover,
        .ev-footer-nav button:hover { opacity: 0.55; }

        .ev-right {
          position: relative;
          overflow: hidden;
          background: #EEE;
          /* Fill the grid row exactly so every image (regardless of its
             own aspect ratio) renders at the same fixed size, contained
             within the 100dvh view. object-fit:cover handles the crop. */
          height: 100%;
          min-height: 0;
        }
        .ev-image {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          opacity: 0;
          transition: opacity 0.5s cubic-bezier(0.22,1,0.36,1);
          will-change: opacity;
        }
        .ev-image.is-active { opacity: 1; }

        @media (max-width: 900px) {
          /* Mobile stacks the two columns — release the 100dvh lock so
             the content can scroll instead of being clipped. */
          .ev-stage { grid-template-columns: 1fr; gap: 24px; height: auto; overflow: visible; }
          .ev-left { height: auto; min-height: auto; grid-template-rows: auto auto auto; }
          .ev-list { align-items: center; padding-right: 0; gap: 10px; }
          .ev-item { text-align: center; }
          .ev-right { height: auto; aspect-ratio: 4 / 3; min-height: 300px; }
        }
        @media (prefers-reduced-motion: reduce) {
          .ev-item, .ev-image { transition: none !important; transform: none !important; }
        }
      `}</style>

      <div className='ev-left'>
        <h1 className='ev-heading'>EXPLORE</h1>

        <div className='ev-list' role='tablist' aria-label='Khám phá chủ đề'>
          {EXPLORE_ITEMS.map((item, i) => (
            <button
              key={i}
              type='button'
              role='tab'
              aria-selected={i === activeIdx}
              className={`ev-item${i === activeIdx ? 'is-active' : ''}`}
              onMouseEnter={() => setActiveIdx(i)}
              onFocus={() => setActiveIdx(i)}
              onClick={() => onOpenProject(item.label)}
            >
              {item.label}
            </button>
          ))}
        </div>

        <nav className='ev-footer-nav' aria-label='Site'>
          <button
            type='button'
            onClick={onBack}
            aria-label='Quay lại trang chủ'
          >
            ← Dự án
          </button>
          <a href='#studio'>Studio</a>
          <a href='#contact'>Liên hệ</a>
        </nav>
      </div>

      <div className='ev-right'>
        {EXPLORE_ITEMS.map((item, i) => (
          <img
            key={item.image}
            src={item.image}
            alt={item.alt}
            width={item.width}
            height={item.height}
            className={`ev-image${i === activeIdx ? 'is-active' : ''}`}
            loading={i === 0 ? 'eager' : 'lazy'}
          />
        ))}
      </div>
    </div>
  );
}

/* ─── Project View ────────────────────────────────────────────────
 * Shown after user clicks a menu item in Explore. Left column is
 * sticky (project title + "Concept" label + body paragraphs + nav).
 * Right column is a long stack of images that scrolls normally.
 * ────────────────────────────────────────────────────────────── */

/** Per-project content: body paragraphs + image list. Keyed by uppercase
 *  title so the ProjectView can lookup directly from the `title` prop. */
const PROJECT_DATA: Record<
  string,
  {
    body: string[];
    images: { src: string; alt: string; w: number; h: number }[];
  }
> = {
  'TẦM NHÌN': {
    body: [
      'Epictower là tổ hợp căn hộ cao cấp tại trung tâm Cầu Giấy — 45 tầng, 4 block, 500+ căn hộ đa dạng từ 1 phòng ngủ đến penthouse duplex.',
      'Toạ lạc trên tuyến đường huyết mạch, dự án kết nối liền mạch với hồ Tây, sân bay Nội Bài và hệ thống trường quốc tế chỉ trong 15–20 phút di chuyển.',
      'Thiết kế Art Deco & Indochine kết hợp vật liệu cao cấp và công năng đương đại — một công trình kiến tạo để tồn tại qua nhiều thế hệ cư dân.',
    ],
    images: [
      {
        src: '/images/landing-v2/arch-three-towers-aerial-green.jpg',
        alt: 'Ba tháp aerial',
        w: 1440,
        h: 1440,
      },
      {
        src: '/images/landing-v2/arch-twin-towers-river-mountain.jpg',
        alt: 'Tháp đôi sông núi',
        w: 1440,
        h: 1440,
      },
      {
        src: '/images/landing-v2/arch-three-towers-golden-hour.jpg',
        alt: 'Giờ vàng',
        w: 1920,
        h: 1072,
      },
      {
        src: '/images/landing-v2/arch-twin-towers-street-level.jpg',
        alt: 'Street level',
        w: 1152,
        h: 1440,
      },
    ],
  },
  'KIẾN TRÚC': {
    body: [
      'Ngôn ngữ Art Deco kết hợp Indochine đương đại — tỉ lệ cổ điển của Pháp thuộc gặp tinh thần vật liệu Việt Nam.',
      'Mặt đứng đá vôi tự nhiên, hoa văn kim loại đồng mạ thủ công và chi tiết vương miện tại đỉnh tháp tạo hiệu ứng ánh sáng thay đổi theo khoảnh khắc.',
      'Sky Garden tầng kỹ thuật và khu podium thương mại được tổ chức theo nguyên tắc "kiến trúc khí hậu" — ánh sáng, gió và bóng đổ là vật liệu cấu thành.',
    ],
    images: [
      {
        src: '/images/landing-v2/arch-rooftop-crown-detail.jpg',
        alt: 'Đỉnh tháp',
        w: 1800,
        h: 1440,
      },
      {
        src: '/images/landing-v2/arch-podium-terraces-green.jpg',
        alt: 'Podium xanh',
        w: 1600,
        h: 2000,
      },
      {
        src: '/images/landing-v2/arch-podium-cherry-blossom-night.jpg',
        alt: 'Đêm hoa anh đào',
        w: 2364,
        h: 1014,
      },
      {
        src: '/images/landing-v2/arch-sky-garden-greenery.jpg',
        alt: 'Sky garden',
        w: 1800,
        h: 1440,
      },
    ],
  },
  'TRẢI NGHIỆM NỘI THẤT': {
    body: [
      'Bốn định dạng căn hộ — 1, 2, 3 phòng ngủ và penthouse — đều tuân theo cùng một ngôn ngữ thiết kế: ánh sáng tự nhiên dẫn lối, tỉ lệ không gian cân bằng.',
      'Vật liệu hoàn thiện cao cấp: đá tự nhiên, gỗ sồi, kính low-e cách nhiệt, thiết bị bếp Châu Âu và hệ thống smart home tích hợp sẵn.',
      'Căn hộ mẫu đã mở đón khách tham quan — liên hệ đội ngũ tư vấn để sắp xếp lịch xem nhà theo nhu cầu cá nhân.',
    ],
    images: [
      {
        src: '/images/landing-v2/interior-living-curved-glass.png',
        alt: 'Phòng khách kính cong',
        w: 1920,
        h: 1071,
      },
      {
        src: '/images/landing-v2/interior-living-panoramic-city.png',
        alt: 'Panoramic city',
        w: 1920,
        h: 1071,
      },
      {
        src: '/images/landing-v2/interior-penthouse-living-duplex.png',
        alt: 'Penthouse duplex',
        w: 1920,
        h: 1440,
      },
      {
        src: '/images/landing-v2/interior-cityview-window-sunset.png',
        alt: 'Cityview sunset',
        w: 1920,
        h: 1071,
      },
      {
        src: '/images/landing-v2/interior-penthouse-piano-sunset.jpg',
        alt: 'Piano sunset',
        w: 1920,
        h: 1280,
      },
    ],
  },
  'TIỆN ÍCH': {
    body: [
      'Hơn 30 tiện ích nội khu được quy hoạch theo sáu không gian chuyên biệt: rooftop, thương mại, an ninh, fitness & spa, khu vui chơi trẻ em và môi trường xanh.',
      'Hồ bơi vô cực tầng cao với tầm nhìn panorama toàn cảnh Hà Nội, khu onsen lấy cảm hứng từ văn hoá tắm khoáng Nhật Bản và phòng gym vận hành 24/7.',
      'Hệ thống an ninh 3 lớp tiêu chuẩn quốc tế, concierge 7 ngày trong tuần và khu vui chơi trẻ em đạt chuẩn châu Âu — một cộng đồng sống toàn diện.',
    ],
    images: [
      {
        src: '/images/landing-v2/amenity-wisteria-tunnel.jpg',
        alt: 'Đường hầm tử đằng',
        w: 1440,
        h: 810,
      },
      {
        src: '/images/landing-v2/amenity-cherry-blossom-path.jpg',
        alt: 'Đường hoa anh đào',
        w: 1920,
        h: 1280,
      },
      {
        src: '/images/landing-v2/amenity-onsen-japanese-garden.jpg',
        alt: 'Onsen Nhật Bản',
        w: 1920,
        h: 1280,
      },
      {
        src: '/images/landing-v2/amenity-wisteria-garden-japanese.jpg',
        alt: 'Vườn tử đằng',
        w: 1920,
        h: 1280,
      },
    ],
  },
  'VỊ TRÍ': {
    body: [
      'Epictower toạ lạc tại tuyến đường huyết mạch quận Cầu Giấy — trái tim hành chính, giáo dục và tài chính phía Tây Hà Nội.',
      '1,2 km tới trung tâm quận · 2,8 km tới Hồ Tây · 15 phút di chuyển tới sân bay Nội Bài · bao quanh bởi 3 trường quốc tế hàng đầu.',
      'Hạ tầng giao thông đồng bộ với tuyến metro số 3 và hệ thống đường vành đai kết nối toàn thành phố — một vị trí thực sự khó có thể thay thế.',
    ],
    images: [
      {
        src: '/images/landing-v2/ext-masterplan-aerial-city.jpg',
        alt: 'Tổng thể quy hoạch',
        w: 1920,
        h: 1280,
      },
      {
        src: '/images/landing-v2/ext-entrance-aerial-day.jpg',
        alt: 'Lối vào chính',
        w: 1920,
        h: 1280,
      },
      {
        src: '/images/landing-v2/ext-park-lake-view-daytime.jpg',
        alt: 'Công viên hồ',
        w: 1920,
        h: 1280,
      },
      {
        src: '/images/landing-v2/ext-retail-street-entrance.jpg',
        alt: 'Podium thương mại',
        w: 1920,
        h: 1280,
      },
    ],
  },
};

/** Cycle of project titles — clicking "next project" moves through them. */
const PROJECT_SEQUENCE = [
  'TẦM NHÌN',
  'KIẾN TRÚC',
  'TRẢI NGHIỆM NỘI THẤT',
  'TIỆN ÍCH',
  'VỊ TRÍ',
];

function getNextProject(current: string): string {
  const idx = PROJECT_SEQUENCE.indexOf(current.toUpperCase());
  if (idx === -1) return PROJECT_SEQUENCE[0];
  return PROJECT_SEQUENCE[(idx + 1) % PROJECT_SEQUENCE.length];
}

/** "TẦM NHÌN" → "Tầm nhìn" for prettier display in next-project label. */
function toTitleCase(upper: string): string {
  return upper
    .toLowerCase()
    .split(' ')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

function ProjectView({
  title,
  onBack,
  onNextProject,
}: {
  title: string;
  onBack: () => void;
  onNextProject: (label: string) => void;
}) {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [atEnd, setAtEnd] = useState(false);
  const nextLabel = getNextProject(title);
  const data = PROJECT_DATA[title] ?? PROJECT_DATA['TẦM NHÌN'];

  // Sentinel placed just before the last image — when it enters the
  // viewport, swap left-column body for the "See next project" panel.
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => setAtEnd(e.isIntersecting), {
      threshold: 0,
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, [title]);

  // Reset scroll + end-state whenever the project changes (user clicks
  // "See next project") so the new project starts fresh at the top.
  useEffect(() => {
    setAtEnd(false);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'auto' });
    }
  }, [title]);

  return (
    <div className='pv-stage'>
      <style>{`
        .pv-stage {
          display: grid;
          grid-template-columns: minmax(260px, 1fr) 1.2fr;
          gap: clamp(32px, 5vw, 96px);
          max-width: none;
          margin: 0 auto;
          padding: clamp(24px, 3.5vw, 48px);
          align-items: start;
        }
        .pv-left {
          position: sticky;
          top: clamp(24px, 4vh, 64px);
          height: calc(100vh - clamp(48px, 8vh, 128px));
          display: flex;
          flex-direction: column;
        }
        /* Relative wrapper so the absolute-positioned next-project
           panel stacks on top of the body in the same slot. */
        .pv-panels-wrap {
          position: relative;
          flex: 1 1 auto;
        }
        .pv-panel-next {
          top: 0;
          left: 0;
          right: 0;
        }
        .pv-title {
          font-family: 'Funnel Display', 'Switzer', sans-serif;
          font-size: clamp(22px, 2.2vw, 34px);
          font-weight: 500;
          letter-spacing: -0.01em;
          line-height: 1;
          margin: 0 0 clamp(48px, 8vh, 96px);
        }
        .pv-section-label {
          font-family: 'DM Mono', ui-monospace, monospace;
          font-size: 12px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: #555;
          margin: 0;
          flex: 0 0 auto;
          width: clamp(80px, 12vw, 140px);
        }
        /* Body + next-project share the same middle slot — they
           crossfade based on sentinel state. */
        .pv-panel {
          flex: 1 1 auto;
          min-height: 0;
          transition: opacity 0.5s cubic-bezier(0.22,1,0.36,1),
                      transform 0.5s cubic-bezier(0.22,1,0.36,1);
        }
        .pv-panel-body {
          opacity: 1;
          transform: translate3d(0,0,0);
          display: flex;
          flex-direction: row;
          align-items: flex-start;
          gap: clamp(24px, 3vw, 56px);
        }
        .pv-panel-body.is-hidden {
          opacity: 0;
          transform: translate3d(0, -12px, 0);
          pointer-events: none;
        }
        .pv-panel-next {
          position: absolute;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 4px;
          opacity: 0;
          transform: translate3d(0, 12px, 0);
          pointer-events: none;
        }
        .pv-panel-next .pv-section-label {
          width: auto;
        }
        .pv-panel-next.is-shown {
          opacity: 1;
          transform: translate3d(0, 0, 0);
          pointer-events: auto;
        }
        .pv-next-link {
          background: transparent;
          border: none;
          padding: 0;
          margin-top: 4px;
          font-family: 'Switzer Variable', 'Inter', sans-serif;
          font-size: clamp(15px, 1.3vw, 18px);
          color: #8a8a8a;
          cursor: pointer;
          transition: color 0.3s ease, transform 0.3s ease;
        }
        .pv-next-link:hover,
        .pv-next-link:focus-visible {
          color: #1A1A1A;
          transform: translateX(-4px);
          outline: none;
        }
        .pv-body { max-width: 360px; }
        .pv-body p {
          font-size: 14px;
          line-height: 1.6;
          color: #1A1A1A;
          margin: 0 0 16px;
        }
        .pv-sentinel { height: 1px; }
        .pv-nav {
          display: flex;
          gap: clamp(14px, 2vw, 28px);
          margin-top: clamp(24px, 4vh, 48px);
        }
        .pv-nav a, .pv-nav button {
          font-family: 'DM Mono', ui-monospace, monospace;
          font-size: 12px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: #1A1A1A;
          text-decoration: none;
          background: transparent;
          border: none;
          cursor: pointer;
          padding: 0;
          transition: opacity 0.2s ease;
        }
        .pv-nav a:hover, .pv-nav button:hover { opacity: 0.55; }

        .pv-right {
          display: flex;
          flex-direction: column;
          gap: clamp(24px, 3vh, 48px);
          padding-bottom: clamp(40px, 8vh, 120px);
        }
        .pv-img {
          width: 100%;
          height: auto;
          display: block;
          background: #EEE;
          object-fit: cover;
        }

        @media (max-width: 900px) {
          .pv-stage { grid-template-columns: 1fr; gap: 32px; }
          .pv-left { position: static; height: auto; }
          .pv-body { max-width: none; }
          .pv-panel-body { flex-direction: column; gap: 12px; }
          .pv-section-label { width: auto; }
        }
      `}</style>

      <aside className='pv-left'>
        <h1 className='pv-title'>{title}</h1>

        <div className='pv-panels-wrap'>
          {/* CONCEPT body — visible by default; fades out at end of scroll */}
          <div className={`pv-panel pv-panel-body${atEnd ? 'is-hidden' : ''}`}>
            <p className='pv-section-label'>Concept</p>
            <div className='pv-body'>
              {data.body.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </div>

          {/* NEXT PROJECT panel — fades in when user reaches last image */}
          <div className={`pv-panel pv-panel-next${atEnd ? 'is-shown' : ''}`}>
            <p className='pv-section-label'>See next project</p>
            <button
              type='button'
              onClick={() => onNextProject(nextLabel)}
              className='pv-next-link'
            >
              {toTitleCase(nextLabel)}
            </button>
          </div>
        </div>

        <nav className='pv-nav' aria-label='Site'>
          <button type='button' onClick={onBack} aria-label='Quay lại'>
            ← Dự án
          </button>
          <a href='#studio'>Studio</a>
          <a href='#contact'>Liên hệ</a>
        </nav>
      </aside>

      <section className='pv-right' key={title}>
        {data.images.map((img, i) => (
          <img
            key={img.src}
            src={img.src}
            alt={img.alt}
            width={img.w}
            height={img.h}
            loading={i === 0 ? 'eager' : 'lazy'}
            className='pv-img'
          />
        ))}
        {/* Sentinel — when in view, user has reached the last image,
            swap body ↔ next-project panel. */}
        <div ref={sentinelRef} className='pv-sentinel' aria-hidden />
      </section>
    </div>
  );
}
