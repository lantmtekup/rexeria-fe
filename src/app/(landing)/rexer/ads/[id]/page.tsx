import type { Metadata } from 'next';

import { StudioAdDetail } from '@/components/landing/ad-showcase/StudioAdDetail';

export const metadata: Metadata = {
  title: { absolute: 'Format demo — ReXeR Studio' },
  robots: { index: false },
};

export default async function StudioAdDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { id } = await params;
  const sp = await searchParams;

  // `?embed=1` — trang đang nằm trong iframe của màn khác (Exchange → Smart
  // ads): bỏ thanh chrome, lấy device từ host thay vì toggle của chính nó.
  const embed = sp.embed === '1';
  const raw = Array.isArray(sp.device) ? sp.device[0] : sp.device;
  const device = raw === 'desktop' || raw === 'mobile' ? raw : undefined;

  return (
    <StudioAdDetail id={id} embed={embed} {...(device ? { device } : {})} />
  );
}
