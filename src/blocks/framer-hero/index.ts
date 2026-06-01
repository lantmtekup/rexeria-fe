import type { LegacyBlockEntry } from '../types';

import { FramerHero } from './component';
import { framerHeroSchema } from './schema';

const entry: LegacyBlockEntry = {
  schema: framerHeroSchema,
  Component: FramerHero,
};
export default entry;
