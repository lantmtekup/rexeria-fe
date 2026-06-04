'use client';

import {
  Award,
  Beaker,
  CheckCircle2,
  Clock,
  Filter,
  LayoutTemplate,
  Package,
  Plus,
  Search,
  Sparkles,
  XCircle,
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

import {
  CATEGORY_LABEL,
  FAKE_PRODUCTS,
  type PortalProduct,
  type ProductCategory,
} from '../_data';
import { ApiStatusLabel, loadProducts } from '../_remote';
import { PortalShell } from '../_shell';
import { ProductFormModal } from './_product-modal';

const STATUS_META: Record<
  PortalProduct['status'],
  { label: string; chip: string; icon: typeof Sparkles }
> = {
  active: {
    label: 'Active',
    chip: 'bg-emerald-100 text-emerald-700',
    icon: CheckCircle2,
  },
  coming_soon: {
    label: 'Coming soon',
    chip: 'bg-amber-100 text-amber-700',
    icon: Sparkles,
  },
  discontinued: {
    label: 'Discontinued',
    chip: 'bg-muted text-content-muted',
    icon: XCircle,
  },
};

type CatFilter = 'all' | ProductCategory;

export default function PortalProductsPage() {
  const [products, setProducts] = useState<PortalProduct[]>(FAKE_PRODUCTS);
  const [source, setSource] = useState<'live' | 'fake'>('fake');
  const [loadError, setLoadError] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [catFilter, setCatFilter] = useState<CatFilter>('all');
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<PortalProduct | null>(
    null
  );

  // Try real BE on mount; fallback to fake data
  useEffect(() => {
    let cancelled = false;
    loadProducts().then(res => {
      if (cancelled) return;
      setProducts(res.data);
      setSource(res.source);
      setLoadError(res.error);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: products.length };
    for (const p of products) {
      c[p.category] = (c[p.category] || 0) + 1;
    }
    return c;
  }, [products]);

  const handleSaveProduct = (p: PortalProduct) => {
    setProducts(prev => {
      const idx = prev.findIndex(x => x.id === p.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = p;
        return next;
      }
      return [p, ...prev];
    });
  };

  const openCreate = () => {
    setEditingProduct(null);
    setModalOpen(true);
  };

  const openEdit = (p: PortalProduct) => {
    setEditingProduct(p);
    setModalOpen(true);
  };

  const filtered = products.filter(p => {
    if (catFilter !== 'all' && p.category !== catFilter) return false;
    if (search) {
      const s = search.toLowerCase();
      if (
        !p.name.toLowerCase().includes(s) &&
        !p.sku.toLowerCase().includes(s)
      ) {
        return false;
      }
    }
    return true;
  });

  return (
    <PortalShell>
      <section className='flex flex-wrap items-end justify-between gap-4'>
        <div>
          <div className='text-2xs text-content-muted flex items-center gap-2 font-semibold tracking-wider uppercase'>
            <Package className='size-3' /> Product Information
          </div>
          <h1 className='mt-1 text-2xl font-bold tracking-tight'>
            Catalog sản phẩm
          </h1>
          <p className='text-content-muted mt-1 text-sm'>
            {products.length} sản phẩm trong workspace. Rexer dùng thông tin này
            khi tạo landing page tự động (AI apply-product).
          </p>
        </div>
        <div className='flex items-center gap-2'>
          {source === 'live' && (
            <span className='text-3xs inline-flex items-center gap-1.5 rounded-full border border-emerald-300 bg-emerald-50 px-2 py-0.5 font-bold tracking-wider text-emerald-700'>
              <span className='size-1.5 animate-pulse rounded-full bg-emerald-500' />
              LIVE BE
            </span>
          )}
          {loading && (
            <span className='text-2xs text-muted-foreground font-mono'>
              loading…
            </span>
          )}
          <button
            onClick={openCreate}
            className='flex items-center gap-1.5 rounded-lg bg-orange-500 px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-orange-600'
          >
            <Plus className='size-3.5' /> Thêm sản phẩm
          </button>
        </div>
      </section>

      <ApiStatusLabel source={source} error={loadError} />

      <ProductFormModal
        open={modalOpen}
        product={editingProduct}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveProduct}
        liveBE={source === 'live'}
      />

      {/* Filter bar */}
      <div className='border-border mt-5 flex flex-wrap items-center gap-3 rounded-2xl border bg-white p-3 shadow-sm'>
        <div className='border-border bg-muted flex flex-1 items-center gap-2 rounded-lg border px-3 py-1.5 lg:max-w-sm'>
          <Search className='text-muted-foreground size-3.5' />
          <input
            type='text'
            placeholder='Tìm theo tên / SKU...'
            value={search}
            onChange={e => setSearch(e.target.value)}
            className='placeholder:text-muted-foreground flex-1 bg-transparent text-sm outline-none'
          />
        </div>
        <Filter className='text-muted-foreground size-3.5' />
        <div className='flex flex-wrap items-center gap-1'>
          <CatBtn
            label={`Tất cả · ${counts.all}`}
            active={catFilter === 'all'}
            color='bg-zinc-900'
            onClick={() => setCatFilter('all')}
          />
          {(Object.keys(CATEGORY_LABEL) as ProductCategory[]).map(c => {
            const meta = CATEGORY_LABEL[c];
            return (
              <CatBtn
                key={c}
                label={`${meta.label} · ${counts[c] ?? 0}`}
                active={catFilter === c}
                color={meta.color}
                onClick={() => setCatFilter(c)}
              />
            );
          })}
        </div>
      </div>

      {/* Products grid */}
      <div className='mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3'>
        {filtered.length === 0 ? (
          <div className='border-border text-content-muted col-span-full rounded-2xl border border-dashed bg-white p-10 text-center text-sm'>
            Không có sản phẩm nào khớp filter.
          </div>
        ) : (
          filtered.map(p => (
            <ProductCard key={p.id} p={p} onEdit={() => openEdit(p)} />
          ))
        )}
      </div>
    </PortalShell>
  );
}

function CatBtn({
  label,
  active,
  color,
  onClick,
}: {
  label: string;
  active: boolean;
  color: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`text-2xs rounded-full px-2.5 py-1 font-medium transition-all ${
        active
          ? `${color} text-white shadow-sm`
          : 'border-border text-content-muted hover:bg-muted border bg-white'
      }`}
    >
      {label}
    </button>
  );
}

