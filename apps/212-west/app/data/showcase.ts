export type ShowcaseHotspot = {
  key: string;
  label: string;
  desc?: string;
  dotX: number;
  dotY: number;
  labelSide: 'top' | 'bottom';
};

export type ShowcaseCurtainPanel = {
  top: number;
  height: number;
  exit: 'up' | 'down';
  isCardColumn?: boolean;
};

export type ShowcaseTextReveal =
  | {
      mode: 'split';
      headingShiftX: number;
      copyShiftX: number;
      copyScaleFrom: number;
    }
  | {
      mode: 'combined';
      groupShiftX: number;
      copyScaleFrom: number;
    };

export type ShowcaseReveal = {
  panels: ShowcaseCurtainPanel[];
  text: ShowcaseTextReveal;
};

export type ShowcaseSection = {
  key: string;
  chip: string;
  titleLines: string[];
  desc: string;
  image: string;
  imageAlt: string;
  imageWidth: number;
  imageHeight: number;
  cardAnchor: 'top-left' | 'top-right' | 'bottom-right';
  align: 'left' | 'right';
  fullHeight?: boolean;
  hotspots: ShowcaseHotspot[];
  reveal?: ShowcaseReveal;
};

export const SHOWCASE_FRAME_RATIO = 12 / 7;

export const SHOWCASE_CARD_WIDTH = 32.5;

export function naturalHotspotPosition(
  hotspot: ShowcaseHotspot,
  imageWidth: number,
  imageHeight: number
) {
  const source = imageWidth / imageHeight;
  if (source < SHOWCASE_FRAME_RATIO) {
    const shown = (100 * SHOWCASE_FRAME_RATIO) / source;
    return {
      x: hotspot.dotX,
      y: ((hotspot.dotY + (shown - 100) / 2) / shown) * 100,
    };
  }
  const shown = (100 * source) / SHOWCASE_FRAME_RATIO;
  return {
    x: ((hotspot.dotX + (shown - 100) / 2) / shown) * 100,
    y: hotspot.dotY,
  };
}

const MARKER_SPACING = 0.085;
const MARKER_INSET = 4;

export function narrowMarkerPositions(
  hotspots: ShowcaseHotspot[],
  imageWidth: number,
  imageHeight: number
) {
  const aspect = imageWidth / imageHeight;
  const points = hotspots.map((hotspot, index) => {
    const at = naturalHotspotPosition(hotspot, imageWidth, imageHeight);
    return { x: at.x / 100, y: at.y / (100 * aspect), index };
  });

  for (let pass = 0; pass < 16; pass += 1) {
    let moved = false;
    for (let i = 0; i < points.length; i += 1) {
      for (let j = i + 1; j < points.length; j += 1) {
        const dx = points[j].x - points[i].x;
        const dy = points[j].y - points[i].y;
        const distance = Math.hypot(dx, dy);
        if (distance >= MARKER_SPACING) continue;
        const push = (MARKER_SPACING - distance) / 2;
        const ux = distance > 1e-6 ? dx / distance : i % 2 === 0 ? 1 : -1;
        const uy = distance > 1e-6 ? dy / distance : 1;
        points[i].x -= ux * push;
        points[i].y -= uy * push;
        points[j].x += ux * push;
        points[j].y += uy * push;
        moved = true;
      }
    }
    if (!moved) break;
  }

  const clamp = (value: number) =>
    Math.min(100 - MARKER_INSET, Math.max(MARKER_INSET, value));

  return points.map(point => ({
    x: clamp(point.x * 100),
    y: clamp(point.y * 100 * aspect),
  }));
}

