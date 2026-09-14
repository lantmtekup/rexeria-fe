import { readLayers } from '@/lib/journey/layers';
import type { PanelConfig } from '@/lib/journey/panel-types';
import { JOURNEY_GROUND } from '@/lib/journey/chapters';
import PanelJourney from './panel-journey';
import { SceneFrame } from './scene-frame';

/**
 * Một chương của hành trình. Server component: toạ độ và kích thước từng lớp
 * đọc từ tên file và header ảnh ngay trên server, nên không con số nào bị
 * chép tay vào code.
 */
export function JourneyChapter({
  panel,
  groups,
  prevSelector,
  nextSelector,
}: {
  panel: PanelConfig;
  groups: string[];
  prevSelector: string;
  nextSelector?: string;
}) {
  const layers = readLayers(panel.dir, groups);

  return (
    <PanelJourney
      panel={panel}
      layers={layers}
      prevSelector={prevSelector}
      nextSelector={nextSelector}
      ground={JOURNEY_GROUND}
      sceneBlend='normal'
      overlay={<SceneFrame />}
    />
  );
}
