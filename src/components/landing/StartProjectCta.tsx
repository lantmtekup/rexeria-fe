import { LetsWorkForm } from './LetsWorkForm';

/** Section CTA "Start your Project today" — nền VIDEO (núi tuyết) như site gốc. */
export function StartProjectCta() {
  return (
    <section className='relative isolate overflow-hidden'>
      <video
        className='absolute inset-0 -z-10 h-full w-full object-cover'
        src='/landing/videos/wK0lTAixkj4MhH5bPUKaMl00t08.mp4'
        autoPlay
        muted
        loop
        playsInline
        preload='metadata'
        aria-hidden
      />
      <div className='absolute inset-0 -z-10 bg-neutral-950/50' />
      <div className='mx-auto max-w-6xl px-6 py-20 sm:py-28'>
        <p className='text-center text-sm text-white/70'>
          ✦ Start the conversation today
        </p>
        <h2 className='mt-4 text-center text-4xl font-semibold tracking-tight text-white sm:text-6xl'>
          Start your
          <br />
          <em className='font-serif font-light'>Project</em> today
        </h2>
        <div className='mx-auto mt-12 max-w-xl'>
          <LetsWorkForm />
        </div>
      </div>
    </section>
  );
}
