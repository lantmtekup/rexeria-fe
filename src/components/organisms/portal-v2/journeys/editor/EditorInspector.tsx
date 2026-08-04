'use client';

import { Copy, Link2, Trash2, TriangleAlert } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/molecules/portal-v2/Button';
import {
  Field,
  TextInput,
  TextSelect,
  TextTextarea,
} from '@/components/molecules/portal-v2/brand-form';
import { cn } from '@/lib/cn';
import {
  ENTRY_SOURCES,
  JOURNEY_KINDS,
  JOURNEY_KIND_ORDER,
  JOURNEY_KIND_STYLE,
  JOURNEY_OBJECTIVES,
  JOURNEY_SEGMENTS,
  entrySourceById,
  segmentById,
} from '@/lib/portal-v2/journeys/constants';
import type {
  Journey,
  JourneyNode,
  JourneyNodeKind,
  JourneyNodePatch,
} from '@/lib/portal-v2/journeys/types';
import type { ExperienceObjective } from '@/lib/portal-v2/experiences/types';

/**
 * The right column: one node's fields, or the journey's own when nothing is
 * selected.
 *
 * The prototype floats a popup over the canvas per node (~L23779) and hides the
 * journey's fields behind a toggle. A fixed column instead means the graph never
 * moves under the thing you are reading, and the empty state is not empty — it
 * is where the journey's name, objective and audience live.
 *
 * TYPED FIELDS ARE LIVE, CHOSEN ONES SNAPSHOT. Keystrokes go through `onPatch`
 * and only become an undo step on blur, so one sentence is one undo. A select is
 * a single decision and snapshots at once.
 */

type EditorInspectorProps = {
  draft: Journey;
  node: JourneyNode | null;
  /** Live per keystroke. */
  onPatch: (patch: JourneyNodePatch) => void;
  /** Blur — turn the accumulated keystrokes into one undo step. */
  onCommit: () => void;
  onKindChange: (kind: JourneyNodeKind) => void;
  onSourceChange: (sourceId: string) => void;
  onPickExperience: () => void;
  onUnlinkExperience: () => void;
  onDuplicateNode: () => void;
  onDeleteNode: () => void;
  onMetaPatch: (patch: {
    tagline?: string;
    summary?: string;
    obj?: ExperienceObjective;
    seg?: string;
  }) => void;
  onMetaSelect: (patch: { obj?: ExperienceObjective; seg?: string }) => void;
};

const Note = ({
  children,
  tone = 'muted',
}: {
  children: React.ReactNode;
  tone?: 'muted' | 'bad';
}) => (
  <p
    className={cn(
      'text-[11.5px] leading-relaxed',
      tone === 'bad'
        ? 'font-semibold text-[#9a2436]'
        : 'text-[var(--pv2-faint)]'
    )}
  >
    {children}
  </p>
);

