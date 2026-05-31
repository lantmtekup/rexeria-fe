import type { LegacyBlockEntry } from '../types';

import { Testimonials } from './component';
import { testimonialsSchema } from './schema';

const entry: LegacyBlockEntry = {
  schema: testimonialsSchema,
  Component: Testimonials,
};
export default entry;
