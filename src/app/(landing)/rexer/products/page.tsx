import type { Metadata } from 'next';
import Link from 'next/link';
import { Check } from 'lucide-react';

import { Button } from '@/components/atoms/button';

export const metadata: Metadata = {
  title: 'Products — Rexer',
  description:
    'Explore Rexer: page builder, product management, marketing, and analytics.',
};

const BLOCKS = [
  {
    title: 'Page builder',
    desc: 'Modern landing and microsite templates with drag-and-drop editing — no code required.',
    points: ['Industry templates', 'Unlimited customization', 'Mobile optimized'],
  },
  {
    title: 'Product management',
    desc: 'Keep all your products, images, and details in one place, synced across every page.',
    points: ['Flexible catalog', 'Realtime sync', 'Multi-brand support'],
  },
  {
    title: 'Marketing & insights',
    desc: 'Build campaigns, capture leads, and measure performance with visual reports.',
    points: ['Multi-channel campaigns', 'Realtime reports', 'AI suggestions'],
  },
];

export default function ProductPage() {
  return (
    <>
      <section className='border-b border-neutral-200 bg-neutral-50'>
        <div className='mx-auto max-w-3xl px-6 py-20 text-center'>
          <h1 className='text-4xl font-semibold tracking-tight sm:text-5xl'>
            One platform, every tool
          </h1>
          <p className='mt-6 text-lg text-neutral-600'>
            Everything a brand needs to build, run, and grow — neatly bundled in
            Rexer.
          </p>
        </div>
      </section>

      <div className='mx-auto max-w-6xl px-6 py-16'>
        {BLOCKS.map((b, i) => (
          <div
            key={b.title}
            className={`grid items-center gap-10 py-12 md:grid-cols-2 ${
              i % 2 === 1 ? 'md:[&>*:first-child]:order-2' : ''
            }`}
          >
            <div>
              <h2 className='text-2xl font-semibold tracking-tight'>
                {b.title}
              </h2>
              <p className='mt-4 text-neutral-600'>{b.desc}</p>
              <ul className='mt-6 space-y-3'>
                {b.points.map(p => (
                  <li key={p} className='flex items-center gap-3 text-sm'>
                    <Check className='size-5 shrink-0 text-primary' />
                    <span className='text-neutral-700'>{p}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className='aspect-[4/3] rounded-3xl border border-neutral-200 bg-gradient-to-br from-neutral-100 to-neutral-50' />
          </div>
        ))}
      </div>

      <section className='border-t border-neutral-200'>
        <div className='mx-auto max-w-3xl px-6 py-20 text-center'>
          <h2 className='text-3xl font-semibold tracking-tight'>
            Try Rexer today
          </h2>
          <Button asChild variant='pill' size='lg' className='mt-8'>
            <Link href='/sign-in'>Get started free</Link>
          </Button>
        </div>
      </section>
    </>
  );
}
