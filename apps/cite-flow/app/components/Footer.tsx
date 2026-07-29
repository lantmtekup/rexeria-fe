'use client';

import localFont from 'next/font/local';

const apfelGrotezk = localFont({
  src: '../../public/fonts/ApfelGrotezk-Regular.woff2',
  weight: '400',
  style: 'normal',
  variable: '--font-apfel-grotezk',
  display: 'swap',
});

const LABEL_CLASS =
  'font-(family-name:--font-apfel-grotezk) text-[20px] leading-[24px] font-normal tracking-[-0.16px] text-white xl:text-[24px] xl:leading-[28.8px]';

const LINK_CLASS =
  'group relative inline-block w-fit font-(family-name:--font-apfel-grotezk) text-[16px] leading-[22.4px] font-normal text-white no-underline lg:text-[18px] lg:leading-[27px]';

function FooterLink({ href, children }: { href: string; children: string }) {
  return (
    <a href={href} className={LINK_CLASS}>
      {children}
      <span className='absolute top-0 left-0 h-px w-0 bg-white transition-[width] duration-1500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:w-full' />
      <span className='absolute bottom-0 left-0 h-px w-0 bg-white transition-[width] duration-1500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:w-full' />{' '}
    </a>
  );
}

const MENU_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Contact', href: '/contact' },
];

const SOCIAL_LINKS = [
  { label: 'LinkedIn', href: '#' },
  { label: 'Behance', href: '#' },
  { label: 'YouTube', href: '#' },
];

export default function Footer() {
  return (
    <div className='relative z-0 h-[170vh] bg-[#1a1919] md:h-auto xl:h-[200vh]'>
      <div className='sticky top-0 flex h-auto w-full flex-col justify-center md:static xl:sticky xl:h-screen'>
        <footer
          className={`flex w-full flex-col items-center bg-[#1a1919] px-5 ${apfelGrotezk.variable}`}
        >
          <div className='mx-auto flex w-full max-w-[1720px] flex-col items-center gap-6.25 py-15 lg:gap-12.5 lg:py-12.5'>
            <div className='flex w-full flex-col items-center justify-between gap-3.75 text-left xl:flex-row xl:gap-5'>
              <h3 className='font-abril text-[40px] leading-15 font-normal text-white lg:text-[50px]'>
                Say Hello!
              </h3>
              <a
                href='mailto:info@ecoparkonsen.com'
                className='font-abril max-w-full min-w-0 text-center text-[40px] leading-15 font-normal wrap-break-word text-white md:text-left lg:text-[50px]'
              >
                info@ecoparkonsen.com
              </a>
            </div>

            <div className='h-px w-full bg-white/30' />

            <div className='flex w-full flex-col gap-7.5'>
              <div className='flex h-min w-full max-w-[1920px] flex-none flex-col items-start lg:pr-25'>
                <div className='flex w-full flex-col items-start gap-7.5 text-left lg:max-w-175 lg:flex-row lg:gap-23.75'>
                  <div className='flex h-min w-full flex-col items-start gap-5 lg:max-w-25 lg:gap-7.5'>
                    <p className={LABEL_CLASS}>Menu</p>
                    <div className='flex w-full flex-col items-start gap-3.75 md:gap-5'>
                      {MENU_LINKS.map(link => (
                        <FooterLink key={link.label} href={link.href}>
                          {link.label}
                        </FooterLink>
                      ))}
                    </div>
                  </div>

                  <div className='flex h-min w-full flex-col items-start gap-5 md:gap-7.5 xl:max-w-40'>
                    <p className={LABEL_CLASS}>Social Media</p>
                    <div className='flex w-full flex-col items-start gap-3.75 md:gap-5 xl:gap-7.5'>
                      {SOCIAL_LINKS.map(link => (
                        <FooterLink key={link.label} href={link.href}>
                          {link.label}
                        </FooterLink>
                      ))}
                    </div>
                  </div>

                  <div className='flex h-min min-h-40 w-full xl:hidden' />
                </div>
              </div>

              <div className='flex h-min w-full max-w-[1920px] lg:gap-13 xl:justify-between'>
                <div className='flex h-min flex-none flex-row items-end'>
                  <div className='hidden h-min min-h-4.75 min-w-36 items-start gap-0 xl:flex' />
                </div>
                <div className='relative z-4 flex h-min w-full max-w-250 flex-1 flex-row items-end'>
                  <div className='flex max-w-226 flex-1 items-center justify-center'>
                    <div className='h-auto overflow-hidden md:h-32 xl:h-40.5'>
                      <img
                        src='/assets/ecopark-logo.png'
                        className='block max-h-full w-auto object-contain'
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
