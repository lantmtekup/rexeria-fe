import { getTranslations } from 'next-intl/server';

export default async function EpisodesPage() {
  const t = await getTranslations('cms');
  return (
    <div className='p-6'>
      <h1 className='text-foreground text-xl font-semibold'>
        {t('episodesTitle')}
      </h1>
      <p className='text-muted-foreground mt-2 text-sm'>
        {t('episodesDescription')}
      </p>
    </div>
  );
}
