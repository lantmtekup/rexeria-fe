'use client';

import { useTranslations } from 'next-intl';

import {
  ChoiceField,
  GovBox,
  GovHint,
  KvRow,
  Pill,
  TextField,
} from '@/components/molecules/portal-v2/settings-form';
import {
  ACCOUNT_TYPES,
  PRODUCT_DEFAULT_STATUS,
} from '@/lib/portal-v2/settings/constants';
import { issueFor } from '@/lib/portal-v2/settings/helpers';
import { spacesFor } from '@/lib/portal-v2/settings/mock';
import type {
  AccountType,
  ProductDefaultStatus,
  SettingsData,
  SettingsIssue,
} from '@/lib/portal-v2/settings/types';

type GeneralPanelProps = {
  data: SettingsData;
  editing: boolean;
  issues: SettingsIssue[];
  onChange: (next: SettingsData) => void;
};

export const GeneralPanel = ({
  data,
  editing,
  issues,
  onChange,
}: GeneralPanelProps) => {
  const t = useTranslations('portalV2.settings');
  const g = data.general;
  const account = ACCOUNT_TYPES[g.accountType];
  const spaces = spacesFor(g.accountType, g.orgName);

  const patchGeneral = (partial: Partial<typeof g>) => {
    onChange({ ...data, general: { ...g, ...partial } });
  };

  const orgIssue = issueFor(issues, 'orgName');

  return (
    <>
      <GovBox title={t('boxOrganization')} note={t('noteOrganization')}>
        <div className='grid gap-4 sm:grid-cols-2'>
          <TextField
            label={t('fieldOrgName')}
            value={g.orgName}
            editing={editing}
            error={orgIssue ? t(orgIssue.messageKey) : undefined}
            onChange={v => patchGeneral({ orgName: v })}
          />
          <TextField
            label={t('fieldPlan')}
            value={`${g.orgPlan} · ${g.planTier} · ${t('seats', { count: g.seats })}`}
            editing={false}
          />
        </div>
        <GovHint>{t('hintOrgName')}</GovHint>
      </GovBox>

      <GovBox title={t('boxAccount')} note={account.scope}>
        <div className='grid gap-4 sm:grid-cols-2'>
          <TextField
            label={t('fieldAccountName')}
            value={g.accountName}
            editing={editing}
            onChange={v => patchGeneral({ accountName: v })}
          />
          <TextField
            label={t('fieldAccountTitle')}
            value={g.accountTitle}
            editing={editing}
            onChange={v => patchGeneral({ accountTitle: v })}
          />
          <TextField
            label={t('fieldAccountEmail')}
            value={g.accountEmail}
            editing={editing}
            disabled
            hint={t('hintEmailLocked')}
          />
          <ChoiceField
            label={t('fieldAccountType')}
            value={g.accountType}
            editing={editing}
            options={(Object.keys(ACCOUNT_TYPES) as AccountType[]).map(k => ({
              value: k,
              label: ACCOUNT_TYPES[k].name,
              desc: ACCOUNT_TYPES[k].scope,
            }))}
            hint={account.desc}
            onChange={v => patchGeneral({ accountType: v as AccountType })}
          />
        </div>

        <div className='mt-5'>
          <p className='mb-2 text-[12.5px] font-medium text-[var(--pv2-mut)]'>
            {t('spacesTitle')}
          </p>
          <ul className='divide-y divide-[var(--pv2-hair)] rounded-[10px] border border-[var(--pv2-hair)]'>
            {spaces.map(space => (
              <li
                key={space.name}
                className='flex items-center gap-3 px-3.5 py-2.5'
              >
                <span className='min-w-0 flex-1'>
                  <span className='block truncate text-[13.5px] font-semibold text-[var(--pv2-ink)]'>
                    {space.name}
                  </span>
                  <span className='block truncate text-[11.5px] text-[var(--pv2-faint)]'>
                    {space.desc}
                  </span>
                </span>
                <Pill bg='var(--pv2-canvas)' fg='var(--pv2-mut)'>
                  {space.role}
                </Pill>
              </li>
            ))}
          </ul>
          <GovHint>{t('hintSpaces')}</GovHint>
        </div>
      </GovBox>

      <GovBox title={t('boxDefaults')} note={t('noteDefaults')}>
        <ChoiceField
          className='max-w-[420px]'
          label={t('fieldProductStatus')}
          value={data.defaults.productStatus}
          editing={editing}
          options={(
            Object.keys(PRODUCT_DEFAULT_STATUS) as ProductDefaultStatus[]
          ).map(k => ({
            value: k,
            label: PRODUCT_DEFAULT_STATUS[k].name,
            desc: PRODUCT_DEFAULT_STATUS[k].desc,
          }))}
          onChange={v =>
            onChange({
              ...data,
              defaults: { productStatus: v as ProductDefaultStatus },
            })
          }
        />
        <GovHint>{t('hintProductStatus')}</GovHint>
      </GovBox>

      <GovBox title={t('boxWorkspace')} note={t('noteWorkspace')}>
        <KvRow label={t('kvOrg')} value={g.orgName} />
        <KvRow label={t('kvAccountType')} value={account.name} />
        <KvRow label={t('kvSince')} value={g.since} />
        <KvRow
          label={t('kvSpaces')}
          value={t('spacesCount', { count: spaces.length })}
        />
        <KvRow
          label={t('kvMembers')}
          value={t('membersCount', { count: data.members.length })}
        />
      </GovBox>
    </>
  );
};
