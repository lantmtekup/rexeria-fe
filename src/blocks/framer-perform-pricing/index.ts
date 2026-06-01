import type { LegacyBlockEntry } from '../types';

import { FramerPerformPricing } from './component';
import { framerPerformPricingSchema } from './schema';

const entry: LegacyBlockEntry = {
  schema: framerPerformPricingSchema,
  Component: FramerPerformPricing,
};
export default entry;
