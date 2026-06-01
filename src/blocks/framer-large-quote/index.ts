import type { LegacyBlockEntry } from '../types';

import { FramerLargeQuote } from './component';
import { framerLargeQuoteSchema } from './schema';

const entry: LegacyBlockEntry = {
  schema: framerLargeQuoteSchema,
  Component: FramerLargeQuote,
};
export default entry;
