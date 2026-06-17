'use client';

import {
  Award,
  Check,
  ChevronLeft,
  ChevronRight,
  FlaskConical,
  ImagePlus,
  Loader2,
  Package,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

import {
  CategoryField,
  CertField,
  TagsField,
  ColorsField,
  emptyProductInformation,
  type ProductInformationValue,
} from '@/components/modules/Product/ProductInformationEditor';
import type { MediaAsset } from '@/services/rexer/types';
import { Button } from '@/components/atoms/button';
import { cn } from '@/lib/cn';

import {
  CATEGORY_LABEL,
  type PortalProduct,
  type ProductCategory,
} from '../_data';
import {
  createProductRemote,
  portalProductToBE,
  updateProductRemote,
  uploadProductImage,
} from '../_remote';

const RANDOM_GRADIENTS = [
  'from-red-500 to-rose-700',
  'from-zinc-800 to-black',
  'from-orange-400 to-amber-500',
  'from-pink-400 to-rose-500',
  'from-emerald-400 to-lime-500',
  'from-amber-400 to-orange-500',
  'from-sky-400 to-blue-500',
  'from-blue-500 to-violet-600',
];

/* ---------- adapters PortalProduct ↔ ProductInformationValue ---------- */

const CATEGORY_TO_LABEL: Record<ProductCategory, string> = {
  carbonated: 'Đồ uống có ga',
  juice: 'Nước ép trái cây',
  water: 'Nước khoáng',
  energy: 'Đồ uống tăng lực',
};

const LABEL_TO_CATEGORY: Record<string, ProductCategory> = {
  'Đồ uống có ga': 'carbonated',
  'Nước ép trái cây': 'juice',
  'Nước khoáng': 'water',
  'Đồ uống tăng lực': 'energy',
};

function portalToEditor(p: PortalProduct): ProductInformationValue {
  return {
    name: p.name,
    category: CATEGORY_TO_LABEL[p.category] ?? p.category,
    description: p.description,
    sku: p.sku,
    sizes: p.sizes.map(s => `${s.volume_ml}ml (${s.label})`),
    colors:
      p.colors?.map((c, i) => ({
        name: c.name,
        hex: c.hex,
        is_default: i === 0,
        sort_order: i,
      })) ?? [],
    variants: [],
    ingredients: p.ingredients,
    certifications: p.certifications.map(c => ({ name: c })),
  };
}

function editorToPortal(
  v: ProductInformationValue,
  base: PortalProduct | null,
  thumbnailUrl?: string
): PortalProduct {
  const inferredCategory: ProductCategory =
    LABEL_TO_CATEGORY[v.category] ??
    (Object.keys(CATEGORY_LABEL) as ProductCategory[]).find(k =>
      v.category.toLowerCase().includes(CATEGORY_LABEL[k].label.toLowerCase())
    ) ??
    'carbonated';

  const parsedSizes = v.sizes.map((s, idx) => {
    const m = s.match(/^(\d+)\s*ml\s*(?:\(([^)]*)\))?$/i);
    if (m) {
      const ml = parseInt(m[1], 10);
      const label = m[2] || `Size ${idx + 1}`;
      const existing = base?.sizes.find(bs => bs.volume_ml === ml);
      return {
        label,
        volume_ml: ml,
        price_vnd: existing?.price_vnd ?? 10_000 + idx * 5_000,
      };
    }
    return {
      label: s || `Size ${idx + 1}`,
      volume_ml: 330,
      price_vnd: base?.sizes[idx]?.price_vnd ?? 10_000,
    };
  });

  return {
    id: base?.id ?? `p_${Date.now()}`,
    name: v.name.trim() || 'Untitled product',
    sku:
      v.sku.trim() || `SKU-${Date.now().toString(36).slice(-6).toUpperCase()}`,
    category: inferredCategory,
    status: base?.status ?? 'active',
    cover_gradient:
      base?.cover_gradient ??
      RANDOM_GRADIENTS[Math.floor(Math.random() * RANDOM_GRADIENTS.length)],
    thumbnail_url: thumbnailUrl ?? base?.thumbnail_url,
    description: v.description.trim(),
    sizes:
      parsedSizes.length > 0
        ? parsedSizes
        : [{ label: 'Default', volume_ml: 330, price_vnd: 10_000 }],
    colors:
      v.colors.length > 0
        ? v.colors.map(c => ({ name: c.name, hex: c.hex }))
        : undefined,
    ingredients: v.ingredients,
    certifications: v.certifications.map(c => c.name),
    features: base?.features ?? [],
    related_template_ids: base?.related_template_ids ?? [],
    created_at: base?.created_at ?? new Date().toISOString(),
  };
}

