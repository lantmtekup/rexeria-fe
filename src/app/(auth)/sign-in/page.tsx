import { Suspense } from 'react';

import CmsLoginForm from '@/components/modules/Admin/Auth/CmsLoginForm';
import AuthLoadingFallback from '@/components/modules/Admin/Auth/AuthLoadingFallback';

export default function SignInPage() {
  return (
    <Suspense fallback={<AuthLoadingFallback />}>
      <CmsLoginForm />
    </Suspense>
  );
}
