import type { Metadata } from 'next';
import { Mail, MapPin, Phone } from 'lucide-react';

import { FaqAccordion, REXER_FAQ } from '@/components/landing/FaqAccordion';
import { WordReveal } from '@/components/landing/LandingMotion';
import { LetsWorkForm } from '@/components/landing/LetsWorkForm';

export const metadata: Metadata = {
  title: 'Contact — ReXeR Studio',
  description:
    'Every great project begins with a simple conversation — let’s start yours.',
};

const INFO = [
  { icon: Phone, label: 'Contact us on', value: '+84 939 084 212' },
  { icon: Mail, label: 'Email', value: 'info@rexerstudio.com' },
  {
    icon: MapPin,
    label: 'Visit us',
    value: 'ReXeR Studio — 361 Stoneway Drive. Nepean, ON. K2G-6G8. Canada',
  },
];

export default function ContactPage() {
  return (
    <>
      {/* Hero */}
      <section className='relative mx-auto max-w-4xl px-6 pt-20 pb-14 text-center sm:pt-28'>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src='/landing/images/oT5iCekJTWft1yPozCYLHeeXMg.svg'
          alt=''
          aria-hidden
          className='pointer-events-none absolute top-0 left-1/2 -z-10 w-[50%] -translate-x-1/2 opacity-50 select-none'
        />
        <h1 className='text-5xl font-semibold tracking-tight text-neutral-900 sm:text-7xl'>
          <WordReveal
            on='load'
            text='Start Something bold'
            italic={1}
          />
        </h1>
      </section>

      {/* Info + form */}
      <section className='mx-auto max-w-6xl px-6 pb-20'>
        <div className='grid gap-12 md:grid-cols-[1fr_1.2fr]'>
          <div className='space-y-8'>
            {INFO.map(i => (
              <div key={i.label} className='flex items-start gap-4'>
                <div className='inline-flex rounded-xl bg-neutral-100 p-3 text-neutral-900'>
                  <i.icon className='size-5' />
                </div>
                <div>
                  <div className='text-sm text-neutral-500'>{i.label}</div>
                  <div className='font-medium text-neutral-900'>{i.value}</div>
                </div>
              </div>
            ))}
            <p className='max-w-sm text-neutral-600'>
              Every great project begins with a simple conversation — let’s
              start yours.
            </p>
          </div>
          <div className='rounded-3xl bg-neutral-950 p-4 sm:p-8'>
            <LetsWorkForm />
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className='border-t border-neutral-200 bg-neutral-50'>
        <div className='mx-auto max-w-3xl px-6 py-16'>
          <p className='text-center text-sm text-neutral-500'>
            + Have questions?
          </p>
          <h2 className='mt-4 text-center text-4xl font-semibold tracking-tight sm:text-6xl'>
            Clarity start <em className='font-serif font-light'>Right</em> here
          </h2>
          <div className='mt-12'>
            <FaqAccordion items={REXER_FAQ} />
          </div>
        </div>
      </section>
    </>
  );
}
