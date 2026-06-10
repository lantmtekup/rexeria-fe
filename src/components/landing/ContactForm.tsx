'use client';

import { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';

import { Button } from '@/components/atoms/button';

const inputClass =
  'w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary';

export function ContactForm() {
  const [sent, setSent] = useState(false);

  if (sent) {
    return (
      <div className='flex flex-col items-center gap-3 rounded-2xl border border-neutral-200 bg-neutral-50 p-10 text-center'>
        <CheckCircle2 className='size-10 text-primary' />
        <h3 className='text-lg font-semibold'>Thanks for reaching out!</h3>
        <p className='text-sm text-neutral-600'>
          We&apos;ll get back to you as soon as possible.
        </p>
      </div>
    );
  }

  return (
    <form
      className='space-y-4'
      onSubmit={e => {
        e.preventDefault();
        // TODO: wire up a real contact API when ready.
        setSent(true);
      }}
    >
      <div className='grid gap-4 sm:grid-cols-2'>
        <div>
          <label className='mb-1.5 block text-sm font-medium'>Full name</label>
          <input className={inputClass} name='name' required />
        </div>
        <div>
          <label className='mb-1.5 block text-sm font-medium'>Email</label>
          <input className={inputClass} type='email' name='email' required />
        </div>
      </div>
      <div>
        <label className='mb-1.5 block text-sm font-medium'>Message</label>
        <textarea className={inputClass} name='message' rows={5} required />
      </div>
      <Button type='submit' variant='pill' size='lg'>
        Send message
      </Button>
    </form>
  );
}
