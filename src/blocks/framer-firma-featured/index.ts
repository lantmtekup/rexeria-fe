import type { LegacyBlockEntry } from '../types';

import { FramerFirmaFeatured } from './component';
import { framerFirmaFeaturedSchema } from './schema';

const entry: LegacyBlockEntry = {
  schema: framerFirmaFeaturedSchema,
  Component: FramerFirmaFeatured,
};
export default entry;
