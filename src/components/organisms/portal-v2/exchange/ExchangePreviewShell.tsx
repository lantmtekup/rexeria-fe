'use client';

import {
  ChevronLeft,
  ChevronRight,
  Monitor,
  Smartphone,
  X,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useMemo, useState } from 'react';

import type { Device } from '@/components/modules/block-editor/types';
import { ExchangeBlockPreview } from '@/components/organisms/portal-v2/exchange/ExchangeBlockPreview';
import { ExchangePagePreview } from '@/components/organisms/portal-v2/exchange/ExchangePagePreview';
import { ExchangePreviewRail } from '@/components/organisms/portal-v2/exchange/ExchangePreviewRail';
import type { ExchangeListingView } from '@/lib/portal-v2/exchange/types';
import { cn } from '@/lib/cn';

type ExchangePreviewShellProps = {
  open: boolean;
  listing: ExchangeListingView | null;
  neighbors: ExchangeListingView[];
  onClose: () => void;
  onNavigate: (listing: ExchangeListingView) => void;
};

export const ExchangePreviewShell = ({
  open,
  listing,
  neighbors,
  onClose,
  onNavigate,
}: ExchangePreviewShellProps) => {
  const t = useTranslations('portalV2.exchange');
  const [device, setDevice] = useState<Device>('desktop');
  const [activeBlockId, setActiveBlockId] = useState<string | null>(null);
  const [scrollToBlockId, setScrollToBlockId] = useState<string | null>(null);
  const [scrollNonce, setScrollNonce] = useState(0);

  /** Always open in desktop — do not persist device across preview sessions. */
  useEffect(() => {
    setDevice('desktop');
    setActiveBlockId(null);
    setScrollToBlockId(null);
    setScrollNonce(0);
  }, [open, listing?.id]);

  const handleSelectBlock = useCallback((blockId: string) => {
    setActiveBlockId(blockId);
    setScrollToBlockId(blockId);
    setScrollNonce(n => n + 1);
  }, []);

  const handleActiveFromScroll = useCallback((blockId: string) => {
    setActiveBlockId(blockId);
  }, []);

  const kindLabel = listing
    ? listing.meta.kind === 'block'
      ? t('kindBlock')
      : t('kindPage')
    : '';

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
              listing={listing}
              activeBlockId={activeBlockId}
              onSelectBlock={handleSelectBlock}
            />
            <div className='h-full min-h-0 min-w-0 overflow-hidden'>
              <ExchangePagePreview
                key={stageKey}
                slug={listing.slug}
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
        ) : (
          <div className='flex h-full items-center justify-center px-6 text-center text-[13px] text-[var(--pv2-mut)]'>
            {t('previewUnavailable')}
          </div>
        )}
      </div>
    </div>
  );
};
