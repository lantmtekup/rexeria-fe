'use client';

/**
 * "Add from system catalog" picker for `/admin/blocks` (and the brand
 * portal mirror at `/portal/blocks`). Data nạp thật từ BE `/v1/block-types`
 * (active block types), lọc còn các type mà canvas factory dựng + preview
 * được, rồi show `BlockMiniPreview` thumbnail per card. Bấm 1 card → mở form
 * nhập tên/mô tả/tags → tạo bản ghi block (`POST /v1/blocks`, scope
 * `brand_private`) với settings từ `createBlock(type)`.
 */

import * as React from 'react';
import { ArrowLeft, Loader2, Plus, Search, Sparkles, X } from 'lucide-react';
import { toast } from 'sonner';

import { Input } from '@/components/atoms/input';
import { Label } from '@/components/atoms/label';
import { Textarea } from '@/components/atoms/textarea';
import { BlockMiniPreview } from '@/components/modules/CanvasTemplate/block-editor/BlockMiniPreview';
import { createBlock } from '@/components/modules/CanvasTemplate/block-editor/factory';
import type {
  Block,
  BlockType,
} from '@/components/modules/CanvasTemplate/block-editor/types';
import { BLOCK_TYPE_META } from '@/components/modules/CanvasTemplate/block-editor/types';
import { RxApiError } from '@/services/rexer/client';
import { rexerApi } from '@/services/rexer/endpoints';
import { cn } from '@/lib/cn';

interface CatalogItem {
  type: BlockType;
  label: string;
  description: string;
  gradient: string;
}

// Tập canvas block type mà factory dựng + preview được (loại `legacy_embed` vì
// cần schemaId). Thư viện hệ thống = giao của BE active block_types với tập này;
// các code BE không render được trên canvas (ad_*, cta_button, feature_grid…)
// bị loại để không tạo ra block hỏng.
const RENDERABLE: Set<string> = new Set(
  Object.keys(BLOCK_TYPE_META).filter(t => t !== 'legacy_embed')
);

const DEFAULT_GRADIENT = 'from-zinc-400 to-zinc-600';

/**
 * Lazy cache of seeded `Block` instances so each thumbnail only builds once
 * for the lifetime of the page. Building 14 fresh blocks every open of the
 * dialog is wasted work — the factory output is deterministic per type.
 */
const PREVIEW_CACHE = new Map<BlockType, Block>();
function getPreviewBlock(type: BlockType): Block {
  let cached = PREVIEW_CACHE.get(type);
  if (!cached) {
    cached = createBlock(type);
    PREVIEW_CACHE.set(type, cached);
  }
  return cached;
}

interface Props {
  open: boolean;
  onClose: () => void;
  /** Fires after a built-in block is added to the saved-blocks library. */
  onAdded?: (id: string) => void;
}

