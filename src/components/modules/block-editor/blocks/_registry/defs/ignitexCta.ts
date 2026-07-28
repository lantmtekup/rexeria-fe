/** BlockDef `ignitex_cta`. */
import { MousePointerClick, Type } from 'lucide-react';
import { IgnitexCta } from '../../IgnitexCta';
import type { IgnitexCtaContent } from '../../../types';
import type { BlockDef } from '../types';
const VI: IgnitexCtaContent = {
  title: "Let's build something bold.",
  buttonLabel: 'Start a project',
};
const EN: IgnitexCtaContent = { ...VI };
export const ignitexCtaDef: BlockDef<IgnitexCtaContent> = {
  type: 'ignitex_cta',
  meta: {
    type: 'ignitex_cta',
    label: 'CTA - Big Type',
    accent: '#111111',
    adminLabel: 'CTA - Big Type',
    gradient: 'from-neutral-800 to-neutral-950',
    defaultName: 'CTA - Big Type',
    aiLabelVi: 'heading khong lo + nut nen toi',
    aiLabelEn: 'giant CTA heading + button on dark',
  },
  component: IgnitexCta,
  defaultContent: { vi: VI, en: EN },
  elements: [
    { key: 'title', label: 'Tiêu đề', icon: Type, fieldType: 'text' },
    { key: 'button', label: 'Nút', icon: MousePointerClick, fieldType: 'text' },
  ],
};
