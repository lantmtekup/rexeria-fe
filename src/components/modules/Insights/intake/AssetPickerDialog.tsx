'use client';

import { useEffect, useState } from 'react';
import { Check, FileText, Film, Loader2, Search } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/atoms/dialog';
import { Button } from '@/components/atoms/button';
import { cn } from '@/lib/cn';
import { rexerApi } from '@/services/rexer/endpoints';
import type { MediaAsset } from '@/services/rexer/types';

/**
 * Dialog chọn asset từ thư viện media (wire `rexerApi.media.list`). Hiển thị lưới
 * thumbnail + tên để user tick chọn nhiều, khỏi phải nhớ/nhập tay. Khi xác nhận,
 * trả về danh sách `original_filename` qua `onPick`.
 */
export function AssetPickerDialog({
  open,
  onOpenChange,
  onPick,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPick: (names: string[]) => void;
}) {
  const [items, setItems] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState('');
  const [sel, setSel] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    setSel(new Set());
    setQ('');
    rexerApi.media
      .list({ limit: 100 })
      .then(r => setItems(r.items ?? []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [open]);

  const filtered = items.filter(
    a => !q || a.original_filename.toLowerCase().includes(q.toLowerCase())
  );

  const toggle = (id: string) =>
    setSel(s => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });

  const confirm = () => {
    const names = items
      .filter(a => sel.has(a.id))
      .map(a => a.original_filename);
    onPick(names);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-2xl'>
        <DialogHeader>
          <DialogTitle>Chọn từ thư viện</DialogTitle>
        </DialogHeader>

        {/* Search */}
        <div className='border-border bg-muted flex items-center gap-2 rounded-lg border px-3 py-1.5'>
          <Search className='text-content-muted size-3.5' aria-hidden />
          <input
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder='Tìm theo tên file…'
            className='placeholder:text-content-muted flex-1 bg-transparent text-sm outline-none'
          />
        </div>

        {/* Grid */}
        <div className='max-h-[55vh] min-h-40 overflow-y-auto'>
          {loading ? (
            <div className='text-content-muted flex items-center justify-center gap-2 py-12 text-sm'>
              <Loader2 className='size-4 animate-spin' /> Đang tải thư viện…
            </div>
          ) : filtered.length === 0 ? (
            <div className='text-content-muted py-12 text-center text-sm'>
              {items.length === 0
                ? 'Thư viện chưa có asset nào.'
                : 'Không có file khớp tìm kiếm.'}
            </div>
          ) : (
            <div className='grid grid-cols-3 gap-2.5 p-0.5 sm:grid-cols-4'>
              {filtered.map(a => (
                <AssetTile
                  key={a.id}
                  asset={a}
                  selected={sel.has(a.id)}
                  onToggle={() => toggle(a.id)}
                />
              ))}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant='neutral'
            size='sm'
            onClick={() => onOpenChange(false)}
          >
            Huỷ
          </Button>
          <Button size='sm' onClick={confirm} disabled={sel.size === 0}>
            Thêm{sel.size > 0 ? ` (${sel.size})` : ''}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function AssetTile({
  asset,
  selected,
  onToggle,
}: {
  asset: MediaAsset;
  selected: boolean;
  onToggle: () => void;
}) {
  const [imgError, setImgError] = useState(false);
  const isImage = asset.media_type === 'image' && asset.public_url && !imgError;
  const Icon = asset.media_type === 'video' ? Film : FileText;

  return (
    <button
      type='button'
      onClick={onToggle}
      className={cn(
        'group relative overflow-hidden rounded-xl border text-left transition',
        selected
          ? 'border-primary ring-primary/20 ring-2'
          : 'border-border hover:border-primary/40'
      )}
    >
      <div className='bg-muted flex aspect-square items-center justify-center'>
        {isImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={asset.public_url}
            alt={asset.original_filename}
            onError={() => setImgError(true)}
            className='h-full w-full object-cover'
          />
        ) : (
          <Icon className='text-content-muted size-7' aria-hidden />
        )}
      </div>
      <div className='truncate px-2 py-1.5 font-mono text-[11px]'>
        {asset.original_filename}
      </div>
      {selected && (
        <span className='bg-primary absolute top-1.5 right-1.5 inline-flex size-5 items-center justify-center rounded-full text-white'>
          <Check className='size-3' aria-hidden />
        </span>
      )}
    </button>
  );
}
