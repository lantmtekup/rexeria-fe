'use client';

import { Loader2, Search, Sparkles } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/molecules/portal-v2/Button';
import { Tabs } from '@/components/molecules/portal-v2/Tabs';
import { BuyConfirmModal } from '@/components/organisms/portal-v2/exchange/BuyConfirmModal';
import { ExchangeDetailModal } from '@/components/organisms/portal-v2/exchange/ExchangeDetailModal';
import { ExchangePreviewShell } from '@/components/organisms/portal-v2/exchange/ExchangePreviewShell';
import { FeaturedStrip } from '@/components/organisms/portal-v2/exchange/FeaturedStrip';
import { FilterChips } from '@/components/molecules/portal-v2/FilterChips';
import type { PreviewItem } from '@/lib/portal-v2/preview/types';
import { ListingCard } from '@/components/organisms/portal-v2/exchange/ListingCard';
import {
  EXCHANGE_CAN_BUY,
  EXCHANGE_DEFAULT_FILTERS,
  EXCHANGE_KINDS,
  EXCHANGE_OBJECTIVES,
  EXCHANGE_PRICES,
} from '@/lib/portal-v2/exchange/constants';
import {
  countByKind,
  filterListings,
  isPreviewable,
  resolveActionState,
} from '@/lib/portal-v2/exchange/helpers';
import { writeExchangePreviewParam } from '@/lib/portal-v2/exchange/previewParam';
import { writeExchangeTabParam } from '@/lib/portal-v2/exchange/tabParam';
import type {
  ExchangeFilters,
  ExchangeKind,
  ExchangeListingView,
  ExchangeSessionState,
} from '@/lib/portal-v2/exchange/types';
import { cn } from '@/lib/cn';
import { fetchExchangeCatalog } from '@/services/portal-v2/exchangeCatalog';
import { RxApiError } from '@/services/rexer/client';
import { rexerApi } from '@/services/rexer/endpoints';
import { rexerV2Api } from '@/services/rexer-v2/endpoints';

type ModalMode = 'detail' | 'buy' | 'preview' | null;

type ExchangeWorkspaceProps = {
  initialCatalog: ExchangeListingView[];
  initialError?: string | null;
  softError?: string | null;
  /** Listing id from `?preview=` — reopens that preview on a pasted link. */
  initialPreviewId?: string | null;
  /** Kind tab from `?tab=` — restored on reload or shared links. */
  initialKind?: ExchangeKind | null;
};

const SEARCH_DEBOUNCE_MS = 350;

