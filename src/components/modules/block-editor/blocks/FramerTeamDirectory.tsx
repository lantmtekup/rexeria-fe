import * as React from 'react';

import { cn } from '@/lib/cn';

import type {
  BlockBackground,
  ElementPositionsMap,
  ElementStylesMap,
  FramerTeamDirectoryContent,
} from '../types';
import {
  blockBackgroundStyle,
  composeStyle,
  elementStyleOf,
  orderStyle,
  positionStyle,
  selectableClass,
} from './applyStyle';

interface FramerTeamDirectoryProps {
  content: FramerTeamDirectoryContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
  className?: string;
}

/**
 * Team Directory (framer-team-directory): nền #F5F3EE, DM Mono eyebrow,
 * Abril Fatface title, danh sách hàng ngang có divider cho từng thành viên.
 */

const EYEBROW_STYLE: React.CSSProperties = {
  fontFamily: '"DM Mono", "Courier New", monospace',
  fontSize: 'clamp(10px, 0.9cqi, 13px)',
  fontWeight: 500,
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
  color: '#888880',
  margin: 0,
};

const TITLE_STYLE: React.CSSProperties = {
  fontFamily: '"Abril Fatface", "Georgia", serif',
  fontSize: 'clamp(28px, 5cqi, 72px)',
  fontWeight: 400,
  lineHeight: 1.0,
  letterSpacing: '-0.01em',
  color: '#1a1a18',
  margin: 0,
};

const MEMBER_NAME_STYLE: React.CSSProperties = {
  fontFamily: '"Inter", system-ui, sans-serif',
  fontSize: 'clamp(13px, 1.2cqi, 18px)',
  fontWeight: 600,
  color: '#1a1a18',
  margin: 0,
};

const MEMBER_ROLE_STYLE: React.CSSProperties = {
  fontFamily: '"DM Mono", "Courier New", monospace',
  fontSize: 'clamp(10px, 0.85cqi, 12px)',
  fontWeight: 400,
  letterSpacing: '0.07em',
  textTransform: 'uppercase',
  color: '#888880',
  margin: 0,
};

export function FramerTeamDirectory({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
  className,
}: FramerTeamDirectoryProps) {
  const styleOf = (key: string) =>
    composeStyle(
      elementStyleOf(styles, key),
      orderStyle(order, key),
      positionStyle(positions, key)
    );

  const members = Array.isArray(content.members) ? content.members : [];
  const avatarSize = 'clamp(40px, 4.5cqi, 64px)';

  return (
    <div
      style={blockBackgroundStyle(background)}
      className={cn(
        'animate-in fade-in zoom-in-95 @container relative w-full overflow-hidden rounded-md bg-[#F5F3EE] duration-700 ease-out',
        className
      )}
    >
      <div className='px-[clamp(24px,5cqi,80px)] py-[clamp(40px,7cqi,96px)]'>
        {/* Header */}
        <div className='mb-[clamp(32px,5cqi,64px)]'>
          {content.eyebrow && (
            <p
              data-element-key='eyebrow'
              style={composeStyle(EYEBROW_STYLE, styleOf('eyebrow'))}
              className={selectableClass(activeKey === 'eyebrow', 'mb-[0.6em]')}
            >
              {content.eyebrow}
            </p>
          )}
          <h2
            data-element-key='title'
            style={composeStyle(TITLE_STYLE, styleOf('title'))}
            className={selectableClass(activeKey === 'title')}
          >
            {content.title}
          </h2>
        </div>

        {/* Member list with top divider */}
        <div className='flex flex-col border-t border-[#d6d4cf]'>
          {members.map((member, i) => {
            const avatarKey = `member_${i}_avatarUrl`;
            const nameKey = `member_${i}_name`;
            const roleKey = `member_${i}_role`;
            return (
              <div
                key={i}
                className='flex items-center gap-[clamp(12px,2cqi,24px)] border-b border-[#d6d4cf] py-[clamp(14px,2.2cqi,28px)]'
              >
                {/* Avatar */}
                <div
                  className='shrink-0 overflow-hidden rounded-full bg-[#dddbd6]'
                  style={{ width: avatarSize, height: avatarSize }}
                >
                  <div
                    data-element-key={avatarKey}
                    style={composeStyle(
                      member.avatarUrl
                        ? {
                            backgroundImage: `url("${member.avatarUrl.replace(/"/g, '%22')}")`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                          }
                        : undefined,
                      styleOf(avatarKey)
                    )}
                    className={selectableClass(
                      activeKey === avatarKey,
                      'h-full w-full'
                    )}
                  />
                </div>

                {/* Name + role */}
                <div className='flex min-w-0 flex-1 flex-col'>
                  <p
                    data-element-key={nameKey}
                    style={composeStyle(MEMBER_NAME_STYLE, styleOf(nameKey))}
                    className={selectableClass(
                      activeKey === nameKey,
                      'truncate'
                    )}
                  >
                    {member.name}
                  </p>
                  {member.role && (
                    <p
                      data-element-key={roleKey}
                      style={composeStyle(MEMBER_ROLE_STYLE, styleOf(roleKey))}
                      className={selectableClass(
                        activeKey === roleKey,
                        'mt-[0.2em] truncate'
                      )}
                    >
                      {member.role}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
