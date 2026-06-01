import type { LegacyBlockEntry } from '../types';

import { FramerFinneganExpertise } from './component';
import { framerFinneganExpertiseSchema } from './schema';

const entry: LegacyBlockEntry = {
  schema: framerFinneganExpertiseSchema,
  Component: FramerFinneganExpertise,
};
export default entry;
