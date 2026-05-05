'use client';

import Link from 'next/link';

import { MetricCard } from '@/components/molecules/MetricCard';
import { ProductCard } from '@/components/molecules/ProductCard';
import { SectionHeader } from '@/components/molecules/SectionHeader';
import { TemplateCard } from '@/components/molecules/TemplateCard';
import { useAppSelector } from '@/hooks/useRedux';
import { rexerApi } from '@/services/rexer/endpoints';
import { useRexer } from '@/services/rexer/use-rexer';

// Fallback mock data — shown if BE is unreachable or returns 401.
const MOCK_TEMPLATES = [
  { id: 't1', name: 'Delvaux', author: 'Devon J. Love', imageBg: '#f5f3ee' },
  {
    id: 't2',
    name: 'Lider',
    author: 'Anton French',
    imageBg: 'linear-gradient(135deg,#3a3a3a,#1a1a1a,#2b2b2b)',
  },
  { id: 't3', name: 'Beuter', author: 'Nickolas Barlow', imageBg: '#d7d7d7' },
];

const MOCK_PRODUCTS = [
  {
    id: 'p1',
    name: 'Superstar Shoes',
    price: '99.88 $',
    colors: [
      { hex: '#ffffff' },
      { hex: '#000000' },
      { hex: '#e53935' },
      { hex: '#1e4fff' },
    ],
    sizes: ['3.5 UK', '4 UK', '4.5 UK', '5 UK', '5.5 UK', '6 UK'],
  },
  {
    id: 'p2',
    name: 'Balenciaga Music | Britney Spears Series Oversized Zip-up Hoodie in Faded Black /blue',
    price: '1.493 $',
    colors: [{ hex: '#0f0f0f' }],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
  },
];

function Dashboard() {
  const summary = useRexer(() => rexerApi.dashboard.summary(), []);
  if (summary.loading) {
    return (
      <div className='mb-6 grid grid-cols-3 gap-3 md:grid-cols-6'>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className='bg-muted h-20 animate-pulse rounded-xl' />
        ))}
      </div>
    );
  }
  const d = summary.data;
  const num = (v: number | undefined | null) => (v ?? 0).toLocaleString();
  return (
    <div className='mb-6 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6'>
      <MetricCard label='Projects' value={d?.projects_total ?? 0} />
      <MetricCard label='Published' value={d?.published_projects ?? 0} />
      <MetricCard label='Active clients' value={d?.active_clients ?? 0} />
      <MetricCard label='Page views' value={num(d?.page_views)} />
      <MetricCard label='CTA clicks' value={num(d?.cta_clicks)} />
      <MetricCard label='CTR' value={`${((d?.ctr ?? 0) * 100).toFixed(2)}%`} />
    </div>
  );
}

export default function HomePage() {
  const user = useAppSelector(s => s.auth.user);
  // Cards on Home open the canvas editor at /canvas-templates/:id, so we
  // list canvas templates here (not /templates — a different entity with
  // no canvas editor route).
  const templates = useRexer(
    () => rexerApi.canvasTemplates.list({ is_active: true, limit: 6 }),
    []
  );
  // Section "Product" — dùng resource Product thật (BE thêm `thumbnail_url`
  // từ 2026-05). Trước đây vô tình lấy từ projects.list nên id click vào
  // dẫn `/product/{project_id}/information` → 404 (project_id không phải
  // product_id).
  const products = useRexer(() => rexerApi.products.list({ limit: 6 }), []);

  const templateItems = templates.data?.items?.length
    ? templates.data.items.slice(0, 6).map(t => ({
        id: t.id,
        name: t.name,
        author: `${t.width}×${t.height}`,
        imageSrc: t.thumbnail_url,
        imageBg: t.thumbnail_url ? undefined : '#f5f3ee',
      }))
    : MOCK_TEMPLATES;

  const productItems = products.data?.items?.length
    ? products.data.items.slice(0, 6).map(p => ({
        id: p.id,
        name: p.name,
        // Product schema không có giá — hiển thị status (draft/active/archived).
        price: p.status ?? 'draft',
        priceLabel: 'Status',
        imageSrc: p.thumbnail_url,
        imageBg: p.thumbnail_url ? undefined : '#f5f3ee',
        colors: p.colors ?? [],
        sizes: p.sizes ?? [],
      }))
    : MOCK_PRODUCTS;

  const greeting = user?.display_name
    ? `Hi, ${user.display_name} 👋`
    : 'Welcome to REXER';

  return (
    <div className='flex h-full flex-1 flex-col md:overflow-hidden'>
      <div className='mx-auto w-full max-w-[1400px] px-4 pt-4 md:px-6'>
        <div className='mb-4 flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between'>
          <h1 className='text-foreground text-xl font-semibold tracking-[-0.02em]'>
            {greeting}
          </h1>
          {user?.email && (
            <span className='text-content-muted text-xs'>{user.email}</span>
          )}
        </div>
        <Dashboard />
      </div>
      <div className='md:divide-border flex min-h-0 flex-1 flex-col md:flex-row md:divide-x md:overflow-hidden'>
        <section className='flex min-w-0 flex-1 flex-col px-4 md:overflow-y-auto md:px-6'>
          <SectionHeader
            title='Template'
            showAllHref='/template'
            showAllLabel='Show All'
          />
          <div className='flex flex-col gap-6 pb-10'>
            {templates.loading
              ? Array.from({ length: 2 }).map((_, i) => (
                  <div
                    key={i}
                    className='bg-muted h-48 animate-pulse rounded-xl'
                  />
                ))
              : templateItems.map(t => (
                  <Link
                    key={t.id}
                    href={`/canvas-templates/${t.id}`}
                    className='block'
                  >
                    <TemplateCard
                      name={t.name}
                      author={t.author}
                      imageSrc={'imageSrc' in t ? t.imageSrc : undefined}
                      imageBg={t.imageBg}
                    />
                  </Link>
                ))}
          </div>
        </section>
        <section className='flex min-w-0 flex-1 flex-col px-4 md:overflow-y-auto md:px-6'>
          <SectionHeader
            title='Product'
            showAllHref='/product'
            showAllLabel='Show All'
          />
          <div className='flex flex-col gap-4 pb-10'>
            {products.loading
              ? Array.from({ length: 2 }).map((_, i) => (
                  <div
                    key={i}
                    className='bg-muted h-48 animate-pulse rounded-xl'
                  />
                ))
              : productItems.map(p => {
                  const imageSrc =
                    'imageSrc' in p
                      ? (p.imageSrc as string | undefined)
                      : undefined;
                  const imageBg =
                    'imageBg' in p
                      ? (p.imageBg as string | undefined)
                      : undefined;
                  const priceLabel =
                    'priceLabel' in p
                      ? (p.priceLabel as string | undefined)
                      : undefined;
                  return (
                    <Link
                      key={p.id}
                      href={`/product/${p.id}/information`}
                      className='block'
                    >
                      <ProductCard
                        name={p.name}
                        price={p.price}
                        imageSrc={imageSrc}
                        imageBg={imageBg}
                        labels={priceLabel ? { price: priceLabel } : undefined}
                        colors={p.colors}
                        sizes={p.sizes}
                      />
                    </Link>
                  );
                })}
          </div>
        </section>
      </div>
    </div>
  );
}
