'use client';

import * as React from 'react';
import { Loader2 } from 'lucide-react';

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

interface DuplicateTemplateDialogProps {
  open: boolean;
  defaultName: string;
  saving: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (name: string) => Promise<void> | void;
}

export function DuplicateTemplateDialog({
  open,
  defaultName,
  saving,
  onOpenChange,
  onConfirm,
}: DuplicateTemplateDialogProps) {
  const [name, setName] = React.useState(defaultName);

  React.useEffect(() => {
    if (open) setName(defaultName);
  }, [open, defaultName]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    await onConfirm(trimmed);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
          <DialogHeader>
            <DialogTitle>Lưu thành template của tôi</DialogTitle>
            <DialogDescription>
              Nhân bản canvas hiện tại thành 1 template riêng. Tên mới hiển thị
              trong tab “My Template”.
            </DialogDescription>
          </DialogHeader>

          <div className='flex flex-col gap-2'>
            <Label htmlFor='dup-name'>Tên template</Label>
            <Input
              id='dup-name'
              autoFocus
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder='VD: Hero Split — Sản phẩm A'
              required
              disabled={saving}
              maxLength={120}
            />
          </div>

          <DialogFooter>
            <Button
              type='button'
              variant='outline'
              onClick={() => onOpenChange(false)}
              disabled={saving}
            >
              Huỷ
            </Button>
            <Button
              type='submit'
              variant='primary'
              disabled={saving || !name.trim()}
            >
              {saving ? (
                <>
                  <Loader2 className='size-3.5 animate-spin' />
                  Đang lưu…
                </>
              ) : (
                'Lưu'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
