import type { LegacyBlockEntry } from '../types';

import { FramerPerformHeroV2 } from './component';
import { framerPerformHeroV2Schema } from './schema';

const entry: LegacyBlockEntry = {
  schema: framerPerformHeroV2Schema,
  Component: FramerPerformHeroV2,
};
export default entry;
