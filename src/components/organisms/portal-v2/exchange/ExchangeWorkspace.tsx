'use client';

import { Loader2, Search, Sparkles, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/molecules/portal-v2/Button';
import { Tabs } from '@/components/molecules/portal-v2/Tabs';
import { BuyConfirmModal } from '@/components/organisms/portal-v2/exchange/BuyConfirmModal';
import { ExchangeDetailModal } from '@/components/organisms/portal-v2/exchange/ExchangeDetailModal';
import { ExchangePreviewShell } from '@/components/organisms/portal-v2/exchange/ExchangePreviewShell';
import { FeaturedStrip } from '@/components/organisms/portal-v2/exchange/FeaturedStrip';
import { ObjectiveFilterHelp } from '@/components/organisms/portal-v2/exchange/ObjectiveFilterHelp';
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
  kindLabelKey,
  resolveActionState,
} from '@/lib/portal-v2/exchange/helpers';
import { writeExchangePreviewParam } from '@/lib/portal-v2/exchange/previewParam';
import { resolveExchangePreviewSlug } from '@/lib/portal-v2/exchange/previewSlug';
import { writeExchangeTabParam } from '@/lib/portal-v2/exchange/tabParam';
import { experienceOpenHref } from '@/lib/portal-v2/experiences/openParam';
import { PORTAL_V2_BASE } from '@/lib/portal-v2/nav';
import type {
  ExchangeFilters,
  ExchangeKind,
  ExchangeListingView,
  ExchangeSessionState,
} from '@/lib/portal-v2/exchange/types';
import { cn } from '@/lib/cn';
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
  /**
   * `{ id thẻ: id món trong thư viện }` — món brand ĐÃ lấy về, tra ở server.
   *
   * Nhờ nó mà "Đã có trong thư viện" sống qua lần tải lại trang. Trước đây
   * trạng thái này chỉ nằm trong phiên: tải lại là quên, và người dùng lấy
   * trùng bao nhiêu lần cũng được mà không ai cảnh báo.
   */
  initialAdded?: Record<string, string>;
  /**
   * `false` = khách chưa đăng nhập. Màn này công khai (xem `publicPortalRoutes`
   * trong middleware), nên mọi nút ĐỔI SỞ HỮU phải dẫn sang đăng nhập thay vì
   * gọi API rồi nhận 401.
   *
   * Nút vẫn hiện nguyên như cũ, không bị ẩn hay làm mờ: thứ khách cần thấy là
   * "món này thêm được", còn "cần tài khoản" là câu trả lời cho cú bấm, không
   * phải một hàng rào dựng sẵn trước mặt.
   */
  signedIn?: boolean;
};

