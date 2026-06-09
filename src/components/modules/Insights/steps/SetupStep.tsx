'use client';

import { useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';

import { rexerApi } from '@/services/rexer/endpoints';
import { useRexer } from '@/services/rexer/use-rexer';
import type { CreateInsightReportBody } from '@/services/rexer/types';
import { Button } from '@/components/atoms/button';
import { Input } from '@/components/atoms/input';
import { Label } from '@/components/atoms/label';
import { Spinner } from '@/components/atoms/spinner';
import { cn } from '@/lib/cn';

/**
 * Màn Setup của wizard AI-Insights (form có cấu trúc, KHÔNG chatbot).
 *
 * Người dùng chọn workspace (bắt buộc) + product/campaign (tùy chọn) bằng đúng
 * các selector quen thuộc của CMS. Mỗi lần đổi lựa chọn, ta gọi `insights.prefill`
 * để BE resolve context DB và trả về `missing_fields` — các field chiến lược
 * không có sẵn trong DB. FE chỉ render input cho đúng những field còn thiếu đó.
 *
 * - `brandLocked=true` (portal): chỉ có brand của user → ta tự chọn sẵn workspace
 *   mặc định (hoặc workspace đầu tiên) để khớp thói quen, đỡ một bước chọn tay.
 * - `brandLocked=false` (admin): không có active workspace duy nhất → user phải
 *   chọn workspace tường minh, không auto-select.
 */
export interface SetupStepProps {
  submitting: boolean;
  onRun: (body: CreateInsightReportBody) => void;
  brandLocked: boolean;
}

export function SetupStep({ submitting, onRun, brandLocked }: SetupStepProps) {
  const t = useTranslations('insights');

  const [workspaceId, setWorkspaceId] = useState('');
  const [productId, setProductId] = useState('');
  const [campaignId, setCampaignId] = useState('');
  const [missing, setMissing] = useState<string[]>([]);
  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [prefilling, setPrefilling] = useState(false);

  // Danh sách workspace user thuộc về (đúng nguồn workspace switcher dùng).
  const workspaces = useRexer(() => rexerApi.workspaces.myMemberships(), []);
  // Product/campaign scope theo brand → chỉ load khi đã chọn workspace.
  const products = useRexer(
    () =>
      workspaceId
        ? rexerApi.products.list({ limit: 100 })
        : Promise.resolve(null),
    [workspaceId]
  );
  const campaigns = useRexer(
    () =>
      workspaceId
        ? rexerApi.campaigns.list({
            product_id: productId || undefined,
            limit: 100,
          })
        : Promise.resolve(null),
    [workspaceId, productId]
  );

  const workspaceItems = useMemo(
    () => (workspaces.data ?? []).map(m => m.workspace),
    [workspaces.data]
  );

  // Portal: tự chọn workspace mặc định (hoặc đầu tiên) khi danh sách sẵn sàng.
  useEffect(() => {
    if (!brandLocked || workspaceId || workspaceItems.length === 0) return;
    const preferred =
      workspaceItems.find(w => w.is_default) ?? workspaceItems[0];
    if (preferred) setWorkspaceId(preferred.id);
  }, [brandLocked, workspaceId, workspaceItems]);

  // Đổi product → reset campaign vì campaign được lọc theo product.
  useEffect(() => {
    setCampaignId('');
  }, [productId]);

  // Mỗi khi bộ chọn đổi: gọi prefill, lấy danh sách field còn thiếu.
  useEffect(() => {
    if (!workspaceId) {
      setMissing([]);
      return;
    }
    let alive = true;
    setPrefilling(true);
    rexerApi.insights
      .prefill({
        workspace_id: workspaceId,
        product_id: productId || undefined,
        campaign_id: campaignId || undefined,
      })
      .then(r => {
        if (!alive) return;
        setMissing(r.missing_fields);
        // Bỏ giá trị đã nhập cho field không còn thiếu nữa.
        setInputs(prev => {
          const next: Record<string, string> = {};
          for (const f of r.missing_fields) if (prev[f]) next[f] = prev[f];
          return next;
        });
      })
      .catch(() => {
        if (alive) setMissing([]);
      })
      .finally(() => {
        if (alive) setPrefilling(false);
      });
    return () => {
      alive = false;
    };
  }, [workspaceId, productId, campaignId]);

  const canRun =
    !!workspaceId &&
    !prefilling &&
    !submitting &&
    missing.every(f => inputs[f]?.trim());

  // Label cho field còn thiếu: ưu tiên copy i18n, fallback về chính key.
  function fieldLabel(f: string): string {
    const key = `fields.${f}`;
    const label = t(key);
    return label === key ? f : label;
  }

  const selectClass =
    'border-border text-content-muted hover:bg-muted focus:border-zinc-400 ' +
    'w-full appearance-none rounded-lg border bg-white px-3 py-2 text-sm outline-none ' +
    'disabled:cursor-not-allowed disabled:opacity-50';

  return (
    <div className='space-y-6'>
      <header className='space-y-1'>
        <h1 className='text-2xl font-semibold'>{t('title')}</h1>
        <p className='text-content-muted'>{t('subtitle')}</p>
      </header>

      <section className='space-y-4'>
        <h2 className='font-medium'>{t('setup.heading')}</h2>

        <div className='space-y-1.5'>
          <Label htmlFor='insights-workspace'>{t('setup.workspace')}</Label>
          <select
            id='insights-workspace'
            value={workspaceId}
            onChange={e => setWorkspaceId(e.target.value)}
            disabled={workspaces.loading}
            className={selectClass}
          >
            <option value=''>—</option>
            {workspaceItems.map(w => (
              <option key={w.id} value={w.id}>
                {w.name}
              </option>
            ))}
          </select>
        </div>

        <div className='space-y-1.5'>
          <Label htmlFor='insights-product'>{t('setup.product')}</Label>
          <select
            id='insights-product'
            value={productId}
            onChange={e => setProductId(e.target.value)}
            disabled={!workspaceId || products.loading}
            className={selectClass}
          >
            <option value=''>—</option>
            {(products.data?.items ?? []).map(p => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        <div className='space-y-1.5'>
          <Label htmlFor='insights-campaign'>{t('setup.campaign')}</Label>
          <select
            id='insights-campaign'
            value={campaignId}
            onChange={e => setCampaignId(e.target.value)}
            disabled={!workspaceId || campaigns.loading}
            className={selectClass}
          >
            <option value=''>—</option>
            {(campaigns.data?.items ?? []).map(c => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </section>

      {(prefilling || missing.length > 0) && (
        <section className='space-y-4'>
          <h2 className='flex items-center gap-2 font-medium'>
            {t('setup.missingHeading')}
            {prefilling && <Spinner size={14} />}
          </h2>
          {missing.map(f => (
            <div key={f} className='space-y-1.5'>
              <Label htmlFor={`insights-gap-${f}`}>{fieldLabel(f)}</Label>
              <Input
                id={`insights-gap-${f}`}
                value={inputs[f] ?? ''}
                onChange={e =>
                  setInputs(prev => ({ ...prev, [f]: e.target.value }))
                }
              />
            </div>
          ))}
        </section>
      )}

      <Button
        type='button'
        disabled={!canRun}
        onClick={() =>
          onRun({
            workspace_id: workspaceId,
            product_id: productId || undefined,
            campaign_id: campaignId || undefined,
            inputs,
          })
        }
        className={cn(submitting && 'pointer-events-none')}
      >
        {submitting && <Spinner size={16} />}
        {t('setup.run')}
      </Button>
    </div>
  );
}
