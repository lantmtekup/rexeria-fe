'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Plus, X } from 'lucide-react';

import { Input } from '@/components/atoms/input';
import { cn } from '@/lib/cn';

/**
 * Nhập link ảnh có sẵn (không upload). Ảnh đi thẳng vào `inputs` của create →
 * `input_snapshot` → prompt sinh nội dung block: `GenerateBlockContent` nối cả
 * cục context vào user prompt, và system prompt của nó có luật "Use https URLs
 * only" + ảnh placeholder mặc định khi không được cấp. Cấp link thật thì model
 * dùng link thật thay placeholder.
 *
 * Dán nhiều link một lúc được — tách theo xuống dòng, dấu phẩy hoặc khoảng
 * trắng, vì người dùng thường copy cả cụm từ sheet/chat chứ không gõ từng cái.
 */
export function ImageUrlInput({
  urls,
  onChange,
}: {
  urls: string[];
  onChange: (next: string[]) => void;
}) {
  const t = useTranslations('insights');
  const [draft, setDraft] = useState('');
  const [rejected, setRejected] = useState(0);

  const add = (raw: string) => {
    const { ok, bad } = splitUrls(raw);
    setRejected(bad);
    if (!ok.length) return;
    // Bỏ trùng: dán lại cùng một cụm link là chuyện thường.
    onChange([...urls, ...ok.filter(u => !urls.includes(u))]);
    setDraft('');
  };

  const remove = (url: string) => onChange(urls.filter(u => u !== url));

  return (
    <div className='space-y-2'>
      <div className='flex gap-2'>
        <Input
          value={draft}
          onChange={e => setDraft(e.target.value)}
          placeholder={t('quick.imagePlaceholder')}
          onKeyDown={e => {
            if (e.key !== 'Enter') return;
            e.preventDefault();
            add(draft);
          }}
          onPaste={e => {
            const pasted = e.clipboardData.getData('text');
            // Dán cụm nhiều link → nuốt luôn, khỏi bắt user tự tách.
            if (!/[\s,]/.test(pasted.trim())) return;
            e.preventDefault();
            add(pasted);
          }}
        />
        <button
          type='button'
          onClick={() => add(draft)}
          disabled={!draft.trim()}
          className='border-border text-content-muted hover:bg-muted inline-flex shrink-0 items-center gap-1 rounded-xl border px-3 text-sm font-semibold transition disabled:opacity-40'
        >
          <Plus className='size-4' aria-hidden />
          {t('quick.imageAdd')}
        </button>
      </div>

      {rejected > 0 && (
        <p className='text-xs text-amber-600'>
          {t('quick.imageRejected', { n: rejected })}
        </p>
      )}

      {urls.length > 0 && (
        <ul className='flex flex-wrap gap-2'>
          {urls.map(url => (
            <li
              key={url}
              className='border-border bg-muted/40 flex max-w-full items-center gap-2 rounded-lg border py-1 pr-1 pl-1.5'
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt=''
                className='size-8 shrink-0 rounded object-cover'
                onError={e => {
                  // Link chết vẫn giữ chip: BE có thể vẫn tải được, hỏng ở đây
                  // chỉ là CORS/hotlink. Đổi sang khung rỗng thay vì icon vỡ.
                  e.currentTarget.style.visibility = 'hidden';
                }}
              />
              <span className='text-content-muted truncate font-mono text-xs'>
                {shorten(url)}
              </span>
              <button
                type='button'
                onClick={() => remove(url)}
                aria-label={t('quick.imageRemove')}
                className={cn(
                  'text-content-muted hover:text-content-main shrink-0 rounded p-1 transition',
                  'hover:bg-background'
                )}
              >
                <X className='size-3.5' aria-hidden />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/**
 * Tách chuỗi thô thành link hợp lệ + đếm phần bị loại. Chỉ nhận http(s) —
 * prompt sinh block yêu cầu "https URLs only", nên `data:`/đường dẫn tương đối
 * lọt xuống chỉ làm model sinh ảnh hỏng.
 */
function splitUrls(raw: string): { ok: string[]; bad: number } {
  const parts = raw
    .split(/[\s,]+/)
    .map(s => s.trim())
    .filter(Boolean);
  const ok: string[] = [];
  let bad = 0;
  for (const p of parts) {
    if (/^https?:\/\/\S+$/i.test(p)) ok.push(p);
    else bad += 1;
  }
  return { ok, bad };
}

/** Link ảnh thường rất dài; giữ đuôi vì tên file mới là phần phân biệt. */
function shorten(url: string): string {
  if (url.length <= 44) return url;
  return `${url.slice(0, 18)}…${url.slice(-22)}`;
}
