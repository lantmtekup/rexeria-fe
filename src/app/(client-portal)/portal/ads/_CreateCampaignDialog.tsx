'use client';

import {
  Calendar,
  Check,
  ChevronLeft,
  ChevronRight,
  Link2,
  Loader2,
  Megaphone,
  Target,
  Wallet,
  X,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

import { rexerApi } from '@/services/rexer/endpoints';
import type {
  PortalAdCampaign,
  PortalAdObjective,
} from '@/services/rexer/types';
import { cn } from '@/lib/cn';

import type { PortalTemplate } from '../_data';
import { loadTemplates } from '../_remote';
import { useActiveWorkspace } from '../_workspace';

const OBJECTIVES: PortalAdObjective[] = [
  'awareness',
  'traffic',
  'conversion',
  'retention',
];

const STEPS = [
  { key: 'info', icon: Target },
  { key: 'budget', icon: Wallet },
  { key: 'link', icon: Link2 },
] as const;

/** Bỏ dấu + slugify cho UTM. */
function slugify(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/gi, 'd')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48);
}

export function CreateCampaignDialog({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: (c: PortalAdCampaign) => void;
}) {
  const t = useTranslations('portal');
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState('');
  const [objective, setObjective] = useState<PortalAdObjective>('awareness');
  const [channels, setChannels] = useState<string[]>([]);
  const [budget, setBudget] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [templateId, setTemplateId] = useState('');
  const [utm, setUtm] = useState('');
  const [utmTouched, setUtmTouched] = useState(false);
  const [notes, setNotes] = useState('');

  const [channelOpts, setChannelOpts] = useState<
    { id: string; name: string }[]
  >([]);
  const [templates, setTemplates] = useState<PortalTemplate[]>([]);
  const activeWs = useActiveWorkspace();

  // Landing page đích chỉ trong workspace+brand hiện tại (template không gắn
  // workspace = shared → vẫn cho chọn). Brand-scope đã do BE listTemplates.
  const scopedTemplates = useMemo(
    () =>
      templates.filter(t => !t.workspace_id || t.workspace_id === activeWs.id),
    [templates, activeWs.id]
  );

  // Reset + load options when opening
  useEffect(() => {
    if (!open) return;
    setStep(0);
    setName('');
    setObjective('awareness');
    setChannels([]);
    setBudget('');
    setStartDate('');
    setEndDate('');
    setTemplateId('');
    setUtm('');
    setUtmTouched(false);
    setNotes('');
    setSaving(false);

    rexerApi.portalAds
      .listChannels()
      .then(r => setChannelOpts(r.items ?? []))
      .catch(() => setChannelOpts([]));
    loadTemplates().then(r => setTemplates(r.data));
  }, [open]);

  // Auto-suggest UTM from name until user edits it
  const suggestedUtm = useMemo(() => slugify(name), [name]);
  useEffect(() => {
    if (!utmTouched) setUtm(suggestedUtm);
  }, [suggestedUtm, utmTouched]);

  if (!open) return null;

  const canNext = step > 0 || name.trim().length > 0;
  const isLast = step === STEPS.length - 1;

  const toggleChannel = (id: string) =>
    setChannels(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );

  const submit = async () => {
    if (!name.trim()) {
      toast.error(t('adsCreateCampaignDialog.nameRequiredToast'));
      setStep(0);
      return;
    }
    setSaving(true);
    try {
      const res = await rexerApi.portalAds.createCampaign({
        name: name.trim(),
        objective,
        channels: channels.length ? channels : undefined,
        budget_amount: budget ? Number(budget) : undefined,
        budget_currency: budget ? 'VND' : undefined,
        start_date: startDate || undefined,
        end_date: endDate || undefined,
        landing_template_id: templateId || undefined,
        utm_campaign: utm.trim() || undefined,
        notes: notes.trim() || undefined,
        status: 'draft',
      });
      toast.success(
        t('adsCreateCampaignDialog.createdToast', { name: res.campaign.name })
      );
      onCreated(res.campaign);
      onClose();
    } catch (err) {
      toast.error(t('adsCreateCampaignDialog.createFailedToast'), {
        description: err instanceof Error ? err.message : String(err),
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className='fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4 backdrop-blur-sm'
      onClick={onClose}
    >
      <div
        className='my-8 flex w-full max-w-xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl'
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className='border-border flex items-center justify-between gap-3 border-b px-5 py-3.5'>
          <div className='flex items-center gap-2.5'>
            <div className='flex size-8 items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm'>
              <Megaphone className='size-4' />
            </div>
            <div>
              <h3 className='text-base leading-tight font-semibold'>
                {t('adsCreateCampaignDialog.title')}
              </h3>
              <p className='text-2xs text-content-muted mt-0.5'>
                {t('adsCreateCampaignDialog.subtitle')}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className='text-muted-foreground hover:bg-muted hover:text-content-muted rounded-lg p-1.5'
            aria-label={t('adsCreateCampaignDialog.closeAria')}
          >
            <X className='size-4' />
          </button>
        </div>

        {/* Stepper */}
        <div className='border-border flex items-center gap-1 border-b px-5 py-3'>
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const active = i === step;
            const done = i < step;
            return (
              <div key={s.key} className='flex flex-1 items-center'>
                <button
                  type='button'
                  onClick={() => (i < step || canNext) && setStep(i)}
                  className='flex items-center gap-2'
                >
                  <span
                    className={cn(
                      'text-2xs flex size-6 items-center justify-center rounded-full font-bold transition-colors',
                      active && 'bg-blue-600 text-white',
                      done && 'bg-emerald-500 text-white',
                      !active && !done && 'bg-muted text-muted-foreground'
                    )}
                  >
                    {done ? (
                      <Check className='size-3.5' />
                    ) : (
                      <Icon className='size-3.5' />
                    )}
                  </span>
                  <span
                    className={cn(
                      'text-xs font-medium',
                      active ? 'text-foreground' : 'text-muted-foreground'
                    )}
                  >
                    {t(`adsCreateCampaignDialog.step_${s.key}`)}
                  </span>
                </button>
                {i < STEPS.length - 1 && (
                  <span
                    className={cn(
                      'mx-2 h-px flex-1',
                      done ? 'bg-emerald-300' : 'bg-zinc-200'
                    )}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Body */}
        <div className='min-h-[300px] space-y-4 px-5 py-4'>
          {/* Step 0 — Thông tin */}
          {step === 0 && (
            <div className='space-y-4'>
              <div>
                <label className='text-3xs text-content-muted block font-semibold tracking-wider uppercase'>
                  {t('adsCreateCampaignDialog.nameLabel')}{' '}
                  <span className='text-rose-500'>*</span>
                </label>
                <input
                  type='text'
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder={t('adsCreateCampaignDialog.namePlaceholder')}
                  className='border-border mt-1.5 w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100'
                  maxLength={128}
                  autoFocus
                />
              </div>

              <div>
                <label className='text-3xs text-content-muted mb-1.5 block font-semibold tracking-wider uppercase'>
                  {t('adsCreateCampaignDialog.objectiveLabel')}
                </label>
                <div className='grid grid-cols-2 gap-2'>
                  {OBJECTIVES.map(o => (
                    <button
                      key={o}
                      type='button'
                      onClick={() => setObjective(o)}
                      className={cn(
                        'rounded-lg border px-3 py-2 text-left transition-colors',
                        objective === o
                          ? 'border-blue-400 bg-blue-50/60 ring-2 ring-blue-100'
                          : 'border-border hover:bg-muted'
                      )}
                    >
                      <span className='text-foreground block text-sm font-semibold'>
                        {t(`adsCreateCampaignDialog.objective_${o}_label`)}
                      </span>
                      <span className='text-2xs text-content-muted block'>
                        {t(`adsCreateCampaignDialog.objective_${o}_desc`)}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className='text-3xs text-content-muted mb-1.5 block font-semibold tracking-wider uppercase'>
                  {t('adsCreateCampaignDialog.channelsLabel')}
                </label>
                <div className='flex flex-wrap gap-1.5'>
                  {channelOpts.length === 0 && (
                    <span className='text-muted-foreground text-xs'>
                      {t('adsCreateCampaignDialog.channelsLoading')}
                    </span>
                  )}
                  {channelOpts.map(c => {
                    const on = channels.includes(c.id);
                    return (
                      <button
                        key={c.id}
                        type='button'
                        onClick={() => toggleChannel(c.id)}
                        className={cn(
                          'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
                          on
                            ? 'border-blue-500 bg-blue-600 text-white'
                            : 'border-border text-content-muted hover:bg-muted bg-white'
                        )}
                      >
                        {on && <Check className='size-3' />}
                        {c.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Step 1 — Ngân sách & lịch */}
          {step === 1 && (
            <div className='space-y-4'>
              <div>
                <label className='text-3xs text-content-muted block font-semibold tracking-wider uppercase'>
                  {t('adsCreateCampaignDialog.budgetLabel')}
                </label>
                <div className='mt-1.5 flex items-center gap-2'>
                  <input
                    type='number'
                    min={0}
                    value={budget}
                    onChange={e => setBudget(e.target.value)}
                    placeholder={t('adsCreateCampaignDialog.budgetPlaceholder')}
                    className='border-border w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100'
                  />
                  <span className='bg-muted text-content-muted shrink-0 rounded-lg px-3 py-2 text-sm font-medium'>
                    VND
                  </span>
                </div>
                {budget && (
                  <p className='text-2xs text-muted-foreground mt-1'>
                    ≈ {(Number(budget) / 1_000_000).toLocaleString('vi-VN')}M
                    VND
                  </p>
                )}
              </div>

              <div className='grid grid-cols-2 gap-3'>
                <div>
                  <label className='text-3xs text-content-muted block font-semibold tracking-wider uppercase'>
                    {t('adsCreateCampaignDialog.startDateLabel')}
                  </label>
                  <div className='border-border mt-1.5 flex items-center gap-2 rounded-lg border px-3 py-2'>
                    <Calendar className='text-muted-foreground size-3.5' />
                    <input
                      type='date'
                      value={startDate}
                      onChange={e => setStartDate(e.target.value)}
                      className='w-full bg-transparent text-sm outline-none'
                    />
                  </div>
                </div>
                <div>
                  <label className='text-3xs text-content-muted block font-semibold tracking-wider uppercase'>
                    {t('adsCreateCampaignDialog.endDateLabel')}
                  </label>
                  <div className='border-border mt-1.5 flex items-center gap-2 rounded-lg border px-3 py-2'>
                    <Calendar className='text-muted-foreground size-3.5' />
                    <input
                      type='date'
                      value={endDate}
                      min={startDate || undefined}
                      onChange={e => setEndDate(e.target.value)}
                      className='w-full bg-transparent text-sm outline-none'
                    />
                  </div>
                </div>
              </div>
              <p className='text-2xs text-muted-foreground'>
                {t('adsCreateCampaignDialog.scheduleHint')}
              </p>
            </div>
          )}

          {/* Step 2 — Liên kết */}
          {step === 2 && (
            <div className='space-y-4'>
              <div>
                <label className='text-3xs text-content-muted block font-semibold tracking-wider uppercase'>
                  {t('adsCreateCampaignDialog.landingLabel')}
                </label>
                <select
                  value={templateId}
                  onChange={e => setTemplateId(e.target.value)}
                  className='border-border mt-1.5 w-full rounded-lg border bg-white px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100'
                >
                  <option value=''>
                    {t('adsCreateCampaignDialog.landingNone')}
                  </option>
                  {scopedTemplates.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
                <p className='text-2xs text-muted-foreground mt-1'>
                  {t('adsCreateCampaignDialog.landingHint')}
                </p>
              </div>

              <div>
                <label className='text-3xs text-content-muted block font-semibold tracking-wider uppercase'>
                  UTM campaign
                </label>
                <input
                  type='text'
                  value={utm}
                  onChange={e => {
                    setUtmTouched(true);
                    setUtm(e.target.value);
                  }}
                  placeholder={t('adsCreateCampaignDialog.utmPlaceholder')}
                  className='border-border mt-1.5 w-full rounded-lg border px-3 py-2 font-mono text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100'
                />
              </div>

              <div>
                <label className='text-3xs text-content-muted block font-semibold tracking-wider uppercase'>
                  {t('adsCreateCampaignDialog.notesLabel')}
                </label>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  rows={2}
                  placeholder={t('adsCreateCampaignDialog.notesPlaceholder')}
                  className='border-border mt-1.5 w-full resize-none rounded-lg border px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100'
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className='border-border bg-muted/50 flex items-center justify-between gap-3 border-t px-5 py-3'>
          <button
            type='button'
            onClick={step === 0 ? onClose : () => setStep(s => s - 1)}
            disabled={saving}
            className='border-border text-content-muted hover:bg-muted inline-flex items-center gap-1 rounded-lg border bg-white px-3 py-1.5 text-xs font-medium disabled:opacity-50'
          >
            {step === 0 ? (
              t('adsCreateCampaignDialog.cancel')
            ) : (
              <>
                <ChevronLeft className='size-3.5' />{' '}
                {t('adsCreateCampaignDialog.back')}
              </>
            )}
          </button>

          <div className='text-2xs text-muted-foreground'>
            {t('adsCreateCampaignDialog.stepCounter', {
              current: step + 1,
              total: STEPS.length,
            })}
          </div>

          {isLast ? (
            <button
              type='button'
              onClick={submit}
              disabled={saving}
              className='inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-1.5 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-60'
            >
              {saving ? (
                <Loader2 className='size-3.5 animate-spin' />
              ) : (
                <Check className='size-3.5' />
              )}
              {saving
                ? t('adsCreateCampaignDialog.creating')
                : t('adsCreateCampaignDialog.submit')}
            </button>
          ) : (
            <button
              type='button'
              onClick={() => canNext && setStep(s => s + 1)}
              disabled={!canNext}
              className='inline-flex items-center gap-1 rounded-lg bg-blue-600 px-4 py-1.5 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-50'
            >
              {t('adsCreateCampaignDialog.next')}{' '}
              <ChevronRight className='size-3.5' />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
