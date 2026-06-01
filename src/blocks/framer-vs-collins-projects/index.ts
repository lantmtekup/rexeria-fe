import type { LegacyBlockEntry } from '../types';

import { FramerVsCollinsProjects } from './component';
import { framerVsCollinsProjectsSchema } from './schema';

const entry: LegacyBlockEntry = {
  schema: framerVsCollinsProjectsSchema,
  Component: FramerVsCollinsProjects,
};
export default entry;
