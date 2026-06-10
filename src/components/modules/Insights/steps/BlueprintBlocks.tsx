'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import {
  Eye,
  LayoutGrid,
  LayoutTemplate,
  Search,
  Sparkles,
  Wand2,
} from 'lucide-react';

import { Badge } from '@/components/atoms/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/atoms/dialog';
import { cn } from '@/lib/cn';
import type {
  InsightBlocksByStage,
  InsightBlueprint,
  InsightRecommendedBlock,
  InsightRecommendedTemplate,
} from '@/services/rexer/types';
import { SectionCard } from './ui';

/**
 * Section Blocks & Templates của blueprint — bản nâng cấp:
 * - mỗi stage collapse/expand được;
 * - mỗi block/template có thumbnail (placeholder gradient theo code — preview thật
 *   sẽ wire khi BE có catalog), nút "Xem chi tiết" (dialog), và 2 hành động:
 *   "AI tạo nội dung" / "Tìm thủ công" (hiện là placeholder, cần BE — xem be-spec).
 */

const THUMB_GRADIENTS = [
  'from-indigo-500 to-violet-600',
  'from-emerald-500 to-teal-600',
  'from-orange-500 to-amber-600',
  'from-sky-500 to-blue-600',
  'from-rose-500 to-pink-600',
  'from-fuchsia-500 to-purple-600',
];

/** Gradient ổn định theo code (placeholder thumbnail khi chưa có ảnh preview). */
function thumbGradient(s: string): string {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return THUMB_GRADIENTS[Math.abs(h) % THUMB_GRADIENTS.length];
}

function Thumb({
  code,
  kind = 'block',
  className,
}: {
  code: string;
  kind?: 'block' | 'template';
  className?: string;
}) {
  const Icon = kind === 'template' ? LayoutTemplate : LayoutGrid;
  return (
    <div
      className={cn(
        'relative flex shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br text-white',
        thumbGradient(code),
        className
      )}
    >
      <Icon className='size-5 opacity-90' aria-hidden />
    </div>
  );
}

/* ── Block ───────────────────────────────────────────────────────────────── */

function BlockRow({ block }: { block: InsightRecommendedBlock }) {
  const t = useTranslations('insights');
  const [open, setOpen] = useState(false);

  return (
    <li className='border-border bg-card flex gap-3 rounded-xl border p-3'>
      <Thumb code={block.block_type_code} className='size-14' />
      <div className='min-w-0 flex-1'>
        <div className='flex flex-wrap items-baseline gap-2'>
          <span className='text-content-main text-sm font-semibold'>
            {block.block_name}
          </span>
          <Badge variant='outline' className='bg-emerald-50 text-emerald-700'>
            {block.block_type_code}
          </Badge>
        </div>
        {block.reason && (
          <p className='text-content-muted mt-0.5 line-clamp-2 text-xs'>
            {block.reason}
          </p>
        )}
        <div className='mt-2 flex flex-wrap gap-1.5'>
          <ActionBtn
            icon={<Eye className='size-3' aria-hidden />}
            label={t('blueprint.viewDetail')}
            onClick={() => setOpen(true)}
          />
          <ActionBtn
            icon={<Wand2 className='size-3' aria-hidden />}
            label={t('blueprint.aiGenerate')}
            accent='violet'
            onClick={() => toast.info(t('blueprint.generatePending'))}
          />
          <ActionBtn
            icon={<Search className='size-3' aria-hidden />}
            label={t('blueprint.manualSearch')}
            onClick={() => toast.info(t('blueprint.searchPending'))}
          />
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className='sm:max-w-md'>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2'>
              <Thumb code={block.block_type_code} className='size-9' />
              {block.block_name}
            </DialogTitle>
          </DialogHeader>
          <div className='space-y-3 text-sm'>
            <DetailRow label={t('blueprint.blockCode')}>
              <code className='bg-muted rounded px-1.5 py-0.5 font-mono text-xs'>
                {block.block_type_code}
              </code>
            </DetailRow>
            {block.reason && (
              <DetailRow label={t('blueprint.why')}>{block.reason}</DetailRow>
            )}
            <p className='text-content-muted border-border rounded-lg border border-dashed p-3 text-xs'>
              {t('blueprint.previewNote')}
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </li>
  );
}

/* ── Stage group (không collapse — collapse ở cấp section/cha) ──────────────── */

function StageGroup({ stage }: { stage: InsightBlocksByStage }) {
  const blocks = stage.blocks ?? [];
  return (
    <div className='border-border overflow-hidden rounded-xl border'>
      <div className='bg-muted/40 flex items-center gap-2 px-3 py-2.5'>
        <span className='text-content-main flex-1 text-sm font-semibold'>
          {stage.stage_key}
        </span>
        <span className='text-content-muted bg-card rounded-full px-2 py-0.5 text-[11px] font-semibold'>
          {blocks.length}
        </span>
      </div>
      <div className='space-y-2 px-3 pt-2 pb-3'>
        {stage.stage_rationale && (
          <p className='text-content-muted text-xs'>{stage.stage_rationale}</p>
        )}
        <ul className='space-y-2'>
          {blocks.map(b => (
            <BlockRow key={b.block_type_code} block={b} />
          ))}
        </ul>
      </div>
    </div>
  );
}

