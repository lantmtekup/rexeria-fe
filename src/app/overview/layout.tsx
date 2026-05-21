import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Rexer AI — Workflow Hệ Thống',
  description:
    'Tổng quan kiến trúc, vai trò, luồng nghiệp vụ và các module của nền tảng Rexer AI.',
};

export default function OverviewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
