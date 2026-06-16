'use client';

import * as React from 'react';
import { Loader2, X } from 'lucide-react';
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
import { Textarea } from '@/components/atoms/textarea';
import { RxApiError } from '@/services/rexer/client';
import { rexerApi } from '@/services/rexer/endpoints';
import type { Block } from '@/services/rexer/types';

export interface EditBlockDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Block đang sửa. Null → dialog đóng. */
  block: Block | null;
  /** Gọi sau khi PATCH thành công để list cập nhật. */
  onSaved: (updated: Block) => void;
}

function rxMessage(err: unknown): string {
  if (err instanceof RxApiError) return err.code || err.message || 'API_ERROR';
  if (err instanceof Error) return err.message;
  return 'Unexpected error';
}

export function EditBlockDialog({
  open,
  onOpenChange,
  block,
  onSaved,
}: EditBlockDialogProps) {
  const [name, setName] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [tags, setTags] = React.useState<string[]>([]);
  const [tagInput, setTagInput] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);

  // Nạp lại form mỗi khi mở với block khác.
  React.useEffect(() => {
    if (open && block) {
      setName(block.name ?? '');
      setDescription(block.description ?? '');
      setTags(block.tags ?? []);
      setTagInput('');
    }
  }, [open, block]);

  const addTag = () => {
    const t = tagInput.trim().toLowerCase();
    if (!t) return;
    if (!tags.includes(t)) setTags(prev => [...prev, t]);
    setTagInput('');
  };

  const removeTag = (t: string) => setTags(prev => prev.filter(x => x !== t));

  const handleSubmit = async () => {
    if (!block) return;
    const trimmedName = name.trim();
    if (!trimmedName) {
      toast.error('Tên block không được rỗng');
      return;
    }
    setSubmitting(true);
    try {
      const updated = await rexerApi.blocks.update(block.id, {
        name: trimmedName,
        description: description.trim() || undefined,
        tags,
      });
      toast.success(`Đã cập nhật "${updated.name}"`);
      onSaved(updated);
      onOpenChange(false);
    } catch (err) {
      toast.error(`Lưu thất bại: ${rxMessage(err)}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-h-[88vh] overflow-y-auto sm:max-w-xl'>
        <DialogHeader>
          <DialogTitle>Sửa thông tin block</DialogTitle>
          <DialogDescription>
            Cập nhật tên, mô tả, tag. Nội dung canvas (settings) chỉnh trong
            block editor, không sửa ở đây.
          </DialogDescription>
        </DialogHeader>

        <div className='flex flex-col gap-4'>
          <div className='flex flex-col gap-1'>
            <Label htmlFor='eb-name'>
              Tên <span className='text-rose-600'>*</span>
            </Label>
            <Input
              id='eb-name'
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder='Hero chia đôi…'
            />
          </div>

          <div className='flex flex-col gap-1'>
            <Label htmlFor='eb-desc'>Mô tả</Label>
            <Textarea
              id='eb-desc'
              value={description}
              rows={3}
              onChange={e => setDescription(e.target.value)}
              placeholder='Ghi chú ngắn về block này…'
            />
          </div>

          <div className='flex flex-col gap-1'>
            <Label htmlFor='eb-tags'>Tags</Label>
            <div className='flex flex-wrap items-center gap-1.5'>
              {tags.map(t => (
                <span
                  key={t}
                  className='bg-muted inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs'
                >
                  {t}
                  <button
                    type='button'
                    onClick={() => removeTag(t)}
                    className='text-content-muted hover:text-foreground'
                    aria-label={`Bỏ tag ${t}`}
                  >
                    <X className='size-3' />
                  </button>
                </span>
              ))}
            </div>
            <Input
              id='eb-tags'
              value={tagInput}
              onChange={e => setTagInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addTag();
                }
              }}
              onBlur={addTag}
              placeholder='Nhập tag rồi Enter…'
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant='outline'
            onClick={() => onOpenChange(false)}
            disabled={submitting}
          >
            Huỷ
          </Button>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting && <Loader2 className='mr-1 size-3.5 animate-spin' />}
            Lưu thay đổi
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
