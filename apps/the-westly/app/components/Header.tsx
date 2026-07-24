import Image from 'next/image';
import Link from 'next/link';

export default function Header() {
  return (
    <header
      className='pointer-events-none fixed inset-x-0 top-0 z-50 flex justify-center pt-6 pb-10 md:pt-8'
      style={{
        background:
          'radial-gradient(58.68% 135.88% at 50% -35.88%, #FFFFFF 26.17%, rgba(255, 255, 255, 0) 100%)',
      }}
    >
      <Link href='/' className='pointer-events-auto'>
        <Image
          src='/logo.svg'
          alt='The Westly'
          width={132}
          height={57}
          priority
          className='h-auto w-24 md:w-[132px]'
        />
      </Link>
    </header>
  );
}
