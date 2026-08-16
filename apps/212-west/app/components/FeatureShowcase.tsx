import Image from 'next/image';

import {
  ShowcaseDots,
  ShowcaseLegend,
  ShowcaseMarkers,
  ShowcaseRail,
} from '@/app/components/FeatureShowcaseHotspots';
import { SHOWCASE_CARD_WIDTH, type ShowcaseSection } from '@/app/data/showcase';

const CHIP_TYPE =
  'font-display font-medium uppercase text-white text-xs leading-none md:text-[13px] xl:text-sm';

const HEADING_TYPE =
  'font-display  font-medium uppercase text-[#763718] text-[34px] leading-[31px] md:text-[46px] md:leading-[42px] xl:text-6xl xl:leading-[55px]';

const BODY_TYPE =
  'font-display font-medium uppercase text-black text-[15px] leading-6 md:text-[17px] md:leading-[27px] xl:text-lg xl:leading-7';

const CARD_ANCHOR: Record<ShowcaseSection['cardAnchor'], string> = {
  'top-left': 'xl:top-0 xl:left-0',
  'top-right': 'xl:top-0 xl:right-0',
  'bottom-right': 'xl:right-0 xl:bottom-0',
};

function ShowcasePanel({ section }: { section: ShowcaseSection }) {
  const right = section.align === 'right';
  const hasHotspots = section.hotspots.length > 0;

  return (
    <section
      id={section.key}
      data-panel
      data-showcase
      className={`relative flex w-full flex-col overflow-hidden bg-white xl:block ${
        section.fullHeight ? 'xl:h-svh' : 'xl:aspect-12/7'
      }`}
    >
      <div
        data-media
        className='relative w-full bg-[#0F0F0E]/5 xl:absolute xl:inset-0 xl:h-full'
      >
        <Image
          src={section.image}
          alt={section.imageAlt}
          width={section.imageWidth}
          height={section.imageHeight}
          sizes='100vw'
          className='h-auto w-full object-contain xl:absolute xl:inset-0 xl:h-full xl:object-cover'
        />
        {hasHotspots && (
          <>
            <ShowcaseMarkers
              hotspots={section.hotspots}
              imageWidth={section.imageWidth}
              imageHeight={section.imageHeight}
            />
            <ShowcaseDots hotspots={section.hotspots} />
            <ShowcaseRail hotspots={section.hotspots} />
          </>
        )}
      </div>

      <div
        data-card
        style={{ ['--card-w' as string]: `${SHOWCASE_CARD_WIDTH}%` }}
        className={`relative z-20 flex w-full flex-col bg-white px-5 py-10 xl:absolute xl:w-(--card-w) xl:p-[max(2.78vw,28px)] ${
          CARD_ANCHOR[section.cardAnchor]
        } ${right ? 'xl:items-end xl:text-right' : ''}`}
      >
        <span className={`w-fit bg-[#763718] px-3 py-3 ${CHIP_TYPE}`}>
          {section.chip}
        </span>

        <h2 className={`mt-6 w-fit ${HEADING_TYPE}`}>
          {section.titleLines.map(line => (
            <div key={line} className='w-fit'>
              {line}
            </div>
          ))}
        </h2>

        <p className={`mt-8 xl:max-w-[22.15vw] ${BODY_TYPE}`}>{section.desc}</p>
      </div>

      {hasHotspots && <ShowcaseLegend hotspots={section.hotspots} />}
    </section>
  );
}

export default function FeatureShowcase({
  sections,
}: {
  sections: ShowcaseSection[];
}) {
  return (
    <>
      {sections.map(section => (
        <ShowcasePanel key={section.key} section={section} />
      ))}
    </>
  );
}
