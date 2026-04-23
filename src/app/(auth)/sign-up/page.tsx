import { Suspense } from 'react';

import AuthLoadingFallback from '@/components/modules/Admin/Auth/AuthLoadingFallback';
import RexerSignUpForm from '@/components/modules/Auth/RexerSignUpForm';

export default function SignUpPage() {
  return (
    <Suspense fallback={<AuthLoadingFallback />}>
      <RexerSignUpForm />
    </Suspense>
  );
}
