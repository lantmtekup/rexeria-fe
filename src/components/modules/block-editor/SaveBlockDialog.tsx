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

import { rexerApi } from '@/services/rexer/endpoints';
import { RxApiError } from '@/services/rexer/client';

import { getSavedBlock } from './savedBlocks';
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

  const [saving, setSaving] = React.useState(false);

  const editingEntry = React.useMemo(
    () =>
      editingSavedBlockId ? getSavedBlock(editingSavedBlockId) : undefined,
    // Re-read every time the dialog opens so an external rename is picked up.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [editingSavedBlockId, open]
  );
  const isEditing = !!editingSavedBlockId;

  React.useEffect(() => {
    if (!open) return;
    if (editingEntry) setName(editingEntry.name);
    else if (block) setName(block.name ?? '');
  }, [open, block, editingEntry]);

  const errMsg = (err: unknown) =>
    err instanceof RxApiError
      ? err.code || err.message
      : err instanceof Error
        ? err.message
        : 'SAVE_FAILED';

  // Lưu vào thư viện BE (`/v1/blocks`) — cùng nguồn mà tab "Đã lưu" /
  // /admin/blocks đọc. (Trước đây lưu localStorage nên không bao giờ hiện lại.)
  const persistAsNew = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!block) return;
    const trimmed = name.trim();
    if (!trimmed) {
      toast.error('Tên block không được để trống');
      return;
    }
    setSaving(true);
    try {
      const created = await rexerApi.blocks.create({
        type_code: block.blockType,
        name: trimmed,
        settings: block as unknown as Record<string, unknown>,
        tags: [],
      });
      toast.success(`Đã lưu "${trimmed}" vào thư viện`);
      onSaved?.(created.id);
      onOpenChange(false);
    } catch (err) {
      toast.error(`Lưu thất bại: ${errMsg(err)}`);
    } finally {
      setSaving(false);
    }
  };

  const persistOverwrite = async () => {
    if (!block || !editingSavedBlockId) return;
    const trimmed = name.trim();
    if (!trimmed) {
      toast.error('Tên block không được để trống');
      return;
    }
    setSaving(true);
    try {
      const updated = await rexerApi.blocks.update(editingSavedBlockId, {
        name: trimmed,
        // Đồng bộ type_code theo block hiện tại — nếu user đổi design sang loại
        // khác (vd swap sang framer_aestha_editorial) thì cột type_code khớp luôn
        // với settings.blockType, tránh lệch metadata.
        type_code: block.blockType,
        settings: block as unknown as Record<string, unknown>,
      });
      toast.success(`Đã cập nhật "${trimmed}"`);
      onSaved?.(updated.id);
      onOpenChange(false);
      onOverwriteSuccess?.();
    } catch (err) {
      toast.error(`Cập nhật thất bại: ${errMsg(err)}`);
    } finally {
      setSaving(false);
    }
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
                  <code className='text-2xs bg-muted rounded px-1 font-mono'>
                    {editingSavedBlockId}
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
                disabled={!name.trim() || saving}
                title='Lưu thành bản mới — bản gốc không đổi'
              >
                Lưu bản mới
              </Button>
            )}
            <Button
              type={isEditing ? 'button' : 'submit'}
              variant='primary'
              disabled={!name.trim() || saving}
              onClick={isEditing ? persistOverwrite : undefined}
            >
              {saving ? 'Đang lưu…' : isEditing ? 'Cập nhật bản gốc' : 'Lưu'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
