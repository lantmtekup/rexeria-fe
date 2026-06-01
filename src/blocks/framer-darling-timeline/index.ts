import type { LegacyBlockEntry } from '../types';

import { FramerDarlingTimeline } from './component';
import { framerDarlingTimelineSchema } from './schema';

const entry: LegacyBlockEntry = {
  schema: framerDarlingTimelineSchema,
  Component: FramerDarlingTimeline,
};
export default entry;
