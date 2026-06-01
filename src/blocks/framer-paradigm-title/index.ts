import type { LegacyBlockEntry } from '../types';

import { FramerParadigmTitle } from './component';
import { framerParadigmTitleSchema } from './schema';

const entry: LegacyBlockEntry = {
  schema: framerParadigmTitleSchema,
  Component: FramerParadigmTitle,
};
export default entry;
