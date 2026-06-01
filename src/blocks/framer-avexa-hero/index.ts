import type { LegacyBlockEntry } from '../types';

import { FramerAvexaHero } from './component';
import { framerAvexaHeroSchema } from './schema';

const entry: LegacyBlockEntry = {
  schema: framerAvexaHeroSchema,
  Component: FramerAvexaHero,
};
export default entry;
