import type { LegacyBlockEntry } from '../types';

import { HeroOverlay } from './component';
import { heroOverlaySchema } from './schema';

const entry: LegacyBlockEntry = {
  schema: heroOverlaySchema,
  Component: HeroOverlay,
};
export default entry;
