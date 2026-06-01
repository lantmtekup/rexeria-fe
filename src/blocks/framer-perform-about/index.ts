import type { LegacyBlockEntry } from '../types';

import { FramerPerformAbout } from './component';
import { framerPerformAboutSchema } from './schema';

const entry: LegacyBlockEntry = {
  schema: framerPerformAboutSchema,
  Component: FramerPerformAbout,
};
export default entry;
