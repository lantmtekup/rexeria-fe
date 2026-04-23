import Link from 'next/link';

import { Button } from '@/components/atoms/button';

export default function ProductStartPage() {
  return (
    <div className='relative flex h-full min-h-[720px] w-full flex-1 items-end overflow-hidden bg-gradient-to-b from-[#fdf5f1] to-[#e4d6cf] p-12'>
      {/* Decorative background — in Figma this is a lifestyle photo. Placeholder gradient here until asset is plugged in. */}
      <div
        aria-hidden
        className='absolute inset-0 bg-[radial-gradient(80%_60%_at_70%_40%,rgba(220,190,170,0.6),transparent_70%)]'
      />
      <div className='text-foreground relative flex max-w-[420px] flex-col gap-4'>
        <h1 className='text-4xl leading-tight font-bold tracking-[-0.02em]'>
          Small Step For
          <br />
          Your Favorite Website
        </h1>
        <p className='text-content-muted text-sm'>
          Import, manage your Product & media easy
        </p>
        <Button asChild variant='primary' size='md' className='w-fit'>
          <Link href='/product/new/information'>Get start</Link>
        </Button>
      </div>
    </div>
  );
}
