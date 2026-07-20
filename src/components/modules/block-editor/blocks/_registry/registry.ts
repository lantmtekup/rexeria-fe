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
import { brightedgeHeroDef } from './defs/brightedgeHero';
import { delvauxDetailsDef } from './defs/delvauxDetails';
import { delvauxHeaderDef } from './defs/delvauxHeader';
import { delvauxHeroDef } from './defs/delvauxHero';
import { delvauxProductDef } from './defs/delvauxProduct';
import { delvauxSubnavDef } from './defs/delvauxSubnav';
import { delvauxVariantDef } from './defs/delvauxVariant';
import { framerBungeeHeroV2Def } from './defs/framerBungeeHeroV2';
import { framerFirmaTemplateStrategyDigitalDef } from './defs/framerFirmaTemplateStrategyDigital';
import { framerFlatWhiteProcessDef } from './defs/framerFlatWhiteProcess';
import { framerEstanciaAboutUsDef } from './defs/framerEstanciaAboutUs';
import { framerNftpullTimelineDef } from './defs/framerNftpullTimeline';
import { framerIgnitexStepDef } from './defs/framerIgnitexStep';
import { framerPurevisualsHeroDef } from './defs/framerPurevisualsHero';
import { framerYumeHeroDef } from './defs/framerYumeHero';
import { protectionScrollytellingDef } from './defs/protectionScrollytelling';
import { readymagMarqueeDef } from './defs/readymagMarquee';
import { readymagProjectsDef } from './defs/readymagProjects';
import { readymagFooterDef } from './defs/readymagFooter';
import { ignitexHeroDef } from './defs/ignitexHero';
import { ignitexServicesDef } from './defs/ignitexServices';
import { ignitexProjectsDef } from './defs/ignitexProjects';
import { ignitexAboutDef } from './defs/ignitexAbout';
import { ignitexCtaDef } from './defs/ignitexCta';
import { ignitexFooterDef } from './defs/ignitexFooter';
import { firmaHeroDef } from './defs/firmaHero';
import { firmaStatementDef } from './defs/firmaStatement';
import { firmaWorkDef } from './defs/firmaWork';
import { firmaTestimonialDef } from './defs/firmaTestimonial';
import { firmaServicesDef } from './defs/firmaServices';
import { firmaFooterDef } from './defs/firmaFooter';
import { nordhavenHeroDef } from './defs/nordhavenHero';
import { nordhavenAboutDef } from './defs/nordhavenAbout';
import { nordhavenServicesDef } from './defs/nordhavenServices';
import { nordhavenPropertiesDef } from './defs/nordhavenProperties';
import { nordhavenTestimonialsDef } from './defs/nordhavenTestimonials';
import { nordhavenFaqDef } from './defs/nordhavenFaq';
import { nordhavenGalleryDef } from './defs/nordhavenGallery';
import { nordhavenFooterDef } from './defs/nordhavenFooter';
import { lumeaAmenitiesDef } from './defs/lumeaAmenities';
import { lumeaFooterDef } from './defs/lumeaFooter';
import { lumeaGalleryDef } from './defs/lumeaGallery';
import { lumeaHandcraftedDef } from './defs/lumeaHandcrafted';
import { lumeaHeroDef } from './defs/lumeaHero';
import { lumeaImmersiveDef } from './defs/lumeaImmersive';
import { lumeaStatementDef } from './defs/lumeaStatement';
import { lumeaTestimonialDef } from './defs/lumeaTestimonial';
import { housentAboutDef } from './defs/housentAbout';
import { housentBlogsDef } from './defs/housentBlogs';
import { housentCtaDef } from './defs/housentCta';
import { housentExcellenceDef } from './defs/housentExcellence';
import { housentOurExcellenceDef } from './defs/housentOurExcellence';
import { housentFaqDef } from './defs/housentFaq';
import { housentFooterDef } from './defs/housentFooter';
import { housentHeroDef } from './defs/housentHero';
import { alturaOlympusDef } from './defs/alturaOlympus';
import { heroScrollDef } from './defs/heroScroll';
import { scrollMattisDef } from './defs/scrollMattis';
import { housentListingsDef } from './defs/housentListings';
import { housentSolutionsDef } from './defs/housentSolutions';
import { housentStatsDef } from './defs/housentStats';
import { housentTestimonialDef } from './defs/housentTestimonial';
import { housentValuesDef } from './defs/housentValues';
import { interactiveAdWidgetDef } from './defs/interactiveAdWidget';
import { q80ExperienceDef } from './defs/q80Experience';
import { q80MenuDef } from './defs/q80Menu';
import { springsContactFooterDef } from './defs/springsContactFooter';
import { springsDesignDef } from './defs/springsDesign';
import { springsGalleryDef } from './defs/springsGallery';
import { springsHeaderDef } from './defs/springsHeader';
import { springsHeroDef } from './defs/springsHero';
import { springsInteriorsDef } from './defs/springsInteriors';
import { springsIntroDef } from './defs/springsIntro';
import { springsMapDef } from './defs/springsMap';
import { realEstateHeroDef } from './defs/realEstateHero';
import { realEstateInfoDef } from './defs/realEstateInfo';
import { realEstateLocationDef } from './defs/realEstateLocation';
import { realEstateHighlightsDef } from './defs/realEstateHighlights';
import { realEstateOverviewDef } from './defs/realEstateOverview';
import { realEstateUtilitiesDef } from './defs/realEstateUtilities';
import { realEstateVillaDef } from './defs/realEstateVilla';
import { springsNaturePlaceDef } from './defs/springsNaturePlace';
import { springsResidencesDef } from './defs/springsResidences';
import { springsWellnessDef } from './defs/springsWellness';
import { sustainitOurExpertiseDef } from './defs/sustainitOurExpertise';
import { readymagCaseSectionDef } from './defs/readymagCaseSection';
import { masteriseHomeInsideDef } from './defs/masteriseHomeInside';
import { pnjHeroDef } from './defs/pnjHero';
import { pnjDetailsDef } from './defs/pnjDetails';
import { pnjVariantDef } from './defs/pnjVariant';
import { pnjHeaderDef } from './defs/pnjHeader';
import { pnjStickyMenuDef } from './defs/pnjStickyMenu';
import { pnjCtaDef } from './defs/pnjCta';
import { mintDiscoverDef } from './defs/mintDiscover';
import { mintV2ProcessDef } from './defs/mintV2Process';
import { mintV2ServicesDef } from './defs/mintV2Services';
import { mintV2WorksDef } from './defs/mintV2Works';
import type { BlockDef } from './types';

