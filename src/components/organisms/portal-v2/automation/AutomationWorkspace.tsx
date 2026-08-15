'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';

import { AutomationHub } from '@/components/organisms/portal-v2/automation/AutomationHub';
import { BriefReviewStep } from '@/components/organisms/portal-v2/automation/BriefReviewStep';
import { MasterSetupStep } from '@/components/organisms/portal-v2/automation/MasterSetupStep';
import { ProductPickStep } from '@/components/organisms/portal-v2/automation/ProductPickStep';
import { cn } from '@/lib/cn';
import {
  buildBrandBrief,
  resolveBrandLogoUrl,
} from '@/lib/ai-brief/fromBrandProfile';
import {
  buildProductBrief,
  productImageUrls,
} from '@/lib/ai-brief/fromProduct';
import type { AiBrandBrief } from '@/lib/ai-brief/types';
import {
  createAutomation,
  fetchCandidates,
  masterCanvasHrefById,
  runAutomationV2,
} from '@/services/portal-v2/automationV2';
import {
  v2CandidateToProduct,
  v2ExperienceToAutomation,
} from '@/lib/portal-v2/automation/fromV2';
import { toAutomationProduct } from '@/lib/portal-v2/automation/fromProduct';
import type { CampaignOption } from '@/services/portal-v2/campaignOptions';
import type { Product, ProductAsset } from '@/lib/portal-v2/product/types';
import type {
  AutomationProduct,
  AutomationStage,
  Readiness,
} from '@/lib/portal-v2/automation/types';
import type { RxExperience } from '@/services/rexer-v2/types/experience';
import type { RxBrandProfile } from '@/services/rexer-v2/types/brandProfile';
import type {
  RxAutomation,
  RxAutomationBriefPayload,
  RxAutomationRunItem,
  RxAutomationRunSkip,
} from '@/services/rexer-v2/types/automation';

/** Trần mỗi lượt — gương `automationMaxRun` bên BE (`usecase/automation.go`). */
const AUTOMATION_BATCH_CAP = 200;

/**
 * Automation workspace — hub khi rảnh, wizard 2 bước khi đang nhân bản.
 *
 * Khác Brand ở chỗ đây KHÔNG phải form có tab: nó là một luồng có chặng, nên
 * chrome dùng stepper thay cho `Tabs`, và không có cặp Edit/Save.
 *
 * Bốn endpoint v2 làm hết phần nặng — FE không còn tự nối
 * `insights.create → poll → handoff → pages.create` như bản trước, cũng không
 * tự chấm điểm sẵn sàng nữa:
 *
 *   POST /automations                  bước 1, BE tự dựng master draft
 *   GET  /automations/{id}/candidates  bước 2, ứng viên + readiness BE chấm
 *   POST /automations/{id}/run         nhân bản (xếp hàng, worker nền điền)
 */
type AutomationWorkspaceProps = {
  /** Template đã Proven — `GET /automations` (hub). */
  initialExperiences: RxExperience[];
  /** Automation đã tạo, cùng lượt gọi hub — `GET /automations`. */
  initialAutomations: RxAutomation[];
  /** Catalogue THẬT — `GET /products?is_template=false`. */
  initialProducts: Product[];
  /** Asset của catalogue, dùng cho ô EXP (đếm ảnh của từng sản phẩm). */
  initialAssets: ProductAsset[];
  /** Chiến dịch THẬT — `GET /campaigns`. Chỉ cần id + tên cho dropdown. */
  initialCampaigns: CampaignOption[];
  /**
   * Hồ sơ thương hiệu — `GET /brands/{brandId}/profile`. `null` khi chưa xác
   * định được brand (admin chưa chọn) hoặc brand chưa có hồ sơ; bước Brief
   * vẫn chạy được, chỉ là không có logo/màu/font để đưa vào AI.
   */
  initialBrandProfile: RxBrandProfile | null;
  /** 403 CAPABILITY_REQUIRED — gói chưa mở tính năng, KHÔNG phải hỏng. */
  initialLocked: boolean;
  initialError: string | null;
};

