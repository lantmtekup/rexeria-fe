'use client';

/**
 * Phân trang client-side dùng chung cho các bảng admin (block-types, blocks…).
 * Gồm: chọn số lượng/trang + điều hướng Trước/Sau + thông tin trang.
 * Caller tự slice `items.slice((page-1)*pageSize, page*pageSize)`.
 */

import { ChevronLeft, ChevronRight } from 'lucide-react';

const PAGE_SIZES = [10, 20, 50, 100] as const;

export function TablePagination({
  total,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
}: {
  total: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <div className='text-content-muted flex flex-wrap items-center justify-between gap-3 px-1 py-2 text-xs'>
      <div className='flex items-center gap-2'>
        <span>Hiển thị</span>
        <select
          value={pageSize}
          onChange={e => onPageSizeChange(Number(e.target.value))}
          className='border-input bg-background text-foreground h-7 rounded-md border px-1.5 text-xs outline-none'
        >
          {PAGE_SIZES.map(s => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <span>
          / trang · {from}–{to} trong {total}
        </span>
      </div>
      <div className='flex items-center gap-1.5'>
        <button
          type='button'
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className='border-border hover:bg-muted text-foreground inline-flex size-7 items-center justify-center rounded-md border disabled:cursor-not-allowed disabled:opacity-40'
          aria-label='Trang trước'
        >
          <ChevronLeft className='size-4' />
        </button>
        <span className='tabular-nums'>
          Trang {Math.min(page, totalPages)}/{totalPages}
        </span>
        <button
          type='button'
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className='border-border hover:bg-muted text-foreground inline-flex size-7 items-center justify-center rounded-md border disabled:cursor-not-allowed disabled:opacity-40'
          aria-label='Trang sau'
        >
          <ChevronRight className='size-4' />
        </button>
      </div>
    </div>
  );
}
