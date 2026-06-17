'use client';

/**
 * Các panel nội dung của editor campaign — KHÔNG tự điều hướng (editor có 1 rail
 * dọc gom nhóm THÔNG TIN / KẾ HOẠCH / AI quyết định panel nào hiện).
 *
 * AI-Insight chỉ là CÔNG CỤ hỗ trợ giai đoạn đầu (sống ở tab AI-Insights) — các
 * panel KHÔNG hiển thị gợi ý AI (strategy / business_context / suggestion blocks
 * + templates). Khi đã ra kết quả (handoff dựng trang), LandingPanel chỉ lấy
 * KẾT QUẢ: block đã chọn + đúng 1 template (không phải list lúc suggestion).
 */

import { ArrowUpRight, Eye, Layers, Package, Pencil } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import { Badge } from '@/components/atoms/badge';
import { Label } from '@/components/atoms/label';
import { LandingPagePicker } from '@/components/molecules/LandingPagePicker';
import { cn } from '@/lib/cn';
import { rexerApi } from '@/services/rexer/endpoints';
import type { Page, Product } from '@/services/rexer/types';

import { StepCampaign, type CampaignState } from './_steps';

const SELECT_CLASS =
  'border-input bg-background h-10 w-full rounded-md border px-3 text-sm outline-none disabled:opacity-60';

const PANEL_CLASS = 'flex max-w-2xl flex-col gap-4';

// ── KẾ HOẠCH · Chiến dịch ─────────────────────────────────────────────────────

/** Panel "Chiến dịch": chỉ tham số campaign (gợi ý AI nằm ở tab AI-Insights). */
export function GeneralPanel({
  campaign,
  onCampaignChange,
}: {
  campaign: CampaignState;
  onCampaignChange: (c: CampaignState) => void;
}) {
  return (
    <div className={PANEL_CLASS}>
      <StepCampaign value={campaign} onChange={onCampaignChange} />
    </div>
  );
}

// ── THÔNG TIN · Sản phẩm ──────────────────────────────────────────────────────

