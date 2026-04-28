'use client';

import { use } from 'react';

import { CollectionDetail } from '@/components/modules/Collection/CollectionDetail';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function CollectionDetailPage({ params }: PageProps) {
  const { id } = use(params);
  return <CollectionDetail collectionId={id} />;
}
