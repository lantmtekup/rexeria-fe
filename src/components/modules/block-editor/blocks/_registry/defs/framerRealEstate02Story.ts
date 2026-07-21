import { Image as ImageIcon, Pilcrow, Type } from 'lucide-react';

import { FramerRealEstate02Story } from '../../FramerRealEstate02Story';
import type { LayerElement } from '../../../LayersPanel';
import type { FramerRealEstate02StoryContent } from '../../../types';
import type { BlockDef } from '../types';

const CONTENT: FramerRealEstate02StoryContent = {
  slide1Label: 'AESTHETICS',
  slide1Body:
    'Standing out amidst the urban landscape, Eniteo becomes a tangible symbol of ambition and swift success for its residents. Yet, there is no trace of arrogance in its architecture. Like you, Eniteo is the flesh and blood of the city.',
  slide1ImageUrl:
    'https://framerusercontent.com/images/dZbpLH2jQKdcz8hCAhznj81Hng.jpg',
  slide2Label: 'DIVERSITY',
  slide2Body:
    "The ability to spend time together while still maintaining each person's private space is a core principle in the design",
  slide2ImageUrl:
    'https://framerusercontent.com/images/S4U6X6GFMTxlJd81VmfiHhxdoE.jpg',
  slide3Label: 'SECURITY',
  slide3Body:
    'Eniteo features a fully enclosed courtyard and a video surveillance system that connects with residents and provides reception around the clock.',
  slide3ImageUrl:
    'https://framerusercontent.com/images/PwzYCROy3d7vxv3n75K4cj2vFw.jpg',
};

const slideElements = (n: 1 | 2 | 3): LayerElement[] => {
  const groupId = `slide${n}`;
  return [
    {
      key: `slide${n}Label`,
      label: 'nhãn',
      groupId,
      groupLabel: `Slide ${n}`,
      icon: Type,
      fieldType: 'text',
    },
    {
      key: `slide${n}Body`,
      label: 'mô tả',
      groupId,
      icon: Pilcrow,
      fieldType: 'textarea',
    },
    {
      key: `slide${n}ImageUrl`,
      label: 'ảnh',
      groupId,
      icon: ImageIcon,
      fieldType: 'image',
    },
  ];
};

export const framerRealEstate02StoryDef: BlockDef<FramerRealEstate02StoryContent> =
  {
    type: 'framer_realestate02_story',
    meta: {
      type: 'framer_realestate02_story',
      label: 'RealEstate02 - Story Carousel',
      accent: '#c49f8a',
      adminLabel: 'RealEstate02 - Story Carousel',
      gradient: 'from-amber-100 to-orange-200',
      defaultName: 'Story Carousel',
      aiLabelVi:
        'block "story carousel" 3 slide (AESTHETICS/DIVERSITY/SECURITY): card cố định 375×781, ảnh nền full-bleed, tiêu đề lớn 52px màu #c49f8a chồng lên ảnh, panel caption vuông #c49f8a góc dưới-phải chứa nhãn + mô tả + 2 nút điều hướng + bộ đếm N/3',
      aiLabelEn:
        '3-slide "story carousel" block (AESTHETICS/DIVERSITY/SECURITY): fixed 375×781 card, full-bleed background image, large 52px #c49f8a title overlapping the image, bottom-right #c49f8a square caption panel with label + description + prev/next buttons + N/3 counter',
    },
    component: FramerRealEstate02Story,
    defaultContent: { vi: CONTENT, en: CONTENT },
    elements: [...slideElements(1), ...slideElements(2), ...slideElements(3)],
  };
