'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

import { LandingFooter } from '@/components/landing/LandingFooter';
import { LandingNavbar } from '@/components/landing/LandingNavbar';

const LandingLayoutContent = ({ children }: { children: React.ReactNode }) => {
  const searchParams = useSearchParams();
  const embed = searchParams.get('embed') === '1';

  if (embed) {
    return (
      <main className='relative h-full min-h-0 overflow-hidden bg-transparent'>
        {children}
      </main>
    );
  }

  return (
    <div className='flex min-h-screen flex-col bg-white text-neutral-900'>
      <LandingNavbar />
      <main className='flex-1'>{children}</main>
      <LandingFooter />
    </div>
  );
};

export const LandingLayoutShell = ({
  children,
}: {
  children: React.ReactNode;
}) => (
  <Suspense
    fallback={
      <main className='relative h-full min-h-0 overflow-hidden bg-transparent'>
        {children}
      </main>
    }
  >
    <LandingLayoutContent>{children}</LandingLayoutContent>
  </Suspense>
);
