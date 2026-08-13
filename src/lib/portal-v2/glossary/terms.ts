export const GLOSSARY_TERM_IDS = [
  'journeyMining',
  'revenueAtRisk',
  'journeyCoverage',
  'evidenceSeededDraft',
] as const;

export type GlossaryTermId = (typeof GLOSSARY_TERM_IDS)[number];
