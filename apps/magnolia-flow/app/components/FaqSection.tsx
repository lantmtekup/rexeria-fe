'use client';

import { useState } from 'react';
import localFont from 'next/font/local';
import { ArrowRight } from 'lucide-react';

const apfelGrotezk = localFont({
  src: '../../public/fonts/ApfelGrotezk-Regular.woff2',
  weight: '400',
  style: 'normal',
  variable: '--font-apfel-grotezk',
  display: 'swap',
});

const FAQ_ITEMS = [
  {
    question: 'Where is The Magnolia located?',
    answer:
      'The Magnolia sits within Khai Son City in Long Bien, Hanoi — a masterplan where architecture, water and landscape resolve into a single composition.',
  },
  {
    question: 'What residence types are available?',
    answer:
      'The Limited Edition Collection includes 3 Bedroom residences, Penthouses, Duplexes and The Townhouse:\n3 Bedroom: rooms arranged around a light axis that runs the full depth of the home.\nPenthouse: the top of the tower, with generous ceilings, uninterrupted views and a private entrance.\nDuplex: two levels joined by an internal stair — living below, rest above.',
  },
  {
    question: 'Which amenities are part of the project?',
    answer:
      'Five signature spaces: The Place, The Private Arrival, The Pavilion Lobby, The Car Gallery and The Vertical Garden.',
  },
  {
    question: 'How can I arrange a consultation?',
    answer:
      'Contact the sales team at +84 (951) 870-700 or info@magnolia.com, or send a request through the contact page.',
  },
];

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section
      className={`relative z-10 flex w-full flex-row items-center rounded-b-2xl bg-[#f5f5f5] px-5 py-15 xl:mb-[max(-100vh,-720px)] xl:pt-25 xl:pb-50 ${apfelGrotezk.variable}`}
    >
      <div className='mx-auto flex w-full max-w-[1720px] flex-col items-center gap-10 xl:flex-row xl:items-start xl:justify-between xl:gap-0'>
        <div className='flex w-full flex-1 flex-col items-center gap-2.5 text-left xl:max-w-165 xl:items-start xl:gap-5'>
          <h2 className='font-abril text-center text-[60px] leading-none font-normal text-[#1a1919] md:leading-[93.5px] lg:text-[85px] xl:text-left'>
            Have some questions?
          </h2>
          <a
            href='/contact'
            className='group flex items-center gap-3.75 font-(family-name:--font-apfel-grotezk) text-[16px] leading-[22.4px] text-[#1a1919]'
          >
            Ask a question
            <span className='flex h-11 w-11 items-center justify-center rounded-full bg-[#1a1919]'>
              <ArrowRight className='h-4 w-4 text-[#f5f5f5]' />
            </span>
          </a>
        </div>

        <div className='flex w-full max-w-235 flex-1 flex-col gap-6.25'>
          {FAQ_ITEMS.map((item, i) => {
            const isOpen = openIndex === i;
            return (
              <div
                key={item.question}
                className='flex w-full flex-col rounded-2xl bg-white p-7'
              >
                <button
                  type='button'
                  onClick={() => setOpenIndex(isOpen ? -1 : i)}
                  className='flex w-full cursor-pointer items-center justify-between gap-6 text-left md:gap-0'
                >
                  <span className='font-(family-name:--font-apfel-grotezk) text-xl tracking-[-0.16px] text-[#1a1919] xl:text-2xl'>
                    {item.question}
                  </span>
                  <span className='relative flex h-10.25 w-10.25 flex-none items-center justify-center rounded-full bg-[#1a1919]'>
                    <span className='absolute h-px w-4 bg-[#f5f5f5]' />
                    <span
                      className={`absolute h-px w-4 bg-[#f5f5f5] transition-transform duration-500 ease-in-out ${isOpen ? 'rotate-0' : 'rotate-90'}`}
                    />
                  </span>
                </button>
                <div
                  className='grid transition-[grid-template-rows] duration-500 ease-in-out'
                  style={{ gridTemplateRows: isOpen ? '1fr' : '0fr' }}
                >
                  <div
                    className={`overflow-hidden transition-opacity duration-500 ease-in-out ${isOpen ? 'opacity-100' : 'opacity-0'}`}
                  >
                    <p className='pt-6.25 font-(family-name:--font-apfel-grotezk) text-base leading-6.75 whitespace-pre-line text-[#6e6d6d] xl:text-lg'>
                      {item.answer}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
