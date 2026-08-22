'use client';

import { Check, ChevronRight, Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

import { Button } from '@/components/molecules/portal-v2/Button';
import { Modal } from '@/components/molecules/portal-v2/Modal';
import {
  fetchUseCampaigns,
  fetchUseItems,
  type ForkTarget,
  type UseTargetCampaign,
  type UseTargetItem,
} from '@/services/portal-v2/experienceUse';
import type { ExperienceView } from '@/lib/portal-v2/experiences/types';
import { cn } from '@/lib/cn';

type UseExperienceModalProps = {
  experience: ExperienceView;
  brandId: string | null;
  onClose: () => void;
  /** `target` null = lấy một bản của mình. Ném lỗi ra để modal hiện nguyên văn của BE. */
  onConfirm: (target: ForkTarget) => Promise<void>;
};

/**
 * Lấy một bản của mình — và, nếu muốn, nộp luôn vào một chiến dịch.
 *
 * Mặc định là LẤY BẢN VỀ SỬA: người dùng xem thư viện, thấy ưng, lấy một bản,
 * sửa nội dung, xong xuôi mới quyết dùng cho chiến dịch nào. Gắn chiến dịch
 * ngay tại đây chỉ là đường tắt cho người đang đứng sẵn trong một chiến dịch —
 * nên nó nằm sau một công tắc, không chắn đường.
 *
 * Phần chọn hạng mục dựng hai bước chứ không một danh sách phẳng: hạng mục phải
 * gọi riêng (`GET /campaigns/{id}/items`), nạp hết cho mọi chiến dịch là N
 * request cho một lần mở hộp.
 */
export const UseExperienceModal = ({
  experience,
  brandId,
  onClose,
  onConfirm,
}: UseExperienceModalProps) => {
  const t = useTranslations('portalV2.experiences');

  const [campaigns, setCampaigns] = useState<UseTargetCampaign[] | null>(null);
  const [campaignId, setCampaignId] = useState<string | null>(null);
  const [items, setItems] = useState<UseTargetItem[] | null>(null);
  const [itemId, setItemId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  /** Bật thì mới hỏi chiến dịch — mặc định tắt, vì đó là quyết định để sau. */
  const [attach, setAttach] = useState(false);

  useEffect(() => {
    let alive = true;
    void fetchUseCampaigns(brandId).then(res => {
      if (!alive) return;
      setCampaigns(res.campaigns);
      if (res.error) setError(res.error);
    });
    return () => {
      alive = false;
    };
  }, [brandId]);

  useEffect(() => {
    if (!campaignId) {
      setItems(null);
      return;
    }
    let alive = true;
    setItems(null);
    setItemId(null);
    void fetchUseItems(campaignId, brandId).then(res => {
      if (!alive) return;
      setItems(res.items);
      if (res.error) setError(res.error);
    });
    return () => {
      alive = false;
    };
  }, [campaignId, brandId]);

  const selectedItem = items?.find(i => i.id === itemId) ?? null;
  /* Fork idempotent theo (origin, item): hạng mục đã có bản copy của chính
     trải nghiệm gốc này thì bấm nữa chỉ nhận lại bản cũ. Nói trước, đừng để
     người dùng tưởng vừa tạo ra cái mới. */
  const alreadyForked =
    selectedItem?.originIds.includes(experience.id) ?? false;

  const ready = !attach || (Boolean(campaignId) && Boolean(itemId));

  const handleConfirm = async () => {
    if (!ready || pending) return;
    setPending(true);
    setError(null);
    try {
      await onConfirm(
        attach && campaignId && itemId ? { campaignId, itemId } : null
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : t('useFailed'));
    } finally {
      setPending(false);
    }
  };

  const Row = ({
    selected,
    onClick,
    title,
    sub,
    tail,
  }: {
    selected: boolean;
    onClick: () => void;
    title: string;
    sub: string;
    tail?: React.ReactNode;
  }) => (
    <button
      type='button'
      onClick={onClick}
      className={cn(
        'flex w-full items-center gap-3 rounded-[var(--pv2-r)] border px-3 py-2.5 text-left transition-colors',
        selected
          ? 'border-[var(--pv2-electric)] bg-[var(--pv2-electric-soft)]'
          : 'border-[var(--pv2-hair)] hover:bg-[var(--pv2-canvas)]'
      )}
    >
      <span className='min-w-0 flex-1'>
        <span className='block truncate text-[13px] font-semibold text-[var(--pv2-ink)]'>
          {title}
        </span>
        <span className='block truncate text-[11.5px] text-[var(--pv2-mut)]'>
          {sub}
        </span>
      </span>
      {tail}
      {selected ? (
        <Check
          className='size-4 shrink-0 text-[var(--pv2-electric)]'
          strokeWidth={2.4}
          aria-hidden
        />
      ) : (
        <ChevronRight
          className='size-4 shrink-0 text-[var(--pv2-faint)]'
          strokeWidth={2}
          aria-hidden
        />
      )}
    </button>
  );

  return (
    <Modal
      open
      onClose={onClose}
      title={t('useTitle')}
      subtitle={t('useSubtitle', { name: experience.name })}
      footer={
        <>
          <Button variant='ghost' size='sm' onClick={onClose}>
            {t('close')}
          </Button>
          <span className='flex-1' />
          <Button
            size='sm'
            disabled={!ready || pending}
            onClick={() => void handleConfirm()}
          >
            {pending ? (
              <Loader2 className='size-3.5 animate-spin' aria-hidden />
            ) : null}
            {!attach
              ? t('useConfirmOwn')
              : alreadyForked
                ? t('useOpenExisting')
                : t('useConfirm')}
          </Button>
        </>
      }
    >
      <div className='flex flex-col gap-5'>
        {error ? (
          <p
            role='alert'
            className='rounded-[var(--pv2-r)] border border-[var(--pv2-hair)] bg-[var(--pv2-canvas)] px-3.5 py-2.5 text-[12.5px] leading-relaxed text-[var(--pv2-warning)]'
          >
            {error}
          </p>
        ) : null}

        {/* Điều gì SẼ xảy ra, nói trước khi bấm. */}
        <p className='rounded-[var(--pv2-r)] border border-[var(--pv2-hair)] bg-[var(--pv2-canvas)] px-3.5 py-3 text-[12.5px] leading-relaxed text-[var(--pv2-ink)]'>
          {t('useNoteOwn', { tab: t('stateUnassigned') })}
        </p>

        <label className='flex cursor-pointer items-start gap-2.5'>
          <input
            type='checkbox'
            checked={attach}
            onChange={e => setAttach(e.target.checked)}
            className='mt-0.5 size-4 shrink-0 accent-[var(--pv2-electric)]'
          />
          <span className='min-w-0'>
            <span className='block text-[13px] font-semibold text-[var(--pv2-ink)]'>
              {t('useAttachToggle')}
            </span>
            <span className='block text-[11.5px] leading-relaxed text-[var(--pv2-mut)]'>
              {t('useAttachHint')}
            </span>
          </span>
        </label>

        {attach ? (
          <section className='border-t border-[var(--pv2-hair)] pt-4'>
            <h3 className='mb-2 text-[11px] font-bold tracking-[0.06em] text-[var(--pv2-faint)] uppercase'>
              {t('useStepCampaign')}
            </h3>
            {campaigns === null ? (
              <p className='text-[12.5px] text-[var(--pv2-faint)]'>
                {t('useLoading')}
              </p>
            ) : campaigns.length ? (
              <div className='flex max-h-[220px] flex-col gap-1.5 overflow-y-auto'>
                {campaigns.map(c => (
                  <Row
                    key={c.id}
                    selected={campaignId === c.id}
                    onClick={() => setCampaignId(c.id)}
                    title={c.name}
                    sub={t('useItemsCount', { count: c.itemsCount })}
                  />
                ))}
              </div>
            ) : (
              /* Không có chiến dịch thì vẫn lấy bản về được — chỉ là không gắn
               được. Nói đúng chuyện đó, đừng để hộp trống. */
              <p className='text-[12.5px] leading-relaxed text-[var(--pv2-mut)]'>
                {t('useNoCampaign')}
              </p>
            )}
          </section>
        ) : null}

        {attach && campaignId ? (
          <section className='border-t border-[var(--pv2-hair)] pt-4'>
            <h3 className='mb-2 text-[11px] font-bold tracking-[0.06em] text-[var(--pv2-faint)] uppercase'>
              {t('useStepItem')}
            </h3>
            {items === null ? (
              <p className='text-[12.5px] text-[var(--pv2-faint)]'>
                {t('useLoading')}
              </p>
            ) : items.length ? (
              <div className='flex max-h-[240px] flex-col gap-1.5 overflow-y-auto'>
                {items.map(it => {
                  const forked = it.originIds.includes(experience.id);
                  return (
                    <Row
                      key={it.id}
                      selected={itemId === it.id}
                      onClick={() => setItemId(it.id)}
                      title={it.label}
                      sub={t(
                        it.kind === 'topic' ? 'useKindTopic' : 'useKindProduct'
                      )}
                      tail={
                        forked ? (
                          <span className='shrink-0 rounded-full bg-[var(--pv2-canvas)] px-2 py-0.5 text-[10px] font-semibold text-[var(--pv2-mut)]'>
                            {t('useAlreadyForked')}
                          </span>
                        ) : null
                      }
                    />
                  );
                })}
              </div>
            ) : (
              <p className='text-[12.5px] leading-relaxed text-[var(--pv2-mut)]'>
                {t('useNoItem')}
              </p>
            )}
          </section>
        ) : null}

        {attach && selectedItem ? (
          <p className='rounded-[var(--pv2-r)] bg-[var(--pv2-canvas)] px-3.5 py-2.5 text-[12px] leading-relaxed text-[var(--pv2-mut)]'>
            {alreadyForked
              ? t('useNoteExisting')
              : t('useNoteNew', {
                  tab: t(
                    selectedItem.kind === 'topic'
                      ? 'stateTopic'
                      : 'stateProduct'
                  ),
                })}
          </p>
        ) : null}
      </div>
    </Modal>
  );
};
