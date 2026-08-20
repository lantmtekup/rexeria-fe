'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';

import {
  MEDIA_DEFAULT_FILTERS,
  MEDIA_SEARCH_DEBOUNCE_MS,
} from '@/lib/portal-v2/media/constants';
import {
  cloneMediaAssets,
  deriveMediaFolders,
  filterMediaAssets,
} from '@/lib/portal-v2/media/helpers';
import type {
  MediaAsset,
  MediaDeleteTarget,
  MediaFilters,
} from '@/lib/portal-v2/media/types';
import { cn } from '@/lib/cn';
import { fetchMediaCatalog } from '@/services/portal-v2/mediaCatalog';
import {
  deleteMediaAsset,
  deleteMediaAssets,
} from '@/services/portal-v2/mediaDelete';
import {
  fetchMediaProductHomes,
  type MediaProductHome,
} from '@/services/portal-v2/mediaProductHomes';
import { updateMediaTags } from '@/services/portal-v2/mediaUpdate';
import { uploadMediaFiles } from '@/services/portal-v2/mediaUpload';
import { RxApiError } from '@/services/rexer/client';

import { AssetDetailModal } from '@/components/organisms/portal-v2/media/AssetDetailModal';
import { MediaAlerts } from '@/components/organisms/portal-v2/media/MediaAlerts';
import { MediaBulkBar } from '@/components/organisms/portal-v2/media/MediaBulkBar';
import { MediaDeleteConfirmModal } from '@/components/organisms/portal-v2/media/MediaDeleteConfirmModal';
import { MediaFacetPanel } from '@/components/organisms/portal-v2/media/MediaFacetPanel';
import { MediaHeader } from '@/components/organisms/portal-v2/media/MediaHeader';
import { MediaResults } from '@/components/organisms/portal-v2/media/MediaResults';
import { MediaToolbar } from '@/components/organisms/portal-v2/media/MediaToolbar';
import { MediaUseTabs } from '@/components/organisms/portal-v2/media/MediaUseTabs';

type MediaWorkspaceProps = {
  initialAssets: MediaAsset[];
  initialError?: string | null;
  /**
   * Brand đang xem. Ô tìm kiếm nạp lại danh sách sau mỗi lần gõ — quên truyền
   * là bộ lọc rơi mất và lưới bỗng hiện media của brand khác.
   */
  brandId?: string | null;
};

