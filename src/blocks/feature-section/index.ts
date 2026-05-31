import type { LegacyBlockEntry } from '../types';

import { FeatureSection } from './component';
import { featureSectionSchema } from './schema';

const entry: LegacyBlockEntry = {
  schema: featureSectionSchema,
  Component: FeatureSection,
};
export default entry;
