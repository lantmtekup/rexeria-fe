import type { LegacyBlockEntry } from '../types';

import { PhotoGallery } from './component';
import { photoGallerySchema } from './schema';

const entry: LegacyBlockEntry = {
  schema: photoGallerySchema,
  Component: PhotoGallery,
};
export default entry;
