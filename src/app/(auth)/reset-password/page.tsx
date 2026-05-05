import { Suspense } from 'react';

import AuthLoadingFallback from '@/components/modules/Admin/Auth/AuthLoadingFallback';
import ResetPasswordForm from '@/components/modules/Auth/ResetPasswordForm';

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<AuthLoadingFallback />}>
      <ResetPasswordForm />
    </Suspense>
  );
}
