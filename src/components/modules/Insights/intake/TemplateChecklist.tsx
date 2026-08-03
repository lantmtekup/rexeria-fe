'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ChevronDown, ImageIcon, TriangleAlert } from 'lucide-react';

import { Input } from '@/components/atoms/input';
import { Textarea } from '@/components/atoms/textarea';
import { cn } from '@/lib/cn';
import type {
  ChecklistBlock,
  ChecklistField,
  ChecklistOverrides,
} from './checklistModel';
import { autoAssignImages, countSlots } from './checklistModel';

/**
 * Checklist "template này cần điền những gì", dựng từ canvas của template đã chọn.
 *
 * Vì sao cần: template là khuôn của người khác (landing bất động sản, đồng hồ…),
 * người dùng không nhìn ra nó đòi bao nhiêu ô chữ và bao nhiêu ảnh. Chạy xong mới
 * biết thiếu 8 ảnh thì đã tốn một lượt gọi AI.
 *
 * Ô để trống = AI viết theo brief. Ô có chữ = giữ nguyên đúng chữ đó (ghi đè lên
 * canvas sau khi AI viết xong — xem `applyOverrides`).
 *
 * Mặc định THU HẾT và nói to rằng không bắt buộc điền: bày sẵn 28 ô ra màn hình
 * khiến người dùng tưởng phải gõ hết mới chạy được, trong khi đường đi bình
 * thường là không đụng ô nào. Ô alt text bị giấu sau nút "hiện ô phụ" vì chúng
 * chiếm gần một phần ba số ô mà gần như không ai gõ tay.
 */
