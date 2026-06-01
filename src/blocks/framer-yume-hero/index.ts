import type { LegacyBlockEntry } from '../types';

import { FramerYumeHero } from './component';
import { framerYumeHeroSchema } from './schema';

const entry: LegacyBlockEntry = {
  schema: framerYumeHeroSchema,
  Component: FramerYumeHero,
};
export default entry;
