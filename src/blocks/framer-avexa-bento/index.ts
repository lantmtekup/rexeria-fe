import type { LegacyBlockEntry } from '../types';

import { FramerAvexaBento } from './component';
import { framerAvexaBentoSchema } from './schema';

const entry: LegacyBlockEntry = {
  schema: framerAvexaBentoSchema,
  Component: FramerAvexaBento,
};
export default entry;