export function TemplateChecklist({
  blocks,
  overrides,
  onChange,
  mediaUrls,
  mode = 'plan',
}: {
  blocks: ChecklistBlock[];
  overrides: ChecklistOverrides;
  onChange: (next: ChecklistOverrides) => void;
  mediaUrls: string[];
  /**
   * `plan` — trước khi chạy, ô trống, chỉ để ghim trước.
   * `review` — sau khi AI viết, mỗi ô mang sẵn chữ AI, người dùng sửa lên đó.
   */
  mode?: 'plan' | 'review';
}) {
  const t = useTranslations('insights');
  // Mặc định THU HẾT. Mở sẵn một block khiến checklist trông như biểu mẫu bắt
  // buộc điền, trong khi đường đi bình thường là không đụng gì cả — brief + ảnh
  // là đủ, AI viết phần còn lại.
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const [showSecondary, setShowSecondary] = useState(false);

  const slots = useMemo(() => countSlots(blocks), [blocks]);
  const secondaryCount = useMemo(
    () =>
      blocks.reduce((n, b) => n + b.fields.filter(f => f.secondary).length, 0),
    [blocks]
  );

  // Đếm ô ảnh đã gán để cảnh báo "3 ảnh cho 11 ô". Chỉ tính ô ảnh, vì ô chữ bỏ
  // trống là chuyện bình thường (AI viết), còn ảnh thì AI không bịa được.
  const imagesAssigned = useMemo(() => {
    let n = 0;
    for (const b of blocks) {
      const filled = overrides[b.blockId];
      if (!filled) continue;
      for (const f of b.fields) {
        if (f.kind !== 'text' && filled[f.path]?.trim()) n += 1;
      }
    }
    return n;
  }, [blocks, overrides]);

  const setField = (blockId: string, path: string, value: string) => {
    const block = { ...(overrides[blockId] ?? {}) };
    if (value) block[path] = value;
    else delete block[path];

    const next = { ...overrides };
    if (Object.keys(block).length) next[blockId] = block;
    else delete next[blockId];
    onChange(next);
  };

  const setAllOpen = (value: boolean) =>
    setOpen(Object.fromEntries(blocks.map(b => [b.blockId, value])));

  if (!blocks.length) return null;

  const mediaSlots = slots.image + slots.video;

  return (
    <div className='border-border bg-muted/20 space-y-3 rounded-xl border p-4'>
      <div className='flex flex-wrap items-start justify-between gap-3'>
        <div className='space-y-1'>
          <h3 className='text-content-main text-sm font-semibold'>
            {t(
              mode === 'review'
                ? 'variant.reviewHeading'
                : 'variant.checklistHeading'
            )}
          </h3>
          <p className='text-content-muted text-xs'>
            {t('variant.checklistCounts', {
              blocks: blocks.length,
              text: slots.text,
              image: slots.image,
              video: slots.video,
            })}
          </p>
        </div>
        <div className='flex flex-wrap gap-1.5'>
          {mediaUrls.length > 0 && (
            <MiniButton
              onClick={() =>
                onChange(
                  autoAssignImages(blocks, mediaUrls, overrides, {
                    overwrite: mode === 'review',
                  })
                )
              }
            >
              {t('variant.autoAssign')}
            </MiniButton>
          )}
          {secondaryCount > 0 && (
            <MiniButton onClick={() => setShowSecondary(v => !v)}>
              {showSecondary
                ? t('variant.hideSecondary')
                : t('variant.showSecondary', { n: secondaryCount })}
            </MiniButton>
          )}
          <MiniButton onClick={() => setAllOpen(true)}>
            {t('variant.expandAll')}
          </MiniButton>
          <MiniButton onClick={() => setAllOpen(false)}>
            {t('variant.collapseAll')}
          </MiniButton>
        </div>
      </div>

      {/* Câu quan trọng nhất của cả khối — để ngay dưới tiêu đề, có nền, vì
          hiểu sai chỗ này là người dùng ngồi gõ hàng chục ô một cách vô ích. */}
      <p className='border-primary/25 bg-primary/5 text-content-main rounded-lg border px-3 py-2 text-xs'>
        {t(
          mode === 'review' ? 'variant.reviewHint' : 'variant.checklistOptional'
        )}
      </p>

      <ul className='space-y-1.5'>
        {blocks.map((block, i) => {
          const filled = overrides[block.blockId] ?? {};
          const filledCount = block.fields.filter(f =>
            filled[f.path]?.trim()
          ).length;
          const isOpen = !!open[block.blockId];

          return (
            <li
              key={block.blockId}
              className='border-border bg-background rounded-lg border'
            >
              <button
                type='button'
                aria-expanded={isOpen}
                onClick={() =>
                  setOpen(prev => ({
                    ...prev,
                    [block.blockId]: !prev[block.blockId],
                  }))
                }
                className='flex w-full items-center gap-2 px-3 py-2 text-left'
              >
                <ChevronDown
                  aria-hidden
                  className={cn(
                    'text-content-muted size-4 shrink-0 transition-transform',
                    !isOpen && '-rotate-90'
                  )}
                />
                <span className='text-content-main min-w-0 flex-1 truncate text-sm'>
                  <span className='text-content-muted'>{i + 1}.</span>{' '}
                  {block.name || block.blockType}
                </span>
                {/* Ở chặng soát, "7/7 đã điền" là thông tin vô dụng vì ô nào
                    cũng có chữ. Trích vài chữ đầu để liếc là biết AI viết gì mà
                    không phải mở từng block. */}
                {mode === 'review' ? (
                  <span className='text-content-muted max-w-[45%] shrink-0 truncate text-[11px] italic'>
                    {snippetOf(block, filled) || t('variant.blockNoFields')}
                  </span>
                ) : (
                  <span
                    className={cn(
                      'shrink-0 rounded-full px-2 py-0.5 text-[11px]',
                      filledCount
                        ? 'bg-primary/10 text-primary'
                        : 'bg-muted text-content-muted'
                    )}
                  >
                    {block.fields.length === 0
                      ? t('variant.blockNoFields')
                      : filledCount
                        ? t('variant.blockFilled', {
                            n: filledCount,
                            total: block.fields.length,
                          })
                        : t('variant.blockAllAi')}
                  </span>
                )}
              </button>

              {isOpen && block.fields.length > 0 && (
                <div className='border-border space-y-2.5 border-t px-3 py-3'>
                  {block.fields
                    .filter(f => showSecondary || !f.secondary)
                    .map(f => (
                      <FieldInput
                        key={f.path}
                        field={f}
                        value={filled[f.path] ?? ''}
                        onChange={v => setField(block.blockId, f.path, v)}
                        mediaUrls={mediaUrls}
                      />
                    ))}
                </div>
              )}

              {isOpen && block.fields.length === 0 && (
                <p className='border-border text-content-muted border-t px-3 py-3 text-xs'>
                  {t('variant.blockNoFieldsHint')}
                </p>
              )}
            </li>
          );
        })}
      </ul>

      {mediaSlots > 0 && imagesAssigned < mediaSlots && (
        <p className='border-warning/30 bg-warning/5 text-content-muted flex gap-2 rounded-lg border px-3 py-2 text-xs'>
          <TriangleAlert
            aria-hidden
            className='mt-0.5 size-3.5 shrink-0 opacity-70'
          />
          <span>
            {t('variant.notEnoughImages', {
              assigned: imagesAssigned,
              total: mediaSlots,
            })}
          </span>
        </p>
      )}
    </div>
  );
}