export const EditorInspector = ({
  draft,
  node,
  onPatch,
  onCommit,
  onKindChange,
  onSourceChange,
  onPickExperience,
  onUnlinkExperience,
  onDuplicateNode,
  onDeleteNode,
  onMetaPatch,
  onMetaSelect,
}: EditorInspectorProps) => {
  const t = useTranslations('portalV2.journeys');

  /* ── nothing selected: the journey's own fields ─────────────────────── */
  if (!node) {
    const segment = segmentById(draft.seg);

    return (
      <div className='min-h-0 flex-1 overflow-y-auto px-4 py-4'>
        <span className='inline-flex rounded-full bg-[color-mix(in_srgb,var(--pv2-violet)_12%,transparent)] px-2.5 py-1 text-[9.5px] font-extrabold tracking-[0.05em] text-[var(--pv2-violet)] uppercase'>
          {t('inspectorJourneyTab')}
        </span>
        <p className='mt-2.5 mb-4 text-[11.5px] leading-relaxed text-[var(--pv2-faint)]'>
          {t('inspectorEmpty')}
        </p>

        <Field label={t('overDescription')}>
          <TextInput
            value={draft.tagline}
            onChange={e => onMetaPatch({ tagline: e.target.value })}
            onBlur={onCommit}
            placeholder={t('metaTaglinePlaceholder')}
          />
        </Field>

        <Field label={t('metaSummary')}>
          <TextTextarea
            rows={4}
            value={draft.summary}
            onChange={e => onMetaPatch({ summary: e.target.value })}
            onBlur={onCommit}
            placeholder={t('metaSummaryPlaceholder')}
          />
        </Field>

        <Field label={t('overObjective')}>
          <TextSelect
            value={draft.obj}
            onChange={e =>
              onMetaSelect({ obj: e.target.value as ExperienceObjective })
            }
          >
            {JOURNEY_OBJECTIVES.map(o => (
              <option key={o.id} value={o.id}>
                {t(o.labelKey)}
              </option>
            ))}
          </TextSelect>
        </Field>

        <Field label={t('overAudience')}>
          <TextSelect
            value={draft.seg}
            onChange={e => onMetaSelect({ seg: e.target.value })}
          >
            <option value='all'>{t('segmentAll')}</option>
            {JOURNEY_SEGMENTS.map(s => (
              <option key={s.id} value={s.id}>
                {s.n}
              </option>
            ))}
          </TextSelect>
        </Field>

        {segment ? <Note>{segment.want}</Note> : null}
      </div>
    );
  }

  /* ── a node ─────────────────────────────────────────────────────────── */
  const kind = JOURNEY_KINDS[node.kind];
  const style = JOURNEY_KIND_STYLE[node.kind];
  const source = entrySourceById(node.src);
  const coverage = node.xCoverage ?? 0;
  const branches = node.to.flatMap(id => {
    const target = draft.nodes.find(n => n.id === id);
    return target ? [target.name] : [];
  });

  return (
    <div className='flex min-h-0 flex-1 flex-col'>
      <div className='flex shrink-0 items-center gap-1.5 border-b border-[var(--pv2-hair)] px-4 py-2.5'>
        <span
          className='inline-flex rounded-full px-2.5 py-1 text-[9.5px] font-extrabold tracking-[0.05em] uppercase'
          style={{ background: style.bg, color: style.fg }}
        >
          {kind.name}
        </span>
        <span className='flex-1' />
        <button
          type='button'
          title={t('duplicateNode')}
          aria-label={t('duplicateNode')}
          onClick={onDuplicateNode}
          className='grid size-7 cursor-pointer place-items-center rounded-[8px] text-[var(--pv2-mut)] hover:bg-[var(--pv2-canvas)] hover:text-[var(--pv2-ink)] focus-visible:ring-2 focus-visible:ring-[var(--pv2-electric)] focus-visible:outline-none'
        >
          <Copy className='size-3.5' strokeWidth={2} aria-hidden />
        </button>
        <button
          type='button'
          title={t('deleteNode')}
          aria-label={t('deleteNode')}
          onClick={onDeleteNode}
          className='grid size-7 cursor-pointer place-items-center rounded-[8px] text-[var(--pv2-error)] hover:bg-[color-mix(in_srgb,var(--pv2-error)_10%,transparent)] focus-visible:ring-2 focus-visible:ring-[var(--pv2-electric)] focus-visible:outline-none'
        >
          <Trash2 className='size-3.5' strokeWidth={2} aria-hidden />
        </button>
      </div>

      <div className='min-h-0 flex-1 overflow-y-auto px-4 py-4'>
        <Field label={t('nodeName')}>
          <TextInput
            value={node.name}
            onChange={e => onPatch({ name: e.target.value })}
            onBlur={onCommit}
          />
        </Field>

        <Field label={t('nodePurpose')}>
          <TextTextarea
            rows={3}
            value={node.d}
            onChange={e => onPatch({ d: e.target.value })}
            onBlur={onCommit}
            placeholder={t('nodePurposePlaceholder')}
          />
          {!node.d ? <Note tone='bad'>{t('nodePurposeMissing')}</Note> : null}
        </Field>

        <Field label={t('nodeKind')}>
          <TextSelect
            value={node.kind}
            onChange={e => onKindChange(e.target.value as JourneyNodeKind)}
          >
            {JOURNEY_KIND_ORDER.map(k => (
              <option key={k} value={k}>
                {JOURNEY_KINDS[k].name}
              </option>
            ))}
          </TextSelect>
          <Note>{kind.d}</Note>
        </Field>

        {node.kind === 'entry' ? (
          <>
            <Field label={t('inspectorSource')}>
              <TextSelect
                value={node.src ?? ''}
                onChange={e => onSourceChange(e.target.value)}
              >
                <option value=''>{t('sourcePlaceholder')}</option>
                {ENTRY_SOURCES.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </TextSelect>
              {source ? (
                <Note>
                  {source.d} · {t('inspectorSignal')}: {source.sig}
                </Note>
              ) : (
                <Note tone='bad'>{t('sourceMissing')}</Note>
              )}
            </Field>

            <Field label={t('inspectorSystem')}>
              <TextInput
                value={node.via ?? ''}
                onChange={e => onPatch({ via: e.target.value })}
                onBlur={onCommit}
                placeholder={source?.via ?? 'Meta · Klaviyo'}
              />
            </Field>
          </>
        ) : null}

        {node.kind === 'experience' ? (
          <div className='mb-4'>
            <span className='mb-1.5 block text-[13px] font-medium text-[var(--pv2-mut)]'>
              {t('nodeExperience')}
            </span>

            {node.xName ? (
              <div className='rounded-[10px] border border-[var(--pv2-hair)] bg-[var(--pv2-canvas)] px-3 py-2.5'>
                <p className='truncate text-[13px] font-semibold text-[var(--pv2-ink)]'>
                  {node.xName}
                </p>
                <p
                  className={cn(
                    'mt-0.5 text-[11px]',
                    coverage > 0
                      ? 'text-[var(--pv2-mut)]'
                      : 'font-semibold text-[#9a2436]'
                  )}
                >
                  {coverage > 0
                    ? t('inspectorCoverage', { pct: coverage })
                    : t('inspectorUntracked')}
                </p>
                <div className='mt-2 flex items-center gap-1.5'>
                  <Button variant='ghost' size='sm' onClick={onPickExperience}>
                    {t('changeExperience')}
                  </Button>
                  <span className='flex-1' />
                  <Button
                    variant='danger'
                    size='sm'
                    onClick={onUnlinkExperience}
                  >
                    {t('removeExperience')}
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <Button variant='dashed' onClick={onPickExperience}>
                  <Link2 className='size-3.5' strokeWidth={2.4} aria-hidden />
                  {t('addExperience')}
                </Button>
                <p className='mt-1.5 flex items-start gap-1.5 text-[11.5px] leading-relaxed font-semibold text-[#9a2436]'>
                  <TriangleAlert
                    className='mt-px size-3.5 shrink-0'
                    strokeWidth={2.2}
                    aria-hidden
                  />
                  {t('inspectorNoLink')}
                </p>
              </>
            )}
          </div>
        ) : null}

        {node.kind === 'decision' ? (
          <div className='mb-4'>
            <span className='mb-1.5 block text-[13px] font-medium text-[var(--pv2-mut)]'>
              {t('inspectorBranches')}
            </span>
            {branches.length ? (
              <ul className='rounded-[10px] border border-[var(--pv2-hair)] bg-[var(--pv2-canvas)] px-3 py-2'>
                {branches.map(name => (
                  <li
                    key={name}
                    className='truncate py-0.5 text-[12px] text-[var(--pv2-ink)]'
                  >
                    {name}
                  </li>
                ))}
              </ul>
            ) : null}
            {branches.length < 2 ? (
              <Note tone='bad'>{t('decisionNeedsTwo')}</Note>
            ) : (
              <Note>{t('decisionHint')}</Note>
            )}
          </div>
        ) : null}

        {node.kind === 'action' || node.kind === 'outcome' ? (
          <Field label={t('inspectorSystem')}>
            <TextInput
              value={node.via ?? ''}
              onChange={e => onPatch({ via: e.target.value })}
              onBlur={onCommit}
              placeholder={
                node.kind === 'action' ? 'CRM sync · CDP' : 'Shopify checkout'
              }
            />
            {!node.via ? <Note tone='bad'>{t('systemMissing')}</Note> : null}
          </Field>
        ) : null}
      </div>
    </div>
  );
};
