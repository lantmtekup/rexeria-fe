import { getTranslations } from 'next-intl/server';

export default async function ContactsPage() {
  const t = await getTranslations('cms');
  return (
    <div className='p-6'>
      <h1 className='text-foreground text-xl font-semibold'>
        {t('contactsTitle')}
      </h1>
      <p className='text-muted-foreground mt-2 text-sm'>
        {t('contactsDescription')}
      </p>
    </div>
  );
}
