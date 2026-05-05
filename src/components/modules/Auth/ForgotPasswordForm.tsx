'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Copy } from 'lucide-react';
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

function ForgotPasswordForm() {
  const router = useRouter();
  const [email, setEmail] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);
  const [token, setToken] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitting(true);
    try {
      const res = await rexerApi.auth.forgotPassword({ email: email.trim() });
      // BE returns reset_token directly in MVP — surface it so user can use
      // it without an email provider. Will be removed once SMTP is wired.
      if (res.reset_token) {
        setToken(res.reset_token);
        toast.success('Reset token issued (MVP — email not sent)');
      } else {
        toast.success('If the email exists, a reset link has been sent');
      }
    } catch (err) {
      toast.error(`Request failed: ${rxErrorMessage(err)}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (token) {
    return (
      <div className='flex flex-col gap-6'>
        <div>
          <h1 className='text-foreground text-2xl font-semibold tracking-[-0.02em]'>
            Reset token issued
          </h1>
          <p className='text-muted-foreground mt-2 text-sm'>
            BE is in MVP mode and returned the token directly — copy it and
            paste on the next screen.
          </p>
        </div>

        <div className='border-border bg-muted flex items-center justify-between gap-2 rounded-md border p-3'>
          <code className='font-mono text-xs break-all'>{token}</code>
          <Button
            type='button'
            variant='outline'
            size='sm'
            onClick={() => {
              navigator.clipboard.writeText(token);
              toast.success('Token copied');
            }}
          >
            <Copy className='size-3.5' /> Copy
          </Button>
        </div>

        <Button
          type='button'
          variant='primary'
          size='lg'
          className='w-full'
          onClick={() =>
            router.push(`/reset-password?token=${encodeURIComponent(token)}`)
          }
        >
          Continue to reset password
        </Button>

        <p className='text-content-muted text-center text-xs'>
          Wrong email?{' '}
          <button
            type='button'
            onClick={() => setToken(null)}
            className='text-primary hover:underline'
          >
            Try again
          </button>
        </p>
      </div>
    );
  }

  return (
    <div className='flex flex-col gap-6'>
      <div>
        <h1 className='text-foreground text-2xl font-semibold tracking-[-0.02em]'>
          Forgot password?
        </h1>
        <p className='text-muted-foreground mt-2 text-sm'>
          Enter the email tied to your account.
        </p>
      </div>

      <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
        <div className='border-border bg-background overflow-hidden rounded-2xl border'>
          <input
            type='email'
            autoComplete='email'
            placeholder='you@company.com'
            value={email}
            onChange={e => setEmail(e.target.value)}
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
          disabled={submitting || !email.trim()}
        >
          {submitting ? (
            <>
              <Spinner size={14} /> Sending…
            </>
          ) : (
            'Send reset token'
          )}
        </Button>
      </form>

      <p className='text-foreground text-center text-sm'>
        Remembered it?{' '}
        <Link href='/sign-in' className='text-primary hover:underline'>
          Back to sign in
        </Link>
      </p>
    </div>
  );
}

export default ForgotPasswordForm;
