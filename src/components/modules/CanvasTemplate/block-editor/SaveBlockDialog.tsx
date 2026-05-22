'use client';

import * as React from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/atoms/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/atoms/dialog';
import { Input } from '@/components/atoms/input';
import { Label } from '@/components/atoms/label';

import {
  getSavedBlock,
  saveBlock,
  updateSavedBlockContent,
} from './savedBlocks';
import type { Block } from './types';

interface Props {
  open: boolean;
  block: Block | null;
  onOpenChange: (open: boolean) => void;
  onSaved?: (id: string) => void;
  /**
   * When set, the dialog is in "edit existing saved block" mode — primary
   * button overwrites the original; a secondary button still allows saving
   * as a brand-new entry. Driven by the `?saved_block_id=<id>` query param
   * the `/admin/blocks` Edit flow appends to the canvas-editor URL.
   */
  editingSavedBlockId?: string;
  /**
   * Fires after a successful overwrite-mode save. The canvas-editor host
   * uses this to clean up the scratch canvas template it created just to
   * host the block during editing, and redirect the user back to
   * `/admin/blocks`. Not fired for fork-as-new saves.
   */
  onOverwriteSuccess?: () => void;
}

/**
 * Two modes:
 *  - **Create** (default): asks for a label, snapshots the active block into
 *    the library as a NEW entry.
 *  - **Edit existing** (when `editingSavedBlockId` set): primary CTA updates
 *    the existing entry in place; a secondary CTA still lets the user fork
 *    a new entry. Default name is loaded from the existing saved block.
 */
export function SaveBlockDialog({
  open,
  block,
  onOpenChange,
  onSaved,
  editingSavedBlockId,
  onOverwriteSuccess,
}: Props) {
  const [name, setName] = React.useState('');

  const editingEntry = React.useMemo(
    () =>
      editingSavedBlockId ? getSavedBlock(editingSavedBlockId) : undefined,
    // Re-read every time the dialog opens so an external rename is picked up.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [editingSavedBlockId, open]
  );
  const isEditing = !!editingEntry;

  React.useEffect(() => {
    if (!open) return;
    if (editingEntry) setName(editingEntry.name);
    else if (block) setName(block.name ?? '');
  }, [open, block, editingEntry]);

  const persistAsNew = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!block) return;
    const trimmed = name.trim();
    if (!trimmed) {
      toast.error('Tên block không được để trống');
      return;
    }
    const saved = saveBlock(trimmed, block);
    toast.success(`Đã lưu "${saved.name}" vào thư viện`);
    onSaved?.(saved.id);
    onOpenChange(false);
  };

  const persistOverwrite = () => {
    if (!block || !editingEntry) return;
    const trimmed = name.trim();
    if (!trimmed) {
      toast.error('Tên block không được để trống');
      return;
    }
    const updated = updateSavedBlockContent(editingEntry.id, block, trimmed);
    if (!updated) {
      toast.error('Không tìm thấy block gốc để cập nhật');
      return;
    }
    toast.success(`Đã cập nhật "${updated.name}"`);
    onSaved?.(updated.id);
    onOpenChange(false);
    onOverwriteSuccess?.();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <form
          onSubmit={isEditing ? e => e.preventDefault() : persistAsNew}
          className='flex flex-col gap-4'
        >
          <DialogHeader>
            <DialogTitle>
              {isEditing
                ? 'Cập nhật block trong thư viện'
                : 'Lưu block vào thư viện'}
            </DialogTitle>
            <DialogDescription>
              {isEditing ? (
                <>
                  Đang sửa bản gốc{' '}
                  <code className='rounded bg-zinc-100 px-1 font-mono text-[11px]'>
                    {editingEntry.id}
                  </code>
                  . Cập nhật sẽ ghi đè nội dung &amp; ngày sửa; ID + tag giữ
                  nguyên.
                </>
              ) : (
                'Block sẽ xuất hiện trong tab “Đã lưu” khi bấm “Thêm block”. Dùng lại được trong mọi canvas template.'
              )}
            </DialogDescription>
          </DialogHeader>

          <div className='flex flex-col gap-1.5'>
            <Label htmlFor='save-block-name'>Tên</Label>
            <Input
              id='save-block-name'
              autoFocus
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder='Vd: Hero Epic Tower'
              maxLength={200}
            />
          </div>

          <DialogFooter className='gap-2 sm:gap-2'>
            <Button
              type='button'
              variant='outline'
              onClick={() => onOpenChange(false)}
            >
              Huỷ
            </Button>
            {isEditing && (
              <Button
                type='button'
                variant='outline'
                onClick={() => persistAsNew()}
                disabled={!name.trim()}
                title='Lưu thành bản mới — bản gốc không đổi'
              >
                Lưu bản mới
              </Button>
            )}
            <Button
              type={isEditing ? 'button' : 'submit'}
              variant='primary'
              disabled={!name.trim()}
              onClick={isEditing ? persistOverwrite : undefined}
            >
              {isEditing ? 'Cập nhật bản gốc' : 'Lưu'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
