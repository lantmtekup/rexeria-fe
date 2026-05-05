'use client';

import { Bell } from 'lucide-react';

import { ComingSoonState } from '@/components/molecules/ComingSoonState';

export default function NotificationPage() {
  return (
    <ComingSoonState
      title='Thông báo'
      description='Trung tâm thông báo sẽ tổng hợp các sự kiện liên quan đến product, AI agents và team — đang được dựng.'
      icon={Bell}
    />
  );
}