export const AutomationWorkspace = ({
  initialExperiences,
  initialAutomations,
  initialProducts,
  initialAssets,
  initialCampaigns,
  initialBrandProfile,
  initialLocked,
  initialError,
}: AutomationWorkspaceProps) => {
  const t = useTranslations('portalV2.automation');
  const router = useRouter();

  const experiences = useMemo(
    () => initialExperiences.map(v2ExperienceToAutomation),
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
  const [selected, setSelected] = useState<string[]>([]);
  const [widen, setWiden] = useState(false);
  const [masterBusy, setMasterBusy] = useState(false);
  const [masterError, setMasterError] = useState<string | null>(null);
  const [candidates, setCandidates] = useState<
    (AutomationProduct & { readiness: Readiness })[]
  >([]);
  const [masterReadiness, setMasterReadiness] = useState<Readiness | null>(
    null
  );
  const [queued, setQueued] = useState<RxAutomationRunItem[] | null>(null);
  const [skipped, setSkipped] = useState<RxAutomationRunSkip[] | null>(null);
  const [runError, setRunError] = useState<string | null>(null);
  const [running, setRunning] = useState(false);
  const [candidatesBusy, setCandidatesBusy] = useState(false);
  const [brandBrief, setBrandBrief] = useState<AiBrandBrief | null>(null);
  const [briefNote, setBriefNote] = useState('');
  const runningRef = useRef(false);

  /**
   * Brief brand cho AI — phần đồng bộ (tên/tagline/tone/màu/font) dựng ngay,
   * logo cần thêm 1 lượt resolve `media_id → URL` nên vá vào sau khi xong.
   */
  useEffect(() => {
    if (!initialBrandProfile) {
      setBrandBrief(null);
      return;
    }
    setBrandBrief(buildBrandBrief(initialBrandProfile));
    let cancelled = false;
    resolveBrandLogoUrl(initialBrandProfile).then(logoUrl => {
      if (!cancelled && logoUrl) {
        setBrandBrief(prev => (prev ? { ...prev, logo_url: logoUrl } : prev));
      }
    });
    return () => {
      cancelled = true;
    };
  }, [initialBrandProfile]);

  /**
   * Automation đã tạo, khoá theo bộ ba (thiết kế × sản phẩm gốc × chiến dịch).
   *
   * Giữ lại để bấm "Chỉnh master" lần hai KHÔNG tạo thêm một automation nữa —
   * lần nào cũng tạo thì workspace ngập nháp mồ côi.
   */
  const autoRef = useRef<{
    key: string;
    id: string;
    masterPageId: string;
  } | null>(null);

  const experience = useMemo(
    () => experiences.find(x => x.id === experienceId),
    [experiences, experienceId]
  );
  const masterProduct = useMemo(
    () => products.find(p => p.id === setupProductId),
    [products, setupProductId]
  );
  const handleStart = (id: string) => {
    setExperienceId(id);
    setSelected([]);
    setWiden(false);
    setQueued(null);
    setBriefNote('');
    setStage('setup');
  };

  const handleCancel = () => {
    setExperienceId(null);
    setSelected([]);
    setBriefNote('');
    setStage('hub');
  };

  const handleToggle = (id: string) => {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  // Đổi sản phẩm gốc ⇒ ứng viên BE trả sẽ khác ⇒ lựa chọn cũ không còn hợp lệ.
  const handleSetupProductChange = (id: string) => {
    setSetupProductId(id);
    setSelected([]);
    setCandidates([]);
  };

  /**
   * Tạo automation nếu bộ ba đã đổi, còn không thì dùng lại bản cũ.
   *
   * BE fork master draft ngay trong `POST /automations` và trả `master_page_id`
   * — không cần bước dựng page riêng như bản ghép tay trước đây.
   */
  const ensureAutomation = async () => {
    if (!experience || !masterProduct) return null;
    const key = `${experience.id}:${masterProduct.id}:${campaignId}`;
    if (autoRef.current?.key === key) return autoRef.current;

    const res = await createAutomation({
      sourceExperienceId: experience.id,
      setupProductId: masterProduct.id,
      campaignId,
    });
    autoRef.current = { key, id: res.id, masterPageId: res.master_page_id };
    return autoRef.current;
  };

  const handleAdjust = async () => {
    if (masterBusy) return;
    setMasterBusy(true);
    setMasterError(null);
    try {
      const auto = await ensureAutomation();
      if (auto) router.push(masterCanvasHrefById(auto.masterPageId));
    } catch {
      setMasterError(t('masterFailed'));
    } finally {
      setMasterBusy(false);
    }
  };

  /**
   * Nạp ứng viên. BE trả CẢ sản phẩm gốc trong danh sách — loại nó ở đây vì
   * bước 2 đã vẽ nó riêng thành thẻ master.
   */
  const loadCandidates = async (automationId: string, wide: boolean) => {
    const all = (await fetchCandidates(automationId, wide)).map(
      v2CandidateToProduct
    );
    setMasterReadiness(
      all.find(p => p.id === setupProductId)?.readiness ?? null
    );
    return all.filter(p => p.id !== setupProductId);
  };

  /**
   * Sang bước 2 — tạo automation rồi hỏi BE ứng viên.
   *
   * Nạp ứng viên TRƯỚC khi đổi chặng: sang màn rồi mới báo lỗi thì người dùng
   * đứng trước một danh sách rỗng không rõ vì sao.
   */
  const handleNext = async () => {
    if (masterBusy) return;
    setMasterBusy(true);
    setMasterError(null);
    try {
      const auto = await ensureAutomation();
      if (!auto) return;
      setCandidates(await loadCandidates(auto.id, widen));
      setQueued(null);
      setStage('pick');
    } catch {
      setMasterError(t('masterFailed'));
    } finally {
      setMasterBusy(false);
    }
  };

  /**
   * Nới lớp — hỏi lại BE chứ không lọc rộng ra ở FE. `core.CategoryMatches` là
   * nơi giữ luật; đoán lại ở đây là cách hai bên lệch nhau.
   */
  const handleToggleWiden = async () => {
    const auto = autoRef.current;
    if (!auto || candidatesBusy) return;
    const next = !widen;
    setCandidatesBusy(true);
    setRunError(null);
    try {
      const items = await loadCandidates(auto.id, next);
      setCandidates(items);
      setWiden(next);
      // Thu lớp lại làm rơi bớt ứng viên ⇒ bỏ tick những id không còn trong
      // danh sách, nếu không sẽ gửi lên BE id đã biến mất khỏi màn hình.
      const live = new Set(items.map(p => p.id));
      setSelected(prev => prev.filter(id => live.has(id)));
    } catch (err) {
      setRunError(err instanceof Error ? err.message : t('runFailed'));
    } finally {
      setCandidatesBusy(false);
    }
  };

  /**
   * Nhân bản — MỘT request, BE fork page rồi giao worker nền điền nội dung.
   *
   * Không có tiến trình từng sản phẩm để hiện, và cũng không có nội dung tại
   * thời điểm trả về: kết quả là "đã xếp hàng", không phải "đã xong".
   *
   * `inputs` (brand + product + ảnh) là brief cho AI, gói cùng lượt run —
   * OPTIONAL, BE chưa xác nhận nhận field này nên thiếu vẫn chạy được, chỉ
   * mất phần "hiểu brand/sản phẩm".
   */
  const handleRun = async () => {
    const auto = autoRef.current;
    if (!auto || runningRef.current || !masterProduct) return;
    runningRef.current = true;
    setRunning(true);
    setRunError(null);
    setQueued(null);
    setSkipped(null);

    const assetItems = [
      ...(brandBrief?.logo_url ? [brandBrief.logo_url] : []),
      ...productImageUrls(initialAssets, masterProduct.id),
    ];
    const inputs: RxAutomationBriefPayload = {
      ...(brandBrief ? { brand: brandBrief } : {}),
      product: buildProductBrief(masterProduct),
      ...(assetItems.length ? { assets: { items: assetItems } } : {}),
      ...(briefNote.trim() ? { note: briefNote.trim() } : {}),
    };

    try {
      const res = await runAutomationV2(
        auto.id,
        selected.slice(0, AUTOMATION_BATCH_CAP),
        inputs
      );
      setQueued(res.created);
      setSkipped(res.skipped);
    } catch (err) {
      setRunError(err instanceof Error ? err.message : t('runFailed'));
    } finally {
      runningRef.current = false;
      setRunning(false);
    }
  };

  const steps: { id: AutomationStage; label: string }[] = [
    { id: 'setup', label: t('step1') },
    { id: 'pick', label: t('step2') },
    { id: 'brief', label: t('step3') },
  ];

  const selectedProducts = useMemo(
    () => candidates.filter(p => selected.includes(p.id)),
    [candidates, selected]
  );

  const subtitle =
    stage === 'hub'
      ? t('hubDesc')
      : stage === 'setup'
        ? t('setupDesc')
        : stage === 'pick'
          ? t('pickDesc', { master: masterProduct?.title ?? '—' })
          : t('briefDesc');

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
            runs={initialAutomations}
            products={products}
            locked={initialLocked}
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
            onNext={handleNext}
          />
        ) : null}

        {stage === 'pick' && experience && masterProduct ? (
          <ProductPickStep
            masterProduct={masterProduct}
            masterReadiness={masterReadiness}
            eligible={candidates}
            selected={selected}
            widen={widen}
            onToggleWiden={handleToggleWiden}
            candidatesBusy={candidatesBusy}
            onToggle={handleToggle}
            onBack={() => setStage('setup')}
            onNext={() => setStage('brief')}
            cap={AUTOMATION_BATCH_CAP}
          />
        ) : null}

        {stage === 'brief' && experience && masterProduct ? (
          <BriefReviewStep
            masterProduct={masterProduct}
            selectedProducts={selectedProducts}
            brandBrief={brandBrief}
            note={briefNote}
            onNoteChange={setBriefNote}
            onBack={() => setStage('pick')}
            onRun={handleRun}
            cap={AUTOMATION_BATCH_CAP}
            queued={queued}
            skipped={skipped}
            runError={runError}
            running={running}
          />
        ) : null}
      </div>
    </div>
  );
};
