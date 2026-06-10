import Link from 'next/link';

const MAIN_LINKS = [
  { href: '/rexer', label: 'Home' },
  { href: '/rexer/studio', label: 'Studio' },
  { href: '/rexer/about', label: 'About us' },
  { href: '/rexer/projects', label: 'Projects' },
  { href: '/rexer/contact', label: 'Contact us' },
];

/** Footer dark — clone từ site gốc: Stay connected + links + wordmark lớn,
 *  nền ảnh tối + watermark chữ G script. */
export function LandingFooter() {
  return (
    <footer className='relative isolate overflow-hidden bg-neutral-950 text-white'>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src='/landing/images/f2NvgNRlcuKjsRHuUQLb4qV1f40.jpg'
        alt=''
        aria-hidden
        className='absolute inset-0 -z-20 h-full w-full object-cover opacity-40'
      />
      <div className='absolute inset-0 -z-10 bg-neutral-950/70' />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src='/landing/images/oT5iCekJTWft1yPozCYLHeeXMg.svg'
        alt=''
        aria-hidden
        className='pointer-events-none absolute right-0 bottom-0 -z-10 w-[60%] opacity-20 select-none'
      />

      <div className='mx-auto grid max-w-6xl gap-12 px-6 pt-16 pb-10 md:grid-cols-[1.2fr_1fr_1fr]'>
        {/* Stay connected */}
        <div>
          <h4 className='text-2xl font-semibold'>Stay connected</h4>
          <p className='mt-3 max-w-xs text-sm text-white/60'>
            Join our newsletter for tips, updates, and project highlights—only
            the good stuff.
          </p>
          <form className='mt-5 flex max-w-sm items-center gap-2'>
            <input
              type='email'
              placeholder='Enter email address*'
              className='rounded-pill h-10 w-full border border-white/20 bg-white/10 px-4 text-sm text-white placeholder:text-white/40 focus:border-white/50 focus:outline-none'
            />
            <button
              type='submit'
              aria-label='Subscribe'
              className='flex size-10 shrink-0 items-center justify-center rounded-full bg-white text-neutral-950 transition-transform hover:scale-105'
            >
              →
            </button>
          </form>
          <div className='mt-8 space-y-2 text-sm text-white/60'>
            <a
              href='https://www.facebook.com/'
              className='block hover:text-white'
            >
              Facebook +
            </a>
            <a
              href='https://www.linkedin.com/'
              className='block hover:text-white'
            >
              LinkedIn +
            </a>
          </div>
        </div>

        {/* Main links */}
        <div>
          <h5 className='text-lg font-medium text-white/80'>Main links</h5>
          <ul className='mt-4 space-y-2'>
            {MAIN_LINKS.map(l => (
              <li key={l.label}>
                <Link
                  href={l.href}
                  className='text-sm text-white/60 transition-colors hover:text-white'
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Get in touch */}
        <div>
          <h5 className='text-lg font-medium text-white/80'>Get in touch</h5>
          <div className='mt-4 space-y-2 text-sm text-white/60'>
            <p>+84 939 084 212</p>
            <a
              href='mailto:info@rexerstudio.com'
              className='block hover:text-white'
            >
              info@rexerstudio.com
            </a>
          </div>
          <h5 className='mt-8 text-lg font-medium text-white/80'>Offline</h5>
          <p className='mt-3 text-sm text-white/60'>
            ReXeR Studio
            <br />
            361 Stoneway Drive. Nepean, ON. K2G-6G8. Canada
          </p>
        </div>
      </div>

      {/* Big wordmark */}
      <div className='mx-auto max-w-6xl px-6 pb-10'>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src='/landing/images/R5Kh9QXwGFaeiThKa6vcSWxJ5s.png'
          alt='ReXeR Studio'
          className='mx-auto w-full max-w-xl'
        />
        <p className='mt-6 text-center text-xs text-white/40'>
          © 2025 ReXeR • Studio in Vietnam
        </p>
      </div>
    </footer>
  );
}