/** Panel "Sản phẩm": chọn product + chi tiết điểm bán. */
export function ProductPanel({
  mode,
  products,
  productId,
  onProductIdChange,
  product,
}: {
  mode: 'create' | 'edit';
  products: Product[] | null;
  productId: string;
  onProductIdChange: (id: string) => void;
  product?: Product;
}) {
  const t = useTranslations('portal');
  return (
    <div className={PANEL_CLASS}>
      <div className='grid gap-1.5'>
        <Label htmlFor='me-product'>{t('marketingEditor.productLabel')}</Label>
        <select
          id='me-product'
          className={SELECT_CLASS}
          value={productId}
          onChange={e => onProductIdChange(e.target.value)}
          disabled={mode === 'edit' || !products?.length}
        >
          {products === null && (
            <option>{t('marketingEditor.loadingProducts')}</option>
          )}
          {products?.length === 0 && (
            <option>{t('marketingEditor.noProducts')}</option>
          )}
          {products?.map(p => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
        {products?.length === 0 && (
          <Link
            href='/portal/products'
            className='text-primary text-xs font-medium hover:underline'
          >
            {t('marketingEditor.createProductFirst')}
          </Link>
        )}
      </div>

      <ProductDetailCard product={product} />
    </div>
  );
}

// ── KẾ HOẠCH · Landing page ───────────────────────────────────────────────────

/** Panel "Landing page": chọn landing + chi tiết landing đã gắn (kết quả cuối —
 *  không hiện gì về AI ở đây; gợi ý AI sống ở tab AI-Insights). */
export function LandingPanel({
  brandId,
  landingId,
  onLandingChange,
}: {
  brandId?: string;
  landingId?: string;
  onLandingChange: (id?: string) => void;
}) {
  const t = useTranslations('portal');
  return (
    <div className={PANEL_CLASS}>
      <div className='grid gap-1.5'>
        <Label>{t('marketingEditor.landingLabel')}</Label>
        <LandingPagePicker
          brandId={brandId}
          value={landingId}
          onChange={onLandingChange}
        />
      </div>

      <LandingDetailCard landingId={landingId} />
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className='text-content-muted mb-1 text-xs font-semibold uppercase'>
        {label}
      </p>
      {children}
    </div>
  );
}

// ── Product detail ────────────────────────────────────────────────────────

function ProductDetailCard({ product }: { product?: Product }) {
  const t = useTranslations('portal');
  if (!product) {
    return (
      <p className='text-content-muted text-sm'>
        {t('marketingCampaignTabs.productEmpty')}
      </p>
    );
  }
  return (
    <div className='border-border flex flex-col gap-3 rounded-xl border p-4'>
      <div className='flex gap-4'>
        {product.thumbnail_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.thumbnail_url}
            alt={product.name}
            className='size-20 shrink-0 rounded-lg object-cover'
          />
        ) : (
          <div className='bg-muted flex size-20 shrink-0 items-center justify-center rounded-lg'>
            <Package className='text-content-muted size-7' />
          </div>
        )}
        <div className='flex min-w-0 flex-1 flex-col gap-1'>
          <div className='flex items-center gap-2'>
            <span className='text-foreground text-sm font-semibold'>
              {product.name}
            </span>
            {product.status && (
              <Badge variant='secondary' className='text-2xs'>
                {product.status}
              </Badge>
            )}
          </div>
          {product.sku && (
            <span className='text-content-muted text-xs'>
              {t('marketingCampaignTabs.sku')}: {product.sku}
            </span>
          )}
          {product.description && (
            <p className='text-content-muted line-clamp-3 text-xs'>
              {product.description}
            </p>
          )}
          <Link
            href={`/portal/products?id=${product.id}`}
            className='text-primary mt-0.5 inline-flex w-fit items-center gap-1 text-xs hover:underline'
          >
            <Pencil className='size-3' />
            {t('marketingCampaignTabs.editProduct')}
          </Link>
        </div>
      </div>

      {/* Điểm bán — nguyên liệu cho thông điệp marketing */}
      {!!product.features?.length && (
        <Field label={t('marketingCampaignTabs.features')}>
          <ul className='flex flex-col gap-1'>
            {product.features.map(f => (
              <li key={f.label} className='text-xs'>
                <span className='text-foreground font-medium'>{f.label}</span>
                {f.description && (
                  <span className='text-content-muted'> — {f.description}</span>
                )}
              </li>
            ))}
          </ul>
        </Field>
      )}

      {!!product.certifications?.length && (
        <Field label={t('marketingCampaignTabs.certifications')}>
          <div className='flex flex-wrap gap-1'>
            {product.certifications.map(c =>
              c.url ? (
                <a
                  key={c.name}
                  href={c.url}
                  target='_blank'
                  rel='noreferrer'
                  className='border-border text-foreground hover:border-primary/40 rounded-md border px-2 py-0.5 text-xs'
                >
                  {c.name}
                </a>
              ) : (
                <span
                  key={c.name}
                  className='border-border text-foreground rounded-md border px-2 py-0.5 text-xs'
                >
                  {c.name}
                </span>
              )
            )}
          </div>
        </Field>
      )}

      {!!product.colors?.length && (
        <Field label={t('marketingCampaignTabs.colors')}>
          <div className='flex flex-wrap gap-2'>
            {product.colors.map(c => (
              <span key={c.name} className='inline-flex items-center gap-1'>
                <span
                  className='border-border size-4 rounded-full border'
                  style={{ backgroundColor: c.hex }}
                />
                <span className='text-foreground text-xs'>{c.name}</span>
                {c.is_default && (
                  <span className='text-content-muted text-2xs'>
                    ({t('marketingCampaignTabs.defaultColor')})
                  </span>
                )}
              </span>
            ))}
          </div>
        </Field>
      )}

      {!!product.sizes?.length && (
        <Field label={t('marketingCampaignTabs.sizes')}>
          <div className='flex flex-wrap gap-1'>
            {product.sizes.map(s => (
              <span
                key={s}
                className='bg-muted text-content-muted rounded px-1.5 py-0.5 text-xs'
              >
                {s}
              </span>
            ))}
          </div>
        </Field>
      )}

      {!!product.ingredients?.length && (
        <Field label={t('marketingCampaignTabs.ingredients')}>
          <p className='text-content-muted text-xs'>
            {product.ingredients.join(', ')}
          </p>
        </Field>
      )}
    </div>
  );
}

