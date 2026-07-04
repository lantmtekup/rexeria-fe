import { PageShell } from '../../components/PageShell';

export const metadata = { title: 'applications — Fabrics Protection' };

const APPLICATIONS = [
  {
    t: 'Awnings',
    d: 'Folding-arm, cassette and drop-arm systems for facades and terraces.',
  },
  {
    t: 'Pergolas',
    d: 'Retractable and fixed pergola covers engineered for wind and UV.',
  },
  {
    t: 'Blinds',
    d: 'Interior and exterior roller systems with precise light control.',
  },
  {
    t: 'Interiors',
    d: 'Decorative and functional textiles for interior shading.',
  },
];

export default function ApplicationsPage() {
  return (
    <PageShell title='applications'>
      <p className='max-w-2xl text-lg text-[var(--grey)]/80'>
        From facades to interiors — where our fabrics perform.
      </p>
      <div className='mt-10 grid gap-8 md:grid-cols-2'>
        {APPLICATIONS.map(a => (
          <div
            key={a.t}
            className='rounded-lg border border-black/10 bg-white p-8'
          >
            <h2 className='dot text-3xl font-semibold text-[var(--grey)]'>
              {a.t}
            </h2>
            <p className='mt-3 text-[var(--grey)]/70'>{a.d}</p>
          </div>
        ))}
      </div>
    </PageShell>
  );
}
