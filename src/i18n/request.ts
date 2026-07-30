import { constants } from '@/settings/constants';
import { getRequestConfig } from 'next-intl/server';
import { cookies, headers } from 'next/headers';

export default getRequestConfig(async () => {
  const cookieLocale = (await cookies()).get(constants.LANGUAGE)?.value;
  const pathname = (await headers()).get('x-pathname') ?? '';
  const fallback = pathname.startsWith('/portal-v2') ? 'en' : 'vi';
  const locale = cookieLocale || fallback;

  try {
    const messages = await Promise.all([
      import(`./messages/common/${locale}.json`),
      import(`./messages/metadata/${locale}.json`),
      import(`./messages/errors/${locale}.json`),
      import(`./messages/home/${locale}.json`),
      import(`./messages/cms/${locale}.json`),
      import(`./messages/auth/${locale}.json`),
      import(`./messages/settings/${locale}.json`),
      import(`./messages/validation/${locale}.json`),
      import(`./messages/upload/${locale}.json`),
      import(`./messages/app/${locale}.json`),
      import(`./messages/feedback/${locale}.json`),
      import(`./messages/admin/${locale}.json`),
      import(`./messages/ai_templates/${locale}.json`),
      import(`./messages/insights/${locale}.json`),
      import(`./messages/portal/${locale}.json`),
      import(`./messages/portal-v2/${locale}.json`),
    ]);

    return {
      locale,
      messages: Object.assign({}, ...messages.map(m => m.default)),
      timeZone: 'Asia/Ho_Chi_Minh',
    };
  } catch {
    return {
      locale,
      messages: {},
      timeZone: 'Asia/Ho_Chi_Minh',
    };
  }
});
