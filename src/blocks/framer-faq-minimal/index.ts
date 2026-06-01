import type { LegacyBlockEntry } from '../types';

import { FramerFaqMinimal } from './component';
import { framerFaqMinimalSchema } from './schema';

const entry: LegacyBlockEntry = {
  schema: framerFaqMinimalSchema,
  Component: FramerFaqMinimal,
};
export default entry;
