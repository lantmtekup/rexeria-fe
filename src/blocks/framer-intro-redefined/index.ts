import type { LegacyBlockEntry } from '../types';

import { FramerIntroRedefined } from './component';
import { framerIntroRedefinedSchema } from './schema';

const entry: LegacyBlockEntry = {
  schema: framerIntroRedefinedSchema,
  Component: FramerIntroRedefined,
};
export default entry;
