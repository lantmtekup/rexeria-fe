'use client';

import { CheckCircle2, Copy, Image as ImageIcon, Sparkles } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { pollAiJob } from '@/components/modules/AiAutomation/pollAiJob';
import { Button } from '@/components/molecules/portal-v2/Button';
import { Modal } from '@/components/molecules/portal-v2/Modal';
import { Tabs } from '@/components/molecules/portal-v2/Tabs';
import type { ProductAsset } from '@/lib/portal-v2/product/types';
import type { LiveDeployRow } from '@/lib/portal-v2/deploy/types';
import { fetchProductMedia } from '@/services/portal-v2/productMediaUpload';
import { rexerApi } from '@/services/rexer/endpoints';
import type {
  AISocialCaption,
  AISocialCaptionOutput,
} from '@/services/rexer/types';

type LiveDetailTab = 'publish' | 'content';

type LiveRowDetailModalProps = {
  row: LiveDeployRow;
  onClose: () => void;
};

/**
 * The Live row's detail — a URL that used to vanish on reload (see
 * `helpers.ts` `mapLiveRow`), and the product media + an AI caption to post
 * it with. Two tabs, same `Modal`/`Tabs` pattern as `ChannelDetailModal` /
 * `ExperienceDetailModal`.
 */
export const LiveRowDetailModal = ({
  row,
  onClose,
}: LiveRowDetailModalProps) => {
  const t = useTranslations('portalV2.deploy');
  const [tab, setTab] = useState<LiveDetailTab>('publish');
  const [urlCopied, setUrlCopied] = useState(false);

  const [media, setMedia] = useState<ProductAsset[] | null>(null);
  const [loadingMedia, setLoadingMedia] = useState(false);

  const [captions, setCaptions] = useState<AISocialCaption[] | null>(null);
  const [generatingCaption, setGeneratingCaption] = useState(false);

  // Lazy — fetched once, the first time Content is opened for a product row.
  useEffect(() => {
    if (tab !== 'content' || !row.productId || media !== null) return;
    setLoadingMedia(true);
    fetchProductMedia(row.productId)
      .then(setMedia)
      .catch(() => setMedia([]))
      .finally(() => setLoadingMedia(false));
  }, [tab, row.productId, media]);

  const copyUrl = () => {
    if (!row.publicUrl) return;
    navigator.clipboard.writeText(row.publicUrl).then(
      () => {
        setUrlCopied(true);
        toast.success(t('liveDetailUrlCopiedToast'));
        window.setTimeout(() => setUrlCopied(false), 1500);
      },
      () => toast.error(t('liveDetailUrlCopyFailToast'))
    );
  };

  const copyCaption = (text: string) => {
    navigator.clipboard.writeText(text).then(
      () => toast.success(t('liveDetailCaptionCopiedToast')),
      () => toast.error(t('liveDetailUrlCopyFailToast'))
    );
  };

  const handleGenerateCaption = async () => {
    if (!row.productId) return;
    setGeneratingCaption(true);
    try {
      const job = await rexerApi.aiJobs.socialCaption({
        product_id: row.productId,
        page_url: row.publicUrl ?? undefined,
      });
      const done = await pollAiJob(job.id);
      if (done.status !== 'succeeded') {
        throw new Error(done.error_message || 'AI job failed');
      }
      const output = done.output_payload as unknown as
        | AISocialCaptionOutput
        | undefined;
      setCaptions(output?.captions ?? []);
    } catch (err) {
      toast.error(t('liveDetailCaptionFailedToast'), {
        description: err instanceof Error ? err.message : String(err),
      });
    } finally {
      setGeneratingCaption(false);
    }
  };

  const name = row.experiences[0]?.name ?? row.subjectName ?? t('untitled');

  return (
    <Modal
      open
      wide
      onClose={onClose}
      title={name}
      subtitle={row.campaign.name}
    >
      <Tabs
        items={[
          { id: 'publish', label: t('liveDetailTabPublish') },
          { id: 'content', label: t('liveDetailTabContent') },
        ]}
        value={tab}
        onChange={id => setTab(id as LiveDetailTab)}
        className='mb-4'
      />

      {tab === 'publish' ? (
        <div>
          <p className='mb-1.5 text-[10.5px] font-bold tracking-[0.06em] text-[var(--pv2-faint)] uppercase'>
            {t('liveDetailUrlLabel')}
          </p>
          {row.publicUrl ? (
            <div className='flex items-center gap-2 rounded-[var(--pv2-r)] border border-[var(--pv2-hair)] bg-[var(--pv2-canvas)] px-3 py-2.5'>
              <a
                href={row.publicUrl}
                target='_blank'
                rel='noopener noreferrer'
                className='min-w-0 flex-1 truncate font-mono text-[12.5px] text-[var(--pv2-ink)] hover:underline'
              >
                {row.publicUrl}
              </a>
              <button
                type='button'
                onClick={copyUrl}
                title={t('liveDetailCopyUrl')}
                className='grid size-7 shrink-0 place-items-center rounded-[6px] text-[var(--pv2-mut)] transition-colors hover:bg-white hover:text-[var(--pv2-ink)]'
              >
                {urlCopied ? (
                  <CheckCircle2
                    className='size-3.5 text-[var(--pv2-success)]'
                    aria-hidden
                  />
                ) : (
                  <Copy className='size-3.5' aria-hidden />
                )}
              </button>
            </div>
          ) : (
            <p className='rounded-[var(--pv2-r)] border border-dashed border-[var(--pv2-hair)] px-3 py-2.5 text-[12.5px] text-[var(--pv2-faint)]'>
              {t('liveDetailUrlMissing')}
            </p>
          )}
        </div>
      ) : null}

      {tab === 'content' ? (
        !row.productId ? (
          <p className='rounded-[var(--pv2-r)] border border-dashed border-[var(--pv2-hair)] px-3 py-6 text-center text-[12.5px] text-[var(--pv2-faint)]'>
            {t('liveDetailContentEmptyTopic')}
          </p>
        ) : (
          <div className='flex flex-col gap-5'>
            <div>
              <p className='mb-2 text-[10.5px] font-bold tracking-[0.06em] text-[var(--pv2-faint)] uppercase'>
                {t('liveDetailMediaLabel')}
              </p>
              {loadingMedia ? (
                <p className='text-[12.5px] text-[var(--pv2-faint)]'>
                  {t('liveDetailLoadingMedia')}
                </p>
              ) : media && media.length > 0 ? (
                <div className='grid grid-cols-4 gap-2 sm:grid-cols-6'>
                  {media.map(asset => (
                    <a
                      key={asset.id}
                      href={asset.url}
                      target='_blank'
                      rel='noopener noreferrer'
                      title={asset.name}
                      className='relative aspect-square overflow-hidden rounded-[8px] bg-[var(--pv2-canvas)]'
                    >
                      {asset.url && asset.kind !== 'VID' ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={asset.url}
                          alt={asset.name}
                          className='size-full object-cover'
                        />
                      ) : (
                        <div className='flex size-full items-center justify-center text-[var(--pv2-faint)]'>
                          <ImageIcon className='size-6' aria-hidden />
                        </div>
                      )}
                    </a>
                  ))}
                </div>
              ) : (
                <p className='text-[12.5px] text-[var(--pv2-faint)]'>
                  {t('liveDetailNoMedia')}
                </p>
              )}
            </div>

            <div>
              <div className='mb-2 flex items-center justify-between gap-3'>
                <p className='text-[10.5px] font-bold tracking-[0.06em] text-[var(--pv2-faint)] uppercase'>
                  {t('liveDetailCaptionLabel')}
                </p>
                <Button
                  variant='ghost'
                  size='sm'
                  disabled={generatingCaption}
                  onClick={handleGenerateCaption}
                >
                  <Sparkles className='size-3.5' aria-hidden />
                  {generatingCaption
                    ? t('liveDetailGeneratingCaption')
                    : t('liveDetailGenerateCaption')}
                </Button>
              </div>
              {captions && captions.length > 0 ? (
                <div className='flex flex-col gap-2.5'>
                  {captions.map((c, i) => (
                    <div
                      key={`${c.platform}-${i}`}
                      className='rounded-[var(--pv2-r)] border border-[var(--pv2-hair)] bg-[var(--pv2-paper)] p-3'
                    >
                      <div className='mb-1.5 flex items-center justify-between'>
                        <span className='text-3xs font-mono font-bold tracking-widest text-[var(--pv2-faint)] uppercase'>
                          {c.platform}
                        </span>
                        <button
                          type='button'
                          onClick={() => copyCaption(c.text)}
                          title={t('liveDetailCopyUrl')}
                          className='text-[var(--pv2-mut)] transition-colors hover:text-[var(--pv2-ink)]'
                        >
                          <Copy className='size-3.5' aria-hidden />
                        </button>
                      </div>
                      <p className='text-[12.5px] leading-relaxed whitespace-pre-line text-[var(--pv2-ink)]'>
                        {c.text}
                      </p>
                      {c.hashtags && c.hashtags.length > 0 ? (
                        <p className='mt-1.5 text-[11.5px] text-[var(--pv2-electric)]'>
                          {c.hashtags.join(' ')}
                        </p>
                      ) : null}
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        )
      ) : null}
    </Modal>
  );
};
