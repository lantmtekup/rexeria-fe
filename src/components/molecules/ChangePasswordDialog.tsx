'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/atoms/dialog';
import { Button } from '@/components/atoms/button';
import { rexerApi } from '@/services/rexer/endpoints';
import { RxApiError } from '@/services/rexer/client';
import { cn } from '@/lib/cn';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const MIN_NEW = 8;

export function ChangePasswordDialog({ open, onOpenChange }: Props) {
  const t = useTranslations('app.sidebar');
  const tErrors = useTranslations('errors');
  const tVal = useTranslations('validation');

  const [oldPw, setOldPw] = React.useState('');
  const [newPw, setNewPw] = React.useState('');
  const [confirmPw, setConfirmPw] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);

  React.useEffect(() => {
    if (!open) {
      setOldPw('');
      setNewPw('');
      setConfirmPw('');
      setSubmitting(false);
      setError(null);
      setSuccess(false);
    }
  }, [open]);

  const localValidation = React.useMemo(() => {
    if (!oldPw) return tVal('required');
    if (newPw.length < MIN_NEW) return tVal('minLength');
    if (newPw !== confirmPw) return t('passwordMismatch');
    return null;
  }, [oldPw, newPw, confirmPw, t, tVal]);

  const handleSubmit = async () => {
    if (localValidation) {
      setError(localValidation);
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await rexerApi.auth.changePassword({
        old_password: oldPw,
        new_password: newPw,
      });
      setSuccess(true);
      setTimeout(() => onOpenChange(false), 1200);
    } catch (err) {
      const code =
        err instanceof RxApiError
          ? err.code || err.message
          : 'CHANGE_PASSWORD_FAILED';
      setError(code);
    } finally {
      setSubmitting(false);
    }
  };

  const errorMessage = error
    ? (() => {
        try {
          return (tErrors as (key: string) => string)(error);
        } catch {
          return error;
        }
      })()
    : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('changePasswordTitle')}</DialogTitle>
          <DialogDescription>
            {t('changePasswordSubtitle', { min: MIN_NEW })}
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <p className='text-foreground py-6 text-center text-sm'>
            {t('changePasswordSuccess')}
          </p>
        ) : (
          <div className='flex flex-col gap-3'>
            <Field
              label={t('changePasswordOld')}
              value={oldPw}
              onChange={setOldPw}
              autoComplete='current-password'
            />
            <Field
              label={t('changePasswordNew')}
              value={newPw}
              onChange={setNewPw}
              autoComplete='new-password'
            />
            <Field
              label={t('changePasswordConfirm')}
              value={confirmPw}
              onChange={setConfirmPw}
              autoComplete='new-password'
            />
            {errorMessage && (
              <p className='text-destructive text-xs' role='alert'>
                {errorMessage}
              </p>
            )}
          </div>
        )}

        {!success && (
          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              {t('cancel')}
            </Button>
            <Button
              variant='primary'
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting
                ? t('changePasswordSubmitting')
                : t('changePasswordSubmit')}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}

function Field({
  label,
  value,
  onChange,
  autoComplete,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  autoComplete?: string;
}) {
  return (
    <label className='flex flex-col gap-1'>
      <span className='text-foreground text-xs font-medium'>{label}</span>
      <input
        type='password'
        value={value}
        onChange={e => onChange(e.target.value)}
        autoComplete={autoComplete}
        className={cn(
          'border-input focus-visible:border-ring focus-visible:ring-ring/50',
          'rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:ring-[3px]'
        )}
      />
    </label>
  );
}
