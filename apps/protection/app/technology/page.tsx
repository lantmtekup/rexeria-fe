import { PageShell } from '../../components/PageShell';

export const metadata = { title: 'technology — Fabrics Protection' };

const TECH = [
  {
    t: 'Biotection',
    d: 'Anti-microbial finish keeping fabrics cleaner for longer.',
  },
  {
    t: 'Problock',
    d: 'High-density blockout core for total light and heat control.',
  },
  {
    t: 'Coatings',
    d: 'Water, oil and UV resistant coatings engineered in-house.',
  },
];

export default function TechnologyPage() {
  return (
    <PageShell title='technology'>
      <p className='max-w-2xl text-lg text-[var(--grey)]/80'>
        Performance engineered into every thread.
      </p>
      <div className='mt-10 grid gap-6 md:grid-cols-3'>
        {TECH.map(t => (
          <div
            key={t.t}
            className='rounded-lg border border-black/10 bg-white p-8'
          >
            <h2 className='dot text-2xl font-semibold text-[var(--yellow)]'>
              {t.t}
            </h2>
            <p className='mt-3 text-sm text-[var(--grey)]/70'>{t.d}</p>
          </div>
        ))}
      </div>
    </PageShell>
  );
}