/* ---------- pending image (local preview before/after upload) ---------- */

interface PendingImage {
  key: string;
  preview: string; // object URL or remote URL
  file?: File; // present when not yet uploaded
  asset?: MediaAsset; // present after upload
}

/* ---------- wizard steps ---------- */

const STEPS = [
  { key: 'basic', labelKey: 'stepBasic', icon: Package },
  { key: 'media', labelKey: 'stepMedia', icon: ImagePlus },
  { key: 'specs', labelKey: 'stepSpecs', icon: Sparkles },
  { key: 'cert', labelKey: 'stepCert', icon: Award },
] as const;

/** Mẫu fill nhanh — sản phẩm thật từ mint.ca (The Jack Pine 1kg gold coin). */
const SAMPLE_PRODUCT: ProductInformationValue = {
  name: 'The Jack Pine by Tom Thomson: 1 Kilo Pure Gold Coin',
  category: '',
  description:
    'Commemorative 1-kilo pure gold coin celebrating Tom Thomson’s iconic ' +
    '1916-17 painting. An engraved interpretation of a windswept jack pine ' +
    'against a distant shoreline, a symbol of Canadian wilderness and ' +
    'resilience. The monochromatic gold format emphasises composition and ' +
    'emotional depth over colour.',
  sku: '252469',
  sizes: ['1006.1 g', 'Ø 101.6 mm'],
  colors: [{ name: 'Yellow', hex: '#FACC15', is_default: true }],
  variants: ['252469', 'Proof'],
  ingredients: ['99.99% pure gold', 'Face value $2,500 CAD'],
  certifications: [
    { name: 'Proof finish' },
    { name: 'Mintage 75 worldwide' },
    { name: 'Serialized certificate' },
  ],
};

/* ---------- modal ---------- */

