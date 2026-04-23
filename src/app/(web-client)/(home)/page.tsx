import { getLocale, getTranslations } from 'next-intl/server';

import { HomeWelcomeHero } from '@/components/molecules/HomeWelcomeHero';
import { connectDB } from '@/lib/mongodb';
import { seoConfigService } from '@/server/services/seoConfig.service';
import { Locale } from '@/settings/enums';

export default async function Homepage() {
  const t = await getTranslations('home');
  const localeStr = await getLocale();
  const localeEnum = localeStr === 'en' ? Locale.EN : Locale.VI;
  const contentLocale = localeStr === 'en' ? 'en' : 'vi';

  let dbOk = false;
  try {
    await connectDB();
    dbOk = true;
  } catch {
    dbOk = false;
  }

  const settings = await seoConfigService.getPublicSiteSettings(contentLocale);

  return (
    <HomeWelcomeHero
      title={settings.title ?? t('titleFallback')}
      description={settings.description ?? t('descriptionFallback')}
      logoUrl={settings.logoUrl ?? null}
      logoAlt={settings.title ?? t('logoAlt')}
      dbOk={dbOk}
      dbConnectedLabel={t('dbConnected')}
      dbDisconnectedLabel={t('dbDisconnected')}
      locale={localeEnum}
      welcomeKicker={t('welcomeKicker')}
      cmsCta={t('cmsCta')}
    />
  );
}
