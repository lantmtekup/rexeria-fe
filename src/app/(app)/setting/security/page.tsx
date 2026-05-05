'use client';

import { ShieldCheck } from 'lucide-react';

import { ComingSoonState } from '@/components/molecules/ComingSoonState';

export default function SettingSecurityPage() {
  return (
    <ComingSoonState
      title='Security'
      description='Quản lý sessions, two-factor và API keys.'
      icon={ShieldCheck}
      backHref='/setting'
      backLabel='Settings'
    />
  );
}
