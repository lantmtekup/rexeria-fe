'use client';

/**
 * Lịch sử đổi trạng thái của 1 block — để theo dõi tiến độ (ai đổi, từ status
 * nào sang nào, lúc nào). Gọi `GET /v1/blocks/:id/activity` (BE map từ
 * activity_logs). Với block cũ chưa có log, hoặc khi lỗi mạng/máy chủ, tự dựng
 * timeline tối giản từ created_at/updated_at của chính block để UI vẫn xem được.
 */

import * as React from 'react';
import { History, Loader2 } from 'lucide-react';

import { rexerApi } from '@/services/rexer/endpoints';
import type { Block, BlockActivity, BlockStatus } from '@/services/rexer/types';
import { BLOCK_STATUS_META } from '@/lib/block-status';
import { cn } from '@/lib/cn';

function fmtDateTime(iso?: string): string {
  if (!iso) return '-';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString('vi-VN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/** Tên actor hiển thị: ưu tiên display_name; uuid thì rút gọn; rỗng → hệ thống. */
function actorLabel(a: BlockActivity): string {
  if (a.actor_name?.trim()) return a.actor_name.trim();
  if (a.actor_id) return a.actor_id.slice(0, 8);
  return 'hệ thống';
}

/**
 * Fallback (block cũ chưa có log / lỗi tải): dựng timeline tối giản từ block.
 * - Tạo block (created_at / created_by)
 * - Lần cập nhật gần nhất → trạng thái hiện tại (updated_at / updated_by),
 *   chỉ khi updated_at khác created_at.
 */
function deriveFromBlock(block: Block): BlockActivity[] {
  const items: BlockActivity[] = [];
  const status = block.status ?? 'published';
  if (block.updated_at && block.updated_at !== block.created_at) {
    items.push({
      id: `${block.id}-updated`,
      block_id: block.id,
      actor_id: block.updated_by ?? '',
      action: 'block.status_change',
      to_status: status,
      review_note: block.review_note,
      created_at: block.updated_at,
    });
  }
  items.push({
    id: `${block.id}-created`,
    block_id: block.id,
    actor_id: block.created_by ?? '',
    action: 'block.created',
    to_status: block.updated_at === block.created_at ? status : undefined,
    created_at: block.created_at,
  });
  return items;
}

function StatusChip({ status }: { status: BlockStatus }) {
  const m = BLOCK_STATUS_META[status];
  return (
    <span
      className={cn(
        'text-3xs inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 font-medium',
        m.cls
      )}
    >
      <span className={cn('size-1 rounded-full', m.dot)} />
      {m.label}
    </span>
  );
}

function ActionLine({ a }: { a: BlockActivity }) {
  if (a.action === 'block.created') {
    return (
      <span className='inline-flex items-center gap-1.5'>
        <span className='font-medium'>Tạo block</span>
        {a.to_status && <StatusChip status={a.to_status} />}
      </span>
    );
  }
  if (a.action === 'block.status_change') {
    return (
      <span className='inline-flex flex-wrap items-center gap-1.5'>
        <span className='text-content-muted'>Đổi trạng thái</span>
        {a.from_status && (
          <>
            <StatusChip status={a.from_status} />
            <span className='text-muted-foreground'>→</span>
          </>
        )}
        {a.to_status && <StatusChip status={a.to_status} />}
      </span>
    );
  }
  return <span className='text-content-muted'>Cập nhật block</span>;
}

export function BlockStatusHistory({ block }: { block: Block }) {
  const [items, setItems] = React.useState<BlockActivity[] | null>(null);
  // 'real' = từ API; 'empty' = API ok nhưng chưa có log (dựng tạm từ block);
  // 'error' = không tải được (dựng tạm từ block).
  const [source, setSource] = React.useState<'real' | 'empty' | 'error'>(
    'real'
  );
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let alive = true;
    setLoading(true);
    setItems(null);
    setSource('real');
    rexerApi.blocks
      .activity(block.id)
      .then(res => {
        if (!alive) return;
        if (res.items?.length) {
          setItems(res.items);
          setSource('real');
        } else {
          // API ok nhưng block chưa có lần đổi status nào được ghi (vd block cũ
          // tạo trước khi BE bật log) → dựng tạm từ ngày tạo/cập nhật cho đỡ trống.
          setItems(deriveFromBlock(block));
          setSource('empty');
        }
      })
      .catch(() => {
        if (!alive) return;
        // Lỗi mạng/máy chủ → fallback dựng từ block, không chặn người dùng.
        setItems(deriveFromBlock(block));
        setSource('error');
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [block]);

  return (
    <div className='border-border bg-muted/30 flex flex-col gap-2 rounded-lg border p-3'>
      <div className='text-3xs text-content-muted flex items-center gap-1.5 font-semibold tracking-wider uppercase'>
        <History className='size-3.5' />
        Lịch sử trạng thái
      </div>

      {loading ? (
        <div className='text-muted-foreground flex items-center gap-2 py-2 text-xs'>
          <Loader2 className='size-3.5 animate-spin' />
          Đang tải lịch sử…
        </div>
      ) : !items || items.length === 0 ? (
        <p className='text-muted-foreground py-1 text-xs italic'>
          Chưa có lịch sử thay đổi.
        </p>
      ) : (
        <ol className='flex flex-col gap-0'>
          {items.map((a, i) => (
            <li key={a.id} className='flex gap-2.5'>
              {/* Rãnh dọc + chấm mốc thời gian */}
              <div className='flex flex-col items-center'>
                <span className='border-border bg-card mt-1 size-2 shrink-0 rounded-full border' />
                {i < items.length - 1 && (
                  <span className='bg-border w-px flex-1' />
                )}
              </div>
              <div className='flex flex-col gap-0.5 pb-3 text-xs'>
                <ActionLine a={a} />
                <div className='text-3xs text-muted-foreground flex flex-wrap items-center gap-x-1.5'>
                  <span className='text-content-muted font-medium'>
                    {actorLabel(a)}
                  </span>
                  <span>·</span>
                  <span>{fmtDateTime(a.created_at)}</span>
                </div>
                {a.review_note && (
                  <p className='text-3xs text-content-muted mt-0.5 border-l-2 border-amber-200 pl-2 italic'>
                    {a.review_note}
                  </p>
                )}
              </div>
            </li>
          ))}
        </ol>
      )}

      {!loading && source === 'empty' && (
        <p className='text-3xs text-muted-foreground border-border/60 mt-0.5 border-t pt-1.5'>
          Chưa ghi nhận lần đổi trạng thái nào — các mốc trên tạm dựng từ ngày
          tạo/cập nhật block. Mọi thay đổi từ giờ sẽ được ghi lại đầy đủ.
        </p>
      )}
      {!loading && source === 'error' && (
        <p className='text-3xs border-border/60 mt-0.5 border-t pt-1.5 text-amber-600'>
          Không tải được lịch sử từ máy chủ — tạm hiển thị từ dữ liệu block.
        </p>
      )}
    </div>
  );
}
