'use client';

/**
 * Dialog "Chạy AI-Insights từ dữ liệu Marketing" (GĐ1 bridge).
 * Hiện coverage các mục brief đã map (✓/⚠), confirm rồi mới chạy vì mỗi
 * report tốn credits (5-8 LLM call). Tạo xong trả `report_id` cho editor
 * lưu vào notes; user theo dõi report ở /portal/insights/[id].
 */

import { AlertTriangle, Check, Sparkles } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/atoms/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/atoms/dialog';
import { cn } from '@/lib/cn';
import { rexerApi } from '@/services/rexer/endpoints';

import type { AssetsState } from './_assets';
import { marketingToInsightInputs } from './_insights-bridge';
import type { BriefState, CampaignState } from './_steps';

export function AiAssistantDialog({
  open,
  onOpenChange,
  brief,
  assets,
  campaign,
  productId,
  campaignId,
  workspaceId,
  existingReportId,
  onStarted,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  brief: BriefState;
  assets: AssetsState;
  campaign: CampaignState;
  productId: string;
  campaignId?: string;
  workspaceId?: string;
  existingReportId?: string;
  onStarted: (reportId: string) => void;
}) {
  const t = useTranslations('portal');
  const [running, setRunning] = useState(false);
  const { inputs, coverage } = useMemo(
    () => marketingToInsightInputs(brief, assets, campaign),
    [brief, assets, campaign]
  );
  const filled = coverage.filter(c => c.ok).length;

  const handleRun = async () => {
    if (!workspaceId) {
      toast.error(t('marketingAiAssistantDialog.missingWorkspace'));
      return;
    }
    setRunning(true);
    try {
      const report = await rexerApi.insights.create({
        workspace_id: workspaceId,
        product_id: productId || undefined,
        campaign_id: campaignId,
        title: campaign.name
          ? `Marketing — ${campaign.name}`
          : 'Marketing brief',
        inputs,
      });
      toast.success(t('marketingAiAssistantDialog.createdToast'));
      onStarted(report.id);
      onOpenChange(false);
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : t('marketingAiAssistantDialog.createFailed')
      );
    } finally {
      setRunning(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-md'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <Sparkles className='size-4 text-blue-600' />
            {t('marketingAiAssistantDialog.title')}
          </DialogTitle>
        </DialogHeader>

        <p className='text-content-muted text-sm'>
          {t('marketingAiAssistantDialog.description')}
        </p>

        <ul className='flex flex-col gap-1.5'>
          {coverage.map(c => (
            <li key={c.label} className='flex items-center gap-2 text-sm'>
              {c.ok ? (
                <Check className='size-4 shrink-0 text-emerald-600' />
              ) : (
                <AlertTriangle className='size-4 shrink-0 text-amber-500' />
              )}
              <span
                className={cn(c.ok ? 'text-foreground' : 'text-content-muted')}
              >
                {c.label}
              </span>
            </li>
          ))}
        </ul>

        <p className='text-content-muted text-xs'>
          {t('marketingAiAssistantDialog.coverageHint', {
            filled,
            total: coverage.length,
          })}
        </p>

        {existingReportId && (
          <p className='text-xs'>
            {t('marketingAiAssistantDialog.existingReportPrefix')}{' '}
            <Link
              href={`/portal/insights/${existingReportId}`}
              className='text-primary hover:underline'
            >
              {t('marketingAiAssistantDialog.existingReportLink')}
            </Link>{' '}
            {t('marketingAiAssistantDialog.existingReportSuffix')}
          </p>
        )}

        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            {t('marketingAiAssistantDialog.cancel')}
          </Button>
          <Button onClick={handleRun} disabled={running}>
            {running
              ? t('marketingAiAssistantDialog.creating')
              : t('marketingAiAssistantDialog.run')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
