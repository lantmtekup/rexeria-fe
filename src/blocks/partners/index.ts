import type { LegacyBlockEntry } from '../types';

import { Partners } from './component';
import { partnersSchema } from './schema';

const entry: LegacyBlockEntry = {
  schema: partnersSchema,
  Component: Partners,
};
export default entry;
