/**
 * Showcase registry — 14 block tương tác do Nguyên (11) + Thảo (3) làm,
 * port từ repo ads_demo-rexer. Mỗi entry là render-fn để lazy-mount.
 *
 * Ảnh local đã copy sang /publichttps://d10zufojjcedud.cloudfront.net/ad-showcase/ (đã nén ≤1280px). Ảnh remote
 * dùng Unsplash. Props tái dựng đúng theo ads_demo /preview.
 */
import HotspotAd from './ads/HotspotAd';
import PannableAd from './ads/PannableAd';
import PannableHotspotAd from './ads/PannableHotspotAd';
import PannableShoppableAd from './ads/PannableShoppableAd';
import PannableAerialAd from './ads/PannableAerialAd';
import SliderCompareAd from './ads/SliderCompareAd';
import DisplacementGalleryAd from './ads/DisplacementGalleryAd';
import Carousel3DAd from './ads/Carousel3DAd';
import ScratchRevealAd from './ads/ScratchRevealAd';
import SwipeStackAd from './ads/SwipeStackAd';
import TapToPlayAd from './ads/TapToPlayAd';
import CountdownAd from './ads/CountdownAd';
import ConfiguratorAd from './ads/ConfiguratorAd';
import StoriesAd from './ads/StoriesAd';
import { ROUTER } from '@/settings/constants/router';

const U = (id, w = 1200) =>
  `https://images.unsplash.com/photo-${id}?w=${w}&q=70&fm=webp&auto=format`;
const IMG = { skyline: U('1486406146926-c627a92ad1ab', 1600) };
const BRAND = { brandName: '', showBrandBar: false };
const CTA = { label: 'Explore Now', href: ROUTER.LANDING.HOME };

/** @typedef {{id:string,name:string,desc:string,by:'Nguyên'|'Thảo',render:()=>JSX.Element}} AdEntry */

