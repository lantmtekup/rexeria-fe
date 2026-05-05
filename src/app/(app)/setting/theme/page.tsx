'use client';

import { Palette } from 'lucide-react';

import { ComingSoonState } from '@/components/molecules/ComingSoonState';

export default function SettingThemePage() {
  return (
    <ComingSoonState
      title='Theme'
      description='Tuỳ chỉnh light / dark mode và brand colors cho workspace của bạn.'
      icon={Palette}
      backHref='/setting'
      backLabel='Settings'
    />
  );
}