export function BlocksSection({ blueprint }: { blueprint: InsightBlueprint }) {
  const t = useTranslations('insights');
  const blocks = blueprint.recommended_blocks;
  if (!blocks) return null;
  const stages = blocks.blocks_by_stage ?? [];

  return (
    <SectionCard
      icon={<LayoutGrid aria-hidden />}
      title={t('blueprint.blocks')}
      index={3}
      accent='emerald'
      delayMs={160}
      collapsible
    >
      <div className='space-y-2.5'>
        {stages.map(stage => (
          <StageGroup key={stage.stage_key} stage={stage} />
        ))}
      </div>
    </SectionCard>
  );
}

/* ── Template ──────────────────────────────────────────────────────────────── */

function TemplateCard({ tpl }: { tpl: InsightRecommendedTemplate }) {
  const t = useTranslations('insights');
  const [open, setOpen] = useState(false);
  const codes = tpl.block_codes ?? [];

  return (
    <div className='group/tpl border-border bg-card overflow-hidden rounded-xl border transition hover:-translate-y-0.5 hover:shadow-md'>
      <div className='relative'>
        <Thumb
          code={tpl.name}
          kind='template'
          className='h-24 w-full rounded-none'
        />
        <button
          type='button'
          onClick={() => setOpen(true)}
          className='text-content-main absolute right-2 bottom-2 inline-flex items-center gap-1 rounded-lg bg-white/95 px-2 py-1 text-[11px] font-semibold shadow-sm backdrop-blur transition hover:bg-white'
        >
          <Eye className='size-3' aria-hidden /> {t('blueprint.viewDetail')}
        </button>
      </div>
      <div className='space-y-2 p-4'>
        <div className='flex items-center justify-between gap-2'>
          <span className='text-content-main font-semibold'>{tpl.name}</span>
          {tpl.category && <Badge variant='secondary'>{tpl.category}</Badge>}
        </div>
        {tpl.description && (
          <p className='text-content-muted line-clamp-2 text-sm'>
            {tpl.description}
          </p>
        )}
        {codes.length > 0 && (
          <div className='flex flex-wrap gap-1.5'>
            {codes.slice(0, 4).map(code => (
              <Badge key={code} variant='outline'>
                {code}
              </Badge>
            ))}
            {codes.length > 4 && (
              <span className='text-content-muted text-xs'>
                +{codes.length - 4}
              </span>
            )}
          </div>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className='sm:max-w-lg'>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2'>
              <Sparkles className='text-warning size-4' aria-hidden />{' '}
              {tpl.name}
            </DialogTitle>
          </DialogHeader>
          <div className='space-y-3 text-sm'>
            {tpl.category && (
              <DetailRow label={t('blueprint.category')}>
                <Badge variant='secondary'>{tpl.category}</Badge>
              </DetailRow>
            )}
            {tpl.description && (
              <DetailRow label={t('blueprint.description')}>
                {tpl.description}
              </DetailRow>
            )}
            {codes.length > 0 && (
              <DetailRow label={t('blueprint.blocks')}>
                <span className='flex flex-wrap gap-1.5'>
                  {codes.map(c => (
                    <Badge key={c} variant='outline'>
                      {c}
                    </Badge>
                  ))}
                </span>
              </DetailRow>
            )}
            {tpl.why_fit && (
              <DetailRow label={t('blueprint.why')}>{tpl.why_fit}</DetailRow>
            )}
            <p className='text-content-muted border-border rounded-lg border border-dashed p-3 text-xs'>
              {t('blueprint.previewNote')}
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export function TemplatesSection({
  blueprint,
}: {
  blueprint: InsightBlueprint;
}) {
  const t = useTranslations('insights');
  const templates = blueprint.recommended_templates;
  if (!templates) return null;

  return (
    <SectionCard
      icon={<LayoutTemplate aria-hidden />}
      title={t('blueprint.templates')}
      index={4}
      accent='amber'
      delayMs={240}
      collapsible
    >
      <div className='grid gap-4 sm:grid-cols-2'>
        {(templates.templates ?? []).map(tpl => (
          <TemplateCard key={tpl.name} tpl={tpl} />
        ))}
      </div>
    </SectionCard>
  );
}

/* ── helpers ───────────────────────────────────────────────────────────────── */

function ActionBtn({
  icon,
  label,
  onClick,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  accent?: 'violet';
}) {
  return (
    <button
      type='button'
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1 rounded-lg border px-2 py-1 text-[11px] font-semibold transition',
        accent === 'violet'
          ? 'border-violet-200 bg-violet-50 text-violet-700 hover:bg-violet-100'
          : 'border-border text-content-muted hover:bg-muted'
      )}
    >
      {icon}
      {label}
    </button>
  );
}

function DetailRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className='flex flex-col gap-1'>
      <span className='text-content-muted text-[11px] font-semibold tracking-wide uppercase'>
        {label}
      </span>
      <div className='text-content-main'>{children}</div>
    </div>
  );
}
