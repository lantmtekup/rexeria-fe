'use client';

import { useParams } from 'next/navigation';

import { AdminClientDetailPage } from '@/components/modules/Admin/AdminClientDetailPage';

export default function AdminClientDetailRoute() {
  const params = useParams<{ id: string }>();
  const id = params?.id ?? '';
  return <AdminClientDetailPage clientId={id} />;
}
