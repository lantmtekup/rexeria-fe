import type { LegacyBlockEntry } from '../types';

import { FramerProjectsGrid } from './component';
import { framerProjectsGridSchema } from './schema';

const entry: LegacyBlockEntry = {
  schema: framerProjectsGridSchema,
  Component: FramerProjectsGrid,
};
export default entry;
