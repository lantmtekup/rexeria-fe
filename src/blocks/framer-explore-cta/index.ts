import type { LegacyBlockEntry } from '../types';

import { FramerExploreCta } from './component';
import { framerExploreCtaSchema } from './schema';

const entry: LegacyBlockEntry = {
  schema: framerExploreCtaSchema,
  Component: FramerExploreCta,
};
export default entry;
