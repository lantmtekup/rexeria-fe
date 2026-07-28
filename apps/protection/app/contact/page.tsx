'use client';

import { PageShell } from '../../components/PageShell';

export default function ContactPage() {
  return (
    <PageShell title='contact'>
      <div className='grid max-w-4xl gap-12 md:grid-cols-2'>
        <div className='space-y-6 text-[var(--grey)]/80'>
          <div>
            <h3 className='text-xs font-semibold tracking-[0.2em] text-[var(--grey)]/50 uppercase'>
              Address
            </h3>
            <p className='mt-1'>Industrial Area, Greece</p>
          </div>
          <div>
            <h3 className='text-xs font-semibold tracking-[0.2em] text-[var(--grey)]/50 uppercase'>
              Email
            </h3>
            <p className='mt-1'>info@protection.gr</p>
          </div>
        </div>
        <form className='space-y-4' onSubmit={e => e.preventDefault()}>
          <input
            className='w-full border-b border-[var(--grey)]/30 bg-transparent py-3 outline-none placeholder:text-[var(--grey)]/50'
            placeholder='Name'
          />
          <input
            className='w-full border-b border-[var(--grey)]/30 bg-transparent py-3 outline-none placeholder:text-[var(--grey)]/50'
            placeholder='Email'
          />
          <textarea
            rows={4}
            className='w-full border-b border-[var(--grey)]/30 bg-transparent py-3 outline-none placeholder:text-[var(--grey)]/50'
            placeholder='Message'
          />
          <button className='rounded-full bg-[var(--yellow)] px-8 py-3 text-sm font-semibold text-[var(--grey)] uppercase'>
            Send
          </button>
        </form>
      </div>
    </PageShell>
  );
}
