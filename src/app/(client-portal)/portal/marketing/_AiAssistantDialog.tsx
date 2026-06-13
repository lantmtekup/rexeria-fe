'use client';

/**
 * Dialog "Chạy AI-Insights từ dữ liệu Marketing" (GĐ1 bridge).
 * Hiện coverage các mục brief đã map (✓/⚠), confirm rồi mới chạy vì mỗi
 * report tốn credits (5-8 LLM call). Tạo xong trả `report_id` cho editor
 * lưu vào notes; user theo dõi report ở /portal/insights/[id].
 */

import { AlertTriangle, Check, Sparkles } from 'lucide-react';
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
  const [running, setRunning] = useState(false);
  const { inputs, coverage } = useMemo(
    () => marketingToInsightInputs(brief, assets, campaign),
    [brief, assets, campaign]
  );
  const filled = coverage.filter(c => c.ok).length;

  const handleRun = async () => {
    if (!workspaceId) {
      toast.error('Thiếu workspace — mở portal qua đúng workspace');
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
      toast.success('Đã tạo report AI-Insights — đang chạy phân tích');
      onStarted(report.id);
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Tạo report thất bại');
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
            Chạy AI-Insights từ dữ liệu Marketing
          </DialogTitle>
        </DialogHeader>

        <p className='text-content-muted text-sm'>
          Brief Discovery/Concept/Assets sẽ được map sang AI-Insights — không
          cần nhập lại từ đầu. Mục còn trống AI vẫn chạy được nhưng kết quả kém
          sắc hơn.
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
          Đã điền {filled}/{coverage.length} mục · mỗi lần chạy tốn credits (5–8
          lượt gọi AI).
        </p>

        {existingReportId && (
          <p className='text-xs'>
            Campaign này đã có report:{' '}
            <Link
              href={`/portal/insights/${existingReportId}`}
              className='text-primary hover:underline'
            >
              xem kết quả →
            </Link>{' '}
            (chạy lại sẽ tạo report mới)
          </p>
        )}

        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            Huỷ
          </Button>
          <Button onClick={handleRun} disabled={running}>
            {running ? 'Đang tạo…' : 'Chạy AI-Insights'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
