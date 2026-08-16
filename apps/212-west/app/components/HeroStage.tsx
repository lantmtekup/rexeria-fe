'use client';

import DesignedForNewYorkers from '@/app/components/DesignedForNewYorkers';
import Hero from '@/app/components/Hero';

export default function HeroStage() {
  return (
    <div className='relative w-full bg-[#0F0F0E]'>
      <Hero />
      <DesignedForNewYorkers />
    </div>
  );
}
