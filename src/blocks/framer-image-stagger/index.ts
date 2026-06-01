import type { LegacyBlockEntry } from '../types';

import { FramerImageStagger } from './component';
import { framerImageStaggerSchema } from './schema';

const entry: LegacyBlockEntry = {
  schema: framerImageStaggerSchema,
  Component: FramerImageStagger,
};
export default entry;