export const MediaWorkspace = ({
  initialAssets,
  initialError = null,
  brandId = null,
}: MediaWorkspaceProps) => {
  const t = useTranslations('portalV2.media');
  const [assets, setAssets] = useState<MediaAsset[]>(() =>
    cloneMediaAssets(initialAssets)
  );
  const [loadError, setLoadError] = useState(initialError);
  const [searching, setSearching] = useState(false);
  const [filters, setFilters] = useState<MediaFilters>(MEDIA_DEFAULT_FILTERS);
  const [debouncedQ, setDebouncedQ] = useState('');
  const [selected, setSelected] = useState<string[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<MediaAsset | null>(null);
  const [uploading, setUploading] = useState<{
    done: number;
    total: number;
  } | null>(null);
  const [dragging, setDragging] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<MediaDeleteTarget | null>(
    null
  );
  /** `asset id → sản phẩm đang gắn nó` — nạp riêng, xem effect bên dưới. */
  const [productHomes, setProductHomes] = useState<
    Map<string, MediaProductHome>
  >(new Map());
  // Bump để ép refetch sau khi upload — chỉ đổi `debouncedQ` thì guard bên dưới
  // chặn, nên khoá phải là composite của cả hai.
  const [reloadToken, setReloadToken] = useState(0);
  const fetchKey = `${reloadToken}::${debouncedQ}`;
  const lastFetchedKey = useRef(fetchKey);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedQ(filters.q.trim());
    }, MEDIA_SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [filters.q]);

  useEffect(() => {
    if (lastFetchedKey.current === fetchKey) return;
    lastFetchedKey.current = fetchKey;

    let cancelled = false;
    setSearching(true);

    fetchMediaCatalog({ q: debouncedQ || undefined, brandId })
      .then(result => {
        if (cancelled) return;
        setAssets(result.assets);
        setLoadError(result.error);
        setSelected(prev =>
          prev.filter(id => result.assets.some(a => a.id === id))
        );
      })
      .catch(err => {
        if (cancelled) return;
        setLoadError(
          err instanceof RxApiError
            ? err.message
            : err instanceof Error
              ? err.message
              : 'Failed to load media'
        );
        setAssets([]);
      })
      .finally(() => {
        if (!cancelled) setSearching(false);
      });

    return () => {
      cancelled = true;
    };
  }, [fetchKey, debouncedQ]);

  /**
   * `GET /media` không trả asset này đang gắn ở sản phẩm nào — quét riêng qua
   * `fetchMediaProductHomes` (N+1 theo catalogue sản phẩm). Tách khỏi
   * `assets`/`fetchMediaCatalog` để một lượt search/upload không phải quét
   * lại toàn bộ catalogue sản phẩm mỗi lần.
   */
  useEffect(() => {
    let cancelled = false;
    fetchMediaProductHomes(brandId)
      .then(map => {
        if (!cancelled) setProductHomes(map);
      })
      .catch(() => {
        /* Nhóm "Products" chỉ rơi về rỗng — không đáng chặn cả trang Media. */
      });
    return () => {
      cancelled = true;
    };
  }, [brandId]);

  /** `assets` + `productHomes` — chỉ dùng cho hiển thị (lọc/nhóm/label). */
  const homedAssets = useMemo(() => {
    if (!productHomes.size) return assets;
    return assets.map(a => {
      const home = productHomes.get(a.id);
      return home
        ? {
            ...a,
            home: {
              scope: 'product' as const,
              ref: home.productId,
              label: home.productTitle,
            },
          }
        : a;
    });
  }, [assets, productHomes]);

  const filtered = useMemo(
    () => filterMediaAssets(homedAssets, { ...filters, q: '' }),
    [homedAssets, filters]
  );
  const folders = useMemo(() => deriveMediaFolders(homedAssets), [homedAssets]);
  const expiringCount = useMemo(
    () => assets.filter(a => a.status === 'expiring').length,
    [assets]
  );
  const activeAsset = homedAssets.find(a => a.id === activeId) ?? null;
  const modalAsset = editing ? draft : activeAsset;

  const patchFilters = (patch: Partial<MediaFilters>) =>
    setFilters(prev => ({ ...prev, ...patch }));

  const handleFiles = async (list: FileList | File[]) => {
    const files = Array.from(list);
    if (!files.length || uploading) return;

    setUploading({ done: 0, total: files.length });
    const { assets: uploaded, failures } = await uploadMediaFiles(
      files,
      (done, total) => setUploading({ done, total })
    );
    setUploading(null);

    failures.forEach(f =>
      toast.error(t('uploadFailedToast', { name: f.filename }))
    );
    if (uploaded.length) {
      toast.success(t('uploadedToast', { count: uploaded.length }));
      // Refetch thay vì chèn tay: server là nguồn sự thật cho query hiện tại.
      setReloadToken(x => x + 1);
    }
  };

  const onDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  };

  const onDragLeave = (e: React.DragEvent) => {
    // Chỉ tắt khi rời hẳn container — rê qua card con không làm nhấp nháy.
    if (e.currentTarget.contains(e.relatedTarget as Node | null)) return;
    setDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files?.length) void handleFiles(e.dataTransfer.files);
  };

  const openAsset = (asset: MediaAsset, startEditing = false) => {
    setActiveId(asset.id);
    if (startEditing) {
      setDraft(structuredClone(asset));
      setEditing(true);
    } else {
      setDraft(null);
      setEditing(false);
    }
  };

  const closeModal = () => {
    setActiveId(null);
    setEditing(false);
    setDraft(null);
  };

  // Confirm-modal đang mở → Esc/overlay chỉ đóng nó, không đóng luôn detail
  // modal bên dưới (cả hai Modal đều nghe Escape trên window).
  const closeDetailModal = () => {
    if (pendingDelete) return;
    closeModal();
  };

  const startEdit = () => {
    if (!activeAsset) return;
    setDraft(structuredClone(activeAsset));
    setEditing(true);
  };

  const cancelEdit = () => {
    setDraft(activeAsset ? structuredClone(activeAsset) : null);
    setEditing(false);
  };

  const patchDraft = (patch: Partial<MediaAsset>) =>
    setDraft(prev => (prev ? { ...prev, ...patch } : prev));

  // TODO: chỉ `tags` được persist. `alt` / `caption` / `status` / `role` chưa có
  // field BE nên vẫn là state local — sẽ mất khi refetch (search / upload / delete).
  const saveEdit = async () => {
    if (!draft || saving) return;
    const cleaned: MediaAsset = {
      ...draft,
      alt: draft.alt.trim(),
      caption: draft.caption.trim(),
      tags: draft.tags.map(x => x.trim()).filter(Boolean),
    };

    const prevTags = activeAsset?.tags ?? [];
    const tagsChanged =
      prevTags.length !== cleaned.tags.length ||
      cleaned.tags.some((tag, i) => tag !== prevTags[i]);

    let persisted = cleaned;
    if (tagsChanged) {
      setSaving(true);
      const res = await updateMediaTags(cleaned.id, cleaned.tags);
      setSaving(false);

      if (!res.ok) {
        // Giữ nguyên chế độ edit để user sửa / thử lại.
        toast.error(t('saveFailedToast'), { description: res.error });
        return;
      }
      // Chỉ lấy `tags` — asset map từ BE không có alt/caption user vừa nhập.
      persisted = { ...cleaned, tags: res.asset.tags };
    }

    setAssets(prev => prev.map(a => (a.id === persisted.id ? persisted : a)));
    setDraft(persisted);
    setEditing(false);
    toast.success(t('metadataSaved'));
  };

  const requestDeleteAsset = (asset: MediaAsset) => {
    if (deleting) return;
    setPendingDelete({ kind: 'single', asset });
  };

  const requestBulkDelete = () => {
    if (deleting || !selected.length) return;
    setPendingDelete({
      kind: 'bulk',
      ids: selected,
      count: selected.length,
    });
  };

  const confirmDelete = async () => {
    if (!pendingDelete || deleting) return;

    setDeleting(true);
    const { ok, error } =
      pendingDelete.kind === 'single'
        ? await deleteMediaAsset(pendingDelete.asset.id)
        : await deleteMediaAssets(pendingDelete.ids);
    setDeleting(false);
    setPendingDelete(null);

    if (pendingDelete.kind === 'single') {
      const { asset } = pendingDelete;
      if (!ok) {
        toast.error(t('deleteFailedToast', { name: asset.name }), {
          description: error ?? undefined,
        });
        return;
      }
      setSelected(prev => prev.filter(id => id !== asset.id));
      if (activeId === asset.id) closeModal();
      toast.success(t('deletedToast', { name: asset.name }));
    } else {
      if (!ok) {
        // Giữ nguyên selection để user thử lại.
        toast.error(t('bulkDeleteFailedToast'), {
          description: error ?? undefined,
        });
        return;
      }
      toast.success(t('bulkDeletedToast', { count: pendingDelete.count }));
      clearSelection();
    }

    // Refetch thay vì xoá optimistic: server là nguồn sự thật.
    setReloadToken(x => x + 1);
  };

  /**
   * `UpdateMediaRequest` (BE) chỉ nhận `original_filename | tags | folder_id`
   * — không có `status`. Đổi state ở đây rồi báo "đã lưu trữ" là nói dối:
   * refetch kế tiếp (search/upload/xoá) đọc thẳng từ server, và asset lại hiện
   * ra như chưa từng lưu trữ, không một lỗi nào báo lại. Nói thật cho tới khi
   * BE có cột này.
   */
  const archiveAsset = () => {
    toast.message(t('archiveNotSupportedToast'));
  };

  const toggleSelect = (id: string) =>
    setSelected(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );

  const toggleSelectAll = () =>
    setSelected(prev =>
      prev.length === filtered.length ? [] : filtered.map(a => a.id)
    );

  const clearSelection = () => setSelected([]);

  /** Cùng lý do với `archiveAsset` — BE chưa có cột `status` để ghi. */
  const bulkArchive = () => {
    toast.message(t('archiveNotSupportedToast'));
  };

  return (
    <div className='flex min-h-0 flex-col'>
      {/*
        "Tự động gắn thẻ" (header + bulk-bar) và "Link to product" (bulk-bar)
        không có endpoint BE nào phía sau — trước đây báo thành công kèm số
        giả ("AI đã gắn thẻ 4 tài nguyên · thêm 31 thẻ") mà không hề gọi gì
        cả. Nói thật cho tới khi có endpoint thật.
      */}
      <MediaHeader
        assetCount={assets.length}
        uploading={uploading}
        onAutoTag={() => toast.message(t('autoTagNotSupportedToast'))}
        onFiles={files => void handleFiles(files)}
      />

      <div
        className='relative mx-auto w-full px-5 py-6 md:px-8'
        onDragEnter={onDragEnter}
        onDragOver={onDragEnter}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
      >
        {dragging ? (
          <div
            className={cn(
              'pointer-events-none absolute inset-3 z-20 flex items-center justify-center',
              'rounded-[var(--pv2-r)] border-2 border-dashed border-[var(--pv2-electric)]',
              'bg-[color-mix(in_srgb,var(--pv2-electric)_8%,var(--pv2-canvas))]'
            )}
          >
            <span className='text-[13px] font-semibold text-[var(--pv2-electric)]'>
              {t('dropHint')}
            </span>
          </div>
        ) : null}

        <MediaAlerts
          loadError={loadError}
          expiringCount={expiringCount}
          onReviewExpiring={() => patchFilters({ status: 'expiring' })}
        />

        <MediaUseTabs
          assets={assets}
          value={filters.use}
          onChange={use => patchFilters({ use })}
        />

        <MediaToolbar
          filters={filters}
          folders={folders}
          assetCount={assets.length}
          onPatch={patchFilters}
        />

        {filters.refine ? (
          <MediaFacetPanel
            assets={assets}
            kind={filters.kind}
            status={filters.status}
            onPatch={patchFilters}
          />
        ) : null}

        {selected.length ? (
          <MediaBulkBar
            count={selected.length}
            deleting={deleting}
            onAutoTag={() => toast.message(t('autoTagNotSupportedToast'))}
            onLink={() => toast.message(t('linkToProductNotSupportedToast'))}
            onArchive={bulkArchive}
            onDelete={requestBulkDelete}
            onClear={clearSelection}
          />
        ) : null}

        <MediaResults
          searching={searching}
          assets={filtered}
          view={filters.view}
          selected={selected}
          onToggleSelect={toggleSelect}
          onToggleSelectAll={toggleSelectAll}
          onOpen={openAsset}
          onEdit={asset => openAsset(asset, true)}
          onArchive={archiveAsset}
          onDelete={requestDeleteAsset}
        />
      </div>

      {modalAsset ? (
        <AssetDetailModal
          asset={modalAsset}
          editing={editing}
          saving={saving}
          onChange={patchDraft}
          onEdit={startEdit}
          onCancel={cancelEdit}
          onSave={() => void saveEdit()}
          onDelete={() => requestDeleteAsset(modalAsset)}
          onClose={closeDetailModal}
        />
      ) : null}

      <MediaDeleteConfirmModal
        target={pendingDelete}
        deleting={deleting}
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => void confirmDelete()}
      />
    </div>
  );
};
