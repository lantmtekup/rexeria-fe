import * as React from 'react';

import { cn } from '@/lib/cn';

import type {
  BlockBackground,
  ElementPositionsMap,
  ElementStylesMap,
  IgnitexProjectItem,
  IgnitexProjectsContent,
} from '../types';
import {
  blockBackgroundStyle,
  composeStyle,
  elementStyleOf,
  orderStyle,
  positionStyle,
  selectableClass,
} from './applyStyle';

interface IgnitexProjectsProps {
  content: IgnitexProjectsContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
  className?: string;
}

interface ProjectCardProps {
  item: IgnitexProjectItem;
  index: number;
  activeKey?: string | null;
  styleOf: (key: string) => React.CSSProperties | undefined;
}

const ProjectCard = ({ item, index, activeKey, styleOf }: ProjectCardProps) => {
  const imageKey = `items[${index}].imageUrl`;
  const nameKey = `items[${index}].name`;
  const tagKey = `items[${index}].tag`;

  return (
    <a
      href='#'
      onClick={e => e.preventDefault()}
      className='group flex flex-col'
    >
      <div
        data-element-key={imageKey}
        style={styleOf(imageKey)}
        className={selectableClass(
          activeKey === imageKey,
          'relative aspect-[4/3] overflow-hidden rounded-xl'
        )}
      >
        {item.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.imageUrl}
            alt={item.name}
            className='pointer-events-none absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105'
          />
        ) : (
          <div className='pointer-events-none absolute inset-0 bg-[#1a1a1a]' />
        )}
      </div>
      <div className='mt-4 flex items-baseline justify-between gap-3'>
        <h3
          data-element-key={nameKey}
          style={styleOf(nameKey)}
          className={selectableClass(
            activeKey === nameKey,
            'text-xl font-medium'
          )}
        >
          {item.name}
        </h3>
        <span
          data-element-key={tagKey}
          style={styleOf(tagKey)}
          className={selectableClass(
            activeKey === tagKey,
            'shrink-0 text-xs tracking-wide text-white/45 uppercase'
          )}
        >
          {item.tag}
        </span>
      </div>
    </a>
  );
};

/** IgniteX projects — lưới project (ảnh + tên + tag) nền tối. 1/2 cột. */
export function IgnitexProjects({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
  className,
}: IgnitexProjectsProps) {
  const styleOf = (k: string) =>
    composeStyle(
      elementStyleOf(styles, k),
      orderStyle(order, k),
      positionStyle(positions, k)
    );
  const items = Array.isArray(content.items) ? content.items : [];

  return (
    <div
      style={blockBackgroundStyle(background)}
      className={cn(
        '@container w-full bg-[#0a0a0a] px-6 py-16 text-white @2xl:px-12 @2xl:py-24',
        className
      )}
    >
      <div className='mx-auto max-w-6xl'>
        <div className='mb-10 flex items-baseline gap-3 @2xl:mb-14'>
          <h2
            data-element-key='title'
            style={styleOf('title')}
            className={selectableClass(
              activeKey === 'title',
              'text-3xl font-semibold tracking-tight @2xl:text-5xl'
            )}
          >
            {content.title}
          </h2>
          <span
            data-element-key='count'
            style={styleOf('count')}
            className={selectableClass(
              activeKey === 'count',
              'font-serif text-sm text-white/40 italic'
            )}
          >
            {content.count}
          </span>
        </div>
        <div className='grid grid-cols-1 gap-6 @xl:grid-cols-2'>
          {items.map((it, i) => (
            <ProjectCard
              key={i}
              item={it}
              index={i}
              activeKey={activeKey}
              styleOf={styleOf}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
