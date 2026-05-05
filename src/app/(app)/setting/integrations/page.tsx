'use client';

import { Plug } from 'lucide-react';

import { ComingSoonState } from '@/components/molecules/ComingSoonState';

export default function SettingIntegrationsPage() {
  return (
    <ComingSoonState
      title='Integrations'
      description='Kết nối Google Analytics, webhooks và các dịch vụ ngoài.'
      icon={Plug}
      backHref='/setting'
      backLabel='Settings'
    />
  );
}
