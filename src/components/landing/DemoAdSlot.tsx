'use client';

import { useSearchParams } from 'next/navigation';
import { useState } from 'react';

/**
 * Placeholder ad slots cho buổi demo với khách — hiện KHI VÀ CHỈ KHI URL có
 * `?ads_demo=1`, còn lại render null nên không ảnh hưởng trang thật.
 *
 * Mục đích: cho khách thấy TẤT CẢ các dạng quảng cáo AdSense sẽ nằm ở đâu và
 * chiếm chỗ thế nào TRƯỚC khi site được Google duyệt (trạng thái "Getting
 * ready" — Google chưa serve ads). Creative dùng ảnh có sẵn trong
 * public/landing/images với copy chung chung (không nhái brand thật nào),
 * mỗi slot vẫn giữ nhãn demo nhỏ phía trên + badge "Ad" trong khung. Khi site
 * được duyệt + bật Auto ads thì bỏ query param là demo biến mất.
 *
 * Các dạng mô phỏng (đủ bộ AdSense):
 * - Display: leaderboard 728×90, rectangle 300×250, half-page 300×600
 * - In-feed (chen trong grid projects) · In-article (giữa nội dung)
 * - Multiplex (lưới native)
 * - Auto-ads-only: Anchor (dính đáy), Side rails (mép desktop), Vignette
 *   (toàn màn hình — bấm nút preview)
 *
 * Mỗi usage phải bọc trong <Suspense> — useSearchParams bailout khi trang
 * còn lại là static.
 */

const img = (id: string) => `/landing/images/${id}`;

/* Ảnh lifestyle/sản phẩm — KHÔNG dùng ảnh chân dung team trong cùng thư mục. */
const AD_IMAGES = {
  shoes: img('1vA3arZ7vkPIHudPBPFDFmyHT5I.jpg'),
  vr: img('os0YZ4NU1PpgjeW8UTGGrpESKgg.jpeg'),
  beauty: img('molYQqrp3UNlz3iBiqZNdHUwW8.jpg'),
  tower: img('kl8Mr1s4dfs7bGFUcTZEOlJhk.jpg'),
};

const MULTIPLEX_ITEMS = [
  { cover: img('yOY9BjQp71irIABOobzzKsTSFE.png'), title: 'Taste the craft' },
  { cover: img('m23TtwrdgSQLx9n3aRXoyPHDmEQ.jpg'), title: 'Time, refined' },
  { cover: img('nKF4R8yfFbbFDJ8KxYZRn7wkF04.png'), title: 'Live elevated' },
  { cover: img('F7XaGU1O1OqRY4FvUxtXQs4b820.jpeg'), title: 'Icons on wrist' },
];

const useAdsDemoOn = () => {
  const searchParams = useSearchParams();
  return searchParams.get('ads_demo') === '1';
};

const Label = ({ text }: { text: string }) => (
  <p className='text-[10px] tracking-[0.14em] text-neutral-400 uppercase'>
    Advertisement · demo · {text}
  </p>
);

/** Badge "Ad" góc khung — như badge AdChoices của ads thật. */
const AdBadge = () => (
  <span className='absolute top-1.5 right-1.5 z-10 rounded-sm bg-black/55 px-1.5 py-0.5 text-[10px] leading-none font-medium text-white'>
    Ad
  </span>
);

type CreativeProps = {
  image: string;
  headline: string;
  cta?: string;
  /** Hàng ngang (leaderboard/anchor) xếp text cạnh ảnh thay vì đè lên ảnh. */
  horizontal?: boolean;
};