export function AddBuiltinBlockDialog({ open, onClose, onAdded }: Props) {
  const [search, setSearch] = React.useState('');
  const [adding, setAdding] = React.useState(false);
  // Catalog nạp thật từ BE `/v1/block-types` mỗi lần mở dialog.
  const [items, setItems] = React.useState<CatalogItem[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  // Bước 2: block type đã chọn → form nhập thông tin + metadata trước khi tạo.
  const [selected, setSelected] = React.useState<CatalogItem | null>(null);
  const [formName, setFormName] = React.useState('');
  const [formDesc, setFormDesc] = React.useState('');
  const [formTags, setFormTags] = React.useState<string[]>([]);
  const [tagInput, setTagInput] = React.useState('');

  React.useEffect(() => {
    if (!open) return;
    setSearch('');
    setSelected(null);
    let cancelled = false;
    setLoading(true);
    setError(null);
    rexerApi.adminBlockTypes
      .list()
      .then(r => {
        if (cancelled) return;
        const mapped: CatalogItem[] = (r.items ?? [])
          .filter(t => t.is_active && RENDERABLE.has(t.type))
          .map(t => ({
            type: t.type as BlockType,
            label: t.label_vi || t.type,
            description: t.description_vi ?? '',
            gradient:
              BLOCK_TYPE_META[t.type as BlockType]?.gradient ??
              DEFAULT_GRADIENT,
          }));
        setItems(mapped);
      })
      .catch(err => {
        if (cancelled) return;
        setError(
          err instanceof RxApiError
            ? err.code || err.message
            : 'Không tải được block types'
        );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [open]);

  if (!open) return null;

  const q = search.trim().toLowerCase();
  const filtered = items.filter(
    c =>
      !q ||
      c.label.toLowerCase().includes(q) ||
      c.type.toLowerCase().includes(q) ||
      c.description.toLowerCase().includes(q)
  );

  // Bước 1 → 2: chọn 1 block type, mở form với giá trị mặc định.
  const handleSelect = (item: CatalogItem) => {
    setSelected(item);
    setFormName(item.label);
    setFormDesc(item.description ?? '');
    setFormTags([]);
    setTagInput('');
  };

  const addTag = () => {
    const t = tagInput.trim().toLowerCase();
    if (!t) return;
    if (!formTags.includes(t)) setFormTags(prev => [...prev, t]);
    setTagInput('');
  };
  const removeTag = (t: string) =>
    setFormTags(prev => prev.filter(x => x !== t));

  // Bước 2: tạo block thật với thông tin + metadata người dùng nhập.
  const handleCreate = async () => {
    if (!selected) return;
    const name = formName.trim();
    if (!name) {
      toast.error('Tên block không được rỗng');
      return;
    }
    setAdding(true);
    try {
      const block = createBlock(selected.type);
      // BE Block.settings: JSONMap opaque — FE serializes the editor Block
      // shape so the canvas editor can reconstruct it on load.
      const created = await rexerApi.blocks.create({
        type_code: selected.type,
        name,
        description: formDesc.trim() || undefined,
        tags: formTags,
        settings: block as unknown as Record<string, unknown>,
        scope: 'brand_private',
      });
      toast.success(`Đã thêm "${created.name}" vào thư viện`);
      onAdded?.(created.id);
      onClose();
    } catch (err) {
      const msg =
        err instanceof RxApiError
          ? err.code || err.message
          : err instanceof Error
            ? err.message
            : 'unknown';
      toast.error(`Không thêm được: ${msg}`);
    } finally {
      setAdding(false);
    }
  };

  return (
    <div
      className='fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/45 p-4 backdrop-blur-sm'
      onClick={onClose}
    >
      <div
        className='my-8 w-full max-w-5xl overflow-hidden rounded-2xl bg-white shadow-2xl'
        onClick={e => e.stopPropagation()}
      >
        {selected ? (
          /* ───── Bước 2: form nhập thông tin + metadata trước khi tạo ───── */
          <>
            <div className='border-border flex items-center justify-between border-b px-5 py-3'>
              <div className='flex items-center gap-2.5'>
                <button
                  type='button'
                  onClick={() => setSelected(null)}
                  disabled={adding}
                  className='text-muted-foreground hover:bg-muted hover:text-content-muted rounded-lg p-1.5 disabled:opacity-50'
                  aria-label='Quay lại'
                >
                  <ArrowLeft className='size-4' />
                </button>
                <div className='leading-tight'>
                  <h3 className='text-base font-semibold'>
                    Thông tin block mới
                  </h3>
                  <p className='text-2xs text-content-muted'>
                    Loại: <span className='font-mono'>{selected.type}</span>
                  </p>
                </div>
              </div>
              <button
                type='button'
                onClick={onClose}
                className='text-muted-foreground hover:bg-muted hover:text-content-muted rounded-lg p-1.5'
                aria-label='Close'
              >
                <X className='size-4' />
              </button>
            </div>

            <div className='max-h-[68vh] overflow-y-auto px-5 py-4'>
              <div className='flex flex-col gap-4'>
                <div className='flex flex-col gap-1'>
                  <Label htmlFor='ab-name'>
                    Tên <span className='text-rose-600'>*</span>
                  </Label>
                  <Input
                    id='ab-name'
                    autoFocus
                    value={formName}
                    onChange={e => setFormName(e.target.value)}
                    placeholder='Hero chia đôi…'
                  />
                </div>

                <div className='flex flex-col gap-1'>
                  <Label htmlFor='ab-desc'>Mô tả</Label>
                  <Textarea
                    id='ab-desc'
                    value={formDesc}
                    rows={2}
                    onChange={e => setFormDesc(e.target.value)}
                    placeholder='Ghi chú ngắn về block này…'
                  />
                </div>

                <div className='flex flex-col gap-1'>
                  <Label htmlFor='ab-tags'>Tags</Label>
                  {formTags.length > 0 && (
                    <div className='flex flex-wrap items-center gap-1.5'>
                      {formTags.map(t => (
                        <span
                          key={t}
                          className='bg-muted inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs'
                        >
                          {t}
                          <button
                            type='button'
                            onClick={() => removeTag(t)}
                            className='text-content-muted hover:text-foreground'
                            aria-label={`Bỏ tag ${t}`}
                          >
                            <X className='size-3' />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                  <Input
                    id='ab-tags'
                    value={tagInput}
                    onChange={e => setTagInput(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addTag();
                      }
                    }}
                    onBlur={addTag}
                    placeholder='Nhập tag rồi Enter…'
                  />
                </div>
              </div>
            </div>

            <div className='border-border flex items-center justify-end gap-2 border-t bg-white px-5 py-3'>
              <button
                type='button'
                onClick={() => setSelected(null)}
                disabled={adding}
                className='border-border hover:bg-muted rounded-lg border px-3 py-1.5 text-sm font-medium disabled:opacity-50'
              >
                Quay lại
              </button>
              <button
                type='button'
                onClick={handleCreate}
                disabled={adding}
                className='inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 disabled:opacity-60'
              >
                {adding && <Loader2 className='size-3.5 animate-spin' />}
                Tạo block
              </button>
            </div>
          </>
        ) : (
          /* ───── Bước 1: chọn block type từ catalog BE ───── */
          <>
            {/* Header */}
            <div className='border-border flex items-center justify-between border-b px-5 py-3'>
              <div className='flex items-center gap-2.5'>
                <div className='flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 text-white shadow-sm'>
                  <Sparkles className='size-4' />
                </div>
                <div className='leading-tight'>
                  <h3 className='text-base font-semibold'>
                    Thêm block từ thư viện hệ thống
                  </h3>
                  <p className='text-2xs text-content-muted'>
                    {filtered.length} / {items.length} block types · từ BE
                  </p>
                </div>
              </div>
              <button
                type='button'
                onClick={onClose}
                className='text-muted-foreground hover:bg-muted hover:text-content-muted rounded-lg p-1.5'
                aria-label='Close'
              >
                <X className='size-4' />
              </button>
            </div>

            {/* Search */}
            <div className='border-border bg-muted/40 border-b px-5 py-3.5'>
              <div className='relative max-w-md'>
                <Search className='text-muted-foreground absolute top-1/2 left-3 size-3.5 -translate-y-1/2' />
                <input
                  type='text'
                  autoFocus
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder='Tìm theo tên / type / mô tả…'
                  className='border-border w-full rounded-lg border bg-white py-2 pr-3 pl-9 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100'
                />
              </div>
            </div>

            {/* Grid */}
            <div className='bg-muted/30 max-h-[62vh] overflow-y-auto p-5'>
              {loading ? (
                <div className='text-content-muted flex items-center justify-center gap-2 py-16 text-sm'>
                  <Loader2 className='size-4 animate-spin' /> Đang tải block
                  types…
                </div>
              ) : error ? (
                <div className='py-16 text-center'>
                  <p className='text-sm font-semibold text-rose-600'>
                    Không tải được danh sách
                  </p>
                  <p className='text-2xs text-content-muted mt-1 font-mono'>
                    {error}
                  </p>
                </div>
              ) : filtered.length === 0 ? (
                <div className='py-16 text-center'>
                  <div className='bg-muted text-muted-foreground mx-auto flex size-12 items-center justify-center rounded-2xl'>
                    <Search className='size-5' />
                  </div>
                  <p className='text-content-muted mt-3 text-sm font-semibold'>
                    {items.length === 0
                      ? 'Chưa có block type khả dụng'
                      : 'Không có block khớp tìm kiếm'}
                  </p>
                  <p className='text-2xs text-content-muted mt-1'>
                    {items.length === 0
                      ? 'BE chưa có block type active nào render được trên canvas.'
                      : 'Đổi từ khoá để xem các block khác.'}
                  </p>
                </div>
              ) : (
                <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
                  {filtered.map(item => (
                    <CatalogCard
                      key={item.type}
                      item={item}
                      onAdd={() => handleSelect(item)}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Footer hint */}
            <div className='text-2xs border-border text-content-muted border-t bg-white px-5 py-2.5'>
              Chọn 1 block type để nhập tên, mô tả + tags trước khi thêm vào thư
              viện.
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ─── Catalog card ─────────────────────────────────────────────────────── */

function CatalogCard({
  item,
  onAdd,
}: {
  item: CatalogItem;
  onAdd: () => void;
}) {
  // Wrapper is a div role=button — BlockMiniPreview contains carousel prev/next
  // <button>s for image_carousel/carousel_3d items; nesting <button> inside
  // <button> is invalid HTML + raises hydration warning.
  return (
    <div
      role='button'
      tabIndex={0}
      onClick={onAdd}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onAdd();
        }
      }}
      className={cn(
        'group border-border flex cursor-pointer flex-col overflow-hidden rounded-xl border bg-white text-left shadow-sm transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500',
        'hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-lg hover:shadow-indigo-500/5'
      )}
    >
      {/* Real preview thumbnail — same renderer the saved-blocks library
          uses. Wrapped in a soft mat so heterogeneous block backgrounds
          (pure white hero vs dark overlay) still look intentional. */}
      <div className='border-border relative aspect-[4/3] overflow-hidden border-b bg-gradient-to-br from-zinc-100 to-zinc-50'>
        <BlockMiniPreview block={getPreviewBlock(item.type)} aspect='4 / 3' />

        {/* Type pill — small accent so users can still scan block type at
            a glance, but no longer dominates the card the way the giant
            gradient hero did. */}
        <span
          className={cn(
            'text-3xs absolute bottom-2 left-2 inline-flex items-center rounded-md bg-gradient-to-br px-1.5 py-0.5 font-mono font-bold tracking-[0.15em] text-white/95 uppercase shadow-sm',
            item.gradient
          )}
        >
          {item.type}
        </span>

        {/* Subtle overlay so the thumbnail dims slightly on hover, drawing
            attention to the explicit "+ add" affordance below. */}
        <div className='pointer-events-none absolute inset-0 bg-white/0 transition-colors group-hover:bg-white/10' />
      </div>

      <div className='flex flex-1 flex-col gap-1 p-3.5'>
        <div className='flex items-center justify-between gap-2'>
          <span className='text-foreground text-sm font-semibold'>
            {item.label}
          </span>
          <span className='border-border bg-muted text-muted-foreground flex size-6 items-center justify-center rounded-full border transition-all group-hover:border-indigo-500 group-hover:bg-indigo-500 group-hover:text-white'>
            <Plus className='size-3' strokeWidth={2.5} />
          </span>
        </div>
        <p className='text-2xs text-content-muted line-clamp-2 leading-snug'>
          {item.description}
        </p>
      </div>
    </div>
  );
}
