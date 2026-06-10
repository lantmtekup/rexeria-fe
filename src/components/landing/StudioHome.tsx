'use client';

import Link from 'next/link';
import { useState } from 'react';
import { motion, useReducedMotion, type Variants } from 'framer-motion';

import { cn } from '@/lib/cn';

// Assets self-host trong public/landing (serve qua Vercel CDN khi deploy).
const vid = (id: string) => `/landing/videos/${id}.mp4`;
const img = (id: string) => `/landing/images/${id}`;

const SERVICES = [
  {
    no: '(01)',
    name: 'Curated Content Experience',
    desc: 'Curated Content Experiences at ReXeR are more than scrolling pages—they are immersive narratives that guide audiences through a brand’s story with intention and elegance. Unlike traditional static content, curated experiences weave design, motion, and interactivity into a seamless flow, keeping customers engaged from the first scroll to the final call-to-action. This approach transforms exploration into connection, elevates conversion, and builds trust by giving every brand moment the polish and depth of a luxury experience—something only ReXeR crafts with such precision',
  },
  { no: '(02)', name: 'Smart Ads', desc: '' },
  { no: '(03)', name: 'Immersive Product Experience', desc: '' },
  { no: '(04)', name: 'Creative campaigns', desc: '' },
];

const CHIPS = [
  'Capture Attention',
  'Brand Trust & Prestige',
  'Simplify Complex Stories',
  'Higher Conversion',
];

const PROJECTS = [
  { name: 'Belgo', kind: 'Curated Content - Microsite', tags: ['Curated Content', 'F&B'], cover: 'yOY9BjQp71irIABOobzzKsTSFE.png' },
  { name: 'IWC Schafhausen', kind: 'Immersive Product Experience', tags: ['Product Experience', 'Fashion Accessories'], cover: 'm23TtwrdgSQLx9n3aRXoyPHDmEQ.jpg' },
  { name: 'Eleve', kind: 'Curated Content', tags: ['Curated Content', 'Real Estate'], cover: 'nKF4R8yfFbbFDJ8KxYZRn7wkF04.png' },
  { name: 'Rolex', kind: 'Product Showcase', tags: ['Product Showcase', 'Luxury'], cover: 'F7XaGU1O1OqRY4FvUxtXQs4b820.jpeg' },
];

const PROCESS = [
  {
    icon: '9pSg9VbHyOzgvjgKg8ZxafAC9Y.svg',
    title: 'Discover & Map',
    desc: 'We begin by diving into your brand, audience, and objectives. Together, we identify the critical digital touchpoints and customer journeys that matter most—mapping where immersive experiences will create the highest impact.',
  },
  {
    icon: 'FKdtn2NzI19PvdqikGNTBvGO8M.svg',
    title: 'Design & Orchestrate',
    desc: 'With clarity in place, we design stunning, interactive modules—Smart Ads, Curated Content, Immersive Product Views, and Campaign Microsites. Each element is orchestrated with precision to align with your brand identity and campaign goals, ensuring both creativity and conversion.',
  },
  {
    icon: 'Q7x7MuONdp0b9SNGrEqqnmMw.svg',
    title: 'Launch & Grow',
    desc: 'We bring your campaign to life across channels, then track every interaction to measure engagement and conversion. Insights fuel rapid optimization, ensuring your brand continuously grows trust, performance, and prestige in the digital space.',
  },
];

const STATS = [
  { value: '17', label: 'Increase in dwell time' },
  { value: '75', label: 'Increase in engagement and attentive seconds' },
  { value: '70', label: 'Increase in Traffic Quality' },
  { value: '24', label: 'Increase in Purchase Intent' },
];

const TEAM = [
  { name: 'Hai Dang', role: 'Creative Director', photo: 'wzkhisN82qguVuM3hGrCiyodzw.jpg' },
  { name: 'Yann Vo', role: 'BD Director', photo: 'O7sTkDacFTXtPPFYoyzvFOLhciA.jpeg' },
];

