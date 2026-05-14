'use client';

import * as React from 'react';
import { Bookmark, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import { Badge } from '@/components/atoms/badge';
import { Button } from '@/components/atoms/button';
import { Input } from '@/components/atoms/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/atoms/table';
import { EmptyState } from '@/components/molecules/EmptyState';
import {
  deleteSavedBlock,
  listSavedBlocks,
  renameSavedBlock,
  subscribeSavedBlocks,
  type SavedBlock,
} from '@/components/modules/CanvasTemplate/block-editor/savedBlocks';
import { BLOCK_TYPE_META } from '@/components/modules/CanvasTemplate/block-editor/types';

/**
 * Admin-side view of the saved-blocks library. Phase 1 reads
 * `localStorage` (per-browser) — admin sees their own saved presets here.
 * Phase 2 will swap to BE-backed `rexerApi.savedBlocks.list()` (see
 * `docs/be-saved-blocks-spec.md`) so this view becomes a true
 * platform-wide catalog.
 */
export function AdminSavedBlocksPage() {
  const [items, setItems] = React.useState<SavedBlock[]>([]);
  const [search, setSearch] = React.useState('');
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editingName, setEditingName] = React.useState('');

  React.useEffect(() => {
    setItems(listSavedBlocks());
    return subscribeSavedBlocks(() => setItems(listSavedBlocks()));
  }, []);

  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      e =>
        e.name.toLowerCase().includes(q) ||
        e.block.blockType.toLowerCase().includes(q)
    );
  }, [items, search]);

  const handleRename = (id: string) => {
    const trimmed = editingName.trim();
    if (!trimmed) {
      setEditingId(null);
      return;
    }
    renameSavedBlock(id, trimmed);
    toast.success('Đã đổi tên');
    setEditingId(null);
    setItems(listSavedBlocks());
  };

  const handleDelete = (e: SavedBlock) => {
    if (!window.confirm(`Xoá "${e.name}"?`)) return;
    deleteSavedBlock(e.id);
    setItems(listSavedBlocks());
    toast.success('Đã xoá');
  };

  return (
    <div className='flex flex-col gap-4 p-6'>
      <div className='flex items-start justify-between gap-3'>
        <div>
          <h1 className='text-xl font-semibold'>Saved blocks</h1>
          <p className='text-muted-foreground text-xs'>
            Thư viện block đã lưu (phase 1: client-side). Sẽ chuyển
            server-backed theo <code>docs/be-saved-blocks-spec.md</code>.
          </p>
        </div>
        <Badge variant='secondary'>{items.length} blocks</Badge>
      </div>

      <Input
        placeholder='Tìm theo tên / block type…'
        value={search}
        onChange={e => setSearch(e.target.value)}
        className='max-w-sm'
      />

      {filtered.length === 0 ? (
        <EmptyState
          icon={<Bookmark className='size-10' />}
          title={
            items.length === 0 ? 'Chưa có saved block' : 'Không khớp tìm kiếm'
          }
          description={
            items.length === 0
              ? 'Mở canvas editor, bấm icon dấu trang trên header để lưu block hiện tại.'
              : 'Đổi từ khoá hoặc xoá filter để xem tất cả.'
          }
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tên</TableHead>
              <TableHead>Block type</TableHead>
              <TableHead>Extra elements</TableHead>
              <TableHead>Saved at</TableHead>
              <TableHead className='w-24'></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map(e => {
              const meta = BLOCK_TYPE_META[e.block.blockType];
              const isEditing = editingId === e.id;
              return (
                <TableRow key={e.id}>
                  <TableCell className='font-medium'>
                    {isEditing ? (
                      <Input
                        autoFocus
                        value={editingName}
                        onChange={ev => setEditingName(ev.target.value)}
                        onBlur={() => handleRename(e.id)}
                        onKeyDown={ev => {
                          if (ev.key === 'Enter') handleRename(e.id);
                          else if (ev.key === 'Escape') setEditingId(null);
                        }}
                        className='h-7 text-sm'
                      />
                    ) : (
                      e.name
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant='outline' className='text-[10px]'>
                      {meta.label}
                    </Badge>
                  </TableCell>
                  <TableCell>{e.block.extraElements?.length ?? 0}</TableCell>
                  <TableCell className='text-muted-foreground text-xs'>
                    {new Date(e.createdAt).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <div className='flex justify-end gap-1'>
                      <Button
                        variant='ghost'
                        size='icon'
                        className='size-7'
                        onClick={() => {
                          setEditingId(e.id);
                          setEditingName(e.name);
                        }}
                        aria-label='Đổi tên'
                      >
                        <Pencil className='size-3.5' />
                      </Button>
                      <Button
                        variant='ghost'
                        size='icon'
                        className='text-muted-foreground hover:text-destructive size-7'
                        onClick={() => handleDelete(e)}
                        aria-label='Xoá'
                      >
                        <Trash2 className='size-3.5' />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
