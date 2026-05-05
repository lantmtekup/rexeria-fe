'use client';

import { UserCircle } from 'lucide-react';

import { ComingSoonState } from '@/components/molecules/ComingSoonState';

export default function SettingProfilePage() {
  return (
    <ComingSoonState
      title='Profile'
      description='Cập nhật display name, email và đổi mật khẩu cá nhân.'
      icon={UserCircle}
      backHref='/setting'
      backLabel='Settings'
    />
  );
}
