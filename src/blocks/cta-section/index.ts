import type { LegacyBlockEntry } from '../types';

import { CtaSection } from './component';
import { ctaSectionSchema } from './schema';

const entry: LegacyBlockEntry = {
  schema: ctaSectionSchema,
  Component: CtaSection,
};
export default entry;
