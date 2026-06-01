import type { LegacyBlockEntry } from '../types';

import { FramerHorizontalScroll } from './component';
import { framerHorizontalScrollSchema } from './schema';

const entry: LegacyBlockEntry = {
  schema: framerHorizontalScrollSchema,
  Component: FramerHorizontalScroll,
};
export default entry;
