'use client';

import AdWrapper from './shared/AdWrapper';
import HotspotSystem from './HotspotSystem';

/**
 * Hotspot Ad — Full-screen image with interactive hotspot dots.
 * Ref: Chloé https://mobkoi-uk.celtra.com/preview/dc7c166b
 *
 * @param {Object} props
 * @param {string} props.backgroundImage - Background image URL
 * @param {Array}  props.hotspots        - Hotspot data array
 * @param {string} props.brandName
 * @param {string} props.headline
 * @param {string} props.hintIcon        -
 */
export default function HotspotAd({
  backgroundImage,
  hotspots = [],
  brandName,
  headline,
  cta,
  hintIcon,
}) {
  return (
    <AdWrapper brandName={brandName} cta={cta} showCta={false} theme='light'>
      <div className='hotspot-ad'>
        <div className='hostpot-ad-title'>{headline}</div>
        {/* Background */}
        <div
          className='hotspot-ad-bg'
          style={{ backgroundImage: `url(${backgroundImage})` }}
        />

        {/* Hotspots */}
        <HotspotSystem hotspots={hotspots} />

        {/* Instruction hint */}
        <div className='hotspot-ad-hint'>
          {hintIcon && (
            <img
              src={hintIcon}
              width='11'
              height='17'
              alt=''
              aria-hidden='true'
            />
          )}
          <span>Tap the dots to explore</span>
        </div>
      </div>
    </AdWrapper>
  );
}
