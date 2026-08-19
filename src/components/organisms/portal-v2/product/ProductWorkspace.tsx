'use client';

import { Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';

import { CoverPickerModal } from '@/components/organisms/portal-v2/product/CoverPickerModal';
import { MediaPickerModal } from '@/components/organisms/portal-v2/product/MediaPickerModal';
import { fetchCampaignOptions } from '@/services/portal-v2/campaignOptions';
import { fetchProductCatalog } from '@/services/portal-v2/productCatalog';
import {
  attachExistingMedia,
  fetchProductMedia,
  uploadProductMedia,
} from '@/services/portal-v2/productMediaUpload';
import { fetchProductExperienceLinks } from '@/services/portal-v2/productRelations';
import type { WriteFailure } from '@/services/portal-v2/productWrite';
import {
  addProductTags,
  createProduct,
  deleteProducts,
  duplicateProduct as duplicateProductApi,
  setProductsStatus,
  updateProduct,
} from '@/services/portal-v2/productWrite';

import { Button } from '@/components/molecules/portal-v2/Button';
import { Tabs } from '@/components/molecules/portal-v2/Tabs';
import { EmptyState } from '@/components/molecules/portal-v2/product-form';
import { AddProductModal } from '@/components/organisms/portal-v2/product/AddProductModal';
import { DeleteProductModal } from '@/components/organisms/portal-v2/product/DeleteProductModal';
import { ProductBulkBar } from '@/components/organisms/portal-v2/product/ProductBulkBar';
import { ProductGrid } from '@/components/organisms/portal-v2/product/ProductGrid';
import { ProductModal } from '@/components/organisms/portal-v2/product/ProductModal';
import { ProductTable } from '@/components/organisms/portal-v2/product/ProductTable';
import { ProductToolbar } from '@/components/organisms/portal-v2/product/ProductToolbar';
import { cn } from '@/lib/cn';
import {
  PRODUCT_DEFAULT_FILTERS,
  PRODUCT_STATUS,
} from '@/lib/portal-v2/product/constants';
import {
  normalizeProductDraft,
  readiness,
  slugifyHandle,
  uniqueHandle,
  visibleProducts,
} from '@/lib/portal-v2/product/helpers';
import {
  MOCK_PRODUCT_CAMPAIGN_LINKS,
  blankProduct,
  cloneProduct,
} from '@/lib/portal-v2/product/mock';
import type {
  Product,
  ProductAsset,
  ProductExperienceLink,
  ProductFilters,
  ProductModalMode,
  ProductModalTab,
  ProductStatus,
} from '@/lib/portal-v2/product/types';

type ModalState =
  | { kind: 'product'; id: string; mode: ProductModalMode }
  | { kind: 'add' }
  | { kind: 'delete'; ids: string[] }
  | null;

type ProductWorkspaceProps = {
  /** Catalogue as loaded on the server — see `services/portal-v2/productCatalog`. */
  initialProducts: Product[];
  initialAssets?: ProductAsset[];
  /**
   * Brand đang xem. Phải mang theo: mọi lần nạp lại phía client đều gọi
   * `fetchProductCatalog` — quên truyền là bộ lọc rơi mất và lưới bỗng hiện
   * sản phẩm của brand khác.
   */
  brandId?: string | null;
  initialBrands?: string[];
  initialTypes?: string[];
  /** Server-side total; larger than the list means the page was truncated. */
  initialTotal?: number;
  /** Hard failure — nothing loaded. */
  initialError?: string | null;
  /** The catalogue loaded but a lookup did not. */
  softError?: string | null;
};

/** Gom các lỗi cùng mã lại, để một nguyên nhân chỉ hiện một thông báo. */
const groupByCode = (
  failed: WriteFailure[]
): [string | undefined, WriteFailure[]][] => {
  const by = new Map<string | undefined, WriteFailure[]>();
  for (const f of failed) {
    const list = by.get(f.code) ?? [];
    list.push(f);
    by.set(f.code, list);
  }
  return [...by.entries()];
};

/**
 * Mã lỗi BE → khoá i18n. Mã lạ thì rơi về câu chung — thà nói "không xoá được"
 * còn hơn ném nguyên câu tiếng Anh của server ra màn hình.
 */
const reasonKey = (code?: string): string =>
  code === 'ERR_PRODUCT_IN_USE' ? 'toastDeleteInUse' : 'toastDeleteFailed';

export const ProductWorkspace = ({
  initialProducts,
  initialAssets = [],
  brandId = null,
  initialBrands = [],
  initialTypes = [],
  initialTotal,
  initialError = null,
  softError = null,
}: ProductWorkspaceProps) => {
  const t = useTranslations('portalV2.products');

  const [products, setProducts] = useState<Product[]>(initialProducts);
  /** Đang gọi API — khoá nút để không gửi trùng. */
  const [saving, setSaving] = useState(false);
  /** Đang tải ảnh lên — khoá ô chọn file để không gửi trùng. */
  const [uploading, setUploading] = useState(false);
  /** Bảng chọn ảnh có sẵn trong thư viện. */
  const [picking, setPicking] = useState(false);
  /** Bộ chọn ảnh đại diện — chọn trong media CỦA SẢN PHẨM, không phải thư viện. */
  const [pickingCover, setPickingCover] = useState(false);

  /**
   * Ngữ cảnh map giống hệt lúc nạp danh sách, để hàng vừa lưu hiển thị y như
   * hàng đã có. `now` chốt một lần: mỗi hàng tự lấy giờ riêng thì nhãn "vừa
   * xong" sẽ lệch nhau vài giây.
   */
  const mapCtx = useMemo(() => ({ now: Date.now() }), []);
  const [filters, setFilters] = useState<ProductFilters>(
    PRODUCT_DEFAULT_FILTERS
  );
  const [selected, setSelected] = useState<string[]>([]);
  const [modal, setModal] = useState<ModalState>(null);
  const [draft, setDraft] = useState<Product | null>(null);
  const [modalTab, setModalTab] = useState<ProductModalTab>('details');
  /**
   * Id sản phẩm nháp tạo NGẦM khi người dùng bấm Media lúc còn đang ở form
   * Tạo mới (`ensureDraftProduct`). Còn set nghĩa là chưa ai bấm Lưu — Huỷ
   * form thì xoá luôn bản này, không để lại nháp mồ côi trong danh sách.
   */
  const autoCreatedDraftIdRef = useRef<string | null>(null);

  /**
   * Asset của catalogue. Là STATE chứ không phải prop thuần: tải ảnh mới xong
   * phải nạp lại thì lưới ảnh và điểm sẵn sàng (ATT/EXP chấm theo số binding)
   * mới đổi theo, không bắt người dùng F5.
   */
  const [assets, setAssets] = useState<ProductAsset[]>(initialAssets);
  /** Trải nghiệm THẬT của sản phẩm đang mở — xem effect nạp bên dưới. */
  const [experienceLinks, setExperienceLinks] = useState<
    ProductExperienceLink[]
  >([]);
  const list = useMemo(
    () => visibleProducts(products, filters),
    [products, filters]
  );
  /* Only the first page came back — say so rather than let the count read as
   * the whole catalogue. */
  const truncated = (initialTotal ?? products.length) > products.length;

  const statusTabs = useMemo(
    () => [
      { id: 'all', label: t('tabAll'), count: products.length },
      ...(Object.keys(PRODUCT_STATUS) as ProductStatus[]).map(k => ({
        id: k,
        label: PRODUCT_STATUS[k].name,
        count: products.filter(p => p.status === k).length,
      })),
    ],
    [products, t]
  );

  const patchFilters = (partial: Partial<ProductFilters>) => {
    setFilters(prev => ({ ...prev, ...partial }));
    /* An unset facet means ANY — and a changed facet invalidates the selection. */
    if (!('view' in partial)) setSelected([]);
  };

  const closeModal = () => {
    // Huỷ form mà chưa bấm Lưu: bản nháp `ensureDraftProduct` tạo ngầm lúc
    // bấm Media chưa được ai xác nhận giữ lại — xoá đi, đừng để mồ côi.
    const orphanId = autoCreatedDraftIdRef.current;
    autoCreatedDraftIdRef.current = null;
    setModal(null);
    setDraft(null);
    setModalTab('details');
    if (orphanId) {
      setProducts(prev => prev.filter(p => p.id !== orphanId));
      void deleteProducts([orphanId]);
    }
  };

  /* ── Index actions ─────────────────────────────────────────────────── */

  const openProduct = (id: string) => {
    setModalTab('details');
    setDraft(null);
    setModal({ kind: 'product', id, mode: 'view' });
  };

  const openEdit = (id: string) => {
    const product = products.find(p => p.id === id);
    if (!product) return;
    setModalTab(prev =>
      prev === 'details' || prev === 'value' ? prev : 'details'
    );
    setDraft(cloneProduct(product));
    setModal({ kind: 'product', id, mode: 'edit' });
  };

  const openNew = () => {
    setModalTab('details');
    setDraft(blankProduct());
    setModal({ kind: 'product', id: 'new', mode: 'new' });
  };

  const handleDuplicate = async (id: string) => {
    if (saving) return;
    setSaving(true);
    try {
      // BE clone cả media binding trong một transaction; sao chép ở client thì
      // bản sao mất ảnh và mang id không tồn tại.
      const copy = await duplicateProductApi(id, mapCtx);
      setProducts(prev => [copy, ...prev]);
      setFilters(PRODUCT_DEFAULT_FILTERS);
      setSelected([]);
      toast.success(t('toastDuplicated', { name: copy.title }));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('toastSaveFailed'));
    } finally {
      setSaving(false);
    }
  };

  /**
   * Tạo ngầm sản phẩm nháp để có id thật cho Media, khi form còn ở chế độ
   * Tạo mới (`draft.id === 'new'` chưa tồn tại ở BE nên chưa bind media
   * được). Dùng LUÔN tên đã gõ trong form — không hỏi lại qua form nào khác,
   * bấm Media coi như xác nhận đã đủ để lưu nháp.
   *
   * Đã có id thật (đang sửa, hoặc đã tự tạo từ lần bấm Media trước) thì trả
   * về ngay, không tạo lần hai. Nhớ id vào `autoCreatedDraftIdRef` để Huỷ
   * form (`closeModal`) biết cần xoá đúng bản ngầm này nếu không ai Lưu.
   */
  const ensureDraftProduct = async (): Promise<string | null> => {
    if (modal?.kind !== 'product') return null;
    if (modal.mode !== 'new') return modal.id;
    if (!draft || saving) return null;

    const cleaned = normalizeProductDraft(draft);
    if (!cleaned.title) {
      toast.error(t('toastNeedsTitle'));
      return null;
    }
    cleaned.handle =
      cleaned.handle || uniqueHandle(slugifyHandle(cleaned.title), products);
    cleaned.status = 'draft';

    setSaving(true);
    try {
      const created = await createProduct(cleaned, {
        ctx: mapCtx,
        ...(brandId ? { brandId } : {}),
      });
      autoCreatedDraftIdRef.current = created.id;
      setProducts(prev => [created, ...prev]);
      setDraft(cloneProduct(created));
      setModal({ kind: 'product', id: created.id, mode: 'edit' });
      return created.id;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('toastSaveFailed'));
      return null;
    } finally {
      setSaving(false);
    }
  };

  /**
   * Tải ảnh lên rồi gắn vào sản phẩm đang mở.
   *
   * Sản phẩm còn ở form Tạo mới thì `ensureDraftProduct` tự lưu nháp trước
   * để có id thật rồi mới gắn media — người dùng không còn phải bấm Lưu tay.
   * Xong thì nạp lại catalogue — asset mới phải xuất hiện ở lưới ảnh, và
   * `readiness` (ATT/EXP) chấm theo số binding nên cũng đổi theo.
   */
  const handleUploadMedia = async (files: File[]) => {
    if (modal?.kind !== 'product' || uploading) return;
    const productId = await ensureDraftProduct();
    if (!productId) return;

    setUploading(true);
    const results = await uploadProductMedia({
      productId,
      files,
      startSortOrder: assets.filter(a => a.home.ref === productId).length,
    });
    setUploading(false);

    const ok = results.filter(r => r.asset && !r.error);
    const bad = results.filter(r => r.error);

    if (ok.length) {
      await refreshCatalog(productId);
      toast.success(t('toastMediaUploaded', { count: ok.length }));
    }
    if (bad.length) {
      toast.error(
        t('toastMediaFailed', {
          count: bad.length,
          names: bad.map(b => b.file).join(', '),
        }),
        { duration: 8000 }
      );
    }
  };

  /**
   * Media THẬT của sản phẩm đang mở.
   *
   * Danh sách dùng asset tổng hợp (một ảnh giả mỗi sản phẩm, dựng từ
   * `thumbnail_url`) vì gọi chi tiết cho cả trang là 50 round-trip. Nhưng modal
   * thì phải đọc binding thật — nếu không lưới ảnh luôn "0 files" và bộ chọn
   * ảnh bìa luôn rỗng, kể cả khi ảnh đã gắn.
   */
  useEffect(() => {
    if (modal?.kind !== 'product' || modal.mode === 'new') return;
    const id = modal.id;
    let cancelled = false;
    void fetchProductMedia(id)
      .then(real => {
        if (cancelled) return;
        setAssets(prev => [...prev.filter(a => a.home.ref !== id), ...real]);
      })
      .catch(() => {
        /* đọc hụt media không đáng để chặn cả modal */
      });
    return () => {
      cancelled = true;
    };
  }, [modal]);

  /**
   * Trải nghiệm THẬT của sản phẩm đang mở, cho tab Trải nghiệm.
   *
   * Trước đây đọc `MOCK_PRODUCT_EXPERIENCE_LINKS` — hằng số RỖNG — nên tab
   * luôn trống dù sản phẩm đã có bản copy thật gắn vào. Tra thêm tên chiến
   * dịch qua `fetchCampaignOptions` để hiện "home" đúng như bản mock từng
   * làm, thay vì chỉ hiện id.
   */
  useEffect(() => {
    if (modal?.kind !== 'product' || modal.mode === 'new') {
      setExperienceLinks([]);
      return;
    }
    const id = modal.id;
    let cancelled = false;
    void Promise.all([
      fetchProductExperienceLinks(id, brandId),
      fetchCampaignOptions({ brandId }),
    ])
      .then(([rows, campaigns]) => {
        if (cancelled) return;
        const nameOfCampaign = new Map(
          campaigns.items.map(c => [c.id, c.name])
        );
        setExperienceLinks(
          rows.map(r => ({
            productId: id,
            id: r.id,
            name: r.name,
            grad: 'linear-gradient(135deg,#6C4CF1,#9B7DF8)',
            catName:
              r.category === 'blocks' ? t('catBlocks') : t('catCollection'),
            home: r.campaignId
              ? (nameOfCampaign.get(r.campaignId) ?? r.campaignId.slice(0, 8))
              : t('notAssignedToCampaign'),
            proven: r.proven,
            sessions: null,
            lift: null,
          }))
        );
      })
      .catch(() => {
        if (!cancelled) setExperienceLinks([]);
      });
    return () => {
      cancelled = true;
    };
  }, [modal, brandId, t]);

  /** Nạp lại catalogue sau khi media đổi — readiness chấm theo số binding. */
  const refreshCatalog = async (productId?: string) => {
    const fresh = await fetchProductCatalog({ brandId });
    if (!fresh.error) {
      setProducts(fresh.products);
      // Giữ media THẬT của sản phẩm đang mở: `fresh.assets` chỉ là bản tổng
      // hợp, ghi đè thẳng vào là ảnh vừa gắn biến mất khỏi lưới.
      const real = productId ? await fetchProductMedia(productId) : [];
      setAssets([
        ...fresh.assets.filter(a => a.home.ref !== productId),
        ...real,
      ]);
    }
  };

  const handleAttachExisting = async (mediaIds: string[]) => {
    if (modal?.kind !== 'product' || uploading) return;
    const productId = await ensureDraftProduct();
    if (!productId) return;
    setUploading(true);
    try {
      await attachExistingMedia(
        productId,
        mediaIds,
        assets.filter(a => a.home.ref === productId).length
      );
      await refreshCatalog(productId);
      setPicking(false);
      toast.success(t('toastMediaUploaded', { count: mediaIds.length }));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('toastSaveFailed'));
    } finally {
      setUploading(false);
    }
  };

  /**
   * Đặt ảnh đại diện. Ghi thẳng `cover_media_id` qua PATCH — không đi qua chế
   * độ sửa cả sản phẩm, vì việc này chỉ đổi đúng một trường.
   */
  const handleSetCover = async (mediaId: string) => {
    if (modal?.kind !== 'product' || saving) return;
    const target = products.find(p => p.id === modal.id);
    if (!target) return;

    setSaving(true);
    try {
      const saved = await updateProduct(
        { ...target, cover: mediaId },
        { ctx: mapCtx, coverMediaId: mediaId }
      );
      setProducts(prev => prev.map(p => (p.id === saved.id ? saved : p)));
      setPickingCover(false);
      toast.success(t('toastCoverSet'));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('toastSaveFailed'));
    } finally {
      setSaving(false);
    }
  };

  /** Id → tên sản phẩm; không tra được thì lùi về 8 ký tự đầu của id. */
  const nameOf = (id: string) =>
    products.find(p => p.id === id)?.title ?? id.slice(0, 8);

  /** Gộp kết quả hàng loạt vào lưới + báo phần hỏng đích danh. */
  const applyBulk = (
    updated: Product[],
    failed: { id: string; error: string }[],
    okKey: string
  ) => {
    if (updated.length) {
      const byId = new Map(updated.map(p => [p.id, p]));
      setProducts(prev => prev.map(p => byId.get(p.id) ?? p));
      toast.success(t(okKey, { count: updated.length }));
    }
    for (const [code, group] of groupByCode(failed)) {
      toast.error(
        t(reasonKey(code), {
          count: group.length,
          names: group.map(f => nameOf(f.id)).join(', '),
        }),
        { duration: 8000 }
      );
    }
    setSelected([]);
  };

  const handleArchive = async () => {
    if (!selected.length || saving) return;
    setSaving(true);
    const { updated, failed } = await setProductsStatus(
      selected,
      'archived',
      mapCtx
    );
    setSaving(false);
    applyBulk(updated, failed, 'toastArchived');
  };

  const handleAddTags = async () => {
    if (!selected.length || saving) return;
    const raw = window.prompt(t('promptTags'));
    const tags = (raw ?? '')
      .split(',')
      .map(x => x.trim())
      .filter(Boolean);
    if (!tags.length) return;

    const items = products
      .filter(p => selected.includes(p.id))
      .map(p => ({ id: p.id, tags: p.tags ?? [] }));

    setSaving(true);
    const { updated, failed } = await addProductTags(items, tags, mapCtx);
    setSaving(false);
    applyBulk(updated, failed, 'toastTagsAdded');
  };

  const confirmDelete = async () => {
    if (modal?.kind !== 'delete' || saving) return;
    const targets = modal.ids;

    setSaving(true);
    const { deleted, failed } = await deleteProducts(targets);
    setSaving(false);

    // Đã xoá thật rồi — đừng để `closeModal` xoá lại lần nữa bản nháp ngầm.
    if (
      autoCreatedDraftIdRef.current &&
      deleted.includes(autoCreatedDraftIdRef.current)
    ) {
      autoCreatedDraftIdRef.current = null;
    }

    // Chỉ bỏ khỏi lưới những cái BE xác nhận đã xoá — bỏ cả những cái hỏng thì
    // màn hình nói dối, tải lại trang là chúng hiện về.
    const gone = new Set(deleted);
    setProducts(prev => prev.filter(p => !gone.has(p.id)));
    setSelected(prev => prev.filter(id => !gone.has(id)));
    closeModal();

    if (deleted.length)
      toast.success(t('toastDeleted', { count: deleted.length }));
    if (failed.length) {
      toast.error(
        t('toastDeleteFailed', {
          count: failed.length,
          names: failed.map(f => f.id.slice(0, 8)).join(', '),
        })
      );
    }
  };

  /* ── Modal actions ─────────────────────────────────────────────────── */

  const handleSave = async () => {
    if (!draft || modal?.kind !== 'product' || saving) return;
    const cleaned = normalizeProductDraft(draft);
    if (!cleaned.title) {
      toast.error(t('toastNeedsTitle'));
      return;
    }

    setSaving(true);
    try {
      // Nhận lại bản BE trả về, không dùng bản draft: BE chuẩn hoá slug và tự
      // tính `claims[].ok`, hiển thị bản gửi đi sẽ lệch với bản trong CSDL.
      const saved = await updateProduct(cleaned, { ctx: mapCtx });
      setProducts(prev => prev.map(p => (p.id === saved.id ? saved : p)));
      // Đã bấm Lưu thật — bản nháp ngầm (nếu có) giờ là bản chính thức, đừng
      // để `closeModal` xoá nó nữa.
      autoCreatedDraftIdRef.current = null;
      closeModal();
      toast.success(t('toastSaved', { name: saved.title }));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('toastSaveFailed'));
    } finally {
      setSaving(false);
    }
  };

  const handleCreate = async (status: 'draft' | 'active') => {
    if (!draft || saving) return;
    const cleaned = normalizeProductDraft(draft);
    if (!cleaned.title) {
      toast.error(t('toastNeedsTitle'));
      return;
    }
    cleaned.handle =
      cleaned.handle || uniqueHandle(slugifyHandle(cleaned.title), products);
    cleaned.status = status;

    setSaving(true);
    let created: Product;
    try {
      // Id do BE cấp — bản cũ tự bịa từ độ dài danh sách, nên mọi thao tác sau
      // đó (sửa, xoá, gắn media) đều trỏ vào một id không tồn tại.
      // Gắn brand đang xem: tạo xong mà không có brand_id thì sản phẩm rơi
      // ngay ra ngoài bộ lọc — vừa bấm Tạo đã thấy nó biến mất khỏi lưới.
      created = await createProduct(cleaned, {
        ctx: mapCtx,
        ...(brandId ? { brandId } : {}),
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('toastSaveFailed'));
      setSaving(false);
      return;
    }
    setSaving(false);
    setProducts(prev => [created, ...prev]);
    setFilters(PRODUCT_DEFAULT_FILTERS);
    setSelected([]);
    closeModal();
    toast.success(
      t('toastCreated', {
        name: cleaned.title,
        score: readiness(cleaned, assets).score,
      })
    );
  };

  /* ── Render ────────────────────────────────────────────────────────── */

  const activeProduct =
    modal?.kind === 'product'
      ? (draft ?? products.find(p => p.id === modal.id) ?? null)
      : null;

  const deleteItems =
    modal?.kind === 'delete'
      ? products.filter(p => modal.ids.includes(p.id))
      : [];

  return (
    <div className='flex min-h-0 flex-col'>
      <div className='pv2-page-header'>
        <div className='mx-auto flex w-full flex-wrap items-end justify-between gap-4 px-5 pt-6 pb-4 md:px-8'>
          <div className='min-w-0'>
            <h1 className='font-[family-name:var(--pv2-disp)] text-[1.625rem] font-bold tracking-[-0.03em] text-[var(--pv2-ink)] md:text-[1.75rem]'>
              {t('title')}
            </h1>
            <p className='mt-1 text-[13.5px] leading-relaxed text-[var(--pv2-mut)]'>
              {t('subtitle')}
            </p>
          </div>

          <div className='flex shrink-0 items-center gap-2 pb-0.5'>
            <Button
              variant='ghost'
              onClick={() =>
                toast.success(t('toastExported', { count: products.length }))
              }
            >
              {t('export')}
            </Button>
            <Button variant='primary' onClick={() => setModal({ kind: 'add' })}>
              <Plus className='size-[15px]' strokeWidth={2.4} aria-hidden />
              {t('addProduct')}
            </Button>
          </div>
        </div>
      </div>

      <div className='sticky top-0 z-10 bg-[var(--pv2-paper)]'>
        <div className='mx-auto w-full px-5 md:px-8'>
          <Tabs
            items={statusTabs}
            value={filters.status}
            onChange={id =>
              patchFilters({ status: id as ProductFilters['status'] })
            }
            aria-label={t('statusTabsAria')}
          />
        </div>
      </div>

      <div className='mx-auto w-full px-5 py-6 md:px-8'>
        {initialError ? (
          <div className='rounded-[var(--pv2-r)] border border-[var(--pv2-hair)] bg-[var(--pv2-paper)] px-6 py-11 text-center'>
            <p className='text-[15px] font-semibold text-[var(--pv2-ink)]'>
              {t('loadError')}
            </p>
            <p className='mt-2 text-[13px] text-[var(--pv2-mut)]'>
              {initialError}
            </p>
          </div>
        ) : (
          <>
            {softError ? (
              <div
                className={cn(
                  'mb-4 rounded-[var(--pv2-r)] border border-[var(--pv2-hair)]',
                  'bg-[var(--pv2-paper)] px-4 py-3 text-[12.5px] text-[var(--pv2-mut)]'
                )}
              >
                {t('partialLoad', { reason: softError })}
              </div>
            ) : null}

            <ProductToolbar
              filters={filters}
              onChange={patchFilters}
              brands={initialBrands}
              types={initialTypes}
            />

            {truncated ? (
              <p className='mb-3 text-[12px] text-[var(--pv2-faint)]'>
                {t('showingOf', {
                  shown: products.length,
                  total: initialTotal ?? products.length,
                })}
              </p>
            ) : null}

            {selected.length ? (
              <ProductBulkBar
                count={selected.length}
                onPublish={() => toast.success(t('toastPublished'))}
                onAddTags={handleAddTags}
                onArchive={handleArchive}
                onDelete={() => setModal({ kind: 'delete', ids: selected })}
                onClear={() => setSelected([])}
              />
            ) : null}

            {!list.length ? (
              <EmptyState title={t('emptyTitle')}>{t('emptyBody')}</EmptyState>
            ) : filters.view === 'grid' ? (
              <ProductGrid
                products={list}
                assets={assets}
                onOpen={openProduct}
                onEdit={openEdit}
                onDuplicate={handleDuplicate}
                onDelete={id => setModal({ kind: 'delete', ids: [id] })}
              />
            ) : (
              <ProductTable
                products={list}
                assets={assets}
                selected={selected}
                onToggleSelect={id =>
                  setSelected(prev =>
                    prev.includes(id)
                      ? prev.filter(x => x !== id)
                      : [...prev, id]
                  )
                }
                onToggleAll={() =>
                  setSelected(prev =>
                    prev.length === list.length ? [] : list.map(p => p.id)
                  )
                }
                onOpen={openProduct}
                onEdit={openEdit}
                onDuplicate={handleDuplicate}
                onDelete={id => setModal({ kind: 'delete', ids: [id] })}
              />
            )}
          </>
        )}
      </div>

      {modal?.kind === 'product' && activeProduct ? (
        <ProductModal
          product={activeProduct}
          mode={modal.mode}
          tab={modalTab}
          assets={assets}
          experiences={experienceLinks}
          campaigns={MOCK_PRODUCT_CAMPAIGN_LINKS.filter(
            c => c.productId === activeProduct.id
          )}
          onTabChange={setModalTab}
          onChange={setDraft}
          onClose={closeModal}
          onRequestEdit={() => openEdit(activeProduct.id)}
          onUploadMedia={handleUploadMedia}
          onPickFromLibrary={() => setPicking(true)}
          onPickCover={() => setPickingCover(true)}
          uploading={uploading}
          onSave={handleSave}
          onCreate={handleCreate}
          onDelete={() => setModal({ kind: 'delete', ids: [activeProduct.id] })}
          onBuildExperience={() => toast.message(t('toastBuildExperience'))}
        />
      ) : null}

      {/* SAU ProductModal, có lý do: Modal của Portal V2 dùng CHUNG một
          z-index (--pv2-z-top + 10), nên cái nào đứng sau trong DOM mới nằm
          trên. Đặt trước thì bảng chọn vẫn mở nhưng bị modal sản phẩm che
          kín — nhìn hệt như bấm không ăn. */}
      {picking && modal?.kind === 'product' ? (
        <MediaPickerModal
          attachedIds={assets
            .filter(a => a.home.ref === modal.id)
            .map(a => a.id)}
          busy={uploading}
          onClose={() => setPicking(false)}
          onConfirm={handleAttachExisting}
        />
      ) : null}

      {pickingCover && modal?.kind === 'product' ? (
        <CoverPickerModal
          media={assets.filter(a => a.home.ref === modal.id)}
          current={activeProduct?.cover ?? null}
          busy={saving}
          onClose={() => setPickingCover(false)}
          onConfirm={handleSetCover}
        />
      ) : null}

      {modal?.kind === 'add' ? (
        <AddProductModal onClose={closeModal} onAddManually={openNew} />
      ) : null}

      {modal?.kind === 'delete' && deleteItems.length ? (
        <DeleteProductModal
          items={deleteItems}
          assets={assets}
          onClose={closeModal}
          onConfirm={confirmDelete}
        />
      ) : null}
    </div>
  );
};
