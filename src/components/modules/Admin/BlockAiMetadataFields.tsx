'use client';

/**
 * Nhóm field metadata phục vụ AI-Insights recommendation cho 1 block
 * (`blocks.ai_metadata`). Dùng chung cho cả luồng TẠO (AddBuiltinBlockDialog)
 * và SỬA (EditBlockDialog) để shape + UX nhất quán. Presentational thuần:
 * nhận `value` + `onChange`, không tự gọi API.
 *
 * Shape khớp BE `models.BlockAIMetadata` / FE `BlockAIMetadata` (types.ts).
 */

import * as React from 'react';
import { X } from 'lucide-react';

import { Input } from '@/components/atoms/input';
import { Label } from '@/components/atoms/label';
import type { BlockAIMetadata, BlockTone } from '@/services/rexer/types';

/** Tone hợp lệ + nhãn tiếng Việt. Value đồng bộ BE `AllowedBlockTones`. */
export const BLOCK_TONE_OPTIONS: { value: BlockTone; label: string }[] = [
  { value: 'professional', label: 'Chuyên nghiệp' },
  { value: 'friendly', label: 'Thân thiện' },
  { value: 'luxury', label: 'Sang trọng' },
  { value: 'playful', label: 'Vui tươi' },
  { value: 'urgent', label: 'Khẩn cấp / thúc đẩy' },
  { value: 'minimal', label: 'Tối giản' },
];

/** Bỏ field rỗng để không gửi `""`/`[]` thừa lên BE. null = không có metadata. */
export function cleanAiMetadata(
  v: BlockAIMetadata
): BlockAIMetadata | undefined {
  const out: BlockAIMetadata = {};
  if (v.use_case?.trim()) out.use_case = v.use_case.trim();
  if (v.industry?.trim()) out.industry = v.industry.trim();
  if (v.tone) out.tone = v.tone;
  if (v.target_audience?.trim()) out.target_audience = v.target_audience.trim();
  const kw = (v.keywords ?? []).map(k => k.trim()).filter(Boolean);
  if (kw.length) out.keywords = kw;
  return Object.keys(out).length ? out : undefined;
}

interface Props {
  value: BlockAIMetadata;
  onChange: (next: BlockAIMetadata) => void;
  /** Prefix id để tránh trùng khi 2 instance cùng trang. */
  idPrefix?: string;
  disabled?: boolean;
}

export function BlockAiMetadataFields({
  value,
  onChange,
  idPrefix = 'ai',
  disabled,
}: Props) {
  const [kwInput, setKwInput] = React.useState('');
  const keywords = value.keywords ?? [];

  const patch = (p: Partial<BlockAIMetadata>) => onChange({ ...value, ...p });

  const addKeyword = () => {
    const k = kwInput.trim().toLowerCase();
    if (!k) return;
    if (!keywords.includes(k)) patch({ keywords: [...keywords, k] });
    setKwInput('');
  };
  const removeKeyword = (k: string) =>
    patch({ keywords: keywords.filter(x => x !== k) });

  return (
    <div className='flex flex-col gap-4'>
      <div className='border-border/60 -mb-1 border-t pt-3'>
        <p className='text-content-muted text-xs font-semibold tracking-wide uppercase'>
          Metadata cho AI gợi ý
        </p>
        <p className='text-2xs text-content-muted mt-0.5'>
          Thông tin này giúp AI-Insights chọn đúng block khi tạo trang. Càng đầy
          đủ, gợi ý càng chính xác.
        </p>
      </div>

      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
        <div className='flex flex-col gap-1'>
          <Label htmlFor={`${idPrefix}-usecase`}>Tình huống dùng</Label>
          <Input
            id={`${idPrefix}-usecase`}
            value={value.use_case ?? ''}
            disabled={disabled}
            onChange={e => patch({ use_case: e.target.value })}
            placeholder='vd: ra mắt sản phẩm'
          />
        </div>

        <div className='flex flex-col gap-1'>
          <Label htmlFor={`${idPrefix}-industry`}>Ngành hàng</Label>
          <Input
            id={`${idPrefix}-industry`}
            value={value.industry ?? ''}
            disabled={disabled}
            onChange={e => patch({ industry: e.target.value })}
            placeholder='vd: mỹ phẩm'
          />
        </div>

        <div className='flex flex-col gap-1'>
          <Label htmlFor={`${idPrefix}-tone`}>Tông giọng</Label>
          <select
            id={`${idPrefix}-tone`}
            value={value.tone ?? ''}
            disabled={disabled}
            onChange={e =>
              patch({ tone: (e.target.value || undefined) as BlockTone })
            }
            className='border-border h-9 rounded-md border bg-white px-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 disabled:opacity-50'
          >
            <option value=''>— Không chọn —</option>
            {BLOCK_TONE_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        <div className='flex flex-col gap-1'>
          <Label htmlFor={`${idPrefix}-audience`}>Đối tượng</Label>
          <Input
            id={`${idPrefix}-audience`}
            value={value.target_audience ?? ''}
            disabled={disabled}
            onChange={e => patch({ target_audience: e.target.value })}
            placeholder='vd: nữ 25-34'
          />
        </div>
      </div>

      <div className='flex flex-col gap-1'>
        <Label htmlFor={`${idPrefix}-keywords`}>Từ khoá</Label>
        {keywords.length > 0 && (
          <div className='flex flex-wrap items-center gap-1.5'>
            {keywords.map(k => (
              <span
                key={k}
                className='bg-muted inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs'
              >
                {k}
                <button
                  type='button'
                  onClick={() => removeKeyword(k)}
                  className='text-content-muted hover:text-foreground'
                  aria-label={`Bỏ từ khoá ${k}`}
                  disabled={disabled}
                >
                  <X className='size-3' />
                </button>
              </span>
            ))}
          </div>
        )}
        <Input
          id={`${idPrefix}-keywords`}
          value={kwInput}
          disabled={disabled}
          onChange={e => setKwInput(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') {
              e.preventDefault();
              addKeyword();
            }
          }}
          onBlur={addKeyword}
          placeholder='Nhập từ khoá rồi Enter…'
        />
      </div>
    </div>
  );
}
