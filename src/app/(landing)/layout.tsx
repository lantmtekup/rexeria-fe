import { LandingFooter } from '@/components/landing/LandingFooter';
import { LandingNavbar } from '@/components/landing/LandingNavbar';

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className='flex min-h-screen flex-col bg-white text-neutral-900'>
      <LandingNavbar />
      <main className='flex-1'>{children}</main>
      <LandingFooter />
    </div>
  );
}
