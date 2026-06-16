'use client';

import { useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useIsomorphicLayoutEffect } from '@/lib/use-isomorphic-layout-effect';
import { REXER_PAGE_ID } from '@/app/components/analytics/analytics-data';
import {
  getSessionId,
  getVisitorId,
} from '@/app/components/analytics/rexer-client';

// Closing CTA section — final call-to-action for the Jack Pine 1 kilo
// gold coin. LEFT: serif headline + copy + compact contact strip.
// RIGHT: lead-capture form (name / email / phone / message) that POSTs
// to /api/forms → ReXeR /v1/forms/submit (creates a lead in the Sales tab).
// Dark luxury palette + gold accent to match Hero / Works / Process / Services.

const MINT_URL =
  'https://www.mint.ca/en/shop/coins/2026/the-jack-pine-by-tom-thomson-1-kilo-pure-gold-coin';

interface ContactItem {
  label: string;
  value: string;
}

const CONTACT: ContactItem[] = [
  {
    label: 'Customer Service',
    value: '1-800-267-1871 · Mon–Fri 8:30 am – 6 pm ET',
  },
  {
    label: 'Mailing Address',
    value: 'Royal Canadian Mint, 320 Sussex Drive, Ottawa K1A 0G8',
  },
];

type SubmitState = 'idle' | 'loading' | 'success' | 'error';

