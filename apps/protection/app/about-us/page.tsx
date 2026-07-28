import { PageShell } from '../../components/PageShell';

export const metadata = { title: 'about — Fabrics Protection' };

export default function AboutPage() {
  return (
    <PageShell title='about'>
      <div className='grid max-w-4xl gap-10 md:grid-cols-2'>
        <p className='text-2xl leading-snug font-semibold text-[var(--grey)]'>
          A new generation of printed technical fabrics — engineered to shade,
          designed to inspire.
        </p>
        <div className='space-y-4 text-[var(--grey)]/70'>
          <p>
            Protection designs and manufactures technical shade fabrics that
            combine performance with a distinct visual identity.
          </p>
          <p>
            From our facilities in Greece we supply awning, pergola and blind
            makers across an international dealer network.
          </p>
        </div>
      </div>
    </PageShell>
  );
}
