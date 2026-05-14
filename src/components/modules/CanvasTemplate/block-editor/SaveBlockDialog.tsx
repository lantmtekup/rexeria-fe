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

import { saveBlock } from './savedBlocks';
import type { Block } from './types';

interface Props {
  open: boolean;
  block: Block | null;
  onOpenChange: (open: boolean) => void;
  onSaved?: (id: string) => void;
}

/**
 * Asks the user for a label, then snapshots the active block into the
 * saved-blocks library (currently localStorage — see savedBlocks.ts).
 * Default name comes from the block's current `name`.
 */
export function SaveBlockDialog({ open, block, onOpenChange, onSaved }: Props) {
  const [name, setName] = React.useState('');

  // Reset name to the block's name every time the dialog reopens — so saving
  // the same block twice doesn't carry over the previous custom label.
  React.useEffect(() => {
    if (open && block) setName(block.name ?? '');
  }, [open, block]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
          <DialogHeader>
            <DialogTitle>Lưu block vào thư viện</DialogTitle>
            <DialogDescription>
              Block sẽ xuất hiện trong tab “Đã lưu” khi bấm “Thêm block”. Dùng
              lại được trong mọi canvas template.
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

          <DialogFooter>
            <Button
              type='button'
              variant='outline'
              onClick={() => onOpenChange(false)}
            >
              Huỷ
            </Button>
            <Button type='submit' variant='primary' disabled={!name.trim()}>
              Lưu
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