// ── Landing detail ──────────────────────────────────────────────────────────

const PAGE_STATUS_CLASS: Record<string, string> = {
  published: 'bg-emerald-100 text-emerald-700',
  draft: 'bg-amber-100 text-amber-700',
  archived: 'bg-muted text-content-muted',
};

function LandingDetailCard({ landingId }: { landingId?: string }) {
  const t = useTranslations('portal');
  const [page, setPage] = useState<Page | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!landingId) {
      setPage(null);
      return;
    }
    let alive = true;
    setLoading(true);
    rexerApi.pages
      .get(landingId)
      .then(p => {
        if (alive) setPage(p);
      })
      .catch(() => {
        if (alive) setPage(null);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [landingId]);

  if (!landingId) {
    return (
      <p className='text-content-muted text-sm'>
        {t('marketingCampaignTabs.noLanding')}
      </p>
    );
  }
  if (loading && !page) {
    return (
      <p className='text-content-muted text-sm'>
        {t('marketingCampaignTabs.loadingLanding')}
      </p>
    );
  }
  if (!page) return null;

  const url = page.external_url || undefined;
  return (
    <div className='border-border flex flex-col gap-3 rounded-xl border p-4'>
      <div className='flex gap-4'>
        {page.thumbnail_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={page.thumbnail_url}
            alt={page.name}
            className='h-16 w-24 shrink-0 rounded-lg object-cover'
          />
        ) : (
          <div className='bg-muted flex h-16 w-24 shrink-0 items-center justify-center rounded-lg'>
            <Layers className='text-content-muted size-6' />
          </div>
        )}
        <div className='flex min-w-0 flex-1 flex-col gap-1'>
          <div className='flex flex-wrap items-center gap-2'>
            <span className='text-foreground text-sm font-semibold'>
              {page.name}
            </span>
            <Badge
              variant='secondary'
              className={cn('text-2xs', PAGE_STATUS_CLASS[page.status])}
            >
              {page.status}
            </Badge>
            <Badge variant='outline' className='text-2xs'>
              {page.type}
            </Badge>
          </div>
          <span className='text-content-muted text-xs'>
            {t('marketingCampaignTabs.slug')}: /{page.slug}
          </span>
          {url && (
            <a
              href={url}
              target='_blank'
              rel='noreferrer'
              className='text-primary inline-flex w-fit items-center gap-0.5 text-xs hover:underline'
            >
              {url} <ArrowUpRight className='size-3' />
            </a>
          )}
        </div>
      </div>

      <div className='flex flex-wrap gap-3'>
        {/* Trang landing thật: external → URL ngoài; nội bộ đã publish → /p/{slug}. */}
        {page.external_url ? (
          <a
            href={page.external_url}
            target='_blank'
            rel='noreferrer'
            className='text-primary inline-flex items-center gap-1 text-xs font-medium hover:underline'
          >
            <Eye className='size-3' />
            {t('marketingCampaignTabs.viewLivePage')}{' '}
            <ArrowUpRight className='size-3' />
          </a>
        ) : (
          page.status === 'published' && (
            <a
              href={`/p/${page.slug}`}
              target='_blank'
              rel='noreferrer'
              className='text-primary inline-flex items-center gap-1 text-xs font-medium hover:underline'
            >
              <Eye className='size-3' />
              {t('marketingCampaignTabs.viewLivePage')}{' '}
              <ArrowUpRight className='size-3' />
            </a>
          )
        )}
        <Link
          href={`/portal/landing-pages/${landingId}/analytics`}
          className='text-primary inline-flex items-center gap-1 text-xs font-medium hover:underline'
        >
          {t('marketingCampaignTabs.viewAnalytics')}{' '}
          <ArrowUpRight className='size-3' />
        </Link>
        {!page.external_url && (
          <Link
            href={`/portal/landing-pages/${landingId}`}
            className='text-primary inline-flex items-center gap-1 text-xs font-medium hover:underline'
          >
            <Pencil className='size-3' />
            {t('marketingCampaignTabs.openEditor')}
          </Link>
        )}
      </div>
    </div>
  );
}
