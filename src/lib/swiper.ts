import { Navigation, Autoplay } from 'swiper/modules';
import type { SwiperOptions } from 'swiper/types';

export interface ResponsiveSwiperConfig {
  quantity: number;
  spaceBetween?: number;
  autoplay?: boolean | object;
  autoplayDelay?: number;
  loop?: boolean;
  navigation?: boolean;
  speed?: number;
  freeMode?: boolean | object;
  allowTouchMove?: boolean;
  [x: string]: any;
}

export const createResponsiveSwiperConfig = ({
  quantity,
  spaceBetween = 24,
  autoplay = true,
  autoplayDelay = 3000,
  loop = true,
  navigation = true,
  speed = 500,
  freeMode = false,
  allowTouchMove = true,
  ...rest
}: ResponsiveSwiperConfig): SwiperOptions => {
  const getSlidesPerView = (
    screenSize: 'mobile' | 'mobile-large' | 'tablet' | 'desktop'
  ) => {
    switch (screenSize) {
      case 'mobile':
        return Math.min(quantity, 1);
      case 'mobile-large':
        return Math.min(quantity, 2);
      case 'tablet':
        return Math.min(quantity, 3);
      case 'desktop':
        return Math.min(quantity, 4);
      default:
        return Math.min(quantity, 5);
    }
  };

  const baseConfig: SwiperOptions = {
    modules: [Navigation, Autoplay],
    spaceBetween,
    loop: loop,
    speed: speed,
    freeMode: freeMode,
    allowTouchMove: allowTouchMove,
    autoplay: autoplay
      ? {
          delay: autoplayDelay,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        }
      : false,
    navigation: navigation
      ? {
          nextEl: '.swiper-button-next',
          prevEl: '.swiper-button-prev',
        }
      : false,
    breakpoints: {
      // Mobile (0px - 640px)
      0: {
        slidesPerView: getSlidesPerView('mobile'),
        spaceBetween: spaceBetween * 0.5,
      },
      480: {
        slidesPerView: getSlidesPerView('mobile-large'),
        spaceBetween: spaceBetween * 0.5,
      },
      // Tablet (640px - 1024px)
      640: {
        slidesPerView: getSlidesPerView('tablet'),
        spaceBetween: spaceBetween * 0.75,
      },
      // Desktop (1024px+)
      1024: {
        slidesPerView: getSlidesPerView('desktop'),
        spaceBetween,
      },
    },
    ...rest,
  };

  return baseConfig;
};

// Default config cho backward compatibility
export const swiperConfig = createResponsiveSwiperConfig({
  quantity: 3,
});
