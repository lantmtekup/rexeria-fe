import type { LegacyBlockEntry } from '../types';

import { Faq } from './component';
import { faqSchema } from './schema';

const entry: LegacyBlockEntry = { schema: faqSchema, Component: Faq };
export default entry;