export const BLOCK_REGISTRY: Partial<Record<BlockType, BlockDef>> = {
  pnj_hero: pnjHeroDef as BlockDef,
  pnj_details: pnjDetailsDef as BlockDef,
  pnj_variant: pnjVariantDef as BlockDef,
  pnj_header: pnjHeaderDef as BlockDef,
  pnj_sticky_menu: pnjStickyMenuDef as BlockDef,
  pnj_cta: pnjCtaDef as BlockDef,
  mint_discover: mintDiscoverDef as BlockDef,
  mintv2_services: mintV2ServicesDef as BlockDef,
  mintv2_process: mintV2ProcessDef as BlockDef,
  mintv2_works: mintV2WorksDef as BlockDef,
  framer_yume_hero: framerYumeHeroDef as BlockDef,
  framer_bungee_hero_v2: framerBungeeHeroV2Def as BlockDef,
  framer_flat_white_process: framerFlatWhiteProcessDef as BlockDef,
  framer_nftpull_timeline: framerNftpullTimelineDef as BlockDef,
  framer_ignitex_step: framerIgnitexStepDef as BlockDef,
  masterise_home_inside: masteriseHomeInsideDef as BlockDef,
  framer_purevisuals_hero: framerPurevisualsHeroDef as BlockDef,
  delvaux_header: delvauxHeaderDef as BlockDef,
  delvaux_subnav: delvauxSubnavDef as BlockDef,
  delvaux_hero: delvauxHeroDef as BlockDef,
  delvaux_details: delvauxDetailsDef as BlockDef,
  delvaux_product: delvauxProductDef as BlockDef,
  delvaux_variant: delvauxVariantDef as BlockDef,
  q80_experience: q80ExperienceDef as BlockDef,
  q80_menu: q80MenuDef as BlockDef,
  housent_hero: housentHeroDef as BlockDef,
  altura_olympus: alturaOlympusDef as BlockDef,
  hero_scroll: heroScrollDef as BlockDef,
  scroll_mattis: scrollMattisDef as BlockDef,
  housent_stats: housentStatsDef as BlockDef,
  housent_listings: housentListingsDef as BlockDef,
  housent_cta: housentCtaDef as BlockDef,
  housent_footer: housentFooterDef as BlockDef,
  housent_about: housentAboutDef as BlockDef,
  housent_excellence: housentExcellenceDef as BlockDef,
  housent_our_excellence: housentOurExcellenceDef as BlockDef,
  housent_solutions: housentSolutionsDef as BlockDef,
  housent_values: housentValuesDef as BlockDef,
  housent_faq: housentFaqDef as BlockDef,
  housent_testimonial: housentTestimonialDef as BlockDef,
  housent_blogs: housentBlogsDef as BlockDef,
  lumea_hero: lumeaHeroDef as BlockDef,
  lumea_statement: lumeaStatementDef as BlockDef,
  lumea_immersive: lumeaImmersiveDef as BlockDef,
  lumea_handcrafted: lumeaHandcraftedDef as BlockDef,
  lumea_amenities: lumeaAmenitiesDef as BlockDef,
  lumea_testimonial: lumeaTestimonialDef as BlockDef,
  lumea_gallery: lumeaGalleryDef as BlockDef,
  lumea_footer: lumeaFooterDef as BlockDef,
  nordhaven_hero: nordhavenHeroDef as BlockDef,
  nordhaven_about: nordhavenAboutDef as BlockDef,
  nordhaven_services: nordhavenServicesDef as BlockDef,
  nordhaven_properties: nordhavenPropertiesDef as BlockDef,
  nordhaven_testimonials: nordhavenTestimonialsDef as BlockDef,
  nordhaven_faq: nordhavenFaqDef as BlockDef,
  nordhaven_gallery: nordhavenGalleryDef as BlockDef,
  nordhaven_footer: nordhavenFooterDef as BlockDef,
  firma_hero: firmaHeroDef as BlockDef,
  firma_statement: firmaStatementDef as BlockDef,
  firma_work: firmaWorkDef as BlockDef,
  firma_testimonial: firmaTestimonialDef as BlockDef,
  firma_services: firmaServicesDef as BlockDef,
  firma_footer: firmaFooterDef as BlockDef,
  ignitex_hero: ignitexHeroDef as BlockDef,
  ignitex_services: ignitexServicesDef as BlockDef,
  ignitex_projects: ignitexProjectsDef as BlockDef,
  ignitex_about: ignitexAboutDef as BlockDef,
  ignitex_cta: ignitexCtaDef as BlockDef,
  ignitex_footer: ignitexFooterDef as BlockDef,
  readymag_marquee: readymagMarqueeDef as BlockDef,
  readymag_projects: readymagProjectsDef as BlockDef,
  readymag_footer: readymagFooterDef as BlockDef,
  protection_scrollytelling: protectionScrollytellingDef as BlockDef,
  interactive_ad_widget: interactiveAdWidgetDef as BlockDef,
  brightedge_hero: brightedgeHeroDef as BlockDef,
  springs_header: springsHeaderDef as BlockDef,
  springs_gallery: springsGalleryDef as BlockDef,
  springs_hero: springsHeroDef as BlockDef,
  springs_intro: springsIntroDef as BlockDef,
  springs_wellness: springsWellnessDef as BlockDef,
  springs_nature_place: springsNaturePlaceDef as BlockDef,
  springs_map: springsMapDef as BlockDef,
  real_estate_location: realEstateLocationDef as BlockDef,
  real_estate_hero: realEstateHeroDef as BlockDef,
  real_estate_info: realEstateInfoDef as BlockDef,
  real_estate_overview: realEstateOverviewDef as BlockDef,
  real_estate_highlights: realEstateHighlightsDef as BlockDef,
  real_estate_villa: realEstateVillaDef as BlockDef,
  real_estate_utilities: realEstateUtilitiesDef as BlockDef,
  springs_design: springsDesignDef as BlockDef,
  springs_residences: springsResidencesDef as BlockDef,
  springs_interiors: springsInteriorsDef as BlockDef,
  springs_contact_footer: springsContactFooterDef as BlockDef,
  sustainit_our_expertise: sustainitOurExpertiseDef as BlockDef,
  framer_firma_template_strategy_digital:
    framerFirmaTemplateStrategyDigitalDef as BlockDef,
  readymag_case_section: readymagCaseSectionDef as BlockDef,
  framer_estancia_about_us: framerEstanciaAboutUsDef as BlockDef,
};

export function getBlockDef(type: BlockType): BlockDef | undefined {
  return BLOCK_REGISTRY[type];
}

/** Các type đã có BlockDef (để consumer merge vào danh sách / map). */
export const REGISTERED_TYPES = Object.keys(BLOCK_REGISTRY) as BlockType[];
