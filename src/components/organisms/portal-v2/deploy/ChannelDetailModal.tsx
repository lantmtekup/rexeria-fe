'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { Button } from '@/components/molecules/portal-v2/Button';
import { Modal } from '@/components/molecules/portal-v2/Modal';
import {
  ChannelBadge,
  ChannelChip,
} from '@/components/organisms/portal-v2/deploy/ChannelChip';
import { DeployNote } from '@/components/organisms/portal-v2/deploy/DeployNote';
import { DomainField } from '@/components/organisms/portal-v2/deploy/DomainField';
import { DEPLOY_CHANNEL_KIND } from '@/lib/portal-v2/deploy/constants';
import { channelStats } from '@/lib/portal-v2/deploy/helpers';
import type {
  DeployBrandDomain,
  DeployChannel,
  LiveDeployRow,
} from '@/lib/portal-v2/deploy/types';
import { cn } from '@/lib/cn';

type ConnectBody = { domainId?: string; shopDomain?: string; token?: string };

type ChannelDetailModalProps = {
  channel: DeployChannel;
  live: LiveDeployRow[];
  domains: DeployBrandDomain[];
  domainSource: 'live' | 'fake';
  onClose: () => void;
  onConnect: (channelId: string, body: ConnectBody) => void;
  onDisconnect: (channelId: string) => void;
  connecting: boolean;
  onCreateDomain: (value: string) => Promise<DeployBrandDomain | null>;
  creatingDomain: boolean;
  onVerifyDomain: (domainId: string) => void;
  verifyingDomainId: string | null;
};

/**
 * Everything flowing through one pipe — or, when it is closed, what it takes
 * to open it. `web` needs a bound domain, `shopify` needs a shop + token,
 * everything else is one click — the BE's `ConnectChannelRequest` shape per
 * kind (spec §11.1), not something this modal invents.
 */
