'use client';

import { NextIntlClientProvider } from 'next-intl';
import { ThemeProvider } from 'next-themes';
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
        <ThemeProvider
          attribute='class'
          defaultTheme='light'
          enableSystem={false}
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </NextIntlClientProvider>
    </Provider>
  );
}