export const ExchangeWorkspace = ({
  initialCatalog,
  initialError = null,
  softError: initialSoftError = null,
  initialPreviewId = null,
  initialKind = null,
}: ExchangeWorkspaceProps) => {
  const t = useTranslations('portalV2.exchange');

  /**
   * Resolved at mount only: a deep link opens the preview on the first paint
   * instead of flashing the grid, and the URL never has to be rewritten.
   */
  const [deepLinkedListing] = useState<ExchangeListingView | null>(() => {
    if (!initialPreviewId) return null;
    const match = initialCatalog.find(item => item.id === initialPreviewId);
    return match && isPreviewable(match) ? match : null;
  });

  const [catalog, setCatalog] = useState(initialCatalog);
  const [loadError, setLoadError] = useState(initialError);
  const [softError, setSoftError] = useState(initialSoftError);
  const [searching, setSearching] = useState(false);
  const [filters, setFilters] = useState<ExchangeFilters>(() => ({
    ...EXCHANGE_DEFAULT_FILTERS,
    kind: initialKind ?? EXCHANGE_DEFAULT_FILTERS.kind,
  }));
  const [debouncedQ, setDebouncedQ] = useState('');
  const [session, setSession] = useState<ExchangeSessionState>({
    owned: {},
    added: {},
  });
  const [activeListing, setActiveListing] =
    useState<ExchangeListingView | null>(deepLinkedListing);
  const [modalMode, setModalMode] = useState<ModalMode>(
    deepLinkedListing ? 'preview' : null
  );
  const [previewReturnToDetail, setPreviewReturnToDetail] = useState(false);
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);
  const [installing, setInstalling] = useState(false);
  const skipFirstSearch = useRef(true);
  const modalModeRef = useRef(modalMode);
  /** `?preview=` pointed at a listing that is gone or has nothing to render. */
  const deadPreviewLinkRef = useRef(
    Boolean(initialPreviewId) && deepLinkedListing === null
  );

  modalModeRef.current = modalMode;

  /** Featured strip stays the first 3 landings from the initial (unfiltered) load. */
  const featured = useMemo(
    () =>
      initialCatalog
        .filter(item => item.source === 'page' && item.meta.kind === 'page')
        .slice(0, 3),
    [initialCatalog]
  );

  useEffect(() => {
    let cancelled = false;

    rexerApi.auth
      .me()
      .then(res => {
        if (!cancelled && res.user.active_workspace_id) {
          setWorkspaceId(res.user.active_workspace_id);
        }
      })
      .catch(() => undefined);

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedQ(filters.q.trim());
    }, SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [filters.q]);

  useEffect(() => {
    if (skipFirstSearch.current) {
      skipFirstSearch.current = false;
      return;
    }

    let cancelled = false;
    setSearching(true);

    fetchExchangeCatalog({ q: debouncedQ || undefined })
      .then(result => {
        if (cancelled) return;
        setCatalog(result.catalog);
        setLoadError(result.error);
        setSoftError(result.softError);
      })
      .catch(err => {
        if (cancelled) return;
        setLoadError(
          err instanceof RxApiError
            ? err.message
            : err instanceof Error
              ? err.message
              : 'Failed to load catalog'
        );
        setCatalog([]);
        setSoftError(null);
      })
      .finally(() => {
        if (!cancelled) setSearching(false);
      });

    return () => {
      cancelled = true;
    };
  }, [debouncedQ]);

  const filtered = useMemo(
    () => filterListings(catalog, { ...filters, q: '' }),
    [catalog, filters]
  );

  const kindTabs = useMemo(
    () =>
      EXCHANGE_KINDS.map(k => ({
        id: k.id,
        label: t(k.labelKey),
        count: countByKind(catalog, k.id),
      })),
    [catalog, t]
  );

  const objectiveOptions = useMemo(
    () =>
      EXCHANGE_OBJECTIVES.map(o => ({
        id: o.id,
        label: t(o.labelKey),
      })),
    [t]
  );

  const priceOptions = useMemo(
    () =>
      EXCHANGE_PRICES.map(p => ({
        id: p.id,
        label: t(p.labelKey),
      })),
    [t]
  );

  const handleOpen = useCallback((listing: ExchangeListingView) => {
    setPreviewReturnToDetail(false);
    setActiveListing(listing);
    setModalMode('detail');
  }, []);

  const handleCloseModal = useCallback(() => {
    setModalMode(null);
    setActiveListing(null);
    setPreviewReturnToDetail(false);
  }, []);

  const canOpenPreview = useCallback(
    (listing: ExchangeListingView): boolean => {
      if (isPreviewable(listing)) return true;
      toast.error(
        listing.source === 'page'
          ? t('previewMissingSlug')
          : t('previewMissingBlockId')
      );
      return false;
    },
    [t]
  );

  const openPreview = useCallback((listing: ExchangeListingView) => {
    setPreviewReturnToDetail(modalModeRef.current === 'detail');
    setActiveListing(listing);
    setModalMode('preview');
  }, []);

  const handlePreview = useCallback(
    (listing: ExchangeListingView) => {
      if (!canOpenPreview(listing)) return;
      openPreview(listing);
    },
    [canOpenPreview, openPreview]
  );

  const handleClosePreview = useCallback(() => {
    if (previewReturnToDetail && activeListing) {
      setPreviewReturnToDetail(false);
      setModalMode('detail');
      return;
    }
    handleCloseModal();
  }, [previewReturnToDetail, activeListing, handleCloseModal]);

  const handlePreviewNavigate = useCallback(
    (listing: ExchangeListingView) => {
      if (!canOpenPreview(listing)) return;
      setActiveListing(listing);
    },
    [canOpenPreview]
  );

  /** Address bar follows the open preview, so the URL can be copied and pasted back. */
  useEffect(() => {
    const previewing = modalMode === 'preview' ? activeListing : null;
    writeExchangePreviewParam(previewing?.id ?? null);
  }, [modalMode, activeListing]);

  useEffect(() => {
    if (!deadPreviewLinkRef.current) return;
    deadPreviewLinkRef.current = false;
    toast.error(t('previewUnavailable'));
  }, [t]);

  const previewNeighbors = useMemo(() => {
    if (!activeListing) return filtered;
    if (filtered.some(item => item.id === activeListing.id)) return filtered;
    return [activeListing, ...filtered];
  }, [activeListing, filtered]);

  /**
   * The preview shell speaks `PreviewItem`, not `ExchangeListingView` — it only
   * ever needed six fields, and Experiences drives the same shell. Everything
   * lines up structurally except the two the catalog has to name itself.
   */
  const toPreviewItem = useCallback(
    (listing: ExchangeListingView): PreviewItem => ({
      ...listing,
      kindLabel: listing.meta.kind === 'block' ? t('kindBlock') : t('kindPage'),
      evidence: listing.proven ? (listing.meta.evidence ?? null) : null,
    }),
    [t]
  );

  const previewNeighborItems = useMemo(
    () => previewNeighbors.map(toPreviewItem),
    [previewNeighbors, toPreviewItem]
  );

  const handleSell = useCallback(() => {
    toast.message(t('sellSoon'));
  }, [t]);

  const installListing = useCallback(
    async (listing: ExchangeListingView) => {
      // Không có workspace thì KHÔNG có chỗ để thêm vào. Trước đây nhánh này
      // bung JSON ra alert rồi vẫn đánh dấu "đã thêm" — người dùng đóng hộp
      // thoại và tin là xong, trong khi chẳng có gì được tạo.
      if (!workspaceId) {
        toast.error(t('addNeedsWorkspace'));
        return;
      }

      setInstalling(true);
      try {
        if (listing.exchangeItemId) {
          // Món trên CHỢ (kể cả kind='block') — hợp đồng Exchange cố ý không
          // trả source id (doc của RxExchangeItemDetail), nên không dựng được
          // block/page từ nó trực tiếp; phải đi qua endpoint sinh ra đúng cho
          // việc này. Nó luôn fork thành một Experience mới sang brand của
          // người gọi, kể cả khi nguồn là block — đây PHẢI check trước nhánh
          // `source === 'block'` bên dưới, vì item block trên chợ cũng mang
          // `source: 'block'` nhưng không có `blockId`.
          const exp = await rexerV2Api.exchange.add(listing.exchangeItemId);
          setSession(prev => ({
            ...prev,
            added: { ...prev.added, [listing.id]: exp.id },
          }));
        } else if (listing.source === 'block') {
          // Block của chính kho nền tảng (`GET /v1/blocks`), không qua chợ —
          // clone thẳng thành một Block mới trong thư viện block của brand.
          if (!listing.blockId) {
            throw new Error('Missing block id');
          }
          const block = await rexerApi.blocks.clone(listing.blockId, {
            name: `${listing.name} (Exchange)`,
          });
          setSession(prev => ({
            ...prev,
            added: { ...prev.added, [listing.id]: block.id },
          }));
        } else {
          // Template hệ thống. BE nhận `template_id`, KHÔNG nhận
          // `template_version_id` (`models/page.go:118`) — bản trước gửi
          // nhầm trường nên BE thấy cả template_id lẫn external_url đều rỗng
          // và trả "exactly one of template_id or external_url is required".
          // Nút Thêm cho experience vì thế chưa bao giờ chạy được.
          if (!listing.templateId) {
            throw new Error('Missing template id');
          }
          const page = await rexerApi.pages.create(workspaceId, {
            type: 'landing',
            template_id: listing.templateId,
            name: `${listing.name} (Exchange)`,
          });
          setSession(prev => ({
            ...prev,
            added: { ...prev.added, [listing.id]: page.id },
          }));
        }
        toast.success(t('addedToast', { name: listing.name }));
        handleCloseModal();
      } catch (err) {
        const msg =
          err instanceof RxApiError
            ? err.message
            : err instanceof Error
              ? err.message
              : 'Install failed';
        toast.error(msg);
      } finally {
        setInstalling(false);
      }
    },
    [workspaceId, handleCloseModal, t]
  );

  const handleAction = useCallback(
    (listing: ExchangeListingView) => {
      const state = resolveActionState(listing, session, EXCHANGE_CAN_BUY);

      if (state === 'locked') {
        toast.message(t('premiumLock'));
        return;
      }

      if (state === 'added') return;

      if (state === 'buy') {
        setActiveListing(listing);
        setModalMode('buy');
        return;
      }

      void installListing(listing);
    },
    [session, t, installListing]
  );

  const handleConfirmBuy = useCallback(
    (listing: ExchangeListingView) => {
      setSession(prev => ({
        ...prev,
        owned: { ...prev.owned, [listing.id]: true },
      }));
      setModalMode('detail');
      toast.success(t('purchasedToast', { name: listing.name }));
    },
    [t]
  );

  const handleKindChange = (id: string) => {
    const kind = id as ExchangeFilters['kind'];
    setFilters(prev => ({ ...prev, kind }));
    writeExchangeTabParam(kind);
  };

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
            <Button variant='ghost' onClick={handleSell}>
              <Sparkles className='size-[15px]' strokeWidth={2.2} aria-hidden />
              {t('sellTemplate')}
            </Button>
          </div>
        </div>
      </div>

      <div className='mx-auto w-full px-5 py-6 md:px-8'>
        {loadError ? (
          <div
            className={cn(
              'rounded-[var(--pv2-r-lg)] border border-dashed border-[var(--pv2-hair)]',
              'bg-[var(--pv2-paper)] px-6 py-14 text-center'
            )}
          >
            <p className='text-[15px] font-semibold text-[var(--pv2-ink)]'>
              {t('loadError')}
            </p>
            <p className='mt-2 text-[13px] text-[var(--pv2-mut)]'>
              {loadError}
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
                {softError}
              </div>
            ) : null}

            <FeaturedStrip
              items={featured}
              onOpen={handleOpen}
              onPreview={handlePreview}
            />

            <div className='sticky top-0 z-10 -mx-5 mb-3.5 bg-[var(--pv2-canvas)] px-5 md:-mx-8 md:px-8'>
              <Tabs
                items={kindTabs}
                value={filters.kind}
                onChange={handleKindChange}
                aria-label={t('kindTabsAria')}
              />
            </div>

            <div className='mb-3.5 flex flex-wrap items-center gap-2'>
              <label
                className={cn(
                  'flex min-w-[250px] flex-1 items-center gap-2 rounded-[10px]',
                  'border border-[var(--pv2-hair)] bg-[var(--pv2-paper)] px-[11px] py-2 text-[var(--pv2-faint)]',
                  'transition-colors focus-within:border-[var(--pv2-violet)]'
                )}
              >
                <Search
                  className='size-3.5 shrink-0'
                  strokeWidth={2.2}
                  aria-hidden
                />
                <input
                  type='search'
                  value={filters.q}
                  onChange={e =>
                    setFilters(prev => ({ ...prev, q: e.target.value }))
                  }
                  placeholder={t('searchPlaceholder')}
                  aria-label={t('searchAria')}
                  className='min-w-0 flex-1 border-0 bg-transparent text-[12.5px] text-[var(--pv2-ink)] outline-none placeholder:text-[var(--pv2-faint)]'
                />
              </label>

              <span className='ml-1.5 self-center text-[11px] font-semibold tracking-[0.04em] text-[var(--pv2-faint)] uppercase'>
                {t('filterObjective')}
              </span>
              <FilterChips
                inline
                options={objectiveOptions}
                value={filters.obj}
                onChange={id =>
                  setFilters(prev => ({
                    ...prev,
                    obj: id as ExchangeFilters['obj'],
                  }))
                }
              />

              <span className='ml-1.5 self-center text-[11px] font-semibold tracking-[0.04em] text-[var(--pv2-faint)] uppercase'>
                {t('filterPrice')}
              </span>
              <FilterChips
                inline
                options={priceOptions}
                value={filters.price}
                onChange={id =>
                  setFilters(prev => ({
                    ...prev,
                    price: id as ExchangeFilters['price'],
                  }))
                }
              />
            </div>

            {searching ? (
              <div className='mt-4 flex items-center justify-center gap-2 py-10 text-[13px] text-[var(--pv2-mut)]'>
                <Loader2 className='size-4 animate-spin text-[var(--pv2-electric)]' />
                {t('loading')}
              </div>
            ) : filtered.length ? (
              <div className='mt-4 grid grid-cols-[repeat(auto-fill,minmax(244px,1fr))] gap-4'>
                {filtered.map(listing => (
                  <ListingCard
                    key={listing.id}
                    listing={listing}
                    session={session}
                    onOpen={handleOpen}
                    onAction={handleAction}
                    onPreview={handlePreview}
                  />
                ))}
              </div>
            ) : (
              <div
                className={cn(
                  'mt-4 rounded-[var(--pv2-r)] border border-dashed border-[var(--pv2-hair)]',
                  'px-10 py-10 text-center text-[13px] text-[var(--pv2-faint)]'
                )}
              >
                {t('empty')}
              </div>
            )}
          </>
        )}

        {installing ? (
          <div className='pointer-events-none fixed inset-0 z-[calc(var(--pv2-z-top)+5)] grid place-items-center bg-black/10'>
            <div className='flex items-center gap-2 rounded-[var(--pv2-r)] bg-[var(--pv2-paper)] px-4 py-3 shadow-[var(--pv2-sh-soft)]'>
              <Loader2 className='size-4 animate-spin text-[var(--pv2-electric)]' />
              <span className='text-[13px] font-semibold text-[var(--pv2-ink)]'>
                {t('installing')}
              </span>
            </div>
          </div>
        ) : null}
      </div>

      {modalMode === 'detail' && activeListing ? (
        <ExchangeDetailModal
          listing={activeListing}
          session={session}
          onClose={handleCloseModal}
          onAction={handleAction}
          onPreview={handlePreview}
        />
      ) : null}

      {modalMode === 'buy' && activeListing ? (
        <BuyConfirmModal
          listing={activeListing}
          onClose={() => setModalMode('detail')}
          onConfirm={handleConfirmBuy}
        />
      ) : null}

      <ExchangePreviewShell
        open={modalMode === 'preview' && activeListing !== null}
        listing={
          modalMode === 'preview' && activeListing
            ? toPreviewItem(activeListing)
            : null
        }
        neighbors={previewNeighborItems}
        onClose={handleClosePreview}
        onNavigate={item => {
          const listing = previewNeighbors.find(l => l.id === item.id);
          if (listing) handlePreviewNavigate(listing);
        }}
      />
    </div>
  );
};
