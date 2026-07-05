/** BlockDef `readymag_marquee`. */
import { Circle, Type } from 'lucide-react';
import { ReadymagMarquee } from '../../ReadymagMarquee';
import type { ReadymagMarqueeContent } from '../../../types';
import type { BlockDef } from '../types';
const VI: ReadymagMarqueeContent = {
  text: 'Welcom to our new website',
  pill: 'Book call',
};
const EN: ReadymagMarqueeContent = { ...VI };
export const readymagMarqueeDef: BlockDef<ReadymagMarqueeContent> = {
  type: 'readymag_marquee',
  meta: {
    type: 'readymag_marquee',
    label: 'Marquee - Brutalist Band',
    accent: '#000000',
    adminLabel: 'Marquee - Brutalist Band',
    gradient: 'from-neutral-100 to-neutral-300',
    defaultName: 'Marquee - Brutalist Band',
    aiLabelVi: 'bang chay ngang chu uppercase + pill',
    aiLabelEn: 'scrolling uppercase marquee + pill',
  },
  component: ReadymagMarquee,
  defaultContent: { vi: VI, en: EN },
  elements: [
    { key: 'text', label: 'Chữ chạy', icon: Type, fieldType: 'text' },
    { key: 'pill', label: 'Pill', icon: Circle, fieldType: 'text' },
  ],
};
