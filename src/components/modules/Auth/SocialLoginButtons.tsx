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
import { roleHomePath } from '@/lib/auth/roleTarget';
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
      // Explicit redirect (from middleware → /sign-in?redirect=...) wins;
      // otherwise we resolve smartly by role AFTER fetchMe lands the user
      // object in Redux. The placeholder we send to BE is just a fallback
      // for the response shape, not what the FE will navigate to.
      const explicitRedirect = sp.get('redirect');

      const res = await rexerApi.auth.firebaseLogin({
        id_token: idToken,
        intent: 'signin',
        redirect_after: explicitRedirect ?? undefined,
      });

      const me = await dispatch(fetchMeThunk()).unwrap();
      const role = me?.role ?? me?.principal_type ?? '';

      // Mirror local signed cookie for middleware (same pattern as loginThunk),
      // carrying the role so a later revisit of `/` lands on the right home.
      await fetch('/api/auth/session-set', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      });

      let target: string;
      if (explicitRedirect) {
        target = explicitRedirect;
      } else if (res.is_new_user) {
        target = '/onboarding';
      } else {
        // admin / staff → /admin (CMS), brand client_user → /portal.
        target = roleHomePath(role);
      }
      router.replace(target);
    } catch (err) {
      // Log raw error to console for debugging — surface real cause via UI.
      // eslint-disable-next-line no-console
      console.error('[Google login] failed:', err);

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
        // Surface BE error message directly (vd FIREBASE_TOKEN_INVALID,
        // ERR_INTERNAL, ...) thay vì che bằng generic.
        setError(err.code || err.message || 'GOOGLE_OAUTH_FAILED');
      } else if (err instanceof Error) {
        // Surface message để dev biết stage nào fail (vd Network, fetchMe, ...).
        setError(`GOOGLE_OAUTH_FAILED: ${err.message}`);
      } else {
        setError('GOOGLE_OAUTH_FAILED');
      }
      setBusy(false);
    }
  }, [sp, router, dispatch]);

  const errorMessage = error
    ? (() => {
        // Nếu error có suffix (vd "GOOGLE_OAUTH_FAILED: network error"),
        // split lấy code + raw message; hiện "translated key + raw suffix".
        const [code, ...rest] = error.split(':');
        const suffix = rest.join(':').trim();
        try {
          const translated = (tErrors as (key: string) => string)(code);
          return suffix ? `${translated} (${suffix})` : translated;
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
