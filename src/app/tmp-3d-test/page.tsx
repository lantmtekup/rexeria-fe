'use client';

// DEMO TẠM — preview code-template 3D (R3F). Xoá khi xong.
import LuxCoin3DTemplate from '@/templates/lux-coin-3d';
import { meta as coinMeta } from '@/templates/lux-coin-3d/meta';
import ParticleWave3DTemplate from '@/templates/particle-wave-3d';
import { meta as pwMeta } from '@/templates/particle-wave-3d/meta';
import type { Page } from '@/services/rexer/types';

const defaults = (m: {
  contentSchema?: { fields?: { key: string; default?: unknown }[] };
}) =>
  Object.fromEntries(
    (m.contentSchema?.fields ?? []).map(f => [f.key, f.default])
  );

export default function Tmp3dTest() {
  return (
    <>
      <ParticleWave3DTemplate
        page={{} as Page}
        content={defaults(pwMeta)}
        mode='preview'
      />
      <LuxCoin3DTemplate
        page={{} as Page}
        content={defaults(coinMeta)}
        mode='preview'
      />
    </>
  );
}
