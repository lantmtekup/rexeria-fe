import type { LegacyBlockEntry } from '../types';

import { FramerPerformHero } from './component';
import { framerPerformHeroSchema } from './schema';

const entry: LegacyBlockEntry = {
  schema: framerPerformHeroSchema,
  Component: FramerPerformHero,
};
export default entry;
