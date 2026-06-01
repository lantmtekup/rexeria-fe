import type { LegacyBlockEntry } from '../types';

import { FramerMobiusHero } from './component';
import { framerMobiusHeroSchema } from './schema';

const entry: LegacyBlockEntry = {
  schema: framerMobiusHeroSchema,
  Component: FramerMobiusHero,
};
export default entry;
