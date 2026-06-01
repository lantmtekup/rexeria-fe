import type { LegacyBlockEntry } from '../types';

import { FramerArpeggioHero } from './component';
import { framerArpeggioHeroSchema } from './schema';

const entry: LegacyBlockEntry = {
  schema: framerArpeggioHeroSchema,
  Component: FramerArpeggioHero,
};
export default entry;