export const ExchangeWorkspace = ({
  initialCatalog,
  initialError = null,
  softError: initialSoftError = null,
  initialPreviewId = null,
  initialKind = null,
  initialAdded,
  signedIn = true,
}: ExchangeWorkspaceProps) => {
  const t = useTranslations('portalV2.exchange');
  const router = useRouter();

  /**
   * Resolved at mount only: a deep link opens the preview on the first paint
   * instead of flashing the grid, and the URL never has to be rewritten.
   */
  const [deepLinkedListing] = useState<ExchangeListingView | null>(() => {
    if (!initialPreviewId) return null;
    const match = initialCatalog.find(item => item.id === initialPreviewId);
    return match && isPreviewable(match) ? match : null;
  });

  /**
   * Catalog nạp MỘT LẦN ở server rồi đứng yên — mọi bộ lọc, kể cả ô tìm kiếm,
   * chạy hết trên tập này.
   *
   * Bản trước gõ một ký tự là nạp lại cả ba kho sau 350ms, và trong lúc chờ thì
   * lưới bị xoá trắng thay bằng vòng xoay — nên sửa từ "landing" thành "landing
   * page" làm màn hình nháy vài lần. Bản sau đó chuyển sang nhấn Enter mới hỏi
   * server, nhưng vẫn còn một cái bẫy: lượt tìm ấy THU HẸP luôn catalog, nên
   * xoá trắng ô lại phải chờ một lượt nạp nữa mới về đủ.
   *
   * Nay không có lượt hỏi nào cả. Ba nguồn đã nạp tới trần 200 mỗi nguồn — đo
   * thật là 13 trải nghiệm gốc + ~109 block + 11 định dạng quảng cáo, tức là
   * TOÀN BỘ hàng đang có. Lọc tại chỗ vì thế cho đúng kết quả mà server sẽ trả,
   * tức thì, và xoá ô là về đủ ngay lập tức.
   *
   * KHI NÀO PHẢI XEM LẠI: một nguồn chạm trần 200. Lúc đó phần vượt trần không
   * nằm trong tập này, và tìm tại chỗ sẽ im lặng bỏ sót — cần trả lại một đường
   * hỏi server, kèm chỗ nói cho người dùng biết là còn hàng chưa hiện.
   */
  const catalog = initialCatalog;
  const loadError = initialError;
  const softError = initialSoftError;
  const [filters, setFilters] = useState<ExchangeFilters>(() => ({
    ...EXCHANGE_DEFAULT_FILTERS,
    kind: initialKind ?? EXCHANGE_DEFAULT_FILTERS.kind,
  }));
  const [session, setSession] = useState<ExchangeSessionState>(() => ({
    owned: {},
    added: { ...(initialAdded ?? {}) },
  }));
  const [activeListing, setActiveListing] =
    useState<ExchangeListingView | null>(deepLinkedListing);
  const [modalMode, setModalMode] = useState<ModalMode>(
    deepLinkedListing ? 'preview' : null
  );
  const [previewReturnToDetail, setPreviewReturnToDetail] = useState(false);
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);
  const [installing, setInstalling] = useState(false);
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
    // Khách không có workspace để hỏi; lượt này sẽ 401 chắc chắn.
    if (!signedIn) return;
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
  }, [signedIn]);

  /**
   * Tập đã áp MỌI bộ lọc TRỪ loại — dùng chung cho lưới và cho số đếm trên tab.
   *
   * Đếm phải nằm trên cùng tập với lưới, nếu không tab ghi "13" mà bấm vào chỉ
   * thấy 2 vì từ khoá đang lọc bớt. Đó cũng là con số mà chỉ báo "còn N kết quả
   * ở tab khác" sẽ đọc.
   */
  const scoped = useMemo(
    () => filterListings(catalog, { ...filters, kind: 'all' }),
    [catalog, filters]
  );

  const filtered = useMemo(
    () =>
      filters.kind === 'all'
        ? scoped
        : scoped.filter(r => r.meta.kind === filters.kind),
    [scoped, filters.kind]
  );

  const kindTabs = useMemo(
    () =>
      EXCHANGE_KINDS.map(k => ({
        id: k.id,
        label: t(k.labelKey),
        count: countByKind(scoped, k.id),
      })),
    [scoped, t]
  );

  /**
   * Các tab KHÁC đang có kết quả cho bộ lọc hiện tại.
   *
   * Không còn tab "Tất cả" thì ô tìm kiếm — vốn tìm xuyên cả ba loại — sẽ để
   * người dùng đứng trước một lưới trống trong khi hàng nằm ngay tab bên cạnh.
   * Dải này là thứ nói ra điều đó; thiếu nó thì việc bỏ tab "Tất cả" chỉ đổi
   * một lỗi cũ lấy một lỗi mới.
   */
  const otherKindHits = useMemo(
    () =>
      EXCHANGE_KINDS.filter(k => k.id !== filters.kind)
        .map(k => ({
          id: k.id,
          label: t(k.labelKey),
          count: countByKind(scoped, k.id),
        }))
        .filter(k => k.count > 0),
    [scoped, filters.kind, t]
  );

  /*
   * KHÔNG gắn chú thích rê chuột lên từng chip: nó chồng lên lưới, che mất
   * đúng thứ người dùng đang nhìn, và chỉ trả lời được một chip một lúc. Toàn
   * bộ phần giải thích nằm ở dấu hỏi cạnh chữ "Mục tiêu" (`ObjectiveFilterHelp`),
   * nơi cả bốn hiện cạnh nhau.
   */
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

  const resolvingPreviewRef = useRef<string | null>(null);

  const openPreview = useCallback((listing: ExchangeListingView) => {
    setPreviewReturnToDetail(modalModeRef.current === 'detail');
    setActiveListing(listing);
    setModalMode('preview');
  }, []);

  /**
   * Template listing often has no `preview_slug` on the wire. Resolve the
   * published `/p/{slug}` before opening, instead of toasting immediately.
   */
  const ensurePreviewable = useCallback(
    async (
      listing: ExchangeListingView
    ): Promise<ExchangeListingView | null> => {
      if (isPreviewable(listing)) return listing;
      if (listing.source !== 'page') {
        toast.error(t('previewMissingBlockId'));
        return null;
      }
      if (resolvingPreviewRef.current === listing.id) return null;
      resolvingPreviewRef.current = listing.id;
      const toastId = toast.loading(t('previewLoading'));
      try {
        const slug = await resolveExchangePreviewSlug(listing);
        if (!slug) {
          toast.error(t('previewMissingSlug'));
          return null;
        }
        return { ...listing, slug };
      } catch {
        toast.error(t('previewMissingSlug'));
        return null;
      } finally {
        toast.dismiss(toastId);
        if (resolvingPreviewRef.current === listing.id) {
          resolvingPreviewRef.current = null;
        }
      }
    },
    [t]
  );

  const handlePreview = useCallback(
    async (listing: ExchangeListingView) => {
      const next = await ensurePreviewable(listing);
      if (!next) return;
      openPreview(next);
    },
    [ensurePreviewable, openPreview]
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
    async (listing: ExchangeListingView) => {
      const next = await ensurePreviewable(listing);
      if (!next) return;
      setActiveListing(next);
    },
    [ensurePreviewable]
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
      kindLabel: t(kindLabelKey(listing.meta.kind)),
      evidence: listing.proven ? (listing.meta.evidence ?? null) : null,
    }),
    [t]
  );

  const previewNeighborItems = useMemo(
    () => previewNeighbors.map(toPreviewItem),
    [previewNeighbors, toPreviewItem]
  );

  /**
   * Đưa khách sang đăng nhập, mang theo đúng chỗ họ đang đứng.
   *
   * `redirect` giữ cả query string, nên nếu họ đang mở preview một món
   * (`?preview=...`) thì sau khi đăng nhập họ quay lại ĐÚNG món đó — chứ không
   * bị thả về lưới rồi phải tự tìm lại. `RexerSignInForm` đọc tham số này.
   */
  const requireSignIn = useCallback(
    (message: string) => {
      toast.message(message);
      const here =
        typeof window === 'undefined'
          ? `${PORTAL_V2_BASE}/exchange`
          : `${window.location.pathname}${window.location.search}`;
      router.push(`/sign-in?redirect=${encodeURIComponent(here)}`);
    },
    [router]
  );

  const handleSell = useCallback(() => {
    if (!signedIn) {
      requireSignIn(t('guestSellNeedsAccount'));
      return;
    }
    toast.message(t('sellSoon'));
  }, [signedIn, requireSignIn, t]);

  const installListing = useCallback(
    async (listing: ExchangeListingView) => {
      // Ads chưa có đường về Experiences (xem `ExchangeActionState`). UI đã
      // không bày nút Thêm cho chúng; chốt lại ở đây để nhánh `else` bên dưới
      // — nhánh gán cứng `type: 'landing'` — không bao giờ nhận một ad là
      // trải nghiệm gốc rồi lặng lẽ đẻ ra một landing page.
      if (listing.meta.kind === 'ad') return;

      // Không có workspace thì KHÔNG có chỗ để thêm vào. Trước đây nhánh này
      // bung JSON ra alert rồi vẫn đánh dấu "đã thêm" — người dùng đóng hộp
      // thoại và tin là xong, trong khi chẳng có gì được tạo.
      if (!workspaceId) {
        toast.error(t('addNeedsWorkspace'));
        return;
      }

      setInstalling(true);
      /** Id của món vừa tạo trong thư viện — đích để dẫn người dùng tới. */
      let libraryId: string | null = null;
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
          libraryId = exp.id;
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
          libraryId = block.id;
          setSession(prev => ({
            ...prev,
            added: { ...prev.added, [listing.id]: block.id },
          }));
        } else {
          // Trải nghiệm gốc hệ thống. BE nhận `template_id`, KHÔNG nhận
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
          libraryId = page.id;
          setSession(prev => ({
            ...prev,
            added: { ...prev.added, [listing.id]: page.id },
          }));
        }
        toast.success(t('addedToast', { name: listing.name }));
        handleCloseModal();

        /*
         * DẪN NGƯỜI DÙNG ĐI TIẾP, đừng thả lại giữa lưới.
         *
         * Đây là khoảnh khắc người ta vừa quyết xong và đang có đà. Bản trước
         * chỉ hiện một thông báo rồi đóng hộp — muốn dùng tiếp phải tự sang
         * thư viện, mò đúng tab, mò đúng thẻ, mở ra, mới thấy nút "Dùng trải
         * nghiệm này". Bốn bước mò mẫm ở đúng chỗ đắt giá nhất của cả phễu.
         */
        if (libraryId) {
          router.push(experienceOpenHref(PORTAL_V2_BASE, libraryId));
        }
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
    [workspaceId, handleCloseModal, router, t]
  );

  const handleAction = useCallback(
    (listing: ExchangeListingView) => {
      // Chặn TRƯỚC khi đọc trạng thái nút: với khách thì mọi nhánh bên dưới
      // (thêm, mua, mở trong thư viện) đều cần một tài khoản, nên phân biệt
      // chúng chỉ tổ hiện ba thông báo khác nhau cho cùng một câu trả lời.
      if (!signedIn) {
        requireSignIn(t('guestActionNeedsAccount'));
        return;
      }

      const state = resolveActionState(listing, session, EXCHANGE_CAN_BUY);

      if (state === 'locked') {
        // Dẫn thẳng tới chỗ mua được, đừng chỉ báo là không mua được: người
        // dùng vừa nói rõ họ MUỐN món này — đó là lúc đắt giá nhất để mở trang
        // gói ra, chứ không phải bắt họ tự đi tìm.
        toast.message(t('premiumLock'));
        router.push(`${PORTAL_V2_BASE}/billing`);
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
    [signedIn, requireSignIn, session, t, installListing, router]
  );

  /**
   * `POST /exchange/items/{id}/add` (endpoints.ts) chỉ nhận item MIỄN PHÍ —
   * `price_cents > 0` bị BE từ chối 400. Đánh dấu `owned` ở đây rồi báo "đã
   * mua" là nói dối: không có đường thanh toán thật nào phía sau, và item vẫn
   * chưa hề thuộc về brand. Nói thật cho tới khi có luồng thanh toán.
   */
  const handleConfirmBuy = useCallback(() => {
    setModalMode('detail');
    toast.message(t('buyNotAvailableToast'));
  }, [t]);

  const handleKindChange = (id: string) => {
    const kind = id as ExchangeFilters['kind'];
    setFilters(prev => ({ ...prev, kind }));
    writeExchangeTabParam(kind);
  };

  const handleSearchChange = useCallback((value: string) => {
    setFilters(prev => ({ ...prev, q: value }));
  }, []);

  const handleSearchClear = useCallback(() => {
    setFilters(prev => ({ ...prev, q: '' }));
  }, []);

  /** Mở món đã lấy về, ngay tại chỗ nó nằm trong thư viện. */
  const handleOpenInLibrary = useCallback(
    (listing: ExchangeListingView) => {
      const libraryId = session.added[listing.id];
      if (!libraryId) return;
      router.push(experienceOpenHref(PORTAL_V2_BASE, libraryId));
    },
    [session.added, router]
  );

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
        {/*
          Dải mời đăng nhập, đặt TRÊN lưới chứ không phải dưới chân trang: nó
          trả lời câu hỏi "tôi đang xem cái gì đây" ngay khi trang hiện, trước
          khi khách bấm nhầm một nút rồi mới biết là cần tài khoản.
        */}
        {!signedIn ? (
          <div
            className={cn(
              'mb-5 flex flex-wrap items-center gap-x-5 gap-y-3 rounded-[var(--pv2-r-lg)]',
              'border border-[var(--pv2-hair)] bg-[var(--pv2-paper)] px-5 py-4'
            )}
          >
            <div className='min-w-[240px] flex-1'>
              <p className='text-[14px] font-semibold text-[var(--pv2-ink)]'>
                {t('guestBannerTitle')}
              </p>
              <p className='mt-1 text-[12.5px] leading-relaxed text-[var(--pv2-mut)]'>
                {t('guestBannerBody')}
              </p>
            </div>
            <div className='flex shrink-0 items-center gap-2.5'>
              <Link
                href='/sign-in'
                className={cn(
                  'inline-flex h-[34px] items-center rounded-full border border-[var(--pv2-hair)]',
                  'bg-transparent px-3.5 text-[13px] font-semibold text-[var(--pv2-ink)] no-underline',
                  'transition-all duration-200 hover:border-[var(--pv2-slate-300)] hover:bg-[var(--pv2-canvas)]',
                  'focus-visible:ring-2 focus-visible:ring-[var(--pv2-electric)] focus-visible:ring-offset-2'
                )}
              >
                {t('guestBannerSignIn')}
              </Link>
              <Link
                href='/sign-up'
                className={cn(
                  'inline-flex h-[34px] items-center rounded-full px-3.5 no-underline',
                  'bg-[var(--pv2-electric)] text-[13px] font-semibold text-[var(--pv2-paper)]',
                  'shadow-[0_4px_12px_rgba(56,98,255,0.25)] transition-all duration-200',
                  'hover:-translate-y-[0.5px] hover:bg-[var(--pv2-electric-hover)]',
                  'focus-visible:ring-2 focus-visible:ring-[var(--pv2-electric)] focus-visible:ring-offset-2'
                )}
              >
                {t('guestBannerCta')}
              </Link>
            </div>
          </div>
        ) : null}

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
              <div
                role='search'
                className={cn(
                  'flex min-w-[250px] flex-1 items-center gap-2 rounded-[10px]',
                  'border border-[var(--pv2-hair)] bg-[var(--pv2-paper)] py-2 pr-1.5 pl-[11px] text-[var(--pv2-faint)]',
                  'transition-colors focus-within:border-[var(--pv2-violet)]'
                )}
              >
                <Search
                  className='size-3.5 shrink-0'
                  strokeWidth={2.2}
                  aria-hidden
                />
                <input
                  // `type='text'`, KHÔNG `search`: nút X mặc định của trình
                  // duyệt không đi qua state của React, nên hai đường xoá sẽ
                  // lệch nhau. Nút X bên dưới là đường DUY NHẤT.
                  type='text'
                  value={filters.q}
                  onChange={e => handleSearchChange(e.target.value)}
                  placeholder={t('searchPlaceholder')}
                  aria-label={t('searchAria')}
                  className='min-w-0 flex-1 border-0 bg-transparent text-[12.5px] text-[var(--pv2-ink)] outline-none placeholder:text-[var(--pv2-faint)]'
                />

                {filters.q ? (
                  <button
                    type='button'
                    onClick={handleSearchClear}
                    aria-label={t('searchClear')}
                    className={cn(
                      'grid size-6 shrink-0 place-items-center rounded-md',
                      'text-[var(--pv2-faint)] transition-colors hover:text-[var(--pv2-ink)]',
                      'focus-visible:ring-2 focus-visible:ring-[var(--pv2-electric)] focus-visible:outline-none'
                    )}
                  >
                    <X className='size-3.5' strokeWidth={2.2} aria-hidden />
                  </button>
                ) : null}
              </div>

              <span className='ml-1.5 flex items-center gap-1.5 self-center text-[11px] font-semibold tracking-[0.04em] text-[var(--pv2-faint)] uppercase'>
                {t('filterObjective')}
                <ObjectiveFilterHelp />
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

            {/*
              Chỉ hiện khi ĐANG tìm kiếm. Lúc chỉ lướt tab thì con số đã nằm
              ngay trên chính tab đó rồi — nhắc lại là nhiễu.
            */}
            {filters.q.trim() && otherKindHits.length ? (
              <div className='mb-3.5 flex flex-wrap items-center gap-2 text-[12px] text-[var(--pv2-mut)]'>
                <span>{t('otherTabsLabel')}</span>
                {otherKindHits.map(k => (
                  <button
                    key={k.id}
                    type='button'
                    onClick={() => handleKindChange(k.id)}
                    className={cn(
                      'rounded-full border border-[var(--pv2-hair)] bg-[var(--pv2-paper)] px-2.5 py-1',
                      'text-[11.5px] font-semibold text-[var(--pv2-ink)] transition-colors',
                      'hover:border-[var(--pv2-electric)] hover:text-[var(--pv2-electric)]',
                      'focus-visible:ring-2 focus-visible:ring-[var(--pv2-electric)] focus-visible:outline-none'
                    )}
                  >
                    {t('otherTabsHit', { label: k.label, count: k.count })}
                  </button>
                ))}
              </div>
            ) : null}

            {filtered.length ? (
              <div className='mt-4 grid grid-cols-[repeat(auto-fill,minmax(244px,1fr))] gap-4'>
                {filtered.map(listing => (
                  <ListingCard
                    key={listing.id}
                    listing={listing}
                    session={session}
                    onOpen={handleOpen}
                    onAction={handleAction}
                    onPreview={handlePreview}
                    onOpenInLibrary={handleOpenInLibrary}
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
          onOpenInLibrary={handleOpenInLibrary}
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
