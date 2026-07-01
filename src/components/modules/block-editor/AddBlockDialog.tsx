'use client';

import * as React from 'react';
import { Bookmark, Loader2, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/atoms/dialog';
import { Input } from '@/components/atoms/input';
import { rexerApi } from '@/services/rexer/endpoints';
import { cn } from '@/lib/cn';
import { isBlockUsable } from '@/lib/block-status';

import { BlockMiniPreview } from './BlockMiniPreview';
import { REGISTERED_TYPES } from './blocks/_registry/registry';
import { createBlock } from './factory';
import { instantiateSavedBlock, type SavedBlock } from './savedBlocks';
import { BLOCK_TYPE_META, type Block, type BlockType } from './types';
import { RxApiError } from '@/services/rexer/client';
import type { Block as ServerBlock } from '@/services/rexer/types';

/** Wave 3 migration 2026-05-31: Saved blocks tab loads from `/v1/blocks`
 *  (same source as /admin/blocks list page) instead of localStorage. Each
 *  ServerBlock.settings should be an FE editor Block (saved via the Save
 *  Block icon in BlockEditor); we adapt to the SavedBlock shape the
 *  SavedCard component expects. Returns null for rows whose settings
 *  isn't a valid editor Block. */
function serverToSavedBlock(b: ServerBlock): SavedBlock | null {
  const s = b.settings as Record<string, unknown> | null | undefined;
  // Legacy/framer registry blocks (`__legacy`) không còn được chèn vào canvas:
  // BE đã bật validate block_type theo catalog (block ngoài catalog → 400 khi
  // commit version). `legacy_embed` không thuộc catalog nên bỏ qua các entry
  // legacy ở đây — chúng vẫn xem được ở /admin/blocks (catalog browse-only).
  if (!s || typeof s !== 'object' || !('blockType' in s)) return null;
  return {
    id: b.id,
    name: b.name,
    block: s as unknown as Block,
    createdAt: b.created_at,
    updatedAt: b.updated_at,
    tags: b.tags ?? [],
  };
}

interface AddBlockDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Pick a built-in block type. */
  onPick: (type: BlockType) => void;
  /** Pick a saved block — caller inserts the fully-formed Block into canvas. */
  onPickSaved?: (block: Block) => void;
}

const ORDERED_TYPES: BlockType[] = [
  // ── Heroes ──────────────────────────────────────────────
  'hero_split',
  'hero_overlay',
  'framer_yume_hero',
  'framer_yuya_hero',
  'framer_arpeggio_hero_v2',
  'framer_perform_hero',
  'framer_bungee_hero_v2',
  'framer_purevisuals_hero',
  // ── Content / Editorial ─────────────────────────────────
  'framer_intro_redefined',
  'framer_studio_manifesto',
  'framer_explore_cta',
  'framer_aestha_editorial',
  // ── Features / Services ──────────────────────────────────
  'feature_section',
  'framer_clarity_services',
  'framer_perform_about',
  'framer_perform_pricing',
  'framer_firma_template_strategy_digital',
  // ── Projects / Gallery ───────────────────────────────────
  'framer_projects_grid',
  'framer_vs_collins_projects',
  'framer_image_stagger',
  // ── Team / People ────────────────────────────────────────
  'framer_team_directory',
  // ── Timeline / FAQ ───────────────────────────────────────
  'framer_darling_timeline',
  'framer_nftpull_timeline',
  'framer_faq_minimal',
  // ── Stats / Signature ────────────────────────────────────
  'framer_stats_grid',
  'framer_signature_feature',
  // ── Footer / CTA ─────────────────────────────────────────
  'cta_section',
  'mint_hero',
  'mint_details',
  'mint_variants',
  'mint_discover',
  'mint_sku',
  'mintv2_emblem',
  'mintv2_manifesto',
  'mintv2_works',
  'linea_portfolio',
  'mint_vault_hero',
  'mint_vault_craft',
  'mint_vault_reveal',
  'mint_vault_collection',
  'mint_vault_invitation',
  'mintv2_services',
  'mintv2_process',
  'mintv2_cta',
  // ── Interactive / Other ──────────────────────────────────
  'text_displace_hero',
  'image_trail',
  'sticky_scroll_cards',
  'gallery_3d_depth',
  'parallax_hero',
  'lightbox_flip',
  'flip_gallery',
  'wheel_gallery',
  'hover_reveal_list',
  'hover_equalizer_heading',
  'image_explosion',
  'marquee_band',
  'story_slides',
  'accordion_media',
  'spotlight',
  'process_steps',
  'dot_matrix',
  'interactive_grid',
  'pixel_reveal',
  'letter_slider',
  'seamless_scroll_gallery',
  'product_spec_sheet',
  'image_carousel',
  'carousel_3d',
  'stories',
  'flipbook',
  'panorama',
  'split_screen',
  'quiz',
  'poll',
  'booking_form',
];

