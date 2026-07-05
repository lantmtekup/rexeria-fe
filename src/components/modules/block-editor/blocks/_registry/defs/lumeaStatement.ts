/** BlockDef `lumea_statement`. */
import { Sparkles, Type } from 'lucide-react';
import { LumeaStatement } from '../../LumeaStatement';
import type { LumeaStatementContent } from '../../../types';
import type { BlockDef } from '../types';
const VI: LumeaStatementContent = {
  eyebrow: 'About Lumea',
  title:
    "Lumea Residence is more than a residence—it's an expression of elegance and exclusivity.",
};
const EN: LumeaStatementContent = { ...VI };
export const lumeaStatementDef: BlockDef<LumeaStatementContent> = {
  type: 'lumea_statement',
  meta: {
    type: 'lumea_statement',
    label: 'Statement - Centered Serif',
    accent: '#a68a5b',
    adminLabel: 'Statement - Centered Serif',
    gradient: 'from-amber-100 to-stone-300',
    defaultName: 'Statement - Centered Serif',
    aiLabelVi: 'câu tuyên ngôn serif lớn căn giữa trên nền kem',
    aiLabelEn: 'large centered serif statement on a cream background',
  },
  component: LumeaStatement,
  defaultContent: { vi: VI, en: EN },
  elements: [
    { key: 'eyebrow', label: 'Eyebrow', icon: Sparkles, fieldType: 'text' },
    { key: 'title', label: 'Tuyên ngôn', icon: Type, fieldType: 'textarea' },
  ],
};
