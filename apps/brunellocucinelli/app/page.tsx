import EndScene from './components/EndScene';
import Hero from './components/Hero';
import Highlights from './components/Highlights';
import PanelJourney from './components/PanelJourney';
import TopicSection from './components/TopicSection';
import {
  readArtwork,
  readHighlights,
  readLifeFamily,
  readTopic,
} from './lib/highlights';
import { readLayers } from './lib/layers';
import {
  AI_PANEL,
  COMPANY_PANEL,
  HC_PANEL,
  LIFE_PANEL,
  SOLOMEO_PANEL,
} from './lib/panels';

export default function Page() {
  const intro = readLayers('01-intro');
  // Thứ tự nhóm = thứ tự chồng, từ xa tới gần (Hero dùng).
  const life = readLayers('03-life', [
    'clouds',
    'farm',
    'midground',
    'memories',
    'foreground',
  ]);
  const hc = readLayers(HC_PANEL.dir);
  const company = readLayers(COMPANY_PANEL.dir);
  const ai = readLayers(AI_PANEL.dir);
  const solomeo = readLayers(SOLOMEO_PANEL.dir);
  const [end] = readLayers('07-end');

  const topics = {
    hc: readTopic('hl-3', 'Humanistic Capitalism and Human Sustainability'),
    company: readTopic('hl-4', 'The company'),
    ai: readTopic('hl-5', 'Technology, Humanism and Artificial Intelligence'),
    solomeo: readTopic('hl-6', 'Solomeo'),
  };

  return (
    <main className='relative bg-[#F8F8F6]'>
      <div className='relative isolate'>
        <Hero intro={intro} life={life} />
        <Highlights items={readHighlights()} artwork={readArtwork()} />

        <PanelJourney
          panel={LIFE_PANEL}
          layers={life}
          prevSelector='#highlights'
          nextSelector='#topic-life'
        />
        <TopicSection id='topic-life' topic={readLifeFamily()} />

        <PanelJourney
          panel={HC_PANEL}
          layers={hc}
          prevSelector='#topic-life'
          nextSelector='#topic-hc'
        />
        <TopicSection id='topic-hc' topic={topics.hc} />

        <PanelJourney
          panel={COMPANY_PANEL}
          layers={company}
          prevSelector='#topic-hc'
          nextSelector='#topic-company'
        />
        <TopicSection id='topic-company' topic={topics.company} />

        <PanelJourney
          panel={AI_PANEL}
          layers={ai}
          prevSelector='#topic-company'
          nextSelector='#topic-ai'
        />
        <TopicSection id='topic-ai' topic={topics.ai} />

        <PanelJourney
          panel={SOLOMEO_PANEL}
          layers={solomeo}
          prevSelector='#topic-ai'
          nextSelector='#topic-solomeo'
        />
        <TopicSection id='topic-solomeo' topic={topics.solomeo} />

        {end && (
          <EndScene
            panel={SOLOMEO_PANEL}
            layers={solomeo}
            end={end}
            prevSelector='#topic-solomeo'
          />
        )}
      </div>
    </main>
  );
}
