import { PageShell } from '../../components/PageShell';
import { DOWNLOADS } from '../site';

export const metadata = { title: 'downloads — Fabrics Protection' };

export default function DownloadsPage() {
  return (
    <PageShell title='downloads'>
      <ul className='max-w-3xl'>
        {DOWNLOADS.map(d => (
          <li key={d} className='border-b border-black/10'>
            <a
              href='#'
              className='flex items-center justify-between py-4 text-lg font-semibold text-[var(--yellow)] transition-colors hover:text-[var(--grey)]'
            >
              {d}
              <span className='text-sm'>↓</span>
            </a>
          </li>
        ))}
      </ul>
      <p className='dot mt-10 max-w-xs text-2xl leading-snug font-semibold text-[var(--grey)]'>
        New generation printed technical fabrics
      </p>
    </PageShell>
  );
}
