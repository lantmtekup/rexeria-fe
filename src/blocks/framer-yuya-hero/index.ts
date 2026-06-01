import type { LegacyBlockEntry } from '../types';

import { FramerYuyaHero } from './component';
import { framerYuyaHeroSchema } from './schema';

const entry: LegacyBlockEntry = {
  schema: framerYuyaHeroSchema,
  Component: FramerYuyaHero,
};
export default entry;
