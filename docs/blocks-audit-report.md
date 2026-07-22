# Blocks inventory report

> Generated: 2026-07-20 · Rescanned (incl. Cool Hunter footer) · Source: `BLOCK_TYPE_META` (169 types) · Preview base: `http://localhost:3000/dev/blocks`

**Scope:** catalog + animation classification. Host-contract audit (`apps-port-audit`) is **deferred**.

---

## 1. Summary

| STT | Metric | Count |
|---:|---|---:|
| 1 | **BlockType** (canonical) | **169** |
| 2 | Has BlockDef (Path A registry) | 103 |
| 3 | Legacy path (no BlockDef) | 66 |
| 4 | With any animation tag | 132 (78.1%) |
| 5 | No meaningful animation | 37 (21.9%) |
| 6 | Unique components | 167 |

Gallery index: [http://localhost:3000/dev/blocks](http://localhost:3000/dev/blocks)

## 2. By category

| STT | Category | Count |
|---:|---|---:|
| 1 | hero | 28 |
| 2 | gallery | 20 |
| 3 | feature | 19 |
| 4 | intro | 19 |
| 5 | trust | 10 |
| 6 | interactive | 9 |
| 7 | portfolio | 9 |
| 8 | cta | 8 |
| 9 | footer | 7 |
| 10 | services | 7 |
| 11 | progress | 6 |
| 12 | pricing | 5 |
| 13 | header | 4 |
| 14 | listing | 4 |
| 15 | amenity | 3 |
| 16 | faq | 3 |
| 17 | location | 2 |
| 18 | marquee | 2 |
| 19 | navigation | 2 |
| 20 | blog | 1 |
| 21 | form | 1 |

## 3. Animation aggregates

A block may belong to multiple groups (overlap OK).

| STT | Group | Blocks | % of 169 | Definition |
|---:|---|---:|---:|---|
| 1 | text | 18 | 10.7% | SplitText / char-stagger / word-reveal / equalizer / displace |
| 2 | image | 71 | 42.0% | Parallax, clipPath, Flip, trail/explosion, media scale |
| 3 | scroll | 73 | 43.2% | ScrollTrigger / scrub / pin / useBlockMotion scroll |
| 4 | hover | 22 | 13.0% | whileHover, group-hover media, mouse parallax, GSAP hover |
| 5 | entrance | 114 | 67.5% | mount / inView / animate-in / load timeline |
| 6 | other | 35 | 20.7% | Marquee, carousel, drawer, accordion, loop keyframes |
| 7 | none | 37 | 21.9% | No meaningful motion |

### Motion stack (unique components)

| STT | Stack | Components |
|---:|---|---:|
| 1 | GSAP / useBlockMotion / ScrollTrigger | 81 |
| 2 | CSS (`animate-in` / `@keyframes`) | 51 |
| 3 | framer-motion (real import) | 2 |

---

## 4. Animation groups

### Text animation (18)

| STT | type_code | Component | Category | Preview |
|---:|---|---|---|---|
| 1 | `delvaux_details` | DelvauxDetails | intro | [open](http://localhost:3000/dev/blocks?type=delvaux_details) |
| 2 | `framer_flat_white_process` | FramerFlatWhiteProcess | progress | [open](http://localhost:3000/dev/blocks?type=framer_flat_white_process) |
| 3 | `framer_perform_hero` | FramerPerformHero | hero | [open](http://localhost:3000/dev/blocks?type=framer_perform_hero) |
| 4 | `housent_hero` | HousentHero | hero | [open](http://localhost:3000/dev/blocks?type=housent_hero) |
| 5 | `hover_equalizer_heading` | HoverEqualizerHeading | interactive | [open](http://localhost:3000/dev/blocks?type=hover_equalizer_heading) |
| 6 | `letter_slider` | LetterSlider | interactive | [open](http://localhost:3000/dev/blocks?type=letter_slider) |
| 7 | `masterise_home_inside` | MasteriseHomeInside | intro | [open](http://localhost:3000/dev/blocks?type=masterise_home_inside) |
| 8 | `mint_details` | MintDetails | feature | [open](http://localhost:3000/dev/blocks?type=mint_details) |
| 9 | `mint_hero` | MintHero | hero | [open](http://localhost:3000/dev/blocks?type=mint_hero) |
| 10 | `mint_sku` | MintSku | pricing | [open](http://localhost:3000/dev/blocks?type=mint_sku) |
| 11 | `mintv2_emblem` | MintV2Emblem | intro | [open](http://localhost:3000/dev/blocks?type=mintv2_emblem) |
| 12 | `mintv2_manifesto` | MintV2Manifesto | intro | [open](http://localhost:3000/dev/blocks?type=mintv2_manifesto) |
| 13 | `mintv2_process` | MintV2Process | progress | [open](http://localhost:3000/dev/blocks?type=mintv2_process) |
| 14 | `mintv2_services` | MintV2Services | services | [open](http://localhost:3000/dev/blocks?type=mintv2_services) |
| 15 | `mintv2_works` | MintV2Works | portfolio | [open](http://localhost:3000/dev/blocks?type=mintv2_works) |
| 16 | `pnj_details` | PnjDetails | intro | [open](http://localhost:3000/dev/blocks?type=pnj_details) |
| 17 | `pnj_hero` | PnjHero | hero | [open](http://localhost:3000/dev/blocks?type=pnj_hero) |
| 18 | `text_displace_hero` | TextDisplaceHero | hero | [open](http://localhost:3000/dev/blocks?type=text_displace_hero) |

### Image / media animation (71)

| STT | type_code | Component | Category | Preview |
|---:|---|---|---|---|
| 1 | `accordion_media` | AccordionMedia | feature | [open](http://localhost:3000/dev/blocks?type=accordion_media) |
| 2 | `altura_olympus` | AlturaOlympus | intro | [open](http://localhost:3000/dev/blocks?type=altura_olympus) |
| 3 | `brightedge_hero` | BrightedgeHero | hero | [open](http://localhost:3000/dev/blocks?type=brightedge_hero) |
| 4 | `cool_hunter_footer` | CoolHunterFooter | cta | [open](http://localhost:3000/dev/blocks?type=cool_hunter_footer) |
| 5 | `cool_hunter_product` | CoolHunterProduct | feature | [open](http://localhost:3000/dev/blocks?type=cool_hunter_product) |
| 6 | `cool_hunter_quote` | CoolHunterQuote | intro | [open](http://localhost:3000/dev/blocks?type=cool_hunter_quote) |
| 7 | `cool_hunter_story` | CoolHunterStory | intro | [open](http://localhost:3000/dev/blocks?type=cool_hunter_story) |
| 8 | `cta_section` | CtaSection | cta | [open](http://localhost:3000/dev/blocks?type=cta_section) |
| 9 | `delvaux_details` | DelvauxDetails | intro | [open](http://localhost:3000/dev/blocks?type=delvaux_details) |
| 10 | `delvaux_hero` | DelvauxHero | hero | [open](http://localhost:3000/dev/blocks?type=delvaux_hero) |
| 11 | `delvaux_product` | DelvauxProduct | feature | [open](http://localhost:3000/dev/blocks?type=delvaux_product) |
| 12 | `delvaux_subnav` | DelvauxSubnav | header | [open](http://localhost:3000/dev/blocks?type=delvaux_subnav) |
| 13 | `delvaux_variant` | DelvauxVariant | pricing | [open](http://localhost:3000/dev/blocks?type=delvaux_variant) |
| 14 | `firma_work` | FirmaWork | portfolio | [open](http://localhost:3000/dev/blocks?type=firma_work) |
| 15 | `flip_gallery` | FlipGallery | gallery | [open](http://localhost:3000/dev/blocks?type=flip_gallery) |
| 16 | `framer_arpeggio_hero_v2` | FramerArpeggioHeroV2 | hero | [open](http://localhost:3000/dev/blocks?type=framer_arpeggio_hero_v2) |
| 17 | `framer_darling_timeline` | FramerDarlingTimeline | progress | [open](http://localhost:3000/dev/blocks?type=framer_darling_timeline) |
| 18 | `framer_flat_white_process` | FramerFlatWhiteProcess | progress | [open](http://localhost:3000/dev/blocks?type=framer_flat_white_process) |
| 19 | `framer_ignitex_step` | FramerIgnitexStep | progress | [open](http://localhost:3000/dev/blocks?type=framer_ignitex_step) |
| 20 | `framer_nftpull_timeline` | FramerNftpullTimeline | progress | [open](http://localhost:3000/dev/blocks?type=framer_nftpull_timeline) |
| 21 | `framer_perform_about` | FramerPerformAbout | intro | [open](http://localhost:3000/dev/blocks?type=framer_perform_about) |
| 22 | `framer_perform_hero` | FramerPerformHero | hero | [open](http://localhost:3000/dev/blocks?type=framer_perform_hero) |
| 23 | `framer_perform_pricing` | FramerPerformPricing | pricing | [open](http://localhost:3000/dev/blocks?type=framer_perform_pricing) |
| 24 | `framer_projects_grid` | FramerProjectsGrid | portfolio | [open](http://localhost:3000/dev/blocks?type=framer_projects_grid) |
| 25 | `framer_purevisuals_hero` | FramerPurevisualsHero | hero | [open](http://localhost:3000/dev/blocks?type=framer_purevisuals_hero) |
| 26 | `gallery_3d_depth` | Gallery3dDepth | gallery | [open](http://localhost:3000/dev/blocks?type=gallery_3d_depth) |
| 27 | `hero_overlay` | HeroOverlay | hero | [open](http://localhost:3000/dev/blocks?type=hero_overlay) |
| 28 | `hero_scroll` | HeroScroll | hero | [open](http://localhost:3000/dev/blocks?type=hero_scroll) |
| 29 | `hero_split` | HeroSplit | hero | [open](http://localhost:3000/dev/blocks?type=hero_split) |
| 30 | `housent_blogs` | HousentBlogs | blog | [open](http://localhost:3000/dev/blocks?type=housent_blogs) |
| 31 | `housent_hero` | HousentHero | hero | [open](http://localhost:3000/dev/blocks?type=housent_hero) |
| 32 | `housent_listings` | HousentListings | listing | [open](http://localhost:3000/dev/blocks?type=housent_listings) |
| 33 | `housent_our_excellence` | HousentOurExcellence | trust | [open](http://localhost:3000/dev/blocks?type=housent_our_excellence) |
| 34 | `hover_reveal_list` | HoverRevealList | interactive | [open](http://localhost:3000/dev/blocks?type=hover_reveal_list) |
| 35 | `ignitex_projects` | IgnitexProjects | portfolio | [open](http://localhost:3000/dev/blocks?type=ignitex_projects) |
| 36 | `image_explosion` | ImageExplosion | gallery | [open](http://localhost:3000/dev/blocks?type=image_explosion) |
| 37 | `image_trail` | ImageTrail | interactive | [open](http://localhost:3000/dev/blocks?type=image_trail) |
| 38 | `interactive_ad_widget` | InteractiveAdWidget | interactive | [open](http://localhost:3000/dev/blocks?type=interactive_ad_widget) |
| 39 | `letter_slider` | LetterSlider | interactive | [open](http://localhost:3000/dev/blocks?type=letter_slider) |
| 40 | `lightbox_flip` | LightboxFlip | gallery | [open](http://localhost:3000/dev/blocks?type=lightbox_flip) |
| 41 | `masterise_home_inside` | MasteriseHomeInside | intro | [open](http://localhost:3000/dev/blocks?type=masterise_home_inside) |
| 42 | `mint_discover` | MintDiscover | gallery | [open](http://localhost:3000/dev/blocks?type=mint_discover) |
| 43 | `mint_hero` | MintHero | hero | [open](http://localhost:3000/dev/blocks?type=mint_hero) |
| 44 | `mint_variants` | MintVariants | pricing | [open](http://localhost:3000/dev/blocks?type=mint_variants) |
| 45 | `mint_vault_hero` | MintVaultHero | hero | [open](http://localhost:3000/dev/blocks?type=mint_vault_hero) |
| 46 | `mint_vault_invitation` | MintVaultInvitation | cta | [open](http://localhost:3000/dev/blocks?type=mint_vault_invitation) |
| 47 | `mint_vault_reveal` | MintVaultReveal | gallery | [open](http://localhost:3000/dev/blocks?type=mint_vault_reveal) |
| 48 | `mintv2_emblem` | MintV2Emblem | intro | [open](http://localhost:3000/dev/blocks?type=mintv2_emblem) |
| 49 | `mintv2_manifesto` | MintV2Manifesto | intro | [open](http://localhost:3000/dev/blocks?type=mintv2_manifesto) |
| 50 | `mintv2_services` | MintV2Services | services | [open](http://localhost:3000/dev/blocks?type=mintv2_services) |
| 51 | `mintv2_works` | MintV2Works | portfolio | [open](http://localhost:3000/dev/blocks?type=mintv2_works) |
| 52 | `nordhaven_properties` | NordhavenProperties | listing | [open](http://localhost:3000/dev/blocks?type=nordhaven_properties) |
| 53 | `pixel_reveal` | PixelReveal | gallery | [open](http://localhost:3000/dev/blocks?type=pixel_reveal) |
| 54 | `pnj_hero` | PnjHero | hero | [open](http://localhost:3000/dev/blocks?type=pnj_hero) |
| 55 | `pnj_variant` | PnjVariant | feature | [open](http://localhost:3000/dev/blocks?type=pnj_variant) |
| 56 | `protection_scrollytelling` | ProtectionScrollytelling | hero | [open](http://localhost:3000/dev/blocks?type=protection_scrollytelling) |
| 57 | `q80_experience` | Q80Experience | hero | [open](http://localhost:3000/dev/blocks?type=q80_experience) |
| 58 | `readymag_case_section` | ReadymagCaseSection | portfolio | [open](http://localhost:3000/dev/blocks?type=readymag_case_section) |
| 59 | `real_estate_villa` | RealEstateVilla | feature | [open](http://localhost:3000/dev/blocks?type=real_estate_villa) |
| 60 | `scroll_mattis` | ScrollMattis | hero | [open](http://localhost:3000/dev/blocks?type=scroll_mattis) |
| 61 | `springs_design` | SpringsDesign | feature | [open](http://localhost:3000/dev/blocks?type=springs_design) |
| 62 | `springs_gallery` | SpringsGallery | hero | [open](http://localhost:3000/dev/blocks?type=springs_gallery) |
| 63 | `springs_hero` | SpringsHero | hero | [open](http://localhost:3000/dev/blocks?type=springs_hero) |
| 64 | `springs_interiors` | SpringsInteriors | gallery | [open](http://localhost:3000/dev/blocks?type=springs_interiors) |
| 65 | `springs_intro` | SpringsIntro | intro | [open](http://localhost:3000/dev/blocks?type=springs_intro) |
| 66 | `springs_map` | SpringsMap | location | [open](http://localhost:3000/dev/blocks?type=springs_map) |
| 67 | `springs_nature_place` | SpringsNaturePlace | amenity | [open](http://localhost:3000/dev/blocks?type=springs_nature_place) |
| 68 | `springs_residences` | SpringsResidences | listing | [open](http://localhost:3000/dev/blocks?type=springs_residences) |
| 69 | `springs_wellness` | SpringsWellness | amenity | [open](http://localhost:3000/dev/blocks?type=springs_wellness) |
| 70 | `sticky_scroll_cards` | StickyScrollCards | feature | [open](http://localhost:3000/dev/blocks?type=sticky_scroll_cards) |
| 71 | `wheel_gallery` | WheelGallery | gallery | [open](http://localhost:3000/dev/blocks?type=wheel_gallery) |

### Scroll-linked (73)

| STT | type_code | Component | Category | Preview |
|---:|---|---|---|---|
| 1 | `altura_olympus` | AlturaOlympus | intro | [open](http://localhost:3000/dev/blocks?type=altura_olympus) |
| 2 | `brightedge_hero` | BrightedgeHero | hero | [open](http://localhost:3000/dev/blocks?type=brightedge_hero) |
| 3 | `cool_hunter_footer` | CoolHunterFooter | cta | [open](http://localhost:3000/dev/blocks?type=cool_hunter_footer) |
| 4 | `cool_hunter_gallery` | CoolHunterGallery | gallery | [open](http://localhost:3000/dev/blocks?type=cool_hunter_gallery) |
| 5 | `cool_hunter_hero` | CoolHunterHero | hero | [open](http://localhost:3000/dev/blocks?type=cool_hunter_hero) |
| 6 | `cool_hunter_product` | CoolHunterProduct | feature | [open](http://localhost:3000/dev/blocks?type=cool_hunter_product) |
| 7 | `cool_hunter_quote` | CoolHunterQuote | intro | [open](http://localhost:3000/dev/blocks?type=cool_hunter_quote) |
| 8 | `cool_hunter_story` | CoolHunterStory | intro | [open](http://localhost:3000/dev/blocks?type=cool_hunter_story) |
| 9 | `delvaux_details` | DelvauxDetails | intro | [open](http://localhost:3000/dev/blocks?type=delvaux_details) |
| 10 | `delvaux_hero` | DelvauxHero | hero | [open](http://localhost:3000/dev/blocks?type=delvaux_hero) |
| 11 | `delvaux_product` | DelvauxProduct | feature | [open](http://localhost:3000/dev/blocks?type=delvaux_product) |
| 12 | `delvaux_variant` | DelvauxVariant | pricing | [open](http://localhost:3000/dev/blocks?type=delvaux_variant) |
| 13 | `framer_bungee_hero_v2` | FramerBungeeHeroV2 | hero | [open](http://localhost:3000/dev/blocks?type=framer_bungee_hero_v2) |
| 14 | `framer_darling_timeline` | FramerDarlingTimeline | progress | [open](http://localhost:3000/dev/blocks?type=framer_darling_timeline) |
| 15 | `framer_estancia_about_us` | FramerEstanciaAboutUs | intro | [open](http://localhost:3000/dev/blocks?type=framer_estancia_about_us) |
| 16 | `framer_flat_white_process` | FramerFlatWhiteProcess | progress | [open](http://localhost:3000/dev/blocks?type=framer_flat_white_process) |
| 17 | `framer_ignitex_step` | FramerIgnitexStep | progress | [open](http://localhost:3000/dev/blocks?type=framer_ignitex_step) |
| 18 | `framer_nftpull_timeline` | FramerNftpullTimeline | progress | [open](http://localhost:3000/dev/blocks?type=framer_nftpull_timeline) |
| 19 | `framer_perform_about` | FramerPerformAbout | intro | [open](http://localhost:3000/dev/blocks?type=framer_perform_about) |
| 20 | `framer_perform_hero` | FramerPerformHero | hero | [open](http://localhost:3000/dev/blocks?type=framer_perform_hero) |
| 21 | `framer_perform_pricing` | FramerPerformPricing | pricing | [open](http://localhost:3000/dev/blocks?type=framer_perform_pricing) |
| 22 | `framer_purevisuals_hero` | FramerPurevisualsHero | hero | [open](http://localhost:3000/dev/blocks?type=framer_purevisuals_hero) |
| 23 | `hero_scroll` | HeroScroll | hero | [open](http://localhost:3000/dev/blocks?type=hero_scroll) |
| 24 | `housent_hero` | HousentHero | hero | [open](http://localhost:3000/dev/blocks?type=housent_hero) |
| 25 | `housent_our_excellence` | HousentOurExcellence | trust | [open](http://localhost:3000/dev/blocks?type=housent_our_excellence) |
| 26 | `linea_portfolio` | LineaPortfolio | portfolio | [open](http://localhost:3000/dev/blocks?type=linea_portfolio) |
| 27 | `masterise_home_inside` | MasteriseHomeInside | intro | [open](http://localhost:3000/dev/blocks?type=masterise_home_inside) |
| 28 | `mint_details` | MintDetails | feature | [open](http://localhost:3000/dev/blocks?type=mint_details) |
| 29 | `mint_discover` | MintDiscover | gallery | [open](http://localhost:3000/dev/blocks?type=mint_discover) |
| 30 | `mint_hero` | MintHero | hero | [open](http://localhost:3000/dev/blocks?type=mint_hero) |
| 31 | `mint_sku` | MintSku | pricing | [open](http://localhost:3000/dev/blocks?type=mint_sku) |
| 32 | `mint_variants` | MintVariants | pricing | [open](http://localhost:3000/dev/blocks?type=mint_variants) |
| 33 | `mint_vault_craft` | MintVaultCraft | feature | [open](http://localhost:3000/dev/blocks?type=mint_vault_craft) |
| 34 | `mint_vault_hero` | MintVaultHero | hero | [open](http://localhost:3000/dev/blocks?type=mint_vault_hero) |
| 35 | `mint_vault_invitation` | MintVaultInvitation | cta | [open](http://localhost:3000/dev/blocks?type=mint_vault_invitation) |
| 36 | `mint_vault_reveal` | MintVaultReveal | gallery | [open](http://localhost:3000/dev/blocks?type=mint_vault_reveal) |
| 37 | `mintv2_cta` | MintV2Cta | cta | [open](http://localhost:3000/dev/blocks?type=mintv2_cta) |
| 38 | `mintv2_emblem` | MintV2Emblem | intro | [open](http://localhost:3000/dev/blocks?type=mintv2_emblem) |
| 39 | `mintv2_manifesto` | MintV2Manifesto | intro | [open](http://localhost:3000/dev/blocks?type=mintv2_manifesto) |
| 40 | `mintv2_process` | MintV2Process | progress | [open](http://localhost:3000/dev/blocks?type=mintv2_process) |
| 41 | `mintv2_services` | MintV2Services | services | [open](http://localhost:3000/dev/blocks?type=mintv2_services) |
| 42 | `mintv2_works` | MintV2Works | portfolio | [open](http://localhost:3000/dev/blocks?type=mintv2_works) |
| 43 | `pnj_cta` | PnjCta | cta | [open](http://localhost:3000/dev/blocks?type=pnj_cta) |
| 44 | `pnj_details` | PnjDetails | intro | [open](http://localhost:3000/dev/blocks?type=pnj_details) |
| 45 | `pnj_header` | PnjHeader | navigation | [open](http://localhost:3000/dev/blocks?type=pnj_header) |
| 46 | `pnj_hero` | PnjHero | hero | [open](http://localhost:3000/dev/blocks?type=pnj_hero) |
| 47 | `pnj_sticky_menu` | PnjStickyMenu | navigation | [open](http://localhost:3000/dev/blocks?type=pnj_sticky_menu) |
| 48 | `pnj_variant` | PnjVariant | feature | [open](http://localhost:3000/dev/blocks?type=pnj_variant) |
| 49 | `protection_scrollytelling` | ProtectionScrollytelling | hero | [open](http://localhost:3000/dev/blocks?type=protection_scrollytelling) |
| 50 | `q80_experience` | Q80Experience | hero | [open](http://localhost:3000/dev/blocks?type=q80_experience) |
| 51 | `readymag_case_section` | ReadymagCaseSection | portfolio | [open](http://localhost:3000/dev/blocks?type=readymag_case_section) |
| 52 | `real_estate_hero` | RealEstateHero | hero | [open](http://localhost:3000/dev/blocks?type=real_estate_hero) |
| 53 | `real_estate_highlights` | RealEstateHighlights | feature | [open](http://localhost:3000/dev/blocks?type=real_estate_highlights) |
| 54 | `real_estate_info` | RealEstateInfo | feature | [open](http://localhost:3000/dev/blocks?type=real_estate_info) |
| 55 | `real_estate_location` | RealEstateLocation | location | [open](http://localhost:3000/dev/blocks?type=real_estate_location) |
| 56 | `real_estate_overview` | RealEstateOverview | feature | [open](http://localhost:3000/dev/blocks?type=real_estate_overview) |
| 57 | `real_estate_utilities` | RealEstateUtilities | feature | [open](http://localhost:3000/dev/blocks?type=real_estate_utilities) |
| 58 | `real_estate_villa` | RealEstateVilla | feature | [open](http://localhost:3000/dev/blocks?type=real_estate_villa) |
| 59 | `scroll_mattis` | ScrollMattis | hero | [open](http://localhost:3000/dev/blocks?type=scroll_mattis) |
| 60 | `springs_contact_footer` | SpringsContactFooter | footer | [open](http://localhost:3000/dev/blocks?type=springs_contact_footer) |
| 61 | `springs_design` | SpringsDesign | feature | [open](http://localhost:3000/dev/blocks?type=springs_design) |
| 62 | `springs_gallery` | SpringsGallery | hero | [open](http://localhost:3000/dev/blocks?type=springs_gallery) |
| 63 | `springs_header` | SpringsHeader | header | [open](http://localhost:3000/dev/blocks?type=springs_header) |
| 64 | `springs_hero` | SpringsHero | hero | [open](http://localhost:3000/dev/blocks?type=springs_hero) |
| 65 | `springs_interiors` | SpringsInteriors | gallery | [open](http://localhost:3000/dev/blocks?type=springs_interiors) |
| 66 | `springs_intro` | SpringsIntro | intro | [open](http://localhost:3000/dev/blocks?type=springs_intro) |
| 67 | `springs_map` | SpringsMap | location | [open](http://localhost:3000/dev/blocks?type=springs_map) |
| 68 | `springs_nature_place` | SpringsNaturePlace | amenity | [open](http://localhost:3000/dev/blocks?type=springs_nature_place) |
| 69 | `springs_residences` | SpringsResidences | listing | [open](http://localhost:3000/dev/blocks?type=springs_residences) |
| 70 | `springs_wellness` | SpringsWellness | amenity | [open](http://localhost:3000/dev/blocks?type=springs_wellness) |
| 71 | `sticky_scroll_cards` | StickyScrollCards | feature | [open](http://localhost:3000/dev/blocks?type=sticky_scroll_cards) |
| 72 | `sustainit_our_expertise` | SustainitOurExpertise | services | [open](http://localhost:3000/dev/blocks?type=sustainit_our_expertise) |
| 73 | `wheel_gallery` | WheelGallery | gallery | [open](http://localhost:3000/dev/blocks?type=wheel_gallery) |

### Hover / interaction (22)

| STT | type_code | Component | Category | Preview |
|---:|---|---|---|---|
| 1 | `accordion_media` | AccordionMedia | feature | [open](http://localhost:3000/dev/blocks?type=accordion_media) |
| 2 | `cta_section` | CtaSection | cta | [open](http://localhost:3000/dev/blocks?type=cta_section) |
| 3 | `delvaux_subnav` | DelvauxSubnav | header | [open](http://localhost:3000/dev/blocks?type=delvaux_subnav) |
| 4 | `delvaux_variant` | DelvauxVariant | pricing | [open](http://localhost:3000/dev/blocks?type=delvaux_variant) |
| 5 | `firma_work` | FirmaWork | portfolio | [open](http://localhost:3000/dev/blocks?type=firma_work) |
| 6 | `framer_estancia_about_us` | FramerEstanciaAboutUs | intro | [open](http://localhost:3000/dev/blocks?type=framer_estancia_about_us) |
| 7 | `framer_projects_grid` | FramerProjectsGrid | portfolio | [open](http://localhost:3000/dev/blocks?type=framer_projects_grid) |
| 8 | `framer_vs_collins_projects` | FramerVsCollinsProjects | portfolio | [open](http://localhost:3000/dev/blocks?type=framer_vs_collins_projects) |
| 9 | `hero_overlay` | HeroOverlay | hero | [open](http://localhost:3000/dev/blocks?type=hero_overlay) |
| 10 | `hero_split` | HeroSplit | hero | [open](http://localhost:3000/dev/blocks?type=hero_split) |
| 11 | `housent_blogs` | HousentBlogs | blog | [open](http://localhost:3000/dev/blocks?type=housent_blogs) |
| 12 | `housent_listings` | HousentListings | listing | [open](http://localhost:3000/dev/blocks?type=housent_listings) |
| 13 | `hover_reveal_list` | HoverRevealList | interactive | [open](http://localhost:3000/dev/blocks?type=hover_reveal_list) |
| 14 | `ignitex_projects` | IgnitexProjects | portfolio | [open](http://localhost:3000/dev/blocks?type=ignitex_projects) |
| 15 | `interactive_ad_widget` | InteractiveAdWidget | interactive | [open](http://localhost:3000/dev/blocks?type=interactive_ad_widget) |
| 16 | `interactive_grid` | InteractiveGrid | interactive | [open](http://localhost:3000/dev/blocks?type=interactive_grid) |
| 17 | `masterise_home_inside` | MasteriseHomeInside | intro | [open](http://localhost:3000/dev/blocks?type=masterise_home_inside) |
| 18 | `mint_discover` | MintDiscover | gallery | [open](http://localhost:3000/dev/blocks?type=mint_discover) |
| 19 | `mintv2_services` | MintV2Services | services | [open](http://localhost:3000/dev/blocks?type=mintv2_services) |
| 20 | `nordhaven_properties` | NordhavenProperties | listing | [open](http://localhost:3000/dev/blocks?type=nordhaven_properties) |
| 21 | `parallax_hero` | ParallaxHero | hero | [open](http://localhost:3000/dev/blocks?type=parallax_hero) |
| 22 | `spotlight` | Spotlight | feature | [open](http://localhost:3000/dev/blocks?type=spotlight) |

### Entrance / load (114)

| STT | type_code | Component | Category | Preview |
|---:|---|---|---|---|
| 1 | `accordion_media` | AccordionMedia | feature | [open](http://localhost:3000/dev/blocks?type=accordion_media) |
| 2 | `altura_olympus` | AlturaOlympus | intro | [open](http://localhost:3000/dev/blocks?type=altura_olympus) |
| 3 | `booking_form` | BookingForm | form | [open](http://localhost:3000/dev/blocks?type=booking_form) |
| 4 | `brightedge_hero` | BrightedgeHero | hero | [open](http://localhost:3000/dev/blocks?type=brightedge_hero) |
| 5 | `carousel_3d` | Carousel3d | gallery | [open](http://localhost:3000/dev/blocks?type=carousel_3d) |
| 6 | `cool_hunter_gallery` | CoolHunterGallery | gallery | [open](http://localhost:3000/dev/blocks?type=cool_hunter_gallery) |
| 7 | `cool_hunter_product` | CoolHunterProduct | feature | [open](http://localhost:3000/dev/blocks?type=cool_hunter_product) |
| 8 | `cool_hunter_quote` | CoolHunterQuote | intro | [open](http://localhost:3000/dev/blocks?type=cool_hunter_quote) |
| 9 | `cool_hunter_story` | CoolHunterStory | intro | [open](http://localhost:3000/dev/blocks?type=cool_hunter_story) |
| 10 | `cta_section` | CtaSection | cta | [open](http://localhost:3000/dev/blocks?type=cta_section) |
| 11 | `delvaux_details` | DelvauxDetails | intro | [open](http://localhost:3000/dev/blocks?type=delvaux_details) |
| 12 | `delvaux_header` | DelvauxHeader | header | [open](http://localhost:3000/dev/blocks?type=delvaux_header) |
| 13 | `delvaux_hero` | DelvauxHero | hero | [open](http://localhost:3000/dev/blocks?type=delvaux_hero) |
| 14 | `delvaux_product` | DelvauxProduct | feature | [open](http://localhost:3000/dev/blocks?type=delvaux_product) |
| 15 | `delvaux_subnav` | DelvauxSubnav | header | [open](http://localhost:3000/dev/blocks?type=delvaux_subnav) |
| 16 | `delvaux_variant` | DelvauxVariant | pricing | [open](http://localhost:3000/dev/blocks?type=delvaux_variant) |
| 17 | `dot_matrix` | DotMatrix | interactive | [open](http://localhost:3000/dev/blocks?type=dot_matrix) |
| 18 | `feature_section` | FeatureSection | feature | [open](http://localhost:3000/dev/blocks?type=feature_section) |
| 19 | `flip_gallery` | FlipGallery | gallery | [open](http://localhost:3000/dev/blocks?type=flip_gallery) |
| 20 | `flipbook` | Flipbook | gallery | [open](http://localhost:3000/dev/blocks?type=flipbook) |
| 21 | `framer_aestha_editorial` | FramerAesthaEditorial | intro | [open](http://localhost:3000/dev/blocks?type=framer_aestha_editorial) |
| 22 | `framer_arpeggio_hero_v2` | FramerArpeggioHeroV2 | hero | [open](http://localhost:3000/dev/blocks?type=framer_arpeggio_hero_v2) |
| 23 | `framer_bungee_hero_v2` | FramerBungeeHeroV2 | hero | [open](http://localhost:3000/dev/blocks?type=framer_bungee_hero_v2) |
| 24 | `framer_clarity_services` | FramerClarityServices | services | [open](http://localhost:3000/dev/blocks?type=framer_clarity_services) |
| 25 | `framer_darling_timeline` | FramerDarlingTimeline | progress | [open](http://localhost:3000/dev/blocks?type=framer_darling_timeline) |
| 26 | `framer_estancia_about_us` | FramerEstanciaAboutUs | intro | [open](http://localhost:3000/dev/blocks?type=framer_estancia_about_us) |
| 27 | `framer_explore_cta` | FramerExploreCta | cta | [open](http://localhost:3000/dev/blocks?type=framer_explore_cta) |
| 28 | `framer_faq_minimal` | FramerFaqMinimal | faq | [open](http://localhost:3000/dev/blocks?type=framer_faq_minimal) |
| 29 | `framer_firma_template_strategy_digital` | FramerFirmaTemplateStrategyDigital | portfolio | [open](http://localhost:3000/dev/blocks?type=framer_firma_template_strategy_digital) |
| 30 | `framer_flat_white_process` | FramerFlatWhiteProcess | progress | [open](http://localhost:3000/dev/blocks?type=framer_flat_white_process) |
| 31 | `framer_image_stagger` | FramerImageStagger | gallery | [open](http://localhost:3000/dev/blocks?type=framer_image_stagger) |
| 32 | `framer_intro_redefined` | FramerIntroRedefined | intro | [open](http://localhost:3000/dev/blocks?type=framer_intro_redefined) |
| 33 | `framer_nftpull_timeline` | FramerNftpullTimeline | progress | [open](http://localhost:3000/dev/blocks?type=framer_nftpull_timeline) |
| 34 | `framer_perform_about` | FramerPerformAbout | intro | [open](http://localhost:3000/dev/blocks?type=framer_perform_about) |
| 35 | `framer_perform_hero` | FramerPerformHero | hero | [open](http://localhost:3000/dev/blocks?type=framer_perform_hero) |
| 36 | `framer_perform_pricing` | FramerPerformPricing | pricing | [open](http://localhost:3000/dev/blocks?type=framer_perform_pricing) |
| 37 | `framer_projects_grid` | FramerProjectsGrid | portfolio | [open](http://localhost:3000/dev/blocks?type=framer_projects_grid) |
| 38 | `framer_purevisuals_hero` | FramerPurevisualsHero | hero | [open](http://localhost:3000/dev/blocks?type=framer_purevisuals_hero) |
| 39 | `framer_signature_feature` | FramerSignatureFeature | feature | [open](http://localhost:3000/dev/blocks?type=framer_signature_feature) |
| 40 | `framer_stats_grid` | FramerStatsGrid | trust | [open](http://localhost:3000/dev/blocks?type=framer_stats_grid) |
| 41 | `framer_studio_manifesto` | FramerStudioManifesto | intro | [open](http://localhost:3000/dev/blocks?type=framer_studio_manifesto) |
| 42 | `framer_team_directory` | FramerTeamDirectory | trust | [open](http://localhost:3000/dev/blocks?type=framer_team_directory) |
| 43 | `framer_vs_collins_projects` | FramerVsCollinsProjects | portfolio | [open](http://localhost:3000/dev/blocks?type=framer_vs_collins_projects) |
| 44 | `gallery_3d_depth` | Gallery3dDepth | gallery | [open](http://localhost:3000/dev/blocks?type=gallery_3d_depth) |
| 45 | `hero_overlay` | HeroOverlay | hero | [open](http://localhost:3000/dev/blocks?type=hero_overlay) |
| 46 | `hero_scroll` | HeroScroll | hero | [open](http://localhost:3000/dev/blocks?type=hero_scroll) |
| 47 | `hero_split` | HeroSplit | hero | [open](http://localhost:3000/dev/blocks?type=hero_split) |
| 48 | `housent_hero` | HousentHero | hero | [open](http://localhost:3000/dev/blocks?type=housent_hero) |
| 49 | `housent_our_excellence` | HousentOurExcellence | trust | [open](http://localhost:3000/dev/blocks?type=housent_our_excellence) |
| 50 | `hover_equalizer_heading` | HoverEqualizerHeading | interactive | [open](http://localhost:3000/dev/blocks?type=hover_equalizer_heading) |
| 51 | `hover_reveal_list` | HoverRevealList | interactive | [open](http://localhost:3000/dev/blocks?type=hover_reveal_list) |
| 52 | `image_explosion` | ImageExplosion | gallery | [open](http://localhost:3000/dev/blocks?type=image_explosion) |
| 53 | `image_trail` | ImageTrail | interactive | [open](http://localhost:3000/dev/blocks?type=image_trail) |
| 54 | `interactive_grid` | InteractiveGrid | interactive | [open](http://localhost:3000/dev/blocks?type=interactive_grid) |
| 55 | `letter_slider` | LetterSlider | interactive | [open](http://localhost:3000/dev/blocks?type=letter_slider) |
| 56 | `lightbox_flip` | LightboxFlip | gallery | [open](http://localhost:3000/dev/blocks?type=lightbox_flip) |
| 57 | `linea_portfolio` | LineaPortfolio | portfolio | [open](http://localhost:3000/dev/blocks?type=linea_portfolio) |
| 58 | `marquee_band` | MarqueeBand | marquee | [open](http://localhost:3000/dev/blocks?type=marquee_band) |
| 59 | `masterise_home_inside` | MasteriseHomeInside | intro | [open](http://localhost:3000/dev/blocks?type=masterise_home_inside) |
| 60 | `mint_details` | MintDetails | feature | [open](http://localhost:3000/dev/blocks?type=mint_details) |
| 61 | `mint_discover` | MintDiscover | gallery | [open](http://localhost:3000/dev/blocks?type=mint_discover) |
| 62 | `mint_hero` | MintHero | hero | [open](http://localhost:3000/dev/blocks?type=mint_hero) |
| 63 | `mint_sku` | MintSku | pricing | [open](http://localhost:3000/dev/blocks?type=mint_sku) |
| 64 | `mint_variants` | MintVariants | pricing | [open](http://localhost:3000/dev/blocks?type=mint_variants) |
| 65 | `mint_vault_craft` | MintVaultCraft | feature | [open](http://localhost:3000/dev/blocks?type=mint_vault_craft) |
| 66 | `mint_vault_hero` | MintVaultHero | hero | [open](http://localhost:3000/dev/blocks?type=mint_vault_hero) |
| 67 | `mint_vault_invitation` | MintVaultInvitation | cta | [open](http://localhost:3000/dev/blocks?type=mint_vault_invitation) |
| 68 | `mint_vault_reveal` | MintVaultReveal | gallery | [open](http://localhost:3000/dev/blocks?type=mint_vault_reveal) |
| 69 | `mintv2_cta` | MintV2Cta | cta | [open](http://localhost:3000/dev/blocks?type=mintv2_cta) |
| 70 | `mintv2_emblem` | MintV2Emblem | intro | [open](http://localhost:3000/dev/blocks?type=mintv2_emblem) |
| 71 | `mintv2_manifesto` | MintV2Manifesto | intro | [open](http://localhost:3000/dev/blocks?type=mintv2_manifesto) |
| 72 | `mintv2_process` | MintV2Process | progress | [open](http://localhost:3000/dev/blocks?type=mintv2_process) |
| 73 | `mintv2_services` | MintV2Services | services | [open](http://localhost:3000/dev/blocks?type=mintv2_services) |
| 74 | `mintv2_works` | MintV2Works | portfolio | [open](http://localhost:3000/dev/blocks?type=mintv2_works) |
| 75 | `panorama` | Panorama | gallery | [open](http://localhost:3000/dev/blocks?type=panorama) |
| 76 | `parallax_hero` | ParallaxHero | hero | [open](http://localhost:3000/dev/blocks?type=parallax_hero) |
| 77 | `pixel_reveal` | PixelReveal | gallery | [open](http://localhost:3000/dev/blocks?type=pixel_reveal) |
| 78 | `pnj_cta` | PnjCta | cta | [open](http://localhost:3000/dev/blocks?type=pnj_cta) |
| 79 | `pnj_details` | PnjDetails | intro | [open](http://localhost:3000/dev/blocks?type=pnj_details) |
| 80 | `pnj_hero` | PnjHero | hero | [open](http://localhost:3000/dev/blocks?type=pnj_hero) |
| 81 | `pnj_variant` | PnjVariant | feature | [open](http://localhost:3000/dev/blocks?type=pnj_variant) |
| 82 | `poll` | Poll | interactive | [open](http://localhost:3000/dev/blocks?type=poll) |
| 83 | `process_steps` | ProcessSteps | progress | [open](http://localhost:3000/dev/blocks?type=process_steps) |
| 84 | `product_spec_sheet` | ProductSpecSheet | pricing | [open](http://localhost:3000/dev/blocks?type=product_spec_sheet) |
| 85 | `protection_scrollytelling` | ProtectionScrollytelling | hero | [open](http://localhost:3000/dev/blocks?type=protection_scrollytelling) |
| 86 | `q80_experience` | Q80Experience | hero | [open](http://localhost:3000/dev/blocks?type=q80_experience) |
| 87 | `quiz` | Quiz | interactive | [open](http://localhost:3000/dev/blocks?type=quiz) |
| 88 | `readymag_case_section` | ReadymagCaseSection | portfolio | [open](http://localhost:3000/dev/blocks?type=readymag_case_section) |
| 89 | `real_estate_hero` | RealEstateHero | hero | [open](http://localhost:3000/dev/blocks?type=real_estate_hero) |
| 90 | `real_estate_highlights` | RealEstateHighlights | feature | [open](http://localhost:3000/dev/blocks?type=real_estate_highlights) |
| 91 | `real_estate_info` | RealEstateInfo | feature | [open](http://localhost:3000/dev/blocks?type=real_estate_info) |
| 92 | `real_estate_location` | RealEstateLocation | location | [open](http://localhost:3000/dev/blocks?type=real_estate_location) |
| 93 | `real_estate_overview` | RealEstateOverview | feature | [open](http://localhost:3000/dev/blocks?type=real_estate_overview) |
| 94 | `real_estate_utilities` | RealEstateUtilities | feature | [open](http://localhost:3000/dev/blocks?type=real_estate_utilities) |
| 95 | `real_estate_villa` | RealEstateVilla | feature | [open](http://localhost:3000/dev/blocks?type=real_estate_villa) |
| 96 | `scroll_mattis` | ScrollMattis | hero | [open](http://localhost:3000/dev/blocks?type=scroll_mattis) |
| 97 | `seamless_scroll_gallery` | SeamlessScrollGallery | gallery | [open](http://localhost:3000/dev/blocks?type=seamless_scroll_gallery) |
| 98 | `split_screen` | SplitScreen | feature | [open](http://localhost:3000/dev/blocks?type=split_screen) |
| 99 | `spotlight` | Spotlight | feature | [open](http://localhost:3000/dev/blocks?type=spotlight) |
| 100 | `springs_contact_footer` | SpringsContactFooter | footer | [open](http://localhost:3000/dev/blocks?type=springs_contact_footer) |
| 101 | `springs_design` | SpringsDesign | feature | [open](http://localhost:3000/dev/blocks?type=springs_design) |
| 102 | `springs_gallery` | SpringsGallery | hero | [open](http://localhost:3000/dev/blocks?type=springs_gallery) |
| 103 | `springs_header` | SpringsHeader | header | [open](http://localhost:3000/dev/blocks?type=springs_header) |
| 104 | `springs_hero` | SpringsHero | hero | [open](http://localhost:3000/dev/blocks?type=springs_hero) |
| 105 | `springs_interiors` | SpringsInteriors | gallery | [open](http://localhost:3000/dev/blocks?type=springs_interiors) |
| 106 | `springs_intro` | SpringsIntro | intro | [open](http://localhost:3000/dev/blocks?type=springs_intro) |
| 107 | `springs_map` | SpringsMap | location | [open](http://localhost:3000/dev/blocks?type=springs_map) |
| 108 | `springs_nature_place` | SpringsNaturePlace | amenity | [open](http://localhost:3000/dev/blocks?type=springs_nature_place) |
| 109 | `springs_residences` | SpringsResidences | listing | [open](http://localhost:3000/dev/blocks?type=springs_residences) |
| 110 | `springs_wellness` | SpringsWellness | amenity | [open](http://localhost:3000/dev/blocks?type=springs_wellness) |
| 111 | `stories` | Stories | gallery | [open](http://localhost:3000/dev/blocks?type=stories) |
| 112 | `story_slides` | StorySlides | gallery | [open](http://localhost:3000/dev/blocks?type=story_slides) |
| 113 | `sustainit_our_expertise` | SustainitOurExpertise | services | [open](http://localhost:3000/dev/blocks?type=sustainit_our_expertise) |
| 114 | `text_displace_hero` | TextDisplaceHero | hero | [open](http://localhost:3000/dev/blocks?type=text_displace_hero) |

### Other (marquee, carousel, drawer, …) (35)

| STT | type_code | Component | Category | Preview |
|---:|---|---|---|---|
| 1 | `accordion_media` | AccordionMedia | feature | [open](http://localhost:3000/dev/blocks?type=accordion_media) |
| 2 | `brightedge_hero` | BrightedgeHero | hero | [open](http://localhost:3000/dev/blocks?type=brightedge_hero) |
| 3 | `carousel_3d` | Carousel3d | gallery | [open](http://localhost:3000/dev/blocks?type=carousel_3d) |
| 4 | `delvaux_header` | DelvauxHeader | header | [open](http://localhost:3000/dev/blocks?type=delvaux_header) |
| 5 | `delvaux_product` | DelvauxProduct | feature | [open](http://localhost:3000/dev/blocks?type=delvaux_product) |
| 6 | `delvaux_subnav` | DelvauxSubnav | header | [open](http://localhost:3000/dev/blocks?type=delvaux_subnav) |
| 7 | `delvaux_variant` | DelvauxVariant | pricing | [open](http://localhost:3000/dev/blocks?type=delvaux_variant) |
| 8 | `flipbook` | Flipbook | gallery | [open](http://localhost:3000/dev/blocks?type=flipbook) |
| 9 | `framer_bungee_hero_v2` | FramerBungeeHeroV2 | hero | [open](http://localhost:3000/dev/blocks?type=framer_bungee_hero_v2) |
| 10 | `framer_faq_minimal` | FramerFaqMinimal | faq | [open](http://localhost:3000/dev/blocks?type=framer_faq_minimal) |
| 11 | `framer_purevisuals_hero` | FramerPurevisualsHero | hero | [open](http://localhost:3000/dev/blocks?type=framer_purevisuals_hero) |
| 12 | `gallery_3d_depth` | Gallery3dDepth | gallery | [open](http://localhost:3000/dev/blocks?type=gallery_3d_depth) |
| 13 | `hero_scroll` | HeroScroll | hero | [open](http://localhost:3000/dev/blocks?type=hero_scroll) |
| 14 | `image_carousel` | ImageCarousel | gallery | [open](http://localhost:3000/dev/blocks?type=image_carousel) |
| 15 | `interactive_ad_widget` | InteractiveAdWidget | interactive | [open](http://localhost:3000/dev/blocks?type=interactive_ad_widget) |
| 16 | `linea_portfolio` | LineaPortfolio | portfolio | [open](http://localhost:3000/dev/blocks?type=linea_portfolio) |
| 17 | `marquee_band` | MarqueeBand | marquee | [open](http://localhost:3000/dev/blocks?type=marquee_band) |
| 18 | `masterise_home_inside` | MasteriseHomeInside | intro | [open](http://localhost:3000/dev/blocks?type=masterise_home_inside) |
| 19 | `mint_discover` | MintDiscover | gallery | [open](http://localhost:3000/dev/blocks?type=mint_discover) |
| 20 | `mint_vault_collection` | MintVaultCollection | listing | [open](http://localhost:3000/dev/blocks?type=mint_vault_collection) |
| 21 | `mint_vault_craft` | MintVaultCraft | feature | [open](http://localhost:3000/dev/blocks?type=mint_vault_craft) |
| 22 | `mint_vault_hero` | MintVaultHero | hero | [open](http://localhost:3000/dev/blocks?type=mint_vault_hero) |
| 23 | `mintv2_works` | MintV2Works | portfolio | [open](http://localhost:3000/dev/blocks?type=mintv2_works) |
| 24 | `nordhaven_faq` | NordhavenFaq | faq | [open](http://localhost:3000/dev/blocks?type=nordhaven_faq) |
| 25 | `panorama` | Panorama | gallery | [open](http://localhost:3000/dev/blocks?type=panorama) |
| 26 | `parallax_hero` | ParallaxHero | hero | [open](http://localhost:3000/dev/blocks?type=parallax_hero) |
| 27 | `pnj_header` | PnjHeader | navigation | [open](http://localhost:3000/dev/blocks?type=pnj_header) |
| 28 | `pnj_sticky_menu` | PnjStickyMenu | navigation | [open](http://localhost:3000/dev/blocks?type=pnj_sticky_menu) |
| 29 | `q80_experience` | Q80Experience | hero | [open](http://localhost:3000/dev/blocks?type=q80_experience) |
| 30 | `q80_menu` | Q80Menu | header | [open](http://localhost:3000/dev/blocks?type=q80_menu) |
| 31 | `readymag_marquee` | ReadymagMarquee | marquee | [open](http://localhost:3000/dev/blocks?type=readymag_marquee) |
| 32 | `real_estate_villa` | RealEstateVilla | feature | [open](http://localhost:3000/dev/blocks?type=real_estate_villa) |
| 33 | `scroll_mattis` | ScrollMattis | hero | [open](http://localhost:3000/dev/blocks?type=scroll_mattis) |
| 34 | `seamless_scroll_gallery` | SeamlessScrollGallery | gallery | [open](http://localhost:3000/dev/blocks?type=seamless_scroll_gallery) |
| 35 | `wheel_gallery` | WheelGallery | gallery | [open](http://localhost:3000/dev/blocks?type=wheel_gallery) |

### No meaningful animation (37)

| STT | type_code | Component | Category | Preview |
|---:|---|---|---|---|
| 1 | `firma_footer` | FirmaFooter | footer | [open](http://localhost:3000/dev/blocks?type=firma_footer) |
| 2 | `firma_hero` | FirmaHero | hero | [open](http://localhost:3000/dev/blocks?type=firma_hero) |
| 3 | `firma_services` | FirmaServices | services | [open](http://localhost:3000/dev/blocks?type=firma_services) |
| 4 | `firma_statement` | FirmaStatement | intro | [open](http://localhost:3000/dev/blocks?type=firma_statement) |
| 5 | `firma_testimonial` | FirmaTestimonial | trust | [open](http://localhost:3000/dev/blocks?type=firma_testimonial) |
| 6 | `framer_yume_hero` | FramerYumeHero | hero | [open](http://localhost:3000/dev/blocks?type=framer_yume_hero) |
| 7 | `framer_yuya_hero` | FramerYumeHero | hero | [open](http://localhost:3000/dev/blocks?type=framer_yuya_hero) |
| 8 | `housent_about` | HousentAbout | intro | [open](http://localhost:3000/dev/blocks?type=housent_about) |
| 9 | `housent_cta` | HousentCta | cta | [open](http://localhost:3000/dev/blocks?type=housent_cta) |
| 10 | `housent_excellence` | HousentExcellence | trust | [open](http://localhost:3000/dev/blocks?type=housent_excellence) |
| 11 | `housent_faq` | HousentFaq | faq | [open](http://localhost:3000/dev/blocks?type=housent_faq) |
| 12 | `housent_footer` | HousentFooter | footer | [open](http://localhost:3000/dev/blocks?type=housent_footer) |
| 13 | `housent_solutions` | HousentSolutions | services | [open](http://localhost:3000/dev/blocks?type=housent_solutions) |
| 14 | `housent_stats` | HousentStats | trust | [open](http://localhost:3000/dev/blocks?type=housent_stats) |
| 15 | `housent_testimonial` | HousentTestimonial | trust | [open](http://localhost:3000/dev/blocks?type=housent_testimonial) |
| 16 | `housent_values` | HousentValues | trust | [open](http://localhost:3000/dev/blocks?type=housent_values) |
| 17 | `ignitex_about` | IgnitexAbout | intro | [open](http://localhost:3000/dev/blocks?type=ignitex_about) |
| 18 | `ignitex_cta` | IgnitexCta | cta | [open](http://localhost:3000/dev/blocks?type=ignitex_cta) |
| 19 | `ignitex_footer` | IgnitexFooter | footer | [open](http://localhost:3000/dev/blocks?type=ignitex_footer) |
| 20 | `ignitex_hero` | IgnitexHero | hero | [open](http://localhost:3000/dev/blocks?type=ignitex_hero) |
| 21 | `ignitex_services` | IgnitexServices | services | [open](http://localhost:3000/dev/blocks?type=ignitex_services) |
| 22 | `lumea_amenities` | LumeaAmenities | amenity | [open](http://localhost:3000/dev/blocks?type=lumea_amenities) |
| 23 | `lumea_footer` | LumeaFooter | footer | [open](http://localhost:3000/dev/blocks?type=lumea_footer) |
| 24 | `lumea_gallery` | LumeaGallery | gallery | [open](http://localhost:3000/dev/blocks?type=lumea_gallery) |
| 25 | `lumea_handcrafted` | LumeaFeature | feature | [open](http://localhost:3000/dev/blocks?type=lumea_handcrafted) |
| 26 | `lumea_hero` | LumeaHero | hero | [open](http://localhost:3000/dev/blocks?type=lumea_hero) |
| 27 | `lumea_immersive` | LumeaFeature | feature | [open](http://localhost:3000/dev/blocks?type=lumea_immersive) |
| 28 | `lumea_statement` | LumeaStatement | intro | [open](http://localhost:3000/dev/blocks?type=lumea_statement) |
| 29 | `lumea_testimonial` | LumeaTestimonial | trust | [open](http://localhost:3000/dev/blocks?type=lumea_testimonial) |
| 30 | `nordhaven_about` | NordhavenAbout | intro | [open](http://localhost:3000/dev/blocks?type=nordhaven_about) |
| 31 | `nordhaven_footer` | NordhavenFooter | footer | [open](http://localhost:3000/dev/blocks?type=nordhaven_footer) |
| 32 | `nordhaven_gallery` | NordhavenGallery | gallery | [open](http://localhost:3000/dev/blocks?type=nordhaven_gallery) |
| 33 | `nordhaven_hero` | NordhavenHero | hero | [open](http://localhost:3000/dev/blocks?type=nordhaven_hero) |
| 34 | `nordhaven_services` | NordhavenServices | services | [open](http://localhost:3000/dev/blocks?type=nordhaven_services) |
| 35 | `nordhaven_testimonials` | NordhavenTestimonials | trust | [open](http://localhost:3000/dev/blocks?type=nordhaven_testimonials) |
| 36 | `readymag_footer` | ReadymagFooter | footer | [open](http://localhost:3000/dev/blocks?type=readymag_footer) |
| 37 | `readymag_projects` | ReadymagProjects | portfolio | [open](http://localhost:3000/dev/blocks?type=readymag_projects) |

---

## 5. Master table (all blocks)

| STT | Component | type_code | Category | BlockDef | Animation | Preview |
|---:|---|---|---|:---:|---|---|
| 1 | HeroSplit | `hero_split` | hero | no | entrance, hover, image | [open](http://localhost:3000/dev/blocks?type=hero_split) |
| 2 | HeroScroll | `hero_scroll` | hero | yes | entrance, image, other, scroll | [open](http://localhost:3000/dev/blocks?type=hero_scroll) |
| 3 | AlturaOlympus | `altura_olympus` | intro | yes | entrance, image, scroll | [open](http://localhost:3000/dev/blocks?type=altura_olympus) |
| 4 | ScrollMattis | `scroll_mattis` | hero | yes | entrance, image, other, scroll | [open](http://localhost:3000/dev/blocks?type=scroll_mattis) |
| 5 | HeroOverlay | `hero_overlay` | hero | no | entrance, hover, image | [open](http://localhost:3000/dev/blocks?type=hero_overlay) |
| 6 | FeatureSection | `feature_section` | feature | no | entrance | [open](http://localhost:3000/dev/blocks?type=feature_section) |
| 7 | BookingForm | `booking_form` | form | no | entrance | [open](http://localhost:3000/dev/blocks?type=booking_form) |
| 8 | CtaSection | `cta_section` | cta | no | entrance, hover, image | [open](http://localhost:3000/dev/blocks?type=cta_section) |
| 9 | MintDetails | `mint_details` | feature | no | entrance, scroll, text | [open](http://localhost:3000/dev/blocks?type=mint_details) |
| 10 | MintSku | `mint_sku` | pricing | no | entrance, scroll, text | [open](http://localhost:3000/dev/blocks?type=mint_sku) |
| 11 | MintHero | `mint_hero` | hero | no | entrance, image, scroll, text | [open](http://localhost:3000/dev/blocks?type=mint_hero) |
| 12 | MintVariants | `mint_variants` | pricing | no | entrance, image, scroll | [open](http://localhost:3000/dev/blocks?type=mint_variants) |
| 13 | MintDiscover | `mint_discover` | gallery | yes | entrance, hover, image, other, scroll | [open](http://localhost:3000/dev/blocks?type=mint_discover) |
| 14 | PnjHero | `pnj_hero` | hero | yes | entrance, image, scroll, text | [open](http://localhost:3000/dev/blocks?type=pnj_hero) |
| 15 | CoolHunterHero | `cool_hunter_hero` | hero | yes | scroll | [open](http://localhost:3000/dev/blocks?type=cool_hunter_hero) |
| 16 | CoolHunterStory | `cool_hunter_story` | intro | yes | entrance, image, scroll | [open](http://localhost:3000/dev/blocks?type=cool_hunter_story) |
| 17 | CoolHunterGallery | `cool_hunter_gallery` | gallery | yes | entrance, scroll | [open](http://localhost:3000/dev/blocks?type=cool_hunter_gallery) |
| 18 | CoolHunterProduct | `cool_hunter_product` | feature | yes | entrance, image, scroll | [open](http://localhost:3000/dev/blocks?type=cool_hunter_product) |
| 19 | CoolHunterQuote | `cool_hunter_quote` | intro | yes | entrance, image, scroll | [open](http://localhost:3000/dev/blocks?type=cool_hunter_quote) |
| 20 | CoolHunterFooter | `cool_hunter_footer` | cta | yes | image, scroll | [open](http://localhost:3000/dev/blocks?type=cool_hunter_footer) |
| 21 | PnjDetails | `pnj_details` | intro | yes | entrance, scroll, text | [open](http://localhost:3000/dev/blocks?type=pnj_details) |
| 22 | PnjVariant | `pnj_variant` | feature | yes | entrance, image, scroll | [open](http://localhost:3000/dev/blocks?type=pnj_variant) |
| 23 | PnjHeader | `pnj_header` | navigation | yes | other, scroll | [open](http://localhost:3000/dev/blocks?type=pnj_header) |
| 24 | PnjStickyMenu | `pnj_sticky_menu` | navigation | yes | other, scroll | [open](http://localhost:3000/dev/blocks?type=pnj_sticky_menu) |
| 25 | PnjCta | `pnj_cta` | cta | yes | entrance, scroll | [open](http://localhost:3000/dev/blocks?type=pnj_cta) |
| 26 | MintV2Emblem | `mintv2_emblem` | intro | no | entrance, image, scroll, text | [open](http://localhost:3000/dev/blocks?type=mintv2_emblem) |
| 27 | MintV2Services | `mintv2_services` | services | yes | entrance, hover, image, scroll, text | [open](http://localhost:3000/dev/blocks?type=mintv2_services) |
| 28 | MintV2Manifesto | `mintv2_manifesto` | intro | no | entrance, image, scroll, text | [open](http://localhost:3000/dev/blocks?type=mintv2_manifesto) |
| 29 | MintV2Process | `mintv2_process` | progress | yes | entrance, scroll, text | [open](http://localhost:3000/dev/blocks?type=mintv2_process) |
| 30 | MintV2Cta | `mintv2_cta` | cta | no | entrance, scroll | [open](http://localhost:3000/dev/blocks?type=mintv2_cta) |
| 31 | MintV2Works | `mintv2_works` | portfolio | yes | entrance, image, other, scroll, text | [open](http://localhost:3000/dev/blocks?type=mintv2_works) |
| 32 | LineaPortfolio | `linea_portfolio` | portfolio | no | entrance, other, scroll | [open](http://localhost:3000/dev/blocks?type=linea_portfolio) |
| 33 | MintVaultHero | `mint_vault_hero` | hero | no | entrance, image, other, scroll | [open](http://localhost:3000/dev/blocks?type=mint_vault_hero) |
| 34 | MintVaultCraft | `mint_vault_craft` | feature | no | entrance, other, scroll | [open](http://localhost:3000/dev/blocks?type=mint_vault_craft) |
| 35 | MintVaultReveal | `mint_vault_reveal` | gallery | no | entrance, image, scroll | [open](http://localhost:3000/dev/blocks?type=mint_vault_reveal) |
| 36 | MintVaultCollection | `mint_vault_collection` | listing | no | other | [open](http://localhost:3000/dev/blocks?type=mint_vault_collection) |
| 37 | MintVaultInvitation | `mint_vault_invitation` | cta | no | entrance, image, scroll | [open](http://localhost:3000/dev/blocks?type=mint_vault_invitation) |
| 38 | ImageCarousel | `image_carousel` | gallery | no | other | [open](http://localhost:3000/dev/blocks?type=image_carousel) |
| 39 | InteractiveAdWidget | `interactive_ad_widget` | interactive | yes | hover, image, other | [open](http://localhost:3000/dev/blocks?type=interactive_ad_widget) |
| 40 | BrightedgeHero | `brightedge_hero` | hero | yes | entrance, image, other, scroll | [open](http://localhost:3000/dev/blocks?type=brightedge_hero) |
| 41 | Stories | `stories` | gallery | no | entrance | [open](http://localhost:3000/dev/blocks?type=stories) |
| 42 | SplitScreen | `split_screen` | feature | no | entrance | [open](http://localhost:3000/dev/blocks?type=split_screen) |
| 43 | Quiz | `quiz` | interactive | no | entrance | [open](http://localhost:3000/dev/blocks?type=quiz) |
| 44 | Poll | `poll` | interactive | no | entrance | [open](http://localhost:3000/dev/blocks?type=poll) |
| 45 | Carousel3d | `carousel_3d` | gallery | no | entrance, other | [open](http://localhost:3000/dev/blocks?type=carousel_3d) |
| 46 | Flipbook | `flipbook` | gallery | no | entrance, other | [open](http://localhost:3000/dev/blocks?type=flipbook) |
| 47 | Panorama | `panorama` | gallery | no | entrance, other | [open](http://localhost:3000/dev/blocks?type=panorama) |
| 48 | TextDisplaceHero | `text_displace_hero` | hero | no | entrance, text | [open](http://localhost:3000/dev/blocks?type=text_displace_hero) |
| 49 | ImageTrail | `image_trail` | interactive | no | entrance, image | [open](http://localhost:3000/dev/blocks?type=image_trail) |
| 50 | StickyScrollCards | `sticky_scroll_cards` | feature | no | image, scroll | [open](http://localhost:3000/dev/blocks?type=sticky_scroll_cards) |
| 51 | Gallery3dDepth | `gallery_3d_depth` | gallery | no | entrance, image, other | [open](http://localhost:3000/dev/blocks?type=gallery_3d_depth) |
| 52 | ParallaxHero | `parallax_hero` | hero | no | entrance, hover, other | [open](http://localhost:3000/dev/blocks?type=parallax_hero) |
| 53 | LightboxFlip | `lightbox_flip` | gallery | no | entrance, image | [open](http://localhost:3000/dev/blocks?type=lightbox_flip) |
| 54 | FlipGallery | `flip_gallery` | gallery | no | entrance, image | [open](http://localhost:3000/dev/blocks?type=flip_gallery) |
| 55 | WheelGallery | `wheel_gallery` | gallery | no | image, other, scroll | [open](http://localhost:3000/dev/blocks?type=wheel_gallery) |
| 56 | HoverRevealList | `hover_reveal_list` | interactive | no | entrance, hover, image | [open](http://localhost:3000/dev/blocks?type=hover_reveal_list) |
| 57 | HoverEqualizerHeading | `hover_equalizer_heading` | interactive | no | entrance, text | [open](http://localhost:3000/dev/blocks?type=hover_equalizer_heading) |
| 58 | ImageExplosion | `image_explosion` | gallery | no | entrance, image | [open](http://localhost:3000/dev/blocks?type=image_explosion) |
| 59 | MarqueeBand | `marquee_band` | marquee | no | entrance, other | [open](http://localhost:3000/dev/blocks?type=marquee_band) |
| 60 | StorySlides | `story_slides` | gallery | no | entrance | [open](http://localhost:3000/dev/blocks?type=story_slides) |
| 61 | AccordionMedia | `accordion_media` | feature | no | entrance, hover, image, other | [open](http://localhost:3000/dev/blocks?type=accordion_media) |
| 62 | Spotlight | `spotlight` | feature | no | entrance, hover | [open](http://localhost:3000/dev/blocks?type=spotlight) |
| 63 | ProcessSteps | `process_steps` | progress | no | entrance | [open](http://localhost:3000/dev/blocks?type=process_steps) |
| 64 | DotMatrix | `dot_matrix` | interactive | no | entrance | [open](http://localhost:3000/dev/blocks?type=dot_matrix) |
| 65 | InteractiveGrid | `interactive_grid` | interactive | no | entrance, hover | [open](http://localhost:3000/dev/blocks?type=interactive_grid) |
| 66 | PixelReveal | `pixel_reveal` | gallery | no | entrance, image | [open](http://localhost:3000/dev/blocks?type=pixel_reveal) |
| 67 | LetterSlider | `letter_slider` | interactive | no | entrance, image, text | [open](http://localhost:3000/dev/blocks?type=letter_slider) |
| 68 | SeamlessScrollGallery | `seamless_scroll_gallery` | gallery | no | entrance, other | [open](http://localhost:3000/dev/blocks?type=seamless_scroll_gallery) |
| 69 | ProductSpecSheet | `product_spec_sheet` | pricing | no | entrance | [open](http://localhost:3000/dev/blocks?type=product_spec_sheet) |
| 70 | FramerYumeHero | `framer_yume_hero` | hero | yes | none | [open](http://localhost:3000/dev/blocks?type=framer_yume_hero) |
| 71 | FramerYumeHero | `framer_yuya_hero` | hero | no | none | [open](http://localhost:3000/dev/blocks?type=framer_yuya_hero) |
| 72 | FramerArpeggioHeroV2 | `framer_arpeggio_hero_v2` | hero | no | entrance, image | [open](http://localhost:3000/dev/blocks?type=framer_arpeggio_hero_v2) |
| 73 | FramerPerformHero | `framer_perform_hero` | hero | no | entrance, image, scroll, text | [open](http://localhost:3000/dev/blocks?type=framer_perform_hero) |
| 74 | FramerBungeeHeroV2 | `framer_bungee_hero_v2` | hero | yes | entrance, other, scroll | [open](http://localhost:3000/dev/blocks?type=framer_bungee_hero_v2) |
| 75 | FramerPurevisualsHero | `framer_purevisuals_hero` | hero | yes | entrance, image, other, scroll | [open](http://localhost:3000/dev/blocks?type=framer_purevisuals_hero) |
| 76 | FramerIntroRedefined | `framer_intro_redefined` | intro | no | entrance | [open](http://localhost:3000/dev/blocks?type=framer_intro_redefined) |
| 77 | FramerExploreCta | `framer_explore_cta` | cta | no | entrance | [open](http://localhost:3000/dev/blocks?type=framer_explore_cta) |
| 78 | FramerFlatWhiteProcess | `framer_flat_white_process` | progress | yes | entrance, image, scroll, text | [open](http://localhost:3000/dev/blocks?type=framer_flat_white_process) |
| 79 | FramerStudioManifesto | `framer_studio_manifesto` | intro | no | entrance | [open](http://localhost:3000/dev/blocks?type=framer_studio_manifesto) |
| 80 | FramerStatsGrid | `framer_stats_grid` | trust | no | entrance | [open](http://localhost:3000/dev/blocks?type=framer_stats_grid) |
| 81 | FramerProjectsGrid | `framer_projects_grid` | portfolio | no | entrance, hover, image | [open](http://localhost:3000/dev/blocks?type=framer_projects_grid) |
| 82 | FramerTeamDirectory | `framer_team_directory` | trust | no | entrance | [open](http://localhost:3000/dev/blocks?type=framer_team_directory) |
| 83 | FramerImageStagger | `framer_image_stagger` | gallery | no | entrance | [open](http://localhost:3000/dev/blocks?type=framer_image_stagger) |
| 84 | HousentOurExcellence | `housent_our_excellence` | trust | yes | entrance, image, scroll | [open](http://localhost:3000/dev/blocks?type=housent_our_excellence) |
| 85 | FramerFaqMinimal | `framer_faq_minimal` | faq | no | entrance, other | [open](http://localhost:3000/dev/blocks?type=framer_faq_minimal) |
| 86 | FramerDarlingTimeline | `framer_darling_timeline` | progress | no | entrance, image, scroll | [open](http://localhost:3000/dev/blocks?type=framer_darling_timeline) |
| 87 | FramerNftpullTimeline | `framer_nftpull_timeline` | progress | yes | entrance, image, scroll | [open](http://localhost:3000/dev/blocks?type=framer_nftpull_timeline) |
| 88 | FramerSignatureFeature | `framer_signature_feature` | feature | no | entrance | [open](http://localhost:3000/dev/blocks?type=framer_signature_feature) |
| 89 | FramerVsCollinsProjects | `framer_vs_collins_projects` | portfolio | no | entrance, hover | [open](http://localhost:3000/dev/blocks?type=framer_vs_collins_projects) |
| 90 | FramerClarityServices | `framer_clarity_services` | services | no | entrance | [open](http://localhost:3000/dev/blocks?type=framer_clarity_services) |
| 91 | FramerIgnitexStep | `framer_ignitex_step` | progress | yes | image, scroll | [open](http://localhost:3000/dev/blocks?type=framer_ignitex_step) |
| 92 | FramerAesthaEditorial | `framer_aestha_editorial` | intro | no | entrance | [open](http://localhost:3000/dev/blocks?type=framer_aestha_editorial) |
| 93 | MasteriseHomeInside | `masterise_home_inside` | intro | yes | entrance, hover, image, other, scroll, text | [open](http://localhost:3000/dev/blocks?type=masterise_home_inside) |
| 94 | FramerPerformAbout | `framer_perform_about` | intro | no | entrance, image, scroll | [open](http://localhost:3000/dev/blocks?type=framer_perform_about) |
| 95 | FramerPerformPricing | `framer_perform_pricing` | pricing | no | entrance, image, scroll | [open](http://localhost:3000/dev/blocks?type=framer_perform_pricing) |
| 96 | DelvauxHeader | `delvaux_header` | header | yes | entrance, other | [open](http://localhost:3000/dev/blocks?type=delvaux_header) |
| 97 | DelvauxSubnav | `delvaux_subnav` | header | yes | entrance, hover, image, other | [open](http://localhost:3000/dev/blocks?type=delvaux_subnav) |
| 98 | DelvauxHero | `delvaux_hero` | hero | yes | entrance, image, scroll | [open](http://localhost:3000/dev/blocks?type=delvaux_hero) |
| 99 | DelvauxDetails | `delvaux_details` | intro | yes | entrance, image, scroll, text | [open](http://localhost:3000/dev/blocks?type=delvaux_details) |
| 100 | DelvauxProduct | `delvaux_product` | feature | yes | entrance, image, other, scroll | [open](http://localhost:3000/dev/blocks?type=delvaux_product) |
| 101 | DelvauxVariant | `delvaux_variant` | pricing | yes | entrance, hover, image, other, scroll | [open](http://localhost:3000/dev/blocks?type=delvaux_variant) |
| 102 | Q80Experience | `q80_experience` | hero | yes | entrance, image, other, scroll | [open](http://localhost:3000/dev/blocks?type=q80_experience) |
| 103 | Q80Menu | `q80_menu` | header | yes | other | [open](http://localhost:3000/dev/blocks?type=q80_menu) |
| 104 | HousentHero | `housent_hero` | hero | yes | entrance, image, scroll, text | [open](http://localhost:3000/dev/blocks?type=housent_hero) |
| 105 | HousentStats | `housent_stats` | trust | yes | none | [open](http://localhost:3000/dev/blocks?type=housent_stats) |
| 106 | HousentListings | `housent_listings` | listing | yes | hover, image | [open](http://localhost:3000/dev/blocks?type=housent_listings) |
| 107 | HousentCta | `housent_cta` | cta | yes | none | [open](http://localhost:3000/dev/blocks?type=housent_cta) |
| 108 | HousentFooter | `housent_footer` | footer | yes | none | [open](http://localhost:3000/dev/blocks?type=housent_footer) |
| 109 | HousentAbout | `housent_about` | intro | yes | none | [open](http://localhost:3000/dev/blocks?type=housent_about) |
| 110 | HousentExcellence | `housent_excellence` | trust | yes | none | [open](http://localhost:3000/dev/blocks?type=housent_excellence) |
| 111 | HousentSolutions | `housent_solutions` | services | yes | none | [open](http://localhost:3000/dev/blocks?type=housent_solutions) |
| 112 | HousentValues | `housent_values` | trust | yes | none | [open](http://localhost:3000/dev/blocks?type=housent_values) |
| 113 | HousentFaq | `housent_faq` | faq | yes | none | [open](http://localhost:3000/dev/blocks?type=housent_faq) |
| 114 | HousentTestimonial | `housent_testimonial` | trust | yes | none | [open](http://localhost:3000/dev/blocks?type=housent_testimonial) |
| 115 | HousentBlogs | `housent_blogs` | blog | yes | hover, image | [open](http://localhost:3000/dev/blocks?type=housent_blogs) |
| 116 | LumeaHero | `lumea_hero` | hero | yes | none | [open](http://localhost:3000/dev/blocks?type=lumea_hero) |
| 117 | LumeaStatement | `lumea_statement` | intro | yes | none | [open](http://localhost:3000/dev/blocks?type=lumea_statement) |
| 118 | LumeaFeature | `lumea_immersive` | feature | yes | none | [open](http://localhost:3000/dev/blocks?type=lumea_immersive) |
| 119 | LumeaFeature | `lumea_handcrafted` | feature | yes | none | [open](http://localhost:3000/dev/blocks?type=lumea_handcrafted) |
| 120 | LumeaAmenities | `lumea_amenities` | amenity | yes | none | [open](http://localhost:3000/dev/blocks?type=lumea_amenities) |
| 121 | LumeaTestimonial | `lumea_testimonial` | trust | yes | none | [open](http://localhost:3000/dev/blocks?type=lumea_testimonial) |
| 122 | LumeaGallery | `lumea_gallery` | gallery | yes | none | [open](http://localhost:3000/dev/blocks?type=lumea_gallery) |
| 123 | LumeaFooter | `lumea_footer` | footer | yes | none | [open](http://localhost:3000/dev/blocks?type=lumea_footer) |
| 124 | NordhavenHero | `nordhaven_hero` | hero | yes | none | [open](http://localhost:3000/dev/blocks?type=nordhaven_hero) |
| 125 | NordhavenAbout | `nordhaven_about` | intro | yes | none | [open](http://localhost:3000/dev/blocks?type=nordhaven_about) |
| 126 | NordhavenServices | `nordhaven_services` | services | yes | none | [open](http://localhost:3000/dev/blocks?type=nordhaven_services) |
| 127 | NordhavenProperties | `nordhaven_properties` | listing | yes | hover, image | [open](http://localhost:3000/dev/blocks?type=nordhaven_properties) |
| 128 | NordhavenTestimonials | `nordhaven_testimonials` | trust | yes | none | [open](http://localhost:3000/dev/blocks?type=nordhaven_testimonials) |
| 129 | NordhavenFaq | `nordhaven_faq` | faq | yes | other | [open](http://localhost:3000/dev/blocks?type=nordhaven_faq) |
| 130 | NordhavenGallery | `nordhaven_gallery` | gallery | yes | none | [open](http://localhost:3000/dev/blocks?type=nordhaven_gallery) |
| 131 | NordhavenFooter | `nordhaven_footer` | footer | yes | none | [open](http://localhost:3000/dev/blocks?type=nordhaven_footer) |
| 132 | FirmaHero | `firma_hero` | hero | yes | none | [open](http://localhost:3000/dev/blocks?type=firma_hero) |
| 133 | FirmaStatement | `firma_statement` | intro | yes | none | [open](http://localhost:3000/dev/blocks?type=firma_statement) |
| 134 | FirmaWork | `firma_work` | portfolio | yes | hover, image | [open](http://localhost:3000/dev/blocks?type=firma_work) |
| 135 | FirmaTestimonial | `firma_testimonial` | trust | yes | none | [open](http://localhost:3000/dev/blocks?type=firma_testimonial) |
| 136 | FirmaServices | `firma_services` | services | yes | none | [open](http://localhost:3000/dev/blocks?type=firma_services) |
| 137 | FirmaFooter | `firma_footer` | footer | yes | none | [open](http://localhost:3000/dev/blocks?type=firma_footer) |
| 138 | IgnitexHero | `ignitex_hero` | hero | yes | none | [open](http://localhost:3000/dev/blocks?type=ignitex_hero) |
| 139 | IgnitexServices | `ignitex_services` | services | yes | none | [open](http://localhost:3000/dev/blocks?type=ignitex_services) |
| 140 | IgnitexProjects | `ignitex_projects` | portfolio | yes | hover, image | [open](http://localhost:3000/dev/blocks?type=ignitex_projects) |
| 141 | IgnitexAbout | `ignitex_about` | intro | yes | none | [open](http://localhost:3000/dev/blocks?type=ignitex_about) |
| 142 | IgnitexCta | `ignitex_cta` | cta | yes | none | [open](http://localhost:3000/dev/blocks?type=ignitex_cta) |
| 143 | IgnitexFooter | `ignitex_footer` | footer | yes | none | [open](http://localhost:3000/dev/blocks?type=ignitex_footer) |
| 144 | ReadymagMarquee | `readymag_marquee` | marquee | yes | other | [open](http://localhost:3000/dev/blocks?type=readymag_marquee) |
| 145 | ReadymagProjects | `readymag_projects` | portfolio | yes | none | [open](http://localhost:3000/dev/blocks?type=readymag_projects) |
| 146 | ReadymagFooter | `readymag_footer` | footer | yes | none | [open](http://localhost:3000/dev/blocks?type=readymag_footer) |
| 147 | ProtectionScrollytelling | `protection_scrollytelling` | hero | yes | entrance, image, scroll | [open](http://localhost:3000/dev/blocks?type=protection_scrollytelling) |
| 148 | SpringsHeader | `springs_header` | header | yes | entrance, scroll | [open](http://localhost:3000/dev/blocks?type=springs_header) |
| 149 | SpringsGallery | `springs_gallery` | hero | yes | entrance, image, scroll | [open](http://localhost:3000/dev/blocks?type=springs_gallery) |
| 150 | SpringsHero | `springs_hero` | hero | yes | entrance, image, scroll | [open](http://localhost:3000/dev/blocks?type=springs_hero) |
| 151 | SpringsIntro | `springs_intro` | intro | yes | entrance, image, scroll | [open](http://localhost:3000/dev/blocks?type=springs_intro) |
| 152 | SpringsWellness | `springs_wellness` | amenity | yes | entrance, image, scroll | [open](http://localhost:3000/dev/blocks?type=springs_wellness) |
| 153 | SpringsNaturePlace | `springs_nature_place` | amenity | yes | entrance, image, scroll | [open](http://localhost:3000/dev/blocks?type=springs_nature_place) |
| 154 | SpringsMap | `springs_map` | location | yes | entrance, image, scroll | [open](http://localhost:3000/dev/blocks?type=springs_map) |
| 155 | RealEstateLocation | `real_estate_location` | location | yes | entrance, scroll | [open](http://localhost:3000/dev/blocks?type=real_estate_location) |
| 156 | RealEstateHero | `real_estate_hero` | hero | yes | entrance, scroll | [open](http://localhost:3000/dev/blocks?type=real_estate_hero) |
| 157 | RealEstateInfo | `real_estate_info` | feature | yes | entrance, scroll | [open](http://localhost:3000/dev/blocks?type=real_estate_info) |
| 158 | RealEstateOverview | `real_estate_overview` | feature | yes | entrance, scroll | [open](http://localhost:3000/dev/blocks?type=real_estate_overview) |
| 159 | RealEstateHighlights | `real_estate_highlights` | feature | yes | entrance, scroll | [open](http://localhost:3000/dev/blocks?type=real_estate_highlights) |
| 160 | RealEstateVilla | `real_estate_villa` | feature | yes | entrance, image, other, scroll | [open](http://localhost:3000/dev/blocks?type=real_estate_villa) |
| 161 | RealEstateUtilities | `real_estate_utilities` | feature | yes | entrance, scroll | [open](http://localhost:3000/dev/blocks?type=real_estate_utilities) |
| 162 | SpringsDesign | `springs_design` | feature | yes | entrance, image, scroll | [open](http://localhost:3000/dev/blocks?type=springs_design) |
| 163 | SpringsResidences | `springs_residences` | listing | yes | entrance, image, scroll | [open](http://localhost:3000/dev/blocks?type=springs_residences) |
| 164 | SpringsInteriors | `springs_interiors` | gallery | yes | entrance, image, scroll | [open](http://localhost:3000/dev/blocks?type=springs_interiors) |
| 165 | SpringsContactFooter | `springs_contact_footer` | footer | yes | entrance, scroll | [open](http://localhost:3000/dev/blocks?type=springs_contact_footer) |
| 166 | SustainitOurExpertise | `sustainit_our_expertise` | services | yes | entrance, scroll | [open](http://localhost:3000/dev/blocks?type=sustainit_our_expertise) |
| 167 | FramerFirmaTemplateStrategyDigital | `framer_firma_template_strategy_digital` | portfolio | yes | entrance | [open](http://localhost:3000/dev/blocks?type=framer_firma_template_strategy_digital) |
| 168 | ReadymagCaseSection | `readymag_case_section` | portfolio | yes | entrance, image, scroll | [open](http://localhost:3000/dev/blocks?type=readymag_case_section) |
| 169 | FramerEstanciaAboutUs | `framer_estancia_about_us` | intro | yes | entrance, hover, scroll | [open](http://localhost:3000/dev/blocks?type=framer_estancia_about_us) |

---

## 6. Notes

- **Shared components:** `framer_yuya_hero` → `FramerYumeHero` (same as `framer_yume_hero`); `lumea_immersive` + `lumea_handcrafted` → `LumeaFeature`.
- **Cool Hunter pack (6):** `cool_hunter_hero`, `cool_hunter_story`, `cool_hunter_gallery`, `cool_hunter_product`, `cool_hunter_quote`, `cool_hunter_footer`.
- **Sub-components (not BlockTypes):** `MintDiscoverPanel`, `PnjDiscoverPanel`, `PnjHeroHotspots`, `TransformedImage` — excluded from counts.
- **Rendering:** registry-first via `getBlockDef(type).component`; fallback `BLOCK_RENDERERS` in `renderBlock.tsx` for types without BlockDef.
- **Preview URL pattern:** `http://localhost:3000/dev/blocks?type=<type_code>` (dev server must be running).
- **Audit:** apps-port-audit / host-contract PASS-FAIL intentionally omitted from this report.
- Classification is heuristic (file signals). Button color `hover:` alone does not count as hover animation.
- **Text group** uses strict signals only: `SplitText` / `SplitType` / `split.chars|words` / letter-mask DOM / framer char-stagger.
