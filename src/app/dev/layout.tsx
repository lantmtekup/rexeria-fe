import { notFound } from 'next/navigation';

/**
 * /dev/* là preview tooling cho dev (block preview, template thử nghiệm) —
 * không serve ở production (audit FE 2026-07-04 Q7).
 */
export default function DevLayout({ children }: { children: React.ReactNode }) {
  if (process.env.NODE_ENV === 'production') notFound();
  return children;
}
