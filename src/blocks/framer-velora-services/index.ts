import type { LegacyBlockEntry } from '../types';

import { FramerVeloraServices } from './component';
import { framerVeloraServicesSchema } from './schema';

const entry: LegacyBlockEntry = {
  schema: framerVeloraServicesSchema,
  Component: FramerVeloraServices,
};
export default entry;
