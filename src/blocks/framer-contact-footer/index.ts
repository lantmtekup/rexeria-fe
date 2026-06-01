import type { LegacyBlockEntry } from '../types';

import { FramerContactFooter } from './component';
import { framerContactFooterSchema } from './schema';

const entry: LegacyBlockEntry = {
  schema: framerContactFooterSchema,
  Component: FramerContactFooter,
};
export default entry;
