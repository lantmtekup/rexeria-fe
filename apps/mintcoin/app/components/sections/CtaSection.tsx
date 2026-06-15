'use client';

import { useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useIsomorphicLayoutEffect } from '@/lib/use-isomorphic-layout-effect';

// Closing call-to-action — final dark section with a register-interest form
// (username + password) so a visitor can leave their credentials to reserve
// the coin. On-brand with the rest of the luxury composition. Children fade
// up once on scroll-in.
export default function CtaSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) return;
    // No backend wired yet — capture locally and confirm. Swap this for a
    // real POST (e.g. /api/register) when the endpoint exists.
    setSubmitted(true);
  };

  useIsomorphicLayoutEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const root = sectionRef.current;
    if (!root) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        gsap.utils.toArray<HTMLElement>('.cta-fade', root),
        { opacity: 0, y: 24 },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          stagger: 0.1,
          ease: 'power2.out',
          scrollTrigger: { trigger: root, start: 'top 80%', once: true },
        }
      );
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id='contact'
      // Generous bottom padding clears the fixed sticky menu so the form's
      // submit button is never hidden behind it on any viewport.
      className='cta relative w-full overflow-hidden bg-neutral-900 px-6 pt-28 pb-40 text-center text-white md:pt-36 md:pb-44'
    >
      <div className='mx-auto max-w-md'>
        {/* Gold hairline accent — matches the hero/detail brand language */}
        <div className='cta-fade mx-auto mb-8 h-px w-16 bg-gradient-to-r from-transparent via-[#c79119] to-transparent md:w-24' />

        <h2 className='cta-fade text-4xl font-light tracking-tight text-balance md:text-5xl'>
          Reserve your coin
        </h2>

        <p className='cta-fade mx-auto mt-6 max-w-sm text-sm leading-relaxed text-neutral-400 md:text-base'>
          Only 75 will ever be struck. Register your details to reserve The Jack
          Pine 1 Kilo Pure Gold Coin.
        </p>

        {submitted ? (
          <p
            className='cta-fade mx-auto mt-10 max-w-sm text-base text-[#e6b94a]'
            role='status'
          >
            Thank you — your registration has been received. The Royal Canadian
            Mint will be in touch.
          </p>
        ) : (
          <form
            onSubmit={handleSubmit}
            className='cta-fade mx-auto mt-10 flex flex-col gap-4 text-left'
          >
            <div className='flex flex-col gap-1.5'>
              <label
                htmlFor='cta-username'
                className='text-[11px] tracking-[0.18em] text-neutral-400 uppercase'
              >
                Username
              </label>
              <input
                id='cta-username'
                name='username'
                type='text'
                autoComplete='username'
                required
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder='Enter your username'
                className='w-full rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-sm text-white transition-colors duration-200 placeholder:text-neutral-500 focus:border-[#c79119] focus:outline-none'
              />
            </div>

            <div className='flex flex-col gap-1.5'>
              <label
                htmlFor='cta-password'
                className='text-[11px] tracking-[0.18em] text-neutral-400 uppercase'
              >
                Password
              </label>
              <input
                id='cta-password'
                name='password'
                type='password'
                autoComplete='new-password'
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder='Create a password'
                className='w-full rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-sm text-white transition-colors duration-200 placeholder:text-neutral-500 focus:border-[#c79119] focus:outline-none'
              />
            </div>

            <button
              type='submit'
              data-cta-id='cta-register'
              className='mt-2 inline-block rounded-full bg-white px-8 py-4 text-xs tracking-[0.2em] whitespace-nowrap text-black uppercase transition-colors duration-300 hover:bg-neutral-200'
            >
              Register interest
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
