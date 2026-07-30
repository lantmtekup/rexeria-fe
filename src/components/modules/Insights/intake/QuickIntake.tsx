'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Loader2, Sparkles } from 'lucide-react';

import { Input } from '@/components/atoms/input';
import { Textarea } from '@/components/atoms/textarea';
import type { CreateInsightReportBody } from '@/services/rexer/types';
import { GradientButton } from '../steps/ui';
import { ImageUrlInput } from './ImageUrlInput';
import { FieldRow, ScopeFields } from './ScopeFields';
import { useWorkspaceScope } from './useWorkspaceScope';

/**
 * Nhập nhanh — một ô text duy nhất thay cho wizard 10 bước.
 *
 * Vì sao làm được mà không cần BE đổi gì: bước đầu của engine
 * (`understand_context`) vốn đã là "đọc brief lộn xộn rồi chuẩn hoá thành
 * brand/product/audience/campaign/market/assumptions", và `inputs` của create
 * là JSONMap tự do (không validate field nào) — BE nhét thẳng vào
 * `context.manual` rồi serialize cả cục vào prompt. Wizard 10 bước thực chất
 * đang bắt user làm tay đúng việc mà LLM bước 1 sinh ra để làm.
 *
 * Khác wizard ở một điểm quan trọng: KHÔNG gửi `selections`, nên engine tự
 * chạy cả `classify_goal` lẫn `recommend_journey` thay vì skip. Chậm hơn và
 * tốn token hơn, đổi lại user không phải quyết gì.
 */
export function QuickIntake({
  submitting,
  onRun,
  brandLocked,
}: {
  submitting: boolean;
  onRun: (body: CreateInsightReportBody) => void;
  brandLocked: boolean;
}) {
  const t = useTranslations('insights');
  const scope = useWorkspaceScope(brandLocked);
  const [title, setTitle] = useState('');
  const [briefText, setBriefText] = useState('');
  const [imageUrls, setImageUrls] = useState<string[]>([]);

  const text = briefText.trim();
  const canRun = !!scope.workspaceId && text.length >= MIN_BRIEF_LEN;

  const handleRun = () => {
    onRun({
      workspace_id: scope.workspaceId,
      title: title.trim() || deriveTitle(text),
      inputs: {
        brief_text: withImageDirective(text, imageUrls),
        source: 'quick_intake',
        // Đặt cả hai key: `image_urls` cho engine đọc thẳng, và `brief.assets`
        // để khớp shape `InsightBrief` mà wizard đầy đủ vẫn dùng — report tạo
        // ở đây mở lại bằng "chỉnh sửa & chạy lại" thì không mất ảnh.
        ...(imageUrls.length
          ? {
              image_urls: imageUrls,
              brief: { assets: { items: imageUrls } },
            }
          : {}),
      },
    });
  };

  return (
    <div className='border-border bg-card mx-auto max-w-3xl space-y-5 rounded-2xl border p-5'>
      <div className='space-y-1'>
        <h2 className='text-content-main text-lg font-semibold'>
          {t('quick.heading')}
        </h2>
        <p className='text-content-muted text-sm'>{t('quick.subheading')}</p>
      </div>

      <ScopeFields brandLocked={brandLocked} scope={scope} />

      <FieldRow label={t('quick.title')} hint={t('quick.titleHint')}>
        <Input
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder={t('quick.titlePlaceholder')}
        />
      </FieldRow>

      <FieldRow label={t('quick.brief')}>
        <Textarea
          value={briefText}
          onChange={e => setBriefText(e.target.value)}
          placeholder={t('quick.briefPlaceholder')}
          className='min-h-64'
        />
      </FieldRow>

      <FieldRow label={t('quick.image')} hint={t('quick.imageHint')}>
        <ImageUrlInput urls={imageUrls} onChange={setImageUrls} />
      </FieldRow>

      <div className='flex flex-wrap items-center justify-between gap-3'>
        <p className='text-content-muted text-xs'>
          {text.length < MIN_BRIEF_LEN
            ? t('quick.tooShort', { n: MIN_BRIEF_LEN - text.length })
            : t('quick.autoNote')}
        </p>
        <GradientButton
          disabled={!canRun || submitting}
          onClick={handleRun}
          leading={
            submitting ? (
              <Loader2 className='h-4 w-4 animate-spin' />
            ) : (
              <Sparkles className='h-4 w-4' />
            )
          }
        >
          {t('quick.run')}
        </GradientButton>
      </div>
    </div>
  );
}

/**
 * Đủ dài để bước `understand_context` có gì mà chuẩn hoá. Prompt của nó có
 * ràng buộc "Do not invent facts" — brief cụt thì phần thiếu rơi hết vào
 * `assumptions` và blueprint ra nhạt, nên chặn sớm còn hơn để user tưởng
 * AI kém.
 */
const MIN_BRIEF_LEN = 80;

/**
 * Nối danh sách ảnh vào cuối brief dưới dạng chỉ dẫn rõ ràng.
 *
 * Vì sao phải nhét vào text thay vì tin vào key `image_urls`: system prompt mà
 * engine dùng để sinh nội dung block (`internal/insight/interactive.go`) chỉ
 * dặn model "dùng brand tone, objective, audience, pain points, market context
 * FROM THE BRIEF" — nó KHÔNG hề nhắc tới ảnh. Link nằm trong context JSON thì
 * model có thấy, nhưng không có lệnh nào bảo dùng cho trường ảnh, nên tuỳ hứng
 * model. Đặt ngay trong brief — đúng thứ prompt được lệnh phải đọc — là đòn bẩy
 * mạnh nhất mà FE tự làm được.
 *
 * Cách chắc chắn hơn là thêm một câu vào system prompt phía BE; khi nào làm
 * được thì phần nối này vẫn vô hại.
 */
function withImageDirective(text: string, urls: string[]): string {
  if (!urls.length) return text;
  return [
    text,
    '',
    'Ảnh có sẵn của thương hiệu — hãy dùng đúng các URL này cho mọi trường ảnh',
    '(imageUrl, backgroundUrl, photos…), không tự bịa URL khác và không để trống:',
    ...urls.map(u => `- ${u}`),
  ].join('\n');
}

/** Không đặt tên thì lấy câu đầu làm tên report (BE giới hạn 200 ký tự). */
function deriveTitle(text: string): string {
  const firstLine = text.split('\n')[0]?.trim() ?? '';
  const raw = firstLine || text;
  return raw.length > 60 ? `${raw.slice(0, 60).trimEnd()}…` : raw;
}
