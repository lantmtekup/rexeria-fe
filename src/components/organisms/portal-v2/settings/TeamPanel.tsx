'use client';

import { Check, Minus, UserPlus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

import { Button } from '@/components/molecules/portal-v2/Button';
import {
  GovBox,
  GovHint,
  Initials,
  Pill,
  RefusalText,
} from '@/components/molecules/portal-v2/settings-form';
import {
  ACCOUNT_TYPES,
  CAPABILITIES,
  MEMBER_ROLES,
  ROLES,
} from '@/lib/portal-v2/settings/constants';
import { issueFor } from '@/lib/portal-v2/settings/helpers';
import type {
  MemberRole,
  SettingsData,
  SettingsIssue,
} from '@/lib/portal-v2/settings/types';

type TeamPanelProps = {
  data: SettingsData;
  editing: boolean;
  issues: SettingsIssue[];
  onChange: (next: SettingsData) => void;
};

export const TeamPanel = ({
  data,
  editing,
  issues,
  onChange,
}: TeamPanelProps) => {
  const t = useTranslations('portalV2.settings');
  const type = data.general.accountType;
  const ownerIssue = issueFor(issues, 'members');

  const setRole = (id: string, role: MemberRole) => {
    onChange({
      ...data,
      members: data.members.map(m => (m.id === id ? { ...m, role } : m)),
    });
  };

  return (
    <>
      <GovBox
        title={t('boxPeople')}
        note={t('seatsUsed', {
          used: data.members.length,
          seats: data.general.seats,
        })}
      >
        <ul className='divide-y divide-[var(--pv2-hair)] rounded-[10px] border border-[var(--pv2-hair)]'>
          {data.members.map(member => (
            <li
              key={member.id}
              className='flex flex-wrap items-center gap-3 px-3.5 py-3'
            >
              <Initials muted={member.pending}>{member.initials}</Initials>
              <span className='min-w-0 flex-1'>
                <span className='flex items-center gap-2'>
                  <span className='truncate text-[13.5px] font-semibold text-[var(--pv2-ink)]'>
                    {member.name}
                  </span>
                  {member.pending ? (
                    <Pill bg='var(--pv2-canvas)' fg='var(--pv2-faint)'>
                      {t('pillPending')}
                    </Pill>
                  ) : null}
                </span>
                <span className='block truncate text-[11.5px] text-[var(--pv2-faint)]'>
                  {member.email} ·{' '}
                  {t('lastActive', { when: member.lastActive })}
                </span>
              </span>

              {editing ? (
                <select
                  aria-label={t('fieldRole')}
                  value={member.role}
                  onChange={e =>
                    setRole(member.id, e.target.value as MemberRole)
                  }
                  className='rounded-[10px] border border-[var(--pv2-hair)] bg-[var(--pv2-paper)] px-2.5 py-1.5 text-[12.5px] text-[var(--pv2-ink)] outline-none focus:border-[var(--pv2-electric)] focus:ring-2 focus:ring-[var(--pv2-electric)]/15'
                >
                  {MEMBER_ROLES.map(r => (
                    <option key={r} value={r}>
                      {ROLES[r].name}
                    </option>
                  ))}
                </select>
              ) : (
                <Pill bg={ROLES[member.role].bg} fg={ROLES[member.role].fg}>
                  {ROLES[member.role].name}
                </Pill>
              )}
            </li>
          ))}
        </ul>

        {ownerIssue ? (
          <RefusalText>{t(ownerIssue.messageKey)}</RefusalText>
        ) : null}

        <div className='mt-3'>
          <Button
            variant='dashed'
            className='h-10'
            onClick={() => toast.message(t('toastInviteSoon'))}
          >
            <UserPlus className='size-[15px]' strokeWidth={2} aria-hidden />
            {t('invite')}
          </Button>
        </div>
        <GovHint>{t('hintPeople')}</GovHint>
      </GovBox>

      <GovBox title={t('boxRoles')} note={t('noteRoles')}>
        <ul className='divide-y divide-[var(--pv2-hair)]'>
          {MEMBER_ROLES.map(r => (
            <li key={r} className='flex items-start gap-3 py-2.5 first:pt-0'>
              <Pill bg={ROLES[r].bg} fg={ROLES[r].fg} className='mt-px'>
                {ROLES[r].name}
              </Pill>
              <span className='min-w-0 flex-1 text-[12.5px] leading-relaxed text-[var(--pv2-mut)]'>
                {ROLES[r].desc}
              </span>
              <span className='shrink-0 text-[11.5px] font-semibold text-[var(--pv2-faint)] tabular-nums'>
                {data.members.filter(m => m.role === r).length}
              </span>
            </li>
          ))}
        </ul>
      </GovBox>

      <GovBox title={t('boxCapabilities')} note={ACCOUNT_TYPES[type].name}>
        <ul className='divide-y divide-[var(--pv2-hair)]'>
          {CAPABILITIES.map(cap => {
            const on = cap.types.includes(type);
            return (
              <li key={cap.id} className='flex items-start gap-3 py-2.5'>
                <span
                  className='mt-0.5 grid size-[18px] shrink-0 place-items-center rounded-full'
                  style={{
                    background: on
                      ? 'color-mix(in srgb, var(--pv2-success) 16%, transparent)'
                      : 'var(--pv2-canvas)',
                    color: on ? 'var(--pv2-success)' : 'var(--pv2-faint)',
                  }}
                >
                  {on ? (
                    <Check className='size-3' strokeWidth={3} aria-hidden />
                  ) : (
                    <Minus className='size-3' strokeWidth={3} aria-hidden />
                  )}
                </span>
                <span className='min-w-0 flex-1'>
                  <span
                    className='block text-[13px] font-semibold'
                    style={{
                      color: on ? 'var(--pv2-ink)' : 'var(--pv2-faint)',
                    }}
                  >
                    {cap.name}
                  </span>
                  <span className='block text-[11.5px] leading-relaxed text-[var(--pv2-mut)]'>
                    {cap.desc}
                  </span>
                </span>
              </li>
            );
          })}
        </ul>
        <GovHint>{t('hintCapabilities')}</GovHint>
      </GovBox>
    </>
  );
};
