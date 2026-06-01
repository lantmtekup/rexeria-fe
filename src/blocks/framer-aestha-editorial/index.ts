import type { LegacyBlockEntry } from '../types';

import { FramerAesthaEditorial } from './component';
import { framerAesthaEditorialSchema } from './schema';

const entry: LegacyBlockEntry = {
  schema: framerAesthaEditorialSchema,
  Component: FramerAesthaEditorial,
};
export default entry;
