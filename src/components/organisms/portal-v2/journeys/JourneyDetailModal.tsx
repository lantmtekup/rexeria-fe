'use client';

import { Copy, GitFork, PenLine } from 'lucide-react';
import { useTranslations } from 'next-intl';

import {
  fetchJourneyReadiness,
  fetchJourneyStats,
} from '@/services/portal-v2/journeyMeasured';

import type { JourneySegment } from '@/lib/portal-v2/journeys/constants';
import type { PersonaOption } from '@/services/portal-v2/journeyAudience';
import { useEffect, useMemo, useState } from 'react';

import { Button } from '@/components/molecules/portal-v2/Button';
import { Modal } from '@/components/molecules/portal-v2/Modal';
import { Tabs } from '@/components/molecules/portal-v2/Tabs';
import { JourneyCanvasPane } from '@/components/organisms/portal-v2/journeys/JourneyCanvasPane';
import { JourneyOverviewPane } from '@/components/organisms/portal-v2/journeys/JourneyOverviewPane';
import { JourneyReadinessPane } from '@/components/organisms/portal-v2/journeys/JourneyReadinessPane';
import { JourneySimulatePane } from '@/components/organisms/portal-v2/journeys/JourneySimulatePane';
import { formatCount, formatLift } from '@/lib/portal-v2/experiences/helpers';
import { JOURNEY_DETAIL_TABS } from '@/lib/portal-v2/journeys/constants';
import {
  copiesOfJourney,
  findJourney,
  journeyHome,
  journeyReadiness,
  journeyStats,
} from '@/lib/portal-v2/journeys/helpers';
import type {
  Journey,
  JourneyDetailTab,
  JourneyReadiness,
  JourneyStats,
} from '@/lib/portal-v2/journeys/types';
import { cn } from '@/lib/cn';

type JourneyDetailModalProps = {
  personas?: PersonaOption[];
  segments?: JourneySegment[];
  journey: Journey;
  journeys: Journey[];
  onClose: () => void;
  onEdit: (journey: Journey) => void;
  onFork: (journey: Journey) => void;
  /** Bấm "Dùng cho chiến dịch" khi hành trình còn thiếu điều kiện. */
  onNotReady: (missing: string[]) => void;
  onDuplicate: (journey: Journey) => void;
  onOpenJourney: (id: string) => void;
};

