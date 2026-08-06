'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useMemo, useRef, useState } from 'react';

import { AutomationHub } from '@/components/organisms/portal-v2/automation/AutomationHub';
import { MasterSetupStep } from '@/components/organisms/portal-v2/automation/MasterSetupStep';
import { ProductPickStep } from '@/components/organisms/portal-v2/automation/ProductPickStep';
import { cn } from '@/lib/cn';
import {
  commitMasterTemplate,
  createMasterDraft,
  dropMasterDraft,
  masterCanvasHref,
  templateIdOfExperience,
} from '@/services/portal-v2/automationMaster';
import {
  AUTOMATION_BATCH_CAP,
  runAutomation,
  type RunOutcome,
  type RunProgress,
} from '@/services/portal-v2/automationRun';
import { toAutomationExperience } from '@/lib/portal-v2/automation/fromExperience';
import { toAutomationProduct } from '@/lib/portal-v2/automation/fromProduct';
import type { ExperienceView } from '@/lib/portal-v2/experiences/types';
import type { CampaignView } from '@/lib/portal-v2/campaigns/types';
import type { Product, ProductAsset } from '@/lib/portal-v2/product/types';
import { eligibleProducts } from '@/lib/portal-v2/automation/readiness';
import type { AutomationStage } from '@/lib/portal-v2/automation/types';

/**
 * Automation workspace — hub khi rảnh, wizard 2 bước khi đang nhân bản.
 *
 * Khác Brand ở chỗ đây KHÔNG phải form có tab: nó là một luồng có chặng, nên
 * chrome dùng stepper thay cho `Tabs`, và không có cặp Edit/Save. Hành động
 * duy nhất tạo ra dữ liệu là Automate ở cuối bước 2.
 *
 * P0: Automate in payload ra `alert` thay vì gọi API. Payload mang theo GAP của
 * từng sản phẩm — bản ghi phải phản ánh đúng thứ thiếu, không làm tròn cho đẹp.
 */
type AutomationWorkspaceProps = {
  /** Trải nghiệm THẬT — `GET /pages?type=landing&status=published`, lọc `proven`. */
  initialExperiences: ExperienceView[];
  /** Catalogue THẬT — `GET /products?is_template=false`. */
  initialProducts: Product[];
  /** Asset của catalogue, dùng cho ô EXP (đếm ảnh của từng sản phẩm). */
  initialAssets: ProductAsset[];
  /** Chiến dịch THẬT — `GET /campaigns`. */
  initialCampaigns: CampaignView[];
  initialError: string | null;
};

