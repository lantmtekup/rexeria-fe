'use client';

import { motion, useReducedMotion, type Variants } from 'framer-motion';

const CDN = 'https://framerusercontent.com';
const vid = (id: string) => `${CDN}/assets/${id}.mp4`;
/** Real iPhone bezel PNG from the source site (transparent screen cutout). */
const PHONE_FRAME = `${CDN}/images/ey6Ro3H5JCgs2C9qMC6EfKlgD9s.png`;

const HERO_SUB =
  'ReXeR Studio transforms your digital assets into interactive experiences that engage deeper and convert smarter. Built once. Delivered everywhere. From scroll-based journeys to immersive product showcases and smart interactive ads, we craft modular experiences that work together across every touchpoint — driving awareness, engagement, and conversion.';

interface Section {
  label: string;
  /** Pill button shown under each phone (per-section label from the source site). */
  cta: string;
  /** [left, center, right] — center sits lower (staggered), matching the original. */
  videos: [string, string, string];
}

const SECTIONS: Section[] = [
  {
    label: 'Scroll-Based Curated Content',
    cta: 'Explore on mobile',
    videos: ['l0V8HAteitXNygFk8Y3am5zOkg', 'mpcDbQZZP3ipomLUlRxR3tF0cw', 'oBgevyH1PYfw0f80WuFNtryri7E'],
  },
  {
    label: 'Interactive Product Experience',
    cta: 'Visit site',
    videos: ['mpcDbQZZP3ipomLUlRxR3tF0cw', 'mb9lxvLdpsHhsE7uqDMNZZgUPEw', 'KMGrymsKGlEVYETp2Leh97XHQ'],
  },
  {
    label: 'Interactive Microsite',
    cta: 'Spotlight',
    videos: ['oBgevyH1PYfw0f80WuFNtryri7E', 'yez8FryTvCrXEzGt8hEJX2qjcYU', '47XNuuxK8R4AiENe1Pcdr21dIDc'],
  },
  {
    label: 'Dynamic Showcases',
    cta: 'Animated Display',
    videos: ['BKl4B3YdGnBmylNhxWugm1je5xM', 'aD5IPrBXJ3FOg4F3msKbbY0v1Y', 'L09S1s19KqUvOMpcbbbtkFbYLA'],
  },
  {
    label: 'Tap & Swipe Experiences',
    cta: 'Slider',
    videos: ['1avd434oreZgbK0q5ZDeTzYmpY', 'mb9lxvLdpsHhsE7uqDMNZZgUPEw', 'cZ6uQYuIiwocOrIiWdxJlE0S0hs'],
  },
];

/** Black pill CTA under each phone — matches source site (h-36px, white 14px
 *  label, ~34px below the phone). TODO: real destinations aren't exposed by
 *  the Framer SSR markup (client-side links) — wire hrefs when provided. */
function PhoneCta({ label }: { label: string }) {
  return (
    <div className='mt-8 flex justify-center'>
      <a
        href='#'
        onClick={e => e.preventDefault()}
        className='inline-flex h-9 items-center rounded-pill bg-neutral-950 px-5 text-sm text-white transition-transform duration-300 hover:scale-105'
      >
        {label}
      </a>
    </div>
  );
}

/** iPhone mockup: video clipped to the screen area, real bezel PNG on top. */
function Phone({ video, className }: { video: string; className?: string }) {
  return (
    <div
      className={`relative mx-auto aspect-[300/605] w-full max-w-[250px] ${className ?? ''}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={PHONE_FRAME}
        alt=''
        aria-hidden
        className='pointer-events-none absolute inset-0 z-0 h-full w-full select-none'
      />
      <video
        className='absolute z-10 object-cover'
        style={{
          top: '2.3%',
          left: '5.4%',
          width: '89.2%',
          height: '95.4%',
          borderRadius: '34px',
        }}
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

  const reveal: Variants = {
    hidden: { opacity: 0, y: reduce ? 0 : 28 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
    },
  };

  return (
    <>
      {/* Hero */}
      <section className='mx-auto max-w-4xl px-6 py-24 text-center sm:py-32'>
        <motion.h1
          initial='hidden'
          animate='show'
          variants={reveal}
          className='text-4xl font-semibold tracking-tight text-neutral-900 sm:text-6xl'
        >
          Your product deserves
          <br className='hidden sm:block' /> more than static content.
        </motion.h1>
        <motion.p
          initial='hidden'
          animate='show'
          variants={reveal}
          transition={{ delay: 0.1 }}
          className='mx-auto mt-8 max-w-2xl text-base leading-relaxed text-neutral-500'
        >
          {HERO_SUB}
        </motion.p>
      </section>

      {/* Showcase sections — 3 staggered phones each */}
      {SECTIONS.map(s => (
        <section key={s.label} className='mx-auto max-w-6xl px-6 py-10 sm:py-14'>
          <motion.h2
            initial='hidden'
            whileInView='show'
            viewport={{ once: true, amount: 0.6 }}
            variants={reveal}
            className='mb-10 text-center text-2xl font-semibold tracking-tight text-neutral-900'
          >
            {s.label}
          </motion.h2>
          <motion.div
            initial='hidden'
            whileInView='show'
            viewport={{ once: true, amount: 0.15 }}
            variants={{ show: { transition: { staggerChildren: 0.08 } } }}
            className='grid grid-cols-2 items-start gap-6 sm:grid-cols-3 sm:gap-10'
          >
            <motion.div variants={reveal}>
              <Phone video={s.videos[0]} />
              <PhoneCta label={s.cta} />
            </motion.div>
            <motion.div variants={reveal} className='sm:mt-28'>
              <Phone video={s.videos[1]} />
              <PhoneCta label={s.cta} />
            </motion.div>
            <motion.div
              variants={reveal}
              className='col-span-2 sm:col-span-1'
            >
              <Phone video={s.videos[2]} />
              <PhoneCta label={s.cta} />
            </motion.div>
          </motion.div>
        </section>
      ))}

      {/* CTA */}
      <section className='mt-12 bg-gradient-to-r from-[#0a1c38] via-[#1c3f74] to-[#c9a25b]'>
        <div className='mx-auto max-w-6xl px-6 py-24 text-center'>
          <motion.h2
            initial='hidden'
            whileInView='show'
            viewport={{ once: true, amount: 0.5 }}
            variants={reveal}
            className='text-4xl font-semibold tracking-tight text-white sm:text-6xl'
          >
            Engage. Experience. Elevate.
          </motion.h2>
          <p className='mt-6 text-sm text-white/70'>
            © 2025 ReXeR • Studio in Vietnam
          </p>
        </div>
      </section>
    </>
  );
}
