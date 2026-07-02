import { ImageIcon, MousePointerClick, Pilcrow, Type } from 'lucide-react';

import { FramerFirmaTemplateStrategyDigital } from '../../FramerFirmaTemplateStrategyDigital';
import type { FramerFirmaTemplateStrategyDigitalContent } from '../../../types';
import type { BlockDef } from '../types';

const VI: FramerFirmaTemplateStrategyDigitalContent = {
  imageUrl:
    'https://framerusercontent.com/images/B4jxrHJqCYeKMdfyNVrqx2Gp4.jpg',
  eyebrow: 'CHIẾN LƯỢC / SỐ',
  heading: 'Common Future Co.',
  body: 'Common Future Co. đến với chúng tôi với sứ mệnh lớn nhưng chưa rõ cách truyền tải. Chúng tôi bắt đầu bằng việc tái định vị thông điệp, đặt họ vào vị thế tiên phong nhưng vẫn gần gũi.',
  linkLabel: 'Case Study',
  linkHref: '#case-study',
};

const EN: FramerFirmaTemplateStrategyDigitalContent = {
  ...VI,
  eyebrow: 'STRATEGY / DIGITAL',
  body: 'Common Future Co. came to us with a big mission but little clarity on how to communicate it. We began by rethinking their messaging, positioning them as forward-thinking yet accessible.',
};

export const framerFirmaTemplateStrategyDigitalDef: BlockDef<FramerFirmaTemplateStrategyDigitalContent> =
  {
    type: 'framer_firma_template_strategy_digital',
    meta: {
      type: 'framer_firma_template_strategy_digital',
      label: 'Firma Project Card',
      accent: '#000000',
      adminLabel: 'Project Card (Firma)',
      gradient: 'from-stone-50 to-stone-200',
      defaultName: 'Project Card',
      aiLabelVi:
        'block case-study 2 cột (recon spec): ảnh chân dung vuông trái + card trắng phải với eyebrow, heading serif, body, link gạch chân reveal-on-hover',
      aiLabelEn:
        'two-column case-study block (recon spec): square portrait image left + white card right with eyebrow, serif heading, body, underline-reveal-on-hover link',
    },
    component: FramerFirmaTemplateStrategyDigital,
    defaultContent: { vi: VI, en: EN },
    elements: [
      { key: 'imageUrl', label: 'Ảnh chân dung', icon: ImageIcon },
      { key: 'eyebrow', label: 'Eyebrow', icon: Type },
      { key: 'heading', label: 'Tiêu đề', icon: Type },
      { key: 'body', label: 'Nội dung', icon: Pilcrow },
      { key: 'linkLabel', label: 'Nhãn link', icon: MousePointerClick },
    ],
  };
