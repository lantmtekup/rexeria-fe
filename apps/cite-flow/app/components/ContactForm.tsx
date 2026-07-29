'use client';

import { useState, type FormEvent } from 'react';
import localFont from 'next/font/local';
import { ArrowRight } from 'lucide-react';

const apfelGrotezk = localFont({
  src: '../../public/fonts/ApfelGrotezk-Regular.woff2',
  weight: '400',
  style: 'normal',
  variable: '--font-apfel-grotezk',
  display: 'swap',
});

const CONTACT_INFO: { label: string; value: string; href?: string }[] = [
  {
    label: 'Email',
    value: 'info@ecoparkonsen.com',
    href: 'mailto:info@ecoparkonsen.com',
  },
  { label: 'Phone', value: '+84 24 3543 6789', href: 'tel:+842435436789' },
  { label: 'Address', value: 'Ecopark, Van Giang, Hung Yen, Vietnam' },
];

const LABEL_CLASS =
  'font-(family-name:--font-apfel-grotezk) text-xl tracking-[-0.16px] text-[#1a1919] xl:text-2xl';

const FIELD_CLASS =
  'w-full border-b border-[#1a1919] bg-transparent pb-[14px] font-(family-name:--font-apfel-grotezk) text-sm text-[#1a1919] outline-none placeholder:text-[#1a1919] xl:text-base';

export default function ContactForm() {
  const [status, setStatus] = useState<'idle' | 'submitted'>('idle');

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus('submitted');
  };

  return (
    <section
      className={`flex w-full flex-col items-center bg-[#f5f5f5] px-5 pt-40 pb-15 xl:pt-45 xl:pb-25 ${apfelGrotezk.variable}`}
    >
      <div className='mx-auto flex w-full max-w-[1720px] flex-col gap-7.5 xl:flex-row xl:items-start xl:gap-15'>
        <div className='flex w-full flex-1 flex-col gap-7.5 md:items-start xl:min-w-150 xl:gap-5 xl:text-left'>
          <h1 className='w-full font-(family-name:--font-apfel-grotezk) text-[60px] leading-none font-normal text-[#1a1919] xl:text-[90px] xl:leading-22.5'>
            Connect now
          </h1>

          <div className='flex h-min w-full flex-col gap-5'>
            <div className='flex h-min min-h-5.5 w-full lg:min-h-9'></div>
            <div className='flex flex-col items-start gap-2.5'>
              {CONTACT_INFO.map(item =>
                item.href ? (
                  <a
                    key={item.label}
                    href={item.href}
                    className='font-(family-name:--font-apfel-grotezk) text-sm text-[#1a1919] transition-colors duration-400 ease-[cubic-bezier(0.44,0,0.56,1)] hover:text-[#1a1919]/70 xl:text-base'
                  >
                    {item.value}
                  </a>
                ) : (
                  <p
                    key={item.label}
                    className='font-(family-name:--font-apfel-grotezk) text-sm text-[#1a1919] xl:text-base'
                  >
                    {item.value}
                  </p>
                )
              )}
            </div>
          </div>
        </div>

        <div className='flex w-full flex-1 flex-col gap-7.5 xl:max-w-235 xl:gap-20'>
          <p className='font-(family-name:--font-apfel-grotezk) text-base leading-[22.4px] font-normal text-[#6e6d6d] xl:text-[18px] xl:leading-6.75'>
            Do you want to find out more about the project, connect with us now.
          </p>

          <form
            onSubmit={handleSubmit}
            className='flex flex-col justify-start gap-5 lg:gap-12.5'
          >
            <div className='flex flex-col gap-6.25 lg:gap-6'>
              <label className='flex flex-col gap-3.75 lg:gap-6.25'>
                <span className={LABEL_CLASS}>Name</span>
                <input
                  type='text'
                  name='name'
                  placeholder='Enter your name'
                  required
                  className={FIELD_CLASS}
                />
              </label>

              <label className='flex flex-col gap-3.75 lg:gap-6.25'>
                <span className={LABEL_CLASS}>Email</span>
                <input
                  type='email'
                  name='email'
                  placeholder='Enter your mail'
                  required
                  className={FIELD_CLASS}
                />
              </label>

              <label className='flex flex-col gap-3.75 lg:gap-6.25'>
                <span className={LABEL_CLASS}>Message</span>
                <textarea
                  name='message'
                  placeholder='Message'
                  rows={3}
                  required
                  className={`${FIELD_CLASS} resize-y pb-0!`}
                />
              </label>
            </div>

            <button
              type='submit'
              className='group flex w-fit cursor-pointer items-center gap-3.75 font-(family-name:--font-apfel-grotezk) text-sm font-normal text-[#1a1919] xl:text-base'
            >
              {status === 'submitted' ? 'Message sent' : 'Send message'}
              <span className='flex h-11 w-11 items-center justify-center rounded-full bg-[#1a1919]'>
                <ArrowRight className='h-4 w-4 text-[#f5f5f5]' />
              </span>
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
