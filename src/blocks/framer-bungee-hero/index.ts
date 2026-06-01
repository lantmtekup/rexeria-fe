import type { LegacyBlockEntry } from '../types';

import { FramerBungeeHero } from './component';
import { framerBungeeHeroSchema } from './schema';

const entry: LegacyBlockEntry = {
  schema: framerBungeeHeroSchema,
  Component: FramerBungeeHero,
};
export default entry;
