/** BlockDef `firma_statement`. */
import { Sparkles, Type } from 'lucide-react';
import { FirmaStatement } from '../../FirmaStatement';
import type { FirmaStatementContent } from '../../../types';
import type { BlockDef } from '../types';
const VI: FirmaStatementContent = {
  eyebrow: 'What we believe',
  title:
    "We turn bold ideas into standout brands and sleek websites. Let's bring your vision to life.",
};
const EN: FirmaStatementContent = { ...VI };
export const firmaStatementDef: BlockDef<FirmaStatementContent> = {
  type: 'firma_statement',
  meta: {
    type: 'firma_statement',
    label: 'Statement - Serif Centered',
    accent: '#8a7f6a',
    adminLabel: 'Statement - Serif Centered',
    gradient: 'from-stone-100 to-stone-300',
    defaultName: 'Statement - Serif Centered',
    aiLabelVi: 'cau lon serif can giua + eyebrow',
    aiLabelEn: 'large centered serif statement + eyebrow',
  },
  component: FirmaStatement,
  defaultContent: { vi: VI, en: EN },
  elements: [
    { key: 'eyebrow', label: 'Eyebrow', icon: Sparkles, fieldType: 'text' },
    { key: 'title', label: 'Câu', icon: Type, fieldType: 'textarea' },
  ],
};