const POSTS = [
  { date: 'Oct 7, 2025', read: '2 min read', title: 'Curated Content: Why Content Alone No Longer Converts', cover: 'os0YZ4NU1PpgjeW8UTGGrpESKgg.jpeg' },
  { date: 'Jun 21, 2025', read: '2 min read', title: '4 Luxury Case Studies That Prove Interactive Experiences Convert', cover: '5OdaKpBzT1Ec8ofg9rNecDygZ4.webp' },
  { date: 'Jun 12, 2025', read: '4 min read', title: 'Why 2026 Will Belong to Experience-First Brands', cover: 'EITi5QTOPWfDXwQq1KDpx3O7xtc.jpeg' },
];

const pillBtn =
  'inline-flex h-10 items-center rounded-pill px-6 text-sm font-medium transition-transform hover:scale-105';

function PhoneVideo({ video }: { video: string }) {
  return (
    <div className='relative mx-auto aspect-[300/605] w-full max-w-[260px]'>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={img('ey6Ro3H5JCgs2C9qMC6EfKlgD9s.png')}
        alt=''
        aria-hidden
        className='pointer-events-none absolute inset-0 z-0 h-full w-full select-none'
      />
      <video
        className='absolute z-10 object-cover'
        style={{ top: '2.3%', left: '5.4%', width: '89.2%', height: '95.4%', borderRadius: '34px' }}
        src={vid(video)}
        autoPlay
        muted
        loop
        playsInline
        preload='metadata'
      />
    </div>
  );
}