export function AddBlockDialog({
  open,
  onOpenChange,
  onPick,
  onPickSaved,
}: AddBlockDialogProps) {
  // BE-backed saved blocks — same source as /admin/blocks list page.
  // Null = loading; array = loaded (may be empty).
  const [saved, setSaved] = React.useState<SavedBlock[] | null>(null);

  const reloadSaved = React.useCallback(async () => {
    setSaved(null);
    // Chỉ BE saved blocks (`/v1/blocks`) — KHÔNG merge legacy/framer registry
    // nữa: legacy block chèn vào canvas sẽ thành `legacy_embed` (ngoài catalog)
    // → BE reject khi commit version. Legacy vẫn browse được ở /admin/blocks.
    let beItems: ServerBlock[] = [];
    try {
      const r = await rexerApi.blocks.list({ limit: 200 });
      beItems = r.items ?? [];
    } catch {
      beItems = [];
    }
    const items = beItems
      // Chỉ block đã publish mới cho dựng trang (legacy status rỗng → usable).
      .filter(isBlockUsable)
      .map(serverToSavedBlock)
      .filter((b): b is SavedBlock => b !== null);
    setSaved(items);
  }, []);

  // Reload saved blocks each time dialog opens (matches /admin/blocks freshness).
  React.useEffect(() => {
    if (!open) return;
    void reloadSaved();
  }, [open, reloadSaved]);

  // Block cơ bản = mọi type FE biết render (registry BLOCK_TYPE_META, thứ tự
  // ORDERED_TYPES). Không còn phụ thuộc catalog BE — type sống trong code.
  // Block đã migrate sang BlockDef tự xuất hiện (không cần thêm vào ORDERED_TYPES).
  const visibleTypes = React.useMemo(() => {
    const extra = REGISTERED_TYPES.filter(t => !ORDERED_TYPES.includes(t));
    return [...ORDERED_TYPES, ...extra];
  }, []);

  // Default-instance preview block per type — built once so the live
  // BlockMiniPreview cards don't recreate on every dialog re-render.
  const previewByType = React.useMemo(() => {
    const m = {} as Record<BlockType, Block>;
    for (const t of visibleTypes) m[t] = createBlock(t);
    return m;
  }, [visibleTypes]);

  const handlePickSaved = (entry: SavedBlock) => {
    if (!onPickSaved) {
      // Fallback: fall through to the builtin type so user still gets a block.
      onPick(entry.block.blockType);
    } else {
      onPickSaved(instantiateSavedBlock(entry));
    }
    // Tăng usage_count cho BE saved block (id uuid; legacy `legacy:` thì bỏ).
    // Fire-and-forget — không chặn việc chèn block, lỗi thì nuốt.
    if (!entry.id.startsWith('legacy:')) {
      void rexerApi.blocks.use(entry.id).catch(() => {});
    }
    onOpenChange(false);
  };

  // Type luôn sẵn từ registry (đồng bộ) — chỉ còn thư viện saved là async.
  const loadingTypes = false;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='flex max-h-[85vh] flex-col sm:max-w-3xl'>
        <DialogHeader>
          <DialogTitle>Thêm block mới</DialogTitle>
          <p className='text-sm text-neutral-500'>
            Chọn block để thêm vào trang — preview hiển thị nội dung thật.
          </p>
        </DialogHeader>

        {/* Single scrollable list — KHÔNG tab. Thư viện block (nội dung thật,
            cùng nguồn /admin/blocks) trước, rồi block cơ bản. */}
        <div className='-mr-1 flex-1 space-y-6 overflow-y-auto pr-1'>
          {loadingTypes && saved === null ? (
            <div className='flex items-center justify-center py-12 text-sm text-neutral-500'>
              <Loader2 className='mr-2 size-4 animate-spin' /> Đang tải block…
            </div>
          ) : (
            <>
              {/* Thư viện — block đã thiết kế (cùng nguồn /admin/blocks) */}
              {saved === null ? (
                <div className='flex items-center justify-center py-8 text-sm text-neutral-500'>
                  <Loader2 className='mr-2 size-4 animate-spin' /> Đang tải thư
                  viện…
                </div>
              ) : saved.length > 0 ? (
                <section>
                  <h3 className='text-2xs mb-2 font-semibold tracking-wider text-neutral-500 uppercase'>
                    Thư viện · {saved.length} block
                  </h3>
                  <SavedTab
                    entries={saved}
                    onPick={handlePickSaved}
                    onChanged={reloadSaved}
                  />
                </section>
              ) : null}

              {/* Block cơ bản — starter skeleton theo loại */}
              {!loadingTypes && visibleTypes.length > 0 ? (
                <section>
                  <h3 className='text-2xs mb-2 font-semibold tracking-wider text-neutral-500 uppercase'>
                    Block cơ bản · {visibleTypes.length}
                  </h3>
                  <div className='grid grid-cols-2 gap-3 sm:grid-cols-3'>
                    {visibleTypes.map(type => {
                      const meta = BLOCK_TYPE_META[type];
                      const pick = () => {
                        onPick(type);
                        onOpenChange(false);
                      };
                      return (
                        <div
                          key={type}
                          role='button'
                          tabIndex={0}
                          onClick={pick}
                          onKeyDown={e => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              pick();
                            }
                          }}
                          className={cn(
                            'group flex cursor-pointer flex-col gap-2 overflow-hidden rounded-lg border border-neutral-200 bg-white p-2 text-left transition-colors hover:border-neutral-900'
                          )}
                        >
                          <div className='pointer-events-none overflow-hidden rounded-md border border-neutral-100 bg-neutral-50'>
                            <BlockMiniPreview
                              block={previewByType[type]}
                              aspect='16 / 10'
                            />
                          </div>
                          <span className='px-1 text-xs font-medium text-neutral-700 group-hover:text-neutral-900'>
                            {meta.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </section>
              ) : null}

              {/* Cả hai rỗng */}
              {!loadingTypes &&
              visibleTypes.length === 0 &&
              saved !== null &&
              saved.length === 0 ? (
                <div className='rounded-lg border border-dashed border-neutral-200 px-4 py-12 text-center text-sm text-neutral-500'>
                  Chưa có block nào.
                </div>
              ) : null}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function SavedTab({
  entries,
  onPick,
  onChanged,
}: {
  entries: SavedBlock[];
  onPick: (entry: SavedBlock) => void;
  onChanged: () => void;
}) {
  if (entries.length === 0) {
    return (
      <div className='flex flex-col items-center gap-2 rounded-lg border border-dashed border-neutral-200 px-4 py-12 text-center'>
        <Bookmark className='size-8 text-neutral-300' />
        <p className='text-sm font-medium text-neutral-700'>Thư viện trống</p>
        <p className='max-w-sm text-xs text-neutral-500'>
          Bấm icon dấu trang trên header của editor để lưu block hiện tại vào
          thư viện — sau đó tái sử dụng ở mọi canvas.
        </p>
      </div>
    );
  }
  return (
    <div className='grid grid-cols-2 gap-3 sm:grid-cols-3'>
      {entries.map(e => (
        <SavedCard key={e.id} entry={e} onPick={onPick} onChanged={onChanged} />
      ))}
    </div>
  );
}

function SavedCard({
  entry,
  onPick,
  onChanged,
}: {
  entry: SavedBlock;
  onPick: (e: SavedBlock) => void;
  onChanged: () => void;
}) {
  const [renaming, setRenaming] = React.useState(false);
  const [nextName, setNextName] = React.useState(entry.name);
  // Legacy/framer catalog blocks are system-managed (id `legacy:*`) — no BE
  // rename/delete (mirrors /admin/blocks).
  const isLegacy = entry.id.startsWith('legacy:');

  React.useEffect(() => {
    if (renaming) setNextName(entry.name);
  }, [renaming, entry.name]);

  const submitRename = async () => {
    const trimmed = nextName.trim();
    if (!trimmed || trimmed === entry.name) {
      setRenaming(false);
      return;
    }
    try {
      await rexerApi.blocks.update(entry.id, { name: trimmed });
      onChanged();
      toast.success('Đã đổi tên');
    } catch (err) {
      const msg =
        err instanceof RxApiError ? err.code || err.message : 'RENAME_FAILED';
      toast.error(`Đổi tên thất bại: ${msg}`);
    } finally {
      setRenaming(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Xoá "${entry.name}" khỏi thư viện?`)) return;
    try {
      await rexerApi.blocks.archive(entry.id);
      onChanged();
      toast.success('Đã xoá');
    } catch (err) {
      const msg =
        err instanceof RxApiError ? err.code || err.message : 'DELETE_FAILED';
      toast.error(`Xoá thất bại: ${msg}`);
    }
  };

  return (
    <div className='group flex flex-col gap-2 overflow-hidden rounded-lg border border-neutral-200 bg-white p-2 transition-colors hover:border-neutral-900'>
      <div
        role='button'
        tabIndex={0}
        onClick={() => onPick(entry)}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onPick(entry);
          }
        }}
        className='cursor-pointer overflow-hidden rounded-md border border-neutral-100 bg-neutral-50'
      >
        {/* Real live preview — same renderer as /admin/blocks grid. Inner
            interactive elements are inert so the card stays one click target. */}
        <div className='pointer-events-none'>
          <BlockMiniPreview block={entry.block} aspect='16 / 10' />
        </div>
      </div>
      <div className='flex items-center gap-1 px-1'>
        {renaming ? (
          <Input
            autoFocus
            value={nextName}
            onChange={e => setNextName(e.target.value)}
            onBlur={submitRename}
            onKeyDown={e => {
              if (e.key === 'Enter') submitRename();
              else if (e.key === 'Escape') setRenaming(false);
            }}
            className='h-7 flex-1 text-xs'
          />
        ) : (
          <button
            type='button'
            onClick={() => onPick(entry)}
            className='min-w-0 flex-1 truncate text-left text-xs font-medium text-neutral-700 hover:text-neutral-900'
            title={entry.name}
          >
            {entry.name}
          </button>
        )}
        {!isLegacy && (
          <>
            <button
              type='button'
              onClick={() => setRenaming(v => !v)}
              className='shrink-0 rounded p-1 text-neutral-400 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-neutral-100 hover:text-neutral-700'
              aria-label='Đổi tên'
            >
              <Pencil className='size-3' />
            </button>
            <button
              type='button'
              onClick={handleDelete}
              className='shrink-0 rounded p-1 text-neutral-400 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-50 hover:text-red-600'
              aria-label='Xoá'
            >
              <Trash2 className='size-3' />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