export const JourneyDetailModal = ({
  personas = [],
  segments = [],
  journey,
  journeys,
  onClose,
  onEdit,
  onFork,
  onNotReady,
  onDuplicate,
  onOpenJourney,
}: JourneyDetailModalProps) => {
  const t = useTranslations('portalV2.journeys');
  /* A fresh journey gets a fresh window — `key` on the modal resets this. */
  const [tab, setTab] = useState<JourneyDetailTab>('over');

  const local = useMemo(() => journeyReadiness(journey), [journey]);

  /**
   * Điểm sẵn sàng do SERVER chấm — `GET /journeys/{id}/readiness`.
   *
   * Bản tính ở FE vẫn giữ làm dự phòng cho lúc chưa nạp xong, nhưng nó chấm ở
   * tầng khác nên hai bên từng lệch hẳn: màn hình 62% trong khi server nói 33%.
   * Cái quyết định `Use` có chạy hay không là bản của server.
   */
  const [remote, setRemote] = useState<JourneyReadiness | null>(null);
  const [measured, setMeasured] = useState<{
    sessions: number;
    completed: number;
    rate: number;
  } | null>(null);

  useEffect(() => {
    let alive = true;
    setRemote(null);
    setMeasured(null);
    void Promise.allSettled([
      fetchJourneyReadiness(journey.id),
      fetchJourneyStats(journey.id),
    ]).then(([r, s]) => {
      if (!alive) return;
      if (r.status === 'fulfilled') setRemote(r.value);
      if (s.status === 'fulfilled') setMeasured(s.value);
    });
    return () => {
      alive = false;
    };
  }, [journey.id]);

  const readiness = remote ?? local;
  /**
   * Dải số ở đầu modal.
   *
   * `journeyStats` gộp từ `node.stats`, thứ mapper v2 KHÔNG điền — nên nó luôn
   * null và dải số luôn nói "chưa chạy". Đúng khi brand chưa có traffic, nhưng
   * sẽ vẫn nói thế khi đã có. `GET /journeys/{id}/stats` mới là nguồn thật;
   * bản gộp cục bộ chỉ còn là dự phòng.
   */
  const localStats = useMemo(
    () => journeyStats(journeys, journey),
    [journeys, journey]
  );
  const stats: JourneyStats | null = measured
    ? { sessions: measured.sessions, lift: localStats?.lift ?? 0 }
    : localStats;
  /** Server đo được phiên nhưng KHÔNG trả lift — đừng vẽ một số 0 thay nó. */
  const hasLift = localStats !== null;
  const copies = useMemo(
    () => copiesOfJourney(journeys, journey),
    [journeys, journey]
  );
  const origin = findJourney(journeys, journey.origin);

  const tabItems = useMemo(
    () =>
      JOURNEY_DETAIL_TABS.map(item => ({
        id: item.id,
        label: t(item.labelKey),
        count: item.id === 'ready' ? `${readiness.score}%` : undefined,
      })),
    [t, readiness.score]
  );

  const subtitle = `${
    journey.template
      ? t('subBlueprint')
      : t('subCopy', { home: journeyHome(journey) })
  } · ${journey.tagline}`;

  return (
    <Modal
      open
      wide
      onClose={onClose}
      title={journey.name}
      subtitle={subtitle}
      footer={
        journey.template ? (
          <>
            {/*
              Lý do phải HIỆN THÀNH CHỮ. Một nút xám không kèm giải thích đọc
              như hỏng hóc — người dùng còn tưởng hành trình đã bị gắn vào
              chiến dịch nào đó rồi. `title` chỉ hiện khi rê chuột, và trên
              cảm ứng thì không bao giờ.
            */}
            <span
              className={
                readiness.missing.length > 0
                  ? 'max-w-[46ch] text-[11.5px] leading-relaxed text-[var(--pv2-warning)]'
                  : 'text-[11.5px] text-[var(--pv2-faint)]'
              }
            >
              {readiness.missing.length > 0
                ? t('useBlockedNote', {
                    count: readiness.missing.length,
                  })
                : copies.length
                  ? t('footBlueprintCopies', { count: copies.length })
                  : t('footBlueprintNoCopies')}
            </span>
            <span className='flex-1' />
            <Button
              variant='ghost'
              size='sm'
              onClick={() => onDuplicate(journey)}
            >
              <Copy className='size-3.5' strokeWidth={2.2} aria-hidden />
              {t('duplicate')}
            </Button>
            <Button variant='ghost' size='sm' onClick={() => onEdit(journey)}>
              <PenLine className='size-3.5' strokeWidth={2.2} aria-hidden />
              {t('editCanvas')}
            </Button>
            {/*
              LUÔN bấm được. Một nút xám không giải thích được vì sao nó xám,
              và người dùng đọc nó thành "hỏng" hoặc "đã gắn rồi".
              Bấm khi chưa đủ điều kiện thì nói ngay thứ còn thiếu, thay vì mở
              hộp chọn chiến dịch rồi để `POST /journeys/{id}/use` từ chối —
              lúc đó họ đang ở màn chọn chiến dịch, cách xa chỗ sửa được.
            */}
            <Button
              size='sm'
              onClick={() =>
                readiness.missing.length > 0
                  ? onNotReady(readiness.missing)
                  : onFork(journey)
              }
            >
              <GitFork className='size-3.5' strokeWidth={2.2} aria-hidden />
              {t('useInCampaign')}
            </Button>
          </>
        ) : (
          <>
            <span className='text-[11.5px] text-[var(--pv2-faint)]'>
              {origin
                ? t('footCopyFrom', { name: origin.name })
                : t('footCopyFromLibrary')}
            </span>
            <span className='flex-1' />
            <Button variant='ghost' size='sm' onClick={onClose}>
              {t('close')}
            </Button>
            {origin ? (
              <Button
                variant='ghost'
                size='sm'
                onClick={() => onOpenJourney(origin.id)}
              >
                {t('openBlueprint')}
              </Button>
            ) : null}
            <Button size='sm' onClick={() => onEdit(journey)}>
              <PenLine className='size-3.5' strokeWidth={2.2} aria-hidden />
              {t('editCanvas')}
            </Button>
          </>
        )
      }
    >
      {/* The verdict at the door, above every tab. */}
      <div className='mb-4 flex flex-wrap items-center gap-x-6 gap-y-3 rounded-[var(--pv2-r)] border border-[var(--pv2-hair)] bg-[var(--pv2-canvas)] px-4 py-3'>
        {stats ? (
          <div className='flex min-w-0 flex-col'>
            <span className='text-[10.5px] font-semibold tracking-[0.03em] text-[var(--pv2-faint)] uppercase'>
              {t('stripMeasured')}
            </span>
            <span className='mt-0.5 flex items-baseline gap-2'>
              {hasLift ? (
                <span
                  className={cn(
                    'font-[family-name:var(--pv2-disp)] text-[17px] font-bold tabular-nums',
                    stats.lift >= 0 ? 'text-[#0e9d6e]' : 'text-[#9a2436]'
                  )}
                >
                  {formatLift(stats.lift)}
                </span>
              ) : null}
              <span className='text-[11.5px] text-[var(--pv2-mut)] tabular-nums'>
                {t('sessionsAssisted', { count: formatCount(stats.sessions) })}
              </span>
            </span>
          </div>
        ) : (
          <p className='max-w-[58ch] text-[12.5px] leading-relaxed text-[var(--pv2-mut)]'>
            {t('stripNoHistory')}
          </p>
        )}

        <span
          className='ml-auto inline-flex rounded-full px-2.5 py-1 text-[9.5px] font-extrabold tracking-[0.05em] uppercase'
          style={{
            color: journey.template ? 'var(--pv2-violet)' : '#0e9d6e',
            background: journey.template
              ? 'color-mix(in srgb, var(--pv2-violet) 12%, transparent)'
              : 'color-mix(in srgb, var(--pv2-success) 14%, transparent)',
          }}
        >
          {journey.template ? t('badgeBlueprint') : t('badgeCopy')}
        </span>
      </div>

      <Tabs
        items={tabItems}
        value={tab}
        onChange={id => setTab(id as JourneyDetailTab)}
        aria-label={t('detailTabsAria')}
      />

      <div className='pt-4' role='tabpanel'>
        {tab === 'over' ? (
          <JourneyOverviewPane journey={journey} personas={personas} />
        ) : null}
        {tab === 'canvas' ? <JourneyCanvasPane journey={journey} /> : null}
        {tab === 'walk' ? (
          <JourneySimulatePane
            journey={journey}
            journeys={journeys}
            segments={segments}
          />
        ) : null}
        {tab === 'ready' ? <JourneyReadinessPane journey={journey} /> : null}
      </div>
    </Modal>
  );
};
