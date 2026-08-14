'use client';

import { Check, Plus, Rocket, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/molecules/portal-v2/Button';
import { Modal } from '@/components/molecules/portal-v2/Modal';
import {
  Field,
  TextInput,
  TextSelect,
  TextTextarea,
} from '@/components/molecules/portal-v2/brand-form';
import { StageBar } from '@/components/molecules/portal-v2/campaigns-form';
import { ChannelToggle } from '@/components/organisms/portal-v2/deploy/ChannelChip';
import { cn } from '@/lib/cn';
import {
  ITEM_FLOW,
  ITEM_STATUS,
  SHIP_TRACK_FLOOR,
} from '@/lib/portal-v2/campaigns/constants';
import { syncItemStage } from '@/lib/portal-v2/campaigns/helpers';
import {
  itemShipGate,
  speaksForSubject,
  stageNeedsGate,
} from '@/lib/portal-v2/campaigns/shipGate';
import type {
  CampaignExperience,
  CampaignItem,
  CampaignItemStatus,
  CampaignTeamMember,
} from '@/lib/portal-v2/campaigns/types';
import {
  canDeploySelection,
  findChannel,
} from '@/lib/portal-v2/deploy/helpers';
import type { DeployChannel } from '@/lib/portal-v2/deploy/types';
import {
  deployCampaignItem,
  pauseCampaignItem,
} from '@/services/portal-v2/deployBoard';

type CampaignItemModalProps = {
  item: CampaignItem;
  campaignId: string;
  subjectLabel: string;
  campaignName: string;
  /** Every experience the campaign can see — masters and its own copies. */
  experiences: CampaignExperience[];
  /** Brand members Owner can be assigned to. */
  team: CampaignTeamMember[];
  /** The brand's deploy channels — for the real "go live" action below. */
  channels: DeployChannel[];
  onClose: () => void;
  onSave: (item: CampaignItem) => void;
  onDelete: () => void;
  /**
   * Gắn một trải nghiệm thư viện vào hạng mục này.
   *
   * BẤT ĐỒNG BỘ vì id bản copy do SERVER cấp — bản trước suy id từ
   * `origin × campaign × subject` và dựng bản ghi ngay trong state, thứ đó trỏ
   * vào hư không sau lần tải lại đầu tiên. Trả null khi gắn hỏng.
   */
  onAttachMaster: (masterId: string) => Promise<string | null>;
  /** Gỡ một trải nghiệm khỏi hạng mục — trả false khi server từ chối. */
  onDetachExperience: (experienceId: string) => Promise<boolean>;
  /**
   * `POST .../deploy` / `.../pause` vừa xong — `nextStatus` là sự thật từ
   * server, khác `draft.status` (thứ người dùng có thể đang bấm thử trên các
   * pill mà chưa Save). Modal tự cập nhật `draft` cục bộ; hàm này chỉ để
   * `CampaignDetail` đồng bộ lại `campaign.items`.
   */
  onDeployed: (nextStatus: CampaignItemStatus) => void;
};

/**
 * One subject's work surface: where it is in the flow, who owns it, when it is
 * due, and which experiences are attached.
 *
 * Ready and Live are held behind the ship gate. The gate is shown as a
 * checklist, not an error — the answer to "why can't I ship this" should be on
 * screen before the question is asked.
 */
export const CampaignItemModal = ({
  item,
  campaignId,
  subjectLabel,
  campaignName,
  experiences,
  team,
  channels,
  onClose,
  onSave,
  onDelete,
  onAttachMaster,
  onDetachExperience,
  onDeployed,
}: CampaignItemModalProps) => {
  const t = useTranslations('portalV2.campaigns');
  const td = useTranslations('portalV2.deploy');

  const [draft, setDraft] = useState<CampaignItem>(() => ({
    ...item,
    expIds: [...item.expIds],
  }));
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerQuery, setPickerQuery] = useState('');
  const [selectedChannelIds, setSelectedChannelIds] = useState<string[]>([]);
  const [deploying, setDeploying] = useState(false);
  const [pausing, setPausing] = useState(false);

  /**
   * Real go-live — `POST /campaigns/{id}/items/{itemId}/deploy`, the same
   * endpoint the Deploy screen's Ready tab calls. `item.status` (the
   * PERSISTED status), not `draft.status` — a person can click the "live"
   * pill above without saving, and that must not be read as "already live".
   */
  const handleDeploy = async () => {
    if (!canDeploySelection(selectedChannelIds, channels)) return;
    setDeploying(true);
    try {
      const res = await deployCampaignItem(
        campaignId,
        item.id,
        selectedChannelIds
      );
      const names = selectedChannelIds
        .map(id => findChannel(channels, id)?.name)
        .filter(Boolean)
        .join(', ');
      toast.success(td('deployedToast', { name: subjectLabel }), {
        description: res.public_url
          ? td('deployedToastBody', { channels: names, url: res.public_url })
          : td('deployedToastBodyNoUrl', { channels: names }),
      });
      patch({ status: 'live' });
      onDeployed('live');
    } catch (err) {
      toast.error(td('deployFailedToast'), {
        description: err instanceof Error ? err.message : String(err),
      });
    } finally {
      setDeploying(false);
    }
  };

  const handlePause = async () => {
    setPausing(true);
    try {
      await pauseCampaignItem(campaignId, item.id);
      toast(td('pausedToast', { name: subjectLabel }), {
        description: td('pausedToastBody'),
      });
      patch({ status: 'ready' });
      onDeployed('ready');
    } catch (err) {
      toast.error(td('pauseFailedToast'), {
        description: err instanceof Error ? err.message : String(err),
      });
    } finally {
      setPausing(false);
    }
  };

  const patch = (partial: Partial<CampaignItem>) =>
    setDraft(prev => ({ ...prev, ...partial }));

  const attached = useMemo(
    () =>
      draft.expIds.map(id => ({
        id,
        view: experiences.find(e => e.id === id) ?? null,
      })),
    [draft.expIds, experiences]
  );

  const gate = useMemo(
    () => itemShipGate(draft, experiences),
    [draft, experiences]
  );

  const candidates = useMemo(() => {
    const q = pickerQuery.trim().toLowerCase();
    const carried = new Set(
      draft.expIds
        .map(id => experiences.find(e => e.id === id)?.origin)
        .filter((origin): origin is string => Boolean(origin))
    );
    return experiences
      .filter(e => e.template && !carried.has(e.id))
      .filter(
        e => !q || `${e.name} ${e.summary} ${e.slug}`.toLowerCase().includes(q)
      );
  }, [experiences, draft.expIds, pickerQuery]);

  /**
   * Gỡ = XOÁ bản copy ở server (spec §5.4: một copy rời khỏi hạng mục thì
   * không còn nghĩa gì). Bỏ khỏi danh sách trước để nút phản hồi ngay, hỏng
   * thì trả lại — giữ nó biến mất trong khi server vẫn còn là nói dối.
   */
  const handleDetach = async (experienceId: string) => {
    const before = draft.expIds;
    patch({ expIds: before.filter(x => x !== experienceId) });
    const ok = await onDetachExperience(experienceId);
    if (!ok) patch({ expIds: before });
  };

  const handleAttach = async (masterId: string) => {
    setPickerOpen(false);
    setPickerQuery('');
    const copyId = await onAttachMaster(masterId);
    if (copyId && !draft.expIds.includes(copyId)) {
      patch({ expIds: [...draft.expIds, copyId] });
    }
  };

  return (
    <Modal
      open
      wide
      onClose={onClose}
      title={subjectLabel || t('untitledSubject')}
      subtitle={t('itemSub', {
        kind: draft.kind === 'topic' ? t('kindTopic') : t('kindProduct'),
        campaign: campaignName,
      })}
      footer={
        <>
          <Button variant='ghost' onClick={onClose}>
            {t('cancel')}
          </Button>
          <Button variant='danger' onClick={onDelete}>
            {t('removeSubject')}
          </Button>
          <span className='flex-1' />
          <Button
            variant='primary'
            onClick={() => onSave(syncItemStage(draft))}
          >
            {t('save')}
          </Button>
        </>
      }
    >
      <fieldset className='mb-5'>
        <legend className='mb-2.5 text-[9.5px] font-bold tracking-[0.09em] text-[var(--pv2-faint)] uppercase'>
          {t('stageLegend')}
        </legend>
        <div className='flex flex-wrap gap-1.5'>
          {ITEM_FLOW.map(id => {
            const on = draft.status === id;
            /* `live` is not a status this pill can set — the BE refuses the
               status PATCH for it (409). It only ever reaches `live` through
               the real Deploy action below, which stamps `draft.status`
               itself on success. So the pill here is read-only for `live`:
               it lights up once deployed, but clicking it before that does
               nothing. */
            const liveLocked = id === 'live' && !on;
            const held = (!gate.ok && stageNeedsGate(id) && !on) || liveLocked;
            return (
              <button
                key={id}
                type='button'
                aria-pressed={on}
                disabled={held}
                title={
                  liveLocked
                    ? t('liveLocked')
                    : held
                      ? t('gateHeld')
                      : undefined
                }
                onClick={() =>
                  id === 'live'
                    ? undefined
                    : patch({ status: id as CampaignItemStatus })
                }
                className={cn(
                  'rounded-full border px-3 py-1.5 text-[12px] font-semibold transition-colors',
                  'focus-visible:ring-2 focus-visible:ring-[var(--pv2-electric)] focus-visible:outline-none',
                  held
                    ? 'cursor-not-allowed border-dashed border-[var(--pv2-hair)] text-[var(--pv2-faint)]'
                    : 'cursor-pointer',
                  on &&
                    'border-[var(--pv2-ink)] bg-[var(--pv2-ink)] text-[var(--pv2-paper)]',
                  !on &&
                    !held &&
                    'border-[var(--pv2-hair)] bg-[var(--pv2-paper)] text-[var(--pv2-mut)] hover:border-[var(--pv2-slate-300)] hover:text-[var(--pv2-ink)]'
                )}
              >
                {t(ITEM_STATUS[id].labelKey)}
              </button>
            );
          })}
        </div>
        <div className='mt-3'>
          <StageBar status={draft.status} />
        </div>
      </fieldset>

      <section
        className={cn(
          'mb-5 rounded-[var(--pv2-r)] border px-4 py-3.5',
          gate.ok
            ? 'border-[color-mix(in_srgb,var(--pv2-success)_35%,transparent)] bg-[color-mix(in_srgb,var(--pv2-success)_6%,transparent)]'
            : 'border-[color-mix(in_srgb,var(--pv2-warning)_40%,transparent)] bg-[color-mix(in_srgb,var(--pv2-warning)_7%,transparent)]'
        )}
      >
        <p className='mb-2.5 text-[9.5px] font-bold tracking-[0.09em] text-[var(--pv2-faint)] uppercase'>
          {gate.ok ? t('shipGateOkTitle') : t('shipGateTitle')}
        </p>
        <ul className='grid gap-1.5 sm:grid-cols-2'>
          {gate.checks.map(check => (
            <li
              key={check.id}
              className='flex items-start gap-2 text-[12px] leading-relaxed'
            >
              {check.ok ? (
                <Check
                  className='mt-0.5 size-3.5 shrink-0 text-[var(--pv2-success)]'
                  strokeWidth={2.6}
                  aria-hidden
                />
              ) : (
                <X
                  className='mt-0.5 size-3.5 shrink-0 text-[var(--pv2-warning)]'
                  strokeWidth={2.6}
                  aria-hidden
                />
              )}
              <span
                className={
                  check.ok
                    ? 'text-[var(--pv2-mut)]'
                    : 'font-semibold text-[var(--pv2-ink)]'
                }
              >
                {t(`ship_${check.id}`)}
                {!check.ok ? (
                  <span className='block font-normal text-[var(--pv2-mut)]'>
                    {t(`shipWhy_${check.id}`, {
                      floor: Math.round(SHIP_TRACK_FLOOR * 100),
                    })}
                  </span>
                ) : null}
              </span>
            </li>
          ))}
        </ul>
      </section>

      {/*
        The real go-live / pull-down — `item.status` (persisted), not
        `draft.status`: this reads the server's truth, not an unsaved pill
        click. Deploying picks channels fresh every time (the BE keeps no
        selection for a not-yet-live item, see deploy `types.ts`).
      */}
      {item.status === 'ready' ? (
        <section className='mb-5 rounded-[var(--pv2-r)] border border-[var(--pv2-hair)] px-4 py-3.5'>
          <p className='mb-2.5 text-[9.5px] font-bold tracking-[0.09em] text-[var(--pv2-faint)] uppercase'>
            {td('channelsLabel')}
          </p>
          <div className='mb-3 flex flex-wrap gap-2'>
            {channels.map(ch => (
              <ChannelToggle
                key={ch.id}
                channel={ch}
                selected={selectedChannelIds.includes(ch.id)}
                onToggle={id =>
                  setSelectedChannelIds(prev =>
                    prev.includes(id)
                      ? prev.filter(x => x !== id)
                      : [...prev, id]
                  )
                }
                disabledHint={td('channelNotConnected')}
              />
            ))}
          </div>
          <Button
            variant='primary'
            disabled={
              deploying || !canDeploySelection(selectedChannelIds, channels)
            }
            onClick={() => void handleDeploy()}
          >
            <Rocket className='size-3.5' strokeWidth={2.2} aria-hidden />
            {deploying
              ? td('deploying')
              : td('deployToChannels', { count: selectedChannelIds.length })}
          </Button>
        </section>
      ) : null}

      {item.status === 'live' ? (
        <section className='mb-5 flex items-center justify-between gap-3 rounded-[var(--pv2-r)] border border-[var(--pv2-hair)] bg-[var(--pv2-canvas)] px-4 py-3.5'>
          <span className='text-[12.5px] text-[var(--pv2-mut)]'>
            {td('liveOnCampaignScreen')}
          </span>
          <Button
            variant='danger'
            disabled={pausing}
            onClick={() => void handlePause()}
          >
            {pausing ? td('pausing') : td('pause')}
          </Button>
        </section>
      ) : null}

      {draft.kind === 'topic' ? (
        <Field label={t('fieldTopicName')}>
          <TextInput
            value={draft.name ?? ''}
            onChange={e => patch({ name: e.target.value })}
            placeholder={t('addTopicPlaceholder')}
          />
        </Field>
      ) : null}

      <div className='grid gap-x-4 sm:grid-cols-2'>
        <Field label={t('fieldItemOwner')}>
          <TextSelect
            value={draft.owner}
            onChange={e => patch({ owner: e.target.value })}
          >
            <option value=''>{t('unassigned')}</option>
            {team.map(member => (
              <option key={member.id} value={member.id}>
                {member.name}
              </option>
            ))}
          </TextSelect>
        </Field>
        <Field label={t('fieldDue')}>
          <TextInput
            type='date'
            value={draft.due ?? ''}
            onChange={e => patch({ due: e.target.value || null })}
          />
        </Field>
      </div>

      <Field label={t('fieldItemNote')}>
        <TextTextarea
          rows={3}
          value={draft.note}
          onChange={e => patch({ note: e.target.value })}
          placeholder={t('fieldItemNotePlaceholder')}
        />
      </Field>

      <p className='mt-4 mb-2.5 text-[9.5px] font-bold tracking-[0.09em] text-[var(--pv2-faint)] uppercase'>
        {t('experiencesLegend')}
      </p>

      {attached.length ? (
        <div className='mb-3 flex flex-col gap-2'>
          {attached.map(({ id, view }) => {
            const fits = view ? speaksForSubject(draft, view) : true;
            const thin = view ? view.coverage < SHIP_TRACK_FLOOR : false;
            return (
              <div
                key={id}
                className='flex items-center gap-3 rounded-[var(--pv2-r-sm)] border border-[var(--pv2-hair)] px-3 py-2.5'
              >
                <span className='min-w-0 flex-1'>
                  <span className='block truncate text-[12.5px] font-semibold text-[var(--pv2-ink)]'>
                    {view?.name ?? t('experienceMissing')}
                  </span>
                  <span className='block truncate text-[11px] text-[var(--pv2-faint)]'>
                    {view
                      ? t('expMeta', {
                          slug: `/p/${view.slug}`,
                          coverage: Math.round(view.coverage * 100),
                        })
                      : id}
                  </span>
                  {!fits || thin ? (
                    <span className='mt-1 flex flex-wrap gap-1.5'>
                      {!fits ? (
                        <span className='rounded-full bg-[color-mix(in_srgb,var(--pv2-warning)_16%,transparent)] px-2 py-0.5 text-[10.5px] font-bold text-[color-mix(in_srgb,var(--pv2-warning)_78%,var(--pv2-ink))]'>
                          {t('expWrongWords')}
                        </span>
                      ) : null}
                      {thin ? (
                        <span className='rounded-full bg-[color-mix(in_srgb,var(--pv2-warning)_16%,transparent)] px-2 py-0.5 text-[10.5px] font-bold text-[color-mix(in_srgb,var(--pv2-warning)_78%,var(--pv2-ink))]'>
                          {t('expThinTracking')}
                        </span>
                      ) : null}
                    </span>
                  ) : null}
                </span>
                <button
                  type='button'
                  aria-label={t('detachExperience')}
                  title={t('detachExperience')}
                  onClick={() => void handleDetach(id)}
                  className={cn(
                    'grid size-7 shrink-0 cursor-pointer place-items-center rounded-[7px] text-[var(--pv2-mut)] transition-colors',
                    'hover:bg-[color-mix(in_srgb,var(--pv2-error)_10%,transparent)] hover:text-[var(--pv2-error)]',
                    'focus-visible:ring-2 focus-visible:ring-[var(--pv2-electric)] focus-visible:outline-none'
                  )}
                >
                  <X className='size-3.5' strokeWidth={2} aria-hidden />
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <p className='mb-3 rounded-[10px] bg-[var(--pv2-canvas)] px-4 py-4 text-[12.5px] text-[var(--pv2-faint)]'>
          {t('noExperiencesYet')}
        </p>
      )}

      {pickerOpen ? (
        <div className='rounded-[var(--pv2-r)] border border-[var(--pv2-hair)] px-4 py-3.5'>
          <p className='mb-2.5 text-[11.5px] leading-relaxed text-[var(--pv2-mut)]'>
            {t('attachForksNote')}
          </p>
          <TextInput
            value={pickerQuery}
            onChange={e => setPickerQuery(e.target.value)}
            placeholder={t('experienceSearchPlaceholder')}
            className='mb-3'
          />
          {candidates.length ? (
            <div className='grid max-h-[240px] gap-2 overflow-y-auto sm:grid-cols-2'>
              {candidates.map(experience => (
                <button
                  key={experience.id}
                  type='button'
                  onClick={() => handleAttach(experience.id)}
                  className={cn(
                    'cursor-pointer rounded-[var(--pv2-r-sm)] border px-3 py-2.5 text-left transition-colors',
                    'border-[var(--pv2-hair)] hover:border-[var(--pv2-electric)] hover:bg-[var(--pv2-electric-soft)]',
                    'focus-visible:ring-2 focus-visible:ring-[var(--pv2-electric)] focus-visible:outline-none'
                  )}
                >
                  <span className='block truncate text-[12.5px] font-semibold text-[var(--pv2-ink)]'>
                    {experience.name}
                  </span>
                  <span className='block truncate text-[11px] text-[var(--pv2-faint)]'>
                    {experience.summary}
                  </span>
                  <span className='mt-1 block text-[10.5px] text-[var(--pv2-faint)]'>
                    {t('expCoverage', {
                      coverage: Math.round(experience.coverage * 100),
                    })}
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <p className='py-4 text-center text-[12.5px] text-[var(--pv2-faint)]'>
              {t('noExperienceMatch')}
            </p>
          )}
        </div>
      ) : (
        <Button variant='dashed' onClick={() => setPickerOpen(true)}>
          <Plus className='size-3.5' strokeWidth={2.4} aria-hidden />
          {t('attachExperience')}
        </Button>
      )}
    </Modal>
  );
};
