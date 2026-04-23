import { constants } from '@/settings/constants';
import { getRequestConfig } from 'next-intl/server';
import { cookies } from 'next/headers';

export default getRequestConfig(async () => {
  const locale = (await cookies()).get(constants.LANGUAGE)?.value || 'vi';

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
