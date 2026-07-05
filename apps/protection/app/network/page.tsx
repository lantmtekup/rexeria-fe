import { PageShell } from '../../components/PageShell';

export const metadata = { title: 'network — Fabrics Protection' };

export default function NetworkPage() {
  return (
    <PageShell title='network'>
      <p className='max-w-2xl text-lg text-[var(--grey)]/80'>
        Find an authorised Protection dealer near you. Our fabrics are supplied
        through a curated international network.
      </p>
      <div className='mt-10 flex h-[420px] items-center justify-center rounded-lg border border-black/10 bg-white text-sm text-[var(--grey)]/40'>
        Dealer map — placeholder (gốc dùng agile-store-locator)
      </div>
    </PageShell>
  );
}
