'use client';

import { useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useIsomorphicLayoutEffect } from '@/lib/use-isomorphic-layout-effect';

// Closing call-to-action — final dark section with a leave-your-details form
// (email + phone + note) so a visitor can register their interest to reserve
// the coin. On-brand with the rest of the luxury composition. Children fade
// up once on scroll-in.
export default function CtaSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [note, setNote] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email.trim() || !phone.trim()) return;
    // No backend wired yet — capture locally and confirm. Swap this for a
    // real POST (e.g. /api/reserve) when the endpoint exists. The note is
    // optional; email + phone are the required contact details.
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
          Register your interest
        </h2>

        <p className='cta-fade mx-auto mt-6 max-w-sm text-sm leading-relaxed text-neutral-400 md:text-base'>
          Only 75 will ever be struck. Leave your contact details and the Royal
          Canadian Mint will be in touch to reserve your Jack Pine 1 Kilo Pure
          Gold Coin.
        </p>

        {submitted ? (
          <p
            className='cta-fade mx-auto mt-10 max-w-sm text-base text-[#e6b94a]'
            role='status'
          >
            Thank you — your details have been received. The Royal Canadian Mint
            will be in touch.
          </p>
        ) : (
          <form
            onSubmit={handleSubmit}
            className='cta-fade mx-auto mt-10 flex flex-col gap-4 text-left'
          >
            <div className='flex flex-col gap-1.5'>
              <label
                htmlFor='cta-email'
                className='text-[11px] tracking-[0.18em] text-neutral-400 uppercase'
              >
                Email
              </label>
              <input
                id='cta-email'
                name='email'
                type='email'
                autoComplete='email'
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder='your@email.com'
                className='w-full rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-sm text-white transition-colors duration-200 placeholder:text-neutral-500 focus:border-[#c79119] focus:outline-none'
              />
            </div>

            <div className='flex flex-col gap-1.5'>
              <label
                htmlFor='cta-phone'
                className='text-[11px] tracking-[0.18em] text-neutral-400 uppercase'
              >
                Phone
              </label>
              <input
                id='cta-phone'
                name='phone'
                type='tel'
                autoComplete='tel'
                inputMode='tel'
                required
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder='+1 (000) 000-0000'
                className='w-full rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-sm text-white transition-colors duration-200 placeholder:text-neutral-500 focus:border-[#c79119] focus:outline-none'
              />
            </div>

            <div className='flex flex-col gap-1.5'>
              <label
                htmlFor='cta-note'
                className='text-[11px] tracking-[0.18em] text-neutral-400 uppercase'
              >
                Note <span className='text-neutral-600'>(optional)</span>
              </label>
              <textarea
                id='cta-note'
                name='note'
                rows={3}
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder='Anything you’d like us to know…'
                className='w-full resize-none rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-sm text-white transition-colors duration-200 placeholder:text-neutral-500 focus:border-[#c79119] focus:outline-none'
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