export const AutomationWorkspace = ({
  initialExperiences,
  initialProducts,
  initialAssets,
  initialCampaigns,
  initialError,
}: AutomationWorkspaceProps) => {
  const t = useTranslations('portalV2.automation');
  const router = useRouter();

  const experiences = useMemo(
    () => initialExperiences.map(toAutomationExperience),
    [initialExperiences]
  );
  const products = useMemo(
    () => initialProducts.map(p => toAutomationProduct(p, initialAssets)),
    [initialProducts, initialAssets]
  );
  const campaigns = useMemo(
    () => initialCampaigns.map(c => ({ id: c.id, name: c.name })),
    [initialCampaigns]
  );

  const [stage, setStage] = useState<AutomationStage>('hub');
  const [experienceId, setExperienceId] = useState<string | null>(null);
  // Catalogue có thể rỗng ⇒ không dùng `[0]!`. Chọn mặc định sau khi có dữ liệu.
  const [setupProductId, setSetupProductId] = useState<string>(
    () => initialProducts[0]?.id ?? ''
  );
  const [campaignId, setCampaignId] = useState<string>(
    () => initialCampaigns[0]?.id ?? ''
  );
  const [widen, setWiden] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [masterBusy, setMasterBusy] = useState(false);
  const [masterError, setMasterError] = useState<string | null>(null);
  const [progress, setProgress] = useState<RunProgress | null>(null);
  const [outcomes, setOutcomes] = useState<RunOutcome[] | null>(null);
  const [runError, setRunError] = useState<string | null>(null);
  const runningRef = useRef(false);

  /**
   * Master đã dựng, khoá theo cặp (thiết kế × sản phẩm gốc).
   *
   * Giữ lại để bấm "Chỉnh master" lần hai KHÔNG tạo thêm một nháp nữa — bấm
   * nhiều lần mà lần nào cũng tạo page mới thì workspace ngập nháp mồ côi.
   */
  const masterRef = useRef<{
    key: string;
    pageId: string;
    href: string;
  } | null>(null);

  const experience = useMemo(
    () => experiences.find(x => x.id === experienceId),
    [experiences, experienceId]
  );
  const masterProduct = useMemo(
    () => products.find(p => p.id === setupProductId),
    [products, setupProductId]
  );
  const eligible = useMemo(
    () => eligibleProducts(products, masterProduct, widen),
    [products, masterProduct, widen]
  );

  const handleStart = (id: string) => {
    setExperienceId(id);
    setSelected([]);
    setWiden(false);
    setStage('setup');
  };

  const handleCancel = () => {
    setExperienceId(null);
    setSelected([]);
    setStage('hub');
  };

  const handleToggle = (id: string) => {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  // Đổi sản phẩm gốc ⇒ lớp có thể đổi theo ⇒ danh sách đã chọn không còn hợp lệ.
  const handleSetupProductChange = (id: string) => {
    setSetupProductId(id);
    setSelected([]);
  };

  const handleAdjust = async () => {
    if (!experience || !masterProduct || masterBusy) return;

    const key = `${experience.id}:${masterProduct.id}`;
    const cached = masterRef.current;

    // Cùng cặp thiết kế × sản phẩm ⇒ mở lại đúng bản nháp cũ.
    if (cached?.key === key) {
      router.push(cached.href);
      return;
    }

    setMasterBusy(true);
    setMasterError(null);
    try {
      // Đổi sản phẩm ⇒ master cũ không còn đúng ⇒ lưu trữ nó đi.
      if (cached) void dropMasterDraft(cached.pageId);

      const page = await createMasterDraft({
        experienceId: experience.id,
        experienceName: experience.name,
        productTitle: masterProduct.title,
      });
      const href = masterCanvasHref(page);
      masterRef.current = { key, pageId: page.id, href };
      router.push(href);
    } catch (err) {
      setMasterError(
        err instanceof Error && err.message === 'MASTER_NO_TEMPLATE'
          ? t('masterNoTemplate')
          : t('masterFailed')
      );
    } finally {
      setMasterBusy(false);
    }
  };

  const handleRun = async () => {
    if (!experience || !masterProduct || runningRef.current) return;
    runningRef.current = true;
    setRunError(null);
    setOutcomes(null);

    try {
      const { templateId, workspaceId } = await templateIdOfExperience(
        experience.id
      );

      // Master đã chỉnh ⇒ đóng bản chỉnh thành template rồi nhân từ ĐÓ. Chưa
      // chỉnh gì ⇒ dùng thẳng template gốc, khỏi dựng thêm bản ghi thừa.
      const cached = masterRef.current;
      const committed = cached
        ? await commitMasterTemplate({
            masterPageId: cached.pageId,
            name: `${experience.name} — master`,
          })
        : null;

      const queue = products.filter(p => selected.includes(p.id));
      const results = await runAutomation({
        workspaceId,
        sourceTemplateId: committed ?? templateId,
        experienceName: experience.name,
        products: queue,
        onProgress: setProgress,
      });
      setOutcomes(results);
    } catch (err) {
      setRunError(
        err instanceof Error && err.message === 'MASTER_NO_TEMPLATE'
          ? t('masterNoTemplate')
          : t('runFailed')
      );
    } finally {
      setProgress(null);
      runningRef.current = false;
    }
  };

  const steps: { id: AutomationStage; label: string }[] = [
    { id: 'setup', label: t('step1') },
    { id: 'pick', label: t('step2') },
  ];

  const subtitle =
    stage === 'hub'
      ? t('hubDesc')
      : stage === 'setup'
        ? t('setupDesc')
        : t('pickDesc', { master: masterProduct?.title ?? '—' });

  return (
    <div className='flex min-h-0 flex-col'>
      <div className='pv2-page-header'>
        <div className='mx-auto flex w-full flex-wrap items-end justify-between gap-4 px-5 pt-6 pb-4 md:px-8'>
          <div className='min-w-0'>
            <h1 className='font-[family-name:var(--pv2-disp)] text-[1.625rem] font-bold tracking-[-0.03em] text-[var(--pv2-ink)] md:text-[1.75rem]'>
              {stage === 'hub'
                ? t('title')
                : t('titleRunning', { name: experience?.name ?? '' })}
            </h1>
            <p className='mt-1 max-w-[640px] text-[13.5px] leading-relaxed text-[var(--pv2-mut)]'>
              {subtitle}
            </p>
          </div>
        </div>
      </div>

      <div className='mx-auto w-full px-5 py-6 md:px-8'>
        {stage !== 'hub' ? (
          <div className='mb-5 flex items-center gap-2'>
            {steps.map((s, i) => (
              <span key={s.id} className='flex items-center gap-2'>
                {i > 0 ? (
                  <span aria-hidden className='h-px w-6 bg-[var(--pv2-hair)]' />
                ) : null}
                <span
                  className={cn(
                    'flex items-center gap-1.5 text-[12.5px]',
                    stage === s.id
                      ? 'font-semibold text-[var(--pv2-ink)]'
                      : 'text-[var(--pv2-faint)]'
                  )}
                >
                  <span
                    className={cn(
                      'flex size-[18px] items-center justify-center rounded-full text-[10.5px] font-bold',
                      stage === s.id
                        ? 'bg-[var(--pv2-electric)] text-[var(--pv2-paper)]'
                        : 'bg-[var(--pv2-canvas)] text-[var(--pv2-faint)]'
                    )}
                  >
                    {i + 1}
                  </span>
                  {s.label}
                </span>
              </span>
            ))}
          </div>
        ) : null}

        {stage === 'hub' ? (
          <AutomationHub
            experiences={experiences}
            error={initialError}
            onStart={handleStart}
          />
        ) : null}

        {stage === 'setup' && experience ? (
          <MasterSetupStep
            experience={experience}
            products={products}
            campaigns={campaigns}
            setupProductId={setupProductId}
            campaignId={campaignId}
            onSetupProductChange={handleSetupProductChange}
            onCampaignChange={setCampaignId}
            onAdjust={handleAdjust}
            adjustBusy={masterBusy}
            adjustError={masterError}
            onCancel={handleCancel}
            onNext={() => setStage('pick')}
          />
        ) : null}

        {stage === 'pick' && experience && masterProduct ? (
          <ProductPickStep
            experience={experience}
            masterProduct={masterProduct}
            eligible={eligible.items}
            unclassified={eligible.unclassified}
            selected={selected}
            widen={widen}
            onToggle={handleToggle}
            onToggleWiden={() => setWiden(v => !v)}
            onBack={() => setStage('setup')}
            onRun={handleRun}
            cap={AUTOMATION_BATCH_CAP}
            progress={progress}
            outcomes={outcomes}
            runError={runError}
            running={runningRef.current}
          />
        ) : null}
      </div>
    </div>
  );
};
