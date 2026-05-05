'use client';

import * as React from 'react';
import { Copy } from 'lucide-react';
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
import { Spinner } from '@/components/atoms/spinner';

export interface InviteClientUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  submitting?: boolean;
  /** Generated password returned by BE — when set, dialog enters "result" mode. */
  generatedPassword?: string | null;
  onSubmit: (values: {
    email: string;
    display_name: string;
    password?: string;
  }) => Promise<void> | void;
  onClear?: () => void;
}

function InviteClientUserDialog({
  open,
  onOpenChange,
  submitting,
  generatedPassword,
  onSubmit,
  onClear,
}: InviteClientUserDialogProps) {
  const [email, setEmail] = React.useState('');
  const [displayName, setDisplayName] = React.useState('');
  const [password, setPassword] = React.useState('');

  React.useEffect(() => {
    if (open && !generatedPassword) {
      setEmail('');
      setDisplayName('');
      setPassword('');
    }
  }, [open, generatedPassword]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !displayName.trim()) return;
    await onSubmit({
      email: email.trim(),
      display_name: displayName.trim(),
      password: password.trim() || undefined,
    });
  };

  const handleClose = (next: boolean) => {
    if (!next) onClear?.();
    onOpenChange(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        {generatedPassword ? (
          <div className='flex flex-col gap-4'>
            <DialogHeader>
              <DialogTitle>User invited</DialogTitle>
              <DialogDescription>
                BE generated a temporary password — share it once, the user must
                change it on first login.
              </DialogDescription>
            </DialogHeader>
            <div className='border-border bg-muted flex items-center justify-between gap-2 rounded-md border p-3'>
              <code className='font-mono text-sm break-all'>
                {generatedPassword}
              </code>
              <Button
                type='button'
                variant='outline'
                size='sm'
                onClick={() => {
                  navigator.clipboard.writeText(generatedPassword);
                  toast.success('Password copied');
                }}
              >
                <Copy className='size-3.5' /> Copy
              </Button>
            </div>
            <DialogFooter>
              <Button
                type='button'
                variant='primary'
                onClick={() => handleClose(false)}
              >
                Done
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
            <DialogHeader>
              <DialogTitle>Invite user</DialogTitle>
              <DialogDescription>
                Add a teammate to this client workspace.
              </DialogDescription>
            </DialogHeader>

            <div className='flex flex-col gap-2'>
              <Label htmlFor='inv-email'>Email</Label>
              <Input
                id='inv-email'
                type='email'
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder='teammate@acme.com'
                required
                disabled={submitting}
              />
            </div>

            <div className='flex flex-col gap-2'>
              <Label htmlFor='inv-name'>Display name</Label>
              <Input
                id='inv-name'
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                placeholder='Jane Doe'
                required
                disabled={submitting}
              />
            </div>

            <div className='flex flex-col gap-2'>
              <Label htmlFor='inv-pwd'>Password (optional)</Label>
              <Input
                id='inv-pwd'
                type='password'
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder='Leave empty to auto-generate'
                minLength={password ? 8 : undefined}
                disabled={submitting}
              />
            </div>

            <DialogFooter>
              <Button
                type='button'
                variant='outline'
                onClick={() => handleClose(false)}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button
                type='submit'
                variant='primary'
                disabled={submitting || !email.trim() || !displayName.trim()}
              >
                {submitting ? (
                  <>
                    <Spinner size={14} /> Inviting…
                  </>
                ) : (
                  'Invite'
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

export { InviteClientUserDialog };
