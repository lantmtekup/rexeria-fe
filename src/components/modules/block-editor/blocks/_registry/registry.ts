/**
 * Block registry — chỗ DUY NHẤT phải thêm 1 dòng khi có block mới.
 *
 * Block nào xuất hiện ở đây thì renderBlock / factory / LayersPanel /
 * AddBlockDialog tự lấy từ `BlockDef` (xem các file đó: đều đọc registry-first,
 * fallback code cũ cho block CHƯA migrate).
 *
 * PoC: mới migrate `framer_yume_hero`. ~80 block còn lại vẫn chạy đường cũ.
 */
import type { BlockType } from '../../types';
import { delvauxDetailsDef } from './defs/delvauxDetails';
import { delvauxHeaderDef } from './defs/delvauxHeader';
import { delvauxHeroDef } from './defs/delvauxHero';
import { delvauxProductDef } from './defs/delvauxProduct';
import { delvauxSubnavDef } from './defs/delvauxSubnav';
import { delvauxVariantDef } from './defs/delvauxVariant';
import { framerBungeeHeroV2Def } from './defs/framerBungeeHeroV2';
import { framerNftpullTimelineDef } from './defs/framerNftpullTimeline';
import { framerPurevisualsHeroDef } from './defs/framerPurevisualsHero';
import { framerYumeHeroDef } from './defs/framerYumeHero';
import { interactiveAdWidgetDef } from './defs/interactiveAdWidget';
import type { BlockDef } from './types';

export const BLOCK_REGISTRY: Partial<Record<BlockType, BlockDef>> = {
  framer_yume_hero: framerYumeHeroDef as BlockDef,
  framer_bungee_hero_v2: framerBungeeHeroV2Def as BlockDef,
  framer_nftpull_timeline: framerNftpullTimelineDef as BlockDef,
  framer_purevisuals_hero: framerPurevisualsHeroDef as BlockDef,
  delvaux_header: delvauxHeaderDef as BlockDef,
  delvaux_subnav: delvauxSubnavDef as BlockDef,
  delvaux_hero: delvauxHeroDef as BlockDef,
  delvaux_details: delvauxDetailsDef as BlockDef,
  delvaux_product: delvauxProductDef as BlockDef,
  delvaux_variant: delvauxVariantDef as BlockDef,
  interactive_ad_widget: interactiveAdWidgetDef as BlockDef,
};

export function getBlockDef(type: BlockType): BlockDef | undefined {
  return BLOCK_REGISTRY[type];
}

/** Các type đã có BlockDef (để consumer merge vào danh sách / map). */
export const REGISTERED_TYPES = Object.keys(BLOCK_REGISTRY) as BlockType[];
