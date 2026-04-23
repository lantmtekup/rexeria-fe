'use client';

import { NextIntlClientProvider } from 'next-intl';
import { Provider } from 'react-redux';
import { store } from '@/store';

interface ProvidersProps {
  children: React.ReactNode;
  locale: string;
  messages: any;
  timezone: string;
}

export default function Providers({
  children,
  locale,
  messages,
  timezone,
}: ProvidersProps) {
  return (
    <Provider store={store}>
      <NextIntlClientProvider
        locale={locale}
        messages={messages}
        timeZone={timezone}
      >
        {children}
      </NextIntlClientProvider>
    </Provider>
  );
}
