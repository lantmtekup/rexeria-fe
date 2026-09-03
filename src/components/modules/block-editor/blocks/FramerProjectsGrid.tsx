import * as React from 'react';

import { cn } from '@/lib/cn';

import type {
  BlockBackground,
  ElementPositionsMap,
  ElementStylesMap,
  FramerProjectsGridContent,
} from '../types';
import {
  blockBackgroundStyle,
  composeStyle,
  elementStyleOf,
  orderStyle,
  positionStyle,
  selectableClass,
} from './applyStyle';

interface FramerProjectsGridProps {
  content: FramerProjectsGridContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
  className?: string;
}

/**
 * Projects Grid (framer-projects-grid): nền #F5F3EE, DM Mono eyebrow,
 * Abril Fatface title, lưới 3 cột dự án với hover zoom.
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

const PROJECT_NAME_STYLE: React.CSSProperties = {
  fontFamily: '"Inter", system-ui, sans-serif',
  fontSize: 'clamp(13px, 1.2cqi, 17px)',
  fontWeight: 600,
  color: '#1a1a18',
  margin: 0,
};

const PROJECT_CATEGORY_STYLE: React.CSSProperties = {
  fontFamily: '"DM Mono", "Courier New", monospace',
  fontSize: 'clamp(10px, 0.85cqi, 12px)',
  fontWeight: 400,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  color: '#888880',
  margin: 0,
  marginTop: '0.25em',
};

export function FramerProjectsGrid({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
  className,
}: FramerProjectsGridProps) {
  const styleOf = (key: string) =>
    composeStyle(
      elementStyleOf(styles, key),
      orderStyle(order, key),
      positionStyle(positions, key)
    );

  const projects = Array.isArray(content.projects) ? content.projects : [];

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

        {/* Projects grid — 3-col with container-query fallback */}
        <div
          className='grid gap-[clamp(16px,2.5cqi,32px)]'
          style={{
            gridTemplateColumns:
              'repeat(auto-fill, minmax(min(100%, clamp(200px,28cqi,360px)), 1fr))',
          }}
        >
          {projects.map((project, i) => {
            const imageKey = `project_${i}_imageUrl`;
            const nameKey = `project_${i}_name`;
            const categoryKey = `project_${i}_category`;
            return (
              <div key={i} className='group flex flex-col'>
                {/* Image container with overflow-hidden for zoom effect */}
                <div className='relative aspect-[4/3] w-full overflow-hidden rounded-sm bg-[#dddbd6]'>
                  <div
                    data-element-key={imageKey}
                    style={composeStyle(
                      project.imageUrl
                        ? {
                            backgroundImage: `url("${project.imageUrl.replace(/"/g, '%22')}")`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                          }
                        : undefined,
                      styleOf(imageKey)
                    )}
                    className={selectableClass(
                      activeKey === imageKey,
                      'absolute inset-0 transition-transform duration-500 ease-out group-hover:scale-105'
                    )}
                  />
                </div>
                <div className='mt-[clamp(10px,1.2cqi,16px)]'>
                  <p
                    data-element-key={nameKey}
                    style={composeStyle(PROJECT_NAME_STYLE, styleOf(nameKey))}
                    className={selectableClass(activeKey === nameKey)}
                  >
                    {project.name}
                  </p>
                  {project.category && (
                    <p
                      data-element-key={categoryKey}
                      style={composeStyle(
                        PROJECT_CATEGORY_STYLE,
                        styleOf(categoryKey)
                      )}
                      className={selectableClass(activeKey === categoryKey)}
                    >
                      {project.category}
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
