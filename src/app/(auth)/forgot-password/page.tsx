import { Suspense } from 'react';

import AuthLoadingFallback from '@/components/modules/Admin/Auth/AuthLoadingFallback';
import ForgotPasswordForm from '@/components/modules/Auth/ForgotPasswordForm';

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<AuthLoadingFallback />}>
      <ForgotPasswordForm />
    </Suspense>
  );
}
