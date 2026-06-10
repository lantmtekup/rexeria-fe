import type { Metadata } from 'next';
import Link from 'next/link';
import { Check } from 'lucide-react';

import { FaqAccordion, REXER_FAQ } from '@/components/landing/FaqAccordion';
import { StartProjectCta } from '@/components/landing/StartProjectCta';

export const metadata: Metadata = {
  title: 'About us — ReXeR Studio',
  description:
    'We’re a team of designers, developers, and strategists bringing bold ideas to life with purpose, passion, and unforgettable execution.',
};

const img = (id: string) => `/landing/images/${id}`;

/** Dải collage 9 ảnh dưới hero — đúng asset từ site gốc. */
const COLLAGE = [
  'GVz3eIVZ9kPUuAqOX8tNOjlMgc.png',
  'NlmlZadmRM0DV3exlXz89TlETE.png',
  '1vA3arZ7vkPIHudPBPFDFmyHT5I.jpg',
  'molYQqrp3UNlz3iBiqZNdHUwW8.jpg',
  'Ck82yYpbZuWQw9K3oQTHEySVslg.png',
  'AGMViNBycKRxxDygbwCYSpE.jpg',
  'y2Aggsem7eoBvcU1uduSbWrmIcI.png',
  'xldYUNMlf7XAF0gClUfcxWtyg.png',
  'G628VNJmuhTMBzLCRoCEf1eXjM.png',
];

const TEAM = [
  { name: 'Hai Dang', role: 'CX Manager', photo: 'jtR1zf9Nly45hX70fpoemEX5hh0.jpg' },
  { name: 'Hong Ngo', role: 'Branding Strategist', photo: 'GhOBdI12buFfPMM3kUtJKxA1zAY.jpg' },
  { name: 'Yann Vo', role: 'BD Manager', photo: 'O7sTkDacFTXtPPFYoyzvFOLhciA.jpeg' },
];

const GOAL_POINTS = [
  'Clear and focused strategy',
  'Design that drives impact',
  'Collaboration without the chaos',
  'Outcomes that build momentum',
  'Smart solutions, tailored for you',
];

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section className='relative mx-auto max-w-6xl overflow-visible px-6 pt-20 pb-12 sm:pt-28'>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={img('oT5iCekJTWft1yPozCYLHeeXMg.svg')}
          alt=''
          aria-hidden
          className='pointer-events-none absolute top-0 right-0 -z-10 w-[55%] opacity-60 select-none'
        />
        <h1 className='max-w-4xl text-4xl font-semibold tracking-tight text-neutral-900 sm:text-6xl lg:text-7xl'>
          Crafting digital <em className='font-serif font-light'>Touchpoints</em>
          <br className='hidden sm:block' /> into immersive experiences
        </h1>
        <p className='mt-8 max-w-xl text-lg text-neutral-600'>
          We’re a team of designers, developers, and strategists bringing bold
          ideas to life with purpose, passion, and unforgettable execution.
        </p>
        <Link
          href='/rexer/contact'
          className='mt-8 inline-flex h-10 items-center rounded-pill bg-neutral-950 px-6 text-sm font-medium text-white transition-transform hover:scale-105'
        >
          Get started
        </Link>
      </section>

      {/* Collage strip */}
      <section className='mx-auto grid max-w-7xl grid-cols-3 gap-2 px-2 sm:gap-3'>
        {COLLAGE.map(id => (
          <div key={id} className='aspect-[8/5] overflow-hidden rounded-xl bg-neutral-100'>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={img(id)} alt='' loading='lazy' className='h-full w-full object-cover' />
          </div>
        ))}
      </section>

      {/* Mission / Goal */}
      <section className='mx-auto max-w-6xl px-6 py-20'>
        <p className='text-sm text-neutral-500'>Not just another agency</p>
        <div className='mt-8 grid gap-10 md:grid-cols-[auto_1fr_1fr]'>
          <div className='w-full max-w-[300px] overflow-hidden rounded-2xl md:w-[260px]'>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={img('TTsTo0wcwlRf1SViii6nhG0DcR8.png')}
              alt='ReXeR Studio'
              loading='lazy'
              className='h-full w-full object-cover'
            />
          </div>
          <div>
            <h3 className='text-2xl font-semibold'>Our mission</h3>
            <p className='mt-4 leading-relaxed text-neutral-600'>
              To empower brands through bold design, strategic thinking, and
              digital experiences that inspire action and create lasting
              impact. To help businesses stand out through thoughtful branding
              and high-performance digital solutions rooted in creativity and
              clarity.
            </p>
            <p className='mt-6 text-neutral-600'>
              Every great project begins with a simple conversation — let’s
              start yours.
            </p>
            <Link
              href='/rexer/contact'
              className='mt-6 inline-flex h-10 items-center rounded-pill bg-neutral-950 px-6 text-sm font-medium text-white transition-transform hover:scale-105'
            >
              Meet our team
            </Link>
          </div>
          <div>
            <h3 className='text-2xl font-semibold'>Our goal</h3>
            <ul className='mt-4 space-y-3'>
              {GOAL_POINTS.map(p => (
                <li key={p} className='flex items-center gap-3'>
                  <Check className='size-5 shrink-0 text-neutral-900' />
                  <span className='text-neutral-700'>{p}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Wide image */}
      <section className='mx-auto max-w-7xl px-2'>
        <div className='overflow-hidden rounded-2xl'>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={img('kl8Mr1s4dfs7bGFUcTZEOlJhk.jpg')}
            alt=''
            loading='lazy'
            className='h-[320px] w-full object-cover sm:h-[480px]'
          />
        </div>
      </section>

      {/* Team banner */}
      <section className='mx-auto mt-16 max-w-7xl px-2'>
        <div className='relative overflow-hidden rounded-2xl'>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={img('f2NvgNRlcuKjsRHuUQLb4qV1f40.jpg')}
            alt=''
            loading='lazy'
            className='h-[420px] w-full object-cover'
          />
          <div className='absolute inset-0 flex items-end bg-gradient-to-t from-neutral-950/70 to-transparent p-8 sm:p-12'>
            <h2 className='text-4xl font-semibold tracking-tight text-white sm:text-6xl'>
              The team that <em className='font-serif font-light'>Builds</em>
              <br /> bold vision
            </h2>
          </div>
        </div>
      </section>

      {/* Team members */}
      <section className='mx-auto max-w-4xl px-6 py-16'>
        <div className='grid gap-6 sm:grid-cols-3'>
          {TEAM.map(m => (
            <div key={m.name}>
              <div className='aspect-[3/4] overflow-hidden rounded-2xl bg-neutral-100'>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img(m.photo)}
                  alt={m.name}
                  loading='lazy'
                  className='h-full w-full object-cover'
                />
              </div>
              <h3 className='mt-4 text-lg font-semibold'>{m.name}</h3>
              <p className='text-sm text-neutral-500'>{m.role}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className='mx-auto max-w-3xl px-6 py-16'>
        <p className='text-center text-sm text-neutral-500'>+ Have questions?</p>
        <h2 className='mt-4 text-center text-4xl font-semibold tracking-tight sm:text-6xl'>
          Find <em className='font-serif font-light'>The</em> answers
        </h2>
        <div className='mt-12'>
          <FaqAccordion items={REXER_FAQ} />
        </div>
      </section>

      <StartProjectCta />
    </>
  );
}
