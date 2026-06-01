import type { LegacyBlockEntry } from '../types';

import { FramerStatsGrid } from './component';
import { framerStatsGridSchema } from './schema';

const entry: LegacyBlockEntry = {
  schema: framerStatsGridSchema,
  Component: FramerStatsGrid,
};
export default entry;