/** Creative mô phỏng: ảnh thật + headline + CTA, copy chung chung. */
const MockCreative = ({ image, headline, cta, horizontal }: CreativeProps) => {
  if (horizontal) {
    return (
      <div className='relative flex h-full w-full items-stretch bg-neutral-900'>
        <AdBadge />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={image}
          alt=''
          loading='lazy'
          className='h-full w-2/5 object-cover'
        />
        <div className='flex min-w-0 flex-1 items-center justify-between gap-3 px-4'>
          <p className='truncate text-sm font-semibold text-white sm:text-base'>
            {headline}
          </p>
          {cta && (
            <span className='shrink-0 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-neutral-900'>
              {cta}
            </span>
          )}
        </div>
      </div>
    );
  }
  return (
    <div className='relative h-full w-full'>
      <AdBadge />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={image}
        alt=''
        loading='lazy'
        className='absolute inset-0 h-full w-full object-cover'
      />
      <div className='absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-neutral-950/75 via-transparent to-transparent p-4'>
        <p className='text-sm font-semibold text-white sm:text-base'>
          {headline}
        </p>
        {cta && (
          <span className='mt-2 w-fit rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-neutral-900'>
            {cta}
          </span>
        )}
      </div>
    </div>
  );
};

/** Ô native cho lưới Multiplex — thumb + title như gợi ý nội dung thật. */
const MultiplexTile = ({ cover, title }: { cover: string; title: string }) => (
  <div className='relative overflow-hidden rounded-lg border border-neutral-200 bg-white'>
    <AdBadge />
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img
      src={cover}
      alt=''
      loading='lazy'
      className='aspect-[16/9] w-full object-cover'
    />
    <div className='p-2.5'>
      <p className='truncate text-xs font-medium text-neutral-800'>{title}</p>
      <p className='mt-0.5 text-[10px] text-neutral-400'>Sponsored</p>
    </div>
  </div>
);

type DemoAdSlotProps = {
  /**
   * `leaderboard` — banner ngang dưới hero (728×90 desktop / 320×100 mobile).
   * `infeed` — card nằm lẫn trong grid projects, cùng khung 16/10 với card thật.
   */
  variant: 'leaderboard' | 'infeed';
};

export const DemoAdSlot = ({ variant }: DemoAdSlotProps) => {
  const on = useAdsDemoOn();
  if (!on) return null;

  if (variant === 'leaderboard') {
    return (
      <div className='mx-auto flex max-w-7xl flex-col items-center gap-1.5 px-4 pb-14'>
        <Label text='display · leaderboard 728×90' />
        <div className='h-[100px] w-[320px] overflow-hidden rounded-lg sm:h-[90px] sm:w-[728px]'>
          <MockCreative
            image={AD_IMAGES.shoes}
            headline='Run further this season'
            cta='Shop now'
            horizontal
          />
        </div>
      </div>
    );
  }

  // infeed — cùng khối hình 16/10 + hàng label như một project card thật.
  return (
    <article>
      <div className='aspect-[16/10] w-full overflow-hidden rounded-2xl'>
        <MockCreative
          image={AD_IMAGES.vr}
          headline='Step into immersive retail'
          cta='Learn more'
        />
      </div>
      <div className='mt-3 flex items-center'>
        <Label text='in-feed' />
      </div>
    </article>
  );
};

/**
 * Khu trưng bày các dạng còn lại + các format overlay của Auto ads.
 * Đặt một lần ở cuối trang (trước CTA).
 */