export default function CtaSection() {
  const ref = useRef<HTMLElement>(null);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });
  const [status, setStatus] = useState<SubmitState>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  // Debug: exact upstream cURL (from the proxy) to verify the key with BE.
  const [curlCmd, setCurlCmd] = useState('');
  const [copied, setCopied] = useState(false);

  useIsomorphicLayoutEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const root = ref.current;
    if (!root) return;

    const ctx = gsap.context(() => {
      const reveals = gsap.utils.toArray<HTMLElement>('.cta-reveal');
      reveals.forEach((el, i) => {
        gsap.fromTo(
          el,
          { y: 32, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.9,
            ease: 'power3.out',
            delay: i * 0.08,
            scrollTrigger: {
              trigger: el,
              start: 'top 85%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      });
    }, root);

    return () => ctx.revert();
  }, []);

  const update =
    (field: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm(f => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === 'loading') return;

    // BE requires at least one contact channel (email OR phone).
    if (!form.email.trim() && !form.phone.trim()) {
      setStatus('error');
      setErrorMsg('Please provide an email or phone number.');
      return;
    }

    setStatus('loading');
    setErrorMsg('');
    try {
      // Only send the fields the visitor actually filled — BE stores `fields`
      // verbatim as the lead's form_data.
      const fields: Record<string, string> = {};
      if (form.name.trim()) fields.name = form.name.trim();
      if (form.email.trim()) fields.email = form.email.trim();
      if (form.phone.trim()) fields.phone = form.phone.trim();
      if (form.message.trim()) fields.message = form.message.trim();

      const params = new URLSearchParams(window.location.search);
      // Submit through the same-origin proxy → ReXeR POST /v1/forms/submit,
      // which creates/dedups a lead (visible in the Sales tab).
      const res = await fetch('/api/forms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          page_id: REXER_PAGE_ID,
          session_id: getSessionId(),
          visitor_id: getVisitorId(),
          fields,
          utm_source: params.get('utm_source') || undefined,
          utm_medium: params.get('utm_medium') || undefined,
          utm_campaign: params.get('utm_campaign') || undefined,
        }),
      });
      // Capture the exact upstream cURL the proxy ran (works on ok OR error).
      const curl = res.headers.get('x-debug-curl');
      if (curl) setCurlCmd(decodeURIComponent(curl));
      const data = await res.json().catch(() => ({}));
      if (!res.ok)
        throw new Error(
          data.error ||
            data.message ||
            'Something went wrong. Please try again.'
        );
      setStatus('success');
      setForm({ name: '', email: '', phone: '', message: '' });
    } catch (err) {
      setStatus('error');
      setErrorMsg((err as Error).message);
    }
  };

  const copyCurl = async () => {
    try {
      await navigator.clipboard.writeText(curlCmd);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const inputCls =
    'w-full rounded-md bg-neutral-100/[0.04] border border-neutral-100/15 px-4 py-3 text-sm text-neutral-100 placeholder:text-neutral-500 outline-none transition-colors duration-200 focus:border-[#c79119] focus:bg-neutral-100/[0.07]';

  return (
    <section
      ref={ref}
      id='reserve'
      className='cta relative w-full overflow-hidden bg-[#0f0f0f] py-24 text-neutral-100 md:py-40'
    >
      {/* Decorative gold radial wash */}
      <div aria-hidden='true' className='absolute inset-0 z-0'>
        <div
          className='absolute inset-0 opacity-60'
          style={{
            backgroundImage:
              'radial-gradient(ellipse at 75% 20%, rgba(199,145,25,0.10) 0%, transparent 55%), radial-gradient(ellipse at 10% 90%, rgba(199,145,25,0.06) 0%, transparent 60%)',
          }}
        />
      </div>

      <div className='relative z-10 mx-auto grid max-w-[1400px] grid-cols-1 gap-16 px-6 md:px-16 lg:grid-cols-[1.1fr_1fr] lg:gap-24'>
        {/* LEFT — headline + copy + contact */}
        <div className='flex flex-col justify-center'>
          <span className='cta-reveal mb-5 block text-[11px] tracking-[0.32em] text-[#c79119] uppercase'>
            Mintage 75 Worldwide
          </span>
          <h2
            className='cta-reveal font-serif leading-[0.98] font-light tracking-tight text-neutral-50'
            style={{ fontSize: 'clamp(44px, 7vw, 96px)' }}
          >
            Reserve Yours
          </h2>
          <p className='cta-reveal mt-6 max-w-md text-base leading-relaxed font-light text-neutral-300 md:text-lg'>
            Leave your details and an advisor will reach out to secure your
            allocation before the edition closes — a 1006.1 g, 99.99% pure gold
            proof coin.
          </p>

          <div className='cta-reveal mt-10 space-y-5'>
            {CONTACT.map(c => (
              <div key={c.label}>
                <h3 className='mb-1 text-[11px] tracking-[0.22em] text-neutral-500 uppercase'>
                  {c.label}
                </h3>
                <p className='text-sm text-neutral-300'>{c.value}</p>
              </div>
            ))}
            <a
              href={MINT_URL}
              target='_blank'
              rel='noopener noreferrer'
              data-cta-id='buy-online'
              className='inline-block text-[11px] tracking-[0.18em] text-[#c79119] uppercase transition-colors hover:text-neutral-100'
            >
              Or buy directly online →
            </a>
          </div>
        </div>

        {/* RIGHT — lead capture form */}
        <div className='cta-reveal flex flex-col justify-center'>
          {status === 'success' ? (
            <div className='rounded-xl border border-[#c79119]/40 bg-[#c79119]/[0.06] p-10 text-center'>
              <h3 className='mb-3 font-serif text-3xl text-neutral-50'>
                Thank you
              </h3>
              <p className='text-sm leading-relaxed text-neutral-300'>
                We&apos;ve received your details. An advisor will contact you
                shortly to help reserve your coin.
              </p>
              <button
                type='button'
                onClick={() => setStatus('idle')}
                className='mt-6 text-[11px] tracking-[0.18em] text-[#c79119] uppercase transition-colors hover:text-neutral-100'
              >
                Submit another request →
              </button>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className='space-y-4 rounded-xl border border-neutral-100/10 bg-neutral-100/[0.02] p-6 md:p-8'
              noValidate
            >
              <h3 className='mb-2 font-serif text-2xl text-neutral-50'>
                Request a call back
              </h3>

              <div>
                <label htmlFor='lead-name' className='sr-only'>
                  Full name
                </label>
                <input
                  id='lead-name'
                  type='text'
                  autoComplete='name'
                  placeholder='Full name (optional)'
                  value={form.name}
                  onChange={update('name')}
                  className={inputCls}
                />
              </div>

              <div>
                <label htmlFor='lead-email' className='sr-only'>
                  Email address
                </label>
                <input
                  id='lead-email'
                  type='email'
                  required
                  autoComplete='email'
                  placeholder='Email address *'
                  value={form.email}
                  onChange={update('email')}
                  className={inputCls}
                />
              </div>

              <div>
                <label htmlFor='lead-phone' className='sr-only'>
                  Phone number
                </label>
                <input
                  id='lead-phone'
                  type='tel'
                  required
                  autoComplete='tel'
                  placeholder='Phone number *'
                  value={form.phone}
                  onChange={update('phone')}
                  className={inputCls}
                />
              </div>

              <div>
                <label htmlFor='lead-message' className='sr-only'>
                  Message
                </label>
                <textarea
                  id='lead-message'
                  rows={3}
                  placeholder='Anything we should know? (optional)'
                  value={form.message}
                  onChange={update('message')}
                  className={`${inputCls} resize-none`}
                />
              </div>

              {status === 'error' && (
                <p className='text-sm text-red-400' role='alert'>
                  {errorMsg}
                </p>
              )}

              <button
                type='submit'
                disabled={status === 'loading'}
                data-cta-id='reserve-submit'
                className='w-full rounded-full bg-[#c79119] py-4 text-xs font-medium tracking-[0.18em] text-neutral-900 uppercase transition-colors duration-300 hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-60'
              >
                {status === 'loading' ? 'Sending…' : 'Request a call back'}
              </button>

              <p className='text-[11px] leading-relaxed text-neutral-500'>
                By submitting you agree to be contacted by a Royal Canadian Mint
                advisor about this product.
              </p>
            </form>
          )}

          {/* Debug — copy the exact upstream cURL to verify the key with BE. */}
          {curlCmd && (
            <div className='mt-4 rounded-lg border border-neutral-100/10 bg-neutral-100/[0.02] p-4'>
              <div className='mb-2 flex items-center justify-between gap-3'>
                <span className='text-[10px] tracking-[0.18em] text-neutral-500 uppercase'>
                  Debug · upstream request
                </span>
                <button
                  type='button'
                  onClick={copyCurl}
                  className='rounded-full border border-[#c79119]/40 px-3 py-1 text-[10px] tracking-[0.16em] text-[#c79119] uppercase transition-colors hover:bg-[#c79119]/10'
                >
                  {copied ? 'Copied ✓' : 'Copy cURL'}
                </button>
              </div>
              <pre className='max-h-40 overflow-auto rounded bg-black/40 p-3 text-[11px] leading-relaxed whitespace-pre-wrap text-neutral-400'>
                {curlCmd}
              </pre>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
