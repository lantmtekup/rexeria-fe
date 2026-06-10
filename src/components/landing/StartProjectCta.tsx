import { LetsWorkForm } from './LetsWorkForm';

const BG = 'https://framerusercontent.com/images/f2NvgNRlcuKjsRHuUQLb4qV1f40.jpg';

/** Section CTA "Start your Project today" — nền ảnh tối + form, clone từ site gốc. */
export function StartProjectCta() {
  return (
    <section className='relative isolate overflow-hidden'>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={BG}
        alt=''
        aria-hidden
        className='absolute inset-0 -z-10 h-full w-full object-cover'
      />
      <div className='absolute inset-0 -z-10 bg-neutral-950/60' />
      <div className='mx-auto max-w-6xl px-6 py-20 sm:py-28'>
        <p className='text-center text-sm text-white/70'>
          + Start the conversation today
        </p>
        <h2 className='mt-4 text-center text-4xl font-semibold tracking-tight text-white sm:text-6xl'>
          Start your <em className='font-serif font-light'>Project</em> today
        </h2>
        <div className='mx-auto mt-12 max-w-xl'>
          <LetsWorkForm />
        </div>
      </div>
    </section>
  );
}