export function StudioHome() {
  const reduce = useReducedMotion();
  const [openService, setOpenService] = useState(0);
  const [slide, setSlide] = useState(0);

  const reveal: Variants = {
    hidden: { opacity: 0, y: reduce ? 0 : 28 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
  };

  return (
    <>
      {/* ── Hero (dark, video bg) ─────────────────────────── */}
      <section className='relative isolate min-h-[92vh] overflow-hidden bg-neutral-950 text-white'>
        <video
          className='absolute inset-0 -z-10 h-full w-full object-cover opacity-60'
          src={vid('aMrf9JGU3yYdb6750VEo3fjjEY')}
          autoPlay
          muted
          loop
          playsInline
          preload='metadata'
          aria-hidden
        />
        <div className='mx-auto flex min-h-[92vh] max-w-7xl flex-col justify-between px-6 pt-16 pb-12'>
          <motion.h1
            initial='hidden'
            animate='show'
            variants={reveal}
            className='leading-none font-semibold tracking-tight'
          >
            <span className='block text-[19vw] sm:text-[11rem] lg:text-[13rem]'>ReXeR</span>
            <span className='mt-2 block text-center font-light tracking-[0.35em] text-[10vw] sm:text-[6rem] lg:text-[7rem]'>
              STUDIO
            </span>
          </motion.h1>
          <div className='grid items-end gap-10 md:grid-cols-2'>
            <ul className='space-y-2'>
              {SERVICES.map(s => (
                <li
                  key={s.no}
                  className='flex items-baseline justify-between border-b border-white/15 pb-2 text-lg sm:text-xl'
                >
                  <span>{s.name}</span>
                  <span className='font-serif text-white/60 italic'>{s.no}</span>
                </li>
              ))}
            </ul>
            <div className='md:text-right'>
              <p className='ml-auto max-w-md text-lg text-white/80'>
                From content chaos to customer conversion: we craft immersive,
                interactive experiences for your brand digital touchpoints.
              </p>
              <Link
                href='/rexer/contact'
                className={cn(pillBtn, 'mt-6 bg-white text-neutral-950')}
              >
                Let’s work together
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Inside the Studio ─────────────────────────────── */}
      <section className='mx-auto max-w-6xl px-6 py-20 sm:py-28'>
        <p className='text-sm text-neutral-500'>+ Inside the Studio</p>
        <div className='mt-10 grid items-center gap-12 md:grid-cols-2'>
          <div className='overflow-hidden rounded-3xl'>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={img('YtKu2KtnJg55xSb6Eje2P55SnRw.png')}
              alt=''
              loading='lazy'
              className='aspect-square w-full max-w-[520px] object-cover'
            />
          </div>
          <div>
            <Link
              href='/rexer/contact'
              className='group block rounded-2xl border border-neutral-200 p-6 transition-colors hover:bg-neutral-50'
            >
              <span className='text-lg font-medium'>Discuss your project</span>
              <span className='ml-2 text-neutral-400 transition-transform group-hover:translate-x-1'>
                +
              </span>
              <p className='mt-1 text-sm text-neutral-500'>Connect with Us</p>
            </Link>
            <p className='mt-8 text-lg leading-relaxed text-neutral-700'>
              We’re not just designers or developers — we’re storytellers,
              problem-solvers, and brand builders. Blending bold creativity
              with strategy, we craft experiences that connect, convert, and
              stand out in a crowded digital world.
            </p>
            <Link
              href='/rexer/projects'
              className={cn(pillBtn, 'mt-8 bg-neutral-950 text-white')}
            >
              View our work
            </Link>
          </div>
        </div>
      </section>

      {/* ── Solutions that Drive results (dark) ───────────── */}
      <section className='relative isolate overflow-hidden bg-neutral-950 text-white'>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={img('f2NvgNRlcuKjsRHuUQLb4qV1f40.jpg')}
          alt=''
          aria-hidden
          className='absolute inset-0 -z-20 h-full w-full object-cover opacity-50'
        />
        <div className='absolute inset-0 -z-10 bg-neutral-950/60' />
        <div className='mx-auto max-w-6xl px-6 py-20 sm:py-28'>
          <p className='text-sm text-white/60'>+ What we craft</p>
          <motion.h2
            initial='hidden'
            whileInView='show'
            viewport={{ once: true, amount: 0.5 }}
            variants={reveal}
            className='mt-4 text-4xl font-semibold tracking-tight sm:text-6xl'
          >
            Solutions that <em className='font-serif font-light'>Drive</em> results
          </motion.h2>

          <div className='mt-14 grid gap-12 lg:grid-cols-[1.4fr_1fr]'>
            <div>
              {SERVICES.map((s, i) => {
                const isOpen = openService === i;
                return (
                  <div key={s.no} className='border-b border-white/15'>
                    <button
                      type='button'
                      onClick={() => setOpenService(i)}
                      aria-expanded={isOpen}
                      className='flex w-full items-baseline justify-between py-5 text-left'
                    >
                      <span className='text-xl font-medium sm:text-2xl'>{s.name}</span>
                      <span className='font-serif text-2xl text-white/50 italic'>{s.no}</span>
                    </button>
                    {isOpen && s.desc && (
                      <p className='pb-6 text-sm leading-relaxed text-white/70'>{s.desc}</p>
                    )}
                  </div>
                );
              })}
              <div className='mt-8 flex flex-wrap gap-2'>
                {CHIPS.map(c => (
                  <span
                    key={c}
                    className='rounded-pill border border-white/25 px-4 py-1.5 text-sm text-white/80'
                  >
                    {c}
                  </span>
                ))}
              </div>
            </div>
            <PhoneVideo video='uiGZzAG77icYKQfVtwqa6DkKrKI' />
          </div>

          <p className='mx-auto mt-20 max-w-3xl text-center text-2xl font-medium sm:text-3xl'>
            Together, we build impactful experiences, lasting relationships,
            and digital solutions that move businesses forward.
          </p>
        </div>
      </section>

      {/* ── Ideas & Execution ─────────────────────────────── */}
      <section className='mx-auto max-w-6xl px-6 py-20 sm:py-28'>
        <p className='text-sm text-neutral-500'>+ Our Expertise</p>
        <h2 className='mt-6 leading-none font-semibold tracking-tight'>
          <span className='block text-6xl sm:text-8xl'>Ideas</span>
          <span className='mt-2 flex items-center gap-4'>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={img('KdLcdCL2Vd3YlK7sv90RzDRRBy0.svg')}
              alt='&'
              className='h-16 w-auto sm:h-24'
            />
            <span className='text-6xl sm:text-8xl'>Execution</span>
          </span>
        </h2>
        <p className='mt-10 max-w-2xl text-lg leading-relaxed text-neutral-600'>
          At ReXeR Studio, we transform ambitious ideas into precise execution.
          Every project begins with bold creativity and is carried through with
          technical excellence, ensuring experiences that don’t just
          inspire—but perform. By blending imagination with rigor, we deliver
          results that elevate engagement, drive conversions, and strengthen
          brand trust.
        </p>
      </section>

      {/* ── Projects slider ───────────────────────────────── */}
      <section className='relative isolate overflow-hidden bg-neutral-950 text-white'>
        {PROJECTS.map((p, i) => (
          <div key={p.name} className={cn('relative', i === slide ? 'block' : 'hidden')}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={img(p.cover)}
              alt={p.name}
              className='h-[70vh] w-full object-cover'
            />
            <div className='absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-neutral-950/80 via-transparent to-transparent p-8 sm:p-14'>
              <h3 className='text-5xl font-semibold sm:text-7xl'>{p.name}</h3>
              <p className='mt-2 font-serif text-2xl font-light text-white/80 italic sm:text-4xl'>
                {p.kind}
              </p>
              <div className='mt-6 flex flex-wrap items-center gap-2'>
                {p.tags.map(t => (
                  <span
                    key={t}
                    className='rounded-pill border border-white/30 px-3 py-1 text-xs text-white/80'
                  >
                    {t}
                  </span>
                ))}
                <span className='ml-auto flex items-center gap-6 text-sm text-white/70'>
                  <span>
                    {String(i + 1).padStart(2, '0')} / {String(PROJECTS.length).padStart(2, '0')}
                  </span>
                  <Link href='/rexer/projects' className='underline-offset-4 hover:underline'>
                    View project
                  </Link>
                </span>
              </div>
            </div>
          </div>
        ))}
        {/* slider controls */}
        <div className='absolute top-6 right-6 flex gap-2'>
          <button
            type='button'
            aria-label='Previous project'
            onClick={() => setSlide(s => (s - 1 + PROJECTS.length) % PROJECTS.length)}
            className='flex size-10 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur transition hover:bg-white/30'
          >
            ←
          </button>
          <button
            type='button'
            aria-label='Next project'
            onClick={() => setSlide(s => (s + 1) % PROJECTS.length)}
            className='flex size-10 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur transition hover:bg-white/30'
          >
            →
          </button>
        </div>
      </section>

      {/* ── Process ───────────────────────────────────────── */}
      <section className='mx-auto max-w-6xl px-6 py-20 sm:py-28'>
        <p className='text-sm text-neutral-500'>+ From concept to launch</p>
        <h2 className='mt-4 max-w-3xl text-4xl font-semibold tracking-tight sm:text-6xl'>
          Your ideas transform into{' '}
          <em className='font-serif font-light'>Brand</em> stories
        </h2>
        <div className='mt-14 grid gap-10 md:grid-cols-3'>
          {PROCESS.map(step => (
            <motion.div
              key={step.title}
              initial='hidden'
              whileInView='show'
              viewport={{ once: true, amount: 0.3 }}
              variants={reveal}
              className='rounded-3xl border border-neutral-200 p-8'
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img(step.icon)} alt='' aria-hidden className='size-20' loading='lazy' />
              <h3 className='mt-6 text-xl font-semibold'>{step.title}</h3>
              <p className='mt-3 text-sm leading-relaxed text-neutral-600'>{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Stats (dark) ──────────────────────────────────── */}
      <section className='relative isolate overflow-hidden bg-neutral-950 text-white'>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={img('In71mAHWVZuNR2BJ9rDchD2cgQ.svg')}
          alt=''
          aria-hidden
          className='pointer-events-none absolute -left-40 top-10 -z-10 w-[60%] opacity-30 select-none'
        />
        <div className='mx-auto max-w-6xl px-6 py-20 sm:py-28'>
          <p className='text-sm text-white/60'>+ Verified Performance</p>
          <div className='mt-8 grid gap-12 lg:grid-cols-2'>
            <h2 className='text-5xl leading-tight font-semibold tracking-tight sm:text-6xl'>
              Higher Attention
              <br />
              <em className='font-serif font-light'>Better</em> Outcome
            </h2>
            <div>
              {STATS.map(s => (
                <div
                  key={s.label}
                  className='flex items-baseline justify-between gap-6 border-b border-white/15 py-5'
                >
                  <span className='text-6xl font-semibold sm:text-7xl'>{s.value}</span>
                  <span className='text-right text-white/70'>{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Creative partners ─────────────────────────────── */}
      <section className='relative isolate overflow-hidden bg-neutral-950 text-white'>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={img('BNyEGHOjzbvau59YfnNhqzfc.png')}
          alt=''
          aria-hidden
          className='absolute inset-0 -z-20 h-full w-full object-cover opacity-50'
        />
        <div className='absolute inset-0 -z-10 bg-neutral-950/55' />
        <div className='mx-auto max-w-6xl px-6 py-20 sm:py-28'>
          <p className='text-sm text-white/60'>+ Talent with purpose</p>
          <div className='mt-6 grid items-start gap-12 lg:grid-cols-[1.2fr_1fr]'>
            <div>
              <h2 className='text-5xl font-semibold tracking-tight sm:text-7xl'>
                We’re your
                <br />
                <em className='font-serif font-light'>Creative</em> partners
              </h2>
              <p className='mt-10 max-w-md text-lg text-white/80'>
                We’re a creative team that values purposeful design, open
                collaboration, and work that truly makes an impact.
              </p>
              <Link
                href='/rexer/about'
                className={cn(pillBtn, 'mt-8 bg-white text-neutral-950')}
              >
                Know more about us
              </Link>
            </div>
            <div className='grid grid-cols-2 gap-4'>
              {TEAM.map(m => (
                <div key={m.name}>
                  <div className='aspect-[2/3] overflow-hidden rounded-2xl bg-white/10'>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={img(m.photo)}
                      alt={m.name}
                      loading='lazy'
                      className='h-full w-full object-cover'
                    />
                  </div>
                  <h3 className='mt-3 font-semibold'>{m.name}</h3>
                  <p className='text-sm text-white/60'>{m.role}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Blog journal ──────────────────────────────────── */}
      <section className='mx-auto max-w-6xl px-6 py-20 sm:py-28'>
        <p className='text-sm text-neutral-500'>+ Insights & Inspiration</p>
        <div className='mt-6 grid items-start gap-12 lg:grid-cols-[1fr_1.2fr]'>
          <div>
            <h2 className='text-5xl font-semibold tracking-tight sm:text-7xl'>
              Explore our
              <br />
              <em className='font-serif font-light'>Latest</em> journal
            </h2>
            {/* TODO: blog page chưa có — gắn link khi clone blog. */}
            <span className={cn(pillBtn, 'mt-8 cursor-default bg-neutral-950 text-white')}>
              View all blogs
            </span>
          </div>
          <div className='divide-y divide-neutral-200'>
            {POSTS.map(post => (
              <article key={post.title} className='flex items-center gap-6 py-5'>
                <div className='min-w-0 flex-1'>
                  <p className='text-xs text-neutral-400'>
                    {post.date} · {post.read}
                  </p>
                  <h3 className='mt-1 truncate text-lg font-medium sm:whitespace-normal'>
                    {post.title}
                  </h3>
                </div>
                <div className='w-36 shrink-0 overflow-hidden rounded-xl sm:w-44'>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img(post.cover)}
                    alt=''
                    loading='lazy'
                    className='aspect-[16/9] w-full object-cover'
                  />
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
