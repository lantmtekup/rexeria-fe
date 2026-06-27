'use client';

import PannableAd from './PannableAd';
import PanHotspotSystem from './PanHotspotSystem';

/**
 * Pannable + Hotspot Ad — Panorama with interactive hotspot dots.
 * Ref: Polestar https://mobkoi-uk.celtra.com/preview/c119af61
 */
export default function PannableHotspotAd({
  imageUrl,
  imageWidth,
  imageHeight,
  hotspots = [],
  brandName,
  headline,
  subtitle,
  cta,
}) {
  return (
    <PannableAd
      imageUrl={imageUrl}
      imageWidth={imageWidth}
      imageHeight={imageHeight}
      brandName={brandName}
      headline={headline}
      subtitle={subtitle}
      cta={cta}
    >
      <PanHotspotSystem hotspots={hotspots} />
    </PannableAd>
  );
}
