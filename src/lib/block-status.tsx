import type { BlockStatus } from '@/services/rexer/types';
import { cn } from '@/lib/cn';

/** Thứ tự lifecycle dùng cho select/filter. */
export const BLOCK_STATUS_ORDER: BlockStatus[] = [
  'draft',
  'in_dev',
  'review',
  'changes_requested',
  'published',
];

export const BLOCK_STATUS_META: Record<
  BlockStatus,
  { label: string; hint: string; cls: string; dot: string }
> = {
  draft: {
    label: 'Nháp',
    hint: 'Brief từ marketing, chưa triển khai',
    cls: 'bg-zinc-100 text-zinc-600',
    dot: 'bg-zinc-400',
  },
  in_dev: {
    label: 'Đang dev',
    hint: 'Dev đang triển khai',
    cls: 'bg-blue-100 text-blue-700',
    dot: 'bg-blue-500',
  },
  review: {
    label: 'Chờ duyệt',
    hint: 'Dev xong, chờ marketing review',
    cls: 'bg-amber-100 text-amber-700',
    dot: 'bg-amber-500',
  },
  changes_requested: {
    label: 'Trả lại sửa',
    hint: 'Marketing yêu cầu chỉnh, về lại dev',
    cls: 'bg-rose-100 text-rose-700',
    dot: 'bg-rose-500',
  },
  published: {
    label: 'Đã publish',
    hint: 'Đạt chuẩn, user được dùng',
    cls: 'bg-emerald-100 text-emerald-700',
    dot: 'bg-emerald-500',
  },
};

/** Block mới mặc định = draft. */
export const DEFAULT_BLOCK_STATUS: BlockStatus = 'draft';

/** Status hiệu lực: rỗng (legacy, có trước feature) → coi như published để
 *  không ẩn nhầm khỏi picker/public. */
export function effectiveBlockStatus(b: { status?: BlockStatus }): BlockStatus {
  return b.status ?? 'published';
}

/** Block đã đạt chuẩn cho user cuối dùng (picker / AI / public). */
export function isBlockUsable(b: { status?: BlockStatus }): boolean {
  return effectiveBlockStatus(b) === 'published';
}

export function BlockStatusBadge({
  status,
  className,
}: {
  status?: BlockStatus;
  className?: string;
}) {
  const s = status ?? 'published';
  const m = BLOCK_STATUS_META[s];
  return (
    <span
      title={m.hint}
      className={cn(
        'text-2xs inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-medium',
        m.cls,
        className
      )}
    >
      <span className={cn('size-1.5 rounded-full', m.dot)} />
      {m.label}
    </span>
  );
}
