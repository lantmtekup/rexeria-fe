import type { LegacyBlockEntry } from '../types';

import { FramerAesthaProjectDetail } from './component';
import { framerAesthaProjectDetailSchema } from './schema';

const entry: LegacyBlockEntry = {
  schema: framerAesthaProjectDetailSchema,
  Component: FramerAesthaProjectDetail,
};
export default entry;