export const ChannelDetailModal = ({
  channel,
  live,
  domains,
  domainSource,
  onClose,
  onConnect,
  onDisconnect,
  connecting,
  onCreateDomain,
  creatingDomain,
  onVerifyDomain,
  verifyingDomainId,
}: ChannelDetailModalProps) => {
  const t = useTranslations('portalV2.deploy');
  const stats = channelStats(channel.id, live);
  const [selectedDomainId, setSelectedDomainId] = useState<string | null>(
    channel.domainId
  );
  const [shopDomain, setShopDomain] = useState('');
  const [token, setToken] = useState('');
  /** Đổi domain ngay trong trạng thái đã kết nối (không cần ngắt → không rớt
   *  trải nghiệm đang chạy — BE `ConnectChannel` chỉ ghi lại config domain). */
  const [changingDomain, setChangingDomain] = useState(false);

  const handleCreateDomain = async (value: string) => {
    const created = await onCreateDomain(value);
    if (created) setSelectedDomainId(created.id);
  };

  if (!channel.connected) {
    const canConnectWeb = channel.kind === 'web' && !!selectedDomainId;
    const canConnectShopify =
      channel.kind === 'shopify' && shopDomain.trim() && token.trim();
    const disabled =
      connecting ||
      (channel.kind === 'web' && !canConnectWeb) ||
      (channel.kind === 'shopify' && !canConnectShopify);

    const connect = () => {
      if (channel.kind === 'web') {
        onConnect(channel.id, { domainId: selectedDomainId ?? undefined });
      } else if (channel.kind === 'shopify') {
        onConnect(channel.id, {
          shopDomain: shopDomain.trim(),
          token: token.trim(),
        });
      } else {
        onConnect(channel.id, {});
      }
    };

    return (
      <Modal
        open
        wide
        onClose={onClose}
        title={channel.name}
        subtitle={t('channelClosedSub', {
          body: t(DEPLOY_CHANNEL_KIND[channel.kind].bodyKey),
        })}
        footer={
          <>
            <span className='flex-1' />
            <Button variant='ghost' size='sm' onClick={onClose}>
              {t('close')}
            </Button>
            <Button
              variant='primary'
              size='sm'
              disabled={disabled}
              onClick={connect}
            >
              {connecting
                ? t('connecting')
                : t('connectChannel', { name: channel.name })}
            </Button>
          </>
        }
      >
        {channel.kind === 'web' ? (
          <div className='space-y-2'>
            {domainSource === 'fake' ? (
              <DeployNote>{t('domainFakeBanner')}</DeployNote>
            ) : null}
            <DomainField
              domains={domains}
              loading={false}
              selectedId={selectedDomainId}
              onSelect={setSelectedDomainId}
              onCreate={handleCreateDomain}
              creating={creatingDomain}
              onVerify={onVerifyDomain}
              verifyingId={verifyingDomainId}
            />
          </div>
        ) : channel.kind === 'shopify' ? (
          <div className='space-y-3'>
            <label className='block'>
              <span className='mb-1 block text-[11px] font-semibold text-[var(--pv2-mut)]'>
                {t('shopifyDomainLabel')}
              </span>
              <input
                value={shopDomain}
                onChange={e => setShopDomain(e.target.value)}
                placeholder={t('shopifyDomainPlaceholder')}
                className='h-8 w-full rounded-[8px] border border-[var(--pv2-hair)] bg-[var(--pv2-paper)] px-2.5 text-[12.5px] text-[var(--pv2-ink)] outline-none focus:border-[var(--pv2-electric)] focus:ring-2 focus:ring-[var(--pv2-electric)]/15'
              />
            </label>
            <label className='block'>
              <span className='mb-1 block text-[11px] font-semibold text-[var(--pv2-mut)]'>
                {t('shopifyTokenLabel')}
              </span>
              <input
                value={token}
                onChange={e => setToken(e.target.value)}
                type='password'
                placeholder={t('shopifyTokenPlaceholder')}
                className='h-8 w-full rounded-[8px] border border-[var(--pv2-hair)] bg-[var(--pv2-paper)] px-2.5 text-[12.5px] text-[var(--pv2-ink)] outline-none focus:border-[var(--pv2-electric)] focus:ring-2 focus:ring-[var(--pv2-electric)]/15'
              />
            </label>
          </div>
        ) : (
          <DeployNote>{t('channelClosedNote')}</DeployNote>
        )}
      </Modal>
    );
  }

  return (
    <Modal
      open
      wide
      onClose={onClose}
      title={channel.name}
      subtitle={t(DEPLOY_CHANNEL_KIND[channel.kind].bodyKey)}
      footer={
        <>
          <Button
            variant='danger'
            size='sm'
            disabled={connecting}
            onClick={() => onDisconnect(channel.id)}
          >
            {connecting ? t('disconnecting') : t('disconnectChannel')}
          </Button>
          <span className='flex-1' />
          <Button variant='ghost' size='sm' onClick={onClose}>
            {t('close')}
          </Button>
        </>
      }
    >
      <div className='flex flex-wrap items-center gap-x-6 gap-y-2 rounded-[var(--pv2-r)] border border-[var(--pv2-hair)] bg-[var(--pv2-canvas)] px-4 py-3 text-[12.5px] text-[var(--pv2-mut)]'>
        <span className='inline-flex items-center gap-1.5'>
          <ChannelBadge channel={channel} />
          {t('channelLiveCount', { count: stats.rows.length })}
        </span>
        <span
          className={cn(
            'font-semibold',
            stats.issues
              ? 'text-[var(--pv2-error)]'
              : 'text-[color-mix(in_srgb,var(--pv2-success)_78%,var(--pv2-ink))]'
          )}
        >
          {stats.issues
            ? t('issuesCount', { count: stats.issues })
            : t('noIssues')}
        </span>
      </div>

      {stats.rows.length ? (
        <ul className='mt-4 divide-y divide-[var(--pv2-hair)] overflow-hidden rounded-[var(--pv2-r)] border border-[var(--pv2-hair)]'>
          {stats.rows.map(row => {
            const onThisChannel = row.channels.find(
              c => c.channelId === channel.id
            );
            return (
              <li
                key={row.id}
                className='flex flex-wrap items-center gap-3 px-3.5 py-2.5'
              >
                <span className='min-w-0 flex-1'>
                  <span className='block truncate text-[13px] font-semibold text-[var(--pv2-ink)]'>
                    {row.experiences[0]?.name ??
                      row.subjectName ??
                      t('untitled')}
                  </span>
                  <span className='block truncate text-[11.5px] text-[var(--pv2-faint)]'>
                    {row.campaign.name}
                    {row.subjectName ? ` · ${row.subjectName}` : ''}
                  </span>
                </span>
                {onThisChannel ? (
                  <ChannelChip
                    channel={channel}
                    health={onThisChannel.health}
                    healthReason={onThisChannel.reason}
                  />
                ) : null}
              </li>
            );
          })}
        </ul>
      ) : (
        <p className='mt-4 rounded-[var(--pv2-r)] border border-dashed border-[var(--pv2-hair)] px-4 py-6 text-center text-[13px] text-[var(--pv2-faint)]'>
          {t('channelNothingLive')}
        </p>
      )}

      {channel.kind === 'web' ? (
        <div className='mt-4 rounded-[var(--pv2-r)] border border-[var(--pv2-hair)] p-3.5'>
          <div className='flex flex-wrap items-center justify-between gap-2'>
            <div className='min-w-0'>
              <p className='text-[10.5px] font-bold tracking-[0.06em] text-[var(--pv2-faint)] uppercase'>
                {t('webDomainCurrentLabel')}
              </p>
              <p className='mt-0.5 truncate font-mono text-[13px] text-[var(--pv2-ink)]'>
                {domains.find(d => d.id === channel.domainId)?.domain ??
                  t('webDomainNone')}
              </p>
            </div>
            {!changingDomain ? (
              <Button
                variant='ghost'
                size='sm'
                onClick={() => {
                  setSelectedDomainId(channel.domainId);
                  setChangingDomain(true);
                }}
              >
                {t('changeDomain')}
              </Button>
            ) : null}
          </div>

          {changingDomain ? (
            <div className='mt-3 space-y-3'>
              {domainSource === 'fake' ? (
                <DeployNote>{t('domainFakeBanner')}</DeployNote>
              ) : null}
              <DomainField
                domains={domains}
                loading={false}
                selectedId={selectedDomainId}
                onSelect={setSelectedDomainId}
                onCreate={handleCreateDomain}
                creating={creatingDomain}
                onVerify={onVerifyDomain}
                verifyingId={verifyingDomainId}
              />
              <p className='text-[11.5px] leading-relaxed text-[var(--pv2-mut)]'>
                {t('domainRebindNote')}
              </p>
              <div className='flex items-center gap-2'>
                <Button
                  variant='primary'
                  size='sm'
                  disabled={
                    connecting ||
                    !selectedDomainId ||
                    selectedDomainId === channel.domainId
                  }
                  onClick={() => {
                    if (selectedDomainId) {
                      onConnect(channel.id, { domainId: selectedDomainId });
                    }
                  }}
                >
                  {connecting ? t('updatingDomain') : t('updateDomain')}
                </Button>
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={() => {
                    setChangingDomain(false);
                    setSelectedDomainId(channel.domainId);
                  }}
                >
                  {t('cancel')}
                </Button>
              </div>
            </div>
          ) : null}
        </div>
      ) : null}

      <DeployNote className='mt-4'>{t('channelOpenNote')}</DeployNote>
    </Modal>
  );
};
