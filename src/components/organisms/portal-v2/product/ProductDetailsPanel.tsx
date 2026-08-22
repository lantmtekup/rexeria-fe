'use client';

import {
  Box,
  Check,
  FileText,
  Film,
  FolderOpen,
  Image as ImageIcon,
  Loader2,
  Plus,
  RotateCw,
  Trash2,
  X,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/molecules/portal-v2/Button';
import {
  Field,
  TextInput,
  TextSelect,
  TextTextarea,
} from '@/components/molecules/portal-v2/brand-form';
import {
  Hint,
  KvRow,
  SectionBox,
} from '@/components/molecules/portal-v2/product-form';
import { ProductImage } from '@/components/molecules/portal-v2/product-image';
import { cn } from '@/lib/cn';
import {
  PRODUCT_CHANNELS,
  PRODUCT_SOURCE,
  PRODUCT_STATUS,
} from '@/lib/portal-v2/product/constants';
import {
  assetsOfProduct,
  productCover,
  productMargin,
  productPriceRange,
  productStock,
  readiness,
  readinessColor,
} from '@/lib/portal-v2/product/helpers';
import type {
  Product,
  ProductAsset,
  ProductAssetKind,
  ProductStatus,
  ProductVariant,
} from '@/lib/portal-v2/product/types';

type ProductDetailsPanelProps = {
  product: Product;
  assets: ProductAsset[];
  assetsHydrated: boolean;
  editing: boolean;
  isNew: boolean;
  onChange: (next: Product) => void;
  onRequestEdit: () => void;
  /**
   * Tải file lên và gắn vào sản phẩm. Không truyền = ẩn nút thêm — sản phẩm
   * CHƯA LƯU thì chưa có id để gắn media vào.
   */
  onUploadMedia?: (files: File[]) => void;
  /** Mở bảng chọn ảnh có sẵn trong thư viện. */
  onPickFromLibrary?: () => void;
  /**
   * Mở bộ chọn ẢNH ĐẠI DIỆN. Tách khỏi `onRequestEdit`: bấm "Edit to change
   * it" mà mở chế độ sửa cả sản phẩm thì người dùng thấy nguyên form kèm nút
   * Xoá — trong khi việc họ muốn chỉ là chọn một ảnh làm mặt sản phẩm.
   */
  onPickCover?: () => void;
  uploading?: boolean;
};

const KIND_ICON: Record<ProductAssetKind, typeof ImageIcon> = {
  IMG: ImageIcon,
  VID: Film,
  D3: Box,
  P360: RotateCw,
  DOC: FileText,
};

const kindBadge = (kind: ProductAssetKind) =>
  kind === 'D3' ? '3D' : kind === 'P360' ? '360' : kind;

const AssetGlyph = ({
  kind,
  size,
}: {
  kind: ProductAssetKind;
  size: number;
}) => {
  const Icon = KIND_ICON[kind];
  return (
    <Icon style={{ width: size, height: size }} strokeWidth={1.8} aria-hidden />
  );
};

const Eyebrow = ({ children }: { children: ReactNode }) => (
  <p className='mb-2 text-[10px] font-bold tracking-[0.08em] text-[var(--pv2-faint)] uppercase'>
    {children}
  </p>
);

const parseNumber = (raw: string) => {
  const n = Number(raw);
  return Number.isFinite(n) ? n : 0;
};

const formatNumber = (n: number) => (n ? String(n) : '');

/**
 * A plain `value={formatNumber(n)}` input erases whatever the user is mid-
 * typing on every keystroke: "6." parses to the number 6, which reformats
 * back to the string "6" — the "." the user just typed never makes it to the
 * screen, so "6.2" collapses into "62". This keeps the raw text as local
 * state and only reformats from the outside (cancel/reset, switching rows)
 * when `value` changes for a reason other than this field's own `onCommit`.
 */
const NumberField = ({
  value,
  onCommit,
  inputMode,
  placeholder,
  className,
}: {
  value: number;
  onCommit: (n: number) => void;
  inputMode?: 'decimal' | 'numeric';
  placeholder?: string;
  className?: string;
}) => {
  const [text, setText] = useState(() => formatNumber(value));
  const lastCommitted = useRef(value);

  useEffect(() => {
    if (value !== lastCommitted.current) {
      lastCommitted.current = value;
      setText(formatNumber(value));
    }
  }, [value]);

  return (
    <TextInput
      inputMode={inputMode}
      value={text}
      placeholder={placeholder}
      className={className}
      onChange={e => {
        const raw = e.target.value;
        setText(raw);
        const n = parseNumber(raw);
        lastCommitted.current = n;
        onCommit(n);
      }}
    />
  );
};

export const ProductDetailsPanel = ({
  product: p,
  assets,
  assetsHydrated,
  editing,
  isNew,
  onChange,
  onRequestEdit,
  onUploadMedia,
  onPickFromLibrary,
  onPickCover,
  uploading = false,
}: ProductDetailsPanelProps) => {
  const t = useTranslations('portalV2.products');

  const media = isNew ? [] : assetsOfProduct(assets, p.id);
  const cover = productCover(p, assets);
  const source = PRODUCT_SOURCE[p.source];
  const stock = productStock(p);
  const margin = productMargin(p);
  const rd = readiness(p, assets, isNew || assetsHydrated);
  const rc = readinessColor(rd.score);
  const first = p.variants[0];

  const patch = (partial: Partial<Product>) => onChange({ ...p, ...partial });

  const [tagDraft, setTagDraft] = useState('');
  // Đổi sang sản phẩm khác trong khi panel này vẫn còn mounted (view → edit
  // rồi mở sản phẩm khác) không được để lại chữ đang gõ dở của sản phẩm cũ.
  useEffect(() => setTagDraft(''), [p.id]);

  const commitTagDraft = () => {
    const value = tagDraft.trim();
    setTagDraft('');
    if (!value || p.tags.includes(value)) return;
    patch({ tags: [...p.tags, value] });
    toast.success(t('toastTagAdded'));
  };

  const removeTag = (tag: string) =>
    patch({ tags: p.tags.filter(x => x !== tag) });

  const patchFirstVariant = (partial: Partial<ProductVariant>) => {
    if (!p.variants.length) return;
    patch({
      variants: p.variants.map((v, i) => (i === 0 ? { ...v, ...partial } : v)),
    });
  };

  const patchVariant = (index: number, partial: Partial<ProductVariant>) => {
    patch({
      variants: p.variants.map((v, i) =>
        i === index ? { ...v, ...partial } : v
      ),
    });
  };

  const addVariant = () => {
    patch({
      variants: [
        ...p.variants,
        {
          sku: '',
          opt1: '',
          barcode: '',
          price: 0,
          compareAt: 0,
          cost: 0,
          qty: 0,
          policy: 'deny',
          grams: 0,
        },
      ],
    });
    toast.message(t('toastVariantAdded'));
  };

  const removeVariant = (index: number) => {
    patch({ variants: p.variants.filter((_, i) => i !== index) });
    toast.message(t('toastVariantRemoved'));
  };

  const toggleChannel = (channel: string) => {
    patch({
      channels: p.channels.includes(channel)
        ? p.channels.filter(c => c !== channel)
        : [...p.channels, channel],
    });
  };

  const optionName = p.options[0]?.name ?? '';

  return (
    <div className='grid items-start gap-5 md:grid-cols-[minmax(0,1fr)_268px]'>
      <div className='flex min-w-0 flex-col gap-3.5'>
        {/* PROFILE — read-only until you hit Edit. */}
        <SectionBox
          title={t('boxProfile')}
          action={
            <span className='text-[11px] font-medium text-[var(--pv2-faint)]'>
              {cover ? cover.name : t('noneChosen')}
            </span>
          }
        >
          {editing ? (
            <div className='grid items-start gap-3.5 sm:grid-cols-[132px_minmax(0,1fr)]'>
              <div
                className='relative grid h-[132px] place-items-center overflow-hidden rounded-[var(--pv2-r)] px-3 text-center text-[var(--pv2-paper)]'
                style={{
                  background: cover
                    ? cover.grad
                    : isNew
                      ? 'var(--pv2-canvas)'
                      : p.grad,
                }}
              >
                <ProductImage
                  src={cover?.url}
                  alt={p.title}
                  className='bg-[var(--pv2-canvas)] object-contain'
                >
                  {cover ? (
                    <AssetGlyph kind={cover.kind} size={42} />
                  ) : isNew ? (
                    <span className='text-[11px] leading-snug font-semibold text-[var(--pv2-faint)]'>
                      {t('addMediaThenPick')}
                    </span>
                  ) : (
                    <span className='font-[family-name:var(--pv2-disp)] text-[40px] font-bold'>
                      {p.title[0] ?? '?'}
                    </span>
                  )}
                </ProductImage>
              </div>
              <div>
                <Eyebrow>{t('chooseFromMedia')}</Eyebrow>
                {media.filter(m => m.kind !== 'DOC').length ? (
                  <>
                    <div className='flex flex-wrap gap-[7px]'>
                      {media
                        .filter(m => m.kind !== 'DOC')
                        .map(m => {
                          const on = p.cover === m.id;
                          return (
                            <button
                              key={m.id}
                              type='button'
                              title={m.name}
                              aria-pressed={on}
                              onClick={() => patch({ cover: on ? null : m.id })}
                              className={cn(
                                'relative grid size-11 cursor-pointer place-items-center rounded-[9px] border-2 text-[var(--pv2-paper)]',
                                'focus-visible:ring-2 focus-visible:ring-[var(--pv2-electric)] focus-visible:outline-none',
                                on
                                  ? 'border-[var(--pv2-ink)]'
                                  : 'border-transparent'
                              )}
                              style={{ background: m.grad }}
                            >
                              <ProductImage
                                src={m.url}
                                className='rounded-[7px] object-cover'
                              >
                                <AssetGlyph kind={m.kind} size={16} />
                              </ProductImage>
                              {on ? (
                                <span className='absolute -top-1.5 -right-1.5 grid size-4 place-items-center rounded-full border-2 border-[var(--pv2-paper)] bg-[var(--pv2-ink)] text-[var(--pv2-paper)]'>
                                  <Check
                                    className='size-2'
                                    strokeWidth={3.4}
                                    aria-hidden
                                  />
                                </span>
                              ) : null}
                            </button>
                          );
                        })}
                    </div>
                    <p className='mt-2 text-[11px] leading-snug text-[var(--pv2-mut)]'>
                      {t('coverUsedWhere')}
                    </p>
                  </>
                ) : (
                  <p className='text-[11.5px] leading-relaxed text-[var(--pv2-mut)]'>
                    {t('noImagesYet')}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className='flex flex-wrap items-center gap-4'>
              <div
                className='relative grid h-[132px] w-[132px] shrink-0 place-items-center overflow-hidden rounded-[var(--pv2-r)] text-[var(--pv2-paper)]'
                style={{ background: cover ? cover.grad : p.grad }}
              >
                <ProductImage
                  src={cover?.url}
                  alt={p.title}
                  className='bg-[var(--pv2-canvas)] object-contain'
                >
                  {cover ? (
                    <AssetGlyph kind={cover.kind} size={42} />
                  ) : (
                    <span className='font-[family-name:var(--pv2-disp)] text-[40px] font-bold'>
                      {p.title[0] ?? '?'}
                    </span>
                  )}
                </ProductImage>
              </div>
              <div className='min-w-0 flex-1 text-[11.5px] leading-relaxed text-[var(--pv2-mut)]'>
                {t('profileRecognised')}
                {cover ? null : ` ${t('profileNoCover')}`}
                <button
                  type='button'
                  onClick={onPickCover ?? onRequestEdit}
                  className='mt-2 block cursor-pointer text-[11.5px] font-bold text-[var(--pv2-electric)] hover:underline'
                >
                  {t('editToChange')}
                </button>
              </div>
            </div>
          )}
        </SectionBox>

        <SectionBox title={t('boxProduct')}>
          {editing ? (
            <>
              <Field label={t('fieldTitle')}>
                <TextInput
                  value={p.title}
                  placeholder='Super Serum Skin Tint SPF 40'
                  onChange={e => patch({ title: e.target.value })}
                />
              </Field>
              <Field label={t('fieldDescription')}>
                <TextTextarea
                  value={p.body}
                  placeholder='What it is, what is in it, and who it is for.'
                  onChange={e => patch({ body: e.target.value })}
                />
              </Field>
              <Field label={t('fieldHandle')}>
                <TextInput
                  value={p.handle}
                  placeholder='super-serum-skin-tint-spf-40'
                  onChange={e => patch({ handle: e.target.value })}
                />
              </Field>
            </>
          ) : (
            <>
              <KvRow label={t('fieldTitle')} value={p.title || '—'} />
              <KvRow label={t('fieldHandle')} value={`/${p.handle}`} />
              <p className='mt-3 text-[13px] leading-relaxed text-[var(--pv2-ink)]'>
                {p.body || (
                  <span className='text-[var(--pv2-faint)]'>
                    {t('noDescription')}
                  </span>
                )}
              </p>
            </>
          )}
        </SectionBox>

        <SectionBox
          title={t('boxMedia')}
          action={
            <span className='text-[11px] font-medium text-[var(--pv2-faint)]'>
              {t('fileCount', { count: media.length })}
            </span>
          }
        >
          <div className='flex flex-wrap gap-2'>
            {media.map(m => (
              <button
                key={m.id}
                type='button'
                title={m.name}
                onClick={() => toast.message(m.name)}
                className='relative grid size-16 cursor-pointer place-items-center overflow-hidden rounded-[9px] text-[var(--pv2-paper)] focus-visible:ring-2 focus-visible:ring-[var(--pv2-electric)] focus-visible:outline-none'
                style={{ background: m.grad }}
              >
                <ProductImage src={m.url} className='object-cover'>
                  <AssetGlyph kind={m.kind} size={20} />
                </ProductImage>
                <span className='absolute right-1 bottom-[3px] text-[7.5px] font-bold opacity-90'>
                  {kindBadge(m.kind)}
                </span>
              </button>
            ))}
            {onUploadMedia && onPickFromLibrary ? (
              <button
                type='button'
                onClick={onPickFromLibrary}
                aria-label={t('pickFromLibrary')}
                title={t('pickFromLibrary')}
                className='grid size-16 cursor-pointer place-items-center rounded-[9px] border border-dashed border-[var(--pv2-hair)] bg-[var(--pv2-canvas)] text-[var(--pv2-faint)] hover:border-[var(--pv2-electric)] hover:text-[var(--pv2-electric)]'
              >
                <FolderOpen className='size-4' strokeWidth={2.2} aria-hidden />
              </button>
            ) : null}
            {onUploadMedia ? (
              <label
                aria-label={t('addMedia')}
                title={t('addMedia')}
                className={cn(
                  'grid size-16 place-items-center rounded-[9px] border border-dashed',
                  'border-[var(--pv2-hair)] bg-[var(--pv2-canvas)] text-[var(--pv2-faint)]',
                  uploading
                    ? 'cursor-wait opacity-60'
                    : 'cursor-pointer hover:border-[var(--pv2-electric)] hover:text-[var(--pv2-electric)]'
                )}
              >
                {uploading ? (
                  <Loader2 className='size-4 animate-spin' aria-hidden />
                ) : (
                  <Plus className='size-4' strokeWidth={2.4} aria-hidden />
                )}
                <input
                  type='file'
                  multiple
                  accept='image/*,video/mp4,video/webm'
                  className='sr-only'
                  disabled={uploading}
                  onChange={e => {
                    const files = Array.from(e.target.files ?? []);
                    // Xoá value để chọn lại ĐÚNG file vừa chọn vẫn kích hoạt
                    // onChange — trình duyệt bỏ qua nếu value không đổi.
                    e.target.value = '';
                    if (files.length) onUploadMedia(files);
                  }}
                />
              </label>
            ) : (
              <span
                title={t('addMediaNeedsSave')}
                className='grid size-16 place-items-center rounded-[9px] border border-dashed border-[var(--pv2-hair)] bg-[var(--pv2-canvas)] text-[var(--pv2-faint)] opacity-50'
              >
                <Plus className='size-4' strokeWidth={2.4} aria-hidden />
              </span>
            )}
          </div>
          <p className='mt-3 flex items-start gap-2 text-[11.5px] leading-relaxed text-[var(--pv2-mut)]'>
            <FolderOpen
              className='mt-0.5 size-3.5 shrink-0'
              strokeWidth={2}
              aria-hidden
            />
            <span>
              {t.rich('filedIn', {
                name: p.title || t('thisProduct'),
                b: chunks => (
                  <b className='font-semibold text-[var(--pv2-ink)]'>
                    {chunks}
                  </b>
                ),
              })}{' '}
              {isNew ? t('filedInNew') : t('filedInExisting')}
            </span>
          </p>
        </SectionBox>

        <SectionBox
          title={t('boxVariants')}
          action={
            editing ? (
              <Button variant='ghost' size='sm' onClick={addVariant}>
                <Plus className='size-3' strokeWidth={2.6} aria-hidden />
                {t('addVariant')}
              </Button>
            ) : undefined
          }
        >
          {editing ? (
            <Field label={t('fieldOptionName')}>
              <TextInput
                value={optionName}
                placeholder='Shade, Size, or Colour'
                onChange={e =>
                  patch({
                    options: p.options.length
                      ? p.options.map((o, i) =>
                          i === 0 ? { ...o, name: e.target.value } : o
                        )
                      : [{ name: e.target.value, values: [] }],
                  })
                }
              />
            </Field>
          ) : null}

          <div className='overflow-x-auto'>
            <table className='w-full border-collapse text-[12px]'>
              <thead>
                <tr>
                  {[
                    optionName || t('optionFallback'),
                    'SKU',
                    t('colBarcode'),
                    t('colPrice'),
                    t('colCost'),
                    t('colStock'),
                  ].map((h, i) => (
                    <th
                      key={h}
                      className={cn(
                        'border-b border-[var(--pv2-hair)] px-2 py-2 text-[9.5px] font-bold tracking-[0.05em] text-[var(--pv2-faint)] uppercase',
                        i >= 3 ? 'text-right' : 'text-left'
                      )}
                    >
                      {h}
                    </th>
                  ))}
                  {editing ? <th className='w-[26px]' /> : null}
                </tr>
              </thead>
              <tbody>
                {p.variants.map((v, vi) => (
                  <tr key={`${v.sku}-${vi}`}>
                    {editing ? (
                      <>
                        <td className='border-b border-[var(--pv2-hair)] p-1.5'>
                          <TextInput
                            value={v.opt1}
                            placeholder='ST1 Rendezvous'
                            className='px-2 py-1 text-[12px]'
                            onChange={e =>
                              patchVariant(vi, { opt1: e.target.value })
                            }
                          />
                        </td>
                        <td className='border-b border-[var(--pv2-hair)] p-1.5'>
                          <TextInput
                            value={v.sku}
                            placeholder='ILA-SST-ST1'
                            className='px-2 py-1 text-[12px]'
                            onChange={e =>
                              patchVariant(vi, { sku: e.target.value })
                            }
                          />
                        </td>
                        <td className='border-b border-[var(--pv2-hair)] p-1.5'>
                          <TextInput
                            value={v.barcode}
                            placeholder='818107021015'
                            className='px-2 py-1 text-[12px]'
                            onChange={e =>
                              patchVariant(vi, { barcode: e.target.value })
                            }
                          />
                        </td>
                        <td className='border-b border-[var(--pv2-hair)] p-1.5'>
                          <NumberField
                            inputMode='decimal'
                            value={v.price}
                            placeholder='52'
                            className='px-2 py-1 text-right text-[12px]'
                            onCommit={price => patchVariant(vi, { price })}
                          />
                        </td>
                        <td className='border-b border-[var(--pv2-hair)] p-1.5'>
                          <NumberField
                            inputMode='decimal'
                            value={v.cost}
                            placeholder='14.20'
                            className='px-2 py-1 text-right text-[12px]'
                            onCommit={cost => patchVariant(vi, { cost })}
                          />
                        </td>
                        <td className='border-b border-[var(--pv2-hair)] p-1.5'>
                          <NumberField
                            inputMode='numeric'
                            value={v.qty}
                            placeholder='0'
                            className='px-2 py-1 text-right text-[12px]'
                            onCommit={qty => patchVariant(vi, { qty })}
                          />
                        </td>
                        <td className='border-b border-[var(--pv2-hair)] p-1.5'>
                          <button
                            type='button'
                            title={t('removeVariant')}
                            aria-label={t('removeVariant')}
                            onClick={() => removeVariant(vi)}
                            className='grid size-7 cursor-pointer place-items-center rounded-[7px] text-[var(--pv2-mut)] hover:bg-[color-mix(in_srgb,var(--pv2-error)_10%,transparent)] hover:text-[var(--pv2-error)]'
                          >
                            <Trash2
                              className='size-3'
                              strokeWidth={2}
                              aria-hidden
                            />
                          </button>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className='border-b border-[var(--pv2-hair)] px-2 py-2 font-semibold text-[var(--pv2-ink)]'>
                          {v.opt1}
                        </td>
                        <td className='border-b border-[var(--pv2-hair)] px-2 py-2 font-mono text-[11px] text-[var(--pv2-mut)]'>
                          {v.sku}
                        </td>
                        <td className='border-b border-[var(--pv2-hair)] px-2 py-2 font-mono text-[11px] text-[var(--pv2-faint)]'>
                          {v.barcode}
                        </td>
                        <td className='border-b border-[var(--pv2-hair)] px-2 py-2 text-right font-semibold tabular-nums'>
                          ${v.price}
                        </td>
                        <td className='border-b border-[var(--pv2-hair)] px-2 py-2 text-right text-[var(--pv2-mut)] tabular-nums'>
                          ${v.cost.toFixed(2)}
                        </td>
                        <td
                          className='border-b border-[var(--pv2-hair)] px-2 py-2 text-right font-semibold tabular-nums'
                          style={{
                            color:
                              v.qty === 0
                                ? 'var(--pv2-error)'
                                : v.qty < 25
                                  ? 'var(--pv2-warning)'
                                  : 'var(--pv2-ink)',
                          }}
                        >
                          {v.qty}
                          {v.qty === 0 ? (
                            <span className='text-[10px] font-medium'>
                              {' '}
                              · {t('outLabel')}
                            </span>
                          ) : v.qty < 25 ? (
                            <span className='text-[10px] font-medium'>
                              {' '}
                              · {t('lowLabel')}
                            </span>
                          ) : null}
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionBox>

        <SectionBox title={t('boxPricing')}>
          {editing && first ? (
            <div className='grid gap-x-3.5 sm:grid-cols-2'>
              <Field label={t('fieldPrice')}>
                <NumberField
                  inputMode='decimal'
                  value={first.price}
                  placeholder='52.00'
                  onCommit={price => patchFirstVariant({ price })}
                />
                {/* The catalogue price arrives as text on a feature, not as a
                    number this field can hold — say where the read view's
                    figure came from rather than let the blank input read as
                    "no price". */}
                {p.priceText ? (
                  <Hint>{t('priceOnFile', { price: p.priceText })}</Hint>
                ) : null}
              </Field>
              <Field label={t('fieldCompareAt')}>
                <NumberField
                  inputMode='decimal'
                  value={first.compareAt}
                  placeholder={t('optional')}
                  onCommit={compareAt => patchFirstVariant({ compareAt })}
                />
              </Field>
              <Field label={t('fieldCost')}>
                <NumberField
                  inputMode='decimal'
                  value={first.cost}
                  placeholder='14.20'
                  onCommit={cost => patchFirstVariant({ cost })}
                />
              </Field>
              <Field label={t('fieldChargeTax')}>
                <TextSelect defaultValue='yes'>
                  <option value='yes'>{t('yes')}</option>
                  <option value='no'>{t('no')}</option>
                </TextSelect>
              </Field>
            </div>
          ) : first ? (
            <>
              <KvRow label={t('fieldPrice')} value={productPriceRange(p)} />
              <KvRow
                label={t('fieldCompareAt')}
                value={first.compareAt ? `$${first.compareAt}` : '—'}
              />
              <KvRow
                label={t('fieldCost')}
                value={first.cost ? `$${first.cost.toFixed(2)}` : '—'}
              />
              {/* Margin and profit are only meaningful once a numeric price is
                  on file. A BE row has none, and "0% / $0.00" beside a real
                  catalogue price reads as a finding rather than a blank. */}
              {first.price ? (
                <>
                  <KvRow
                    label={t('fieldMargin')}
                    value={`${margin}%`}
                    valueColor='var(--pv2-success)'
                  />
                  <KvRow
                    label={t('fieldProfit')}
                    value={`$${(first.price - first.cost).toFixed(2)}`}
                  />
                </>
              ) : null}
            </>
          ) : null}
        </SectionBox>

        <SectionBox title={t('boxInventory')}>
          {editing && first ? (
            <div className='grid gap-x-3.5 sm:grid-cols-2'>
              <Field label={t('fieldTrackQuantity')}>
                <TextSelect defaultValue='shopify'>
                  <option value='shopify'>Shopify</option>
                  <option value='none'>{t('doNotTrack')}</option>
                </TextSelect>
              </Field>
              <Field label={t('fieldWhenOutOfStock')}>
                <TextSelect
                  value={first.policy}
                  onChange={e =>
                    patchFirstVariant({
                      policy: e.target.value as ProductVariant['policy'],
                    })
                  }
                >
                  <option value='deny'>{t('stopSelling')}</option>
                  <option value='continue'>{t('keepSelling')}</option>
                </TextSelect>
              </Field>
              <Field label={t('fieldWeight')}>
                <NumberField
                  inputMode='numeric'
                  value={first.grams}
                  placeholder='30'
                  onCommit={grams => patchFirstVariant({ grams })}
                />
              </Field>
              <Field label={t('fieldRequiresShipping')}>
                <TextSelect defaultValue='yes'>
                  <option value='yes'>{t('yes')}</option>
                  <option value='no'>{t('no')}</option>
                </TextSelect>
              </Field>
            </div>
          ) : first ? (
            <>
              <KvRow
                label={t('fieldTotalOnHand')}
                value={t('unitCount', { count: stock })}
              />
              <KvRow label={t('fieldTrackedBy')} value='Shopify' />
              <KvRow
                label={t('fieldWhenOutOfStock')}
                value={
                  first.policy === 'deny' ? t('stopSelling') : t('keepSelling')
                }
              />
              <KvRow label={t('fieldWeight')} value={`${first.grams} g`} />
              <KvRow label={t('fieldRequiresShipping')} value={t('yes')} />
            </>
          ) : null}
        </SectionBox>

        <SectionBox title={t('boxSeo')}>
          {editing ? (
            <>
              <Field label={t('fieldSeoTitle')}>
                <TextInput
                  value={p.seo.title}
                  placeholder='Falls back to the product title'
                  onChange={e =>
                    patch({ seo: { ...p.seo, title: e.target.value } })
                  }
                />
              </Field>
              <Field label={t('fieldSeoDesc')}>
                <TextTextarea
                  value={p.seo.desc}
                  placeholder='Falls back to the description. 320 characters.'
                  className='min-h-[56px]'
                  onChange={e =>
                    patch({ seo: { ...p.seo, desc: e.target.value } })
                  }
                />
              </Field>
            </>
          ) : (
            <>
              <KvRow label={t('fieldSeoTitle')} value={p.seo.title || '—'} />
              <p className='mt-3 text-[12.5px] leading-relaxed text-[var(--pv2-mut)]'>
                {p.seo.desc || '—'}
              </p>
            </>
          )}
        </SectionBox>
      </div>

      {/* SIDEBAR — identical sections for a synced and a hand-entered product. */}
      <div className='flex min-w-0 flex-col gap-3'>
        <SectionBox title={t('boxStatus')}>
          <TextSelect
            value={p.status}
            disabled={!editing}
            aria-label={t('boxStatus')}
            onChange={e => patch({ status: e.target.value as ProductStatus })}
          >
            {(Object.keys(PRODUCT_STATUS) as ProductStatus[]).map(k => (
              <option key={k} value={k}>
                {PRODUCT_STATUS[k].name}
              </option>
            ))}
          </TextSelect>
          <p className='mt-3 flex items-center gap-2 text-[11.5px] text-[var(--pv2-faint)]'>
            <span
              className='size-2 shrink-0 rounded-full'
              style={{ background: source.dot }}
            />
            {t('sourceLabel', { source: source.name })}
          </p>
        </SectionBox>

        <SectionBox title={t('boxChannels')}>
          {PRODUCT_CHANNELS.map(ch => {
            const on = p.channels.includes(ch);
            return (
              <div
                key={ch}
                className='flex items-center justify-between gap-3 py-[9px]'
              >
                <span className='text-[12.5px] text-[var(--pv2-ink)]'>
                  {ch}
                </span>
                <button
                  type='button'
                  role='switch'
                  aria-checked={on}
                  aria-label={ch}
                  disabled={!editing}
                  onClick={() => toggleChannel(ch)}
                  className={cn(
                    'relative h-[18px] w-8 shrink-0 rounded-full transition-colors',
                    'focus-visible:ring-2 focus-visible:ring-[var(--pv2-electric)] focus-visible:outline-none',
                    editing ? 'cursor-pointer' : 'cursor-default opacity-70',
                    on ? 'bg-[var(--pv2-electric)]' : 'bg-[var(--pv2-hair)]'
                  )}
                >
                  <span
                    className={cn(
                      'absolute top-0.5 size-3.5 rounded-full bg-[var(--pv2-paper)] transition-[left]',
                      on ? 'left-[16px]' : 'left-0.5'
                    )}
                  />
                </button>
              </div>
            );
          })}
        </SectionBox>

        <SectionBox title={t('boxOrganization')}>
          <Field label={t('fieldProductType')}>
            <TextInput
              value={p.type}
              readOnly={!editing}
              placeholder={t('chooseType')}
              onChange={e => patch({ type: e.target.value })}
            />
          </Field>
          <Field label={t('fieldBrand')}>
            <TextInput
              value={p.brand}
              readOnly={!editing}
              placeholder='Ilia Beauty'
              onChange={e => patch({ brand: e.target.value })}
            />
          </Field>
          <Field label={t('fieldCategory')}>
            <TextInput
              value={
                editing
                  ? p.category
                  : p.category
                    ? (p.category.split(' > ').pop() ?? '')
                    : ''
              }
              title={editing ? undefined : p.category}
              readOnly={!editing}
              placeholder='Search the product taxonomy…'
              onChange={e => patch({ category: e.target.value })}
            />
          </Field>
          <Field label={t('fieldTags')}>
            <span className='flex flex-wrap items-center gap-1.5'>
              {p.tags.map(tag => (
                <span
                  key={tag}
                  className='flex items-center gap-1 rounded-full bg-[var(--pv2-canvas)] px-2.5 py-1 text-[11.5px] font-medium text-[var(--pv2-mut)]'
                >
                  {tag}
                  {editing ? (
                    <button
                      type='button'
                      onClick={() => removeTag(tag)}
                      aria-label={t('removeTag', { tag })}
                      className='cursor-pointer text-[var(--pv2-faint)] hover:text-[var(--pv2-error)]'
                    >
                      <X className='size-3' strokeWidth={2.4} aria-hidden />
                    </button>
                  ) : null}
                </span>
              ))}
              {editing ? (
                <span className='flex items-center gap-1'>
                  <input
                    value={tagDraft}
                    onChange={e => setTagDraft(e.target.value)}
                    onKeyDown={e => {
                      if (e.key !== 'Enter') return;
                      e.preventDefault();
                      commitTagDraft();
                    }}
                    placeholder={t('addTagPlaceholder')}
                    className='w-[104px] rounded-full border border-dashed border-[var(--pv2-hair)] bg-transparent px-2.5 py-1 text-[11.5px] font-medium text-[var(--pv2-ink)] outline-none placeholder:text-[var(--pv2-faint)] focus:border-[var(--pv2-electric)]'
                  />
                  <button
                    type='button'
                    onClick={commitTagDraft}
                    disabled={!tagDraft.trim()}
                    className='cursor-pointer rounded-full border border-dashed border-[var(--pv2-hair)] px-2.5 py-1 text-[11.5px] font-medium text-[var(--pv2-electric)] hover:bg-[var(--pv2-electric-soft)] disabled:cursor-not-allowed disabled:opacity-50'
                  >
                    {t('addTag')}
                  </button>
                </span>
              ) : null}
              {!p.tags.length && !editing ? (
                <span className='text-[12px] text-[var(--pv2-faint)]'>
                  {t('noTags')}
                </span>
              ) : null}
            </span>
          </Field>
        </SectionBox>

        {/* THE REXER SECTION: not in Shopify, and the reason this catalogue exists. */}
        <SectionBox title={t('boxReadiness')} style={{ borderColor: rc }}>
          <div
            className='font-[family-name:var(--pv2-disp)] text-[26px] leading-none font-bold tracking-[-0.02em]'
            style={{ color: rc }}
          >
            {rd.score}%
          </div>
          <div className='my-2.5 h-[5px] overflow-hidden rounded-full bg-[var(--pv2-hair)]'>
            <span
              className='block h-full rounded-full'
              style={{ width: `${rd.score}%`, background: rc }}
            />
          </div>
          <p
            className={cn(
              'text-[11.5px] leading-relaxed text-[var(--pv2-mut)]',
              rd.missing.length && 'mb-2.5'
            )}
          >
            {isNew ? t('readinessNewHint') : t('readinessHint')}
          </p>
          {rd.missing.length ? (
            <ul className='flex flex-col gap-2'>
              {rd.missing.map(m => (
                <li key={m} className='flex items-start gap-2 text-[12px]'>
                  <span
                    className='mt-px grid size-4 shrink-0 place-items-center rounded-full text-[10px] font-bold text-[var(--pv2-paper)]'
                    style={{ background: rc }}
                  >
                    !
                  </span>
                  <span className='leading-snug text-[var(--pv2-ink)]'>
                    {m}
                  </span>
                </li>
              ))}
            </ul>
          ) : null}
        </SectionBox>
      </div>
    </div>
  );
};
