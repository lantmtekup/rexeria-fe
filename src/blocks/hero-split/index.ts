import type { LegacyBlockEntry } from '../types';

import { HeroSplit } from './component';
import { heroSplitSchema } from './schema';

const entry: LegacyBlockEntry = {
  schema: heroSplitSchema,
  Component: HeroSplit,
};
export default entry;
