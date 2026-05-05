'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';

import { Button } from '@/components/atoms/button';
import { Spinner } from '@/components/atoms/spinner';
import { rexerApi } from '@/services/rexer/endpoints';
import { RxApiError } from '@/services/rexer/client';
import { cn } from '@/lib/cn';

function rxErrorMessage(err: unknown): string {
  if (err instanceof RxApiError) return err.message || err.code;
  if (err instanceof Error) return err.message;
  return 'Unexpected error';
}

function ResetPasswordForm() {
  const router = useRouter();
  const search = useSearchParams();
  const initialToken = search.get('token') ?? '';

  const [token, setToken] = React.useState(initialToken);
  const [password, setPassword] = React.useState('');
  const [confirm, setConfirm] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token.trim()) {
      toast.error('Token is required');
      return;
    }
    if (password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    if (password !== confirm) {
      toast.error('Passwords do not match');
      return;
    }
    setSubmitting(true);
    try {
      await rexerApi.auth.resetPassword({
        token: token.trim(),
        new_password: password,
      });
      toast.success('Password updated — sign in to continue');
      router.replace('/sign-in?reset=1');
    } catch (err) {
      toast.error(`Reset failed: ${rxErrorMessage(err)}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className='flex flex-col gap-6'>
      <div>
        <h1 className='text-foreground text-2xl font-semibold tracking-[-0.02em]'>
          Reset password
        </h1>
        <p className='text-muted-foreground mt-2 text-sm'>
          Use the token sent to your email and pick a new password.
        </p>
      </div>

      <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
        <div className='border-border bg-background overflow-hidden rounded-2xl border'>
          <input
            placeholder='Reset token'
            value={token}
            onChange={e => setToken(e.target.value)}
            disabled={submitting}
            required
            className={cn(
              'text-foreground placeholder:text-content-muted block w-full px-4 py-4 font-mono text-sm outline-none focus:bg-neutral-50'
            )}
          />
          <div className='bg-border h-px' />
          <input
            type='password'
            autoComplete='new-password'
            placeholder='New password (min 8 chars)'
            minLength={8}
            value={password}
            onChange={e => setPassword(e.target.value)}
            disabled={submitting}
            required
            className={cn(
              'text-foreground placeholder:text-content-muted block w-full px-4 py-4 text-sm outline-none focus:bg-neutral-50'
            )}
          />
          <div className='bg-border h-px' />
          <input
            type='password'
            autoComplete='new-password'
            placeholder='Confirm new password'
            minLength={8}
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
            disabled={submitting}
            required
            className={cn(
              'text-foreground placeholder:text-content-muted block w-full px-4 py-4 text-sm outline-none focus:bg-neutral-50'
            )}
          />
        </div>

        <Button
          type='submit'
          variant='primary'
          size='lg'
          className='w-full'
          disabled={submitting}
        >
          {submitting ? (
            <>
              <Spinner size={14} /> Updating…
            </>
          ) : (
            'Update password'
          )}
        </Button>
      </form>

      <p className='text-foreground text-center text-sm'>
        Don&apos;t have a token?{' '}
        <Link href='/forgot-password' className='text-primary hover:underline'>
          Request one
        </Link>
      </p>
    </div>
  );
}

export default ResetPasswordForm;
