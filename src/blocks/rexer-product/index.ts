import type { LegacyBlockEntry } from '../types';

import { RexerProduct } from './component';
import { rexerProductSchema } from './schema';

const entry: LegacyBlockEntry = {
  schema: rexerProductSchema,
  Component: RexerProduct,
};
export default entry;
