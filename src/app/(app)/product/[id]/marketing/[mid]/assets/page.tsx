import { use } from 'react';
import { Plus } from 'lucide-react';

import { MarketingDetailShell } from '@/components/modules/Product/MarketingDetailShell';
import { MARKETINGS } from '@/components/modules/Product/marketingMocks';

interface PageProps {
  params: Promise<{ id: string; mid: string }>;
}

type AssetKind = 'image' | 'video' | '3d';
const ASSET_ROWS: { key: AssetKind; label: string; uploadLabel: string }[] = [
  { key: 'image', label: 'Image', uploadLabel: 'Upload Image' },
  { key: 'video', label: 'Video', uploadLabel: 'Upload Video' },
  { key: '3d', label: '3D', uploadLabel: 'Upload 3D' },
];

function UploadTile({ label }: { label: string }) {
  return (
    <div className='text-foreground flex aspect-square w-32 shrink-0 flex-col items-center justify-center gap-2 rounded-lg bg-neutral-100 text-center text-xs font-semibold'>
      <svg
        viewBox='0 0 32 32'
        className='size-8'
        fill='none'
        stroke='currentColor'
        strokeWidth='1.6'
      >
        <rect x='4' y='6' width='24' height='20' rx='3' />
        <path d='M10 18l4-4 4 4 6-6' />
        <circle cx='22' cy='10' r='1.5' />
      </svg>
      {label}
    </div>
  );
}

export default function AssetsPage({ params }: PageProps) {
  const { id, mid } = use(params);
  return (
    <MarketingDetailShell
      basePath={`/product/${id}`}
      scope='product'
      productName='Samba OG Shoes'
      marketings={MARKETINGS}
      activeMarketingId={mid}
      activeSection='assets'
    >
      <div className='flex flex-col gap-6'>
        {ASSET_ROWS.map(row => (
          <div
            key={row.key}
            className='grid grid-cols-[160px_1fr] items-start gap-6'
          >
            <div className='text-foreground pt-2 text-sm font-semibold'>
              {row.label}
            </div>
            <div className='flex flex-col gap-3'>
              <div className='border-border bg-background rounded-xl border p-4'>
                <div className='flex gap-3 overflow-x-auto'>
                  <UploadTile label={row.uploadLabel} />
                  {/* placeholder thumbnails */}
                  {[1, 2, 3, 4].slice(0, row.key === '3d' ? 1 : 4).map(i => (
                    <div
                      key={i}
                      className='aspect-square w-32 shrink-0 rounded-lg bg-neutral-200'
                    />
                  ))}
                </div>
              </div>
              <button
                type='button'
                className='rounded-pill text-neutral-0 inline-flex h-8 w-fit cursor-pointer items-center gap-1 bg-neutral-900 px-3 text-xs font-semibold hover:bg-neutral-800'
              >
                <Plus className='size-3.5' /> Add folder
              </button>
            </div>
          </div>
        ))}
      </div>
    </MarketingDetailShell>
  );
}
