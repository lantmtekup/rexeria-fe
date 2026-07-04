import { PageShell } from '../../components/PageShell';
import { FABRIC_CATEGORIES } from '../site';

export const metadata = { title: 'fabrics — Fabrics Protection' };

export default function FabricsPage() {
  return (
    <PageShell title='fabrics'>
      <p className='max-w-2xl text-lg text-[var(--grey)]/80'>
        Technical shade fabrics engineered for design, performance and presence.
        Explore our print and solid collections.
      </p>
      <ul className='mt-10 max-w-3xl'>
        {FABRIC_CATEGORIES.map(c => (
          <li key={c.label} className='border-b border-black/10'>
            <a
              href={c.href}
              className='dot flex items-center justify-between py-4 text-2xl font-semibold text-[var(--yellow)] transition-colors hover:text-[var(--grey)]'
            >
              {c.label}
              <span className='text-base'>→</span>
            </a>
          </li>
        ))}
      </ul>
    </PageShell>
  );
}
