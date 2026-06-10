import type { Metadata } from 'next';

import { StartProjectCta } from '@/components/landing/StartProjectCta';

export const metadata: Metadata = {
  title: 'Projects — ReXeR Studio',
  description:
    'Explore our projects: curated content microsites, immersive product experiences, and interactive showcases.',
};

const img = (id: string) => `https://framerusercontent.com/images/${id}`;

interface Project {
  name: string;
  kind: string;
  tags: string[];
  cover: string;
}

/** 4 project cards — copy + asset từ site gốc. */
const PROJECTS: Project[] = [
  {
    name: 'Belgo',
    kind: 'Curated Content - Microsite',
    tags: ['Curated Content', 'F&B'],
    cover: 'yOY9BjQp71irIABOobzzKsTSFE.png',
  },
  {
    name: 'IWC Schafhausen',
    kind: 'Immersive Product Experience',
    tags: ['Product Experience', 'Fashion Accessories'],
    cover: 'm23TtwrdgSQLx9n3aRXoyPHDmEQ.jpg',
  },
  {
    name: 'Eleve',
    kind: 'Curated Content',
    tags: ['Curated Content', 'Real Estate'],
    cover: 'nKF4R8yfFbbFDJ8KxYZRn7wkF04.png',
  },
  {
    name: 'Rolex',
    kind: 'Product Showcase',
    tags: ['Product Showcase', 'Luxury'],
    cover: 'F7XaGU1O1OqRY4FvUxtXQs4b820.jpeg',
  },
];

export default function ProjectsPage() {
  return (
    <>
      {/* Hero */}
      <section className='mx-auto max-w-4xl px-6 pt-20 pb-14 text-center sm:pt-28'>
        <h1 className='text-5xl font-semibold tracking-tight text-neutral-900 sm:text-7xl'>
          Explore <em className='font-serif font-light'>Our</em> projects
        </h1>
      </section>

      {/* Grid 2×2 */}
      <section className='mx-auto grid max-w-7xl gap-6 px-4 pb-20 sm:grid-cols-2'>
        {PROJECTS.map(p => (
          <article key={p.name} className='group'>
            <div className='relative overflow-hidden rounded-2xl'>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img(p.cover)}
                alt={p.name}
                loading='lazy'
                className='aspect-[16/10] w-full object-cover transition-transform duration-500 group-hover:scale-105'
              />
              <div className='absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-neutral-950/70 via-transparent to-transparent p-6'>
                <h3 className='text-3xl font-semibold text-white sm:text-4xl'>
                  {p.name}
                </h3>
                <p className='mt-1 font-serif text-lg font-light text-white/80 italic'>
                  {p.kind}
                </p>
              </div>
            </div>
            <div className='mt-3 flex items-center gap-2'>
              {p.tags.map(t => (
                <span
                  key={t}
                  className='rounded-pill border border-neutral-300 px-3 py-1 text-xs text-neutral-600'
                >
                  {t}
                </span>
              ))}
              <span className='ml-auto text-sm text-neutral-500'>
                View details
              </span>
            </div>
          </article>
        ))}
      </section>

      <StartProjectCta />
    </>
  );
}