function ProductCard({ p, onEdit }: { p: PortalProduct; onEdit: () => void }) {
  const status = STATUS_META[p.status];
  const StatusIcon = status.icon;
  const catMeta = CATEGORY_LABEL[p.category];
  const minPrice = Math.min(...p.sizes.map(s => s.price_vnd));
  const maxPrice = Math.max(...p.sizes.map(s => s.price_vnd));

  return (
    <div className='group border-border overflow-hidden rounded-2xl border bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md'>
      {/* Cover */}
      <div
        className={`relative aspect-[4/3] bg-gradient-to-br ${p.cover_gradient}`}
      >
        {p.thumbnail_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={p.thumbnail_url}
            alt={p.name}
            className='absolute inset-0 h-full w-full object-cover'
          />
        )}
        <div className='absolute inset-0 bg-gradient-to-t from-black/30 to-transparent' />
        {/* Status + category chips */}
        <div className='absolute top-3 left-3 flex flex-wrap items-center gap-1.5'>
          <span
            className={`text-3xs flex items-center gap-1 rounded-full bg-white/95 px-2 py-0.5 font-bold backdrop-blur ${status.chip}`}
          >
            <StatusIcon className='size-2.5' /> {status.label}
          </span>
          <span
            className={`rounded-full ${catMeta.color} text-3xs px-2 py-0.5 font-bold text-white shadow-sm`}
          >
            {catMeta.label}
          </span>
        </div>

        {/* SKU on top right */}
        <span className='text-3xs absolute top-3 right-3 rounded-md bg-black/40 px-1.5 py-0.5 font-mono text-white backdrop-blur'>
          {p.sku}
        </span>

        {/* Bottle/can preview placeholder — only when no real cover image */}
        {!p.thumbnail_url && (
          <div className='absolute inset-x-8 bottom-4 flex items-center justify-center'>
            <div className='flex items-center gap-1.5'>
              {p.sizes.slice(0, 3).map((s, i) => (
                <div
                  key={i}
                  className='flex flex-col items-center gap-0.5 rounded bg-white/90 px-2 py-1 shadow-md backdrop-blur'
                >
                  <span className='text-3xs text-foreground font-mono font-bold'>
                    {s.volume_ml}ml
                  </span>
                  <span className='text-3xs text-content-muted'>{s.label}</span>
                </div>
              ))}
              {p.sizes.length > 3 && (
                <div className='text-3xs text-foreground rounded bg-white/90 px-2 py-1 font-mono font-bold shadow-md backdrop-blur'>
                  +{p.sizes.length - 3}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Body */}
      <div className='p-4'>
        <h3 className='text-sm font-bold tracking-tight'>{p.name}</h3>
        <p className='text-2xs text-content-muted mt-1 line-clamp-2 leading-snug'>
          {p.description}
        </p>

        {/* Price range */}
        <div className='border-border mt-3 flex items-center gap-2 border-y py-2'>
          <span className='text-3xs text-content-muted font-semibold tracking-wider uppercase'>
            Giá
          </span>
          <span className='text-foreground font-mono text-sm font-bold'>
            {minPrice.toLocaleString('vi-VN')}đ
            {minPrice !== maxPrice && (
              <span className='text-muted-foreground'>
                {' '}
                – {maxPrice.toLocaleString('vi-VN')}đ
              </span>
            )}
          </span>
          <span className='text-3xs bg-muted text-content-muted ml-auto rounded px-1.5 py-0.5 font-mono'>
            {p.sizes.length} size
          </span>
        </div>

        {/* Features */}
        {p.features.length > 0 && (
          <div className='mt-3 space-y-1'>
            {p.features.slice(0, 2).map(f => (
              <div key={f.label} className='text-2xs flex items-start gap-1.5'>
                <Sparkles className='mt-0.5 size-2.5 shrink-0 text-orange-500' />
                <div>
                  <span className='text-foreground font-semibold'>
                    {f.label}
                  </span>
                  <span className='text-content-muted'> — {f.description}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Ingredients + certs (collapsed) */}
        <div className='mt-3 flex flex-wrap gap-1'>
          {p.certifications.slice(0, 3).map(c => (
            <span
              key={c}
              className='text-3xs inline-flex items-center gap-0.5 rounded border border-emerald-200 bg-emerald-50 px-1.5 py-0.5 font-medium text-emerald-700'
            >
              <Award className='size-2' /> {c}
            </span>
          ))}
          {p.ingredients.length > 0 && (
            <span className='text-3xs border-border bg-muted text-content-muted inline-flex items-center gap-0.5 rounded border px-1.5 py-0.5'>
              <Beaker className='size-2' /> {p.ingredients.length} thành phần
            </span>
          )}
        </div>

        {/* Actions */}
        <div className='mt-4 flex items-center gap-2'>
          {p.related_template_ids.length > 0 ? (
            <Link
              href={`/overview/analytics/templates/${p.related_template_ids[0]}?range=30d`}
              className='flex flex-1 items-center justify-center gap-1 rounded-lg bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-zinc-700'
            >
              <LayoutTemplate className='size-3' />
              Landing page gắn ({p.related_template_ids.length})
            </Link>
          ) : (
            <span className='text-2xs border-border text-muted-foreground flex flex-1 items-center justify-center gap-1 rounded-lg border border-dashed bg-white px-3 py-1.5'>
              <Clock className='size-3' /> Chưa có landing page
            </span>
          )}
          <button
            onClick={onEdit}
            className='border-border text-content-muted hover:bg-muted rounded-lg border bg-white px-3 py-1.5 text-xs font-medium'
          >
            Sửa
          </button>
        </div>
      </div>
    </div>
  );
}
