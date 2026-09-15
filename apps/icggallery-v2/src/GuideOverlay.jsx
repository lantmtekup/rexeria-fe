import { useEffect } from 'react';

// First-run "how to explore" guide — shows once after the user steps inside.
// Cream/serif styling to match the loading intro.
const STEPS = [
  {
    title: 'Scroll to move',
    desc: 'Scroll up or down to travel through the gallery space.',
    icon: (
      <svg
        viewBox='0 0 24 24'
        fill='none'
        stroke='currentColor'
        strokeWidth='1.4'
        strokeLinecap='round'
        strokeLinejoin='round'
      >
        <rect x='8' y='3' width='8' height='18' rx='4' />
        <path d='M12 7v3' />
        <path d='M12 16l-2-2.5M12 16l2-2.5' />
      </svg>
    ),
  },
  {
    title: 'Switch floors',
    desc: 'Use the buttons below to jump between floors.',
    icon: (
      <svg
        viewBox='0 0 24 24'
        fill='none'
        stroke='currentColor'
        strokeWidth='1.4'
        strokeLinecap='round'
        strokeLinejoin='round'
      >
        <path d='M3 18h6v-4h6v-4h6' />
        <path d='M3 18v-2M9 14v-2M15 10V8' />
      </svg>
    ),
  },
  {
    title: 'Tap the hotspots',
    desc: 'Open the dots in the scene for details about each surface.',
    icon: (
      <svg
        viewBox='0 0 24 24'
        fill='none'
        stroke='currentColor'
        strokeWidth='1.4'
        strokeLinecap='round'
        strokeLinejoin='round'
      >
        <circle cx='12' cy='12' r='3' />
        <circle cx='12' cy='12' r='8' opacity='0.4' />
      </svg>
    ),
  },
];

export default function GuideOverlay({ onClose }) {
  useEffect(() => {
    const onKey = e => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      role='dialog'
      aria-modal='true'
      aria-label='How to explore'
      onClick={onClose}
      className='fixed inset-0 z-[55] flex items-center justify-center bg-black/45 p-6 backdrop-blur-sm'
    >
      <div
        onClick={e => e.stopPropagation()}
        className='relative w-full max-w-md rounded-2xl p-8 text-center shadow-2xl sm:p-10'
        style={{
          background: 'linear-gradient(180deg,#f4efe4 0%,#ece5d5 100%)',
          color: '#2a2a26',
        }}
      >
        <button
          type='button'
          onClick={onClose}
          aria-label='Close guide'
          className='absolute top-3 right-3 grid h-9 w-9 place-items-center rounded-full text-neutral-700 transition-colors duration-200 hover:bg-black/10'
        >
          ✕
        </button>

        <p className='text-[11px] tracking-[0.32em] uppercase opacity-50'>
          Iris Ceramica Group
        </p>
        <h2
          className='mt-2 font-serif font-light'
          style={{ fontSize: 'clamp(22px,3.2vw,30px)' }}
        >
          How to explore
        </h2>

        <ul className='mt-7 space-y-5 text-left'>
          {STEPS.map(s => (
            <li key={s.title} className='flex items-start gap-4'>
              <span className='mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-full bg-black/[0.06] text-neutral-800 ring-1 ring-black/10'>
                <span className='block h-5 w-5'>{s.icon}</span>
              </span>
              <span>
                <span className='block text-[13px] font-medium tracking-wide'>
                  {s.title}
                </span>
                <span className='mt-0.5 block text-[12px] leading-relaxed opacity-65'>
                  {s.desc}
                </span>
              </span>
            </li>
          ))}
        </ul>

        <button
          type='button'
          onClick={onClose}
          className='mt-8 w-full rounded-full bg-neutral-900 px-8 py-3.5 text-[11px] font-medium tracking-[0.22em] text-neutral-50 uppercase transition-colors duration-300 hover:bg-neutral-700'
        >
          Tap to explore
        </button>
      </div>
    </div>
  );
}
