import type { LegacyBlockEntry } from '../types';

import { FramerSignatureFeature } from './component';
import { framerSignatureFeatureSchema } from './schema';

const entry: LegacyBlockEntry = {
  schema: framerSignatureFeatureSchema,
  Component: FramerSignatureFeature,
};
export default entry;
