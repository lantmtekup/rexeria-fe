import type { LegacyBlockEntry } from '../types';

import { FramerStudioManifesto } from './component';
import { framerStudioManifestoSchema } from './schema';

const entry: LegacyBlockEntry = {
  schema: framerStudioManifestoSchema,
  Component: FramerStudioManifesto,
};
export default entry;
