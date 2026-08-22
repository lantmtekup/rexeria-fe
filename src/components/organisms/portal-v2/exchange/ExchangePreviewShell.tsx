'use client';

import {
  ChevronLeft,
  ChevronRight,
  Monitor,
  PenLine,
  Smartphone,
  X,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import type { Device } from '@/components/modules/block-editor/types';
import { ExchangeAdPreview } from '@/components/organisms/portal-v2/exchange/ExchangeAdPreview';
import { ExchangeBlockPreview } from '@/components/organisms/portal-v2/exchange/ExchangeBlockPreview';
import { ExchangePagePreview } from '@/components/organisms/portal-v2/exchange/ExchangePagePreview';
import { ExchangePreviewRail } from '@/components/organisms/portal-v2/exchange/ExchangePreviewRail';
import type { PreviewItem } from '@/lib/portal-v2/preview/types';
import { cn } from '@/lib/cn';

/**
 * Full-screen shopper-view preview.
 *
 * Typed against `PreviewItem`, not `ExchangeListingView` — Experiences drives
 * the same shell over published landing pages. Kept in the exchange folder for
 * now because the sibling stage components have uncommitted work in flight;
 * the tidy-up is a folder move to `portal-v2/preview/`, no logic change.
 */
type ExchangePreviewShellProps = {
  open: boolean;
  listing: PreviewItem | null;
  neighbors: PreviewItem[];
  onClose: () => void;
  onNavigate: (listing: PreviewItem) => void;
  /**
   * Stage for `source: 'live'` items. The canvas editor previews unsaved state,
   * so there is no URL for the shell to iframe — the host renders the stage
   * (see `ExchangeLiveCanvasPreview`) and the shell keeps the chrome.
   */
  renderStage?: (device: Device) => ReactNode;
  /** Device the shell opens with. Defaults to desktop. */
  initialDevice?: Device;
  /**
   * Opens the canvas editor for this item. Optional and Experiences-only —
   * Exchange listings aren't live-canvas editable, so the button only
   * renders when a caller passes this.
   */
  onEdit?: () => void;
};

export const ExchangePreviewShell = ({
  open,
  listing,
  neighbors,
  onClose,
  onNavigate,
  renderStage,
  initialDevice = 'desktop',
  onEdit,
}: ExchangePreviewShellProps) => {
  const t = useTranslations('portalV2.preview');
  const [device, setDevice] = useState<Device>(initialDevice);
  const [activeBlockId, setActiveBlockId] = useState<string | null>(null);
  const [scrollToBlockId, setScrollToBlockId] = useState<string | null>(null);
  const [scrollNonce, setScrollNonce] = useState(0);
  /** '' = home; a rail click on a sub-page block navigates the iframe there. */
  const [activePagePath, setActivePagePath] = useState('');

  /** Open in `initialDevice` — do not persist device across preview sessions. */
  useEffect(() => {
    setDevice(initialDevice);
    setActiveBlockId(null);
    setScrollToBlockId(null);
    setScrollNonce(0);
    setActivePagePath('');
  }, [open, listing?.id, initialDevice]);

  const handleSelectBlock = useCallback((blockId: string, pagePath: string) => {
    setActiveBlockId(blockId);
    setScrollToBlockId(blockId);
    setScrollNonce(n => n + 1);
    setActivePagePath(pagePath);
  }, []);

  const handleActiveFromScroll = useCallback((blockId: string) => {
    setActiveBlockId(blockId);
  }, []);

  const kindLabel = listing?.kindLabel ?? '';

  const index = useMemo(
    () => (listing ? neighbors.findIndex(item => item.id === listing.id) : -1),
    [neighbors, listing]
  );

  const canNavigate = neighbors.length > 1;

  const handleStep = useCallback(
    (dir: 'prev' | 'next') => {
      if (!neighbors.length) return;
      const cur = index < 0 ? 0 : index;
      const next =
        (((cur + (dir === 'next' ? 1 : -1)) % neighbors.length) +
          neighbors.length) %
        neighbors.length;
      onNavigate(neighbors[next]!);
    },
    [neighbors, index, onNavigate]
  );

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handleStep('prev');
        return;
      }
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleStep('next');
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, onClose, handleStep]);

  const handleDeviceChange = useCallback((next: Device) => {
    setDevice(current => (current === next ? current : next));
  }, []);

  const stageKey = listing ? `${listing.id}:${device}` : null;

  const stageError = listing
    ? listing.source === 'page' && !listing.slug
      ? t('previewMissingSlug')
      : listing.source === 'block' && !listing.blockId
        ? t('previewMissingBlockId')
        : listing.source === 'live' && !renderStage
          ? t('previewUnavailable')
          : listing.source === 'ad' && !listing.adFormatId
            ? t('previewUnavailable')
            : null
    : null;

  return (
    <div
      className={cn(
        'fixed inset-0 z-[var(--pv2-z-preview)] grid grid-rows-[64px_1fr] bg-[var(--pv2-canvas)]',
        !open && 'pointer-events-none invisible'
      )}
      role='dialog'
      aria-modal={open}
      aria-hidden={!open}
      aria-label={listing ? t('preview', { name: listing.name }) : undefined}
    >
      <header className='flex items-center gap-3 border-b border-[var(--pv2-hair)] bg-[var(--pv2-paper)] px-4 md:px-5'>
        <div className='min-w-0 flex-1'>
          <div className='truncate font-[family-name:var(--pv2-disp)] text-[15px] font-bold tracking-[-0.02em] text-[var(--pv2-ink)]'>
            {listing?.name ?? ''}
          </div>
          <div className='truncate text-[12px] text-[var(--pv2-mut)]'>
            {listing ? t('previewSub', { kind: kindLabel }) : null}
          </div>
        </div>

        {canNavigate ? (
          <div className='flex shrink-0 items-center gap-1'>
            <button
              type='button'
              aria-label={t('previewPrev')}
              tabIndex={0}
              onClick={() => handleStep('prev')}
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleStep('prev');
                }
              }}
              className={cn(
                'inline-flex items-center gap-1 rounded-[var(--pv2-r)] px-2.5 py-1.5',
                'text-[12.5px] font-semibold text-[var(--pv2-mut)]',
                'hover:bg-[var(--pv2-canvas)] hover:text-[var(--pv2-ink)]',
                'focus-visible:ring-2 focus-visible:ring-[var(--pv2-electric)] focus-visible:ring-offset-2'
              )}
            >
              <ChevronLeft className='size-3.5' strokeWidth={2.2} aria-hidden />
              {t('previewPrev')}
            </button>
            <button
              type='button'
              aria-label={t('previewNext')}
              tabIndex={0}
              onClick={() => handleStep('next')}
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleStep('next');
                }
              }}
              className={cn(
                'inline-flex items-center gap-1 rounded-[var(--pv2-r)] px-2.5 py-1.5',
                'text-[12.5px] font-semibold text-[var(--pv2-mut)]',
                'hover:bg-[var(--pv2-canvas)] hover:text-[var(--pv2-ink)]',
                'focus-visible:ring-2 focus-visible:ring-[var(--pv2-electric)] focus-visible:ring-offset-2'
              )}
            >
              {t('previewNext')}
              <ChevronRight
                className='size-3.5'
                strokeWidth={2.2}
                aria-hidden
              />
            </button>
          </div>
        ) : null}

        <div
          className='flex shrink-0 rounded-[var(--pv2-r)] border border-[var(--pv2-hair)] p-0.5'
          role='group'
          aria-label={t('previewDeviceAria')}
        >
          <button
            type='button'
            aria-label={t('previewDeviceMobile')}
            aria-pressed={device === 'mobile'}
            tabIndex={0}
            onClick={() => handleDeviceChange('mobile')}
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleDeviceChange('mobile');
              }
            }}
            className={cn(
              'grid size-8 place-items-center rounded-[calc(var(--pv2-r)-2px)]',
              'focus-visible:ring-2 focus-visible:ring-[var(--pv2-electric)] focus-visible:ring-offset-2',
              device === 'mobile'
                ? 'bg-[var(--pv2-electric-soft)] text-[var(--pv2-electric)]'
                : 'text-[var(--pv2-mut)] hover:text-[var(--pv2-ink)]'
            )}
          >
            <Smartphone className='size-3.5' strokeWidth={2} aria-hidden />
          </button>
          <button
            type='button'
            aria-label={t('previewDeviceDesktop')}
            aria-pressed={device === 'desktop'}
            tabIndex={0}
            onClick={() => handleDeviceChange('desktop')}
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleDeviceChange('desktop');
              }
            }}
            className={cn(
              'grid size-8 place-items-center rounded-[calc(var(--pv2-r)-2px)]',
              'focus-visible:ring-2 focus-visible:ring-[var(--pv2-electric)] focus-visible:ring-offset-2',
              device === 'desktop'
                ? 'bg-[var(--pv2-electric-soft)] text-[var(--pv2-electric)]'
                : 'text-[var(--pv2-mut)] hover:text-[var(--pv2-ink)]'
            )}
          >
            <Monitor className='size-3.5' strokeWidth={2} aria-hidden />
          </button>
        </div>

        {onEdit ? (
          <button
            type='button'
            aria-label={t('previewEdit')}
            title={t('previewEdit')}
            tabIndex={0}
            onClick={onEdit}
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onEdit();
              }
            }}
            className={cn(
              'grid size-8 shrink-0 place-items-center rounded-[var(--pv2-r)]',
              'text-[var(--pv2-mut)] hover:bg-[var(--pv2-canvas)] hover:text-[var(--pv2-ink)]',
              'focus-visible:ring-2 focus-visible:ring-[var(--pv2-electric)] focus-visible:ring-offset-2'
            )}
          >
            <PenLine className='size-3.5' strokeWidth={2.2} aria-hidden />
          </button>
        ) : null}

        <button
          type='button'
          aria-label={t('previewClose')}
          tabIndex={0}
          onClick={onClose}
          onKeyDown={e => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onClose();
            }
          }}
          className={cn(
            'grid size-8 shrink-0 place-items-center rounded-[var(--pv2-r)]',
            'text-[var(--pv2-mut)] hover:bg-[var(--pv2-canvas)] hover:text-[var(--pv2-ink)]',
            'focus-visible:ring-2 focus-visible:ring-[var(--pv2-electric)] focus-visible:ring-offset-2'
          )}
        >
          <X className='size-4' strokeWidth={2} aria-hidden />
        </button>
      </header>

      <div
        className={cn(
          'h-full min-h-0 overflow-hidden',
          listing?.source === 'page' &&
            !stageError &&
            'grid min-[861px]:grid-cols-[260px_1fr]'
        )}
      >
        {!listing ? null : stageError ? (
          <div className='flex h-full items-center justify-center px-6 text-center text-[13px] text-[var(--pv2-mut)]'>
            {stageError}
          </div>
        ) : listing.source === 'page' && listing.slug ? (
          <>
            <ExchangePreviewRail
              slug={listing.slug}
              evidence={listing.evidence}
              activeBlockId={activeBlockId}
              onSelectBlock={handleSelectBlock}
            />
            <div className='h-full min-h-0 min-w-0 overflow-hidden'>
              <ExchangePagePreview
                key={stageKey}
                slug={listing.slug}
                pagePath={activePagePath}
                name={listing.name}
                device={device}
                scrollToBlockId={scrollToBlockId}
                scrollNonce={scrollNonce}
                onActiveBlockChange={handleActiveFromScroll}
              />
            </div>
          </>
        ) : listing.source === 'block' && listing.blockId ? (
          <div className='h-full min-h-0 min-w-0 overflow-hidden'>
            <ExchangeBlockPreview
              key={stageKey}
              blockId={listing.blockId}
              device={device}
            />
          </div>
        ) : listing.source === 'ad' && listing.adFormatId ? (
          <div className='h-full min-h-0 min-w-0 overflow-hidden'>
            <ExchangeAdPreview
              key={stageKey}
              adFormatId={listing.adFormatId}
              device={device}
            />
          </div>
        ) : listing.source === 'live' && renderStage ? (
          <div className='h-full min-h-0 min-w-0 overflow-hidden'>
            {renderStage(device)}
          </div>
        ) : (
          <div className='flex h-full items-center justify-center px-6 text-center text-[13px] text-[var(--pv2-mut)]'>
            {t('previewUnavailable')}
          </div>
        )}
      </div>
    </div>
  );
};