export function ProductFormModal({
  open,
  product,
  onClose,
  onSave,
  liveBE = false,
  brandId,
}: {
  open: boolean;
  product: PortalProduct | null; // null = create mode
  onClose: () => void;
  onSave: (p: PortalProduct) => void;
  liveBE?: boolean;
  /** Admin tạo hộ brand → gắn brand_id vào product mới (portal bỏ trống). */
  brandId?: string;
}) {
  const t = useTranslations('portal');
  const [value, setValue] = useState<ProductInformationValue>(
    emptyProductInformation()
  );
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [thumbnail, setThumbnail] = useState<PendingImage | null>(null);
  const [gallery, setGallery] = useState<PendingImage[]>([]);
  const keyCounter = useRef(0);
  const nextKey = () => `img-${keyCounter.current++}`;

  // Reset when product / open changes
  useEffect(() => {
    if (!open) return;
    setValue(product ? portalToEditor(product) : emptyProductInformation());
    setStep(0);
    setThumbnail(
      product?.thumbnail_url
        ? { key: 'existing', preview: product.thumbnail_url }
        : null
    );
    setGallery([]);
  }, [open, product]);

  if (!open) return null;

  const isEdit = !!product;
  const canNext = step > 0 || value.name.trim().length > 0;

  const addThumbnail = (file: File) => {
    setThumbnail({ key: nextKey(), preview: URL.createObjectURL(file), file });
  };
  const addGallery = (files: FileList) => {
    const next = Array.from(files).map(file => ({
      key: nextKey(),
      preview: URL.createObjectURL(file),
      file,
    }));
    setGallery(prev => [...prev, ...next]);
  };

  const handleSave = async () => {
    if (!value.name.trim()) {
      toast.error(t('productsProductModal.nameRequiredToast'));
      setStep(0);
      return;
    }
    setSaving(true);
    let next: PortalProduct;

    try {
      if (liveBE) {
        // 1) upload all pending images → collect media_ids + thumbnail url.
        // Image upload is best-effort: if the media endpoint fails (BE cutover
        // gaps), we still create the product without images rather than
        // aborting the whole flow.
        const mediaIds: string[] = [];
        let thumbUrl = product?.thumbnail_url;
        let imageFailed = false;
        const tryUpload = async (file: File): Promise<MediaAsset | null> => {
          try {
            return await uploadProductImage(file);
          } catch {
            imageFailed = true;
            return null;
          }
        };

        if (thumbnail?.file) {
          const a = await tryUpload(thumbnail.file);
          if (a) {
            mediaIds.push(a.id);
            thumbUrl = a.public_url ?? thumbUrl;
          }
        }
        for (const g of gallery) {
          if (g.file) {
            const a = await tryUpload(g.file);
            if (a) mediaIds.push(a.id);
          }
        }

        // 2) create / update product with images attached
        const payload = portalProductToBE(value, {
          thumbnail_url: thumbUrl,
          media_ids: mediaIds,
        });
        const result = isEdit
          ? await updateProductRemote(product!.id, payload)
          : await createProductRemote(
              brandId ? { ...payload, brand_id: brandId } : payload
            );

        if (result) {
          next = { ...editorToPortal(value, product, thumbUrl), ...result };
          if (imageFailed) {
            toast.warning(
              isEdit
                ? t('productsProductModal.savedToast', { name: result.name })
                : t('productsProductModal.createdToast', { name: result.name }),
              { description: t('productsProductModal.imageUploadFailedDesc') }
            );
          } else {
            toast.success(
              isEdit
                ? t('productsProductModal.savedToast', { name: result.name })
                : t('productsProductModal.createdToast', { name: result.name })
            );
          }
        } else {
          next = editorToPortal(value, product, thumbnail?.preview);
          toast.error(t('productsProductModal.beErrorSavedLocalToast'), {
            description: t('productsProductModal.beErrorSavedLocalDesc'),
          });
        }
      } else {
        // local mode — use object-URL preview as thumbnail
        next = editorToPortal(value, product, thumbnail?.preview);
        toast.success(
          isEdit
            ? t('productsProductModal.savedLocalToast', { name: next.name })
            : t('productsProductModal.createdLocalToast', { name: next.name })
        );
      }

      onSave(next);
      onClose();
    } catch (err) {
      toast.error(t('productsProductModal.saveFailedToast'), {
        description: err instanceof Error ? err.message : String(err),
      });
    } finally {
      setSaving(false);
    }
  };

  const isLast = step === STEPS.length - 1;

  return (
    <div
      className='fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4 backdrop-blur-sm'
      onClick={onClose}
    >
      <div
        className='bg-card my-8 flex w-full max-w-2xl flex-col overflow-hidden rounded-2xl shadow-2xl'
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className='border-border flex items-center justify-between gap-3 border-b px-5 py-3.5'>
          <div className='flex items-center gap-2.5'>
            <div className='flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 text-white shadow-sm'>
              <Package className='size-4' />
            </div>
            <div>
              <h3 className='text-base leading-tight font-semibold'>
                {isEdit
                  ? t('productsProductModal.editTitle')
                  : t('productsProductModal.createTitle')}
              </h3>
              <p className='text-2xs text-content-muted mt-0.5'>
                {isEdit
                  ? product!.sku
                  : t('productsProductModal.createSubtitle')}
              </p>
            </div>
          </div>
          <div className='flex items-center gap-2'>
            {!isEdit && (
              <Button
                type='button'
                variant='neutral'
                size='xs'
                onClick={() => setValue(SAMPLE_PRODUCT)}
                title={t('productsProductModal.fillSampleHint')}
              >
                <FlaskConical className='size-3.5' />
                {t('productsProductModal.fillSample')}
              </Button>
            )}
            <Button
              type='button'
              variant='ghost'
              size='icon'
              onClick={onClose}
              aria-label='Close'
            >
              <X className='size-4' />
            </Button>
          </div>
        </div>

        {/* Stepper */}
        <div className='border-border flex items-center gap-1 border-b px-5 py-3'>
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const active = i === step;
            const done = i < step;
            return (
              <div key={s.key} className='flex flex-1 items-center'>
                <button
                  type='button'
                  onClick={() => (i < step || canNext) && setStep(i)}
                  className='flex items-center gap-2'
                >
                  <span
                    className={cn(
                      'text-2xs flex size-6 items-center justify-center rounded-full font-bold transition-colors',
                      active && 'bg-orange-500 text-white',
                      done && 'bg-emerald-500 text-white',
                      !active && !done && 'bg-muted text-muted-foreground'
                    )}
                  >
                    {done ? (
                      <Check className='size-3.5' />
                    ) : (
                      <Icon className='size-3.5' />
                    )}
                  </span>
                  <span
                    className={cn(
                      'text-xs font-medium',
                      active ? 'text-foreground' : 'text-muted-foreground'
                    )}
                  >
                    {t(`productsProductModal.${s.labelKey}`)}
                  </span>
                </button>
                {i < STEPS.length - 1 && (
                  <span
                    className={cn(
                      'mx-2 h-px flex-1',
                      done ? 'bg-emerald-300' : 'bg-border'
                    )}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Body */}
        <div className='min-h-[320px] space-y-4 px-5 py-4'>
          {/* Step 0 — Cơ bản */}
          {step === 0 && (
            <div className='space-y-4'>
              <div>
                <label className='text-3xs text-content-muted block font-semibold tracking-wider uppercase'>
                  {t('productsProductModal.nameLabel')}{' '}
                  <span className='text-destructive'>*</span>
                </label>
                <input
                  type='text'
                  value={value.name}
                  onChange={e =>
                    setValue(v => ({ ...v, name: e.target.value }))
                  }
                  placeholder={t('productsProductModal.namePlaceholder')}
                  className='border-border mt-1.5 w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100'
                  maxLength={128}
                  autoFocus
                />
              </div>
              <div className='grid grid-cols-1 gap-3 md:grid-cols-2'>
                <CategoryField
                  value={value.category}
                  onChange={v => setValue(s => ({ ...s, category: v }))}
                />
                <div className='border-border bg-background flex items-start gap-2 rounded-xl border px-4 py-3'>
                  <div className='min-w-0 flex-1'>
                    <div className='text-content-muted text-xs font-semibold'>
                      SKU
                    </div>
                    <input
                      type='text'
                      value={value.sku}
                      onChange={e =>
                        setValue(s => ({ ...s, sku: e.target.value }))
                      }
                      placeholder={t('productsProductModal.skuPlaceholder')}
                      className='placeholder:text-content-muted mt-0.5 w-full bg-transparent text-sm font-medium outline-none'
                    />
                  </div>
                </div>
              </div>
              <div className='border-border bg-background rounded-xl border px-4 py-3'>
                <div className='text-content-muted text-xs font-semibold'>
                  {t('productsProductModal.descriptionLabel')}
                </div>
                <textarea
                  value={value.description}
                  onChange={e =>
                    setValue(s => ({ ...s, description: e.target.value }))
                  }
                  placeholder={t('productsProductModal.descriptionPlaceholder')}
                  rows={2}
                  className='placeholder:text-content-muted mt-1 w-full resize-none bg-transparent text-sm outline-none'
                />
              </div>
              {/* Thumbnail */}
              <div>
                <label className='text-3xs text-content-muted block font-semibold tracking-wider uppercase'>
                  {t('productsProductModal.thumbnailLabel')}
                </label>
                {thumbnail ? (
                  <div className='mt-1.5 flex items-center gap-3'>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={thumbnail.preview}
                      alt='thumbnail'
                      className='border-border size-20 rounded-lg border object-cover'
                    />
                    <Button
                      type='button'
                      variant='neutral'
                      size='xs'
                      onClick={() => setThumbnail(null)}
                    >
                      <Trash2 className='size-3.5' />{' '}
                      {t('productsProductModal.removeBtn')}
                    </Button>
                  </div>
                ) : (
                  <label className='border-border text-content-muted mt-1.5 flex h-20 w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed text-sm hover:border-orange-300 hover:bg-orange-50/40'>
                    <ImagePlus className='size-4' />{' '}
                    {t('productsProductModal.uploadImageBtn')}
                    <input
                      type='file'
                      accept='image/*'
                      className='hidden'
                      onChange={e =>
                        e.target.files?.[0] && addThumbnail(e.target.files[0])
                      }
                    />
                  </label>
                )}
              </div>
            </div>
          )}

          {/* Step 1 — Hình ảnh (gallery) */}
          {step === 1 && (
            <div>
              <p className='text-content-muted mb-3 text-sm'>
                {t('productsProductModal.galleryHint', {
                  count: gallery.length,
                })}
              </p>
              <div className='grid grid-cols-3 gap-3 sm:grid-cols-4'>
                {gallery.map(g => (
                  <div
                    key={g.key}
                    className='group border-border relative aspect-square overflow-hidden rounded-lg border'
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={g.preview}
                      alt='gallery'
                      className='h-full w-full object-cover'
                    />
                    <button
                      type='button'
                      onClick={() =>
                        setGallery(prev => prev.filter(x => x.key !== g.key))
                      }
                      className='absolute top-1 right-1 hidden rounded-md bg-black/60 p-1 text-white group-hover:block'
                      aria-label='Remove'
                    >
                      <Trash2 className='size-3' />
                    </button>
                  </div>
                ))}
                <label className='text-2xs border-border text-content-muted flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border border-dashed hover:border-orange-300 hover:bg-orange-50/40'>
                  <ImagePlus className='size-5' />
                  {t('productsProductModal.addImageBtn')}
                  <input
                    type='file'
                    accept='image/*'
                    multiple
                    className='hidden'
                    onChange={e => e.target.files && addGallery(e.target.files)}
                  />
                </label>
              </div>
            </div>
          )}

          {/* Step 2 — Thông số */}
          {step === 2 && (
            <div className='grid grid-cols-1 gap-3 md:grid-cols-2'>
              <TagsField
                label='Size'
                placeholder={t('productsProductModal.sizePlaceholder')}
                testId='size-input'
                value={value.sizes}
                onChange={v => setValue(s => ({ ...s, sizes: v }))}
              />
              <ColorsField
                value={value.colors}
                onChange={v => setValue(s => ({ ...s, colors: v }))}
              />
              <TagsField
                label='Variant'
                placeholder={t('productsProductModal.variantPlaceholder')}
                testId='variant-input'
                value={value.variants}
                onChange={v => setValue(s => ({ ...s, variants: v }))}
              />
              <TagsField
                label='Ingredients'
                placeholder={t('productsProductModal.ingredientsPlaceholder')}
                testId='ingredients-input'
                value={value.ingredients}
                onChange={v => setValue(s => ({ ...s, ingredients: v }))}
              />
            </div>
          )}

          {/* Step 3 — Chứng nhận */}
          {step === 3 && (
            <CertField
              value={value.certifications}
              onChange={v => setValue(s => ({ ...s, certifications: v }))}
            />
          )}
        </div>

        {/* Footer */}
        <div className='border-border bg-muted/50 flex items-center justify-between gap-3 border-t px-5 py-3'>
          <Button
            type='button'
            variant='neutral'
            size='sm'
            onClick={step === 0 ? onClose : () => setStep(s => s - 1)}
            disabled={saving}
          >
            {step === 0 ? (
              t('productsProductModal.cancelBtn')
            ) : (
              <>
                <ChevronLeft className='size-3.5' />{' '}
                {t('productsProductModal.backBtn')}
              </>
            )}
          </Button>

          <div className='text-2xs text-muted-foreground'>
            {t('productsProductModal.stepCounter', {
              current: step + 1,
              total: STEPS.length,
            })}
          </div>

          {isLast ? (
            <Button
              type='button'
              size='sm'
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? (
                <Loader2 className='size-3.5 animate-spin' />
              ) : (
                <Check className='size-3.5' />
              )}
              {saving
                ? t('productsProductModal.savingBtn')
                : isEdit
                  ? t('productsProductModal.saveChangesBtn')
                  : t('productsProductModal.createProductBtn')}
            </Button>
          ) : (
            <Button
              type='button'
              size='sm'
              onClick={() => canNext && setStep(s => s + 1)}
              disabled={!canNext}
            >
              {t('productsProductModal.nextBtn')}{' '}
              <ChevronRight className='size-3.5' />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
