'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { useTranslations } from 'next-intl';
import {
  GoogleAuthProvider,
  signInWithPopup,
  type AuthError,
} from 'firebase/auth';

import { rexerApi } from '@/services/rexer/endpoints';
import { RxApiError } from '@/services/rexer/client';
import { getFirebaseAuth, isFirebaseConfigured } from '@/lib/firebase';
import { fetchMeThunk } from '@/store/slices/authSlice';
import type { AppDispatch } from '@/store';
import { cn } from '@/lib/cn';

const ALPHA = process.env.NEXT_PUBLIC_ALPHA === '1';

function SocialButton({
  label,
  icon,
  onClick,
  disabled,
  className,
  isLast,
}: {
  label: string;
  icon: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  isLast?: boolean;
}) {
  return (
    <button
      type='button'
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'text-foreground flex w-full cursor-pointer items-center justify-center gap-3 bg-neutral-50 p-5 text-sm font-bold tracking-[-0.02em] transition-colors hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-60',
        !isLast && 'border-border border-b',
        className
      )}
    >
      <span className='flex-1 text-left'>{label}</span>
      <span className='flex size-6 items-center justify-center'>{icon}</span>
    </button>
  );
}

/**
 * Social login. In Alpha only Google is wired (via Firebase Auth — see
 * `docs/be-alpha-spec.md` §B). Facebook & Apple are hidden until BE supports
 * them — Firebase makes adding them mostly a config flip.
 */
export function SocialLoginButtons() {
  const t = useTranslations('auth');
  const tErrors = useTranslations('errors');
  const sp = useSearchParams();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const oauthErr = sp.get('oauth_error');
    if (oauthErr) setError(oauthErr);
  }, [sp]);

  const handleGoogle = React.useCallback(async () => {
    if (!isFirebaseConfigured()) {
      setError('FIREBASE_NOT_CONFIGURED');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const auth = getFirebaseAuth();
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });

      const cred = await signInWithPopup(auth, provider);
      const idToken = await cred.user.getIdToken();
      const redirectAfter = sp.get('redirect') ?? '/home';

      const res = await rexerApi.auth.firebaseLogin({
        id_token: idToken,
        intent: 'signin',
        redirect_after: redirectAfter,
      });

      // Mirror local signed cookie for middleware (same pattern as loginThunk).
      await fetch('/api/auth/session-set', {
        method: 'POST',
        credentials: 'include',
      });
      await dispatch(fetchMeThunk());

      const target =
        res.redirect_after ?? (res.is_new_user ? '/onboarding' : '/home');
      router.replace(target);
    } catch (err) {
      // Firebase popup errors come as AuthError with `.code` like
      // 'auth/popup-closed-by-user'. Map a few common ones.
      if (typeof err === 'object' && err !== null && 'code' in err) {
        const fb = err as AuthError;
        if (fb.code === 'auth/popup-closed-by-user') {
          setError(null);
          setBusy(false);
          return;
        }
        setError(`FIREBASE_${fb.code.replace('auth/', '').toUpperCase()}`);
      } else if (err instanceof RxApiError) {
        setError(err.code || err.message || 'GOOGLE_OAUTH_FAILED');
      } else {
        setError('GOOGLE_OAUTH_FAILED');
      }
      setBusy(false);
    }
  }, [sp, router, dispatch]);

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
    <div className='flex flex-col gap-2'>
      <div className='border-border bg-background overflow-hidden rounded-2xl border'>
        {!ALPHA && (
          <SocialButton
            label={t('continueFacebook')}
            icon={
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src='/brand/social-facebook.svg'
                alt=''
                className='size-6'
                draggable={false}
              />
            }
          />
        )}
        <SocialButton
          label={t('continueGoogle')}
          onClick={handleGoogle}
          disabled={busy}
          isLast={ALPHA}
          icon={
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src='/brand/social-google.svg'
              alt=''
              className='size-6'
              draggable={false}
            />
          }
        />
        {!ALPHA && (
          <SocialButton
            label={t('continueApple')}
            icon={
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src='/brand/social-apple.png'
                alt=''
                className='h-6 w-5 object-contain'
                draggable={false}
              />
            }
            isLast
          />
        )}
      </div>
      {errorMessage && (
        <p className='text-destructive text-xs' role='alert'>
          {errorMessage}
        </p>
      )}
    </div>
  );
}