export const GROUPS = [
  {
    title: 'Core Interactions',
    subtitle: 'Drag, tap and explore the space',
    items: [
      {
        id: 'hotspot',
        name: 'Hotspot',
        desc: 'Tap hotspots to explore details',
        by: 'Nguyên',
        render: () => (
          <HotspotAd
            backgroundImage='https://d10zufojjcedud.cloudfront.net/ad-showcase/images/hostpot/background.webp'
            headline={'Discover Every\nDetail'}
            hintIcon='https://d10zufojjcedud.cloudfront.net/ad-showcase/icons/hostpot/click_dot.svg'
            ctaFont="'Cormorant Garamond', serif"
            hotspots={[
              {
                id: 'grand-apt',
                x: 34,
                y: 30,
                xDesktop: 47,
                yDesktop: 35,
                label: 'Grand Apartment',
                description:
                  'A spacious apartment with good ventilation, fully furnished and equipped with modern amenities.',
                openWidth: '165px',
              },
              {
                id: 'pool-bar',
                x: 4,
                y: 53.5,
                xDesktop: 54,
                yDesktop: 61,
                label: 'Pool Bar',
                description:
                  'Enjoy delicious drinks & soothing music for a romantic evening.',
                openWidth: '169px',
              },
              {
                id: 'infinity-pool',
                x: 97,
                y: 70,
                xDesktop: 95,
                yDesktop: 70,
                label: 'Infinity Pool',
                description: 'A stunning 40sqm swimming pool.',
                direction: 'right',
                openWidth: '165px',
              },
            ]}
            {...BRAND}
          />
        ),
      },
      {
        id: 'pannable',
        name: 'Pannable',
        desc: 'Drag to explore the panorama',
        by: 'Nguyên',
        render: () => (
          <PannableAd
            imageUrl='https://d10zufojjcedud.cloudfront.net/ad-showcase/images/pannable/background.webp'
            headline='Pan & Explore'
            {...BRAND}
            hotspots={[
              {
                id: 'sofa',
                x: 35,
                y: 55,
                xDesktop: 33,
                yDesktop: 59,
                label: 'Luxury Comfort Sofa',
                description:
                  'Crafted for relaxation with refined details and exceptional comfort.',
              },
              {
                id: 'table',
                x: 46,
                y: 73,
                xDesktop: 50,
                yDesktop: 83,
                label: 'Contemporary Accent Table',
                description:
                  'Elegant proportions and sophisticated finishes create a timeless focal point.',
              },
              {
                id: 'chair',
                x: 66.2,
                y: 53.5,
                xDesktop: 66.2,
                yDesktop: 55,
                label: 'Modern Bar Chair',
                description:
                  'Upholstered comfort and sleek craftsmanship designed for contemporary living spaces.',
              },
            ]}
          />
        ),
      },
      {
        id: 'pannable-hotspot',
        name: 'Pannable + Hotspot',
        desc: 'Drag + tap info points',
        by: 'Nguyên',
        render: () => (
          <PannableHotspotAd
            imageUrl={IMG.skyline}
            hotspots={[
              {
                id: 'a',
                x: 20,
                y: 50,
                xDesktop: 20,
                yDesktop: 50,
                label: 'Tower A',
                description: '45 floors, river view',
              },
              {
                id: 'b',
                x: 50,
                y: 40,
                xDesktop: 50,
                yDesktop: 40,
                label: 'Central Park',
                description: '2ha gardens',
              },
              {
                id: 'c',
                x: 80,
                y: 50,
                xDesktop: 80,
                yDesktop: 50,
                label: 'Tower B',
                description: '40 floors, city view',
              },
            ]}
            headline='Pan & Explore'
            cta={CTA}
            {...BRAND}
          />
        ),
      },
      {
        id: 'pannable-shop',
        name: 'Pannable + Shoppable',
        desc: 'Drag + tap to shop products',
        by: 'Nguyên',
        render: () => (
          <PannableShoppableAd
            imageUrl='https://d10zufojjcedud.cloudfront.net/ad-showcase/images/pannable-shop/background.webp'
            ctas={[
              {
                id: 'amora',
                x: 28,
                y: 53,
                xDesktop: 28,
                yDesktop: 53,
                imageUrl:
                  'https://d10zufojjcedud.cloudfront.net/ad-showcase/images/pannable-shop/sofa.webp',
                label: 'Amora Armchair',
                price: '$1,500',
                href: '#',
              },
              {
                id: 'eichholtz',
                x: 49,
                y: 57,
                xDesktop: 49,
                yDesktop: 57,
                imageUrl:
                  'https://d10zufojjcedud.cloudfront.net/ad-showcase/images/pannable-shop/chair.webp',
                label: 'Eichholtz Leiza Chair',
                price: '$1,200',
                href: '#',
              },
              {
                id: 'ligne',
                x: 50,
                y: 84,
                xDesktop: 50,
                yDesktop: 84,
                imageUrl:
                  'https://d10zufojjcedud.cloudfront.net/ad-showcase/images/pannable-shop/carpet.webp',
                label: 'Ligne Pure',
                price: '$120',
                href: '#',
              },
            ]}
            headline='Drag & Shop'
            {...BRAND}
          />
        ),
      },
      {
        id: 'slider',
        name: 'Slider Compare',
        desc: 'Drag to compare day / night',
        by: 'Nguyên',
        render: () => (
          <SliderCompareAd
            beforeImage='https://d10zufojjcedud.cloudfront.net/ad-showcase/images/slider/day-view.webp'
            afterImage='https://d10zufojjcedud.cloudfront.net/ad-showcase/images/slider/night-view.webp'
            beforeLabel='Day View'
            afterLabel='Night View'
            headline='Day & Night'
            {...BRAND}
          />
        ),
      },
      {
        id: 'interscroller-scroll',
        name: 'Aerial Pan',
        desc: 'Pan the aerial view with pinned details',
        by: 'Nguyên',
        render: () => <PannableAerialAd />,
      },
    ],
  },
  {
    title: 'Gallery & Visual',
    subtitle: 'Showcase with stunning transitions',
    items: [
      {
        id: 'gallery-displacement',
        name: 'Displacement Gallery',
        desc: 'Luxury dissolve transitions',
        by: 'Nguyên',
        render: () => (
          <DisplacementGalleryAd
            slides={[
              {
                imageUrl:
                  'https://d10zufojjcedud.cloudfront.net/ad-showcase/images/gallery-displacement/01.webp',
                title: 'Étoile Éternelle Necklace',
              },
              {
                imageUrl:
                  'https://d10zufojjcedud.cloudfront.net/ad-showcase/images/gallery-displacement/02.webp',
                title: 'Aurum Gala Ring',
              },
              {
                imageUrl:
                  'https://d10zufojjcedud.cloudfront.net/ad-showcase/images/gallery-displacement/03.webp',
                title: 'Lumière Douce Watch',
              },
            ]}
            headline='Luxury Dissolve'
            cta={CTA}
            {...BRAND}
          />
        ),
      },
      {
        id: '3d-carousel',
        name: '3D Carousel',
        desc: 'Drag to spin the product set',
        by: 'Nguyên',
        render: () => (
          <Carousel3DAd
            items={[
              {
                imageUrl:
                  'https://d10zufojjcedud.cloudfront.net/ad-showcase/images/3d/balo.webp',
                title: 'Lecos backpack',
                price: '$250',
              },
              {
                imageUrl:
                  'https://d10zufojjcedud.cloudfront.net/ad-showcase/images/3d/bag-01.webp',
                title: 'Elly high-end leather handbags',
                price: '$450',
              },
              {
                imageUrl:
                  'https://d10zufojjcedud.cloudfront.net/ad-showcase/images/3d/bag-02.webp',
                title: 'Elly handbags',
                price: '$149',
              },
            ]}
            headline='Spin to Explore'
            {...BRAND}
          />
        ),
      },
    ],
  },
  {
    title: 'Video & Story',
    subtitle: 'Interactive video experiences',
    items: [
      {
        id: 'tap-play',
        name: 'Tap to Play',
        desc: 'Poster + tap to play video',
        by: 'Nguyên',
        render: () => (
          <TapToPlayAd
            posterImage='https://d10zufojjcedud.cloudfront.net/ad-showcase/images/video/background-video.webp'
            videoUrl='https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/360/Big_Buck_Bunny_360_10s_1MB.mp4'
            endCard={{ title: 'Ready to Explore?' }}
            {...BRAND}
          />
        ),
      },
      {
        id: 'stories',
        name: 'Stories',
        desc: 'Instagram-style stories',
        by: 'Thảo',
        render: () => (
          <StoriesAd
            stories={[
              {
                imageUrl:
                  'https://d10zufojjcedud.cloudfront.net/ad-showcase/images/stories/03.webp',
                title: 'The Opening',
                subtitle:
                  'Silver confetti rains down under blazing lights as the crowd raises their hands in celebration.',
              },
              {
                imageUrl:
                  'https://d10zufojjcedud.cloudfront.net/ad-showcase/images/stories/05.webp',
                title: 'The Wait',
                subtitle:
                  'In a quieter space, rows of people sit attentively, eyes forward, lit by soft round bokeh lights - anticipation building.',
              },
              {
                imageUrl:
                  'https://d10zufojjcedud.cloudfront.net/ad-showcase/images/stories/01.webp',
                title: 'Stepping In',
                subtitle:
                  'A group walks together through a purple-lit space strung with warm fairy lights, entering the world of sound and color.',
              },
              {
                imageUrl:
                  'https://d10zufojjcedud.cloudfront.net/ad-showcase/images/stories/02.webp',
                title: 'Immersion',
                subtitle:
                  'A massive stage emerges through purple haze, thousands packing the venue, all eyes on the light.',
              },
              {
                imageUrl:
                  'https://d10zufojjcedud.cloudfront.net/ad-showcase/images/stories/04.webp',
                title: 'The Release',
                subtitle:
                  'Confetti explodes into the air under a cool blue glow, hands reaching up to meet the moment.',
              },
            ]}
            duration={4000}
          />
        ),
      },
    ],
  },
  {
    title: 'Touch & Reveal',
    subtitle: 'Tactile interactions that surprise',
    items: [
      {
        id: 'scratch-reveal',
        name: 'Scratch Reveal',
        desc: 'Scratch to reveal the reward',
        by: 'Nguyên',
        render: () => (
          <ScratchRevealAd
            revealImage='https://d10zufojjcedud.cloudfront.net/ad-showcase/images/scratch-reveal/background-gift-card.webp'
            rewardText={'You won\n−20% gift card'}
            couponCode='amz005'
          />
        ),
      },
      {
        id: 'swipe-stack',
        name: 'Swipe Stack',
        desc: 'Swipe through product cards',
        by: 'Nguyên',
        render: () => (
          <SwipeStackAd
            cards={[
              {
                id: 'a',
                imageUrl:
                  'https://d10zufojjcedud.cloudfront.net/ad-showcase/images/swipe-stack/01.webp',
                title: 'Purifying Toothpaste',
                subtitle: '$18',
              },
              {
                id: 'b',
                imageUrl:
                  'https://d10zufojjcedud.cloudfront.net/ad-showcase/images/swipe-stack/02.webp',
                title: 'Everyday Sunscreen',
                subtitle: '$32',
              },
              {
                id: 'c',
                imageUrl:
                  'https://d10zufojjcedud.cloudfront.net/ad-showcase/images/swipe-stack/03.webp',
                title: 'Oleogel Cleanser',
                subtitle: '$24',
              },
            ]}
            headline='Swipe to Explore'
            {...BRAND}
          />
        ),
      },
    ],
  },
  {
    title: 'Promo & Commerce',
    subtitle: 'Drive conversions',
    items: [
      {
        id: 'countdown',
        name: 'Countdown',
        desc: 'Real-time minute:second countdown',
        by: 'Thảo',
        render: () => (
          <CountdownAd
            targetDate='2026-07-15T10:00:00'
            backgroundImage='https://d10zufojjcedud.cloudfront.net/ad-showcase/images/countdown/1.webp'
            title='ReXeR Studio.'
            subtitle={
              <>
                Book a Table early to <br /> get special offers!
              </>
            }
            style='flip'
          />
        ),
      },
      {
        id: 'configurator',
        name: 'Configurator',
        desc: 'Change color and configure the product',
        by: 'Thảo',
        render: () => (
          <ConfiguratorAd
            baseImage='https://d10zufojjcedud.cloudfront.net/ad-showcase/configurator/03.webp'
            options={[
              {
                id: 'style',
                label: 'Choose a Style',
                choices: [
                  {
                    name: 'Deep red',
                    color: '#800010',
                    overlayImage:
                      'https://d10zufojjcedud.cloudfront.net/ad-showcase/configurator/03.webp',
                  },
                  {
                    name: 'Nautic blue',
                    color: '#0f2547',
                    overlayImage:
                      'https://d10zufojjcedud.cloudfront.net/ad-showcase/configurator/02.webp',
                  },
                  {
                    name: 'Emerald green',
                    color: '#0b3621',
                    overlayImage:
                      'https://d10zufojjcedud.cloudfront.net/ad-showcase/configurator/01.webp',
                  },
                ],
              },
              {
                id: 'engine',
                label: 'Choose an Engine',
                choices: [{ name: '270 kW' }, { name: '450 kW' }],
              },
            ]}
            headline='Design Your Space'
          />
        ),
      },
    ],
  },
];

export const ALL_ITEMS = GROUPS.flatMap(g => g.items);
