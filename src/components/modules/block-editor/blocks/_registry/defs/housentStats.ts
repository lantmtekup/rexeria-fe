/** BlockDef `housent_stats` — dải chỉ số dark band. */
import { Hash, Sparkles } from 'lucide-react';

import { HousentStats } from '../../HousentStats';
import type { HousentStatsContent } from '../../../types';
import type { BlockDef } from '../types';

const VI: HousentStatsContent = {
  eyebrow: 'By The Numbers',
  stats: [
    { value: '$500M+', label: 'Property value transacted' },
    { value: '12k+', label: 'Happy homeowners' },
    { value: '15+ yrs', label: 'Industry experience' },
    { value: '98%', label: 'Client satisfaction' },
    { value: '24/7', label: 'Dedicated support' },
  ],
};
const EN: HousentStatsContent = { ...VI };

export const housentStatsDef: BlockDef<HousentStatsContent> = {
  type: 'housent_stats',
  meta: {
    type: 'housent_stats',
    label: 'Stats - Dark Band',
    accent: '#e8622c',
    adminLabel: 'Stats - Dark Band',
    gradient: 'from-stone-800 to-neutral-900',
    defaultName: 'Stats - Dark Band',
    aiLabelVi: 'dải chỉ số nền tối: hàng 4-5 số liệu lớn màu cam + nhãn',
    aiLabelEn: 'dark stats band: row of 4-5 big orange metrics with labels',
  },
  component: HousentStats,
  defaultContent: { vi: VI, en: EN },
  elements: [
    { key: 'eyebrow', label: 'Eyebrow', icon: Sparkles, fieldType: 'text' },
    { key: 'stats', label: 'Chỉ số', icon: Hash },
  ],
};
