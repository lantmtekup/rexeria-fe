'use client';

/**
 * AI-Automation — demo "nhân 1 trải nghiệm đã duyệt ra nhiều sản phẩm".
 *
 * Trang riêng trong portal (`/portal/ai-automation`). Orchestrator: state +
 * gọi BE (async job), UI đẩy xuống StepSetup / StepRunning / StepResults.
 *   ① apply-product (new_page) / sản phẩm → poll `GET /ai/jobs/{id}`
 *   ② multi-channel-adapt: 1 landing → biến thể kênh
 * Engine: BE thật. Spec: docs/be-ai-automation-spec.md.
 */
import * as React from 'react';
import { useRouter } from 'next/navigation';

import { rexerApi } from '@/services/rexer/endpoints';
import type {
  AIApplyProductOutput,
  AIChannel,
  AIMultiChannelOutput,
  Product,
  Template,
  Workspace,
} from '@/services/rexer/types';

import { WizardHeader } from './_bits';
import { PREVIEW_HREF, type RunItem, type Step } from './_shared';
import { pollAiJob } from './pollAiJob';
import { StepResults } from './StepResults';
import { StepRunning } from './StepRunning';
import { StepSetup } from './StepSetup';

export function AiAutomation() {
  const router = useRouter();

  const [templates, setTemplates] = React.useState<Template[]>([]);
  const [products, setProducts] = React.useState<Product[]>([]);
  const [workspaces, setWorkspaces] = React.useState<Workspace[]>([]);
  const [loading, setLoading] = React.useState(true);

  const [templateId, setTemplateId] = React.useState('');
  const [workspaceId, setWorkspaceId] = React.useState('');
  const [productIds, setProductIds] = React.useState<Set<string>>(new Set());
  const [brief, setBrief] = React.useState('');

  const [step, setStep] = React.useState<Step>('setup');
  const [runItems, setRunItems] = React.useState<RunItem[]>([]);

  const [mcPageId, setMcPageId] = React.useState('');
  const [mcChannels, setMcChannels] = React.useState<Set<AIChannel>>(
    new Set(['ad', 'email'])
  );
  const [mcRunning, setMcRunning] = React.useState(false);
  const [mcResult, setMcResult] = React.useState<AIMultiChannelOutput | null>(
    null
  );

  React.useEffect(() => {
    let alive = true;
    (async () => {
      const [tpl, prod, ws] = await Promise.all([
        rexerApi.templates
          .list({ status: 'active', limit: 50 })
          .then(r => r.items ?? [])
          .catch(() => []),
        rexerApi.products
          .list({ limit: 50 })
          .then(r => r.items ?? [])
          .catch(() => []),
        rexerApi.workspaces
          .myMemberships()
          .then(r => (r ?? []).map(m => m.workspace))
          .catch(() => []),
      ]);
      if (!alive) return;
      setTemplates(tpl);
      setProducts(prod);
      setWorkspaces(ws);
      if (tpl[0]) setTemplateId(tpl[0].id);
      if (ws[0]) setWorkspaceId(ws[0].id);
      setLoading(false);
    })();
    return () => {
      alive = false;
    };
  }, []);

  const selectedProducts = React.useMemo(
    () => products.filter(p => productIds.has(p.id)),
    [products, productIds]
  );
  const canRun = !!templateId && !!workspaceId && productIds.size > 0;

  const toggleProduct = (id: string) =>
    setProductIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const updateItem = (productId: string, patch: Partial<RunItem>) =>
    setRunItems(prev =>
      prev.map(it => (it.productId === productId ? { ...it, ...patch } : it))
    );

  const runAutomation = async () => {
    setRunItems(
      selectedProducts.map(p => ({
        productId: p.id,
        productName: p.name,
        status: 'enqueuing',
      }))
    );
    setStep('running');

    await Promise.all(
      selectedProducts.map(async p => {
        try {
          const job = await rexerApi.aiJobs.applyProduct({
            product_id: p.id,
            target_mode: 'new_page',
            template_id: templateId,
            workspace_id: workspaceId,
            page_name: p.name,
            lang: 'vi',
            brief: brief.trim() || undefined,
          });
          updateItem(p.id, { status: job.status, jobId: job.id });
          const final = await pollAiJob(job.id, {
            onTick: j => updateItem(p.id, { status: j.status }),
          });
          if (final.status === 'succeeded') {
            updateItem(p.id, {
              status: 'succeeded',
              output: final.output_payload as unknown as AIApplyProductOutput,
            });
          } else {
            updateItem(p.id, {
              status: 'failed',
              error: final.error_message ?? 'Job thất bại',
            });
          }
        } catch (e) {
          updateItem(p.id, {
            status: 'failed',
            error: e instanceof Error ? e.message : 'Lỗi không xác định',
          });
        }
      })
    );
    setStep('results');
  };

  const runMultiChannel = async () => {
    if (!mcPageId || mcChannels.size === 0) return;
    setMcRunning(true);
    setMcResult(null);
    try {
      const job = await rexerApi.aiJobs.multiChannelAdapt({
        source_page_id: mcPageId,
        channels: [...mcChannels],
        lang: 'vi',
      });
      const final = await pollAiJob(job.id);
      if (final.status === 'succeeded') {
        setMcResult(final.output_payload as unknown as AIMultiChannelOutput);
      }
    } finally {
      setMcRunning(false);
    }
  };

  const succeeded = runItems.filter(
    it => it.status === 'succeeded' && it.output
  );
  const view = (id: string) => router.push(PREVIEW_HREF(id));

  return (
    <div className='mx-auto w-full max-w-5xl'>
      <WizardHeader step={step} />

      {step === 'setup' && (
        <StepSetup
          loading={loading}
          templates={templates}
          products={products}
          workspaces={workspaces}
          templateId={templateId}
          setTemplateId={setTemplateId}
          workspaceId={workspaceId}
          setWorkspaceId={setWorkspaceId}
          productIds={productIds}
          toggleProduct={toggleProduct}
          brief={brief}
          setBrief={setBrief}
          canRun={canRun}
          onRun={runAutomation}
        />
      )}

      {step === 'running' && <StepRunning items={runItems} />}

      {step === 'results' && (
        <StepResults
          items={runItems}
          succeeded={succeeded}
          onView={view}
          onRestart={() => {
            setStep('setup');
            setRunItems([]);
            setMcResult(null);
            setMcPageId('');
          }}
          mcPageId={mcPageId}
          setMcPageId={setMcPageId}
          mcChannels={mcChannels}
          setMcChannels={setMcChannels}
          mcRunning={mcRunning}
          mcResult={mcResult}
          onMultiChannel={runMultiChannel}
        />
      )}
    </div>
  );
}
