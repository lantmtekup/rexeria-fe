'use client';

import * as React from 'react';
import {
  Award,
  Image as ImageIcon,
  Layers,
  Palette,
  Sparkles,
  Trash2,
  Upload,
} from 'lucide-react';
import { toast } from 'sonner';

import { Badge } from '@/components/atoms/badge';
import { Button } from '@/components/atoms/button';
import { ColorSwatch } from '@/components/atoms/color-swatch';
import { Spinner } from '@/components/atoms/spinner';
import { EmptyState } from '@/components/molecules/EmptyState';
import { cn } from '@/lib/cn';
import { rexerApi } from '@/services/rexer/endpoints';
import { RxApiError } from '@/services/rexer/client';
import type {
  Product,
  ProductColor,
  ProductMediaWithAsset,
} from '@/services/rexer/types';
import { useUploadAndBind } from '@/services/rexer/use-upload-and-bind';

interface ProductMediaManagerProps {
  productId: string;
}

type Tab = 'general' | 'color' | 'feature' | 'cert';

/** field_keys that belong in the "Hero & Lifestyle" general tab. */
const GENERAL_FIELD_KEYS = new Set([
  'hero',
  'gallery',
  'detail',
  'lifestyle',
  'size_chart',
]);

function rxErrorMessage(err: unknown): string {
  if (err instanceof RxApiError) return err.message || err.code;
  if (err instanceof Error) return err.message;
  return 'Unexpected error';
}

