import type { Metadata } from 'next';
import { Mail, MapPin, Phone } from 'lucide-react';

import { ContactForm } from '@/components/landing/ContactForm';

export const metadata: Metadata = {
  title: 'Contact — Rexer',
  description: "Get in touch with the Rexer team. We're always here to help.",
};

const INFO = [
  { icon: Mail, label: 'Email', value: 'hello@rexer.ai' },
  { icon: Phone, label: 'Phone', value: '+84 28 1234 5678' },
  { icon: MapPin, label: 'Address', value: 'Ho Chi Minh City, Vietnam' },
];

export default function ContactPage() {
  return (
    <>
      <section className='border-b border-neutral-200 bg-neutral-50'>
        <div className='mx-auto max-w-3xl px-6 py-20 text-center'>
          <h1 className='text-4xl font-semibold tracking-tight sm:text-5xl'>
            Get in touch
          </h1>
          <p className='mt-6 text-lg text-neutral-600'>
            Have a question or need a demo? Leave us a message and the Rexer team
            will get back to you.
          </p>
        </div>
      </section>

      <section className='mx-auto max-w-6xl px-6 py-16'>
        <div className='grid gap-12 md:grid-cols-2'>
          <div className='space-y-6'>
            {INFO.map(i => (
              <div key={i.label} className='flex items-start gap-4'>
                <div className='inline-flex rounded-xl bg-primary/10 p-3 text-primary'>
                  <i.icon className='size-5' />
                </div>
                <div>
                  <div className='text-sm text-neutral-500'>{i.label}</div>
                  <div className='font-medium text-neutral-900'>{i.value}</div>
                </div>
              </div>
            ))}
          </div>
          <ContactForm />
        </div>
      </section>
    </>
  );
}
