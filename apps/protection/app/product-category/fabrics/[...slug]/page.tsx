import { PageShell } from '../../../../components/PageShell';
import { FABRIC_CATEGORIES } from '../../../site';

export function generateStaticParams() {
  // Mirror các category crawl được (prints/*, solids/*).
  return [
    { slug: ['prints'] },
    { slug: ['prints', 's-line'] },
    { slug: ['prints', 'classic'] },
    { slug: ['prints', 's-line-one'] },
    { slug: ['prints', 's-line-stripes'] },
    { slug: ['prints', 's-block'] },
    { slug: ['solids'] },
    { slug: ['solids', 'problock'] },
    { slug: ['solids', 'problock-500'] },
    { slug: ['solids', 'polyester'] },
  ];
}

const TILE = [
  '#c9c2b4',
  '#8f9aa3',
  '#5b6670',
  '#e4dccb',
  '#a8b0a0',
  '#d8c9a0',
  '#b6a894',
  '#7d8792',
  '#cfd3d6',
  '#9a8f7d',
  '#e0d4c2',
  '#6f7a83',
];

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = await params;
  const title = (slug[slug.length - 1] || 'fabrics').replace(/-/g, ' ');
  const match = FABRIC_CATEGORIES.find(c => c.href.endsWith(slug.join('/')));

  return (
    <PageShell crumb='fabrics' title={title.toLowerCase()}>
      <p className='max-w-2xl text-lg text-[var(--grey)]/80'>
        {match?.label ?? title.toUpperCase()} collection — technical shade
        fabric swatches. Colour references are indicative.
      </p>
      <div className='mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4'>
        {TILE.map((c, i) => (
          <div
            key={i}
            className='overflow-hidden rounded-lg border border-black/10 bg-white'
          >
            <div className='aspect-square' style={{ background: c }} />
            <div className='px-4 py-3 text-sm font-semibold text-[var(--grey)]'>
              {title.toUpperCase()} 0{i + 1}
            </div>
          </div>
        ))}
      </div>
    </PageShell>
  );
}