export const SHOWCASE_SECTIONS: ShowcaseSection[] = [
  {
    key: 'landmark-views',
    chip: 'LOCATION VIEW',
    titleLines: ['Landmark', 'Views'],
    desc: 'Windows with high-performance, sound-attenuating glass welcome abundant light while both buffering city noise and protecting against glare, ultraviolet exposure, and solar heat gain.',
    image: '/assets/designed-for-new-yorkers.jpg',
    imageAlt:
      'Dining room at 212 West 72nd looking out over neighbouring landmark buildings',
    imageWidth: 1535,
    imageHeight: 1024,
    cardAnchor: 'bottom-right',
    align: 'left',
    fullHeight: true,
    hotspots: [],
    reveal: {
      panels: [
        { top: 0, height: 100, exit: 'down' },
        { top: 0, height: 100, exit: 'up' },
        { top: 0, height: 100, exit: 'down' },
        { top: 0, height: 100, exit: 'up', isCardColumn: true },
      ],
      text: {
        mode: 'split',
        headingShiftX: 88,
        copyShiftX: 40,
        copyScaleFrom: 1.357,
      },
    },
  },
  {
    key: 'custom-designed-kitchens',
    chip: 'Kitchens',
    titleLines: ['Custom-Designed', 'Kitchens'],
    desc: 'Subtle details that speak to CetraRuddy’s talent for designing uniquely harmonious interiors include careful alignment of the horizontal and vertical lines of cabinetry and countertops. Cabinets and drawers are fully optimized for storage.',
    image: '/assets/background-custom-designed-kitchens.png',
    imageAlt:
      'Custom-designed kitchen with Miele appliances and quartzite tops',
    imageWidth: 1642,
    imageHeight: 958,
    cardAnchor: 'top-left',
    align: 'left',
    fullHeight: true,
    hotspots: [
      {
        key: 'miele-dishwasher',
        label: 'Miele Dishwasher',
        desc: 'Fully-integrated dishwasher; two dishwashers in select residences',
        dotX: 44.3,
        dotY: 37,
        labelSide: 'bottom',
      },
      {
        key: 'custom-cabinetry',
        label: 'Custom Cabinetry',
        desc: 'Custom white matte lacquer millwork cabinetry with polished nickel pulls. Select residences include full-height pantries',
        dotX: 61.9,
        dotY: 22.3,
        labelSide: 'bottom',
      },
      {
        key: 'blanco-sink',
        label: 'Blanco Sink',
        desc: 'Stainless steel Blanco sink with Insinkerator garbage disposal and polished nickel faucet',
        dotX: 50.5,
        dotY: 49.4,
        labelSide: 'bottom',
      },
      {
        key: 'miele-speed-oven',
        label: 'Miele Speed Oven',
        desc: 'Miele speed oven in brilliant white',
        dotX: 58.5,
        dotY: 45.7,
        labelSide: 'top',
      },
      {
        key: 'miele-oven-cooktop',
        label: 'Miele Oven & Cooktop',
        desc: 'Miele gas cooktop and oven in Brilliant White; two ovens in select residences',
        dotX: 69.9,
        dotY: 44.4,
        labelSide: 'bottom',
      },
      {
        key: 'quartzite',
        label: 'Quartzite',
        desc: 'Quartzite slab backsplash and countertops, featuring waterfall edge; honed finish',
        dotX: 82.7,
        dotY: 53.9,
        labelSide: 'bottom',
      },
      {
        key: 'wine-refrigerator',
        label: 'Wine Refrigerator',
        desc: 'Select residences feature wine refrigerators',
        dotX: 90.5,
        dotY: 48.7,
        labelSide: 'bottom',
      },
      {
        key: 'miele-refrigerator',
        label: 'Miele Refrigerator',
        desc: 'Integrated Miele refrigerator with custom cabinet front panel',
        dotX: 91.8,
        dotY: 17.5,
        labelSide: 'bottom',
      },
    ],
    reveal: {
      panels: [
        { top: 0, height: 100, exit: 'down', isCardColumn: true },
        { top: 0, height: 100, exit: 'up' },
        { top: 0, height: 100, exit: 'down' },
        { top: 0, height: 100, exit: 'up' },
      ],
      text: {
        mode: 'combined',
        groupShiftX: -16,
        copyScaleFrom: 1.25,
      },
    },
  },
  {
    key: 'your-private-sanctuary',
    chip: 'bathroom',
    titleLines: ['Your Private', 'Sanctuary'],
    desc: 'Vanities feature polished nickel accents and large, deep drawers clad in a leathered textile. Medicine cabinets offering abundant storage are framed by a lighted shadow box, and sconces accented by handmade crystal shades cast a romantic light.',
    image: '/assets/background-your-private-sancturary.jpg',
    imageAlt:
      'Primary bathroom with honed marble, double vanity and soaking tub',
    imageWidth: 1747,
    imageHeight: 1350,
    cardAnchor: 'top-right',
    align: 'right',
    hotspots: [
      {
        key: 'fluted-glass-shower',
        label: 'Fluted-Glass Shower',
        desc: 'Ribbed glass encloses the generous shower clad in Venus White marble walls and a marble mosaic patterned floor; Select residences include a recessed niche.',
        dotX: 23.1,
        dotY: 35.1,
        labelSide: 'bottom',
      },
      {
        key: 'soaking-tub',
        label: 'Soaking Tub',
        desc: 'Kohler under-mount soaking tub surrounded in honed Venus White marble',
        dotX: 16.3,
        dotY: 78.2,
        labelSide: 'bottom',
      },
      {
        key: 'honed-marble',
        label: 'Honed Marble',
        desc: 'Venus White marble floors and walls with honed finish',
        dotX: 41.1,
        dotY: 78.9,
        labelSide: 'bottom',
      },
      {
        key: 'double-vanity',
        label: 'Double Vanity',
        desc: 'Vanity by CetraRuddy clad in leathered textile, with deep drawers and custom polished nickel pulls, with a Pure White Caesarstone vanity deck.',
        dotX: 59.1,
        dotY: 72.5,
        labelSide: 'bottom',
      },
      {
        key: 'kohler-water-closet',
        label: 'Kohler Water Closet',
        dotX: 58.2,
        dotY: 66.9,
        labelSide: 'top',
      },
      {
        key: 'original-design-cetraruddy',
        label: 'Original Design by CetraRuddy',
        desc: 'Mirrors, medicine cabinets, and light fixtures by CetraRuddy',
        dotX: 57,
        dotY: 37,
        labelSide: 'bottom',
      },
    ],
  },
];
