import Image from 'next/image';

export default function Footer() {
  return (
    <footer className='relative flex min-h-65 items-center justify-center overflow-hidden bg-white px-6 py-14 sm:h-80 sm:py-0'>
      <div className='relative flex w-full max-w-[720px] items-center justify-center'>
        <Image
          src='/f1.png'
          alt=''
          width={257}
          height={114}
          aria-hidden
          className='pointer-events-none absolute top-[38%] left-0 hidden w-[160px] -translate-y-1/2 select-none md:block lg:w-[180px]'
        />
        <Image
          src='/f2.png'
          alt=''
          width={240}
          height={114}
          aria-hidden
          className='pointer-events-none absolute top-[58%] right-0 hidden w-[148px] -translate-y-1/2 select-none md:block lg:w-[168px]'
        />

        <div className='relative z-10 flex flex-col items-center text-center'>
          <Image
            src='/logo-icon.svg'
            alt='The Westly'
            width={46}
            height={53}
            className='mb-5 h-auto w-9'
          />

          <h2 className='mb-6 text-center text-[22px] leading-tight font-medium text-[#4A4A4A] sm:text-[32px] sm:leading-none sm:whitespace-nowrap'>
            Sign up for notifications to see more{' '}
            <br className='hidden sm:block' />
            of our interesting products.
          </h2>

          <button
            type='button'
            aria-label='Sign up for notifications'
            className='cursor-pointer border border-[#5A5A5A] bg-white px-14 py-2 text-[11px] font-medium tracking-[0.35em] text-[#4A4A4A] uppercase transition-colors hover:border-[#6E7A6F] hover:bg-[#6E7A6F] hover:text-white'
          >
            Sign up
          </button>
        </div>
      </div>
    </footer>
  );
}
