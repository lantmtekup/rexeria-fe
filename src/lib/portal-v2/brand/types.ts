export type BrandIdentity = {
  name: string;
  description: string;
  mission: string;
  valueProp: string;
  positioning: {
    category: string;
    against: string;
    because: string;
  };
  categories: string[];
  industry: string;
  differentiation: string[];
  tones: string[];
};

export type BrandEssence = {
  functional: string[];
  emotional: string[];
  social: string[];
  personality: string[];
  perception: string;
};

export type BrandPersona = {
  id: string;
  n: string;
  tier: string;
  stage: string;
  awareness: string;
  motivations: string[];
  objections: string[];
  action: string;
  desired: string;
};

export type BrandLogo = {
  id: string;
  n: string;
  use: string;
  asset: string | null;
};

export type BrandColor = {
  id: string;
  n: string;
  hex: string;
  role: string;
};

export type BrandVisual = {
  logos: BrandLogo[];
  colors: BrandColor[];
  type: {
    display: string;
    body: string;
    weights: string;
    scale: string;
    files: string[];
  };
  layout: string[];
  imagery: {
    direction: string;
    refs: string[];
  };
};

export type BrandData = {
  identity: BrandIdentity;
  essence: BrandEssence;
  audience: BrandPersona[];
  visual: BrandVisual;
};

export type BrandTabId = 'identity' | 'essence' | 'audience' | 'visual';
