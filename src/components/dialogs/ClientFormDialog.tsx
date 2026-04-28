'use client';

import * as React from 'react';

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
import { Spinner } from '@/components/atoms/spinner';
import type { Client } from '@/services/rexer/types';

export interface ClientFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** When provided → edit mode; absent → create mode. */
  client?: Client | null;
  submitting?: boolean;
  onSubmit: (values: {
    name: string;
    status: 'active' | 'inactive';
  }) => Promise<void> | void;
}

function ClientFormDialog({
  open,
  onOpenChange,
  client,
  submitting,
  onSubmit,
}: ClientFormDialogProps) {
  const [name, setName] = React.useState('');
  const [status, setStatus] = React.useState<'active' | 'inactive'>('active');

  React.useEffect(() => {
    if (open) {
      setName(client?.name ?? '');
      setStatus(
        (client?.status as 'active' | 'inactive' | undefined) ?? 'active'
      );
    }
  }, [open, client]);

  const isEdit = Boolean(client);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    await onSubmit({ name: name.trim(), status });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
          <DialogHeader>
            <DialogTitle>{isEdit ? 'Edit client' : 'New client'}</DialogTitle>
            <DialogDescription>
              {isEdit
                ? 'Update workspace name or status.'
                : 'A client is a workspace — landings and reports are scoped to it.'}
            </DialogDescription>
          </DialogHeader>

          <div className='flex flex-col gap-2'>
            <Label htmlFor='client-name'>Name</Label>
            <Input
              id='client-name'
              autoFocus
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder='Acme Inc.'
              maxLength={255}
              required
              disabled={submitting}
            />
          </div>

          <div className='flex flex-col gap-2'>
            <Label htmlFor='client-status'>Status</Label>
            <select
              id='client-status'
              value={status}
              onChange={e => setStatus(e.target.value as 'active' | 'inactive')}
              disabled={submitting}
              className='border-input bg-background text-foreground h-10 rounded-md border px-3 text-sm'
            >
              <option value='active'>Active</option>
              <option value='inactive'>Inactive</option>
            </select>
          </div>

          <DialogFooter>
            <Button
              type='button'
              variant='outline'
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              type='submit'
              variant='primary'
              disabled={submitting || !name.trim()}
            >
              {submitting ? (
                <>
                  <Spinner size={14} /> Saving…
                </>
              ) : isEdit ? (
                'Save changes'
              ) : (
                'Create client'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export { ClientFormDialog };