function formatSize(bytes?: number) {
  if (!bytes) return '—';
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(0)} KB`;
  return `${(kb / 1024).toFixed(2)} MB`;
}

function ProductMediaManager({ productId }: ProductMediaManagerProps) {
  const [tab, setTab] = React.useState<Tab>('general');
  const [product, setProduct] = React.useState<Product | null>(null);
  const [entries, setEntries] = React.useState<ProductMediaWithAsset[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [unbindingId, setUnbindingId] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await rexerApi.products.get(productId);
      setProduct(res.product);
      const items: ProductMediaWithAsset[] = res.media ?? [];
      setEntries(items.filter(e => !!e?.binding?.media_id));
    } catch (err) {
      toast.error(`Failed to load media: ${rxErrorMessage(err)}`);
    } finally {
      setLoading(false);
    }
  }, [productId]);

  React.useEffect(() => {
    load();
  }, [load]);

  const handleUnbind = async (entry: ProductMediaWithAsset) => {
    const label =
      entry.asset?.original_filename ??
      `media ${entry.binding.media_id.slice(0, 8)}`;
    if (
      !window.confirm(
        `Bỏ "${label}" khỏi sản phẩm? Asset gốc vẫn còn trong library.`
      )
    )
      return;
    setUnbindingId(entry.binding.id);
    try {
      await rexerApi.products.unbindMedia(productId, entry.binding.id);
      toast.success('Đã bỏ liên kết');
      await load();
    } catch (err) {
      toast.error(`Bỏ liên kết thất bại: ${rxErrorMessage(err)}`);
    } finally {
      setUnbindingId(null);
    }
  };

  // ── Filtered slices per tab ──────────────────────────────────────────────
  const generalEntries = React.useMemo(
    () =>
      entries.filter(
        e =>
          (!e.binding.color_name || e.binding.color_name === '') &&
          (!e.binding.field_key ||
            GENERAL_FIELD_KEYS.has(e.binding.field_key as string))
      ),
    [entries]
  );
  const colorEntries = React.useMemo(
    () => entries.filter(e => !!e.binding.color_name),
    [entries]
  );
  const featureEntries = React.useMemo(
    () => entries.filter(e => e.binding.field_key === 'feature'),
    [entries]
  );
  const certEntries = React.useMemo(
    () => entries.filter(e => e.binding.field_key === 'cert'),
    [entries]
  );

  return (
    <div className='mx-auto flex w-full max-w-[1200px] flex-col gap-4 px-6 pb-10'>
      {/* Tab strip */}
      <div className='flex items-center gap-1 border-b border-neutral-200'>
        <TabButton
          active={tab === 'general'}
          onClick={() => setTab('general')}
          icon={<ImageIcon className='size-3.5' />}
          label='Hero & Lifestyle'
          count={generalEntries.length}
        />
        <TabButton
          active={tab === 'color'}
          onClick={() => setTab('color')}
          icon={<Palette className='size-3.5' />}
          label='Theo màu'
          count={colorEntries.length}
        />
        <TabButton
          active={tab === 'feature'}
          onClick={() => setTab('feature')}
          icon={<Sparkles className='size-3.5' />}
          label='Features'
          count={featureEntries.length}
        />
        <TabButton
          active={tab === 'cert'}
          onClick={() => setTab('cert')}
          icon={<Award className='size-3.5' />}
          label='Certifications'
          count={certEntries.length}
        />
      </div>

      {loading ? (
        <div className='text-muted-foreground flex justify-center py-16'>
          <Spinner size={20} />
        </div>
      ) : (
        <>
          {tab === 'general' && (
            <GeneralTab
              productId={productId}
              entries={generalEntries}
              onChanged={load}
              onUnbind={handleUnbind}
              unbindingId={unbindingId}
            />
          )}
          {tab === 'color' && (
            <ColorTab
              productId={productId}
              colors={product?.colors ?? []}
              entries={colorEntries}
              onChanged={load}
              onUnbind={handleUnbind}
              unbindingId={unbindingId}
            />
          )}
          {tab === 'feature' && (
            <SimpleSlotTab
              productId={productId}
              fieldKey='feature'
              labelKey={(slot, idx) => slot ?? `Feature ${(idx ?? 0) + 1}`}
              icon={<Sparkles className='size-4 text-violet-500' />}
              entries={featureEntries}
              onChanged={load}
              onUnbind={handleUnbind}
              unbindingId={unbindingId}
              emptyHint='Upload ảnh minh hoạ feature trong tab này, hoặc chọn icon trong Information.'
            />
          )}
          {tab === 'cert' && (
            <SimpleSlotTab
              productId={productId}
              fieldKey='cert'
              labelKey={(slot, idx) => slot ?? `Cert ${(idx ?? 0) + 1}`}
              icon={<Award className='size-4 text-amber-500' />}
              entries={certEntries}
              onChanged={load}
              onUnbind={handleUnbind}
              unbindingId={unbindingId}
              emptyHint='Upload logo certification (ISO, FDA…) — hiển thị trên landing.'
            />
          )}
        </>
      )}
    </div>
  );
}

// ── Tab button ─────────────────────────────────────────────────────────────

function TabButton({
  active,
  onClick,
  icon,
  label,
  count,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  count: number;
}) {
  return (
    <button
      type='button'
      onClick={onClick}
      className={cn(
        '-mb-px flex cursor-pointer items-center gap-1.5 border-b-2 px-3 py-2 text-xs font-semibold tracking-wider uppercase transition-colors',
        active
          ? 'border-neutral-900 text-neutral-900'
          : 'border-transparent text-neutral-400 hover:text-neutral-700'
      )}
    >
      {icon}
      <span>{label}</span>
      {count > 0 && (
        <span
          className={cn(
            'text-3xs inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 font-semibold',
            active
              ? 'bg-neutral-900 text-white'
              : 'bg-neutral-100 text-neutral-500'
          )}
        >
          {count}
        </span>
      )}
    </button>
  );
}

// ── General tab (hero + gallery + lifestyle) ───────────────────────────────

function GeneralTab({
  productId,
  entries,
  onChanged,
  onUnbind,
  unbindingId,
}: {
  productId: string;
  entries: ProductMediaWithAsset[];
  onChanged: () => Promise<void> | void;
  onUnbind: (entry: ProductMediaWithAsset) => Promise<void>;
  unbindingId: string | null;
}) {
  const [fieldKey, setFieldKey] = React.useState<
    'gallery' | 'hero' | 'lifestyle' | 'detail' | 'size_chart'
  >('gallery');

  return (
    <section className='flex flex-col gap-4'>
      <div className='border-border bg-background flex flex-wrap items-center justify-between gap-3 rounded-xl border p-4'>
        <div className='flex items-center gap-2'>
          <span className='text-3xs font-semibold tracking-widest text-neutral-500 uppercase'>
            Vai trò
          </span>
          <select
            value={fieldKey}
            onChange={e => setFieldKey(e.target.value as typeof fieldKey)}
            className='border-border rounded-md border bg-white px-2 py-1 text-xs outline-none'
          >
            <option value='gallery'>Gallery</option>
            <option value='hero'>Hero (1 ảnh đại diện)</option>
            <option value='lifestyle'>Lifestyle</option>
            <option value='detail'>Detail (zoom, label)</option>
            <option value='size_chart'>Size chart</option>
          </select>
        </div>
        <UploadButton
          productId={productId}
          fieldKey={fieldKey}
          onUploaded={onChanged}
          accept='image/*,video/*'
        />
      </div>

      {entries.length === 0 ? (
        <EmptyState
          icon={<ImageIcon className='size-10' />}
          title='Chưa có ảnh chung'
          description='Upload hero / gallery / lifestyle để landing có ảnh hiển thị.'
        />
      ) : (
        <div className='grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3'>
          {entries.map(e => (
            <MediaTile
              key={e.binding.id}
              entry={e}
              onUnbind={onUnbind}
              unbinding={unbindingId === e.binding.id}
            />
          ))}
        </div>
      )}
    </section>
  );
}

// ── Color tab — group by color_name ────────────────────────────────────────

function ColorTab({
  productId,
  colors,
  entries,
  onChanged,
  onUnbind,
  unbindingId,
}: {
  productId: string;
  colors: ProductColor[];
  entries: ProductMediaWithAsset[];
  onChanged: () => Promise<void> | void;
  onUnbind: (entry: ProductMediaWithAsset) => Promise<void>;
  unbindingId: string | null;
}) {
  if (colors.length === 0) {
    return (
      <EmptyState
        icon={<Palette className='size-10' />}
        title='Chưa khai báo màu sản phẩm'
        description='Thêm màu trong tab Information trước khi upload ảnh theo màu.'
      />
    );
  }

  // Group entries by color_name (case-insensitive match against ProductColor.name).
  const grouped = colors.map(c => ({
    color: c,
    items: entries.filter(
      e =>
        e.binding.color_name &&
        e.binding.color_name.toLowerCase() === c.name.toLowerCase()
    ),
  }));
  const orphans = entries.filter(
    e =>
      !!e.binding.color_name &&
      !colors.some(
        c => c.name.toLowerCase() === e.binding.color_name!.toLowerCase()
      )
  );

  return (
    <section className='flex flex-col gap-4'>
      {grouped.map(g => (
        <ColorGroup
          key={g.color.name}
          productId={productId}
          color={g.color}
          entries={g.items}
          onChanged={onChanged}
          onUnbind={onUnbind}
          unbindingId={unbindingId}
        />
      ))}
      {orphans.length > 0 && (
        <div className='rounded-xl border border-dashed border-amber-300 bg-amber-50/50 p-4'>
          <p className='text-xs font-semibold text-amber-800'>
            {orphans.length} ảnh có color_name không khớp với màu hiện tại
          </p>
          <p className='text-2xs mt-1 text-amber-700'>
            Có thể do bạn đổi tên/xoá màu. Bỏ liên kết hoặc rename color trong
            Information để khớp.
          </p>
          <div className='mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3'>
            {orphans.map(e => (
              <MediaTile
                key={e.binding.id}
                entry={e}
                onUnbind={onUnbind}
                unbinding={unbindingId === e.binding.id}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

function ColorGroup({
  productId,
  color,
  entries,
  onChanged,
  onUnbind,
  unbindingId,
}: {
  productId: string;
  color: ProductColor;
  entries: ProductMediaWithAsset[];
  onChanged: () => Promise<void> | void;
  onUnbind: (entry: ProductMediaWithAsset) => Promise<void>;
  unbindingId: string | null;
}) {
  return (
    <div className='border-border bg-background flex flex-col gap-3 rounded-xl border p-4'>
      <div className='flex flex-wrap items-center gap-2'>
        <ColorSwatch asSpan color={color.hex} size={24} />
        <span className='text-sm font-semibold text-neutral-900'>
          {color.name}
        </span>
        <span className='text-3xs font-mono text-neutral-400'>{color.hex}</span>
        {color.is_default && (
          <Badge variant='secondary' className='bg-amber-100 text-amber-700'>
            Mặc định
          </Badge>
        )}
        <span className='text-2xs text-neutral-400'>{entries.length} ảnh</span>
        <div className='ml-auto'>
          <UploadButton
            productId={productId}
            fieldKey='gallery'
            colorName={color.name}
            onUploaded={onChanged}
            accept='image/*'
          />
        </div>
      </div>
      {entries.length === 0 ? (
        <p className='text-2xs text-neutral-400'>Chưa có ảnh cho màu này.</p>
      ) : (
        <div className='grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4'>
          {entries.map(e => (
            <MediaTile
              key={e.binding.id}
              entry={e}
              onUnbind={onUnbind}
              unbinding={unbindingId === e.binding.id}
              compact
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Generic slot tab (Features / Certs) ────────────────────────────────────

function SimpleSlotTab({
  productId,
  fieldKey,
  labelKey,
  icon,
  entries,
  onChanged,
  onUnbind,
  unbindingId,
  emptyHint,
}: {
  productId: string;
  fieldKey: 'feature' | 'cert';
  labelKey: (slot?: string, idx?: number) => string;
  icon: React.ReactNode;
  entries: ProductMediaWithAsset[];
  onChanged: () => Promise<void> | void;
  onUnbind: (entry: ProductMediaWithAsset) => Promise<void>;
  unbindingId: string | null;
  emptyHint: string;
}) {
  return (
    <section className='flex flex-col gap-4'>
      <div className='border-border bg-background flex items-center justify-between gap-3 rounded-xl border p-4'>
        <div className='flex items-center gap-2'>
          {icon}
          <p className='text-xs text-neutral-500'>{emptyHint}</p>
        </div>
        <UploadButton
          productId={productId}
          fieldKey={fieldKey}
          onUploaded={onChanged}
          accept='image/*'
        />
      </div>

      {entries.length === 0 ? (
        <EmptyState
          icon={<Layers className='size-10' />}
          title='Chưa có ảnh nhóm này'
          description={emptyHint}
        />
      ) : (
        <div className='grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3'>
          {entries.map((e, idx) => (
            <MediaTile
              key={e.binding.id}
              entry={e}
              label={labelKey(e.binding.slot_key, idx)}
              onUnbind={onUnbind}
              unbinding={unbindingId === e.binding.id}
            />
          ))}
        </div>
      )}
    </section>
  );
}

// ── Upload button — wires useUploadAndBind with optional color_name ────────

function UploadButton({
  productId,
  fieldKey,
  colorName,
  onUploaded,
  accept = 'image/*',
}: {
  productId: string;
  fieldKey: string;
  colorName?: string;
  onUploaded: () => Promise<void> | void;
  accept?: string;
}) {
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const { uploadAndBind, uploading, progress } = useUploadAndBind({
    target: { kind: 'product', productId },
    fieldKey,
    colorName,
  });

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    let succeeded = 0;
    for (const f of Array.from(files)) {
      try {
        await uploadAndBind(f);
        succeeded++;
      } catch (err) {
        toast.error(`${f.name}: ${rxErrorMessage(err)}`);
      }
    }
    if (succeeded > 0) {
      toast.success(
        `Đã upload ${succeeded}/${files.length}${colorName ? ` cho màu ${colorName}` : ''}`
      );
      await onUploaded();
    }
  };

  return (
    <>
      <input
        ref={inputRef}
        type='file'
        multiple
        accept={accept}
        className='hidden'
        onChange={e => {
          handleFiles(e.target.files);
          e.target.value = '';
        }}
      />
      <Button
        variant='pill-light'
        size='sm'
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
      >
        {uploading ? (
          <>
            <Spinner size={12} /> {progress}%
          </>
        ) : (
          <>
            <Upload className='size-3.5' /> Upload
          </>
        )}
      </Button>
    </>
  );
}

// ── Media tile (shared) ────────────────────────────────────────────────────

function MediaTile({
  entry,
  onUnbind,
  unbinding,
  compact,
  label,
}: {
  entry: ProductMediaWithAsset;
  onUnbind: (entry: ProductMediaWithAsset) => void;
  unbinding: boolean;
  compact?: boolean;
  /** Override visible label (e.g. "Feature 1" instead of filename). */
  label?: string;
}) {
  const { binding, asset } = entry;
  const isImage = asset?.media_type === 'image';
  const previewUrl = asset?.public_url;
  return (
    <div
      className={cn(
        'border-border bg-background group relative flex flex-col overflow-hidden rounded-xl border'
      )}
    >
      <div className='bg-muted relative flex aspect-video items-center justify-center overflow-hidden'>
        {isImage && previewUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={previewUrl}
            alt={asset?.original_filename ?? ''}
            className='size-full object-cover'
            draggable={false}
          />
        ) : isImage ? (
          <ImageIcon className='text-muted-foreground size-10' />
        ) : (
          <span className='text-muted-foreground text-xs uppercase'>
            {asset?.media_type ?? 'unknown'}
          </span>
        )}
        {!compact && (
          <Badge
            variant='secondary'
            className='absolute top-2 left-2 capitalize'
          >
            {binding.field_key ?? 'gallery'}
          </Badge>
        )}
      </div>
      <div
        className={cn(
          'flex items-start justify-between gap-2',
          compact ? 'px-2 py-1.5' : 'p-3'
        )}
      >
        <div className='min-w-0 flex-1'>
          <p
            className={cn(
              'text-foreground truncate font-medium',
              compact ? 'text-xs' : 'text-sm'
            )}
          >
            {label ??
              asset?.original_filename ??
              `media ${binding.media_id.slice(0, 8)}`}
          </p>
          {!compact && (
            <p className='text-muted-foreground text-xs'>
              {formatSize(asset?.file_size)}
              {asset?.width && asset?.height
                ? ` · ${asset.width}×${asset.height}`
                : ''}
            </p>
          )}
        </div>
        <Button
          variant='ghost'
          size='icon'
          aria-label='Bỏ liên kết'
          disabled={unbinding}
          onClick={() => onUnbind(entry)}
          className={cn(
            'text-muted-foreground hover:text-destructive',
            compact ? 'size-6' : 'size-8'
          )}
        >
          <Trash2 className={compact ? 'size-3' : 'size-3.5'} />
        </Button>
      </div>
    </div>
  );
}

export { ProductMediaManager };
