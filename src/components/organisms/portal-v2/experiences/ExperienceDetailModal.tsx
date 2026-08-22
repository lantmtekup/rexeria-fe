'use client';

import {
  BadgeCheck,
  Eye,
  ImageIcon,
  PenLine,
  PlusCircle,
  X,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useMemo, useState } from 'react';

import { fetchExperienceLayers } from '@/services/portal-v2/experienceDetail';
import {
  fetchExperienceCoverage,
  fetchExperienceStats,
} from '@/services/portal-v2/experienceMeasured';
import { Button } from '@/components/molecules/portal-v2/Button';
import { Input } from '@/components/atoms/input';
import { Modal } from '@/components/molecules/portal-v2/Modal';
import { Tabs } from '@/components/molecules/portal-v2/Tabs';
import { ImagePicker } from '@/components/modules/block-editor-v2/ImagePicker';
import { ExperienceCover } from '@/components/organisms/portal-v2/experiences/ExperienceCover';
import { ExperienceDetailsPane } from '@/components/organisms/portal-v2/experiences/ExperienceDetailsPane';
import { ExperiencePerfPane } from '@/components/organisms/portal-v2/experiences/ExperiencePerfPane';
import { ExperienceSignalsPane } from '@/components/organisms/portal-v2/experiences/ExperienceSignalsPane';
import { EXPERIENCE_DETAIL_TABS } from '@/lib/portal-v2/experiences/constants';
import {
  canEditCanvas,
  canPreview,
  formatCount,
  formatLift,
} from '@/lib/portal-v2/experiences/helpers';
import { EVIDENCE_TIER_STYLE } from '@/lib/portal-v2/experiences/roleStyles';
import type {
  ExperienceDetailTab,
  ExperienceLayer,
  ExperienceStats,
  ExperienceView,
  SignalCoverage,
} from '@/lib/portal-v2/experiences/types';
import { cn } from '@/lib/cn';

type ExperienceDetailModalProps = {
  experience: ExperienceView;
  onClose: () => void;
  onPreview: (experience: ExperienceView) => void;
  onEdit: (experience: ExperienceView) => void;
  /** Mở hộp chọn chiến dịch + hạng mục để fork — xem `UseExperienceModal`. */
  onUse: (experience: ExperienceView) => void;
  /**
   * Bật/tắt dấu Proven trên chính trang này.
   *
   * Đủ để vào hub Automation ngay — hub giờ đọc cả copy Proven trực tiếp,
   * không còn bắt buộc "Add to library" (Promote → trải nghiệm gốc → Proven)
   * như trước nữa.
   */
  onToggleProven: (experience: ExperienceView) => void;
  /** Đang ghi xuống server — khoá nút để không bấm kép. */
  provenPending?: boolean;
  /**
   * Lý do lần bấm Proven vừa rồi trượt.
   *
   * Phải hiện TRONG modal: nút nằm ở đây, mà thông báo của workspace lại vẽ
   * dưới lưới thẻ — tức là sau lưng lớp phủ, không ai thấy.
   */
  provenError?: string | null;
  /** Lưu tên + cover mới xuống server — `thumbnailUrl` rỗng xoá về ảnh kế thừa. */
  onUpdateDetails: (patch: { name: string; thumbnailUrl: string }) => void;
  /** Đang ghi xuống server — khoá form để không bấm Lưu kép. */
  detailsPending?: boolean;
  /** Lý do lần lưu tên/cover vừa rồi trượt. */
  detailsError?: string | null;
};

const CATEGORY_LABEL_KEY = {
  blocks: 'catBlocks',
  collection: 'catCollection',
} as const;

const VEHICLE_LABEL_KEY = {
  curated: 'vehicleCurated',
  ads: 'vehicleAds',
  showcase: 'vehicleShowcase',
  microsite: 'vehicleMicrosite',
} as const;

const OBJECTIVE_LABEL_KEY = {
  insight: 'objInsight',
  lead: 'objLead',
  cta: 'objCta',
  convert: 'objConvert',
} as const;

const TIER_LABEL_KEY = {
  high: 'evHigh',
  directional: 'evDirectional',
  early: 'evEarly',
  unmeasured: 'evUnmeasured',
} as const;

const TIER_TITLE_KEY = {
  high: 'evHighTitle',
  directional: 'evDirectionalTitle',
  early: 'evEarlyTitle',
  unmeasured: 'evUnmeasuredTitle',
} as const;

