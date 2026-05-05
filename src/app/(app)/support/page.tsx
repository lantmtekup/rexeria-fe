'use client';

import { MessageCircleQuestion } from 'lucide-react';

import { ComingSoonState } from '@/components/molecules/ComingSoonState';

export default function SupportPage() {
  return (
    <ComingSoonState
      title='Trung tâm hỗ trợ'
      description='Tài liệu, FAQ, và kênh liên hệ với team REXER sẽ xuất hiện tại đây.'
      icon={MessageCircleQuestion}
    />
  );
}
