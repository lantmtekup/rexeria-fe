import type { LegacyBlockEntry } from '../types';

import { DelvauxHeroIntro } from './component';
import { delvauxHeroIntroSchema } from './schema';

const entry: LegacyBlockEntry = {
  schema: delvauxHeroIntroSchema,
  Component: DelvauxHeroIntro,
};
export default entry;