/** One labeled read: a lift and the sessions behind it. */
const StripRead = ({
  label,
  stats,
}: {
  label: string;
  stats: ExperienceStats;
}) => {
  const t = useTranslations('portalV2.experiences');
  const up = stats.lift >= 0;

  return (
    <div className='flex min-w-0 flex-col'>
      <span className='text-[10.5px] font-semibold tracking-[0.03em] text-[var(--pv2-faint)] uppercase'>
        {label}
      </span>
      <span className='mt-0.5 flex items-baseline gap-2'>
        <span
          className={cn(
            'font-[family-name:var(--pv2-disp)] text-[17px] font-bold tabular-nums',
            up ? 'text-[#0e9d6e]' : 'text-[#9a2436]'
          )}
        >
          {formatLift(stats.lift)}
        </span>
        <span className='text-[11.5px] text-[var(--pv2-mut)] tabular-nums'>
          {t('sessionsLabel', { count: formatCount(stats.sessions) })}
        </span>
      </span>
    </div>
  );
};

export const ExperienceDetailModal = ({
  experience,
  onClose,
  onPreview,
  onEdit,
  onUse,
  onToggleProven,
  provenPending = false,
  provenError = null,
  onUpdateDetails,
  detailsPending = false,
  detailsError = null,
}: ExperienceDetailModalProps) => {
  const t = useTranslations('portalV2.experiences');
  const [tab, setTab] = useState<ExperienceDetailTab>('details');

  /** Bật/tắt form đổi tên + cover — đóng lại (không nạp lại) sau mỗi lần mở
   *  modal cho một experience khác, nên khoá theo `experience.id`. */
  const [editingDetails, setEditingDetails] = useState(false);
  const [nameDraft, setNameDraft] = useState(experience.name);
  const [thumbDraft, setThumbDraft] = useState(experience.thumbnailUrl ?? '');

  useEffect(() => {
    setEditingDetails(false);
    setNameDraft(experience.name);
    setThumbDraft(experience.thumbnailUrl ?? '');
  }, [experience.id, experience.name, experience.thumbnailUrl]);

  const handleSaveDetails = () => {
    const trimmed = nameDraft.trim();
    if (!trimmed) return;
    onUpdateDetails({ name: trimmed, thumbnailUrl: thumbDraft.trim() });
    setEditingDetails(false);
  };

  /**
   * Block + số đo, nạp KHI MỞ chứ không ở danh sách.
   *
   * `GET /experiences` không kèm block (chỉ `funnel_coverage`, và 99/100 bản
   * ghi trả null), coverage cố ý bỏ qua với loại không đo được, stats thì có
   * endpoint riêng — 109 thẻ mà mỗi thẻ ba lời gọi là hơn 300 request cho một
   * lần mở màn. Mở chi tiết mới hỏi là đúng chỗ.
   *
   * `layers: null` = CHƯA CÓ (đang nạp hoặc hỏng), khác `[]` = trang không có
   * block nào. Hai pane nói hai câu khác nhau cho hai trường hợp này.
   */
  const [loaded, setLoaded] = useState<{
    coverage: SignalCoverage | null;
    stats: ExperienceStats | null;
    layers: ExperienceLayer[] | null;
  }>({ coverage: null, stats: experience.stats, layers: null });

  useEffect(() => {
    let alive = true;
    setLoaded({ coverage: null, stats: experience.stats, layers: null });

    void Promise.allSettled([
      fetchExperienceCoverage(experience.id),
      fetchExperienceStats(experience.id),
      fetchExperienceLayers(experience.id),
    ]).then(([cov, st, ly]) => {
      if (!alive) return;
      setLoaded(prev => ({
        coverage: cov.status === 'fulfilled' ? cov.value : prev.coverage,
        stats: st.status === 'fulfilled' ? st.value : prev.stats,
        layers: ly.status === 'fulfilled' ? ly.value : prev.layers,
      }));
    });

    return () => {
      alive = false;
    };
  }, [experience.id, experience.stats]);

  /**
   * Badge lấy từ CHÍNH mảng mà pane vẽ.
   *
   * Bản trước lấy từ `/coverage` còn pane đọc `layer.trackedComponents` (luôn
   * rỗng), nên tab ghi "Tín hiệu 9" rồi mở ra không có dòng nào. Prototype
   * dùng đúng một nguồn (`trackedOf(e).length`) nên không thể vênh.
   */
  const trackedCount = useMemo(
    () =>
      loaded.layers?.reduce(
        (n, l) => n + l.components.filter(c => c.tracked).length,
        0
      ) ?? null,
    [loaded.layers]
  );

  const tabItems = useMemo(
    () =>
      EXPERIENCE_DETAIL_TABS.map(item => ({
        id: item.id,
        label: t(item.labelKey),
        // Chưa nạp xong ⇒ không có badge. Số 0 lúc đang tải đọc như một kết
        // luận đã có.
        count:
          item.id === 'signals' && trackedCount !== null
            ? trackedCount
            : undefined,
      })),
    [t, trackedCount]
  );

  const stats = loaded.stats;
  const { evidence } = experience;
  const tierStyle = EVIDENCE_TIER_STYLE[evidence.tier];
  const previewable = canPreview(experience);
  const editable = canEditCanvas(experience);

  const subtitleParts = [
    t(CATEGORY_LABEL_KEY[experience.category]),
    t(VEHICLE_LABEL_KEY[experience.vehicle]),
    t(OBJECTIVE_LABEL_KEY[experience.objective]),
  ].join(' · ');

  /* Never "0 post-click sessions" — a record with no rows has no number. */
  const subtitle = stats
    ? t('detailSub', {
        meta: subtitleParts,
        sessions: formatCount(stats.sessions),
      })
    : t('detailSubUnrun', { meta: subtitleParts });

  return (
    <Modal
      open
      wide
      onClose={onClose}
      title={experience.name}
      subtitle={subtitle}
      footer={
        <>
          <Button variant='ghost' size='sm' onClick={onClose}>
            {t('close')}
          </Button>
          <Button
            variant={experience.proven ? 'toggle' : 'ghost'}
            size='sm'
            disabled={provenPending}
            aria-pressed={experience.proven}
            title={t('provenHint')}
            className={cn(
              experience.proven &&
                'border-[var(--pv2-electric)] bg-[var(--pv2-electric-soft)] text-[var(--pv2-electric)]'
            )}
            onClick={() => onToggleProven(experience)}
          >
            <BadgeCheck className='size-3.5' strokeWidth={2.2} aria-hidden />
            {experience.proven ? t('provenOn') : t('provenOff')}
          </Button>
          <span className='flex-1' />
          <Button
            variant='ghost'
            size='sm'
            disabled={!previewable}
            title={previewable ? undefined : t('previewNoSlug')}
            onClick={() => onPreview(experience)}
          >
            <Eye className='size-3.5' strokeWidth={2.2} aria-hidden />
            {t('previewLabel')}
          </Button>
          <Button
            variant='ghost'
            size='sm'
            disabled={!editable}
            title={editable ? undefined : t('editExternalHint')}
            onClick={() => onEdit(experience)}
          >
            <PenLine className='size-3.5' strokeWidth={2.2} aria-hidden />
            {t('editExperience')}
          </Button>
          {/* Nút CHÍNH, theo prototype (`xuse` là `btn-primary`): thứ người ta
              mở thư viện ra để làm là mang một trải nghiệm vào chiến dịch.
              Luôn bật — nếu BE từ chối (vd bản đã là copy), lỗi hiện ngay
              trong UseExperienceModal (xem handleConfirm ở đó), không âm
              thầm nuốt. */}
          <Button size='sm' onClick={() => onUse(experience)}>
            <PlusCircle className='size-3.5' strokeWidth={2.2} aria-hidden />
            {t('useLabel')}
          </Button>
        </>
      }
    >
      {provenError ? (
        <p
          role='alert'
          className='mb-3 rounded-[var(--pv2-r)] border border-[var(--pv2-hair)] bg-[var(--pv2-canvas)] px-3.5 py-2.5 text-[12.5px] leading-relaxed text-[var(--pv2-warning)]'
        >
          {provenError}
        </p>
      ) : null}

      {detailsError ? (
        <p
          role='alert'
          className='mb-3 rounded-[var(--pv2-r)] border border-[var(--pv2-hair)] bg-[var(--pv2-canvas)] px-3.5 py-2.5 text-[12.5px] leading-relaxed text-[var(--pv2-warning)]'
        >
          {detailsError}
        </p>
      ) : null}

      {/* Tên + cover — chỉnh tại chỗ, không phải một modal riêng: cả hai đổi
          cùng lúc trong một lần Lưu (`PATCH /v1/pages/{id}`). */}
      <div className='mb-4 rounded-[var(--pv2-r)] border border-[var(--pv2-hair)] bg-[var(--pv2-paper)] p-3.5'>
        {editingDetails ? (
          <div className='flex flex-col gap-3 sm:flex-row'>
            <ImagePicker
              value={thumbDraft}
              onChange={setThumbDraft}
              className='sm:w-[180px] sm:shrink-0'
            />
            <div className='flex min-w-0 flex-1 flex-col gap-2'>
              <label
                htmlFor='experience-name-draft'
                className='text-[11px] font-semibold tracking-[0.03em] text-[var(--pv2-faint)] uppercase'
              >
                {t('nameFieldLabel')}
              </label>
              <Input
                id='experience-name-draft'
                value={nameDraft}
                onChange={e => setNameDraft(e.target.value)}
                maxLength={200}
                autoFocus
              />
              <div className='mt-auto flex items-center gap-2 pt-1'>
                <Button
                  size='sm'
                  disabled={detailsPending || !nameDraft.trim()}
                  onClick={handleSaveDetails}
                >
                  {detailsPending ? t('saving') : t('saveDetails')}
                </Button>
                <Button
                  variant='ghost'
                  size='sm'
                  disabled={detailsPending}
                  onClick={() => {
                    setEditingDetails(false);
                    setNameDraft(experience.name);
                    setThumbDraft(experience.thumbnailUrl ?? '');
                  }}
                >
                  <X className='size-3.5' strokeWidth={2.2} aria-hidden />
                  {t('cancel')}
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className='flex items-center gap-3'>
            <ExperienceCover
              experience={experience}
              height={56}
              className='w-[88px] shrink-0 rounded-[8px] border border-[var(--pv2-hair)]'
            />
            <div className='min-w-0 flex-1'>
              <p className='truncate text-[13.5px] font-semibold text-[var(--pv2-ink)]'>
                {experience.name}
              </p>
              <p className='text-[11.5px] text-[var(--pv2-faint)]'>
                {t('editDetailsHint')}
              </p>
            </div>
            <Button
              variant='ghost'
              size='sm'
              onClick={() => setEditingDetails(true)}
            >
              <ImageIcon className='size-3.5' strokeWidth={2.2} aria-hidden />
              {t('editDetails')}
            </Button>
          </div>
        )}
      </div>

      {/* THE IDENTITY STRIP — the verdict at the door, above every tab. */}
      <div className='mb-4 flex flex-wrap items-center gap-x-6 gap-y-3 rounded-[var(--pv2-r)] border border-[var(--pv2-hair)] bg-[var(--pv2-canvas)] px-4 py-3'>
        {stats ? (
          <StripRead label={t('stripMeasured')} stats={stats} />
        ) : (
          <p className='max-w-[58ch] text-[12.5px] leading-relaxed text-[var(--pv2-mut)]'>
            {t('stripNoHistory')}
          </p>
        )}

        <span
          title={t(TIER_TITLE_KEY[evidence.tier])}
          className='ml-auto inline-flex cursor-help rounded-full px-2.5 py-1 text-[9.5px] font-extrabold tracking-[0.05em] uppercase'
          style={{ color: tierStyle.fg, background: tierStyle.bg }}
        >
          {t(TIER_LABEL_KEY[evidence.tier])}
        </span>
      </div>

      <Tabs
        items={tabItems}
        value={tab}
        onChange={id => setTab(id as ExperienceDetailTab)}
        aria-label={t('detailTabsAria')}
      />

      {/* Mỗi pane mở đầu bằng CÂU HỎI nó trả lời — prototype `.ptab-q`. Phân
          công giữa ba tab nằm trên màn hình, không nằm trong buổi hướng dẫn. */}
      <p className='mt-2.5 text-[11.5px] leading-relaxed text-[var(--pv2-faint)] italic'>
        {t(
          EXPERIENCE_DETAIL_TABS.find(item => item.id === tab)?.questionKey ??
            'tabDetailsQ'
        )}
      </p>

      <div className='pt-3.5' role='tabpanel'>
        {tab === 'details' ? (
          <ExperienceDetailsPane
            experience={experience}
            coverage={loaded.coverage}
            layers={loaded.layers}
          />
        ) : null}
        {tab === 'signals' ? (
          <ExperienceSignalsPane
            coverage={loaded.coverage}
            layers={loaded.layers}
          />
        ) : null}
        {tab === 'perf' ? (
          <ExperiencePerfPane experience={experience} stats={stats} />
        ) : null}
      </div>
    </Modal>
  );
};
