'use client';

import { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';

const inputClass =
  'w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-sm outline-none transition-colors focus:border-neutral-900 focus:bg-white';

/** Card form "Let's work together" — clone từ site gốc (card trắng trên nền tối). */
export function LetsWorkForm() {
  const [sent, setSent] = useState(false);

  if (sent) {
    return (
      <div className='flex flex-col items-center gap-3 rounded-2xl bg-white p-10 text-center shadow-xl'>
        <CheckCircle2 className='size-10 text-neutral-900' />
        <h3 className='text-lg font-semibold'>Thanks for reaching out!</h3>
        <p className='text-sm text-neutral-600'>
          We&apos;ll get back to you as soon as possible.
        </p>
      </div>
    );
  }

  return (
    <form
      className='rounded-2xl bg-white p-6 text-left shadow-xl sm:p-8'
      onSubmit={e => {
        e.preventDefault();
        // TODO: wire a real contact API when ready.
        setSent(true);
      }}
    >
      <h3 className='text-xl font-semibold text-neutral-900'>
        Let&apos;s work together
      </h3>
      <div className='mt-5 space-y-4'>
        <div>
          <label className='mb-1.5 block text-sm text-neutral-700'>
            Full name*
          </label>
          <input className={inputClass} name='name' placeholder='Your name' required />
        </div>
        <div>
          <label className='mb-1.5 block text-sm text-neutral-700'>
            Email address*
          </label>
          <input
            className={inputClass}
            type='email'
            name='email'
            placeholder='example@gmail.com'
            required
          />
        </div>
        <div>
          <label className='mb-1.5 block text-sm text-neutral-700'>Message</label>
          <textarea
            className={inputClass}
            name='message'
            rows={4}
            placeholder='Tell us the purpose'
          />
        </div>
      </div>
      <button
        type='submit'
        className='mt-5 inline-flex h-10 items-center rounded-pill bg-neutral-950 px-6 text-sm font-medium text-white transition-transform hover:scale-105'
      >
        Submit
      </button>
      <p className='mt-4 text-xs text-neutral-400'>
        Do you prefer email?{' '}
        <a
          href='mailto:info@rexerstudio.com'
          className='font-medium text-neutral-700 underline-offset-2 hover:underline'
        >
          info@rexerstudio.com
        </a>
      </p>
    </form>
  );
}