export const DemoAdShowcase = () => {
  const on = useAdsDemoOn();
  const [anchorVisible, setAnchorVisible] = useState(true);
  const [vignetteVisible, setVignetteVisible] = useState(false);
  if (!on) return null;

  return (
    <>
      {/* ── In-article + Display rectangle / half-page ─────────────────── */}
      <section className='mx-auto max-w-7xl px-4 pb-16'>
        <div className='grid gap-6 lg:grid-cols-[1fr_320px]'>
          <div className='space-y-6'>
            {/* In-article: nằm giữa 2 "đoạn văn" giả để đúng ngữ cảnh */}
            <div className='space-y-2'>
              <div className='h-3 w-full rounded bg-neutral-100' />
              <div className='h-3 w-11/12 rounded bg-neutral-100' />
              <div className='h-3 w-4/5 rounded bg-neutral-100' />
            </div>
            <div className='space-y-1.5'>
              <Label text='in-article' />
              <div className='h-[200px] overflow-hidden rounded-lg'>
                <MockCreative
                  image={AD_IMAGES.beauty}
                  headline='Glow starts with great skin'
                  cta='Discover'
                  horizontal
                />
              </div>
            </div>
            <div className='space-y-2'>
              <div className='h-3 w-full rounded bg-neutral-100' />
              <div className='h-3 w-10/12 rounded bg-neutral-100' />
            </div>

            {/* Multiplex */}
            <div className='space-y-1.5 pt-4'>
              <Label text='multiplex' />
              <div className='grid grid-cols-2 gap-3 rounded-lg border border-neutral-200 p-3 sm:grid-cols-4'>
                {MULTIPLEX_ITEMS.map(m => (
                  <MultiplexTile
                    key={m.title}
                    cover={m.cover}
                    title={m.title}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Cột phải: rectangle 300×250 + half-page 300×600 */}
          <div className='flex flex-row gap-6 lg:flex-col'>
            <div className='space-y-1.5'>
              <Label text='display · 300×250' />
              <div className='h-[250px] w-[300px] overflow-hidden rounded-lg'>
                <MockCreative
                  image={AD_IMAGES.beauty}
                  headline='Skincare, simplified'
                  cta='Shop now'
                />
              </div>
            </div>
            <div className='hidden space-y-1.5 sm:block'>
              <Label text='display · 300×600' />
              <div className='h-[600px] w-[300px] overflow-hidden rounded-lg'>
                <MockCreative
                  image={AD_IMAGES.tower}
                  headline='Architecture that moves'
                  cta='Explore'
                />
              </div>
            </div>
          </div>
        </div>

        {/* Nút preview vignette — format toàn màn hình không thể "nằm" sẵn */}
        <button
          type='button'
          onClick={() => setVignetteVisible(true)}
          className='rounded-pill mt-8 border border-neutral-300 px-4 py-2 text-sm text-neutral-600 transition-colors hover:bg-neutral-100'
        >
          Preview vignette ad (full-screen format)
        </button>
      </section>

      {/* ── Side rails — chỉ desktop rộng, dính 2 mép ──────────────────── */}
      <div className='fixed top-1/2 left-2 z-40 hidden -translate-y-1/2 min-[1560px]:block'>
        <div className='h-[600px] w-[160px] overflow-hidden rounded-lg shadow-lg'>
          <MockCreative image={AD_IMAGES.tower} headline='Rise above' />
        </div>
      </div>
      <div className='fixed top-1/2 right-2 z-40 hidden -translate-y-1/2 min-[1560px]:block'>
        <div className='h-[600px] w-[160px] overflow-hidden rounded-lg shadow-lg'>
          <MockCreative image={AD_IMAGES.shoes} headline='New drop' />
        </div>
      </div>

      {/* ── Anchor — bar dính đáy màn hình, có nút đóng như thật ───────── */}
      {anchorVisible && (
        <div className='fixed inset-x-0 bottom-0 z-50 border-t border-neutral-300 bg-white shadow-[0_-4px_16px_rgba(0,0,0,0.08)]'>
          <button
            type='button'
            onClick={() => setAnchorVisible(false)}
            aria-label='Close anchor ad demo'
            className='absolute -top-6 right-4 rounded-t-md border border-b-0 border-neutral-300 bg-white px-3 text-sm text-neutral-500'
          >
            ✕
          </button>
          <div className='mx-auto h-[60px] max-w-3xl'>
            <MockCreative
              image={AD_IMAGES.shoes}
              headline='Run further this season'
              cta='Shop now'
              horizontal
            />
          </div>
        </div>
      )}

      {/* ── Vignette — overlay toàn màn hình, bấm nút mới hiện ─────────── */}
      {vignetteVisible && (
        <div className='fixed inset-0 z-[60] flex flex-col items-center justify-center bg-neutral-950/80 p-6'>
          <div className='w-full max-w-md overflow-hidden rounded-2xl bg-white'>
            <div className='h-[420px]'>
              <MockCreative
                image={AD_IMAGES.vr}
                headline='The future of shopping is immersive'
                cta='Learn more'
              />
            </div>
            <button
              type='button'
              onClick={() => setVignetteVisible(false)}
              className='w-full border-t border-neutral-200 py-3 text-sm font-medium text-neutral-600'
            >
              Close ✕
            </button>
          </div>
          <p className='mt-3 text-xs text-white/70'>
            Vignette hiện toàn màn hình giữa các lần chuyển trang
          </p>
        </div>
      )}
    </>
  );
};
