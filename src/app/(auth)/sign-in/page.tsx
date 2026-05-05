import { Suspense } from 'react';

import AuthLoadingFallback from '@/components/modules/Admin/Auth/AuthLoadingFallback';
import RexerSignInForm from '@/components/modules/Auth/RexerSignInForm';

export default function SignInPage() {
  return (
    <Suspense fallback={<AuthLoadingFallback />}>
      <RexerSignInForm />
    </Suspense>
  );
}
