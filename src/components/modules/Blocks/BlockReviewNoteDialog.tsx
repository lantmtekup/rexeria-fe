'use client';

import * as React from 'react';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/atoms/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/atoms/dialog';
import { Label } from '@/components/atoms/label';
import { Textarea } from '@/components/atoms/textarea';
import { RxApiError } from '@/services/rexer/client';
import { rexerApi } from '@/services/rexer/endpoints';
import type { Block } from '@/services/rexer/types';

export interface BlockReviewNoteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  block: Block | null;
  onSaved?: (updated: Block) => void;
}

/** Modal ghi chú nội bộ — subset của EditBlockDialog (chỉ review_note). */
export function BlockReviewNoteDialog({
  open,
  onOpenChange,
  block,
  onSaved,
}: BlockReviewNoteDialogProps) {
  const [note, setNote] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (open && block) setNote(block.review_note ?? '');
  }, [open, block]);

  const handleSubmit = async () => {
    if (!block) return;
    setSubmitting(true);
    try {
      const updated = await rexerApi.blocks.update(block.id, {
        review_note: note.trim(),
      });
      toast.success('Đã lưu ghi chú');
      onSaved?.(updated);
      onOpenChange(false);
    } catch (e) {
      toast.error(e instanceof RxApiError ? e.message : 'Lưu thất bại');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader>
          <DialogTitle className='text-lg'>Ghi chú nội bộ</DialogTitle>
          {block ? (
            <p className='text-muted-foreground text-base'>{block.name}</p>
          ) : null}
        </DialogHeader>

        <div className='flex flex-col gap-2'>
          <Label htmlFor='brn-note' className='text-base'>
            Feedback / ghi chú
          </Label>
          <Textarea
            id='brn-note'
            value={note}
            rows={8}
            className='min-h-45 text-base'
            onChange={e => setNote(e.target.value)}
            placeholder='Marketing: mô tả block cần làm. Dev/Reviewer: ghi chú khi bàn giao / trả lại…'
          />
        </div>

        <DialogFooter>
          <Button
            variant='outline'
            onClick={() => onOpenChange(false)}
            disabled={submitting}
          >
            Huỷ
          </Button>
          <Button onClick={handleSubmit} disabled={submitting || !block}>
            {submitting ? (
              <Loader2 className='mr-1 size-3.5 animate-spin' />
            ) : null}
            Lưu
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
