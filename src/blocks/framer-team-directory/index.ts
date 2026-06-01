import type { LegacyBlockEntry } from '../types';

import { FramerTeamDirectory } from './component';
import { framerTeamDirectorySchema } from './schema';

const entry: LegacyBlockEntry = {
  schema: framerTeamDirectorySchema,
  Component: FramerTeamDirectory,
};
export default entry;
