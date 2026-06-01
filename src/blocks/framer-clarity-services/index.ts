import type { LegacyBlockEntry } from '../types';

import { FramerClarityServices } from './component';
import { framerClarityServicesSchema } from './schema';

const entry: LegacyBlockEntry = {
  schema: framerClarityServicesSchema,
  Component: FramerClarityServices,
};
export default entry;