/** Vài chữ đầu của ô chữ đầu tiên trong block — để xem lướt ở chặng soát. */
function snippetOf(
  block: ChecklistBlock,
  filled: Record<string, string>
): string {
  for (const f of block.fields) {
    if (f.kind !== 'text' || f.secondary) continue;
    const v = (filled[f.path] ?? f.current).trim();
    if (v) return v.length > 48 ? `${v.slice(0, 48)}…` : v;
  }
  return '';
}

function MiniButton({
  onClick,
  children,
}: {
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type='button'
      onClick={onClick}
      className='border-border text-content-muted hover:text-content-main rounded-md border px-2 py-1 text-[11px]'
    >
      {children}
    </button>
  );
}

/**
 * Ô ảnh là `<select>` chứ không phải ô gõ tự do: AI chỉ được chọn ảnh trong
 * danh sách đóng (BE dựng `enum` từ ảnh brief + ảnh sẵn có của canvas), nên cho
 * gõ URL lạ ở đây sẽ tạo ra một trang có ảnh mà lượt chạy sau không giữ được.
 */
function FieldInput({
  field,
  value,
  onChange,
  mediaUrls,
}: {
  field: ChecklistField;
  value: string;
  onChange: (v: string) => void;
  mediaUrls: string[];
}) {
  const t = useTranslations('insights');

  const label = (
    <span className='text-content-muted flex items-center gap-1.5 text-[11px]'>
      {field.kind !== 'text' && (
        <ImageIcon aria-hidden className='size-3 opacity-70' />
      )}
      <code className='font-mono'>{field.path}</code>
      {!value.trim() && (
        <span className='bg-muted text-content-muted rounded px-1 py-px'>
          {t('variant.aiWillWrite')}
        </span>
      )}
    </span>
  );

  if (field.kind !== 'text') {
    return (
      <label className='block space-y-1'>
        {label}
        <select
          value={value}
          onChange={e => onChange(e.target.value)}
          className='border-border bg-background text-content-main h-9 w-full rounded-lg border px-2 text-sm'
        >
          <option value=''>{t('variant.letAiPick')}</option>
          {field.current && (
            <option value={field.current}>
              {t('variant.keepTemplateImage')}
            </option>
          )}
          {mediaUrls.map(u => (
            <option key={u} value={u}>
              {u.split('/').pop() || u}
            </option>
          ))}
        </select>
      </label>
    );
  }

  return (
    <label className='block space-y-1'>
      {label}
      {field.multiline ? (
        <Textarea
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={field.current}
          className='min-h-20 text-sm'
        />
      ) : (
        <Input
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={field.current}
        />
      )}
    </label>
  );
}
