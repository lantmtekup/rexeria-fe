'use client';

import * as React from 'react';
import * as Popover from '@radix-ui/react-popover';
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  ChevronDown,
  ImageIcon,
  Italic,
  ListChecks,
  Loader2,
  MousePointerClick,
  Palette,
  Plus,
  Ruler,
  RotateCcw,
  Sparkles,
  Strikethrough,
  Trash2,
  Underline,
  X,
} from 'lucide-react';
import { toast } from 'sonner';

import { Input } from '@/components/atoms/input';
import { Textarea } from '@/components/atoms/textarea';
import {
  BRAND_COLOR_ROLES,
  brandToken,
  brandTokenKey,
  previewColor,
} from '@/lib/brand-kit';
import { cn } from '@/lib/cn';
import { resolveWestlyResidences } from './blocks/westlyResidencesData';
import { RxApiError } from '@/services/rexer/client';
import { rexerApi } from '@/services/rexer/endpoints';
import type { AIBlockType } from '@/services/rexer/types';
import { IMG as MINT_IMG } from '@/templates/mint-coint/lib/image-cdn';

import { FEATURE_ICON_OPTIONS } from './blocks/FeatureSection';
import {
  SOCIAL_ICON_MAP,
  SOCIAL_PLATFORM_OPTIONS,
} from './blocks/theGrandFooterSocialIcons';
import {
  PNJ_PARAGRAPH_KEY_RE,
  resolvePnjParagraphs,
  setPnjParagraphAt,
} from './blocks/PnjDetails';
import { DELVAUX_HERO_FRAMES } from './blocks/_registry/defs/delvauxHeroFrames';
import { LINEA_PORTFOLIO_DEFAULT_IMG } from './blocks/_registry/defs/lineaPortfolio';
import {
  GAMBIT_OVERVIEW_NEW_PANEL,
  resolveGambitOverviewPanels,
} from './blocks/_registry/defs/gambitProductOverview';
import {
  GAMBIT_RELATED_NEW_PRODUCT,
  resolveGambitRelatedProducts,
} from './blocks/_registry/defs/gambitRelatedProducts';
import {
  GAMBIT_DETAILS_ACTION_ICONS,
  GAMBIT_DETAILS_NEW_ACCORDION,
  GAMBIT_DETAILS_NEW_ACTION,
  GAMBIT_DETAILS_NEW_COLOR,
  GAMBIT_DETAILS_NEW_IMAGE,
  GAMBIT_DETAILS_NEW_SIZE,
  resolveGambitDetailsAccordions,
  resolveGambitDetailsActions,
  resolveGambitDetailsColors,
  resolveGambitDetailsGallery,
  resolveGambitDetailsSizes,
} from './blocks/_registry/defs/gambitProductDetails';
import {
  isPnjHeroFramesConfig,
  MINT_FRAMES_EXAMPLE,
  PNJ_HERO_FRAMES_DEFAULT,
  resolvePnjHeroFrames,
} from './blocks/pnjHeroFrames';
import {
  isPnjHeroScrimConfig,
  PNJ_HERO_SCRIM_PNJ_LAYERS,
  PNJ_HERO_SCRIM_PRESET_IDS,
  PNJ_HERO_SCRIM_PRESET_LABELS,
  resolvePnjHeroScrim,
} from './blocks/pnjHeroScrim';
import {
  PNJ_HERO_TITLE_LINE_KEY_RE,
  resolvePnjHeroTitleLines,
  setPnjHeroTitleLineAt,
} from './blocks/pnjHeroTitleLines';
import {
  PNJ_VARIANT_HIGHLIGHTS_KEY_RE,
  PNJ_VARIANT_HIGHLIGHT_ITEM_KEY_RE,
  resolvePnjVariantHighlights,
  resolvePnjVariants,
  setPnjVariantHighlightItemAt,
} from './blocks/pnjVariantContent';
import { resolveScrollMattisSlides } from './blocks/_registry/defs/scrollMattis';
import {
  READMAG_CASE_BLANK,
  resolveReadymagCases,
} from './blocks/_registry/defs/readymagCaseSection';
import { resolveMasteriseHomeInsideSlides } from './blocks/_registry/defs/masteriseHomeInside';
import {
  ALTURA_OLYMPUS_DEFAULT_FEATURES,
  ALTURA_OLYMPUS_DEFAULT_IMAGES,
  ALTURA_OLYMPUS_ICON_OPTIONS,
  resolveAlturaOlympusFeatures,
  resolveAlturaOlympusImages,
} from './blocks/_registry/defs/alturaOlympus';
import {
  COOL_HUNTER_GALLERY_DEFAULT_ITEMS,
  resolveCoolHunterGalleryItems,
} from './blocks/_registry/defs/coolHunterGallery';
import {
  FRAMER_BUNGEE_HERO_V2_DEFAULT_CARDS,
  resolveFramerBungeeHeroV2CardImages,
  type FramerBungeeHeroV2Card,
} from './blocks/_registry/defs/framerBungeeHeroV2';
import { resolveCoolHunterSectionProgressSections } from './blocks/_registry/defs/coolHunterSectionProgress';
import { resolveBelgoAboutProductSpecs } from './blocks/_registry/defs/belgoAboutProduct';
import {
  resolveBelgoFooterHeadlineWords,
  resolveBelgoFooterLocations,
  resolveBelgoFooterSocials,
} from './blocks/_registry/defs/belgoFooter';
import { resolveBelgoMoreFlavors } from './blocks/_registry/defs/belgoMoreFlavors';
import { BELGO_DEFAULT_FLAVORS } from './blocks/belgoMoreFlavorsContent';
import {
  SCROLL_IMG_SCALE_DEFAULT_ITEMS,
  resolveScrollImgScaleItems,
} from './blocks/_registry/defs/scrollImgScale';
import {
  LETTER_SLIDER_DEFAULT_SLIDES,
  resolveLetterSliderSlides,
} from './blocks/_registry/defs/letterSlider';
import {
  CG_MODULAR_SLIDER_DEFAULT_SLIDES,
  resolveCgModularSliderSlides,
} from './blocks/_registry/defs/cgModularSlider';
import {
  CG_RESPONSIVE_TEAM_DEFAULT_MEMBERS,
  resolveCgResponsiveTeamMembers,
} from './blocks/_registry/defs/cgResponsiveTeam';
import {
  CG_3D_SLIDER_DEFAULT_SLIDES,
  resolveCg3dSliderSlides,
} from './blocks/_registry/defs/cg3dSlider';
import {
  CG_RADGA_HORIZONTAL_DEFAULT_SLIDES,
  resolveCgRadgaHorizontalSlides,
} from './blocks/_registry/defs/cgRadgaHorizontal';
import {
  CG_PAGE_TRANSITIONS_DEFAULT_PAGES,
  resolveCgPageTransitionsPages,
} from './blocks/_registry/defs/cgPageTransitions';
import {
  FRAMER_IGNITEX_STEP_BLANK_CARD,
  resolveFramerIgnitexStepCards,
} from './blocks/_registry/defs/framerIgnitexStep';
import {
  HOUSENT_EXCELLENCE_FALLBACK_ICON,
  HOUSENT_EXCELLENCE_ICON_OPTIONS,
  resolveHousentOurExcellenceItems,
} from './blocks/_registry/defs/housentOurExcellence';
import {
  SUSTAINIT_OUR_EXPERTISE_BLANK,
  resolveSustainitOurExpertiseItems,
} from './blocks/_registry/defs/sustainitOurExpertise';
import {
  REAL_ESTATE_OVERVIEW_DEFAULT_STATS,
  resolveRealEstateOverviewStats,
} from './blocks/_registry/defs/realEstateOverview';
import {
  FRAMER_PUREVISUALS_NEW_IMAGE,
  FRAMER_PUREVISUALS_PANEL_LABEL,
  isFramerPurevisualsPanelKey,
  resolveFramerPurevisualsPanelImages,
  type FramerPurevisualsPanelKey,
} from './blocks/_registry/defs/framerPurevisualsHero';
import {
  FRAMER_CLARITY_SERVICE_NEW_ITEM,
  resolveFramerClarityServices,
} from './blocks/framerClarityServicesContent';
import { buildAiPrompt } from './buildAiPrompt';
import { ImagePicker } from './ImagePicker';
import { getContentAt, setContentAt } from './contentPath';
import { LinkControls } from './links/LinkControls';
import { BACKGROUND_LAYER_KEY, resolveElementMeta } from './resolveElementKind';
import {
  editingVariantOf,
  readVariant,
  type Block,
  type BlockBackground,
  type BlockContent,
  type BookingFormContent,
  type Device,
  type ElementStyle,
  type FeatureSectionContent,
  type HeroSplitContent,
  type ImageCarouselContent,
  type ImageTransform,
  type InteractiveAdWidgetContent,
  type Lang,
  type MintDiscoverContent,
  type ScrollMattisContent,
  type ScrollMattisSlideItem,
  type ReadymagCaseSectionContent,
  type ReadymagCaseItem,
  type MasteriseHomeInsideContent,
  type MasteriseHomeInsideSlide,
  type AlturaOlympusContent,
  type AlturaOlympusFeature,
  type CoolHunterGalleryContent,
  type CoolHunterGalleryItem,
  type FramerBungeeHeroV2Content,
  type CoolHunterSectionProgressContent,
  type BelgoAboutProductContent,
  type BelgoFooterContent,
  type BelgoFooterHeadlineWord,
  type BelgoFooterLocation,
  type BelgoFooterSocial,
  type BelgoFlavorItem,
  type BelgoMoreFlavorsContent,
  type BelgoSpecItem,
  type CoolHunterSectionProgressItem,
  type HousentOurExcellenceContent,
  type HousentOurExcellenceItem,
  type SustainitOurExpertiseContent,
  type SustainitExpertiseItem,
  type ScrollImgScaleContent,
  type ScrollImgScaleItem,
  type LetterSliderContent,
  type LetterSliderSlide,
  type CgModularSliderContent,
  type CgModularSliderSlide,
  type CgResponsiveTeamContent,
  type CgResponsiveTeamMember,
  type Cg3dSliderContent,
  type Cg3dSliderSlide,
  type CgRadgaHorizontalContent,
  type CgRadgaHorizontalSlide,
  type CgPageTransitionsContent,
  type CgPageTransitionsPage,
  type FramerIgnitexStepCard,
  type FramerIgnitexStepContent,
  type FramerClarityServiceItem,
  type FramerClarityServicesContent,
  type MintVariantsContent,
  type FramerDarlingTimelineContent,
  type FramerPerformAboutContent,
  type FramerPerformPricingContent,
  type IgnitexProjectsContent,
  type FramerNftpullTimelineContent,
  type FramerFlatWhiteProcessContent,
  type FramerPurevisualsHeroContent,
  type MintV2ProcessContent,
  type MintV2ProcessStep,
  type MintV2ServiceItem,
  type MintV2ServicesContent,
  type TheGrandServiceContent,
  type TheGrandServiceItem,
  type TheGrandDiscoverContent,
  type TheGrandDiscoverItem,
  type TheGrandAboutContent,
  type TheGrandAboutPartner,
  type TheGrandFooterContent,
  type TheGrandFooterPolicy,
  type TheGrandFooterSocial,
  type TheGrandFooterSocialPlatform,
  type MintVaultCraftContent,
  type MintVaultCraftItem,
  type MintVaultCollectionContent,
  type MintVaultCoin,
  type DelvauxHeroContent,
  type DelvauxProductContent,
  type DelvauxProductHotspot,
  type DelvauxSubnavContent,
  type AesthaNavContent,
  type AesthaExploreContent,
  type AesthaStudioContent,
  type AesthaContactContent,
  type DelvauxSubnavLink,
  type DelvauxVariantContent,
  type DelvauxVariantFaq,
  type GambitProductDetailsAccordion,
  type GambitProductDetailsAction,
  type GambitProductDetailsActionIcon,
  type GambitProductDetailsColor,
  type GambitProductDetailsContent,
  type GambitProductOverviewContent,
  type GambitProductOverviewPanel,
  type GambitRelatedProductsContent,
  type GambitRelatedProductItem,
  type DelvauxVariantOption,
  type CiteFlowFaqContent,
  type CiteFlowFaqItem,
  type CiteFlowAmenityContent,
  type CiteFlowHeaderContent,
  type CiteFlowHeaderSocialLink,
  type PnjDetailsContent,
  type PnjHeroContent,
  type PnjHeroHotspot,
  type WestlyResidenceHotspot,
  type WestlyResidencesContent,
  type PnjVariantContent,
  type PnjVariantItem,
  type PnjStickyMenuContent,
  type PnjStickyMenuItem,
  type LineaPortfolioContent,
  type LineaPortfolioItem,
  type RealEstateOverviewContent,
  type RealEstateOverviewStat,
} from './types';

export { BACKGROUND_LAYER_KEY };

interface ElementToolbarProps {
  block: Block;
  lang: Lang;
  device: Device;
  selectedKey: string | null;
  onClose: () => void;
  onContentChange: (
    next: BlockContent | ((prev: BlockContent) => BlockContent)
  ) => void;
  onUpdateStyle: (patch: ElementStyle) => void;
  onResetStyle: () => void;
  onUpdateBackground: (next: BlockBackground | undefined) => void;
  onSyncVariant?: (
    from: 'desktop' | 'mobile',
    to: 'desktop' | 'mobile'
  ) => void;
}

export function ElementToolbar({
  block,
  lang,
  device,
  selectedKey,
  onClose,
  onContentChange,
  onUpdateStyle,
  onResetStyle,
  onUpdateBackground,
}: ElementToolbarProps) {
  // Tablet renders desktop layout — slim banner makes the read-only state explicit.
  if (device === 'tablet') {
    return (
      <div className='mx-3 mt-3 flex h-11 items-center gap-2 rounded-xl border border-amber-200/60 bg-amber-50/95 px-3.5 shadow-[0_8px_30px_rgba(15,15,15,0.05)] backdrop-blur-md'>
        <div className='size-1.5 rounded-full bg-amber-500' aria-hidden />
        <span className='text-[11px] text-amber-900'>
          Tablet đang xem layout{' '}
          <strong className='font-semibold'>Desktop</strong> (chỉ đọc) — chuyển
          Desktop hoặc Mobile để chỉnh sửa.
        </span>
      </div>
    );
  }

  // Chưa chọn element → ẩn hẳn thanh toolbar (không hiện banner hướng dẫn) để
  // canvas có thêm chỗ. Toolbar chỉ xuất hiện khi đang sửa 1 element cụ thể.
  if (!selectedKey) return null;

  const { kind, fieldType, label } = resolveElementMeta(
    block.blockType,
    selectedKey
  );
  const variant = editingVariantOf(device);
  const langContent = lang === 'vi' ? block.contentVi : block.contentEn;
  // Read content for the variant being edited, falling back to desktop
  // (so when mobile is undefined, the toolbar still shows desktop values).
  const content = readVariant(langContent, device) ?? langContent.desktop;
  const style: ElementStyle | undefined =
    block.elementStyles?.[variant]?.[selectedKey];

  const handleDelete = () => {
    const c = content as Record<string, unknown>;
    if (kind === 'background') {
      onUpdateBackground(undefined);
      toast.success('Đã xoá nền');
      onClose();
      return;
    }
    if (!window.confirm(`Xoá nội dung "${label}"?`)) return;

    if (kind === 'pnjFrames') {
      const next = { ...c };
      delete next.frames;
      onContentChange(next as BlockContent);
      toast.success('Đã reset frame sequence về mặc định PNJ');
      onClose();
      return;
    }

    if (kind === 'delvauxFrames') {
      onContentChange({
        ...c,
        frameUrls: [...DELVAUX_HERO_FRAMES],
        frameCount: DELVAUX_HERO_FRAMES.length,
        frameUrlPattern: '',
      } as BlockContent);
      toast.success('Đã reset chuỗi frame về mặc định Delvaux');
      onClose();
      return;
    }

    if (kind === 'pnjScrim') {
      const next = { ...c };
      delete next.scrim;
      onContentChange(next as BlockContent);
      toast.success('Đã reset lớp mờ về mặc định PNJ');
      onClose();
      return;
    }

    let nextValue: unknown;
    if (kind === 'text' || kind === 'image' || kind === 'link') nextValue = '';
    else nextValue = [];

    const paraMatch = selectedKey.match(PNJ_PARAGRAPH_KEY_RE);
    const titleLineMatch = selectedKey.match(PNJ_HERO_TITLE_LINE_KEY_RE);
    if (paraMatch) {
      const index = Number(paraMatch[1]);
      onContentChange(
        prev =>
          setPnjParagraphAt(
            prev as PnjDetailsContent & {
              paragraph1?: string;
              paragraph2?: string;
            },
            index,
            ''
          ) as BlockContent
      );
    } else if (titleLineMatch) {
      const index = Number(titleLineMatch[1]);
      onContentChange(
        prev =>
          setPnjHeroTitleLineAt(
            prev as PnjHeroContent,
            index,
            ''
          ) as BlockContent
      );
    } else {
      onContentChange(setContentAt(c, selectedKey, nextValue) as BlockContent);
    }
    if (kind === 'text') onResetStyle();
    toast.success(`Đã xoá ${label.toLowerCase()}`);
    onClose();
  };

  const handleAi = async (prompt: string) => {
    if (!prompt.trim()) {
      toast.error('Nhập mô tả trước khi tạo nội dung AI');
      return;
    }
    try {
      const richPrompt = buildAiPrompt({
        userPrompt: prompt.trim(),
        blockType: block.blockType,
        blockName: block.name,
        selectedField: selectedKey,
        currentContent: content,
        lang,
      });

      const res = await rexerApi.ai.blockContent({
        block_type: block.blockType as AIBlockType,
        prompt: richPrompt,
        lang,
        current_content: content as Record<string, unknown>,
        selected_field: selectedKey,
        block_name: block.name,
      });
      const c = res.content as Record<string, unknown>;
      const nextValue = getContentAt(c, selectedKey);
      if (nextValue !== undefined) {
        const paraMatch = selectedKey.match(PNJ_PARAGRAPH_KEY_RE);
        const titleLineMatch = selectedKey.match(PNJ_HERO_TITLE_LINE_KEY_RE);
        if (paraMatch && typeof nextValue === 'string') {
          onContentChange(
            prev =>
              setPnjParagraphAt(
                prev as PnjDetailsContent & {
                  paragraph1?: string;
                  paragraph2?: string;
                },
                Number(paraMatch[1]),
                nextValue
              ) as BlockContent
          );
        } else if (titleLineMatch && typeof nextValue === 'string') {
          onContentChange(
            prev =>
              setPnjHeroTitleLineAt(
                prev as PnjHeroContent,
                Number(titleLineMatch[1]),
                nextValue
              ) as BlockContent
          );
        } else {
          onContentChange(
            setContentAt(
              content as Record<string, unknown>,
              selectedKey,
              nextValue
            ) as BlockContent
          );
        }
        toast.success(
          res.source === 'ai'
            ? `AI đã đề xuất ${label}`
            : `Đã dùng nội dung mẫu cho ${label}`
        );
      } else {
        toast.error('AI không trả về trường này');
      }
    } catch (err) {
      const msg =
        err instanceof RxApiError
          ? err.message || err.code
          : err instanceof Error
            ? err.message
            : 'Lỗi';
      toast.error(`AI thất bại: ${msg}`);
    }
  };

  return (
    <div className='mx-3 mt-2.5 flex min-h-9 items-center gap-2 rounded-lg border border-neutral-200/70 bg-white/95 px-2.5 py-1.5 shadow-[0_6px_20px_rgba(15,15,15,0.06),0_1px_2px_rgba(15,15,15,0.04)] backdrop-blur-md'>
      {/* Element identity */}
      <div className='flex shrink-0 items-center gap-1.5 pl-0.5'>
        <span
          className='size-1.5 shrink-0 rounded-full bg-sky-500'
          aria-hidden
        />
        <span className='text-[10px] font-semibold tracking-[0.04em] text-neutral-800 uppercase'>
          {label}
        </span>
      </div>

      <Sep />

      {/* Contextual controls */}
      <div className='flex min-w-0 flex-1 [scrollbar-width:none] items-center gap-1.5 overflow-x-auto py-0.5 [&::-webkit-scrollbar]:hidden'>
        {kind === 'text' && (
          <TextControls
            fieldKey={selectedKey}
            blockType={block.blockType}
            multiline={fieldType ? fieldType === 'textarea' : undefined}
            content={content}
            style={style}
            onContentChange={onContentChange}
            onUpdateStyle={onUpdateStyle}
            onResetStyle={onResetStyle}
          />
        )}
        {kind === 'link' && (
          <LinkControls
            fieldKey={selectedKey}
            content={content}
            onContentChange={onContentChange}
          />
        )}
        {kind === 'image' && (
          <ImageControls
            fieldKey={selectedKey}
            blockType={block.blockType}
            content={content}
            onContentChange={onContentChange}
          />
        )}
        {kind === 'stats' && (
          <StatsControls
            content={content as HeroSplitContent}
            onContentChange={onContentChange}
          />
        )}
        {kind === 'features' && (
          <FeaturesControls
            content={content as FeatureSectionContent}
            onContentChange={onContentChange}
          />
        )}
        {kind === 'reasons' && (
          <ReasonsControls
            content={content as BookingFormContent}
            onContentChange={onContentChange}
          />
        )}
        {kind === 'slides' && (
          <SlidesControls
            content={content as ImageCarouselContent}
            onContentChange={onContentChange}
          />
        )}
        {kind === 'scrollMattisSlides' && (
          <ScrollMattisSlidesControls
            content={content as ScrollMattisContent}
            onContentChange={onContentChange}
          />
        )}
        {kind === 'readymagCaseSectionItems' && (
          <ReadymagCaseSectionItemsControls
            content={content as ReadymagCaseSectionContent}
            onContentChange={onContentChange}
          />
        )}
        {kind === 'masteriseSlides' && (
          <MasteriseSlidesControls
            content={content as MasteriseHomeInsideContent}
            onContentChange={onContentChange}
          />
        )}
        {kind === 'interactiveAd' && (
          <InteractiveAdControls
            content={content as InteractiveAdWidgetContent}
            onContentChange={onContentChange}
          />
        )}
        {kind === 'mintVariants' && (
          <MintVariantsControls
            content={content as MintVariantsContent}
            onContentChange={onContentChange}
          />
        )}
        {kind === 'mintTabs' &&
          (block.blockType === 'pnj_hero' ? (
            <PnjHotspotsControls
              content={content as PnjHeroContent}
              onContentChange={onContentChange}
            />
          ) : (
            <MintTabsControls
              content={content as MintDiscoverContent}
              onContentChange={onContentChange}
            />
          ))}
        {kind === 'mintDiscoverVariant' && (
          <MintDiscoverVariantControls
            content={content as MintDiscoverContent}
            onContentChange={onContentChange}
          />
        )}
        {kind === 'mintDiscoverSurface' && (
          <MintDiscoverSurfaceControls
            style={style}
            onUpdateStyle={onUpdateStyle}
            onResetStyle={onResetStyle}
          />
        )}
        {kind === 'fill' && (
          <FillColorControls
            style={style}
            onUpdateStyle={onUpdateStyle}
            onResetStyle={onResetStyle}
            label={
              selectedKey === 'contentSurface'
                ? 'Nền cột nội dung'
                : selectedKey === 'dot'
                  ? 'Màu chấm'
                  : /^steps\[\d+\]\.card$/.test(selectedKey)
                    ? 'Nền thẻ'
                    : 'Màu đường'
            }
            fallback={
              selectedKey === 'contentSurface'
                ? '#ffffff'
                : selectedKey === 'dot'
                  ? '#c79119'
                  : /^steps\[\d+\]\.card$/.test(selectedKey)
                    ? 'transparent'
                    : 'rgba(199, 145, 25, 0.6)'
            }
          />
        )}
        {kind === 'pnjFrames' && (
          <PnjFramesJsonControls
            content={content as PnjHeroContent}
            onContentChange={onContentChange}
          />
        )}
        {kind === 'delvauxFrames' && (
          <DelvauxFramesControls
            content={content as DelvauxHeroContent}
            onContentChange={onContentChange}
          />
        )}
        {kind === 'delvauxHotspots' && (
          <DelvauxHotspotsControls
            content={content as DelvauxProductContent}
            onContentChange={onContentChange}
          />
        )}
        {kind === 'westlyResidenceHotspots' && (
          <WestlyResidenceHotspotsControls
            content={content as WestlyResidencesContent}
            selectedKey={selectedKey}
            onContentChange={onContentChange}
          />
        )}
        {kind === 'delvauxVariants' && (
          <DelvauxVariantsControls
            content={content as DelvauxVariantContent}
            onContentChange={onContentChange}
          />
        )}
        {kind === 'delvauxFaqs' && (
          <DelvauxFaqsControls
            content={content as DelvauxVariantContent}
            onContentChange={onContentChange}
          />
        )}
        {kind === 'gambitDetailsGallery' && (
          <GambitDetailsGalleryControls
            content={content as GambitProductDetailsContent}
            onContentChange={onContentChange}
          />
        )}
        {kind === 'gambitDetailsColors' && (
          <GambitDetailsColorsControls
            content={content as GambitProductDetailsContent}
            onContentChange={onContentChange}
          />
        )}
        {kind === 'gambitDetailsSizes' && (
          <GambitDetailsSizesControls
            content={content as GambitProductDetailsContent}
            onContentChange={onContentChange}
          />
        )}
        {kind === 'gambitDetailsAccordions' && (
          <GambitDetailsAccordionsControls
            content={content as GambitProductDetailsContent}
            onContentChange={onContentChange}
          />
        )}
        {kind === 'gambitDetailsActions' && (
          <GambitDetailsActionsControls
            content={content as GambitProductDetailsContent}
            onContentChange={onContentChange}
          />
        )}
        {kind === 'gambitOverviewPanels' && (
          <GambitOverviewPanelsControls
            content={content as GambitProductOverviewContent}
            onContentChange={onContentChange}
          />
        )}
        {kind === 'gambitRelatedProducts' && (
          <GambitRelatedProductsControls
            content={content as GambitRelatedProductsContent}
            onContentChange={onContentChange}
          />
        )}
        {kind === 'citeFlowFaqs' && (
          <CiteFlowFaqsControls
            content={content as CiteFlowFaqContent}
            onContentChange={onContentChange}
          />
        )}
        {kind === 'citeFlowAmenityList' && (
          <CiteFlowAmenityListControls
            content={content as CiteFlowAmenityContent}
            onContentChange={onContentChange}
          />
        )}
        {kind === 'citeFlowHeaderSocialLinks' && (
          <CiteFlowHeaderSocialLinksControls
            content={content as CiteFlowHeaderContent}
            onContentChange={onContentChange}
          />
        )}
        {kind === 'delvauxSubnavLinks' && (
          <DelvauxSubnavLinksControls
            content={content as DelvauxSubnavContent}
            onContentChange={onContentChange}
          />
        )}
        {kind === 'aesthaNavLinks' && (
          <AesthaNavLinksControls
            content={content as AesthaNavContent}
            onContentChange={onContentChange}
          />
        )}
        {kind === 'aesthaExploreProjects' && (
          <AesthaExploreProjectsControls
            content={content as AesthaExploreContent}
            onContentChange={onContentChange}
          />
        )}
        {kind === 'aesthaExploreProjectImages' && (
          <AesthaExploreProjectImagesControls
            content={content as AesthaExploreContent}
            onContentChange={onContentChange}
            projectIndex={Number(
              selectedKey?.match(/^projects\[(\d+)\]\.detail\.images$/)?.[1] ??
                -1
            )}
          />
        )}
        {kind === 'aesthaStudioTeam' && (
          <AesthaStudioTeamControls
            content={content as AesthaStudioContent}
            onContentChange={onContentChange}
          />
        )}
        {kind === 'aesthaContactSocials' && (
          <AesthaContactSocialsControls
            content={content as AesthaContactContent}
            onContentChange={onContentChange}
          />
        )}
        {kind === 'pnjScrim' && (
          <PnjScrimControls
            content={content as PnjHeroContent}
            onContentChange={onContentChange}
          />
        )}
        {kind === 'pnjParagraphs' && (
          <PnjParagraphsControls
            content={content as PnjDetailsContent}
            onContentChange={onContentChange}
          />
        )}
        {kind === 'pnjTitleLines' && (
          <PnjTitleLinesControls
            content={content as PnjHeroContent}
            onContentChange={onContentChange}
          />
        )}
        {kind === 'pnjVariants' && (
          <PnjVariantsControls
            content={content as PnjVariantContent}
            onContentChange={onContentChange}
          />
        )}
        {kind === 'pnjVariantHighlights' && (
          <PnjVariantHighlightsControls
            variantIndex={Number(
              selectedKey.match(PNJ_VARIANT_HIGHLIGHTS_KEY_RE)?.[1] ?? 0
            )}
            content={content as PnjVariantContent}
            onContentChange={onContentChange}
          />
        )}
        {kind === 'pnjStickyMenuItems' && (
          <PnjStickyMenuItemsControls
            content={content as PnjStickyMenuContent}
            onContentChange={onContentChange}
          />
        )}
        {kind === 'mintV2ServicesItems' && (
          <MintV2ServicesItemsControls
            content={content as MintV2ServicesContent}
            onContentChange={onContentChange}
          />
        )}
        {kind === 'coolHunterGalleryItems' && (
          <CoolHunterGalleryItemsControls
            content={content as CoolHunterGalleryContent}
            onContentChange={onContentChange}
          />
        )}
        {kind === 'framerBungeeHeroV2CardImages' && (
          <FramerBungeeHeroV2CardImagesControls
            content={content as FramerBungeeHeroV2Content}
            onContentChange={onContentChange}
          />
        )}
        {kind === 'coolHunterSectionProgressItems' && (
          <CoolHunterSectionProgressItemsControls
            content={content as CoolHunterSectionProgressContent}
            onContentChange={onContentChange}
          />
        )}
        {kind === 'belgoSpecItems' && (
          <BelgoSpecItemsControls
            content={content as BelgoAboutProductContent}
            onContentChange={onContentChange}
          />
        )}
        {kind === 'belgoFooterLocations' && (
          <BelgoFooterLocationsControls
            content={content as BelgoFooterContent}
            onContentChange={onContentChange}
          />
        )}
        {kind === 'belgoFooterHeadlineWords' && (
          <BelgoFooterHeadlineWordsControls
            content={content as BelgoFooterContent}
            onContentChange={onContentChange}
          />
        )}
        {kind === 'belgoFooterSocials' && (
          <BelgoFooterSocialsControls
            content={content as BelgoFooterContent}
            onContentChange={onContentChange}
          />
        )}
        {kind === 'belgoMoreFlavorsItems' && (
          <BelgoFlavorItemsControls
            content={content as BelgoMoreFlavorsContent}
            onContentChange={onContentChange}
          />
        )}
        {kind === 'scrollImgScaleItems' && (
          <ScrollImgScaleItemsControls
            content={content as ScrollImgScaleContent}
            onContentChange={onContentChange}
          />
        )}
        {kind === 'letterSliderSlides' && (
          <LetterSliderSlidesControls
            content={content as LetterSliderContent}
            onContentChange={onContentChange}
          />
        )}
        {kind === 'cgModularSliderSlides' && (
          <CgModularSliderSlidesControls
            content={content as CgModularSliderContent}
            onContentChange={onContentChange}
          />
        )}
        {kind === 'cgResponsiveTeamMembers' && (
          <CgResponsiveTeamMembersControls
            content={content as CgResponsiveTeamContent}
            onContentChange={onContentChange}
          />
        )}
        {kind === 'cg3dSliderSlides' && (
          <Cg3dSliderSlidesControls
            content={content as Cg3dSliderContent}
            onContentChange={onContentChange}
          />
        )}
        {kind === 'cgRadgaHorizontalSlides' && (
          <CgRadgaHorizontalSlidesControls
            content={content as CgRadgaHorizontalContent}
            onContentChange={onContentChange}
          />
        )}
        {kind === 'cgPageTransitionsPages' && (
          <CgPageTransitionsPagesControls
            content={content as CgPageTransitionsContent}
            onContentChange={onContentChange}
          />
        )}
        {kind === 'framerIgnitexStepCards' && (
          <FramerIgnitexStepCardsControls
            content={content as FramerIgnitexStepContent}
            onContentChange={onContentChange}
          />
        )}
        {kind === 'framerClarityServicesItems' && (
          <FramerClarityServicesItemsControls
            content={content as FramerClarityServicesContent}
            onContentChange={onContentChange}
          />
        )}
        {kind === 'housentOurExcellenceItems' && (
          <HousentOurExcellenceItemsControls
            content={content as HousentOurExcellenceContent}
            onContentChange={onContentChange}
          />
        )}
        {kind === 'sustainitOurExpertiseItems' && (
          <SustainitOurExpertiseItemsControls
            content={content as SustainitOurExpertiseContent}
            onContentChange={onContentChange}
          />
        )}
        {kind === 'alturaOlympusFeatures' && (
          <AlturaOlympusFeaturesControls
            content={content as AlturaOlympusContent}
            onContentChange={onContentChange}
          />
        )}
        {kind === 'alturaOlympusImages' && (
          <AlturaOlympusImagesControls
            content={content as AlturaOlympusContent}
            onContentChange={onContentChange}
          />
        )}
        {kind === 'theGrandServiceItems' && (
          <TheGrandServiceItemsControls
            content={content as TheGrandServiceContent}
            onContentChange={onContentChange}
          />
        )}
        {kind === 'theGrandDiscoverItems' && (
          <TheGrandDiscoverItemsControls
            content={content as TheGrandDiscoverContent}
            onContentChange={onContentChange}
          />
        )}
        {kind === 'theGrandAboutPartners' && (
          <TheGrandAboutPartnersControls
            content={content as TheGrandAboutContent}
            onContentChange={onContentChange}
          />
        )}
        {kind === 'theGrandFooterPolicies' && (
          <TheGrandFooterPoliciesControls
            content={content as TheGrandFooterContent}
            onContentChange={onContentChange}
          />
        )}
        {kind === 'theGrandFooterSocials' && (
          <TheGrandFooterSocialsControls
            content={content as TheGrandFooterContent}
            onContentChange={onContentChange}
          />
        )}
        {kind === 'mintV2ProcessSteps' && (
          <MintV2ProcessStepsControls
            content={content as MintV2ProcessContent}
            onContentChange={onContentChange}
          />
        )}
        {kind === 'framerDarlingTimelineItems' && (
          <FramerDarlingTimelineItemsControls
            content={content as FramerDarlingTimelineContent}
            onContentChange={onContentChange}
          />
        )}
        {kind === 'framerPerformTestimonials' && (
          <FramerPerformTestimonialsControls
            content={content as FramerPerformAboutContent}
            onContentChange={onContentChange}
          />
        )}
        {kind === 'ignitexProjectsItems' && (
          <IgnitexProjectsItemsControls
            content={content as IgnitexProjectsContent}
            onContentChange={onContentChange}
          />
        )}
        {kind === 'framerFlatWhiteProcessSteps' && (
          <FramerFlatWhiteProcessStepsControls
            content={content as FramerFlatWhiteProcessContent}
            onContentChange={onContentChange}
          />
        )}
        {kind === 'framerNftpullTimelineItems' && (
          <FramerNftpullTimelineItemsControls
            content={content as FramerNftpullTimelineContent}
            onContentChange={onContentChange}
          />
        )}
        {kind === 'framerPerformPricingTiers' && (
          <FramerPerformPricingTiersControls
            content={content as FramerPerformPricingContent}
            onContentChange={onContentChange}
          />
        )}
        {kind === 'mintVaultCraftItems' && (
          <MintVaultCraftItemsControls
            content={content as MintVaultCraftContent}
            onContentChange={onContentChange}
          />
        )}
        {kind === 'mintVaultCoins' && (
          <MintVaultCoinsControls
            content={content as MintVaultCollectionContent}
            onContentChange={onContentChange}
          />
        )}
        {kind === 'mintVaultImages' && (
          <MintVaultImagesControls
            label={label}
            content={content as { images?: string[] }}
            onContentChange={onContentChange}
          />
        )}
        {kind === 'framerPurevisualsPanelImages' &&
          isFramerPurevisualsPanelKey(selectedKey) && (
            <FramerPurevisualsPanelImagesControls
              panel={selectedKey}
              content={content as FramerPurevisualsHeroContent}
              onContentChange={onContentChange}
            />
          )}
        {kind === 'realEstateOverviewStats' && (
          <RealEstateOverviewStatsControls
            content={content as RealEstateOverviewContent}
            onContentChange={onContentChange}
          />
        )}
        {kind === 'lineaPortfolioItems' && (
          <LineaPortfolioItemsControls
            content={content as LineaPortfolioContent}
            onContentChange={onContentChange}
          />
        )}
        {kind === 'background' && (
          <BackgroundControls
            background={readVariant(block.background, device)}
            onUpdate={onUpdateBackground}
          />
        )}
      </div>

      {/* Actions */}
      <div className='flex shrink-0 items-center gap-0.5 border-l border-neutral-200/80 pl-2'>
        <AiButton onAi={handleAi} blockType={block.blockType} />
        <button
          type='button'
          onClick={handleDelete}
          aria-label='Xoá nội dung'
          title='Xoá nội dung'
          className='flex size-7 cursor-pointer items-center justify-center rounded-md text-neutral-400 transition-colors hover:bg-rose-50 hover:text-rose-600'
        >
          <Trash2 className='size-3.5' />
        </button>
        <button
          type='button'
          onClick={onClose}
          aria-label='Bỏ chọn'
          title='Bỏ chọn'
          className='flex size-7 cursor-pointer items-center justify-center rounded-md text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-800'
        >
          <X className='size-3.5' />
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────── TEXT CONTROLS

function TextControls({
  fieldKey,
  blockType,
  multiline,
  content,
  style,
  onContentChange,
  onUpdateStyle,
  onResetStyle,
}: {
  fieldKey: string;
  blockType?: Block['blockType'];
  /** Registry-driven: true = textarea, false = 1 dòng. undefined = đoán theo key. */
  multiline?: boolean;
  content: BlockContent;
  style?: ElementStyle;
  onContentChange: (
    next: BlockContent | ((prev: BlockContent) => BlockContent)
  ) => void;
  onUpdateStyle: (patch: ElementStyle) => void;
  onResetStyle: () => void;
}) {
  const c = content as Record<string, unknown>;
  const paraMatch = fieldKey.match(PNJ_PARAGRAPH_KEY_RE);
  const paraIndex = paraMatch ? Number(paraMatch[1]) : -1;
  const titleLineMatch = fieldKey.match(PNJ_HERO_TITLE_LINE_KEY_RE);
  const titleLineIndex = titleLineMatch ? Number(titleLineMatch[1]) : -1;
  const highlightItemMatch = fieldKey.match(PNJ_VARIANT_HIGHLIGHT_ITEM_KEY_RE);
  const alturaIconMatch =
    blockType === 'altura_olympus'
      ? fieldKey.match(/^features\[(\d+)\]\.icon$/)
      : null;
  const sustainitBulletsMatch =
    blockType === 'sustainit_our_expertise'
      ? fieldKey.match(/^items\[(\d+)\]\.bullets$/)
      : null;
  const rawAt = getContentAt(c, fieldKey);
  const value = paraMatch
    ? (resolvePnjParagraphs(
        content as PnjDetailsContent & {
          paragraph1?: string;
          paragraph2?: string;
        }
      )[paraIndex] ?? '')
    : titleLineMatch
      ? (resolvePnjHeroTitleLines(content as PnjHeroContent)[titleLineIndex] ??
        '')
      : highlightItemMatch
        ? (resolvePnjVariants(content as PnjVariantContent)[
            Number(highlightItemMatch[1])
          ]?.highlights[Number(highlightItemMatch[2])] ?? '')
        : sustainitBulletsMatch
          ? (
              resolveSustainitOurExpertiseItems(
                content as SustainitOurExpertiseContent
              )[Number(sustainitBulletsMatch[1])]?.bullets ?? []
            ).join('\n')
          : typeof rawAt === 'string'
            ? rawAt
            : '';
  const isLong =
    multiline ??
    (fieldKey === 'description' ||
      fieldKey === 'subtitle' ||
      fieldKey === 'noteText');
  const fontSize = style?.fontSize ?? '';

  const setField = (next: string) => {
    // paragraphs[i]: không dùng setContentAt — sẽ tạo mảng 1 phần tử và mất đoạn khác
    // khi content.paragraphs chưa phải array (legacy paragraph1/2).
    if (paraMatch) {
      onContentChange(
        prev =>
          setPnjParagraphAt(
            prev as PnjDetailsContent & {
              paragraph1?: string;
              paragraph2?: string;
            },
            paraIndex,
            next
          ) as BlockContent
      );
      return;
    }
    if (titleLineMatch) {
      onContentChange(
        prev =>
          setPnjHeroTitleLineAt(
            prev as PnjHeroContent,
            titleLineIndex,
            next
          ) as BlockContent
      );
      return;
    }
    if (highlightItemMatch) {
      onContentChange(
        prev =>
          setPnjVariantHighlightItemAt(
            prev as PnjVariantContent,
            Number(highlightItemMatch[1]),
            Number(highlightItemMatch[2]),
            next
          ) as BlockContent
      );
      return;
    }
    if (sustainitBulletsMatch) {
      const idx = Number(sustainitBulletsMatch[1]);
      onContentChange(prev => {
        const cur = prev as SustainitOurExpertiseContent;
        const items = resolveSustainitOurExpertiseItems(cur);
        const nextItems = items.map((item, i) =>
          i === idx
            ? {
                ...item,
                bullets: next
                  .split('\n')
                  .map(line => line.trim())
                  .filter(Boolean),
              }
            : item
        );
        return { ...cur, items: nextItems } as BlockContent;
      });
      return;
    }
    const writeValue: unknown = next;
    onContentChange(
      prev =>
        setContentAt(
          prev as Record<string, unknown>,
          fieldKey,
          writeValue
        ) as BlockContent
    );
  };

  // Lucide icon picker for Altura Olympus feature icons.
  if (alturaIconMatch) {
    const iconValue = ALTURA_OLYMPUS_ICON_OPTIONS.includes(
      value as (typeof ALTURA_OLYMPUS_ICON_OPTIONS)[number]
    )
      ? value
      : value || 'Crosshair';
    return (
      <select
        value={iconValue}
        onChange={e => setField(e.target.value)}
        aria-label='Icon Lucide'
        className='h-7 min-w-[10rem] rounded-md border border-neutral-200 bg-white px-2 text-xs text-neutral-700'
      >
        {!ALTURA_OLYMPUS_ICON_OPTIONS.includes(
          iconValue as (typeof ALTURA_OLYMPUS_ICON_OPTIONS)[number]
        ) &&
          iconValue && <option value={iconValue}>{iconValue}</option>}
        {ALTURA_OLYMPUS_ICON_OPTIONS.map(opt => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    );
  }

  return (
    <>
      {/* Inline text input — takes remaining space; long text uses popover */}
      {isLong ? (
        <PopoverTrigger
          label='Nội dung'
          preview={value || '(trống)'}
          width={420}
        >
          <Textarea
            autoFocus
            value={value}
            onChange={e => setField(e.target.value)}
            placeholder='Nội dung…'
            className='min-h-32 resize-none border-neutral-200 bg-white text-sm leading-6'
          />
        </PopoverTrigger>
      ) : (
        <input
          value={value}
          onChange={e => setField(e.target.value)}
          placeholder='Nội dung…'
          className='h-7 min-w-[16rem] flex-1 rounded-md bg-neutral-50 px-2.5 text-[12px] text-neutral-900 ring-1 ring-neutral-200/70 transition-shadow placeholder:text-neutral-400 hover:ring-neutral-300 focus:bg-white focus:ring-2 focus:ring-neutral-900/10 focus:outline-none'
        />
      )}

      <Sep />

      <InlineLabel label='Cỡ'>
        <input
          type='number'
          min={10}
          max={120}
          value={fontSize === '' ? '' : fontSize}
          onChange={e => {
            const n = Number(e.target.value);
            if (Number.isNaN(n)) return;
            onUpdateStyle({ fontSize: n });
          }}
          placeholder='—'
          className='h-7 w-11 rounded-md bg-neutral-50 px-1.5 font-mono text-[11px] text-neutral-900 tabular-nums ring-1 ring-neutral-200/70 transition-shadow placeholder:text-neutral-400 hover:ring-neutral-300 focus:bg-white focus:ring-2 focus:ring-neutral-900/10 focus:outline-none'
        />
      </InlineLabel>

      <Sep />

      <div className='flex items-center gap-px rounded-md bg-neutral-50/80 p-px ring-1 ring-neutral-200/60'>
        <ToolbarBtn
          active={style?.fontWeight === 700}
          onClick={() =>
            onUpdateStyle({
              fontWeight: style?.fontWeight === 700 ? 400 : 700,
            })
          }
          label='In đậm'
        >
          <Bold className='size-3.5' />
        </ToolbarBtn>
        <ToolbarBtn
          active={style?.fontStyle === 'italic'}
          onClick={() =>
            onUpdateStyle({
              fontStyle: style?.fontStyle === 'italic' ? 'normal' : 'italic',
            })
          }
          label='In nghiêng'
        >
          <Italic className='size-3.5' />
        </ToolbarBtn>
        <ToolbarBtn
          active={style?.textDecoration === 'underline'}
          onClick={() =>
            onUpdateStyle({
              textDecoration:
                style?.textDecoration === 'underline' ? 'none' : 'underline',
            })
          }
          label='Gạch chân'
        >
          <Underline className='size-3.5' />
        </ToolbarBtn>
        <ToolbarBtn
          active={style?.textDecoration === 'line-through'}
          onClick={() =>
            onUpdateStyle({
              textDecoration:
                style?.textDecoration === 'line-through'
                  ? 'none'
                  : 'line-through',
            })
          }
          label='Gạch ngang'
        >
          <Strikethrough className='size-3.5' />
        </ToolbarBtn>
      </div>

      <Sep />

      <div className='flex items-center gap-px rounded-md bg-neutral-50/80 p-px ring-1 ring-neutral-200/60'>
        <ToolbarBtn
          active={style?.textAlign === 'left'}
          onClick={() => onUpdateStyle({ textAlign: 'left' })}
          label='Trái'
        >
          <AlignLeft className='size-3.5' />
        </ToolbarBtn>
        <ToolbarBtn
          active={style?.textAlign === 'center'}
          onClick={() => onUpdateStyle({ textAlign: 'center' })}
          label='Giữa'
        >
          <AlignCenter className='size-3.5' />
        </ToolbarBtn>
        <ToolbarBtn
          active={style?.textAlign === 'right'}
          onClick={() => onUpdateStyle({ textAlign: 'right' })}
          label='Phải'
        >
          <AlignRight className='size-3.5' />
        </ToolbarBtn>
        <ToolbarBtn
          active={style?.textAlign === 'justify'}
          onClick={() => onUpdateStyle({ textAlign: 'justify' })}
          label='Đều'
        >
          <AlignJustify className='size-3.5' />
        </ToolbarBtn>
      </div>

      <Sep />

      <ColorSwatch
        label='Màu'
        value={style?.color ?? '#111111'}
        onChange={c => onUpdateStyle({ color: c })}
      />

      <button
        type='button'
        onClick={onResetStyle}
        title='Khôi phục style mặc định'
        aria-label='Khôi phục style mặc định'
        className='flex size-7 cursor-pointer items-center justify-center rounded-md text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-800'
      >
        <RotateCcw className='size-3.5' />
      </button>
    </>
  );
}

// ─────────────────────────────────────────────────────────── IMAGE CONTROLS

function ImageControls({
  fieldKey,
  blockType,
  content,
  onContentChange,
}: {
  fieldKey: string;
  blockType?: Block['blockType'];
  content: BlockContent;
  onContentChange: (
    next: BlockContent | ((prev: BlockContent) => BlockContent)
  ) => void;
}) {
  const transformKey =
    fieldKey === 'imageUrl'
      ? 'imageTransform'
      : fieldKey === 'backgroundUrl'
        ? 'backgroundTransform'
        : null;

  const c = content as Record<string, unknown>;
  const alturaImgMatch =
    blockType === 'altura_olympus' ? fieldKey.match(/^images\[(\d+)\]$/) : null;
  const alturaImgIndex = alturaImgMatch ? Number(alturaImgMatch[1]) : -1;
  const alturaImages =
    alturaImgIndex >= 0
      ? resolveAlturaOlympusImages(content as AlturaOlympusContent)
      : null;

  const url =
    alturaImages && alturaImgIndex >= 0
      ? (alturaImages[alturaImgIndex] ?? '')
      : ((getContentAt(c, fieldKey) as string) ?? '');
  const transform = transformKey
    ? (c[transformKey] as ImageTransform | undefined)
    : undefined;

  const setUrl = (next: string) => {
    if (alturaImages && alturaImgIndex >= 0) {
      const list = [...alturaImages];
      while (list.length <= alturaImgIndex) list.push('');
      list[alturaImgIndex] = next;
      onContentChange(prev => {
        const cur = prev as AlturaOlympusContent;
        return { ...cur, images: list } as BlockContent;
      });
      return;
    }
    onContentChange(setContentAt(c, fieldKey, next) as BlockContent);
  };
  const setTransform = (next: ImageTransform) => {
    if (!transformKey) return;
    onContentChange({ ...c, [transformKey]: next } as BlockContent);
  };

  return (
    <>
      <PopoverTrigger
        label='Ảnh'
        preview={url ? 'Đã chọn' : 'Chưa chọn'}
        icon={<ImageIcon className='size-3.5' />}
        width={420}
        primary
      >
        <ImagePicker
          value={url}
          onChange={setUrl}
          transform={transform}
          onTransformChange={transformKey ? setTransform : undefined}
        />
      </PopoverTrigger>
    </>
  );
}

// ─────────────────────────────────────────────────────────── BACKGROUND

function BackgroundControls({
  background,
  onUpdate,
}: {
  background: BlockBackground | undefined;
  onUpdate: (next: BlockBackground | undefined) => void;
}) {
  const color = background?.color ?? '';
  const imageUrl = background?.imageUrl ?? '';

  const setColor = (next: string) => {
    onUpdate({ ...background, color: next || undefined });
  };
  const setImage = (next: string) => {
    onUpdate({ ...background, imageUrl: next || undefined });
  };
  const reset = () => onUpdate(undefined);

  const PRESETS = [
    '#ffffff',
    '#f5f5f4',
    '#0a0a0a',
    '#1f2937',
    '#0f766e',
    '#7c3aed',
    '#be123c',
    '#0ea5e9',
  ];

  return (
    <>
      <ColorSwatch label='Màu' value={color || '#ffffff'} onChange={setColor} />

      <div className='flex items-center gap-1'>
        {PRESETS.map(c => (
          <button
            key={c}
            type='button'
            onClick={() => setColor(c)}
            aria-label={`Đặt màu ${c}`}
            title={c}
            className='size-4 cursor-pointer rounded-sm ring-1 ring-black/[0.06] transition-transform hover:scale-110'
            style={{ backgroundColor: c }}
          />
        ))}
      </div>

      <Sep />

      <PopoverTrigger
        label='Ảnh nền'
        preview={imageUrl ? '✓ Đã chọn' : 'Không'}
        icon={<ImageIcon className='size-3.5' />}
        width={360}
      >
        <ImagePicker value={imageUrl} onChange={setImage} />
        <p className='text-3xs mt-2 text-neutral-400'>
          Ảnh nền sẽ phủ lên màu nền (cover, canh giữa).
        </p>
      </PopoverTrigger>

      <button
        type='button'
        onClick={reset}
        disabled={!background}
        title='Khôi phục nền mặc định'
        aria-label='Khôi phục nền mặc định'
        className='flex size-7 cursor-pointer items-center justify-center rounded-md text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent'
      >
        <RotateCcw className='size-3.5' />
      </button>
    </>
  );
}

// ─────────────────────────────────────────────────────────── STATS CONTROLS

function StatsControls({
  content,
  onContentChange,
}: {
  content: HeroSplitContent;
  onContentChange: (next: BlockContent) => void;
}) {
  const update = (
    i: number,
    patch: Partial<HeroSplitContent['stats'][number]>
  ) => {
    onContentChange({
      ...content,
      stats: content.stats.map((s, idx) =>
        idx === i ? { ...s, ...patch } : s
      ),
    });
  };
  const remove = (i: number) =>
    onContentChange({
      ...content,
      stats: content.stats.filter((_, idx) => idx !== i),
    });
  const add = () =>
    onContentChange({
      ...content,
      stats: [...content.stats, { value: 'Mới', label: 'thông số' }],
    });

  return (
    <PopoverTrigger
      label='Danh sách thông số'
      preview={`${content.stats.length} mục`}
      width={420}
    >
      <div className='flex max-h-72 flex-col gap-2 overflow-y-auto pr-1'>
        {content.stats.map((s, i) => (
          <div
            key={i}
            className='flex items-center gap-2 rounded-md border border-neutral-200 bg-white p-2'
          >
            <Input
              value={s.value}
              onChange={e => update(i, { value: e.target.value })}
              placeholder='Giá trị'
              className='h-8 border-neutral-200 bg-white text-xs font-semibold'
            />
            <Input
              value={s.label}
              onChange={e => update(i, { label: e.target.value })}
              placeholder='Nhãn'
              className='h-8 border-neutral-200 bg-white text-xs'
            />
            <button
              type='button'
              onClick={() => remove(i)}
              aria-label='Xoá'
              className='flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-md text-rose-500 hover:bg-rose-50'
            >
              <Trash2 className='size-3.5' />
            </button>
          </div>
        ))}
      </div>
      <AddRow onAdd={add} label='Thêm thông số' />
    </PopoverTrigger>
  );
}

// ─────────────────────────────────────────────────────────── FEATURES

function FeaturesControls({
  content,
  onContentChange,
}: {
  content: FeatureSectionContent;
  onContentChange: (next: BlockContent) => void;
}) {
  const update = (
    i: number,
    patch: Partial<FeatureSectionContent['features'][number]>
  ) => {
    onContentChange({
      ...content,
      features: content.features.map((f, idx) =>
        idx === i ? { ...f, ...patch } : f
      ),
    });
  };
  const remove = (i: number) =>
    onContentChange({
      ...content,
      features: content.features.filter((_, idx) => idx !== i),
    });
  const add = () =>
    onContentChange({
      ...content,
      features: [
        ...content.features,
        { icon: 'Sparkles', label: 'Tiện ích mới', body: 'Mô tả tiện ích.' },
      ],
    });

  return (
    <PopoverTrigger
      label='Danh sách tiện ích'
      preview={`${content.features.length} mục`}
      width={420}
    >
      <div className='flex max-h-80 flex-col gap-2 overflow-y-auto pr-1'>
        {content.features.map((f, i) => (
          <div
            key={i}
            className='flex flex-col gap-1.5 rounded-md border border-neutral-200 bg-white p-2'
          >
            <div className='flex items-center gap-2'>
              <select
                value={f.icon}
                onChange={e => update(i, { icon: e.target.value })}
                className='h-7 flex-1 rounded border border-neutral-200 bg-white px-2 text-xs text-neutral-700'
              >
                {FEATURE_ICON_OPTIONS.map(opt => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
              <button
                type='button'
                onClick={() => remove(i)}
                aria-label='Xoá'
                className='flex size-7 cursor-pointer items-center justify-center rounded-md text-rose-500 hover:bg-rose-50'
              >
                <Trash2 className='size-3.5' />
              </button>
            </div>
            <Input
              value={f.label}
              onChange={e => update(i, { label: e.target.value })}
              placeholder='Tên tiện ích'
              className='h-8 border-neutral-200 bg-white text-xs font-semibold'
            />
            <Textarea
              value={f.body}
              onChange={e => update(i, { body: e.target.value })}
              placeholder='Mô tả tiện ích'
              className='min-h-12 resize-none border-neutral-200 bg-white text-xs leading-5'
            />
          </div>
        ))}
      </div>
      <AddRow onAdd={add} label='Thêm tiện ích' />
    </PopoverTrigger>
  );
}

// ─────────────────────────────────────────────────────────── SLIDES

function SlidesControls({
  content,
  onContentChange,
}: {
  content: ImageCarouselContent;
  onContentChange: (next: BlockContent) => void;
}) {
  const slides = content.slides ?? [];

  const update = (
    i: number,
    patch: Partial<ImageCarouselContent['slides'][number]>
  ) => {
    onContentChange({
      ...content,
      slides: slides.map((s, idx) => (idx === i ? { ...s, ...patch } : s)),
    });
  };
  const remove = (i: number) =>
    onContentChange({
      ...content,
      slides: slides.filter((_, idx) => idx !== i),
    });
  const move = (i: number, dir: -1 | 1) => {
    const next = slides.slice();
    const j = i + dir;
    if (j < 0 || j >= next.length) return;
    [next[i], next[j]] = [next[j], next[i]];
    onContentChange({ ...content, slides: next });
  };
  const add = () =>
    onContentChange({
      ...content,
      slides: [
        ...slides,
        {
          id: `s_${Math.random().toString(36).slice(2, 8)}`,
          imageUrl:
            'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1600&q=80',
          caption: '',
        },
      ],
    });

  return (
    <PopoverTrigger
      label='Slides'
      preview={`${slides.length} slide`}
      width={480}
    >
      {/* Carousel-level controls — apply to the whole block, not per slide. */}
      <div className='mb-2 flex flex-col gap-2 rounded-md border border-neutral-200 bg-neutral-50/60 p-2'>
        <p className='text-3xs font-semibold tracking-widest text-neutral-500 uppercase'>
          Cấu hình carousel
        </p>
        <div className='flex items-center gap-2'>
          <label className='text-2xs inline-flex shrink-0 items-center gap-1 text-neutral-600'>
            <input
              type='checkbox'
              checked={(content.autoplayMs ?? 0) > 0}
              onChange={e =>
                onContentChange({
                  ...content,
                  autoplayMs: e.target.checked ? 4500 : 0,
                })
              }
            />
            Autoplay
          </label>
          <input
            type='number'
            min={1000}
            max={20000}
            step={500}
            value={content.autoplayMs ?? 0}
            onChange={e =>
              onContentChange({
                ...content,
                autoplayMs: Math.max(0, Number(e.target.value) || 0),
              })
            }
            disabled={!content.autoplayMs}
            className='text-2xs h-7 w-20 rounded-md bg-white px-1.5 text-center font-mono ring-1 ring-neutral-200 focus:outline-none disabled:opacity-50'
            placeholder='ms'
          />
          <span className='text-3xs text-neutral-400'>ms</span>
        </div>
        <div className='flex items-center gap-3'>
          <label className='text-2xs inline-flex items-center gap-1 text-neutral-600'>
            <input
              type='checkbox'
              checked={content.showPagination ?? true}
              onChange={e =>
                onContentChange({
                  ...content,
                  showPagination: e.target.checked,
                })
              }
            />
            Pagination
          </label>
          <label className='text-2xs inline-flex items-center gap-1 text-neutral-600'>
            <input
              type='checkbox'
              checked={content.showNavArrows ?? true}
              onChange={e =>
                onContentChange({
                  ...content,
                  showNavArrows: e.target.checked,
                })
              }
            />
            Nút mũi tên
          </label>
        </div>
      </div>

      <div className='flex max-h-80 flex-col gap-2 overflow-y-auto pr-1'>
        {slides.map((slide, i) => (
          <div
            key={slide.id}
            className='flex flex-col gap-1.5 rounded-md border border-neutral-200 bg-white p-2'
          >
            <div className='flex items-center justify-between'>
              <span className='text-3xs font-semibold tracking-widest text-neutral-500 uppercase'>
                Slide {i + 1}
              </span>
              <div className='flex items-center gap-1'>
                <button
                  type='button'
                  onClick={() => move(i, -1)}
                  disabled={i === 0}
                  aria-label='Lên trên'
                  className='flex size-6 cursor-pointer items-center justify-center rounded-md text-neutral-500 hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-40'
                >
                  ↑
                </button>
                <button
                  type='button'
                  onClick={() => move(i, 1)}
                  disabled={i === slides.length - 1}
                  aria-label='Xuống dưới'
                  className='flex size-6 cursor-pointer items-center justify-center rounded-md text-neutral-500 hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-40'
                >
                  ↓
                </button>
                <button
                  type='button'
                  onClick={() => remove(i)}
                  aria-label='Xoá'
                  className='flex size-7 cursor-pointer items-center justify-center rounded-md text-rose-500 hover:bg-rose-50'
                >
                  <Trash2 className='size-3.5' />
                </button>
              </div>
            </div>
            <ImagePicker
              value={slide.imageUrl}
              onChange={url => update(i, { imageUrl: url })}
            />
            <Input
              value={slide.caption ?? ''}
              onChange={e => update(i, { caption: e.target.value })}
              placeholder='Caption (hiện overlay đáy slide)'
              className='h-8 border-neutral-200 bg-white text-xs'
            />
            <Input
              value={slide.altText ?? ''}
              onChange={e => update(i, { altText: e.target.value })}
              placeholder='Alt text (SEO / a11y)'
              className='text-2xs h-8 border-neutral-200 bg-white'
            />
            <Input
              value={slide.href ?? ''}
              onChange={e => update(i, { href: e.target.value })}
              placeholder='Link (https://… — bỏ trống nếu không click)'
              className='text-2xs h-8 border-neutral-200 bg-white'
            />
          </div>
        ))}
      </div>
      <AddRow onAdd={add} label='Thêm slide' />
    </PopoverTrigger>
  );
}

// ─────────────────────────────────────────────── INTERACTIVE AD WIDGET

function InteractiveAdControls({
  content,
  onContentChange,
}: {
  content: InteractiveAdWidgetContent;
  onContentChange: (next: BlockContent) => void;
}) {
  const slides = content.slides ?? [];

  const updateSlide = (
    i: number,
    patch: Partial<InteractiveAdWidgetContent['slides'][number]>
  ) =>
    onContentChange({
      ...content,
      slides: slides.map((s, idx) => (idx === i ? { ...s, ...patch } : s)),
    });
  const removeSlide = (i: number) =>
    onContentChange({
      ...content,
      slides: slides.filter((_, idx) => idx !== i),
    });
  const moveSlide = (i: number, dir: -1 | 1) => {
    const next = slides.slice();
    const j = i + dir;
    if (j < 0 || j >= next.length) return;
    [next[i], next[j]] = [next[j], next[i]];
    onContentChange({ ...content, slides: next });
  };
  const addSlide = () =>
    onContentChange({
      ...content,
      slides: [
        ...slides,
        {
          id: `ad_${Math.random().toString(36).slice(2, 8)}`,
          backgroundType: 'image' as const,
          backgroundUrl:
            'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1600&q=80',
          hotspots: [],
          ctas: [],
        },
      ],
    });

  const addHotspot = (i: number) =>
    updateSlide(i, {
      hotspots: [
        ...slides[i].hotspots,
        {
          id: `hs_${Math.random().toString(36).slice(2, 8)}`,
          xPct: 50,
          yPct: 50,
          label: '',
        },
      ],
    });
  const updateHotspot = (
    i: number,
    hIdx: number,
    patch: Partial<
      InteractiveAdWidgetContent['slides'][number]['hotspots'][number]
    >
  ) =>
    updateSlide(i, {
      hotspots: slides[i].hotspots.map((h, idx) =>
        idx === hIdx ? { ...h, ...patch } : h
      ),
    });
  const removeHotspot = (i: number, hIdx: number) =>
    updateSlide(i, {
      hotspots: slides[i].hotspots.filter((_, idx) => idx !== hIdx),
    });

  const addCta = (i: number) =>
    updateSlide(i, {
      ctas: [
        ...slides[i].ctas,
        {
          id: `cta_${Math.random().toString(36).slice(2, 8)}`,
          label: 'Tìm hiểu thêm',
          href: '#',
          style: 'primary' as const,
        },
      ],
    });
  const updateCta = (
    i: number,
    cIdx: number,
    patch: Partial<InteractiveAdWidgetContent['slides'][number]['ctas'][number]>
  ) =>
    updateSlide(i, {
      ctas: slides[i].ctas.map((c, idx) =>
        idx === cIdx ? { ...c, ...patch } : c
      ),
    });
  const removeCta = (i: number, cIdx: number) =>
    updateSlide(i, {
      ctas: slides[i].ctas.filter((_, idx) => idx !== cIdx),
    });

  return (
    <PopoverTrigger
      label='Quảng cáo'
      preview={`${slides.length} slide`}
      width={520}
    >
      <div className='mb-2 flex flex-col gap-2 rounded-md border border-neutral-200 bg-neutral-50/60 p-2'>
        <p className='text-3xs font-semibold tracking-widest text-neutral-500 uppercase'>
          Cấu hình chung
        </p>
        <div className='flex items-center gap-3'>
          <label className='text-2xs inline-flex shrink-0 items-center gap-1 text-neutral-600'>
            <input
              type='checkbox'
              checked={content.closeable ?? true}
              onChange={e =>
                onContentChange({ ...content, closeable: e.target.checked })
              }
            />
            Cho phép đóng
          </label>
          <label className='text-2xs inline-flex shrink-0 items-center gap-1 text-neutral-600'>
            <input
              type='checkbox'
              checked={(content.autoplayMs ?? 0) > 0}
              onChange={e =>
                onContentChange({
                  ...content,
                  autoplayMs: e.target.checked ? 4500 : 0,
                })
              }
            />
            Autoplay
          </label>
          <input
            type='number'
            min={1000}
            max={20000}
            step={500}
            value={content.autoplayMs ?? 0}
            onChange={e =>
              onContentChange({
                ...content,
                autoplayMs: Math.max(0, Number(e.target.value) || 0),
              })
            }
            disabled={!content.autoplayMs}
            className='text-2xs h-7 w-20 rounded-md bg-white px-1.5 text-center font-mono ring-1 ring-neutral-200 focus:outline-none disabled:opacity-50'
            placeholder='ms'
          />
        </div>
      </div>

      <div className='flex max-h-96 flex-col gap-2 overflow-y-auto pr-1'>
        {slides.map((slide, i) => (
          <div
            key={slide.id}
            className='flex flex-col gap-2 rounded-md border border-neutral-200 bg-white p-2'
          >
            <div className='flex items-center justify-between'>
              <span className='text-3xs font-semibold tracking-widest text-neutral-500 uppercase'>
                Slide {i + 1}
              </span>
              <div className='flex items-center gap-1'>
                <button
                  type='button'
                  onClick={() => moveSlide(i, -1)}
                  disabled={i === 0}
                  aria-label='Lên trên'
                  className='flex size-6 cursor-pointer items-center justify-center rounded-md text-neutral-500 hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-40'
                >
                  ↑
                </button>
                <button
                  type='button'
                  onClick={() => moveSlide(i, 1)}
                  disabled={i === slides.length - 1}
                  aria-label='Xuống dưới'
                  className='flex size-6 cursor-pointer items-center justify-center rounded-md text-neutral-500 hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-40'
                >
                  ↓
                </button>
                <button
                  type='button'
                  onClick={() => removeSlide(i)}
                  aria-label='Xoá slide'
                  className='flex size-7 cursor-pointer items-center justify-center rounded-md text-rose-500 hover:bg-rose-50'
                >
                  <Trash2 className='size-3.5' />
                </button>
              </div>
            </div>

            <div className='flex items-center gap-2'>
              <select
                value={slide.backgroundType}
                onChange={e =>
                  updateSlide(i, {
                    backgroundType: e.target.value as 'image' | 'video',
                  })
                }
                className='text-2xs h-8 rounded-md border border-neutral-200 bg-white px-2'
              >
                <option value='image'>Ảnh</option>
                <option value='video'>Video</option>
              </select>
              <Input
                value={slide.backgroundUrl}
                onChange={e =>
                  updateSlide(i, { backgroundUrl: e.target.value })
                }
                placeholder='URL ảnh/video nền'
                className='text-2xs h-8 flex-1 border-neutral-200 bg-white'
              />
            </div>
            {slide.backgroundType === 'image' && (
              <ImagePicker
                value={slide.backgroundUrl}
                onChange={url => updateSlide(i, { backgroundUrl: url })}
              />
            )}

            {/* Hotspots */}
            <div className='flex flex-col gap-1.5 rounded-md bg-neutral-50/60 p-1.5'>
              <p className='text-3xs font-semibold tracking-widest text-neutral-500 uppercase'>
                Hotspot ({slide.hotspots.length})
              </p>
              {slide.hotspots.map((h, hIdx) => (
                <div key={h.id} className='flex items-center gap-1'>
                  <input
                    type='number'
                    min={0}
                    max={100}
                    value={h.xPct}
                    onChange={e =>
                      updateHotspot(i, hIdx, { xPct: Number(e.target.value) })
                    }
                    className='text-2xs h-7 w-12 rounded-md border border-neutral-200 bg-white px-1 text-center font-mono'
                    title='X %'
                  />
                  <input
                    type='number'
                    min={0}
                    max={100}
                    value={h.yPct}
                    onChange={e =>
                      updateHotspot(i, hIdx, { yPct: Number(e.target.value) })
                    }
                    className='text-2xs h-7 w-12 rounded-md border border-neutral-200 bg-white px-1 text-center font-mono'
                    title='Y %'
                  />
                  <Input
                    value={h.label}
                    onChange={e =>
                      updateHotspot(i, hIdx, { label: e.target.value })
                    }
                    placeholder='Nhãn'
                    className='text-2xs h-7 flex-1 border-neutral-200 bg-white'
                  />
                  <select
                    value={h.ctaId ?? ''}
                    onChange={e =>
                      updateHotspot(i, hIdx, {
                        ctaId: e.target.value || undefined,
                      })
                    }
                    className='text-2xs h-7 rounded-md border border-neutral-200 bg-white px-1'
                  >
                    <option value=''>— CTA —</option>
                    {slide.ctas.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.label || c.id}
                      </option>
                    ))}
                  </select>
                  <button
                    type='button'
                    onClick={() => removeHotspot(i, hIdx)}
                    aria-label='Xoá hotspot'
                    className='flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-md text-rose-500 hover:bg-rose-50'
                  >
                    <Trash2 className='size-3' />
                  </button>
                </div>
              ))}
              <AddRow onAdd={() => addHotspot(i)} label='Thêm hotspot' />
            </div>

            {/* CTAs */}
            <div className='flex flex-col gap-1.5 rounded-md bg-neutral-50/60 p-1.5'>
              <p className='text-3xs font-semibold tracking-widest text-neutral-500 uppercase'>
                CTA ({slide.ctas.length})
              </p>
              {slide.ctas.map((c, cIdx) => (
                <div key={c.id} className='flex items-center gap-1'>
                  <Input
                    value={c.label}
                    onChange={e =>
                      updateCta(i, cIdx, { label: e.target.value })
                    }
                    placeholder='Nhãn nút'
                    className='text-2xs h-7 flex-1 border-neutral-200 bg-white'
                  />
                  <Input
                    value={c.href}
                    onChange={e => updateCta(i, cIdx, { href: e.target.value })}
                    placeholder='https://…'
                    className='text-2xs h-7 flex-1 border-neutral-200 bg-white'
                  />
                  <select
                    value={c.style}
                    onChange={e =>
                      updateCta(i, cIdx, {
                        style: e.target.value as 'primary' | 'secondary',
                      })
                    }
                    className='text-2xs h-7 rounded-md border border-neutral-200 bg-white px-1'
                  >
                    <option value='primary'>Chính</option>
                    <option value='secondary'>Phụ</option>
                  </select>
                  <button
                    type='button'
                    onClick={() => removeCta(i, cIdx)}
                    aria-label='Xoá CTA'
                    className='flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-md text-rose-500 hover:bg-rose-50'
                  >
                    <Trash2 className='size-3' />
                  </button>
                </div>
              ))}
              <AddRow onAdd={() => addCta(i)} label='Thêm CTA' />
            </div>
          </div>
        ))}
      </div>
      <AddRow onAdd={addSlide} label='Thêm slide' />
    </PopoverTrigger>
  );
}

// ─────────────────────────────────────────────────────────── REASONS

function ReasonsControls({
  content,
  onContentChange,
}: {
  content: BookingFormContent;
  onContentChange: (next: BlockContent) => void;
}) {
  const update = (
    i: number,
    patch: Partial<BookingFormContent['reasons'][number]>
  ) => {
    onContentChange({
      ...content,
      reasons: content.reasons.map((r, idx) =>
        idx === i ? { ...r, ...patch } : r
      ),
    });
  };
  const remove = (i: number) =>
    onContentChange({
      ...content,
      reasons: content.reasons.filter((_, idx) => idx !== i),
    });
  const add = () =>
    onContentChange({
      ...content,
      reasons: [...content.reasons, { value: 'Mới', label: 'lý do' }],
    });

  return (
    <PopoverTrigger
      label='Danh sách lý do'
      preview={`${content.reasons.length} mục`}
      width={420}
    >
      <div className='flex max-h-72 flex-col gap-2 overflow-y-auto pr-1'>
        {content.reasons.map((r, i) => (
          <div
            key={i}
            className='flex items-center gap-2 rounded-md border border-neutral-200 bg-white p-2'
          >
            <Input
              value={r.value}
              onChange={e => update(i, { value: e.target.value })}
              placeholder='Giá trị'
              className='h-8 border-neutral-200 bg-white text-xs font-semibold'
            />
            <Input
              value={r.label}
              onChange={e => update(i, { label: e.target.value })}
              placeholder='Nhãn'
              className='h-8 border-neutral-200 bg-white text-xs'
            />
            <button
              type='button'
              onClick={() => remove(i)}
              aria-label='Xoá'
              className='flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-md text-rose-500 hover:bg-rose-50'
            >
              <Trash2 className='size-3.5' />
            </button>
          </div>
        ))}
      </div>
      <AddRow onAdd={add} label='Thêm lý do' />
    </PopoverTrigger>
  );
}

// ─────────────────────────────────────────── MINT VARIANTS (swatch picker)

function MintVariantsControls({
  content,
  onContentChange,
}: {
  content: MintVariantsContent;
  onContentChange: (next: BlockContent) => void;
}) {
  const variants = content.variants ?? [];
  const update = (i: number, patch: Partial<(typeof variants)[number]>) =>
    onContentChange({
      ...content,
      variants: variants.map((v, idx) => (idx === i ? { ...v, ...patch } : v)),
    } as BlockContent);
  const remove = (i: number) => {
    if (variants.length <= 1) {
      toast.error('Cần ít nhất 1 biến thể');
      return;
    }
    onContentChange({
      ...content,
      variants: variants.filter((_, idx) => idx !== i),
    } as BlockContent);
  };
  const add = () =>
    onContentChange({
      ...content,
      variants: [
        ...variants,
        {
          key: `v_${Date.now().toString(36)}`,
          label: 'Biến thể mới',
          ref: '',
          swatch: variants[0]?.swatch ?? '',
          image: variants[0]?.image ?? '',
        },
      ],
    } as BlockContent);

  return (
    <PopoverTrigger
      label='Biến thể (swatch)'
      preview={`${variants.length} mục`}
      width={460}
    >
      <div className='flex max-h-80 flex-col gap-2 overflow-y-auto pr-1'>
        {variants.map((v, i) => (
          <div
            key={v.key || i}
            className='flex flex-col gap-1.5 rounded-md border border-neutral-200 bg-white p-2'
          >
            <div className='flex items-center gap-2'>
              <Input
                value={v.label}
                onChange={e => update(i, { label: e.target.value })}
                placeholder='Tên biến thể'
                className='h-8 border-neutral-200 bg-white text-xs font-semibold'
              />
              <button
                type='button'
                onClick={() => remove(i)}
                disabled={variants.length <= 1}
                aria-label='Xoá'
                className='flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-md text-rose-500 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-40'
              >
                <Trash2 className='size-3.5' />
              </button>
            </div>
            <p className='text-3xs font-semibold tracking-widest text-neutral-500 uppercase'>
              Swatch
            </p>
            <ImagePicker
              value={v.swatch ?? ''}
              onChange={url => update(i, { swatch: url })}
            />
            <p className='text-3xs font-semibold tracking-widest text-neutral-500 uppercase'>
              Ảnh chính
            </p>
            <ImagePicker
              value={v.image ?? ''}
              onChange={url => update(i, { image: url })}
            />
          </div>
        ))}
      </div>
      <AddRow onAdd={add} label='Thêm biến thể' />
    </PopoverTrigger>
  );
}

// ─────────────────────────────────────────── MINT DISCOVER (variant / surface)

function MintDiscoverVariantControls({
  content,
  onContentChange,
}: {
  content: MintDiscoverContent;
  onContentChange: (next: BlockContent) => void;
}) {
  const variant = content.variant ?? '1';
  return (
    <div className='flex min-w-0 items-center gap-2'>
      <span className='text-[10px] font-medium tracking-wide text-neutral-500 uppercase'>
        Theme
      </span>
      <select
        value={variant}
        onChange={e =>
          onContentChange({
            ...content,
            variant: e.target.value as '1' | '2',
          } as BlockContent)
        }
        className='h-8 min-w-[14rem] rounded-md border border-neutral-200 bg-white px-2 text-xs text-neutral-900'
        aria-label='Theme variant'
      >
        <option value='1'>Variant 1 — Reverse (nền sáng)</option>
        <option value='2'>Variant 2 — Obverse (nền tối)</option>
      </select>
    </div>
  );
}

function MintDiscoverSurfaceControls({
  style,
  onUpdateStyle,
  onResetStyle,
}: {
  style?: ElementStyle;
  onUpdateStyle: (patch: ElementStyle) => void;
  onResetStyle: () => void;
}) {
  return (
    <>
      <ColorSwatch
        label='Nền thẻ'
        value={style?.backgroundColor ?? 'rgba(255,255,255,0.8)'}
        onChange={c => onUpdateStyle({ backgroundColor: c })}
      />
      <button
        type='button'
        onClick={onResetStyle}
        title='Khôi phục style mặc định'
        aria-label='Khôi phục style mặc định'
        className='flex size-7 cursor-pointer items-center justify-center rounded-md text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-800'
      >
        <RotateCcw className='size-3.5' />
      </button>
    </>
  );
}

/** Style-only fill (timeline line, dots, …) — không có content text. */
function FillColorControls({
  style,
  onUpdateStyle,
  onResetStyle,
  label,
  fallback,
}: {
  style?: ElementStyle;
  onUpdateStyle: (patch: ElementStyle) => void;
  onResetStyle: () => void;
  label: string;
  fallback: string;
}) {
  return (
    <>
      <ColorSwatch
        label={label}
        value={style?.backgroundColor ?? style?.color ?? fallback}
        onChange={c => onUpdateStyle({ backgroundColor: c })}
      />
      <button
        type='button'
        onClick={onResetStyle}
        title='Khôi phục style mặc định'
        aria-label='Khôi phục style mặc định'
        className='flex size-7 cursor-pointer items-center justify-center rounded-md text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-800'
      >
        <RotateCcw className='size-3.5' />
      </button>
    </>
  );
}

// ─────────────────────────────────────────── MINT TABS (hotspot detail)

function MintTabsControls({
  content,
  onContentChange,
}: {
  content: MintDiscoverContent;
  onContentChange: (next: BlockContent) => void;
}) {
  const tabs = content.tabs ?? [];
  const update = (i: number, patch: Partial<(typeof tabs)[number]>) =>
    onContentChange({
      ...content,
      tabs: tabs.map((t, idx) => (idx === i ? { ...t, ...patch } : t)),
    } as BlockContent);
  const remove = (i: number) =>
    onContentChange({
      ...content,
      tabs: tabs.filter((_, idx) => idx !== i),
    } as BlockContent);
  const add = () =>
    onContentChange({
      ...content,
      tabs: [
        ...tabs,
        {
          key: `t_${Date.now().toString(36)}`,
          label: 'Điểm mới',
          desc: 'Mô tả chi tiết.',
          img: '',
          dotX: 50,
          dotY: 50,
        },
      ],
    } as BlockContent);

  return (
    <PopoverTrigger
      label='Hotspot / chi tiết'
      preview={`${tabs.length} hotspot`}
      width={460}
    >
      <div className='flex max-h-80 flex-col gap-2 overflow-y-auto pr-1'>
        {tabs.map((t, i) => (
          <div
            key={t.key || i}
            className='flex flex-col gap-1.5 rounded-md border border-neutral-200 bg-white p-2'
          >
            <div className='flex items-center gap-2'>
              <Input
                value={t.label}
                onChange={e => update(i, { label: e.target.value })}
                placeholder='Tiêu đề hotspot'
                className='h-8 border-neutral-200 bg-white text-xs font-semibold'
              />
              <button
                type='button'
                onClick={() => remove(i)}
                aria-label='Xoá'
                className='flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-md text-rose-500 hover:bg-rose-50'
              >
                <Trash2 className='size-3.5' />
              </button>
            </div>
            <Textarea
              value={t.desc}
              onChange={e => update(i, { desc: e.target.value })}
              placeholder='Mô tả'
              className='min-h-16 resize-none border-neutral-200 bg-white text-xs'
            />
            <Input
              value={t.img}
              onChange={e => update(i, { img: e.target.value })}
              placeholder='URL ảnh trong drawer'
              className='h-8 border-neutral-200 bg-white text-xs'
            />
            <div className='flex items-center gap-2'>
              <label className='text-2xs flex flex-1 items-center gap-1 text-neutral-500'>
                Dot X%
                <Input
                  type='number'
                  min={0}
                  max={100}
                  value={t.dotX}
                  onChange={e => update(i, { dotX: Number(e.target.value) })}
                  className='h-8 border-neutral-200 bg-white text-xs'
                />
              </label>
              <label className='text-2xs flex flex-1 items-center gap-1 text-neutral-500'>
                Dot Y%
                <Input
                  type='number'
                  min={0}
                  max={100}
                  value={t.dotY}
                  onChange={e => update(i, { dotY: Number(e.target.value) })}
                  className='h-8 border-neutral-200 bg-white text-xs'
                />
              </label>
            </div>
          </div>
        ))}
      </div>
      <AddRow onAdd={add} label='Thêm hotspot' />
    </PopoverTrigger>
  );
}

// ─────────────────────────────────────────── READYMAG CASE SECTION · CASES

function ReadymagCaseSectionItemsControls({
  content,
  onContentChange,
}: {
  content: ReadymagCaseSectionContent;
  onContentChange: (
    next: BlockContent | ((prev: BlockContent) => BlockContent)
  ) => void;
}) {
  const cases = resolveReadymagCases(content);

  const write = (updater: (list: ReadymagCaseItem[]) => ReadymagCaseItem[]) => {
    onContentChange(prev => {
      const c = prev as ReadymagCaseSectionContent;
      const current = resolveReadymagCases(c);
      return { ...c, cases: updater(current) } as BlockContent;
    });
  };

  const update = (i: number, patch: Partial<ReadymagCaseItem>) =>
    write(list =>
      list.map((item, idx) => (idx === i ? { ...item, ...patch } : item))
    );

  const remove = (i: number) => {
    if (cases.length <= 1) {
      toast.error('Cần ít nhất 1 case');
      return;
    }
    write(list => list.filter((_, idx) => idx !== i));
  };

  const add = () =>
    write(list => [
      ...list,
      {
        ...READMAG_CASE_BLANK,
        key: `case-${list.length + 1}`,
      },
    ]);

  return (
    <PopoverTrigger
      label='Danh sách case'
      preview={`${cases.length} case`}
      width={460}
    >
      <div className='flex max-h-80 flex-col gap-2 overflow-y-auto pr-1'>
        {cases.map((item, i) => (
          <div
            key={`readymag-case-${i}`}
            className='flex flex-col gap-1.5 rounded-md border border-neutral-200 bg-white p-2'
          >
            <div className='flex items-center justify-between gap-2'>
              <span className='text-3xs font-semibold tracking-widest text-neutral-500 uppercase'>
                Case {i + 1}
              </span>
              <button
                type='button'
                onClick={e => {
                  e.preventDefault();
                  e.stopPropagation();
                  remove(i);
                }}
                disabled={cases.length <= 1}
                aria-label={`Xoá case ${i + 1}`}
                className='flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-md text-rose-500 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-40'
              >
                <Trash2 className='size-3.5' />
              </button>
            </div>
            <Input
              value={item.name ?? ''}
              onChange={e => update(i, { name: e.target.value })}
              placeholder='Tên case'
              className='h-8 border-neutral-200 bg-white text-xs font-semibold'
            />
            <Textarea
              value={item.body ?? ''}
              onChange={e => update(i, { body: e.target.value })}
              placeholder='Mô tả'
              rows={3}
              className='min-h-0 border-neutral-200 bg-white text-xs'
            />
            <ImagePicker
              value={item.imageUrl ?? ''}
              onChange={url => update(i, { imageUrl: url })}
            />
            <Input
              value={item.linkText ?? ''}
              onChange={e => update(i, { linkText: e.target.value })}
              placeholder='Link text'
              className='h-8 border-neutral-200 bg-white text-xs'
            />
            <Input
              value={item.linkHref ?? ''}
              onChange={e => update(i, { linkHref: e.target.value })}
              placeholder='Link URL'
              className='h-8 border-neutral-200 bg-white text-xs'
            />
          </div>
        ))}
      </div>
      <AddRow onAdd={add} label='Thêm case' />
    </PopoverTrigger>
  );
}

// ─────────────────────────────────────────── SCROLL MATTIS SLIDES

const MATTIS_SLIDE_BLANK: ScrollMattisSlideItem = {
  url: 'https://d10zufojjcedud.cloudfront.net/uploads/4d265660-8757-4da1-875d-29b776737f57/scroll_mattis_m1.jpg',
  bgWord: 'NEW SLIDE',
  title: 'New slide',
  category1: 'BRANDING',
  category2: 'IDENTITY',
  year: '2026',
};

function ScrollMattisSlidesControls({
  content,
  onContentChange,
}: {
  content: ScrollMattisContent;
  onContentChange: (
    next: BlockContent | ((prev: BlockContent) => BlockContent)
  ) => void;
}) {
  const slides = resolveScrollMattisSlides(content);

  const write = (
    updater: (list: ScrollMattisSlideItem[]) => ScrollMattisSlideItem[]
  ) => {
    onContentChange(prev => {
      const c = prev as ScrollMattisContent;
      const current = resolveScrollMattisSlides(c);
      return { ...c, slides: updater(current) } as BlockContent;
    });
  };

  const update = (i: number, patch: Partial<ScrollMattisSlideItem>) =>
    write(list => list.map((s, idx) => (idx === i ? { ...s, ...patch } : s)));
  const remove = (i: number) =>
    write(list =>
      list.length <= 1 ? list : list.filter((_, idx) => idx !== i)
    );
  const add = () => write(list => [...list, { ...MATTIS_SLIDE_BLANK }]);

  return (
    <PopoverTrigger
      label='Slides'
      preview={`${slides.length} slide`}
      width={460}
    >
      <div className='flex max-h-80 flex-col gap-2 overflow-y-auto pr-1'>
        {slides.map((s, i) => (
          <div
            key={`mattis-slide-${i}`}
            className='flex flex-col gap-1.5 rounded-md border border-neutral-200 bg-white p-2'
          >
            <div className='flex items-center gap-2'>
              <span className='text-3xs shrink-0 font-semibold tracking-widest text-neutral-500 uppercase'>
                Slide {i + 1}
              </span>
              <Input
                value={s.title}
                onChange={e => update(i, { title: e.target.value })}
                placeholder='Title'
                className='h-8 border-neutral-200 bg-white text-xs font-semibold'
              />
              <button
                type='button'
                onClick={() => remove(i)}
                disabled={slides.length <= 1}
                aria-label='Xoá slide'
                className='flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-md text-rose-500 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-40'
              >
                <Trash2 className='size-3.5' />
              </button>
            </div>
            <Input
              value={s.url}
              onChange={e => update(i, { url: e.target.value })}
              placeholder='URL ảnh / video'
              className='h-8 border-neutral-200 bg-white text-xs'
            />
            <ImagePicker value={s.url} onChange={url => update(i, { url })} />
            <Input
              value={s.bgWord}
              onChange={e => update(i, { bgWord: e.target.value })}
              placeholder='Chữ chạy (marquee)'
              className='h-8 border-neutral-200 bg-white text-xs'
            />
            <div className='flex items-center gap-1.5'>
              <Input
                value={s.category1}
                onChange={e => update(i, { category1: e.target.value })}
                placeholder='Category 1'
                className='h-8 border-neutral-200 bg-white text-xs'
              />
              <Input
                value={s.category2}
                onChange={e => update(i, { category2: e.target.value })}
                placeholder='Category 2'
                className='h-8 border-neutral-200 bg-white text-xs'
              />
              <Input
                value={s.year}
                onChange={e => update(i, { year: e.target.value })}
                placeholder='Year'
                className='h-8 w-20 shrink-0 border-neutral-200 bg-white text-xs'
              />
            </div>
          </div>
        ))}
      </div>
      <AddRow onAdd={add} label='Thêm slide' />
    </PopoverTrigger>
  );
}

// ─────────────────────────────────────── MASTERISE HOME INSIDE SLIDES

const MASTERISE_SLIDE_BLANK: Omit<MasteriseHomeInsideSlide, 'id'> = {
  imageUrl:
    'https://masterisehomes.com/the-global-city/masteri-park-place/wp-content/uploads/2025/10/WEBSITE-CT5_sanh.jpg',
  alt: 'Tiện ích nội khu',
  caption: '',
};

function MasteriseSlidesControls({
  content,
  onContentChange,
}: {
  content: MasteriseHomeInsideContent;
  onContentChange: (
    next: BlockContent | ((prev: BlockContent) => BlockContent)
  ) => void;
}) {
  const slides = resolveMasteriseHomeInsideSlides(content);

  const write = (
    updater: (list: MasteriseHomeInsideSlide[]) => MasteriseHomeInsideSlide[]
  ) => {
    onContentChange(prev => {
      const c = prev as MasteriseHomeInsideContent;
      return {
        ...c,
        slides: updater(resolveMasteriseHomeInsideSlides(c)),
      } as BlockContent;
    });
  };

  const update = (i: number, patch: Partial<MasteriseHomeInsideSlide>) =>
    write(list => list.map((s, idx) => (idx === i ? { ...s, ...patch } : s)));
  const remove = (i: number) =>
    write(list => list.filter((_, idx) => idx !== i));
  const add = () =>
    write(list => [
      ...list,
      { ...MASTERISE_SLIDE_BLANK, id: `ms_${Date.now().toString(36)}` },
    ]);

  return (
    <PopoverTrigger
      label='Slides'
      preview={`${slides.length} slide`}
      width={440}
    >
      <div className='flex max-h-80 flex-col gap-2 overflow-y-auto pr-1'>
        {slides.map((s, i) => (
          <div
            key={s.id || `masterise-slide-${i}`}
            className='flex flex-col gap-1.5 rounded-md border border-neutral-200 bg-white p-2'
          >
            <div className='flex items-center gap-2'>
              <span className='text-3xs shrink-0 font-semibold tracking-widest text-neutral-500 uppercase'>
                Slide {i + 1}
              </span>
              <Input
                value={s.alt ?? ''}
                onChange={e => update(i, { alt: e.target.value })}
                placeholder='Alt (mô tả ảnh)'
                className='h-8 border-neutral-200 bg-white text-xs font-semibold'
              />
              <button
                type='button'
                onClick={() => remove(i)}
                aria-label='Xoá slide'
                className='flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-md text-rose-500 hover:bg-rose-50'
              >
                <Trash2 className='size-3.5' />
              </button>
            </div>
            <Input
              value={s.imageUrl}
              onChange={e => update(i, { imageUrl: e.target.value })}
              placeholder='URL ảnh'
              className='h-8 border-neutral-200 bg-white text-xs'
            />
            <ImagePicker
              value={s.imageUrl}
              onChange={imageUrl => update(i, { imageUrl })}
            />
            <Input
              value={s.caption ?? ''}
              onChange={e => update(i, { caption: e.target.value })}
              placeholder='Caption overlay (để trống = ẩn)'
              className='h-8 border-neutral-200 bg-white text-xs'
            />
          </div>
        ))}
      </div>
      <AddRow onAdd={add} label='Thêm slide' />
    </PopoverTrigger>
  );
}

// ─────────────────────────────────────────── PNJ DETAILS PARAGRAPHS

function PnjParagraphsControls({
  content,
  onContentChange,
}: {
  content: PnjDetailsContent;
  onContentChange: (
    next: BlockContent | ((prev: BlockContent) => BlockContent)
  ) => void;
}) {
  const paragraphs = resolvePnjParagraphs(content);

  /** Append/update against LATEST store content (tránh closure ghi đè mất đoạn cũ). */
  const write = (updater: (paras: string[]) => string[]) => {
    onContentChange(prev => {
      const c = prev as PnjDetailsContent & {
        paragraph1?: string;
        paragraph2?: string;
      };
      const nextParas = updater(resolvePnjParagraphs(c));
      const next = { ...c, paragraphs: nextParas } as Record<string, unknown>;
      // Drop legacy keys so canvas không còn dual-source.
      delete next.paragraph1;
      delete next.paragraph2;
      return next as BlockContent;
    });
  };

  const update = (i: number, value: string) =>
    write(paras => paras.map((p, idx) => (idx === i ? value : p)));
  const remove = (i: number) => {
    if (paragraphs.length <= 1) {
      toast.error('Cần ít nhất 1 đoạn văn');
      return;
    }
    write(paras => paras.filter((_, idx) => idx !== i));
  };
  const add = () => write(paras => [...paras, 'Đoạn văn mới.']);

  return (
    <PopoverTrigger
      label='Đoạn văn'
      preview={`${paragraphs.length} đoạn`}
      width={480}
    >
      <div className='flex max-h-80 flex-col gap-2 overflow-y-auto pr-1'>
        {paragraphs.map((p, i) => (
          <div
            key={`para-${i}`}
            className='flex flex-col gap-1.5 rounded-md border border-neutral-200 bg-white p-2'
          >
            <div className='flex items-center justify-between gap-2'>
              <span className='text-2xs font-semibold tracking-wide text-neutral-500 uppercase'>
                Đoạn {i + 1}
              </span>
              <button
                type='button'
                onClick={e => {
                  e.preventDefault();
                  e.stopPropagation();
                  remove(i);
                }}
                aria-label={`Xoá đoạn ${i + 1}`}
                className='flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-md text-rose-500 hover:bg-rose-50'
              >
                <Trash2 className='size-3.5' />
              </button>
            </div>
            <Textarea
              value={p}
              onChange={e => update(i, e.target.value)}
              placeholder='Nội dung đoạn văn'
              className='field-sizing-fixed min-h-20 resize-y overflow-y-auto border-neutral-200 bg-white text-xs'
            />
          </div>
        ))}
      </div>
      <AddRow onAdd={add} label='Thêm đoạn văn' />
    </PopoverTrigger>
  );
}

// ─────────────────────────────────────────── PNJ HERO TITLE LINES

function PnjTitleLinesControls({
  content,
  onContentChange,
}: {
  content: PnjHeroContent;
  onContentChange: (
    next: BlockContent | ((prev: BlockContent) => BlockContent)
  ) => void;
}) {
  const titleLines = resolvePnjHeroTitleLines(content);

  const write = (updater: (lines: string[]) => string[]) => {
    onContentChange(prev => {
      const c = prev as PnjHeroContent;
      const nextLines = updater(resolvePnjHeroTitleLines(c));
      const next = { ...c, titleLines: nextLines } as Record<string, unknown>;
      delete next.titleLine1;
      delete next.titleLine2;
      return next as BlockContent;
    });
  };

  const update = (i: number, value: string) =>
    write(lines => lines.map((line, idx) => (idx === i ? value : line)));
  const remove = (i: number) => {
    if (titleLines.length <= 1) {
      toast.error('Cần ít nhất 1 dòng tiêu đề');
      return;
    }
    write(lines => lines.filter((_, idx) => idx !== i));
  };
  const add = () => write(lines => [...lines, 'Dòng tiêu đề mới']);

  return (
    <PopoverTrigger
      label='Tiêu đề dòng'
      preview={`${titleLines.length} dòng`}
      width={420}
    >
      <div className='flex max-h-80 flex-col gap-2 overflow-y-auto pr-1'>
        {titleLines.map((line, i) => (
          <div
            key={`title-line-${i}`}
            className='flex flex-col gap-1.5 rounded-md border border-neutral-200 bg-white p-2'
          >
            <div className='flex items-center justify-between gap-2'>
              <span className='text-2xs font-semibold tracking-wide text-neutral-500 uppercase'>
                Dòng {i + 1}
              </span>
              <button
                type='button'
                onClick={e => {
                  e.preventDefault();
                  e.stopPropagation();
                  remove(i);
                }}
                aria-label={`Xoá dòng ${i + 1}`}
                className='flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-md text-rose-500 hover:bg-rose-50'
              >
                <Trash2 className='size-3.5' />
              </button>
            </div>
            <Input
              value={line}
              onChange={e => update(i, e.target.value)}
              placeholder='Nội dung tiêu đề'
              className='h-8 border-neutral-200 bg-white text-xs'
            />
          </div>
        ))}
      </div>
      <AddRow onAdd={add} label='Thêm dòng tiêu đề' />
    </PopoverTrigger>
  );
}

// ─────────────────────────────────────────── PNJ VARIANT HIGHLIGHTS

function PnjVariantHighlightFields({
  highlights,
  onChange,
  onAdd,
  onRemove,
}: {
  highlights: string[];
  onChange: (index: number, value: string) => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
}) {
  const list = highlights.length > 0 ? highlights : [''];

  return (
    <div className='flex flex-col gap-1.5'>
      {list.map((item, hi) => (
        <div key={`hl-${hi}`} className='flex items-center gap-2'>
          <Input
            value={item}
            onChange={e => onChange(hi, e.target.value)}
            placeholder={`Highlight ${hi + 1}`}
            className='h-8 border-neutral-200 bg-white text-xs'
          />
          <button
            type='button'
            onClick={e => {
              e.preventDefault();
              e.stopPropagation();
              onRemove(hi);
            }}
            aria-label={`Xoá highlight ${hi + 1}`}
            className='flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-md text-rose-500 hover:bg-rose-50'
          >
            <Trash2 className='size-3.5' />
          </button>
        </div>
      ))}
      <AddRow onAdd={onAdd} label='Thêm highlight' />
    </div>
  );
}

function PnjVariantHighlightsControls({
  variantIndex,
  content,
  onContentChange,
}: {
  variantIndex: number;
  content: PnjVariantContent;
  onContentChange: (
    next: BlockContent | ((prev: BlockContent) => BlockContent)
  ) => void;
}) {
  const variants = resolvePnjVariants(content);
  const highlights = variants[variantIndex]?.highlights ?? [];

  const write = (updater: (list: string[]) => string[]) => {
    onContentChange(prev => {
      const list = [...resolvePnjVariants(prev as PnjVariantContent)];
      while (list.length <= variantIndex) {
        list.push({
          key: `v_${list.length}`,
          label: '',
          desc: '',
          image: '',
          highlights: [],
        });
      }
      list[variantIndex] = {
        ...list[variantIndex],
        highlights: updater(
          resolvePnjVariantHighlights(list[variantIndex].highlights)
        ),
      };
      return { ...(prev as PnjVariantContent), variants: list } as BlockContent;
    });
  };

  const update = (i: number, value: string) =>
    write(items => items.map((h, idx) => (idx === i ? value : h)));
  const remove = (i: number) => {
    if (highlights.length <= 1) {
      toast.error('Cần ít nhất 1 highlight');
      return;
    }
    write(items => items.filter((_, idx) => idx !== i));
  };
  const add = () => write(items => [...items, 'Highlight mới']);

  return (
    <PopoverTrigger
      label='Highlights'
      preview={`${highlights.length} mục`}
      width={420}
    >
      <PnjVariantHighlightFields
        highlights={highlights}
        onChange={update}
        onAdd={add}
        onRemove={remove}
      />
    </PopoverTrigger>
  );
}

// ─────────────────────────────────────────── PNJ VARIANT CHAPTERS

function PnjVariantsControls({
  content,
  onContentChange,
}: {
  content: PnjVariantContent;
  onContentChange: (
    next: BlockContent | ((prev: BlockContent) => BlockContent)
  ) => void;
}) {
  const variants = resolvePnjVariants(content);

  const write = (updater: (list: PnjVariantItem[]) => PnjVariantItem[]) => {
    onContentChange(prev => {
      const c = prev as PnjVariantContent;
      return {
        ...c,
        variants: updater(resolvePnjVariants(c)),
      } as BlockContent;
    });
  };

  const update = (i: number, patch: Partial<PnjVariantItem>) =>
    write(list => list.map((v, idx) => (idx === i ? { ...v, ...patch } : v)));

  const remove = (i: number) => {
    if (variants.length <= 1) {
      toast.error('Cần ít nhất 1 góc nhìn');
      return;
    }
    write(list => list.filter((_, idx) => idx !== i));
  };

  const add = () =>
    write(list => [
      ...list,
      {
        key: `v_${Date.now().toString(36)}`,
        label: 'Góc mới',
        desc: 'Mô tả góc nhìn sản phẩm.',
        image: '/pnj/frames/frame-001.webp',
        highlights: ['Điểm nổi bật 1', 'Điểm nổi bật 2'],
      },
    ]);

  return (
    <PopoverTrigger
      label='Góc nhìn'
      preview={`${variants.length} góc`}
      width={480}
    >
      <div className='flex max-h-80 flex-col gap-2 overflow-y-auto pr-1'>
        {variants.map((v, i) => (
          <div
            key={v.key || i}
            className='flex flex-col gap-1.5 rounded-md border border-neutral-200 bg-white p-2'
          >
            <div className='flex items-center gap-2'>
              <Input
                value={v.label}
                onChange={e => update(i, { label: e.target.value })}
                placeholder='Nhãn góc nhìn'
                className='h-8 border-neutral-200 bg-white text-xs font-semibold'
              />
              <button
                type='button'
                onClick={e => {
                  e.preventDefault();
                  e.stopPropagation();
                  remove(i);
                }}
                aria-label={`Xoá góc ${i + 1}`}
                className='flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-md text-rose-500 hover:bg-rose-50'
              >
                <Trash2 className='size-3.5' />
              </button>
            </div>
            <Textarea
              value={v.desc}
              onChange={e => update(i, { desc: e.target.value })}
              placeholder='Mô tả'
              className='field-sizing-fixed min-h-16 resize-y overflow-y-auto border-neutral-200 bg-white text-xs'
            />
            <Input
              value={v.image}
              onChange={e => update(i, { image: e.target.value })}
              placeholder='URL ảnh'
              className='h-8 border-neutral-200 bg-white text-xs'
            />
            <PnjVariantHighlightFields
              highlights={resolvePnjVariantHighlights(v.highlights)}
              onChange={(hi, value) =>
                update(i, {
                  highlights: resolvePnjVariantHighlights(v.highlights).map(
                    (h, idx) => (idx === hi ? value : h)
                  ),
                })
              }
              onAdd={() =>
                update(i, {
                  highlights: [
                    ...resolvePnjVariantHighlights(v.highlights),
                    'Highlight mới',
                  ],
                })
              }
              onRemove={hi => {
                const current = resolvePnjVariantHighlights(v.highlights);
                if (current.length <= 1) {
                  toast.error('Cần ít nhất 1 highlight');
                  return;
                }
                update(i, {
                  highlights: current.filter((_, idx) => idx !== hi),
                });
              }}
            />
          </div>
        ))}
      </div>
      <AddRow onAdd={add} label='Thêm góc nhìn' />
    </PopoverTrigger>
  );
}

// ─────────────────────────────────────────── PNJ STICKY MENU ITEMS

function PnjStickyMenuItemsControls({
  content,
  onContentChange,
}: {
  content: PnjStickyMenuContent;
  onContentChange: (
    next: BlockContent | ((prev: BlockContent) => BlockContent)
  ) => void;
}) {
  const items = content.items ?? [];

  const write = (
    updater: (list: PnjStickyMenuItem[]) => PnjStickyMenuItem[]
  ) => {
    onContentChange(prev => {
      const c = prev as PnjStickyMenuContent;
      return {
        ...c,
        items: updater([...(c.items ?? [])]),
      } as BlockContent;
    });
  };

  const update = (i: number, patch: Partial<PnjStickyMenuItem>) =>
    write(list =>
      list.map((item, idx) => (idx === i ? { ...item, ...patch } : item))
    );

  const remove = (i: number) => {
    if (items.length <= 1) {
      toast.error('Cần ít nhất 1 mục menu');
      return;
    }
    write(list => list.filter((_, idx) => idx !== i));
  };

  const add = () =>
    write(list => [
      ...list,
      {
        key: `nav_${Date.now().toString(36)}`,
        label: 'Mục mới',
        link: 'section-id',
      },
    ]);

  return (
    <PopoverTrigger
      label='Menu items'
      preview={`${items.length} mục`}
      width={420}
    >
      <div className='flex max-h-80 flex-col gap-2 overflow-y-auto pr-1'>
        {items.map((item, i) => (
          <div
            key={item.key || i}
            className='flex flex-col gap-1.5 rounded-md border border-neutral-200 bg-white p-2'
          >
            <div className='flex items-center gap-2'>
              <Input
                value={item.label}
                onChange={e => update(i, { label: e.target.value })}
                placeholder='Nhãn (title)'
                className='h-8 border-neutral-200 bg-white text-xs font-semibold'
              />
              <button
                type='button'
                onClick={e => {
                  e.preventDefault();
                  e.stopPropagation();
                  remove(i);
                }}
                aria-label={`Xoá mục ${i + 1}`}
                className='flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-md text-rose-500 hover:bg-rose-50'
              >
                <Trash2 className='size-3.5' />
              </button>
            </div>
            <Input
              value={item.link}
              onChange={e => update(i, { link: e.target.value })}
              placeholder='Link — section id (vd: contact) hoặc https://…'
              className='h-8 border-neutral-200 bg-white text-xs'
            />
          </div>
        ))}
      </div>
      <AddRow onAdd={add} label='Thêm mục menu' />
    </PopoverTrigger>
  );
}

// ─────────────────────────────────────── IGNITEX PROJECTS ITEMS

const IGNITEX_PROJECTS_DEFAULT_IMG =
  'https://framerusercontent.com/images/UY6B0qS4hdcjlEgPYtxTooD5yA.jpg';

function IgnitexProjectsItemsControls({
  content,
  onContentChange,
}: {
  content: IgnitexProjectsContent;
  onContentChange: (
    next: BlockContent | ((prev: BlockContent) => BlockContent)
  ) => void;
}) {
  const items = Array.isArray(content.items) ? content.items : [];

  const write = (
    updater: (
      list: IgnitexProjectsContent['items']
    ) => IgnitexProjectsContent['items']
  ) => {
    onContentChange(prev => {
      const c = prev as IgnitexProjectsContent;
      const prevList = Array.isArray(c.items) ? c.items : [];
      return {
        ...c,
        items: updater([...prevList]),
      } as BlockContent;
    });
  };

  const update = (
    i: number,
    patch: Partial<IgnitexProjectsContent['items'][number]>
  ) =>
    write(list =>
      list.map((item, idx) => (idx === i ? { ...item, ...patch } : item))
    );

  const remove = (i: number) => {
    if (items.length <= 1) {
      toast.error('Cần ít nhất 1 project');
      return;
    }
    write(list => list.filter((_, idx) => idx !== i));
  };

  const add = () =>
    write(list => [
      ...list,
      {
        imageUrl: IGNITEX_PROJECTS_DEFAULT_IMG,
        name: 'Project mới',
        tag: 'Tag',
      },
    ]);

  return (
    <PopoverTrigger
      label='Danh sách project'
      preview={`${items.length} project`}
      width={440}
    >
      <div className='flex max-h-80 flex-col gap-2 overflow-y-auto pr-1'>
        {items.map((item, i) => (
          <div
            key={i}
            className='flex flex-col gap-1.5 rounded-md border border-neutral-200 bg-white p-2'
          >
            <div className='flex items-center gap-2'>
              <Input
                value={item.name ?? ''}
                onChange={e => update(i, { name: e.target.value })}
                placeholder='Tên project'
                className='h-8 flex-1 border-neutral-200 bg-white text-xs font-semibold'
              />
              <Input
                value={item.tag ?? ''}
                onChange={e => update(i, { tag: e.target.value })}
                placeholder='Tag'
                className='h-8 w-28 shrink-0 border-neutral-200 bg-white text-xs'
              />
              <button
                type='button'
                onClick={e => {
                  e.preventDefault();
                  e.stopPropagation();
                  remove(i);
                }}
                aria-label={`Xoá project ${i + 1}`}
                className='flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-md text-rose-500 hover:bg-rose-50'
              >
                <Trash2 className='size-3.5' />
              </button>
            </div>
            <ImagePicker
              value={item.imageUrl ?? ''}
              onChange={url => update(i, { imageUrl: url })}
            />
          </div>
        ))}
      </div>
      <AddRow onAdd={add} label='Thêm project' />
    </PopoverTrigger>
  );
}

// ─────────────────────────────────────── FRAMER PERFORM TESTIMONIALS

const PERFORM_ABOUT_DEFAULT_IMG =
  'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=1024&q=80';

function FramerPerformTestimonialsControls({
  content,
  onContentChange,
}: {
  content: FramerPerformAboutContent;
  onContentChange: (
    next: BlockContent | ((prev: BlockContent) => BlockContent)
  ) => void;
}) {
  const testimonials = Array.isArray(content.testimonials)
    ? content.testimonials
    : [];

  const write = (
    updater: (
      list: FramerPerformAboutContent['testimonials']
    ) => FramerPerformAboutContent['testimonials']
  ) => {
    onContentChange(prev => {
      const c = prev as FramerPerformAboutContent;
      const prevList = Array.isArray(c.testimonials) ? c.testimonials : [];
      return {
        ...c,
        testimonials: updater([...prevList]),
      } as BlockContent;
    });
  };

  const update = (
    i: number,
    patch: Partial<FramerPerformAboutContent['testimonials'][number]>
  ) =>
    write(list =>
      list.map((item, idx) => (idx === i ? { ...item, ...patch } : item))
    );

  const remove = (i: number) => {
    if (testimonials.length <= 1) {
      toast.error('Cần ít nhất 1 card');
      return;
    }
    write(list => list.filter((_, idx) => idx !== i));
  };

  const add = () =>
    write(list => [
      ...list,
      {
        imageUrl: PERFORM_ABOUT_DEFAULT_IMG,
        textHighlight: 'Highlight mới…',
        textRest: 'Nội dung mới…',
      },
    ]);

  return (
    <PopoverTrigger
      label='Danh sách card'
      preview={`${testimonials.length} card`}
      width={480}
    >
      <div className='flex max-h-80 flex-col gap-2 overflow-y-auto pr-1'>
        {testimonials.map((item, i) => (
          <div
            key={i}
            className='flex flex-col gap-1.5 rounded-md border border-neutral-200 bg-white p-2'
          >
            <div className='flex items-center gap-2'>
              <Input
                value={item.textHighlight ?? ''}
                onChange={e => update(i, { textHighlight: e.target.value })}
                placeholder='Highlight'
                className='h-8 flex-1 border-neutral-200 bg-white text-xs font-semibold'
              />
              <button
                type='button'
                onClick={e => {
                  e.preventDefault();
                  e.stopPropagation();
                  remove(i);
                }}
                aria-label={`Xoá card ${i + 1}`}
                className='flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-md text-rose-500 hover:bg-rose-50'
              >
                <Trash2 className='size-3.5' />
              </button>
            </div>
            <Input
              value={item.textRest ?? ''}
              onChange={e => update(i, { textRest: e.target.value })}
              placeholder='Nội dung'
              className='h-8 border-neutral-200 bg-white text-xs'
            />
            <ImagePicker
              value={item.imageUrl ?? ''}
              onChange={url => update(i, { imageUrl: url })}
            />
          </div>
        ))}
      </div>
      <AddRow onAdd={add} label='Thêm card' />
    </PopoverTrigger>
  );
}

// ─────────────────────────────────────────── FRAMER PERFORM PRICING TIERS

const PERFORM_PRICING_DEFAULT_IMG =
  'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=1024&q=80';

function FramerPerformPricingTiersControls({
  content,
  onContentChange,
}: {
  content: FramerPerformPricingContent;
  onContentChange: (
    next: BlockContent | ((prev: BlockContent) => BlockContent)
  ) => void;
}) {
  const tiers = Array.isArray(content.tiers) ? content.tiers : [];

  const write = (
    updater: (
      list: FramerPerformPricingContent['tiers']
    ) => FramerPerformPricingContent['tiers']
  ) => {
    onContentChange(prev => {
      const c = prev as FramerPerformPricingContent;
      const prevTiers = Array.isArray(c.tiers) ? c.tiers : [];
      return {
        ...c,
        tiers: updater([...prevTiers]),
      } as BlockContent;
    });
  };

  const update = (
    i: number,
    patch: Partial<FramerPerformPricingContent['tiers'][number]>
  ) =>
    write(list =>
      list.map((tier, idx) => (idx === i ? { ...tier, ...patch } : tier))
    );

  const remove = (i: number) => {
    if (tiers.length <= 1) {
      toast.error('Cần ít nhất 1 gói');
      return;
    }
    write(list => list.filter((_, idx) => idx !== i));
  };

  const add = () =>
    write(list => [
      ...list,
      {
        imageUrl: PERFORM_PRICING_DEFAULT_IMG,
        price: '$99/tháng',
        title: 'Gói mới',
        features: 'Mô tả tính năng (mỗi dòng một bullet)…',
        ctaLabel: 'Liên hệ',
        ctaHref: '#contact',
      },
    ]);

  return (
    <PopoverTrigger
      label='Danh sách gói'
      preview={`${tiers.length} gói`}
      width={440}
    >
      <div className='flex max-h-80 flex-col gap-2 overflow-y-auto pr-1'>
        {tiers.map((tier, i) => (
          <div
            key={i}
            className='flex flex-col gap-1.5 rounded-md border border-neutral-200 bg-white p-2'
          >
            <div className='flex items-center gap-2'>
              <Input
                value={tier.title ?? ''}
                onChange={e => update(i, { title: e.target.value })}
                placeholder='Tên gói'
                className='h-8 border-neutral-200 bg-white text-xs font-semibold'
              />
              <Input
                value={tier.price ?? ''}
                onChange={e => update(i, { price: e.target.value })}
                placeholder='Giá'
                className='h-8 w-28 shrink-0 border-neutral-200 bg-white text-xs'
              />
              <button
                type='button'
                onClick={e => {
                  e.preventDefault();
                  e.stopPropagation();
                  remove(i);
                }}
                aria-label={`Xoá gói ${i + 1}`}
                className='flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-md text-rose-500 hover:bg-rose-50'
              >
                <Trash2 className='size-3.5' />
              </button>
            </div>
            <Textarea
              value={tier.features ?? ''}
              onChange={e => update(i, { features: e.target.value })}
              placeholder='Tính năng (mỗi dòng một bullet)'
              rows={3}
              className='min-h-0 border-neutral-200 bg-white text-xs'
            />
            <Input
              value={tier.imageUrl ?? ''}
              onChange={e => update(i, { imageUrl: e.target.value })}
              placeholder='URL ảnh'
              className='h-8 border-neutral-200 bg-white text-xs'
            />
            <div className='flex gap-2'>
              <Input
                value={tier.ctaLabel ?? ''}
                onChange={e => update(i, { ctaLabel: e.target.value })}
                placeholder='CTA chữ'
                className='h-8 border-neutral-200 bg-white text-xs'
              />
              <Input
                value={tier.ctaHref ?? ''}
                onChange={e => update(i, { ctaHref: e.target.value })}
                placeholder='CTA link'
                className='h-8 border-neutral-200 bg-white text-xs'
              />
            </div>
          </div>
        ))}
      </div>
      <AddRow onAdd={add} label='Thêm gói' />
    </PopoverTrigger>
  );
}

// ─────────────────────────────────────────── FRAMER DARLING TIMELINE ITEMS

const DARLING_TIMELINE_DEFAULT_IMG =
  'https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&q=80';

function FramerDarlingTimelineItemsControls({
  content,
  onContentChange,
}: {
  content: FramerDarlingTimelineContent;
  onContentChange: (
    next: BlockContent | ((prev: BlockContent) => BlockContent)
  ) => void;
}) {
  const items = Array.isArray(content.items) ? content.items : [];

  const write = (
    updater: (
      list: FramerDarlingTimelineContent['items']
    ) => FramerDarlingTimelineContent['items']
  ) => {
    onContentChange(prev => {
      const c = prev as FramerDarlingTimelineContent;
      const prevItems = Array.isArray(c.items) ? c.items : [];
      return {
        ...c,
        items: updater([...prevItems]),
      } as BlockContent;
    });
  };

  const update = (
    i: number,
    patch: Partial<FramerDarlingTimelineContent['items'][number]>
  ) =>
    write(list =>
      list.map((item, idx) => (idx === i ? { ...item, ...patch } : item))
    );

  const remove = (i: number) => {
    if (items.length <= 1) {
      toast.error('Cần ít nhất 1 mốc');
      return;
    }
    write(list => list.filter((_, idx) => idx !== i));
  };

  const add = () =>
    write(list => [
      ...list,
      {
        time: '10:00 SA',
        title: 'Mốc mới',
        description: 'Mô tả mốc thời gian…',
        imageUrl: DARLING_TIMELINE_DEFAULT_IMG,
      },
    ]);

  return (
    <PopoverTrigger
      label='Danh sách mốc'
      preview={`${items.length} mốc`}
      width={440}
    >
      <div className='flex max-h-80 flex-col gap-2 overflow-y-auto pr-1'>
        {items.map((item, i) => (
          <div
            key={i}
            className='flex flex-col gap-1.5 rounded-md border border-neutral-200 bg-white p-2'
          >
            <div className='flex items-center gap-2'>
              <Input
                value={item.time ?? ''}
                onChange={e => update(i, { time: e.target.value })}
                placeholder='9:00 SA'
                className='h-8 w-24 shrink-0 border-neutral-200 bg-white text-xs font-semibold'
              />
              <Input
                value={item.title ?? ''}
                onChange={e => update(i, { title: e.target.value })}
                placeholder='Tiêu đề'
                className='h-8 border-neutral-200 bg-white text-xs font-semibold'
              />
              <button
                type='button'
                onClick={e => {
                  e.preventDefault();
                  e.stopPropagation();
                  remove(i);
                }}
                aria-label={`Xoá mốc ${i + 1}`}
                className='flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-md text-rose-500 hover:bg-rose-50'
              >
                <Trash2 className='size-3.5' />
              </button>
            </div>
            <Textarea
              value={item.description ?? ''}
              onChange={e => update(i, { description: e.target.value })}
              placeholder='Mô tả'
              rows={2}
              className='min-h-0 border-neutral-200 bg-white text-xs'
            />
            <Input
              value={item.imageUrl ?? ''}
              onChange={e => update(i, { imageUrl: e.target.value })}
              placeholder='URL ảnh'
              className='h-8 border-neutral-200 bg-white text-xs'
            />
          </div>
        ))}
      </div>
      <AddRow onAdd={add} label='Thêm mốc' />
    </PopoverTrigger>
  );
}

// ─────────────────────────────────────────── NFTPULL TIMELINE ITEMS

type NftpullTimelineItems = FramerNftpullTimelineContent['items'];

/**
 * Badge `number` là text tự do (author có thể gõ "01", "A"…), nhưng mặc định
 * là 1..n. Chỉ tự đánh số lại khi list đang đúng thứ tự mặc định — tránh
 * ghi đè số do author tự đặt.
 */
const isSequentialNumbering = (list: NftpullTimelineItems) =>
  list.every((item, i) => (item.number ?? '') === String(i + 1));

const renumberIfSequential = (
  before: NftpullTimelineItems,
  after: NftpullTimelineItems
): NftpullTimelineItems =>
  isSequentialNumbering(before)
    ? after.map((item, i) => ({ ...item, number: String(i + 1) }))
    : after;

function FramerNftpullTimelineItemsControls({
  content,
  onContentChange,
}: {
  content: FramerNftpullTimelineContent;
  onContentChange: (
    next: BlockContent | ((prev: BlockContent) => BlockContent)
  ) => void;
}) {
  const items = Array.isArray(content.items) ? content.items : [];

  const write = (
    updater: (list: NftpullTimelineItems) => NftpullTimelineItems
  ) => {
    onContentChange(prev => {
      const c = prev as FramerNftpullTimelineContent;
      const prevItems = Array.isArray(c.items) ? c.items : [];
      return {
        ...c,
        items: updater([...prevItems]),
      } as BlockContent;
    });
  };

  const update = (i: number, patch: Partial<NftpullTimelineItems[number]>) =>
    write(list =>
      list.map((item, idx) => (idx === i ? { ...item, ...patch } : item))
    );

  const remove = (i: number) => {
    if (items.length <= 1) {
      toast.error('Cần ít nhất 1 mục');
      return;
    }
    write(list =>
      renumberIfSequential(
        list,
        list.filter((_, idx) => idx !== i)
      )
    );
  };

  const add = () =>
    write(list => [
      ...list,
      {
        number: String(list.length + 1),
        title: 'Mục mới',
        description: 'Mô tả ngắn cho mục này…',
      },
    ]);

  return (
    <PopoverTrigger
      label='Danh sách mục'
      preview={`${items.length} mục`}
      width={440}
    >
      <div className='flex max-h-80 flex-col gap-2 overflow-y-auto pr-1'>
        {items.map((item, i) => (
          <div
            key={i}
            className='flex flex-col gap-1.5 rounded-md border border-neutral-200 bg-white p-2'
          >
            <div className='flex items-center gap-2'>
              <Input
                value={item.number ?? ''}
                onChange={e => update(i, { number: e.target.value })}
                placeholder='1'
                className='h-8 w-14 shrink-0 border-neutral-200 bg-white text-xs font-semibold'
              />
              <Input
                value={item.title ?? ''}
                onChange={e => update(i, { title: e.target.value })}
                placeholder='Tiêu đề'
                className='h-8 border-neutral-200 bg-white text-xs font-semibold'
              />
              <button
                type='button'
                onClick={e => {
                  e.preventDefault();
                  e.stopPropagation();
                  remove(i);
                }}
                aria-label={`Xoá mục ${i + 1}`}
                className='flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-md text-rose-500 hover:bg-rose-50'
              >
                <Trash2 className='size-3.5' />
              </button>
            </div>
            <Textarea
              value={item.description ?? ''}
              onChange={e => update(i, { description: e.target.value })}
              placeholder='Mô tả'
              rows={2}
              className='min-h-0 border-neutral-200 bg-white text-xs'
            />
          </div>
        ))}
      </div>
      <AddRow onAdd={add} label='Thêm mục' />
    </PopoverTrigger>
  );
}

// ─────────────────────────────────── FLAT WHITE "OUR PROCESS" STEPS

type FlatWhiteProcessSteps = FramerFlatWhiteProcessContent['steps'];

/** Site gốc đánh số "001", "002"… — giữ nguyên độ rộng khi renumber. */
const flatWhitePad = (n: number, sample: string) =>
  String(n).padStart(Math.max(sample.length, 1), '0');

/** Chỉ tự đánh lại số khi list đang là 1..n theo đúng thứ tự (dạng padded).
 *  Nếu tác giả đã sửa tay ("01a", "Bước 1"…) thì giữ nguyên. */
const flatWhiteRenumber = (
  before: FlatWhiteProcessSteps,
  after: FlatWhiteProcessSteps
): FlatWhiteProcessSteps => {
  const sample = before[0]?.number ?? '001';
  const sequential = before.every(
    (s, i) => (s.number ?? '') === flatWhitePad(i + 1, sample)
  );
  return sequential
    ? after.map((s, i) => ({ ...s, number: flatWhitePad(i + 1, sample) }))
    : after;
};

function FramerFlatWhiteProcessStepsControls({
  content,
  onContentChange,
}: {
  content: FramerFlatWhiteProcessContent;
  onContentChange: (
    next: BlockContent | ((prev: BlockContent) => BlockContent)
  ) => void;
}) {
  const steps = Array.isArray(content.steps) ? content.steps : [];

  const write = (
    updater: (list: FlatWhiteProcessSteps) => FlatWhiteProcessSteps
  ) => {
    onContentChange(prev => {
      const c = prev as FramerFlatWhiteProcessContent;
      const prevSteps = Array.isArray(c.steps) ? c.steps : [];
      return {
        ...c,
        steps: updater([...prevSteps]),
      } as BlockContent;
    });
  };

  const update = (i: number, patch: Partial<FlatWhiteProcessSteps[number]>) =>
    write(list =>
      list.map((step, idx) => (idx === i ? { ...step, ...patch } : step))
    );

  const remove = (i: number) => {
    if (steps.length <= 1) {
      toast.error('Cần ít nhất 1 bước');
      return;
    }
    write(list =>
      flatWhiteRenumber(
        list,
        list.filter((_, idx) => idx !== i)
      )
    );
  };

  const add = () =>
    write(list => [
      ...list,
      {
        number: flatWhitePad(list.length + 1, list[0]?.number ?? '001'),
        title: 'Bước mới',
        body: 'Mô tả ngắn cho bước này…',
      },
    ]);

  return (
    <PopoverTrigger
      label='Danh sách bước'
      preview={`${steps.length} bước`}
      width={440}
    >
      <div className='flex max-h-80 flex-col gap-2 overflow-y-auto pr-1'>
        {steps.map((step, i) => (
          <div
            key={i}
            className='flex flex-col gap-1.5 rounded-md border border-neutral-200 bg-white p-2'
          >
            <div className='flex items-center gap-2'>
              <Input
                value={step.number ?? ''}
                onChange={e => update(i, { number: e.target.value })}
                placeholder='001'
                className='h-8 w-16 shrink-0 border-neutral-200 bg-white text-xs font-semibold'
              />
              <Input
                value={step.title ?? ''}
                onChange={e => update(i, { title: e.target.value })}
                placeholder='Tiêu đề'
                className='h-8 border-neutral-200 bg-white text-xs font-semibold'
              />
              <button
                type='button'
                onClick={e => {
                  e.preventDefault();
                  e.stopPropagation();
                  remove(i);
                }}
                aria-label={`Xoá bước ${i + 1}`}
                className='flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-md text-rose-500 hover:bg-rose-50'
              >
                <Trash2 className='size-3.5' />
              </button>
            </div>
            <Textarea
              value={step.body ?? ''}
              onChange={e => update(i, { body: e.target.value })}
              placeholder='Mô tả'
              rows={2}
              className='min-h-0 border-neutral-200 bg-white text-xs'
            />
          </div>
        ))}
      </div>
      <AddRow onAdd={add} label='Thêm bước' />
    </PopoverTrigger>
  );
}

// ─────────────────────────────────────────── MINTV2 PROCESS STEPS

function MintV2ProcessStepsControls({
  content,
  onContentChange,
}: {
  content: MintV2ProcessContent;
  onContentChange: (
    next: BlockContent | ((prev: BlockContent) => BlockContent)
  ) => void;
}) {
  const steps = Array.isArray(content.steps) ? content.steps : [];

  const write = (
    updater: (list: MintV2ProcessStep[]) => MintV2ProcessStep[]
  ) => {
    onContentChange(prev => {
      const c = prev as MintV2ProcessContent;
      const prevSteps = Array.isArray(c.steps) ? c.steps : [];
      return {
        ...c,
        steps: updater([...prevSteps]),
      } as BlockContent;
    });
  };

  const update = (i: number, patch: Partial<MintV2ProcessStep>) =>
    write(list =>
      list.map((step, idx) => (idx === i ? { ...step, ...patch } : step))
    );

  const remove = (i: number) => {
    if (steps.length <= 1) {
      toast.error('Cần ít nhất 1 bước');
      return;
    }
    write(list => list.filter((_, idx) => idx !== i));
  };

  const add = () =>
    write(list => {
      const nextNo = String(list.length + 1).padStart(2, '0');
      return [
        ...list,
        {
          key: `s_${Date.now().toString(36)}`,
          no: nextNo,
          title: 'New Step',
          body: 'Describe this step…',
        },
      ];
    });

  return (
    <PopoverTrigger
      label='Danh sách bước'
      preview={`${steps.length} bước`}
      width={440}
    >
      <div className='flex max-h-80 flex-col gap-2 overflow-y-auto pr-1'>
        {steps.map((step, i) => (
          <div
            key={step.key || i}
            className='flex flex-col gap-1.5 rounded-md border border-neutral-200 bg-white p-2'
          >
            <div className='flex items-center gap-2'>
              <Input
                value={step.no ?? ''}
                onChange={e => update(i, { no: e.target.value })}
                placeholder='01'
                className='h-8 w-16 shrink-0 border-neutral-200 bg-white text-xs font-semibold'
              />
              <Input
                value={step.title ?? ''}
                onChange={e => update(i, { title: e.target.value })}
                placeholder='Tiêu đề'
                className='h-8 border-neutral-200 bg-white text-xs font-semibold'
              />
              <button
                type='button'
                onClick={e => {
                  e.preventDefault();
                  e.stopPropagation();
                  remove(i);
                }}
                aria-label={`Xoá bước ${i + 1}`}
                className='flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-md text-rose-500 hover:bg-rose-50'
              >
                <Trash2 className='size-3.5' />
              </button>
            </div>
            <Textarea
              value={step.body ?? ''}
              onChange={e => update(i, { body: e.target.value })}
              placeholder='Mô tả'
              rows={2}
              className='min-h-0 border-neutral-200 bg-white text-xs'
            />
          </div>
        ))}
      </div>
      <AddRow onAdd={add} label='Thêm bước' />
    </PopoverTrigger>
  );
}

// ─────────────────────────────────────────── VAULT CRAFT ITEMS

const CRAFT_DEFAULT_IMG =
  'https://images.unsplash.com/photo-1624365169364-0640dd10e180?auto=format&fit=crop&w=1200&q=80';

function MintVaultCraftItemsControls({
  content,
  onContentChange,
}: {
  content: MintVaultCraftContent;
  onContentChange: (
    next: BlockContent | ((prev: BlockContent) => BlockContent)
  ) => void;
}) {
  const items = Array.isArray(content.items) ? content.items : [];

  const write = (
    updater: (list: MintVaultCraftItem[]) => MintVaultCraftItem[]
  ) => {
    onContentChange(prev => {
      const c = prev as MintVaultCraftContent;
      const prevItems = Array.isArray(c.items) ? c.items : [];
      return {
        ...c,
        items: updater([...prevItems]),
      } as BlockContent;
    });
  };

  const update = (i: number, patch: Partial<MintVaultCraftItem>) =>
    write(list =>
      list.map((item, idx) => (idx === i ? { ...item, ...patch } : item))
    );

  const remove = (i: number) => {
    if (items.length <= 1) {
      toast.error('Cần ít nhất 1 mục');
      return;
    }
    write(list => list.filter((_, idx) => idx !== i));
  };

  const add = () =>
    write(list => [
      ...list,
      {
        title: 'New proof',
        description: 'Describe this proof point…',
        imageUrl: CRAFT_DEFAULT_IMG,
      },
    ]);

  return (
    <PopoverTrigger
      label='Danh sách mục'
      preview={`${items.length} mục`}
      width={440}
    >
      <div className='flex max-h-80 flex-col gap-2 overflow-y-auto pr-1'>
        {items.map((item, i) => (
          <div
            key={i}
            className='flex flex-col gap-1.5 rounded-md border border-neutral-200 bg-white p-2'
          >
            <div className='flex items-center gap-2'>
              <Input
                value={item.title ?? ''}
                onChange={e => update(i, { title: e.target.value })}
                placeholder='Tiêu đề'
                className='h-8 border-neutral-200 bg-white text-xs font-semibold'
              />
              <button
                type='button'
                onClick={e => {
                  e.preventDefault();
                  e.stopPropagation();
                  remove(i);
                }}
                aria-label={`Xoá mục ${i + 1}`}
                className='flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-md text-rose-500 hover:bg-rose-50'
              >
                <Trash2 className='size-3.5' />
              </button>
            </div>
            <Textarea
              value={item.description ?? ''}
              onChange={e => update(i, { description: e.target.value })}
              placeholder='Mô tả'
              rows={2}
              className='min-h-0 border-neutral-200 bg-white text-xs'
            />
            <Input
              value={item.imageUrl ?? ''}
              onChange={e => update(i, { imageUrl: e.target.value })}
              placeholder='URL ảnh'
              className='h-8 border-neutral-200 bg-white text-xs'
            />
          </div>
        ))}
      </div>
      <AddRow onAdd={add} label='Thêm mục' />
    </PopoverTrigger>
  );
}

// ─────────────────────────────────────────── VAULT IMAGES (string[])

const VAULT_IMAGE_DEFAULT =
  'https://images.unsplash.com/photo-1610375461246-83df859d849d?auto=format&fit=crop&w=1200&q=80';

/**
 * List manager cho `images: string[]` — dùng chung mint_vault_reveal (gallery
 * 3D) / mint_vault_hero (trail) / mint_vault_invitation (explosion). Content
 * nhận rộng vì 3 block khác type nhưng cùng shape mảng ảnh.
 */
function MintVaultImagesControls({
  label,
  content,
  onContentChange,
}: {
  label: string;
  content: { images?: string[] };
  onContentChange: (
    next: BlockContent | ((prev: BlockContent) => BlockContent)
  ) => void;
}) {
  const images = Array.isArray(content.images) ? content.images : [];

  const write = (updater: (list: string[]) => string[]) => {
    onContentChange(prev => {
      const c = prev as { images?: string[] };
      const prevImages = Array.isArray(c.images) ? c.images : [];
      return {
        ...c,
        images: updater([...prevImages]),
      } as BlockContent;
    });
  };

  const update = (i: number, value: string) =>
    write(list => list.map((src, idx) => (idx === i ? value : src)));

  const remove = (i: number) => {
    if (images.length <= 1) {
      toast.error('Cần ít nhất 1 ảnh');
      return;
    }
    write(list => list.filter((_, idx) => idx !== i));
  };

  const add = () => write(list => [...list, VAULT_IMAGE_DEFAULT]);

  return (
    <PopoverTrigger
      label={label}
      preview={`${images.length} ảnh`}
      icon={<ImageIcon className='size-3.5' />}
      width={440}
    >
      <div className='flex max-h-80 flex-col gap-2 overflow-y-auto pr-1'>
        {images.map((src, i) => (
          <div
            key={i}
            className='flex items-center gap-2 rounded-md border border-neutral-200 bg-white p-2'
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt=''
              className='size-9 shrink-0 rounded object-cover ring-1 ring-neutral-200'
            />
            <Input
              value={src}
              onChange={e => update(i, e.target.value)}
              placeholder='URL ảnh'
              className='h-8 border-neutral-200 bg-white text-xs'
            />
            <button
              type='button'
              onClick={e => {
                e.preventDefault();
                e.stopPropagation();
                remove(i);
              }}
              aria-label={`Xoá ảnh ${i + 1}`}
              className='flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-md text-rose-500 hover:bg-rose-50'
            >
              <Trash2 className='size-3.5' />
            </button>
          </div>
        ))}
      </div>
      <AddRow onAdd={add} label='Thêm ảnh' />
    </PopoverTrigger>
  );
}

/**
 * List manager 1 panel PureVisuals (`leftImageUrl` / `rightImageUrl`) — mảng
 * ảnh carousel: thêm / xoá / đổi từng ảnh (ImagePicker = upload hoặc dán URL).
 * Panel rỗng là hợp lệ: block fallback về nền đặc.
 */
function FramerPurevisualsPanelImagesControls({
  panel,
  content,
  onContentChange,
}: {
  panel: FramerPurevisualsPanelKey;
  content: FramerPurevisualsHeroContent;
  onContentChange: (
    next: BlockContent | ((prev: BlockContent) => BlockContent)
  ) => void;
}) {
  const images = resolveFramerPurevisualsPanelImages(content, panel);

  const write = (updater: (list: string[]) => string[]) => {
    onContentChange(prev => {
      const c = prev as FramerPurevisualsHeroContent;
      const current = resolveFramerPurevisualsPanelImages(c, panel);
      return { ...c, [panel]: updater(current) } as BlockContent;
    });
  };

  const update = (i: number, value: string) =>
    write(list => list.map((src, idx) => (idx === i ? value : src)));

  const remove = (i: number) =>
    write(list => list.filter((_, idx) => idx !== i));

  const add = () =>
    write(list => [...list, FRAMER_PUREVISUALS_NEW_IMAGE[panel]]);

  return (
    <PopoverTrigger
      label={FRAMER_PUREVISUALS_PANEL_LABEL[panel]}
      preview={`${images.length} ảnh`}
      icon={<ImageIcon className='size-3.5' />}
      width={440}
      primary
    >
      <div className='flex max-h-80 flex-col gap-2 overflow-y-auto pr-1'>
        {images.length === 0 && (
          <p className='px-1 py-2 text-xs text-neutral-500'>
            Chưa có ảnh — panel hiển thị nền đặc. Bấm Thêm ảnh.
          </p>
        )}
        {images.map((src, i) => (
          <div
            key={`${panel}-${i}`}
            className='flex flex-col gap-1.5 rounded-md border border-neutral-200 bg-white p-2'
          >
            <div className='flex items-center justify-between gap-2'>
              <span className='text-3xs font-semibold tracking-widest text-neutral-500 uppercase'>
                Ảnh {i + 1}
              </span>
              <button
                type='button'
                onClick={e => {
                  e.preventDefault();
                  e.stopPropagation();
                  remove(i);
                }}
                aria-label={`Xoá ảnh ${i + 1}`}
                className='flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-md text-rose-500 hover:bg-rose-50'
              >
                <Trash2 className='size-3.5' />
              </button>
            </div>
            <ImagePicker value={src} onChange={url => update(i, url)} />
          </div>
        ))}
      </div>
      <AddRow onAdd={add} label='Thêm ảnh' />
    </PopoverTrigger>
  );
}

function LineaPortfolioItemsControls({
  content,
  onContentChange,
}: {
  content: LineaPortfolioContent;
  onContentChange: (
    next: BlockContent | ((prev: BlockContent) => BlockContent)
  ) => void;
}) {
  const items = Array.isArray(content.items) ? content.items : [];

  const write = (
    updater: (list: LineaPortfolioItem[]) => LineaPortfolioItem[]
  ) => {
    onContentChange(prev => {
      const c = prev as LineaPortfolioContent;
      const prevItems = Array.isArray(c.items) ? c.items : [];
      return {
        ...c,
        items: updater([...prevItems]),
      } as BlockContent;
    });
  };

  const update = (i: number, value: string) =>
    write(list =>
      list.map((item, idx) => (idx === i ? { ...item, img: value } : item))
    );

  const remove = (i: number) => {
    if (items.length <= 3) {
      toast.error('Cần ít nhất 3 ảnh (1 mỗi cột ticker)');
      return;
    }
    write(list => list.filter((_, idx) => idx !== i));
  };

  const add = () =>
    write(list => [...list, { img: LINEA_PORTFOLIO_DEFAULT_IMG }]);

  return (
    <PopoverTrigger
      label='Lưới ảnh'
      preview={`${items.length} ảnh`}
      icon={<ImageIcon className='size-3.5' />}
      width={440}
    >
      <div className='flex max-h-80 flex-col gap-2 overflow-y-auto pr-1'>
        {items.map((item, i) => (
          <div
            key={i}
            className='flex items-center gap-2 rounded-md border border-neutral-200 bg-white p-2'
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.img}
              alt=''
              className='size-9 shrink-0 rounded object-cover ring-1 ring-neutral-200'
            />
            <Input
              value={item.img}
              onChange={e => update(i, e.target.value)}
              placeholder='URL ảnh'
              className='h-8 border-neutral-200 bg-white text-xs'
            />
            <button
              type='button'
              onClick={e => {
                e.preventDefault();
                e.stopPropagation();
                remove(i);
              }}
              aria-label={`Xoá ảnh ${i + 1}`}
              className='flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-md text-rose-500 hover:bg-rose-50'
            >
              <Trash2 className='size-3.5' />
            </button>
          </div>
        ))}
      </div>
      <AddRow onAdd={add} label='Thêm ảnh' />
    </PopoverTrigger>
  );
}

// ─────────────────────────────────────────── MINT VAULT COLLECTION COINS
let mintVaultCoinSeq = 0;

function MintVaultCoinsControls({
  content,
  onContentChange,
}: {
  content: MintVaultCollectionContent;
  onContentChange: (
    next: BlockContent | ((prev: BlockContent) => BlockContent)
  ) => void;
}) {
  const coins = Array.isArray(content.coins) ? content.coins : [];

  const write = (updater: (list: MintVaultCoin[]) => MintVaultCoin[]) => {
    onContentChange(prev => {
      const c = prev as MintVaultCollectionContent;
      const prevCoins = Array.isArray(c.coins) ? c.coins : [];
      return { ...c, coins: updater([...prevCoins]) } as BlockContent;
    });
  };

  const update = (i: number, patch: Partial<MintVaultCoin>) =>
    write(list =>
      list.map((coin, idx) => (idx === i ? { ...coin, ...patch } : coin))
    );

  const remove = (i: number) => {
    if (coins.length <= 1) {
      toast.error('Cần ít nhất 1 coin');
      return;
    }
    write(list => list.filter((_, idx) => idx !== i));
  };

  const add = () => {
    mintVaultCoinSeq += 1;
    write(list => [
      ...list,
      {
        key: `coin-${Date.now()}-${mintVaultCoinSeq}`,
        name: 'New coin',
        image: MINT_IMG.coinReverse,
        metal: 'Gold',
        weight: '1 oz',
        price: '$0',
        url: '#',
      },
    ]);
  };

  return (
    <PopoverTrigger
      label='Bộ sưu tập coin'
      preview={`${coins.length} coin`}
      width={460}
    >
      <div className='flex max-h-80 flex-col gap-2 overflow-y-auto pr-1'>
        {coins.map((coin, i) => (
          <div
            key={coin.key ?? i}
            className='flex flex-col gap-1.5 rounded-md border border-neutral-200 bg-white p-2'
          >
            <div className='flex items-center gap-2'>
              <Input
                value={coin.name ?? ''}
                onChange={e => update(i, { name: e.target.value })}
                placeholder='Tên coin'
                className='h-8 border-neutral-200 bg-white text-xs font-semibold'
              />
              <button
                type='button'
                onClick={e => {
                  e.preventDefault();
                  e.stopPropagation();
                  remove(i);
                }}
                aria-label={`Xoá coin ${i + 1}`}
                className='flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-md text-rose-500 hover:bg-rose-50'
              >
                <Trash2 className='size-3.5' />
              </button>
            </div>
            <div className='flex gap-2'>
              <Input
                value={coin.metal ?? ''}
                onChange={e => update(i, { metal: e.target.value })}
                placeholder='Kim loại'
                className='h-8 border-neutral-200 bg-white text-xs'
              />
              <Input
                value={coin.weight ?? ''}
                onChange={e => update(i, { weight: e.target.value })}
                placeholder='Trọng lượng'
                className='h-8 border-neutral-200 bg-white text-xs'
              />
              <Input
                value={coin.price ?? ''}
                onChange={e => update(i, { price: e.target.value })}
                placeholder='Giá'
                className='h-8 border-neutral-200 bg-white text-xs'
              />
            </div>
            <Input
              value={coin.image ?? ''}
              onChange={e => update(i, { image: e.target.value })}
              placeholder='URL ảnh'
              className='h-8 border-neutral-200 bg-white text-xs'
            />
            <Input
              value={coin.url ?? ''}
              onChange={e => update(i, { url: e.target.value })}
              placeholder='Link mint.ca (tuỳ chọn)'
              className='h-8 border-neutral-200 bg-white text-xs'
            />
          </div>
        ))}
      </div>
      <AddRow onAdd={add} label='Thêm coin' />
    </PopoverTrigger>
  );
}

// ─────────────────────────────────────────── MINTV2 SERVICES ITEMS

function MintV2ServicesItemsControls({
  content,
  onContentChange,
}: {
  content: MintV2ServicesContent;
  onContentChange: (
    next: BlockContent | ((prev: BlockContent) => BlockContent)
  ) => void;
}) {
  const items = Array.isArray(content.items) ? content.items : [];

  const write = (
    updater: (list: MintV2ServiceItem[]) => MintV2ServiceItem[]
  ) => {
    onContentChange(prev => {
      const c = prev as MintV2ServicesContent;
      const prevItems = Array.isArray(c.items) ? c.items : [];
      return {
        ...c,
        items: updater([...prevItems]),
      } as BlockContent;
    });
  };

  const update = (i: number, patch: Partial<MintV2ServiceItem>) =>
    write(list =>
      list.map((item, idx) => (idx === i ? { ...item, ...patch } : item))
    );

  const remove = (i: number) => {
    if (items.length <= 1) {
      toast.error('Cần ít nhất 1 mục');
      return;
    }
    write(list => list.filter((_, idx) => idx !== i));
  };

  const add = () =>
    write(list => [
      ...list,
      {
        key: `svc_${Date.now().toString(36)}`,
        label: 'Mục mới',
        preview: MINT_IMG.painting,
        caption: 'Caption',
      },
    ]);

  return (
    <PopoverTrigger
      label='Danh sách mục'
      preview={`${items.length} mục`}
      width={440}
    >
      <div className='flex max-h-80 flex-col gap-2 overflow-y-auto pr-1'>
        {items.map((item, i) => (
          <div
            key={item.key || i}
            className='flex flex-col gap-1.5 rounded-md border border-neutral-200 bg-white p-2'
          >
            <div className='flex items-center gap-2'>
              <Input
                value={item.label ?? ''}
                onChange={e => update(i, { label: e.target.value })}
                placeholder='Nhãn'
                className='h-8 border-neutral-200 bg-white text-xs font-semibold'
              />
              <button
                type='button'
                onClick={e => {
                  e.preventDefault();
                  e.stopPropagation();
                  remove(i);
                }}
                aria-label={`Xoá mục ${i + 1}`}
                className='flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-md text-rose-500 hover:bg-rose-50'
              >
                <Trash2 className='size-3.5' />
              </button>
            </div>
            <Input
              value={item.caption ?? ''}
              onChange={e => update(i, { caption: e.target.value })}
              placeholder='Caption'
              className='h-8 border-neutral-200 bg-white text-xs'
            />
            <ImagePicker
              value={item.preview ?? ''}
              onChange={url => update(i, { preview: url })}
            />
          </div>
        ))}
      </div>
      <AddRow onAdd={add} label='Thêm mục' />
    </PopoverTrigger>
  );
}

// ─────────────────────────────────────────── COOL HUNTER SECTION PROGRESS

function CoolHunterSectionProgressItemsControls({
  content,
  onContentChange,
}: {
  content: CoolHunterSectionProgressContent;
  onContentChange: (
    next: BlockContent | ((prev: BlockContent) => BlockContent)
  ) => void;
}) {
  const sections = resolveCoolHunterSectionProgressSections(content);

  const write = (
    updater: (
      list: CoolHunterSectionProgressItem[]
    ) => CoolHunterSectionProgressItem[]
  ) => {
    onContentChange(prev => {
      const c = prev as CoolHunterSectionProgressContent;
      const current = resolveCoolHunterSectionProgressSections(c);
      return { ...c, sections: updater(current) } as BlockContent;
    });
  };

  const update = (i: number, patch: Partial<CoolHunterSectionProgressItem>) =>
    write(list =>
      list.map((item, idx) => (idx === i ? { ...item, ...patch } : item))
    );

  const remove = (i: number) => {
    if (sections.length <= 1) {
      toast.error('Cần ít nhất 1 section');
      return;
    }
    write(list => list.filter((_, idx) => idx !== i));
  };

  const add = () =>
    write(list => [
      ...list,
      {
        sectionId: `section-${list.length + 1}`,
        label: `${String(list.length + 1).padStart(2, '0')} - Section mới`,
      },
    ]);

  return (
    <PopoverTrigger
      label='Danh sách section'
      preview={`${sections.length} section`}
      width={420}
    >
      <div className='flex max-h-80 flex-col gap-2 overflow-y-auto pr-1'>
        {sections.map((item, i) => (
          <div
            key={`ch-section-${i}`}
            className='flex flex-col gap-1.5 rounded-md border border-neutral-200 bg-white p-2'
          >
            <div className='flex items-center justify-between gap-2'>
              <span className='text-3xs font-semibold tracking-widest text-neutral-500 uppercase'>
                Section {i + 1}
              </span>
              <button
                type='button'
                onClick={e => {
                  e.preventDefault();
                  e.stopPropagation();
                  remove(i);
                }}
                disabled={sections.length <= 1}
                aria-label={`Xoá section ${i + 1}`}
                className='flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-md text-rose-500 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-40'
              >
                <Trash2 className='size-3.5' />
              </button>
            </div>
            <Input
              value={item.label ?? ''}
              onChange={e => update(i, { label: e.target.value })}
              placeholder='Nhãn (vd: 01 - Welcome)'
              className='h-8 border-neutral-200 bg-white text-xs'
            />
            <Input
              value={item.sectionId ?? ''}
              onChange={e => update(i, { sectionId: e.target.value })}
              placeholder='data-section id (vd: welcome)'
              className='h-8 border-neutral-200 bg-white font-mono text-xs'
            />
          </div>
        ))}
      </div>
      <AddRow onAdd={add} label='Thêm section' />
    </PopoverTrigger>
  );
}

// ─────────────────────────────────────────── BELGO ABOUT PRODUCT · SPECS

function BelgoSpecItemsControls({
  content,
  onContentChange,
}: {
  content: BelgoAboutProductContent;
  onContentChange: (
    next: BlockContent | ((prev: BlockContent) => BlockContent)
  ) => void;
}) {
  const specs = resolveBelgoAboutProductSpecs(content);

  const write = (updater: (list: BelgoSpecItem[]) => BelgoSpecItem[]) => {
    onContentChange(prev => {
      const c = prev as BelgoAboutProductContent;
      return {
        ...c,
        specs: updater(resolveBelgoAboutProductSpecs(c)),
      } as BlockContent;
    });
  };

  const update = (i: number, patch: Partial<BelgoSpecItem>) =>
    write(list =>
      list.map((item, idx) => (idx === i ? { ...item, ...patch } : item))
    );

  const remove = (i: number) => {
    if (specs.length <= 1) {
      toast.error('Cần ít nhất 1 thông số');
      return;
    }
    write(list => list.filter((_, idx) => idx !== i));
  };

  const add = () =>
    write(list => [
      ...list,
      { label: 'NEW', value: '0', unit: '', copy: 'Mô tả thông số.' },
    ]);

  return (
    <PopoverTrigger
      label='Danh sách thông số'
      preview={`${specs.length} thông số`}
      width={420}
    >
      <div className='flex max-h-80 flex-col gap-2 overflow-y-auto pr-1'>
        {specs.map((item, i) => (
          <div
            key={`belgo-spec-${i}`}
            className='flex flex-col gap-1.5 rounded-md border border-neutral-200 bg-white p-2'
          >
            <div className='flex items-center justify-between gap-2'>
              <span className='text-3xs font-semibold tracking-widest text-neutral-500 uppercase'>
                Thông số {i + 1}
              </span>
              <button
                type='button'
                onClick={e => {
                  e.preventDefault();
                  e.stopPropagation();
                  remove(i);
                }}
                disabled={specs.length <= 1}
                aria-label={`Xoá thông số ${i + 1}`}
                className='flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-md text-rose-500 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-40'
              >
                <Trash2 className='size-3.5' />
              </button>
            </div>
            <div className='flex gap-1.5'>
              <Input
                value={item.label ?? ''}
                onChange={e => update(i, { label: e.target.value })}
                placeholder='Nhãn (ABV)'
                className='h-8 border-neutral-200 bg-white text-xs'
              />
              <Input
                value={item.value ?? ''}
                onChange={e => update(i, { value: e.target.value })}
                placeholder='Giá trị (5.1)'
                className='h-8 border-neutral-200 bg-white text-xs'
              />
              <Input
                value={item.unit ?? ''}
                onChange={e => update(i, { unit: e.target.value })}
                placeholder='Đơn vị (%)'
                className='h-8 w-20 shrink-0 border-neutral-200 bg-white text-xs'
              />
            </div>
            <Textarea
              value={item.copy ?? ''}
              onChange={e => update(i, { copy: e.target.value })}
              placeholder='Mô tả'
              rows={2}
              className='border-neutral-200 bg-white text-xs'
            />
          </div>
        ))}
      </div>
      <AddRow onAdd={add} label='Thêm thông số' />
    </PopoverTrigger>
  );
}

// ─────────────────────────────────────────── BELGO FOOTER · LOCATIONS / HEADLINE

function BelgoFooterLocationsControls({
  content,
  onContentChange,
}: {
  content: BelgoFooterContent;
  onContentChange: (
    next: BlockContent | ((prev: BlockContent) => BlockContent)
  ) => void;
}) {
  const locations = resolveBelgoFooterLocations(content);

  const write = (
    updater: (list: BelgoFooterLocation[]) => BelgoFooterLocation[]
  ) => {
    onContentChange(prev => {
      const c = prev as BelgoFooterContent;
      return {
        ...c,
        locations: updater(resolveBelgoFooterLocations(c)),
      } as BlockContent;
    });
  };

  const update = (i: number, patch: Partial<BelgoFooterLocation>) =>
    write(list =>
      list.map((item, idx) => (idx === i ? { ...item, ...patch } : item))
    );

  const remove = (i: number) => {
    if (locations.length <= 1) {
      toast.error('Cần ít nhất 1 chi nhánh');
      return;
    }
    write(list => list.filter((_, idx) => idx !== i));
  };

  const add = () =>
    write(list => [
      ...list,
      { name: 'NEW BRANCH', address: 'A: Address line 1', tel: 'T: +84' },
    ]);

  return (
    <PopoverTrigger
      label='Danh sách chi nhánh'
      preview={`${locations.length} chi nhánh`}
      width={420}
    >
      <div className='flex max-h-80 flex-col gap-2 overflow-y-auto pr-1'>
        {locations.map((item, i) => (
          <div
            key={`belgo-loc-${i}`}
            className='flex flex-col gap-1.5 rounded-md border border-neutral-200 bg-white p-2'
          >
            <div className='flex items-center justify-between gap-2'>
              <span className='text-3xs font-semibold tracking-widest text-neutral-500 uppercase'>
                Chi nhánh {i + 1}
              </span>
              <button
                type='button'
                onClick={e => {
                  e.preventDefault();
                  e.stopPropagation();
                  remove(i);
                }}
                disabled={locations.length <= 1}
                aria-label={`Xoá chi nhánh ${i + 1}`}
                className='flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-md text-rose-500 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-40'
              >
                <Trash2 className='size-3.5' />
              </button>
            </div>
            <Input
              value={item.name ?? ''}
              onChange={e => update(i, { name: e.target.value })}
              placeholder='Tên chi nhánh'
              className='h-8 border-neutral-200 bg-white text-xs'
            />
            <Textarea
              value={item.address ?? ''}
              onChange={e => update(i, { address: e.target.value })}
              placeholder='Địa chỉ (mỗi dòng 1 dòng)'
              rows={2}
              className='border-neutral-200 bg-white text-xs'
            />
            <Input
              value={item.tel ?? ''}
              onChange={e => update(i, { tel: e.target.value })}
              placeholder='Điện thoại'
              className='h-8 border-neutral-200 bg-white text-xs'
            />
          </div>
        ))}
      </div>
      <AddRow onAdd={add} label='Thêm chi nhánh' />
    </PopoverTrigger>
  );
}

function BelgoFooterHeadlineWordsControls({
  content,
  onContentChange,
}: {
  content: BelgoFooterContent;
  onContentChange: (
    next: BlockContent | ((prev: BlockContent) => BlockContent)
  ) => void;
}) {
  const words = resolveBelgoFooterHeadlineWords(content);

  const write = (
    updater: (list: BelgoFooterHeadlineWord[]) => BelgoFooterHeadlineWord[]
  ) => {
    onContentChange(prev => {
      const c = prev as BelgoFooterContent;
      return {
        ...c,
        headlineWords: updater(resolveBelgoFooterHeadlineWords(c)),
      } as BlockContent;
    });
  };

  const update = (i: number, patch: Partial<BelgoFooterHeadlineWord>) =>
    write(list =>
      list.map((item, idx) => (idx === i ? { ...item, ...patch } : item))
    );

  const remove = (i: number) => {
    if (words.length <= 1) {
      toast.error('Cần ít nhất 1 từ headline');
      return;
    }
    write(list => list.filter((_, idx) => idx !== i));
  };

  const add = () => write(list => [...list, { text: 'WORD', accent: false }]);

  return (
    <PopoverTrigger
      label='Headline pin'
      preview={`${words.length} từ`}
      width={360}
    >
      <div className='flex max-h-72 flex-col gap-2 overflow-y-auto pr-1'>
        {words.map((item, i) => (
          <div
            key={`belgo-headline-${i}`}
            className='flex flex-col gap-1.5 rounded-md border border-neutral-200 bg-white p-2'
          >
            <div className='flex items-center justify-between gap-2'>
              <span className='text-3xs font-semibold tracking-widest text-neutral-500 uppercase'>
                Từ {i + 1}
              </span>
              <button
                type='button'
                onClick={e => {
                  e.preventDefault();
                  e.stopPropagation();
                  remove(i);
                }}
                disabled={words.length <= 1}
                aria-label={`Xoá từ ${i + 1}`}
                className='flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-md text-rose-500 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-40'
              >
                <Trash2 className='size-3.5' />
              </button>
            </div>
            <Input
              value={item.text ?? ''}
              onChange={e => update(i, { text: e.target.value })}
              placeholder='Từ headline'
              className='h-8 border-neutral-200 bg-white text-xs'
            />
            <label className='flex cursor-pointer items-center gap-2 text-xs text-neutral-600'>
              <input
                type='checkbox'
                checked={item.accent ?? false}
                onChange={e => update(i, { accent: e.target.checked })}
                className='size-3.5 rounded border-neutral-300'
              />
              Accent trắng (#DRINK)
            </label>
          </div>
        ))}
      </div>
      <AddRow onAdd={add} label='Thêm từ' />
    </PopoverTrigger>
  );
}

function BelgoFooterSocialsControls({
  content,
  onContentChange,
}: {
  content: BelgoFooterContent;
  onContentChange: (
    next: BlockContent | ((prev: BlockContent) => BlockContent)
  ) => void;
}) {
  const socials = resolveBelgoFooterSocials(content);

  const write = (
    updater: (list: BelgoFooterSocial[]) => BelgoFooterSocial[]
  ) => {
    onContentChange(prev => {
      const c = prev as BelgoFooterContent;
      return {
        ...c,
        socials: updater(resolveBelgoFooterSocials(c)),
      } as BlockContent;
    });
  };

  const update = (i: number, patch: Partial<BelgoFooterSocial>) =>
    write(list =>
      list.map((item, idx) => (idx === i ? { ...item, ...patch } : item))
    );

  const remove = (i: number) => {
    if (socials.length <= 1) {
      toast.error('Cần ít nhất 1 icon');
      return;
    }
    write(list => list.filter((_, idx) => idx !== i));
  };

  const add = () =>
    write(list => [
      ...list,
      { platform: 'facebook', href: '#', iconAlt: 'Social' },
    ]);

  return (
    <PopoverTrigger
      label='Thêm / xóa icon'
      preview={`${socials.length} icon · sửa Icon/Link bên dưới`}
      width={360}
    >
      <p className='mb-2 text-[11px] leading-snug text-neutral-500'>
        Upload icon và nhập link ở từng folder <strong>Icon 1, Icon 2…</strong>{' '}
        trong Layers. Ở đây chỉ thêm/xóa icon và chọn glyph mặc định (khi chưa
        upload).
      </p>
      <div className='flex max-h-64 flex-col gap-2 overflow-y-auto pr-1'>
        {socials.map((social, i) => (
          <div
            key={`belgo-social-${i}`}
            className='flex items-center gap-2 rounded-md border border-neutral-200 bg-white p-2'
          >
            <span className='min-w-0 flex-1 text-xs font-medium text-neutral-700'>
              Icon {i + 1}
              {social.iconUrl?.trim() ? ' · đã upload' : ' · glyph mặc định'}
            </span>
            <select
              value={social.platform ?? 'facebook'}
              onChange={e =>
                update(i, {
                  platform: e.target.value as TheGrandFooterSocialPlatform,
                })
              }
              aria-label={`Icon mặc định ${i + 1}`}
              className='h-8 max-w-[9rem] rounded border border-neutral-200 bg-white px-2 text-xs text-neutral-700'
            >
              {SOCIAL_PLATFORM_OPTIONS.map(opt => (
                <option key={opt} value={opt}>
                  {SOCIAL_ICON_MAP[opt].label}
                </option>
              ))}
            </select>
            <button
              type='button'
              onClick={e => {
                e.preventDefault();
                e.stopPropagation();
                remove(i);
              }}
              disabled={socials.length <= 1}
              aria-label={`Xoá icon ${i + 1}`}
              className='flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-md text-rose-500 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-40'
            >
              <Trash2 className='size-3.5' />
            </button>
          </div>
        ))}
      </div>
      <AddRow onAdd={add} label='Thêm icon' />
    </PopoverTrigger>
  );
}

function BelgoFlavorItemsControls({
  content,
  onContentChange,
}: {
  content: BelgoMoreFlavorsContent;
  onContentChange: (
    next: BlockContent | ((prev: BlockContent) => BlockContent)
  ) => void;
}) {
  const flavors = resolveBelgoMoreFlavors(content);

  const write = (updater: (list: BelgoFlavorItem[]) => BelgoFlavorItem[]) => {
    onContentChange(prev => {
      const c = prev as BelgoMoreFlavorsContent;
      return {
        ...c,
        flavors: updater(resolveBelgoMoreFlavors(c)),
      } as BlockContent;
    });
  };

  const update = (i: number, patch: Partial<BelgoFlavorItem>) =>
    write(list =>
      list.map((item, idx) => (idx === i ? { ...item, ...patch } : item))
    );

  const remove = (i: number) => {
    if (flavors.length <= 1) {
      toast.error('Cần ít nhất 1 hương vị');
      return;
    }
    write(list => list.filter((_, idx) => idx !== i));
  };

  const add = () =>
    write(list => [
      ...list,
      {
        key: `flavor-${list.length + 1}`,
        name: 'NEW FLAVOR',
        color: BELGO_DEFAULT_FLAVORS[0]?.color ?? '#F5B301',
        bgImageUrl: '',
        bottleImageUrl: '',
        glassImageUrl: '',
      },
    ]);

  return (
    <PopoverTrigger
      label='Danh sách hương vị'
      preview={`${flavors.length} hương vị`}
      width={460}
    >
      <div className='flex max-h-96 flex-col gap-2 overflow-y-auto pr-1'>
        {flavors.map((item, i) => (
          <div
            key={`belgo-flavor-${i}`}
            className='flex flex-col gap-1.5 rounded-md border border-neutral-200 bg-white p-2'
          >
            <div className='flex items-center justify-between gap-2'>
              <span className='text-3xs font-semibold tracking-widest text-neutral-500 uppercase'>
                Hương vị {i + 1}
              </span>
              <button
                type='button'
                onClick={e => {
                  e.preventDefault();
                  e.stopPropagation();
                  remove(i);
                }}
                disabled={flavors.length <= 1}
                aria-label={`Xoá hương vị ${i + 1}`}
                className='flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-md text-rose-500 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-40'
              >
                <Trash2 className='size-3.5' />
              </button>
            </div>
            <Input
              value={item.name ?? ''}
              onChange={e => update(i, { name: e.target.value })}
              placeholder='Tên (BLONDE)'
              className='h-8 border-neutral-200 bg-white text-xs'
            />
            <Input
              value={item.color ?? ''}
              onChange={e => update(i, { color: e.target.value })}
              placeholder='Màu (#F5B301)'
              className='h-8 border-neutral-200 bg-white text-xs'
            />
            <Input
              value={item.key ?? ''}
              onChange={e => update(i, { key: e.target.value })}
              placeholder='Key slug (blonde)'
              className='h-8 border-neutral-200 bg-white text-xs'
            />
            <span className='text-3xs font-semibold tracking-widest text-neutral-500 uppercase'>
              Nền
            </span>
            <ImagePicker
              value={item.bgImageUrl ?? ''}
              onChange={url => update(i, { bgImageUrl: url })}
            />
            <span className='text-3xs font-semibold tracking-widest text-neutral-500 uppercase'>
              Chai
            </span>
            <ImagePicker
              value={item.bottleImageUrl ?? ''}
              onChange={url => update(i, { bottleImageUrl: url })}
            />
            <span className='text-3xs font-semibold tracking-widest text-neutral-500 uppercase'>
              Ly
            </span>
            <ImagePicker
              value={item.glassImageUrl ?? ''}
              onChange={url => update(i, { glassImageUrl: url })}
            />
          </div>
        ))}
      </div>
      <AddRow onAdd={add} label='Thêm hương vị' />
    </PopoverTrigger>
  );
}

// ─────────────────────────────────────────── FRAMER BUNGEE HERO V2 · CARD IMAGES

function FramerBungeeHeroV2CardImagesControls({
  content,
  onContentChange,
}: {
  content: FramerBungeeHeroV2Content;
  onContentChange: (
    next: BlockContent | ((prev: BlockContent) => BlockContent)
  ) => void;
}) {
  const cards = resolveFramerBungeeHeroV2CardImages(content);

  const write = (
    updater: (list: FramerBungeeHeroV2Card[]) => FramerBungeeHeroV2Card[]
  ) => {
    onContentChange(prev => {
      const c = prev as FramerBungeeHeroV2Content;
      const current = resolveFramerBungeeHeroV2CardImages(c);
      return { ...c, cardImages: updater(current) } as BlockContent;
    });
  };

  const update = (i: number, patch: Partial<FramerBungeeHeroV2Card>) =>
    write(list =>
      list.map((card, idx) => (idx === i ? { ...card, ...patch } : card))
    );

  const setImage = (i: number, url: string) =>
    update(i, { imageUrl: url, videoUrl: '' });

  const setVideo = (i: number, url: string) =>
    update(i, { videoUrl: url, imageUrl: '' });

  const remove = (i: number) => {
    if (cards.length <= 1) {
      toast.error('Cần ít nhất 1 thẻ');
      return;
    }
    write(list => list.filter((_, idx) => idx !== i));
  };

  const add = () =>
    write(list => [
      ...list,
      {
        imageUrl:
          FRAMER_BUNGEE_HERO_V2_DEFAULT_CARDS[0]?.imageUrl ??
          'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=70',
      },
    ]);

  return (
    <PopoverTrigger
      label='Dải marquee'
      preview={`${cards.length} thẻ`}
      width={460}
    >
      <div className='flex max-h-80 flex-col gap-2 overflow-y-auto pr-1'>
        {cards.map((card, i) => (
          <div
            key={`bungee-v2-card-${i}`}
            className='flex flex-col gap-1.5 rounded-md border border-neutral-200 bg-white p-2'
          >
            <div className='flex items-center justify-between gap-2'>
              <span className='text-3xs font-semibold tracking-widest text-neutral-500 uppercase'>
                Thẻ {i + 1}
              </span>
              <button
                type='button'
                onClick={e => {
                  e.preventDefault();
                  e.stopPropagation();
                  remove(i);
                }}
                disabled={cards.length <= 1}
                aria-label={`Xoá thẻ ${i + 1}`}
                className='flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-md text-rose-500 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-40'
              >
                <Trash2 className='size-3.5' />
              </button>
            </div>
            <ImagePicker
              value={card.imageUrl ?? ''}
              onChange={url => setImage(i, url)}
            />
            <ImagePicker
              value={card.videoUrl ?? ''}
              accept='image/*,video/mp4,video/webm,video/quicktime'
              onChange={url => setVideo(i, url)}
            />
          </div>
        ))}
      </div>
      <AddRow onAdd={add} label='Thêm thẻ' />
    </PopoverTrigger>
  );
}

// ─────────────────────────────────────────── COOL HUNTER GALLERY ITEMS

function CoolHunterGalleryItemsControls({
  content,
  onContentChange,
}: {
  content: CoolHunterGalleryContent;
  onContentChange: (
    next: BlockContent | ((prev: BlockContent) => BlockContent)
  ) => void;
}) {
  const items = resolveCoolHunterGalleryItems(content);

  const write = (
    updater: (list: CoolHunterGalleryItem[]) => CoolHunterGalleryItem[]
  ) => {
    onContentChange(prev => {
      const c = prev as CoolHunterGalleryContent;
      const current = resolveCoolHunterGalleryItems(c);
      return { ...c, items: updater(current) } as BlockContent;
    });
  };

  const update = (i: number, patch: Partial<CoolHunterGalleryItem>) =>
    write(list =>
      list.map((item, idx) => (idx === i ? { ...item, ...patch } : item))
    );

  const remove = (i: number) => {
    if (items.length <= 1) {
      toast.error('Cần ít nhất 1 ảnh');
      return;
    }
    write(list => list.filter((_, idx) => idx !== i));
  };

  const add = () =>
    write(list => [
      ...list,
      {
        imageUrl: COOL_HUNTER_GALLERY_DEFAULT_ITEMS[0]?.imageUrl ?? '',
        imageAlt: '',
        text: 'Caption mới.',
      },
    ]);

  return (
    <PopoverTrigger
      label='Danh sách ảnh'
      preview={`${items.length} ảnh`}
      width={460}
    >
      <div className='flex max-h-80 flex-col gap-2 overflow-y-auto pr-1'>
        {items.map((item, i) => (
          <div
            key={`ch-gallery-${i}`}
            className='flex flex-col gap-1.5 rounded-md border border-neutral-200 bg-white p-2'
          >
            <div className='flex items-center justify-between gap-2'>
              <span className='text-3xs font-semibold tracking-widest text-neutral-500 uppercase'>
                Ảnh {i + 1}
              </span>
              <button
                type='button'
                onClick={e => {
                  e.preventDefault();
                  e.stopPropagation();
                  remove(i);
                }}
                disabled={items.length <= 1}
                aria-label={`Xoá ảnh ${i + 1}`}
                className='flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-md text-rose-500 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-40'
              >
                <Trash2 className='size-3.5' />
              </button>
            </div>
            <ImagePicker
              value={item.imageUrl ?? ''}
              onChange={url => update(i, { imageUrl: url })}
            />
            <Input
              value={item.imageAlt ?? ''}
              onChange={e => update(i, { imageAlt: e.target.value })}
              placeholder='Alt ảnh'
              className='h-8 border-neutral-200 bg-white text-xs'
            />
            <Textarea
              value={item.text ?? ''}
              onChange={e => update(i, { text: e.target.value })}
              placeholder='Caption'
              rows={3}
              className='min-h-0 border-neutral-200 bg-white text-xs'
            />
          </div>
        ))}
      </div>
      <AddRow onAdd={add} label='Thêm ảnh' />
    </PopoverTrigger>
  );
}

// ─────────────────────────────────────────── LETTER SLIDER SLIDES

function LetterSliderSlidesControls({
  content,
  onContentChange,
}: {
  content: LetterSliderContent;
  onContentChange: (
    next: BlockContent | ((prev: BlockContent) => BlockContent)
  ) => void;
}) {
  const slides = resolveLetterSliderSlides(content);

  const write = (
    updater: (list: LetterSliderSlide[]) => LetterSliderSlide[]
  ) => {
    onContentChange(prev => {
      const c = prev as LetterSliderContent;
      const current = resolveLetterSliderSlides(c);
      return { ...c, slides: updater(current) } as BlockContent;
    });
  };

  const update = (i: number, patch: Partial<LetterSliderSlide>) =>
    write(list =>
      list.map((item, idx) => (idx === i ? { ...item, ...patch } : item))
    );

  const remove = (i: number) => {
    if (slides.length <= 1) {
      toast.error('Cần ít nhất 1 slide');
      return;
    }
    write(list => list.filter((_, idx) => idx !== i));
  };

  const add = () =>
    write(list => [
      ...list,
      {
        title: 'new product',
        imageUrl: LETTER_SLIDER_DEFAULT_SLIDES[0]?.imageUrl ?? '',
        imageAlt: '',
      },
    ]);

  return (
    <PopoverTrigger
      label='Danh sách slide'
      preview={`${slides.length} slide`}
      width={420}
    >
      <div className='flex max-h-80 flex-col gap-2 overflow-y-auto pr-1'>
        {slides.map((slide, i) => (
          <div
            key={`ls-slide-${i}`}
            className='flex flex-col gap-1.5 rounded-md border border-neutral-200 bg-white p-2'
          >
            <div className='flex items-center justify-between gap-2'>
              <span className='text-3xs font-semibold tracking-widest text-neutral-500 uppercase'>
                Slide {i + 1}
              </span>
              <button
                type='button'
                onClick={e => {
                  e.preventDefault();
                  e.stopPropagation();
                  remove(i);
                }}
                disabled={slides.length <= 1}
                aria-label={`Xoá slide ${i + 1}`}
                className='flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-md text-rose-500 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-40'
              >
                <Trash2 className='size-3.5' />
              </button>
            </div>
            <Input
              value={slide.title ?? ''}
              onChange={e => update(i, { title: e.target.value })}
              placeholder='Tên sản phẩm'
              className='h-8 border-neutral-200 bg-white text-xs'
            />
            <ImagePicker
              value={slide.imageUrl ?? ''}
              onChange={url => update(i, { imageUrl: url })}
            />
          </div>
        ))}
      </div>
      <AddRow onAdd={add} label='Thêm slide' />
    </PopoverTrigger>
  );
}

// ─────────────────────────────────────────── CG MODULAR SLIDER SLIDES

function CgModularSliderSlidesControls({
  content,
  onContentChange,
}: {
  content: CgModularSliderContent;
  onContentChange: (
    next: BlockContent | ((prev: BlockContent) => BlockContent)
  ) => void;
}) {
  const slides = resolveCgModularSliderSlides(content);

  const write = (
    updater: (list: CgModularSliderSlide[]) => CgModularSliderSlide[]
  ) => {
    onContentChange(prev => {
      const c = prev as CgModularSliderContent;
      const current = resolveCgModularSliderSlides(c);
      return { ...c, slides: updater(current) } as BlockContent;
    });
  };

  const update = (i: number, patch: Partial<CgModularSliderSlide>) =>
    write(list =>
      list.map((item, idx) => (idx === i ? { ...item, ...patch } : item))
    );

  const remove = (i: number) => {
    if (slides.length <= 1) {
      toast.error('Cần ít nhất 1 slide');
      return;
    }
    write(list => list.filter((_, idx) => idx !== i));
  };

  const add = () =>
    write(list => [
      ...list,
      {
        title: 'New Slide',
        imageUrl: CG_MODULAR_SLIDER_DEFAULT_SLIDES[0]?.imageUrl ?? '',
        imageAlt: '',
      },
    ]);

  return (
    <PopoverTrigger
      label='Danh sách slide'
      preview={`${slides.length} slide`}
      width={420}
    >
      <div className='flex max-h-80 flex-col gap-2 overflow-y-auto pr-1'>
        {slides.map((slide, i) => (
          <div
            key={`cms-slide-${i}`}
            className='flex flex-col gap-1.5 rounded-md border border-neutral-200 bg-white p-2'
          >
            <div className='flex items-center justify-between gap-2'>
              <span className='text-3xs font-semibold tracking-widest text-neutral-500 uppercase'>
                Slide {i + 1}
              </span>
              <button
                type='button'
                onClick={e => {
                  e.preventDefault();
                  e.stopPropagation();
                  remove(i);
                }}
                disabled={slides.length <= 1}
                aria-label={`Xoá slide ${i + 1}`}
                className='flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-md text-rose-500 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-40'
              >
                <Trash2 className='size-3.5' />
              </button>
            </div>
            <Input
              value={slide.title ?? ''}
              onChange={e => update(i, { title: e.target.value })}
              placeholder='Tiêu đề'
              className='h-8 border-neutral-200 bg-white text-xs'
            />
            <ImagePicker
              value={slide.imageUrl ?? ''}
              onChange={url => update(i, { imageUrl: url })}
            />
          </div>
        ))}
      </div>
      <AddRow onAdd={add} label='Thêm slide' />
    </PopoverTrigger>
  );
}

function CgResponsiveTeamMembersControls({
  content,
  onContentChange,
}: {
  content: CgResponsiveTeamContent;
  onContentChange: (
    next: BlockContent | ((prev: BlockContent) => BlockContent)
  ) => void;
}) {
  const members = resolveCgResponsiveTeamMembers(content);

  const write = (
    updater: (list: CgResponsiveTeamMember[]) => CgResponsiveTeamMember[]
  ) => {
    onContentChange(prev => {
      const c = prev as CgResponsiveTeamContent;
      const current = resolveCgResponsiveTeamMembers(c);
      return { ...c, members: updater(current) } as BlockContent;
    });
  };

  const update = (i: number, patch: Partial<CgResponsiveTeamMember>) =>
    write(list =>
      list.map((item, idx) => (idx === i ? { ...item, ...patch } : item))
    );

  const remove = (i: number) => {
    if (members.length <= 1) {
      toast.error('Cần ít nhất 1 thành viên');
      return;
    }
    write(list => list.filter((_, idx) => idx !== i));
  };

  const add = () =>
    write(list => [
      ...list,
      {
        name: 'New Member',
        role: 'Role',
        imageUrl: CG_RESPONSIVE_TEAM_DEFAULT_MEMBERS[0]?.imageUrl ?? '',
        imageAlt: '',
        bgColor:
          CG_RESPONSIVE_TEAM_DEFAULT_MEMBERS[
            list.length % CG_RESPONSIVE_TEAM_DEFAULT_MEMBERS.length
          ]?.bgColor,
      },
    ]);

  return (
    <PopoverTrigger
      label='Danh sách thành viên'
      preview={`${members.length} thành viên`}
      width={420}
    >
      <div className='flex max-h-80 flex-col gap-2 overflow-y-auto pr-1'>
        {members.map((member, i) => (
          <div
            key={`crt-member-${i}`}
            className='flex flex-col gap-1.5 rounded-md border border-neutral-200 bg-white p-2'
          >
            <div className='flex items-center justify-between gap-2'>
              <span className='text-3xs font-semibold tracking-widest text-neutral-500 uppercase'>
                TV {i + 1}
              </span>
              <button
                type='button'
                onClick={e => {
                  e.preventDefault();
                  e.stopPropagation();
                  remove(i);
                }}
                disabled={members.length <= 1}
                aria-label={`Xoá thành viên ${i + 1}`}
                className='flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-md text-rose-500 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-40'
              >
                <Trash2 className='size-3.5' />
              </button>
            </div>
            <Input
              value={member.name ?? ''}
              onChange={e => update(i, { name: e.target.value })}
              placeholder='Tên'
              className='h-8 border-neutral-200 bg-white text-xs'
            />
            <Input
              value={member.role ?? ''}
              onChange={e => update(i, { role: e.target.value })}
              placeholder='Vai trò'
              className='h-8 border-neutral-200 bg-white text-xs'
            />
            <ImagePicker
              value={member.imageUrl ?? ''}
              onChange={url => update(i, { imageUrl: url })}
            />
          </div>
        ))}
      </div>
      <AddRow onAdd={add} label='Thêm thành viên' />
    </PopoverTrigger>
  );
}

function Cg3dSliderSlidesControls({
  content,
  onContentChange,
}: {
  content: Cg3dSliderContent;
  onContentChange: (
    next: BlockContent | ((prev: BlockContent) => BlockContent)
  ) => void;
}) {
  const slides = resolveCg3dSliderSlides(content);

  const write = (updater: (list: Cg3dSliderSlide[]) => Cg3dSliderSlide[]) => {
    onContentChange(prev => {
      const c = prev as Cg3dSliderContent;
      const current = resolveCg3dSliderSlides(c);
      return { ...c, slides: updater(current) } as BlockContent;
    });
  };

  const update = (i: number, patch: Partial<Cg3dSliderSlide>) =>
    write(list =>
      list.map((item, idx) => (idx === i ? { ...item, ...patch } : item))
    );

  const remove = (i: number) => {
    if (slides.length <= 1) {
      toast.error('Cần ít nhất 1 slide');
      return;
    }
    write(list => list.filter((_, idx) => idx !== i));
  };

  const add = () =>
    write(list => [
      ...list,
      {
        title: 'New Slide',
        imageUrl: CG_3D_SLIDER_DEFAULT_SLIDES[0]?.imageUrl ?? '',
        imageAlt: '',
      },
    ]);

  return (
    <PopoverTrigger
      label='Danh sách slide'
      preview={`${slides.length} slide`}
      width={420}
    >
      <div className='flex max-h-80 flex-col gap-2 overflow-y-auto pr-1'>
        {slides.map((slide, i) => (
          <div
            key={`c3d-slide-${i}`}
            className='flex flex-col gap-1.5 rounded-md border border-neutral-200 bg-white p-2'
          >
            <div className='flex items-center justify-between gap-2'>
              <span className='text-3xs font-semibold tracking-widest text-neutral-500 uppercase'>
                Slide {i + 1}
              </span>
              <button
                type='button'
                onClick={e => {
                  e.preventDefault();
                  e.stopPropagation();
                  remove(i);
                }}
                disabled={slides.length <= 1}
                aria-label={`Xoá slide ${i + 1}`}
                className='flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-md text-rose-500 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-40'
              >
                <Trash2 className='size-3.5' />
              </button>
            </div>
            <Input
              value={slide.title ?? ''}
              onChange={e => update(i, { title: e.target.value })}
              placeholder='Tiêu đề'
              className='h-8 border-neutral-200 bg-white text-xs'
            />
            <ImagePicker
              value={slide.imageUrl ?? ''}
              onChange={url => update(i, { imageUrl: url })}
            />
          </div>
        ))}
      </div>
      <AddRow onAdd={add} label='Thêm slide' />
    </PopoverTrigger>
  );
}

// ─────────────────────────────────────────── SCROLL IMG SCALE ITEMS

function ScrollImgScaleItemsControls({
  content,
  onContentChange,
}: {
  content: ScrollImgScaleContent;
  onContentChange: (
    next: BlockContent | ((prev: BlockContent) => BlockContent)
  ) => void;
}) {
  const items = resolveScrollImgScaleItems(content);

  const write = (
    updater: (list: ScrollImgScaleItem[]) => ScrollImgScaleItem[]
  ) => {
    onContentChange(prev => {
      const c = prev as ScrollImgScaleContent;
      const current = resolveScrollImgScaleItems(c);
      return { ...c, items: updater(current) } as BlockContent;
    });
  };

  const update = (i: number, patch: Partial<ScrollImgScaleItem>) =>
    write(list =>
      list.map((item, idx) => (idx === i ? { ...item, ...patch } : item))
    );

  const remove = (i: number) => {
    if (items.length <= 1) {
      toast.error('Cần ít nhất 1 mục');
      return;
    }
    write(list => list.filter((_, idx) => idx !== i));
  };

  const add = () =>
    write(list => [
      ...list,
      {
        title: 'New Title',
        imageUrl: SCROLL_IMG_SCALE_DEFAULT_ITEMS[0]?.imageUrl ?? '',
        imageAlt: '',
      },
    ]);

  return (
    <PopoverTrigger
      label='Danh sách mục'
      preview={`${items.length} mục`}
      width={420}
    >
      <div className='flex max-h-80 flex-col gap-2 overflow-y-auto pr-1'>
        {items.map((item, i) => (
          <div
            key={`sis-item-${i}`}
            className='flex flex-col gap-1.5 rounded-md border border-neutral-200 bg-white p-2'
          >
            <div className='flex items-center justify-between gap-2'>
              <span className='text-3xs font-semibold tracking-widest text-neutral-500 uppercase'>
                Mục {i + 1}
              </span>
              <button
                type='button'
                onClick={e => {
                  e.preventDefault();
                  e.stopPropagation();
                  remove(i);
                }}
                disabled={items.length <= 1}
                aria-label={`Xoá mục ${i + 1}`}
                className='flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-md text-rose-500 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-40'
              >
                <Trash2 className='size-3.5' />
              </button>
            </div>
            <Input
              value={item.title ?? ''}
              onChange={e => update(i, { title: e.target.value })}
              placeholder='Tiêu đề'
              className='h-8 border-neutral-200 bg-white text-xs'
            />
            <ImagePicker
              value={item.imageUrl ?? ''}
              onChange={url => update(i, { imageUrl: url })}
            />
            <Input
              value={item.imageAlt ?? ''}
              onChange={e => update(i, { imageAlt: e.target.value })}
              placeholder='Alt ảnh'
              className='h-8 border-neutral-200 bg-white text-xs'
            />
          </div>
        ))}
      </div>
      <AddRow onAdd={add} label='Thêm mục' />
    </PopoverTrigger>
  );
}

function CgRadgaHorizontalSlidesControls({
  content,
  onContentChange,
}: {
  content: CgRadgaHorizontalContent;
  onContentChange: (
    next: BlockContent | ((prev: BlockContent) => BlockContent)
  ) => void;
}) {
  const slides = resolveCgRadgaHorizontalSlides(content);

  const write = (
    updater: (list: CgRadgaHorizontalSlide[]) => CgRadgaHorizontalSlide[]
  ) => {
    onContentChange(prev => {
      const c = prev as CgRadgaHorizontalContent;
      const current = resolveCgRadgaHorizontalSlides(c);
      return { ...c, slides: updater(current) } as BlockContent;
    });
  };

  const update = (i: number, patch: Partial<CgRadgaHorizontalSlide>) =>
    write(list =>
      list.map((slide, idx) => (idx === i ? { ...slide, ...patch } : slide))
    );

  const remove = (i: number) => {
    if (slides.length <= 1) {
      toast.error('Cần ít nhất 1 slide');
      return;
    }
    write(list => list.filter((_, idx) => idx !== i));
  };

  const add = () =>
    write(list => [
      ...list,
      {
        titleLine1: 'New Title',
        titleLine2: 'Subtitle',
        imageUrl: CG_RADGA_HORIZONTAL_DEFAULT_SLIDES[0]?.imageUrl ?? '',
        imageAlt: '',
      },
    ]);

  return (
    <PopoverTrigger
      label='Danh sách slide'
      preview={`${slides.length} slide`}
      width={420}
    >
      <div className='flex max-h-80 flex-col gap-2 overflow-y-auto pr-1'>
        {slides.map((slide, i) => (
          <div
            key={`crh-slide-${i}`}
            className='flex flex-col gap-1.5 rounded-md border border-neutral-200 bg-white p-2'
          >
            <div className='flex items-center justify-between gap-2'>
              <span className='text-3xs font-semibold tracking-widest text-neutral-500 uppercase'>
                Slide {i + 1}
              </span>
              <button
                type='button'
                onClick={e => {
                  e.preventDefault();
                  e.stopPropagation();
                  remove(i);
                }}
                disabled={slides.length <= 1}
                aria-label={`Xoá slide ${i + 1}`}
                className='flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-md text-rose-500 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-40'
              >
                <Trash2 className='size-3.5' />
              </button>
            </div>
            <Input
              value={slide.titleLine1 ?? ''}
              onChange={e => update(i, { titleLine1: e.target.value })}
              placeholder='Dòng tiêu đề 1'
              className='h-8 border-neutral-200 bg-white text-xs'
            />
            <Input
              value={slide.titleLine2 ?? ''}
              onChange={e => update(i, { titleLine2: e.target.value })}
              placeholder='Dòng tiêu đề 2'
              className='h-8 border-neutral-200 bg-white text-xs'
            />
            <ImagePicker
              value={slide.imageUrl ?? ''}
              onChange={url => update(i, { imageUrl: url })}
            />
            <Input
              value={slide.imageAlt ?? ''}
              onChange={e => update(i, { imageAlt: e.target.value })}
              placeholder='Alt ảnh'
              className='h-8 border-neutral-200 bg-white text-xs'
            />
          </div>
        ))}
      </div>
      <AddRow onAdd={add} label='Thêm slide' />
    </PopoverTrigger>
  );
}

// ───────────────────────────────────────── CG PAGE TRANSITIONS · PAGES

function CgPageTransitionsPagesControls({
  content,
  onContentChange,
}: {
  content: CgPageTransitionsContent;
  onContentChange: (
    next: BlockContent | ((prev: BlockContent) => BlockContent)
  ) => void;
}) {
  const pages = resolveCgPageTransitionsPages(content);

  const write = (
    updater: (list: CgPageTransitionsPage[]) => CgPageTransitionsPage[]
  ) => {
    onContentChange(prev => {
      const c = prev as CgPageTransitionsContent;
      const current = resolveCgPageTransitionsPages(c);
      return { ...c, pages: updater(current) } as BlockContent;
    });
  };

  const update = (i: number, patch: Partial<CgPageTransitionsPage>) =>
    write(list =>
      list.map((page, idx) => (idx === i ? { ...page, ...patch } : page))
    );

  const remove = (i: number) => {
    if (pages.length <= 1) {
      toast.error('Cần ít nhất 1 trang');
      return;
    }
    write(list => list.filter((_, idx) => idx !== i));
  };

  const add = () =>
    write(list => [
      ...list,
      {
        navLabel: 'Page',
        title: CG_PAGE_TRANSITIONS_DEFAULT_PAGES[0]?.title ?? 'Index',
      },
    ]);

  return (
    <PopoverTrigger
      label='Danh sách trang'
      preview={`${pages.length} trang`}
      width={360}
    >
      <div className='flex max-h-80 flex-col gap-2 overflow-y-auto pr-1'>
        {pages.map((page, i) => (
          <div
            key={`cpt-page-${i}`}
            className='flex flex-col gap-1.5 rounded-md border border-neutral-200 bg-white p-2'
          >
            <div className='flex items-center justify-between gap-2'>
              <span className='text-3xs font-semibold tracking-widest text-neutral-500 uppercase'>
                Trang {i + 1}
              </span>
              <button
                type='button'
                onClick={e => {
                  e.preventDefault();
                  e.stopPropagation();
                  remove(i);
                }}
                disabled={pages.length <= 1}
                aria-label={`Xoá trang ${i + 1}`}
                className='flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-md text-rose-500 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-40'
              >
                <Trash2 className='size-3.5' />
              </button>
            </div>
            <Input
              value={page.navLabel ?? ''}
              onChange={e => update(i, { navLabel: e.target.value })}
              placeholder='Nav label'
              className='h-8 border-neutral-200 bg-white text-xs'
            />
            <Input
              value={page.title ?? ''}
              onChange={e => update(i, { title: e.target.value })}
              placeholder='Tiêu đề hero'
              className='h-8 border-neutral-200 bg-white text-xs'
            />
          </div>
        ))}
      </div>
      <AddRow onAdd={add} label='Thêm trang' />
    </PopoverTrigger>
  );
}

// ───────────────────────────────────────── FRAMER IGNITEX STEP · STEP CARDS

/**
 * List manager cho `framer_ignitex_step.cards` — title + body + ảnh minh hoạ.
 * Ghi trọn `cards[]` (resolve gộp cả legacy card1/2/3) và xoá key phẳng cũ,
 * nên lần thêm/xoá đầu tiên cũng chính là bước migrate content legacy.
 */
function FramerIgnitexStepCardsControls({
  content,
  onContentChange,
}: {
  content: FramerIgnitexStepContent;
  onContentChange: (
    next: BlockContent | ((prev: BlockContent) => BlockContent)
  ) => void;
}) {
  const cards = resolveFramerIgnitexStepCards(content);

  const write = (
    updater: (list: FramerIgnitexStepCard[]) => FramerIgnitexStepCard[]
  ) => {
    onContentChange(prev => {
      const c = prev as FramerIgnitexStepContent;
      const current = resolveFramerIgnitexStepCards(c);
      const next = {
        ...c,
        cards: updater(current),
      } as FramerIgnitexStepContent;
      // Bỏ flat legacy để `resolve` không còn 2 nguồn sự thật.
      delete next.card1Title;
      delete next.card1Body;
      delete next.card1MainImageUrl;
      delete next.card2Title;
      delete next.card2Body;
      delete next.card2MainImageUrl;
      delete next.card3Title;
      delete next.card3Body;
      delete next.card3MainImageUrl;
      return next as BlockContent;
    });
  };

  const update = (i: number, patch: Partial<FramerIgnitexStepCard>) =>
    write(list =>
      list.map((card, idx) => (idx === i ? { ...card, ...patch } : card))
    );

  const remove = (i: number) => {
    if (cards.length <= 1) {
      toast.error('Cần ít nhất 1 card');
      return;
    }
    write(list => list.filter((_, idx) => idx !== i));
  };

  const add = () =>
    write(list => [...list, { ...FRAMER_IGNITEX_STEP_BLANK_CARD }]);

  return (
    <PopoverTrigger
      label='Danh sách card'
      preview={`${cards.length} card`}
      width={440}
    >
      <div className='flex max-h-80 flex-col gap-2 overflow-y-auto pr-1'>
        {cards.map((card, i) => (
          <div
            key={`ignitex-card-${i}`}
            className='flex flex-col gap-1.5 rounded-md border border-neutral-200 bg-white p-2'
          >
            <div className='flex items-center justify-between gap-2'>
              <span className='text-3xs font-semibold tracking-widest text-neutral-500 uppercase'>
                Card {i + 1}
              </span>
              <button
                type='button'
                onClick={e => {
                  e.preventDefault();
                  e.stopPropagation();
                  remove(i);
                }}
                disabled={cards.length <= 1}
                aria-label={`Xoá card ${i + 1}`}
                className='flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-md text-rose-500 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-40'
              >
                <Trash2 className='size-3.5' />
              </button>
            </div>
            <Input
              value={card.title ?? ''}
              onChange={e => update(i, { title: e.target.value })}
              placeholder='Title'
              className='h-8 border-neutral-200 bg-white text-xs font-semibold'
            />
            <Textarea
              value={card.body ?? ''}
              onChange={e => update(i, { body: e.target.value })}
              placeholder='Body'
              rows={3}
              className='min-h-0 border-neutral-200 bg-white text-xs'
            />
            <ImagePicker
              value={card.mainImageUrl ?? ''}
              onChange={url => update(i, { mainImageUrl: url })}
            />
          </div>
        ))}
      </div>
      <AddRow onAdd={add} label='Thêm card' />
    </PopoverTrigger>
  );
}

// ─────────────────────────────────── FRAMER CLARITY SERVICES · SERVICE ITEMS

/**
 * List manager cho `framer_clarity_services.services` — icon + tiêu đề + mô tả.
 * Grid chia 2 card / hàng (ảnh giữa span hết hàng) nên thêm/xoá tự giãn số hàng.
 */
function FramerClarityServicesItemsControls({
  content,
  onContentChange,
}: {
  content: FramerClarityServicesContent;
  onContentChange: (
    next: BlockContent | ((prev: BlockContent) => BlockContent)
  ) => void;
}) {
  const items = resolveFramerClarityServices(content);

  const write = (
    updater: (list: FramerClarityServiceItem[]) => FramerClarityServiceItem[]
  ) => {
    onContentChange(prev => {
      const c = prev as FramerClarityServicesContent;
      const current = resolveFramerClarityServices(c);
      return { ...c, services: updater(current) } as BlockContent;
    });
  };

  const update = (i: number, patch: Partial<FramerClarityServiceItem>) =>
    write(list =>
      list.map((item, idx) => (idx === i ? { ...item, ...patch } : item))
    );

  const remove = (i: number) => {
    if (items.length <= 1) {
      toast.error('Cần ít nhất 1 dịch vụ');
      return;
    }
    write(list => list.filter((_, idx) => idx !== i));
  };

  const add = () =>
    write(list => [...list, { ...FRAMER_CLARITY_SERVICE_NEW_ITEM }]);

  return (
    <PopoverTrigger
      label='Danh sách dịch vụ'
      preview={`${items.length} dịch vụ`}
      width={420}
    >
      <div className='flex max-h-80 flex-col gap-2 overflow-y-auto pr-1'>
        {items.map((item, i) => (
          <div
            key={`clarity-service-${i}`}
            className='flex flex-col gap-1.5 rounded-md border border-neutral-200 bg-white p-2'
          >
            <div className='flex items-center justify-between gap-2'>
              <span className='text-3xs font-semibold tracking-widest text-neutral-500 uppercase'>
                Dịch vụ {i + 1}
              </span>
              <button
                type='button'
                onClick={e => {
                  e.preventDefault();
                  e.stopPropagation();
                  remove(i);
                }}
                disabled={items.length <= 1}
                aria-label={`Xoá dịch vụ ${i + 1}`}
                className='flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-md text-rose-500 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-40'
              >
                <Trash2 className='size-3.5' />
              </button>
            </div>
            <Input
              value={item.title ?? ''}
              onChange={e => update(i, { title: e.target.value })}
              placeholder='Tiêu đề'
              className='h-8 border-neutral-200 bg-white text-xs'
            />
            <Textarea
              value={item.description ?? ''}
              onChange={e => update(i, { description: e.target.value })}
              placeholder='Mô tả'
              rows={2}
              className='min-h-0 border-neutral-200 bg-white text-xs'
            />
            <ImagePicker
              value={item.iconUrl ?? ''}
              onChange={url => update(i, { iconUrl: url })}
            />
          </div>
        ))}
      </div>
      <AddRow onAdd={add} label='Thêm dịch vụ' />
    </PopoverTrigger>
  );
}

// ─────────────────────────────────────────── SUSTAINIT OUR EXPERTISE · ITEMS

function SustainitOurExpertiseItemsControls({
  content,
  onContentChange,
}: {
  content: SustainitOurExpertiseContent;
  onContentChange: (
    next: BlockContent | ((prev: BlockContent) => BlockContent)
  ) => void;
}) {
  const items = resolveSustainitOurExpertiseItems(content);

  const write = (
    updater: (list: SustainitExpertiseItem[]) => SustainitExpertiseItem[]
  ) => {
    onContentChange(prev => {
      const c = prev as SustainitOurExpertiseContent;
      const current = resolveSustainitOurExpertiseItems(c);
      return { ...c, items: updater(current) } as BlockContent;
    });
  };

  const update = (i: number, patch: Partial<SustainitExpertiseItem>) =>
    write(list =>
      list.map((item, idx) => (idx === i ? { ...item, ...patch } : item))
    );

  const remove = (i: number) => {
    if (items.length <= 1) {
      toast.error('Cần ít nhất 1 mục');
      return;
    }
    write(list => list.filter((_, idx) => idx !== i));
  };

  const add = () =>
    write(list => [...list, { ...SUSTAINIT_OUR_EXPERTISE_BLANK }]);

  return (
    <PopoverTrigger
      label='Danh sách mục'
      preview={`${items.length} mục`}
      width={460}
    >
      <div className='flex max-h-80 flex-col gap-2 overflow-y-auto pr-1'>
        {items.map((item, i) => (
          <div
            key={`sustainit-item-${i}`}
            className='flex flex-col gap-1.5 rounded-md border border-neutral-200 bg-white p-2'
          >
            <div className='flex items-center justify-between gap-2'>
              <span className='text-3xs font-semibold tracking-widest text-neutral-500 uppercase'>
                Item {i + 1}
              </span>
              <button
                type='button'
                onClick={e => {
                  e.preventDefault();
                  e.stopPropagation();
                  remove(i);
                }}
                disabled={items.length <= 1}
                aria-label={`Xoá mục ${i + 1}`}
                className='flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-md text-rose-500 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-40'
              >
                <Trash2 className='size-3.5' />
              </button>
            </div>
            <Input
              value={item.title ?? ''}
              onChange={e => update(i, { title: e.target.value })}
              placeholder='Tiêu đề'
              className='h-8 border-neutral-200 bg-white text-xs font-semibold'
            />
            <Textarea
              value={item.subtitle ?? ''}
              onChange={e => update(i, { subtitle: e.target.value })}
              placeholder='Phụ đề'
              rows={2}
              className='min-h-0 border-neutral-200 bg-white text-xs'
            />
            <ImagePicker
              value={item.imageUrl ?? ''}
              onChange={url => update(i, { imageUrl: url })}
            />
            <ImagePicker
              value={item.backImageUrl ?? item.imageUrl ?? ''}
              onChange={url => update(i, { backImageUrl: url })}
            />
            <Textarea
              value={(item.bullets ?? []).join('\n')}
              onChange={e =>
                update(i, {
                  bullets: e.target.value
                    .split('\n')
                    .map(line => line.trim())
                    .filter(Boolean),
                })
              }
              placeholder='Bullets (mỗi dòng 1 bullet)'
              rows={4}
              className='min-h-0 border-neutral-200 bg-white text-xs'
            />
            <Input
              value={item.color ?? ''}
              onChange={e => update(i, { color: e.target.value })}
              placeholder='Màu viền card (#a9f54b)'
              className='h-8 border-neutral-200 bg-white text-xs'
            />
          </div>
        ))}
      </div>
      <AddRow onAdd={add} label='Thêm mục' />
    </PopoverTrigger>
  );
}

// ─────────────────────────────────────── HOUSENT EXCELLENCE · SATELLITE ITEMS

/**
 * List manager cho `housent_our_excellence.items` — nhãn + tên icon lucide.
 * Vòng tròn desktop chia đều 360° theo số mục nên thêm/xoá tự giãn.
 */
function HousentOurExcellenceItemsControls({
  content,
  onContentChange,
}: {
  content: HousentOurExcellenceContent;
  onContentChange: (
    next: BlockContent | ((prev: BlockContent) => BlockContent)
  ) => void;
}) {
  const items = resolveHousentOurExcellenceItems(content);

  const write = (
    updater: (list: HousentOurExcellenceItem[]) => HousentOurExcellenceItem[]
  ) => {
    onContentChange(prev => {
      const c = prev as HousentOurExcellenceContent;
      const current = resolveHousentOurExcellenceItems(c);
      return { ...c, items: updater(current) } as BlockContent;
    });
  };

  const update = (i: number, patch: Partial<HousentOurExcellenceItem>) =>
    write(list =>
      list.map((item, idx) => (idx === i ? { ...item, ...patch } : item))
    );

  const remove = (i: number) => {
    if (items.length <= 1) {
      toast.error('Cần ít nhất 1 mục');
      return;
    }
    write(list => list.filter((_, idx) => idx !== i));
  };

  const add = () =>
    write(list => [
      ...list,
      {
        label: 'Mục mới',
        icon:
          HOUSENT_EXCELLENCE_ICON_OPTIONS[
            list.length % HOUSENT_EXCELLENCE_ICON_OPTIONS.length
          ] ?? HOUSENT_EXCELLENCE_FALLBACK_ICON,
      },
    ]);

  return (
    <PopoverTrigger
      label='Danh sách mục'
      preview={`${items.length} mục`}
      width={420}
    >
      <div className='flex max-h-80 flex-col gap-2 overflow-y-auto pr-1'>
        {items.map((item, i) => {
          const iconValue = item.icon || HOUSENT_EXCELLENCE_FALLBACK_ICON;
          return (
            <div
              key={`housent-item-${i}`}
              className='flex flex-col gap-1.5 rounded-md border border-neutral-200 bg-white p-2'
            >
              <div className='flex items-center gap-2'>
                <Input
                  value={item.label ?? ''}
                  onChange={e => update(i, { label: e.target.value })}
                  placeholder='Nhãn'
                  className='h-8 border-neutral-200 bg-white text-xs font-semibold'
                />
                <button
                  type='button'
                  onClick={e => {
                    e.preventDefault();
                    e.stopPropagation();
                    remove(i);
                  }}
                  disabled={items.length <= 1}
                  aria-label={`Xoá mục ${i + 1}`}
                  className='flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-md text-rose-500 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-40'
                >
                  <Trash2 className='size-3.5' />
                </button>
              </div>
              <select
                value={iconValue}
                onChange={e => update(i, { icon: e.target.value })}
                aria-label={`Icon mục ${i + 1}`}
                className='h-7 rounded border border-neutral-200 bg-white px-2 text-xs text-neutral-700'
              >
                {!HOUSENT_EXCELLENCE_ICON_OPTIONS.includes(iconValue) && (
                  <option value={iconValue}>{iconValue}</option>
                )}
                {HOUSENT_EXCELLENCE_ICON_OPTIONS.map(opt => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          );
        })}
      </div>
      <AddRow onAdd={add} label='Thêm mục' />
    </PopoverTrigger>
  );
}

// ────────────────────────────────────── REAL ESTATE TỔNG QUAN · HẠNG MỤC

/**
 * List manager cho `real_estate_overview.stats` — shape `{iconUrl,text}` nên
 * KHÔNG dùng lại `StatsControls` (generic trên `{value,label}[]`).
 *
 * Lưới 2 cột: thêm lẻ 1 hạng mục sẽ để trống ô bên phải ở hàng cuối — chấp
 * nhận được, layout tự co theo `grid-cols-2`.
 */
function RealEstateOverviewStatsControls({
  content,
  onContentChange,
}: {
  content: RealEstateOverviewContent;
  onContentChange: (
    next: BlockContent | ((prev: BlockContent) => BlockContent)
  ) => void;
}) {
  const stats = resolveRealEstateOverviewStats(content);

  const write = (
    updater: (list: RealEstateOverviewStat[]) => RealEstateOverviewStat[]
  ) => {
    onContentChange(prev => {
      const c = prev as RealEstateOverviewContent;
      // Resolve lại từ `prev` (không đóng gói `stats` ở trên) để không ghi đè
      // thay đổi vừa xảy ra giữa 2 lần render.
      const current = resolveRealEstateOverviewStats(c);
      return { ...c, stats: updater(current) } as BlockContent;
    });
  };

  const update = (i: number, patch: Partial<RealEstateOverviewStat>) =>
    write(list =>
      list.map((stat, idx) => (idx === i ? { ...stat, ...patch } : stat))
    );

  const remove = (i: number) => {
    if (stats.length <= 1) {
      toast.error('Cần ít nhất 1 hạng mục');
      return;
    }
    write(list => list.filter((_, idx) => idx !== i));
  };

  const add = () =>
    write(list => [
      ...list,
      {
        iconUrl: REAL_ESTATE_OVERVIEW_DEFAULT_STATS[0]?.iconUrl ?? '',
        text: 'HẠNG MỤC\nMỚI',
      },
    ]);

  return (
    <PopoverTrigger
      label='Danh sách hạng mục'
      preview={`${stats.length} hạng mục`}
      width={420}
    >
      <div className='flex max-h-80 flex-col gap-2 overflow-y-auto pr-1'>
        {stats.map((stat, i) => (
          <div
            key={`reo-stat-${i}`}
            className='flex flex-col gap-1.5 rounded-md border border-neutral-200 bg-white p-2'
          >
            <div className='flex items-center justify-between gap-2'>
              <span className='text-3xs font-semibold tracking-widest text-neutral-500 uppercase'>
                Hạng mục {i + 1}
              </span>
              <button
                type='button'
                onClick={e => {
                  e.preventDefault();
                  e.stopPropagation();
                  remove(i);
                }}
                disabled={stats.length <= 1}
                aria-label={`Xoá hạng mục ${i + 1}`}
                className='flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-md text-rose-500 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-40'
              >
                <Trash2 className='size-3.5' />
              </button>
            </div>
            <ImagePicker
              value={stat.iconUrl ?? ''}
              onChange={url => update(i, { iconUrl: url })}
            />
            {/* Chữ có ngắt dòng thủ công `\n` → textarea, không phải 1 dòng. */}
            <Textarea
              value={stat.text ?? ''}
              onChange={e => update(i, { text: e.target.value })}
              placeholder='Nội dung'
              rows={2}
              className='min-h-0 border-neutral-200 bg-white text-xs'
            />
          </div>
        ))}
      </div>
      <AddRow onAdd={add} label='Thêm hạng mục' />
    </PopoverTrigger>
  );
}

// ─────────────────────────────────────────── ALTURA OLYMPUS FEATURES

function AlturaOlympusImagesControls({
  content,
  onContentChange,
}: {
  content: AlturaOlympusContent;
  onContentChange: (
    next: BlockContent | ((prev: BlockContent) => BlockContent)
  ) => void;
}) {
  const images = resolveAlturaOlympusImages(content);

  const write = (updater: (list: string[]) => string[]) => {
    onContentChange(prev => {
      const c = prev as AlturaOlympusContent;
      const current = resolveAlturaOlympusImages(c);
      return { ...c, images: updater(current) } as BlockContent;
    });
  };

  const update = (i: number, url: string) =>
    write(list => list.map((item, idx) => (idx === i ? url : item)));

  const remove = (i: number) => {
    if (images.length <= 2) {
      toast.error('Cần ít nhất 2 ảnh (cover + companion)');
      return;
    }
    write(list => list.filter((_, idx) => idx !== i));
  };

  const add = () =>
    write(list => [
      ...list,
      ALTURA_OLYMPUS_DEFAULT_IMAGES[
        list.length % ALTURA_OLYMPUS_DEFAULT_IMAGES.length
      ] ?? ALTURA_OLYMPUS_DEFAULT_IMAGES[0],
    ]);

  return (
    <PopoverTrigger
      label='Danh sách ảnh'
      preview={`${images.length} ảnh`}
      width={460}
    >
      <div className='flex max-h-80 flex-col gap-2 overflow-y-auto pr-1'>
        {images.map((url, i) => (
          <div
            key={`altura-img-${i}`}
            className='flex flex-col gap-1.5 rounded-md border border-neutral-200 bg-white p-2'
          >
            <div className='flex items-center justify-between gap-2'>
              <span className='text-3xs font-semibold tracking-widest text-neutral-500 uppercase'>
                {i === 0 ? 'Ảnh 1 · Cover' : `Ảnh ${i + 1}`}
              </span>
              <button
                type='button'
                onClick={e => {
                  e.preventDefault();
                  e.stopPropagation();
                  remove(i);
                }}
                disabled={images.length <= 2}
                aria-label={`Xoá ảnh ${i + 1}`}
                className='flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-md text-rose-500 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-40'
              >
                <Trash2 className='size-3.5' />
              </button>
            </div>
            <ImagePicker value={url} onChange={next => update(i, next)} />
          </div>
        ))}
      </div>
      <AddRow onAdd={add} label='Thêm ảnh' />
    </PopoverTrigger>
  );
}

function AlturaOlympusFeaturesControls({
  content,
  onContentChange,
}: {
  content: AlturaOlympusContent;
  onContentChange: (
    next: BlockContent | ((prev: BlockContent) => BlockContent)
  ) => void;
}) {
  const features = resolveAlturaOlympusFeatures(content);

  const write = (
    updater: (list: AlturaOlympusFeature[]) => AlturaOlympusFeature[]
  ) => {
    onContentChange(prev => {
      const c = prev as AlturaOlympusContent;
      const current = resolveAlturaOlympusFeatures(c);
      return { ...c, features: updater(current) } as BlockContent;
    });
  };

  const update = (i: number, patch: Partial<AlturaOlympusFeature>) =>
    write(list =>
      list.map((item, idx) => (idx === i ? { ...item, ...patch } : item))
    );

  const remove = (i: number) => {
    if (features.length <= 1) {
      toast.error('Cần ít nhất 1 feature');
      return;
    }
    write(list => list.filter((_, idx) => idx !== i));
  };

  const add = () =>
    write(list => [
      ...list,
      {
        label: 'Feature mới',
        icon: ALTURA_OLYMPUS_DEFAULT_FEATURES[0]?.icon ?? 'Crosshair',
      },
    ]);

  return (
    <PopoverTrigger
      label='Danh sách features'
      preview={`${features.length} mục`}
      width={420}
    >
      <div className='flex max-h-80 flex-col gap-2 overflow-y-auto pr-1'>
        {features.map((feat, i) => {
          const iconValue = ALTURA_OLYMPUS_ICON_OPTIONS.includes(
            feat.icon as (typeof ALTURA_OLYMPUS_ICON_OPTIONS)[number]
          )
            ? feat.icon
            : feat.icon || 'Crosshair';
          return (
            <div
              key={`altura-feat-${i}`}
              className='flex flex-col gap-1.5 rounded-md border border-neutral-200 bg-white p-2'
            >
              <div className='flex items-center gap-2'>
                <select
                  value={iconValue}
                  onChange={e => update(i, { icon: e.target.value })}
                  aria-label={`Icon feature ${i + 1}`}
                  className='h-7 flex-1 rounded border border-neutral-200 bg-white px-2 text-xs text-neutral-700'
                >
                  {!ALTURA_OLYMPUS_ICON_OPTIONS.includes(
                    iconValue as (typeof ALTURA_OLYMPUS_ICON_OPTIONS)[number]
                  ) &&
                    iconValue && <option value={iconValue}>{iconValue}</option>}
                  {ALTURA_OLYMPUS_ICON_OPTIONS.map(opt => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
                <button
                  type='button'
                  onClick={e => {
                    e.preventDefault();
                    e.stopPropagation();
                    remove(i);
                  }}
                  disabled={features.length <= 1}
                  aria-label={`Xoá feature ${i + 1}`}
                  className='flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-md text-rose-500 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-40'
                >
                  <Trash2 className='size-3.5' />
                </button>
              </div>
              <Input
                value={feat.label ?? ''}
                onChange={e => update(i, { label: e.target.value })}
                placeholder='Nhãn feature'
                className='h-8 border-neutral-200 bg-white text-xs font-semibold'
              />
            </div>
          );
        })}
      </div>
      <AddRow onAdd={add} label='Thêm feature' />
    </PopoverTrigger>
  );
}

function TheGrandServiceItemsControls({
  content,
  onContentChange,
}: {
  content: TheGrandServiceContent;
  onContentChange: (
    next: BlockContent | ((prev: BlockContent) => BlockContent)
  ) => void;
}) {
  const items = Array.isArray(content.items) ? content.items : [];

  const write = (
    updater: (list: TheGrandServiceItem[]) => TheGrandServiceItem[]
  ) => {
    onContentChange(prev => {
      const c = prev as TheGrandServiceContent;
      const prevItems = Array.isArray(c.items) ? c.items : [];
      return {
        ...c,
        items: updater([...prevItems]),
      } as BlockContent;
    });
  };

  const update = (i: number, patch: Partial<TheGrandServiceItem>) =>
    write(list =>
      list.map((item, idx) => (idx === i ? { ...item, ...patch } : item))
    );

  const remove = (i: number) => {
    if (items.length <= 1) {
      toast.error('Cần ít nhất 1 dịch vụ');
      return;
    }
    write(list => list.filter((_, idx) => idx !== i));
  };

  const add = () =>
    write(list => [
      ...list,
      {
        label: 'Dịch vụ mới',
        imageUrl: '/the-grand/dining.png',
        imageAlt: '',
        description: 'Mô tả dịch vụ.',
      },
    ]);

  return (
    <PopoverTrigger
      label='Danh sách dịch vụ'
      preview={`${items.length} dịch vụ`}
      width={440}
    >
      <div className='flex max-h-80 flex-col gap-2 overflow-y-auto pr-1'>
        {items.map((item, i) => (
          <div
            key={i}
            className='flex flex-col gap-1.5 rounded-md border border-neutral-200 bg-white p-2'
          >
            <div className='flex items-center gap-2'>
              <Input
                value={item.label ?? ''}
                onChange={e => update(i, { label: e.target.value })}
                placeholder='Nhãn'
                className='h-8 border-neutral-200 bg-white text-xs font-semibold'
              />
              <button
                type='button'
                onClick={e => {
                  e.preventDefault();
                  e.stopPropagation();
                  remove(i);
                }}
                aria-label={`Xoá dịch vụ ${i + 1}`}
                className='flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-md text-rose-500 hover:bg-rose-50'
              >
                <Trash2 className='size-3.5' />
              </button>
            </div>
            <Textarea
              value={item.description ?? ''}
              onChange={e => update(i, { description: e.target.value })}
              placeholder='Mô tả'
              rows={3}
              className='border-neutral-200 bg-white text-xs'
            />
            <ImagePicker
              value={item.imageUrl ?? ''}
              onChange={url => update(i, { imageUrl: url })}
            />
          </div>
        ))}
      </div>
      <AddRow onAdd={add} label='Thêm dịch vụ' />
    </PopoverTrigger>
  );
}

function TheGrandDiscoverItemsControls({
  content,
  onContentChange,
}: {
  content: TheGrandDiscoverContent;
  onContentChange: (
    next: BlockContent | ((prev: BlockContent) => BlockContent)
  ) => void;
}) {
  const items = Array.isArray(content.items) ? content.items : [];

  const write = (
    updater: (list: TheGrandDiscoverItem[]) => TheGrandDiscoverItem[]
  ) => {
    onContentChange(prev => {
      const c = prev as TheGrandDiscoverContent;
      const prevItems = Array.isArray(c.items) ? c.items : [];
      return {
        ...c,
        items: updater([...prevItems]),
      } as BlockContent;
    });
  };

  const update = (i: number, patch: Partial<TheGrandDiscoverItem>) =>
    write(list =>
      list.map((item, idx) => (idx === i ? { ...item, ...patch } : item))
    );

  const remove = (i: number) => {
    // Stack scrub cần ≥ 2 ảnh để có segment chuyển; dưới đó section vô nghĩa.
    if (items.length <= 2) {
      toast.error('Cần ít nhất 2 khu vực');
      return;
    }
    write(list => list.filter((_, idx) => idx !== i));
  };

  const add = () =>
    write(list => [
      ...list,
      {
        label: 'Khu vực mới',
        imageUrl: '/the-grand/discover-1.png',
        imageAlt: '',
      },
    ]);

  return (
    <PopoverTrigger
      label='Danh sách khu vực'
      preview={`${items.length} khu vực`}
      width={440}
    >
      <div className='flex max-h-80 flex-col gap-2 overflow-y-auto pr-1'>
        {items.map((item, i) => (
          <div
            key={i}
            className='flex flex-col gap-1.5 rounded-md border border-neutral-200 bg-white p-2'
          >
            <div className='flex items-center gap-2'>
              <Input
                value={item.label ?? ''}
                onChange={e => update(i, { label: e.target.value })}
                placeholder='Nhãn'
                className='h-8 border-neutral-200 bg-white text-xs font-semibold'
              />
              <button
                type='button'
                onClick={e => {
                  e.preventDefault();
                  e.stopPropagation();
                  remove(i);
                }}
                aria-label={`Xoá khu vực ${i + 1}`}
                className='flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-md text-rose-500 hover:bg-rose-50'
              >
                <Trash2 className='size-3.5' />
              </button>
            </div>
            <Input
              value={item.imageAlt ?? ''}
              onChange={e => update(i, { imageAlt: e.target.value })}
              placeholder='Mô tả ảnh (alt)'
              className='h-8 border-neutral-200 bg-white text-xs'
            />
            <ImagePicker
              value={item.imageUrl ?? ''}
              onChange={url => update(i, { imageUrl: url })}
            />
          </div>
        ))}
      </div>
      <AddRow onAdd={add} label='Thêm khu vực' />
    </PopoverTrigger>
  );
}

function TheGrandAboutPartnersControls({
  content,
  onContentChange,
}: {
  content: TheGrandAboutContent;
  onContentChange: (
    next: BlockContent | ((prev: BlockContent) => BlockContent)
  ) => void;
}) {
  const partners = Array.isArray(content.partners) ? content.partners : [];

  const write = (
    updater: (list: TheGrandAboutPartner[]) => TheGrandAboutPartner[]
  ) => {
    onContentChange(prev => {
      const c = prev as TheGrandAboutContent;
      const prevPartners = Array.isArray(c.partners) ? c.partners : [];
      return {
        ...c,
        partners: updater([...prevPartners]),
      } as BlockContent;
    });
  };

  const update = (i: number, patch: Partial<TheGrandAboutPartner>) =>
    write(list =>
      list.map((partner, idx) =>
        idx === i ? { ...partner, ...patch } : partner
      )
    );

  const remove = (i: number) => {
    if (partners.length <= 1) {
      toast.error('Cần ít nhất 1 đối tác');
      return;
    }
    write(list => list.filter((_, idx) => idx !== i));
  };

  const add = () =>
    write(list => [
      ...list,
      {
        name: 'Đối tác mới',
        logo: '/the-grand/partner-hba.svg',
        role: 'Vai trò',
      },
    ]);

  return (
    <PopoverTrigger
      label='Danh sách đối tác'
      preview={`${partners.length} đối tác`}
      width={440}
    >
      <div className='flex max-h-80 flex-col gap-2 overflow-y-auto pr-1'>
        {partners.map((partner, i) => (
          <div
            key={i}
            className='flex flex-col gap-1.5 rounded-md border border-neutral-200 bg-white p-2'
          >
            <div className='flex items-center gap-2'>
              <Input
                value={partner.name ?? ''}
                onChange={e => update(i, { name: e.target.value })}
                placeholder='Tên đơn vị'
                className='h-8 border-neutral-200 bg-white text-xs font-semibold'
              />
              <button
                type='button'
                onClick={e => {
                  e.preventDefault();
                  e.stopPropagation();
                  remove(i);
                }}
                aria-label={`Xoá đối tác ${i + 1}`}
                className='flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-md text-rose-500 hover:bg-rose-50'
              >
                <Trash2 className='size-3.5' />
              </button>
            </div>
            <Input
              value={partner.role ?? ''}
              onChange={e => update(i, { role: e.target.value })}
              placeholder='Vai trò'
              className='h-8 border-neutral-200 bg-white text-xs'
            />
            <ImagePicker
              value={partner.logo ?? ''}
              onChange={url => update(i, { logo: url })}
            />
          </div>
        ))}
      </div>
      <AddRow onAdd={add} label='Thêm đối tác' />
    </PopoverTrigger>
  );
}

function TheGrandFooterPoliciesControls({
  content,
  onContentChange,
}: {
  content: TheGrandFooterContent;
  onContentChange: (
    next: BlockContent | ((prev: BlockContent) => BlockContent)
  ) => void;
}) {
  const policies = Array.isArray(content.policies) ? content.policies : [];

  // Functional updater: block có 2 mảng động, dạng object dễ ghi đè mảng kia
  // bằng closure cũ.
  const write = (
    updater: (list: TheGrandFooterPolicy[]) => TheGrandFooterPolicy[]
  ) => {
    onContentChange(prev => {
      const c = prev as TheGrandFooterContent;
      const prevList = Array.isArray(c.policies) ? c.policies : [];
      return { ...c, policies: updater([...prevList]) } as BlockContent;
    });
  };

  const update = (i: number, patch: Partial<TheGrandFooterPolicy>) =>
    write(list =>
      list.map((policy, idx) => (idx === i ? { ...policy, ...patch } : policy))
    );

  const remove = (i: number) => {
    if (policies.length <= 1) {
      toast.error('Cần ít nhất 1 chính sách');
      return;
    }
    write(list => list.filter((_, idx) => idx !== i));
  };

  const add = () =>
    write(list => [...list, { label: 'Chính sách mới', href: '#' }]);

  return (
    <PopoverTrigger
      label='Danh sách chính sách'
      preview={`${policies.length} chính sách`}
      width={440}
    >
      <div className='flex max-h-80 flex-col gap-2 overflow-y-auto pr-1'>
        {policies.map((policy, i) => (
          <div
            key={i}
            className='flex flex-col gap-1.5 rounded-md border border-neutral-200 bg-white p-2'
          >
            <div className='flex items-center gap-2'>
              <Input
                value={policy.label ?? ''}
                onChange={e => update(i, { label: e.target.value })}
                placeholder='Nhãn'
                className='h-8 border-neutral-200 bg-white text-xs font-semibold'
              />
              <button
                type='button'
                onClick={e => {
                  e.preventDefault();
                  e.stopPropagation();
                  remove(i);
                }}
                aria-label={`Xoá chính sách ${i + 1}`}
                className='flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-md text-rose-500 hover:bg-rose-50'
              >
                <Trash2 className='size-3.5' />
              </button>
            </div>
            <Input
              value={policy.href ?? ''}
              onChange={e => update(i, { href: e.target.value })}
              placeholder='Link (vd /chinh-sach-bao-mat)'
              className='h-8 border-neutral-200 bg-white text-xs'
            />
          </div>
        ))}
      </div>
      <AddRow onAdd={add} label='Thêm chính sách' />
    </PopoverTrigger>
  );
}

function TheGrandFooterSocialsControls({
  content,
  onContentChange,
}: {
  content: TheGrandFooterContent;
  onContentChange: (
    next: BlockContent | ((prev: BlockContent) => BlockContent)
  ) => void;
}) {
  const socials = Array.isArray(content.socials) ? content.socials : [];

  const write = (
    updater: (list: TheGrandFooterSocial[]) => TheGrandFooterSocial[]
  ) => {
    onContentChange(prev => {
      const c = prev as TheGrandFooterContent;
      const prevList = Array.isArray(c.socials) ? c.socials : [];
      return { ...c, socials: updater([...prevList]) } as BlockContent;
    });
  };

  const update = (i: number, patch: Partial<TheGrandFooterSocial>) =>
    write(list =>
      list.map((social, idx) => (idx === i ? { ...social, ...patch } : social))
    );

  const remove = (i: number) => {
    if (socials.length <= 1) {
      toast.error('Cần ít nhất 1 social');
      return;
    }
    write(list => list.filter((_, idx) => idx !== i));
  };

  const add = () =>
    write(list => [...list, { platform: 'facebook', href: '#' }]);

  return (
    <PopoverTrigger
      label='Danh sách social'
      preview={`${socials.length} social`}
      width={440}
    >
      <div className='flex max-h-80 flex-col gap-2 overflow-y-auto pr-1'>
        {socials.map((social, i) => (
          <div
            key={i}
            className='flex flex-col gap-1.5 rounded-md border border-neutral-200 bg-white p-2'
          >
            <div className='flex items-center gap-2'>
              {/* Platform chọn glyph SVG — options từ SOCIAL_ICON_MAP. */}
              <select
                value={social.platform}
                onChange={e =>
                  update(i, {
                    platform: e.target.value as TheGrandFooterSocialPlatform,
                  })
                }
                className='h-8 flex-1 rounded border border-neutral-200 bg-white px-2 text-xs text-neutral-700'
              >
                {SOCIAL_PLATFORM_OPTIONS.map(opt => (
                  <option key={opt} value={opt}>
                    {SOCIAL_ICON_MAP[opt].label}
                  </option>
                ))}
              </select>
              <button
                type='button'
                onClick={e => {
                  e.preventDefault();
                  e.stopPropagation();
                  remove(i);
                }}
                aria-label={`Xoá social ${i + 1}`}
                className='flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-md text-rose-500 hover:bg-rose-50'
              >
                <Trash2 className='size-3.5' />
              </button>
            </div>
            <Input
              value={social.href ?? ''}
              onChange={e => update(i, { href: e.target.value })}
              placeholder='Link (vd https://facebook.com/…)'
              className='h-8 border-neutral-200 bg-white text-xs'
            />
            <Input
              value={social.label ?? ''}
              onChange={e => update(i, { label: e.target.value })}
              placeholder='Nhãn trợ năng (rỗng → tên nền tảng)'
              className='h-8 border-neutral-200 bg-white text-xs'
            />
          </div>
        ))}
      </div>
      <AddRow onAdd={add} label='Thêm social' />
    </PopoverTrigger>
  );
}

// ─────────────────────────────────────────── PNJ HOTSPOTS (form)

function PnjHotspotsControls({
  content,
  onContentChange,
}: {
  content: PnjHeroContent;
  onContentChange: (next: BlockContent) => void;
}) {
  const hotspots = content.hotspots ?? [];

  const update = (i: number, patch: Partial<PnjHeroHotspot>) =>
    onContentChange({
      ...content,
      hotspots: hotspots.map((h, idx) => (idx === i ? { ...h, ...patch } : h)),
    } as BlockContent);

  const remove = (i: number) =>
    onContentChange({
      ...content,
      hotspots: hotspots.filter((_, idx) => idx !== i),
    } as BlockContent);

  const add = () =>
    onContentChange({
      ...content,
      hotspots: [
        ...hotspots,
        {
          key: `hs_${Date.now().toString(36)}`,
          label: 'Điểm mới',
          desc: 'Mô tả chi tiết.',
          img: '',
          dotX: 50,
          dotY: 50,
        },
      ],
    } as BlockContent);

  return (
    <PopoverTrigger
      label='Hotspot / chi tiết'
      preview={`${hotspots.length} hotspot`}
      width={460}
    >
      <div className='flex max-h-80 flex-col gap-2 overflow-y-auto pr-1'>
        {hotspots.length === 0 ? (
          <p className='text-2xs rounded-md border border-dashed border-neutral-200 bg-neutral-50 px-3 py-4 text-center text-neutral-500'>
            Chưa có hotspot — block chỉ scrub frame, không drawer.
          </p>
        ) : null}
        {hotspots.map((h, i) => (
          <div
            key={h.key || i}
            className='flex flex-col gap-1.5 rounded-md border border-neutral-200 bg-white p-2'
          >
            <div className='flex items-center gap-2'>
              <Input
                value={h.label}
                onChange={e => update(i, { label: e.target.value })}
                placeholder='Tiêu đề hotspot'
                className='h-8 border-neutral-200 bg-white text-xs font-semibold'
              />
              <button
                type='button'
                onClick={() => remove(i)}
                aria-label='Xoá hotspot'
                className='flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-md text-rose-500 hover:bg-rose-50'
              >
                <Trash2 className='size-3.5' />
              </button>
            </div>
            <Textarea
              value={h.desc}
              onChange={e => update(i, { desc: e.target.value })}
              placeholder='Mô tả'
              className='min-h-16 resize-none border-neutral-200 bg-white text-xs'
            />
            <Input
              value={h.img}
              onChange={e => update(i, { img: e.target.value })}
              placeholder='URL ảnh trong drawer'
              className='h-8 border-neutral-200 bg-white text-xs'
            />
            <div className='flex items-center gap-2'>
              <label className='text-2xs flex flex-1 items-center gap-1 text-neutral-500'>
                Dot X%
                <Input
                  type='number'
                  min={0}
                  max={100}
                  value={h.dotX}
                  onChange={e => update(i, { dotX: Number(e.target.value) })}
                  className='h-8 border-neutral-200 bg-white text-xs'
                />
              </label>
              <label className='text-2xs flex flex-1 items-center gap-1 text-neutral-500'>
                Dot Y%
                <Input
                  type='number'
                  min={0}
                  max={100}
                  value={h.dotY}
                  onChange={e => update(i, { dotY: Number(e.target.value) })}
                  className='h-8 border-neutral-200 bg-white text-xs'
                />
              </label>
            </div>
          </div>
        ))}
      </div>
      <AddRow onAdd={add} label='Thêm hotspot' />
    </PopoverTrigger>
  );
}

// ─────────────────────────────────────────── PNJ FRAMES (JSON)

const PNJ_FRAMES_HINT = JSON.stringify(PNJ_HERO_FRAMES_DEFAULT, null, 2);

function PnjFramesJsonControls({
  content,
  onContentChange,
}: {
  content: PnjHeroContent;
  onContentChange: (next: BlockContent) => void;
}) {
  const resolved = resolvePnjHeroFrames(content);
  const [draft, setDraft] = React.useState(() =>
    JSON.stringify(content.frames ?? PNJ_HERO_FRAMES_DEFAULT, null, 2)
  );
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    setDraft(
      JSON.stringify(content.frames ?? PNJ_HERO_FRAMES_DEFAULT, null, 2)
    );
    setError(null);
  }, [content.frames]);

  const handleApply = () => {
    try {
      const parsed: unknown = JSON.parse(draft);
      if (!isPnjHeroFramesConfig(parsed)) {
        setError(
          'Cần object: desktop/mobile mỗi cái { total: number > 0, prefix: string }, ext? string.'
        );
        toast.error('JSON frames sai schema');
        return;
      }
      setError(null);
      onContentChange({
        ...content,
        frames: {
          desktop: {
            total: Math.floor(parsed.desktop.total),
            prefix: parsed.desktop.prefix.trim(),
          },
          mobile: {
            total: Math.floor(parsed.mobile.total),
            prefix: parsed.mobile.prefix.trim(),
          },
          ...(parsed.ext !== undefined
            ? { ext: parsed.ext.trim() || undefined }
            : {}),
        },
      } as BlockContent);
      toast.success(
        `Đã cập nhật frames · ${Math.floor(parsed.desktop.total)} desktop · ${Math.floor(parsed.mobile.total)} mobile`
      );
    } catch {
      setError('Không parse được JSON.');
      toast.error('JSON không hợp lệ');
    }
  };

  const handleReset = () => {
    const next = { ...content } as Record<string, unknown>;
    delete next.frames;
    onContentChange(next as BlockContent);
    setDraft(JSON.stringify(PNJ_HERO_FRAMES_DEFAULT, null, 2));
    setError(null);
    toast.success('Đã reset về frame PNJ mặc định');
  };

  const handleLoadMintExample = () => {
    setDraft(JSON.stringify(MINT_FRAMES_EXAMPLE, null, 2));
    setError(null);
  };

  const isCustom = content.frames !== undefined;

  return (
    <PopoverTrigger
      label='Frames / JSON'
      preview={`${resolved.desktop.total} · ${resolved.mobile.total}${isCustom ? '' : ' (mặc định)'}`}
      width={520}
    >
      <p className='text-2xs mb-2 text-neutral-500'>
        Object JSON — desktop/mobile: total + prefix (URL tới frame-001.webp =
        prefix + 001 + ext). Để trống / Reset = PNJ mặc định.
      </p>
      <Textarea
        value={draft}
        onChange={e => {
          setDraft(e.target.value);
          setError(null);
        }}
        placeholder={PNJ_FRAMES_HINT}
        spellCheck={false}
        data-lenis-prevent
        className='field-sizing-fixed h-64 max-h-[50vh] min-h-0 resize-y overflow-y-auto overscroll-contain border-neutral-200 bg-white font-mono text-[11px] leading-relaxed'
        aria-label='Frames JSON'
      />
      {error && (
        <p className='text-2xs mt-1.5 text-rose-600' role='alert'>
          {error}
        </p>
      )}
      <div className='mt-2 flex flex-col gap-1.5'>
        <button
          type='button'
          onClick={handleApply}
          className='flex h-8 w-full cursor-pointer items-center justify-center rounded-md bg-neutral-900 text-xs font-medium text-white transition-colors hover:bg-neutral-800'
        >
          Áp dụng JSON
        </button>
        <div className='flex gap-1.5'>
          <button
            type='button'
            onClick={handleLoadMintExample}
            className='flex h-8 flex-1 cursor-pointer items-center justify-center rounded-md bg-neutral-50 text-xs font-medium text-neutral-700 ring-1 ring-neutral-200/70 transition-colors hover:bg-white'
          >
            Mẫu Mint CDN
          </button>
          <button
            type='button'
            onClick={handleReset}
            className='flex h-8 flex-1 cursor-pointer items-center justify-center rounded-md bg-neutral-50 text-xs font-medium text-neutral-700 ring-1 ring-neutral-200/70 transition-colors hover:bg-white'
          >
            Reset PNJ mặc định
          </button>
        </div>
      </div>
    </PopoverTrigger>
  );
}

// ─────────────────────────────────────────── DELVAUX PRODUCT HOTSPOTS

function DelvauxHotspotsControls({
  content,
  onContentChange,
}: {
  content: DelvauxProductContent;
  onContentChange: (next: BlockContent) => void;
}) {
  const hotspots = content.hotspots ?? [];

  const update = (i: number, patch: Partial<DelvauxProductHotspot>) =>
    onContentChange({
      ...content,
      hotspots: hotspots.map((h, idx) => (idx === i ? { ...h, ...patch } : h)),
    } as BlockContent);

  const remove = (i: number) =>
    onContentChange({
      ...content,
      hotspots: hotspots.filter((_, idx) => idx !== i),
    } as BlockContent);

  const add = () =>
    onContentChange({
      ...content,
      hotspots: [
        ...hotspots,
        {
          title: 'Điểm mới',
          desc: 'Mô tả chi tiết hotspot.',
          mediaType: 'image',
          mediaUrl: '',
          x: 50,
          y: 50,
        },
      ],
    } as BlockContent);

  return (
    <PopoverTrigger
      label='Hotspot'
      preview={`${hotspots.length} hotspot`}
      width={460}
    >
      <div className='flex max-h-80 flex-col gap-2 overflow-y-auto pr-1'>
        {hotspots.length === 0 ? (
          <p className='text-2xs rounded-md border border-dashed border-neutral-200 bg-neutral-50 px-3 py-4 text-center text-neutral-500'>
            Chưa có hotspot — thêm điểm trên ảnh sản phẩm.
          </p>
        ) : null}
        {hotspots.map((h, i) => (
          <div
            key={`dvx-hs-${i}`}
            className='flex flex-col gap-1.5 rounded-md border border-neutral-200 bg-white p-2'
          >
            <div className='flex items-center gap-2'>
              <Input
                value={h.title}
                onChange={e => update(i, { title: e.target.value })}
                placeholder='Tiêu đề hotspot'
                className='h-8 border-neutral-200 bg-white text-xs font-semibold'
              />
              <button
                type='button'
                onClick={() => remove(i)}
                aria-label='Xoá hotspot'
                className='flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-md text-rose-500 hover:bg-rose-50'
              >
                <Trash2 className='size-3.5' />
              </button>
            </div>
            <Textarea
              value={h.desc}
              onChange={e => update(i, { desc: e.target.value })}
              placeholder='Mô tả'
              className='min-h-16 resize-none border-neutral-200 bg-white text-xs'
            />
            <div className='flex items-center gap-2'>
              <label className='text-2xs flex items-center gap-1 text-neutral-500'>
                Loại
                <select
                  value={h.mediaType}
                  onChange={e =>
                    update(i, {
                      mediaType: e.target.value === 'video' ? 'video' : 'image',
                    })
                  }
                  className='h-8 rounded-md border border-neutral-200 bg-white px-1.5 text-xs text-neutral-800'
                  aria-label={`Media type hotspot ${i + 1}`}
                >
                  <option value='image'>Ảnh</option>
                  <option value='video'>Video</option>
                </select>
              </label>
            </div>
            {h.mediaType === 'image' ? (
              <ImagePicker
                value={h.mediaUrl}
                onChange={url => update(i, { mediaUrl: url })}
              />
            ) : (
              <Input
                value={h.mediaUrl}
                onChange={e => update(i, { mediaUrl: e.target.value })}
                placeholder='URL video'
                className='h-8 border-neutral-200 bg-white text-xs'
              />
            )}
            <div className='flex items-center gap-2'>
              <label className='text-2xs flex flex-1 items-center gap-1 text-neutral-500'>
                Dot X%
                <Input
                  type='number'
                  min={0}
                  max={100}
                  value={h.x}
                  onChange={e => update(i, { x: Number(e.target.value) })}
                  className='h-8 border-neutral-200 bg-white text-xs'
                />
              </label>
              <label className='text-2xs flex flex-1 items-center gap-1 text-neutral-500'>
                Dot Y%
                <Input
                  type='number'
                  min={0}
                  max={100}
                  value={h.y}
                  onChange={e => update(i, { y: Number(e.target.value) })}
                  className='h-8 border-neutral-200 bg-white text-xs'
                />
              </label>
            </div>
          </div>
        ))}
      </div>
      <AddRow onAdd={add} label='Thêm hotspot' />
    </PopoverTrigger>
  );
}

// ─────────────────────────────────────────── DELVAUX SUBNAV LINKS

function DelvauxSubnavLinksControls({
  content,
  onContentChange,
}: {
  content: DelvauxSubnavContent;
  onContentChange: (next: BlockContent) => void;
}) {
  const links = content.links ?? [];

  const update = (i: number, patch: Partial<DelvauxSubnavLink>) =>
    onContentChange({
      ...content,
      links: links.map((l, idx) => (idx === i ? { ...l, ...patch } : l)),
    } as BlockContent);

  const remove = (i: number) =>
    onContentChange({
      ...content,
      links: links.filter((_, idx) => idx !== i),
    } as BlockContent);

  const add = () =>
    onContentChange({
      ...content,
      links: [
        ...links,
        {
          label: 'Link mới',
          targetId: 'section-id',
        },
      ],
    } as BlockContent);

  return (
    <PopoverTrigger
      label='Anchor links'
      preview={`${links.length} link`}
      width={420}
    >
      <div className='flex max-h-80 flex-col gap-2 overflow-y-auto pr-1'>
        {links.length === 0 ? (
          <p className='text-2xs rounded-md border border-dashed border-neutral-200 bg-neutral-50 px-3 py-4 text-center text-neutral-500'>
            Chưa có link — thêm anchor tới section id.
          </p>
        ) : null}
        {links.map((l, i) => (
          <div
            key={`dvx-nav-${i}`}
            className='flex flex-col gap-1.5 rounded-md border border-neutral-200 bg-white p-2'
          >
            <div className='flex items-center gap-2'>
              <Input
                value={l.label}
                onChange={e => update(i, { label: e.target.value })}
                placeholder='Nhãn'
                className='h-8 border-neutral-200 bg-white text-xs font-semibold'
              />
              <button
                type='button'
                onClick={() => remove(i)}
                aria-label='Xoá link'
                className='flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-md text-rose-500 hover:bg-rose-50'
              >
                <Trash2 className='size-3.5' />
              </button>
            </div>
            <Input
              value={l.targetId}
              onChange={e => update(i, { targetId: e.target.value })}
              placeholder='Section id (vd: description)'
              className='h-8 border-neutral-200 bg-white text-xs'
            />
          </div>
        ))}
      </div>
      <AddRow onAdd={add} label='Thêm link' />
    </PopoverTrigger>
  );
}

// ─────────────────────────────────────────────────── AESTHA NAV (block riêng)

function AesthaNavLinksControls({
  content,
  onContentChange,
}: {
  content: AesthaNavContent;
  onContentChange: (next: BlockContent) => void;
}) {
  const links = content.navLinks ?? [];

  const update = (i: number, patch: Partial<{ label: string; href: string }>) =>
    onContentChange({
      ...content,
      navLinks: links.map((l, idx) => (idx === i ? { ...l, ...patch } : l)),
    } as BlockContent);

  const remove = (i: number) =>
    onContentChange({
      ...content,
      navLinks: links.filter((_, idx) => idx !== i),
    } as BlockContent);

  const add = () =>
    onContentChange({
      ...content,
      navLinks: [...links, { label: 'Link mới', href: '#' }],
    } as BlockContent);

  return (
    <PopoverTrigger
      label='Nav links'
      preview={`${links.length} link`}
      width={420}
    >
      <div className='flex max-h-80 flex-col gap-2 overflow-y-auto pr-1'>
        {links.length === 0 ? (
          <p className='text-2xs rounded-md border border-dashed border-neutral-200 bg-neutral-50 px-3 py-4 text-center text-neutral-500'>
            Chưa có link — thêm mục nav ở chân cột trái.
          </p>
        ) : null}
        {links.map((l, i) => (
          <div
            key={`aestha-nav-${i}`}
            className='flex flex-col gap-1.5 rounded-md border border-neutral-200 bg-white p-2'
          >
            <div className='flex items-center gap-2'>
              <Input
                value={l.label}
                onChange={e => update(i, { label: e.target.value })}
                placeholder='Nhãn'
                className='h-8 border-neutral-200 bg-white text-xs font-semibold'
              />
              <button
                type='button'
                onClick={() => remove(i)}
                aria-label='Xoá link'
                className='flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-md text-rose-500 hover:bg-rose-50'
              >
                <Trash2 className='size-3.5' />
              </button>
            </div>
            <Input
              value={l.href}
              onChange={e => update(i, { href: e.target.value })}
              placeholder='Link (vd: /projects)'
              className='h-8 border-neutral-200 bg-white text-xs'
            />
          </div>
        ))}
      </div>
      <AddRow onAdd={add} label='Thêm link' />
    </PopoverTrigger>
  );
}

// ──────────────────────────────────────── AESTHA EXPLORE (projects + footer)

function AesthaExploreProjectsControls({
  content,
  onContentChange,
}: {
  content: AesthaExploreContent;
  onContentChange: (next: BlockContent) => void;
}) {
  const projects = content.projects ?? [];

  const update = (
    i: number,
    patch: Partial<{ label: string; href: string; img: string; alt: string }>
  ) =>
    onContentChange({
      ...content,
      projects: projects.map((p, idx) => (idx === i ? { ...p, ...patch } : p)),
    } as BlockContent);

  const updateImage = (
    projectIdx: number,
    imageIdx: number,
    patch: { src?: string; alt?: string }
  ) =>
    onContentChange({
      ...content,
      projects: projects.map((p, idx) => {
        if (idx !== projectIdx) return p;
        const detail = p.detail ?? { body: [], images: [] };
        const images = Array.isArray(detail.images) ? [...detail.images] : [];
        images[imageIdx] = { ...(images[imageIdx] ?? {}), ...patch };
        return { ...p, detail: { ...detail, images } };
      }),
    } as BlockContent);

  const addImage = (projectIdx: number) =>
    onContentChange({
      ...content,
      projects: projects.map((p, idx) => {
        if (idx !== projectIdx) return p;
        const detail = p.detail ?? { body: [], images: [] };
        const images = Array.isArray(detail.images) ? [...detail.images] : [];
        return {
          ...p,
          detail: {
            ...detail,
            images: [
              ...images,
              {
                src: 'https://framerusercontent.com/images/sb7lNvFscO86WspAS6g2Dbumdk4.jpg?width=2364&height=963',
                alt: `Ảnh ${images.length + 1}`,
              },
            ],
          },
        };
      }),
    } as BlockContent);

  const removeImage = (projectIdx: number, imageIdx: number) =>
    onContentChange({
      ...content,
      projects: projects.map((p, idx) => {
        if (idx !== projectIdx) return p;
        const detail = p.detail ?? { body: [], images: [] };
        const images = Array.isArray(detail.images) ? detail.images : [];
        return {
          ...p,
          detail: {
            ...detail,
            images: images.filter((_, i) => i !== imageIdx),
          },
        };
      }),
    } as BlockContent);

  const remove = (i: number) =>
    onContentChange({
      ...content,
      projects: projects.filter((_, idx) => idx !== i),
    } as BlockContent);

  const add = () =>
    onContentChange({
      ...content,
      projects: [
        ...projects,
        {
          label: 'Dự án mới',
          href: '#',
          img: 'https://framerusercontent.com/images/WPx9Zr4AV2b97ubrDEMcky10rwA.jpg?width=2364&height=1578',
          alt: 'Dự án mới',
          detail: {
            body: [
              'Mô tả dự án — kiến trúc đương đại kết hợp vật liệu cao cấp.',
              'Thiết kế tinh tế, công năng tối ưu cho một không gian sống hoàn hảo.',
              'Liên hệ đội ngũ tư vấn để biết thêm chi tiết.',
            ],
            images: [
              {
                src: 'https://framerusercontent.com/images/WPx9Zr4AV2b97ubrDEMcky10rwA.jpg?width=2364&height=1578',
                alt: 'Ảnh 1',
              },
              {
                src: 'https://framerusercontent.com/images/sb7lNvFscO86WspAS6g2Dbumdk4.jpg?width=2364&height=963',
                alt: 'Ảnh 2',
              },
            ],
          },
        },
      ],
    } as BlockContent);

  return (
    <PopoverTrigger
      label='Dự án'
      preview={`${projects.length} dự án`}
      width={460}
    >
      <div className='flex max-h-80 flex-col gap-2 overflow-y-auto pr-1'>
        {projects.length === 0 ? (
          <p className='text-2xs rounded-md border border-dashed border-neutral-200 bg-neutral-50 px-3 py-4 text-center text-neutral-500'>
            Chưa có dự án — thêm mục vào menu EXPLORE.
          </p>
        ) : null}
        {projects.map((p, i) => {
          const detailImages = Array.isArray(p.detail?.images)
            ? p.detail!.images!
            : [];
          return (
            <div
              key={`explore-proj-${i}`}
              className='flex flex-col gap-1.5 rounded-md border border-neutral-200 bg-white p-2'
            >
              <div className='flex items-center gap-2'>
                <Input
                  value={p.label}
                  onChange={e => update(i, { label: e.target.value })}
                  placeholder='Nhãn'
                  className='h-8 border-neutral-200 bg-white text-xs font-semibold'
                />
                <button
                  type='button'
                  onClick={() => remove(i)}
                  aria-label='Xoá dự án'
                  className='flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-md text-rose-500 hover:bg-rose-50'
                >
                  <Trash2 className='size-3.5' />
                </button>
              </div>
              <ImagePicker
                value={p.img}
                onChange={url => update(i, { img: url })}
              />
              <Input
                value={p.href}
                onChange={e => update(i, { href: e.target.value })}
                placeholder='Link (vd: /projects/haus-loma)'
                className='h-8 border-neutral-200 bg-white text-xs'
              />

              {/* Ảnh chi tiết (detail.images) — thêm/xoá tuỳ ý */}
              <div className='mt-1 flex flex-col gap-1 rounded border border-dashed border-neutral-200 bg-neutral-50/60 p-1.5'>
                <div className='flex items-center justify-between px-0.5'>
                  <span className='text-2xs font-medium tracking-wide text-neutral-500 uppercase'>
                    Ảnh chi tiết ({detailImages.length})
                  </span>
                  <button
                    type='button'
                    onClick={() => addImage(i)}
                    aria-label='Thêm ảnh chi tiết'
                    className='text-2xs flex h-6 cursor-pointer items-center gap-1 rounded px-1.5 font-medium text-neutral-600 hover:bg-white hover:text-neutral-900'
                  >
                    <Plus className='size-3' />
                    Thêm ảnh
                  </button>
                </div>
                {detailImages.length === 0 ? (
                  <p className='text-2xs rounded border border-dashed border-neutral-200 bg-white px-2 py-2 text-center text-neutral-400'>
                    Chưa có ảnh — bấm Thêm ảnh.
                  </p>
                ) : null}
                {detailImages.map((img, k) => (
                  <div
                    key={`explore-proj-${i}-img-${k}`}
                    className='flex flex-col gap-1.5 rounded border border-neutral-200 bg-white p-1.5'
                  >
                    <div className='flex items-center justify-between gap-1.5'>
                      <span className='text-2xs font-medium text-neutral-500'>
                        Ảnh {k + 1}
                      </span>
                      <button
                        type='button'
                        onClick={() => removeImage(i, k)}
                        aria-label={`Xoá ảnh ${k + 1}`}
                        className='flex size-6 shrink-0 cursor-pointer items-center justify-center rounded text-rose-500 hover:bg-rose-50'
                      >
                        <Trash2 className='size-3' />
                      </button>
                    </div>
                    <ImagePicker
                      value={img.src}
                      onChange={url => updateImage(i, k, { src: url })}
                    />
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      <AddRow onAdd={add} label='Thêm dự án' />
    </PopoverTrigger>
  );
}

/**
 * List-manager ảnh chi tiết của MỘT dự án (`projects[projectIndex].detail.images`).
 * Mở trực tiếp từ row "Thêm / quản lý ảnh" trong nhóm nội dung dự án ở Layers —
 * thêm/sửa URL/xoá ảnh mà không phải mở popover "Thêm / quản lý dự án".
 */
function AesthaExploreProjectImagesControls({
  content,
  onContentChange,
  projectIndex,
}: {
  content: AesthaExploreContent;
  onContentChange: (next: BlockContent) => void;
  projectIndex: number;
}) {
  const projects = content.projects ?? [];
  const project = projects[projectIndex];
  const images = Array.isArray(project?.detail?.images)
    ? project!.detail!.images!
    : [];

  const patchImages = (next: Array<{ src: string; alt: string }>): void =>
    onContentChange({
      ...content,
      projects: projects.map((p, idx) => {
        if (idx !== projectIndex) return p;
        const detail = p.detail ?? { body: [], images: [] };
        return { ...p, detail: { ...detail, images: next } };
      }),
    } as BlockContent);

  const updateImage = (
    imageIdx: number,
    patch: { src?: string; alt?: string }
  ) =>
    patchImages(
      images.map((img, i) => (i === imageIdx ? { ...img, ...patch } : img))
    );

  const addImage = () =>
    patchImages([
      ...images,
      {
        src: 'https://framerusercontent.com/images/sb7lNvFscO86WspAS6g2Dbumdk4.jpg?width=2364&height=963',
        alt: `Ảnh ${images.length + 1}`,
      },
    ]);

  const removeImage = (imageIdx: number) =>
    patchImages(images.filter((_, i) => i !== imageIdx));

  if (!project) {
    return (
      <PopoverTrigger label='Ảnh chi tiết' preview='—' width={420}>
        <p className='text-2xs rounded-md border border-dashed border-neutral-200 bg-neutral-50 px-3 py-4 text-center text-neutral-500'>
          Không tìm thấy dự án.
        </p>
      </PopoverTrigger>
    );
  }

  return (
    <PopoverTrigger
      label='Ảnh chi tiết'
      preview={`${images.length} ảnh · ${project.label}`}
      width={420}
    >
      <div className='flex max-h-80 flex-col gap-1.5 overflow-y-auto pr-1'>
        {images.length === 0 ? (
          <p className='text-2xs rounded-md border border-dashed border-neutral-200 bg-neutral-50 px-3 py-4 text-center text-neutral-500'>
            Chưa có ảnh — bấm Thêm ảnh.
          </p>
        ) : null}
        {images.map((img, k) => (
          <div
            key={`proj-${projectIndex}-img-${k}`}
            className='flex flex-col gap-1.5 rounded border border-neutral-200 bg-white p-1.5'
          >
            <div className='flex items-center justify-between gap-1.5'>
              <span className='text-2xs font-medium text-neutral-500'>
                Ảnh {k + 1}
              </span>
              <button
                type='button'
                onClick={() => removeImage(k)}
                aria-label={`Xoá ảnh ${k + 1}`}
                className='flex size-6 shrink-0 cursor-pointer items-center justify-center rounded text-rose-500 hover:bg-rose-50'
              >
                <Trash2 className='size-3' />
              </button>
            </div>
            <ImagePicker
              value={img.src}
              onChange={url => updateImage(k, { src: url })}
            />
          </div>
        ))}
      </div>
      <AddRow onAdd={addImage} label='Thêm ảnh' />
    </PopoverTrigger>
  );
}

function AesthaStudioTeamControls({
  content,
  onContentChange,
}: {
  content: AesthaStudioContent;
  onContentChange: (next: BlockContent) => void;
}) {
  const team = content.team ?? [];

  const update = (i: number, patch: Partial<{ name: string; role: string }>) =>
    onContentChange({
      ...content,
      team: team.map((mbr, idx) => (idx === i ? { ...mbr, ...patch } : mbr)),
    } as BlockContent);

  const remove = (i: number) =>
    onContentChange({
      ...content,
      team: team.filter((_, idx) => idx !== i),
    } as BlockContent);

  const add = () =>
    onContentChange({
      ...content,
      team: [...team, { name: 'Thành viên mới', role: 'Vai trò' }],
    } as BlockContent);

  return (
    <PopoverTrigger
      label='Team'
      preview={`${team.length} thành viên`}
      width={460}
    >
      <div className='flex max-h-80 flex-col gap-2 overflow-y-auto pr-1'>
        {team.length === 0 ? (
          <p className='text-2xs rounded-md border border-dashed border-neutral-200 bg-neutral-50 px-3 py-4 text-center text-neutral-500'>
            Chưa có thành viên — thêm mục vào danh sách team.
          </p>
        ) : null}
        {team.map((mbr, i) => (
          <div
            key={`studio-member-${i}`}
            className='flex flex-col gap-1.5 rounded-md border border-neutral-200 bg-white p-2'
          >
            <div className='flex items-center gap-2'>
              <Input
                value={mbr.name}
                onChange={e => update(i, { name: e.target.value })}
                placeholder='Tên'
                className='h-8 border-neutral-200 bg-white text-xs font-semibold'
              />
              <button
                type='button'
                onClick={() => remove(i)}
                aria-label='Xoá thành viên'
                className='flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-md text-rose-500 hover:bg-rose-50'
              >
                <Trash2 className='size-3.5' />
              </button>
            </div>
            <Input
              value={mbr.role}
              onChange={e => update(i, { role: e.target.value })}
              placeholder='Vai trò (vd: Interior Stylist)'
              className='h-8 border-neutral-200 bg-white text-xs'
            />
          </div>
        ))}
      </div>
      <AddRow onAdd={add} label='Thêm thành viên' />
    </PopoverTrigger>
  );
}

function AesthaContactSocialsControls({
  content,
  onContentChange,
}: {
  content: AesthaContactContent;
  onContentChange: (next: BlockContent) => void;
}) {
  const socials = content.socials ?? [];

  const update = (i: number, patch: Partial<{ label: string; href: string }>) =>
    onContentChange({
      ...content,
      socials: socials.map((s, idx) => (idx === i ? { ...s, ...patch } : s)),
    } as BlockContent);

  const remove = (i: number) =>
    onContentChange({
      ...content,
      socials: socials.filter((_, idx) => idx !== i),
    } as BlockContent);

  const add = () =>
    onContentChange({
      ...content,
      socials: [...socials, { label: 'Social mới', href: '#' }],
    } as BlockContent);

  return (
    <PopoverTrigger
      label='Social'
      preview={`${socials.length} social`}
      width={420}
    >
      <div className='flex max-h-80 flex-col gap-2 overflow-y-auto pr-1'>
        {socials.length === 0 ? (
          <p className='text-2xs rounded-md border border-dashed border-neutral-200 bg-neutral-50 px-3 py-4 text-center text-neutral-500'>
            Chưa có social — thêm mục mạng xã hội.
          </p>
        ) : null}
        {socials.map((s, i) => (
          <div
            key={`contact-social-${i}`}
            className='flex flex-col gap-1.5 rounded-md border border-neutral-200 bg-white p-2'
          >
            <div className='flex items-center gap-2'>
              <Input
                value={s.label}
                onChange={e => update(i, { label: e.target.value })}
                placeholder='Nhãn (vd: Instagram)'
                className='h-8 border-neutral-200 bg-white text-xs font-semibold'
              />
              <button
                type='button'
                onClick={() => remove(i)}
                aria-label='Xoá social'
                className='flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-md text-rose-500 hover:bg-rose-50'
              >
                <Trash2 className='size-3.5' />
              </button>
            </div>
            <Input
              value={s.href}
              onChange={e => update(i, { href: e.target.value })}
              placeholder='Link (vd: https://instagram.com/…)'
              className='h-8 border-neutral-200 bg-white text-xs'
            />
          </div>
        ))}
      </div>
      <AddRow onAdd={add} label='Thêm social' />
    </PopoverTrigger>
  );
}

// ─────────────────────────────────────────── DELVAUX VARIANT (swatches + FAQ)

function DelvauxVariantsControls({
  content,
  onContentChange,
}: {
  content: DelvauxVariantContent;
  onContentChange: (next: BlockContent) => void;
}) {
  const variants = content.variants ?? [];

  const update = (i: number, patch: Partial<DelvauxVariantOption>) =>
    onContentChange({
      ...content,
      variants: variants.map((v, idx) => (idx === i ? { ...v, ...patch } : v)),
    } as BlockContent);

  const remove = (i: number) =>
    onContentChange({
      ...content,
      variants: variants.filter((_, idx) => idx !== i),
    } as BlockContent);

  const add = () =>
    onContentChange({
      ...content,
      variants: [
        ...variants,
        {
          label: 'Màu mới',
          ref: '',
          color: '#764733',
          imageUrl: '',
        },
      ],
    } as BlockContent);

  return (
    <PopoverTrigger
      label='Màu (swatch)'
      preview={`${variants.length} màu`}
      width={460}
    >
      <div className='flex max-h-80 flex-col gap-2 overflow-y-auto pr-1'>
        {variants.length === 0 ? (
          <p className='text-2xs rounded-md border border-dashed border-neutral-200 bg-neutral-50 px-3 py-4 text-center text-neutral-500'>
            Chưa có màu — thêm biến thể swatch.
          </p>
        ) : null}
        {variants.map((v, i) => (
          <div
            key={`dvx-var-${i}`}
            className='flex flex-col gap-1.5 rounded-md border border-neutral-200 bg-white p-2'
          >
            <div className='flex items-center gap-2'>
              <Input
                value={v.label}
                onChange={e => update(i, { label: e.target.value })}
                placeholder='Nhãn màu'
                className='h-8 border-neutral-200 bg-white text-xs font-semibold'
              />
              <button
                type='button'
                onClick={() => remove(i)}
                aria-label='Xoá màu'
                className='flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-md text-rose-500 hover:bg-rose-50'
              >
                <Trash2 className='size-3.5' />
              </button>
            </div>
            <div className='flex items-center gap-2'>
              <Input
                value={v.ref}
                onChange={e => update(i, { ref: e.target.value })}
                placeholder='REF'
                className='h-8 flex-1 border-neutral-200 bg-white text-xs'
              />
              <Input
                value={v.color}
                onChange={e => update(i, { color: e.target.value })}
                placeholder='#hex'
                className='h-8 w-24 border-neutral-200 bg-white text-xs'
                aria-label={`Màu swatch ${i + 1}`}
              />
            </div>
            <Input
              value={v.imageUrl}
              onChange={e => update(i, { imageUrl: e.target.value })}
              placeholder='URL ảnh sản phẩm'
              className='h-8 border-neutral-200 bg-white text-xs'
            />
          </div>
        ))}
      </div>
      <AddRow onAdd={add} label='Thêm màu' />
    </PopoverTrigger>
  );
}

function DelvauxFaqsControls({
  content,
  onContentChange,
}: {
  content: DelvauxVariantContent;
  onContentChange: (next: BlockContent) => void;
}) {
  const faqs = content.faqs ?? [];

  const update = (i: number, patch: Partial<DelvauxVariantFaq>) =>
    onContentChange({
      ...content,
      faqs: faqs.map((f, idx) => (idx === i ? { ...f, ...patch } : f)),
    } as BlockContent);

  const remove = (i: number) =>
    onContentChange({
      ...content,
      faqs: faqs.filter((_, idx) => idx !== i),
    } as BlockContent);

  const add = () =>
    onContentChange({
      ...content,
      faqs: [
        ...faqs,
        {
          question: 'Câu hỏi mới',
          answer: '',
        },
      ],
    } as BlockContent);

  return (
    <PopoverTrigger label='FAQ' preview={`${faqs.length} mục`} width={460}>
      <div className='flex max-h-80 flex-col gap-2 overflow-y-auto pr-1'>
        {faqs.length === 0 ? (
          <p className='text-2xs rounded-md border border-dashed border-neutral-200 bg-neutral-50 px-3 py-4 text-center text-neutral-500'>
            Chưa có FAQ — thêm câu hỏi / trả lời.
          </p>
        ) : null}
        {faqs.map((f, i) => (
          <div
            key={`dvx-faq-${i}`}
            className='flex flex-col gap-1.5 rounded-md border border-neutral-200 bg-white p-2'
          >
            <div className='flex items-center gap-2'>
              <Input
                value={f.question}
                onChange={e => update(i, { question: e.target.value })}
                placeholder='Câu hỏi'
                className='h-8 border-neutral-200 bg-white text-xs font-semibold'
              />
              <button
                type='button'
                onClick={() => remove(i)}
                aria-label='Xoá FAQ'
                className='flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-md text-rose-500 hover:bg-rose-50'
              >
                <Trash2 className='size-3.5' />
              </button>
            </div>
            <Textarea
              value={f.answer}
              onChange={e => update(i, { answer: e.target.value })}
              placeholder='Trả lời'
              className='min-h-16 resize-none border-neutral-200 bg-white text-xs'
            />
          </div>
        ))}
      </div>
      <AddRow onAdd={add} label='Thêm FAQ' />
    </PopoverTrigger>
  );
}

/**
 * Quản lý panel của `gambit_product_overview`: mỗi panel = ảnh + tiêu đề +
 * mô tả; panel có cụm Details thêm ô nhập gạch đầu dòng (mỗi dòng 1 mục).
 * Quãng scroll của block = (số panel + 1) khung hình nên thêm/bớt panel cũng
 * đổi độ dài scrub.
 */
function GambitOverviewPanelsControls({
  content,
  onContentChange,
}: {
  content: GambitProductOverviewContent;
  onContentChange: (next: BlockContent) => void;
}) {
  const panels = resolveGambitOverviewPanels(content);

  const write = (next: GambitProductOverviewPanel[]) =>
    onContentChange({ ...content, panels: next } as BlockContent);

  const update = (i: number, patch: Partial<GambitProductOverviewPanel>) =>
    write(panels.map((p, idx) => (idx === i ? { ...p, ...patch } : p)));

  const remove = (i: number) => {
    if (panels.length <= 1) {
      toast.error('Cần ít nhất 1 panel');
      return;
    }
    write(panels.filter((_, idx) => idx !== i));
  };

  const add = () => write([...panels, { ...GAMBIT_OVERVIEW_NEW_PANEL }]);

  return (
    <PopoverTrigger
      label='Panel'
      preview={`${panels.length} panel`}
      icon={<ImageIcon className='size-3.5' />}
      width={460}
    >
      <div className='flex max-h-80 flex-col gap-2 overflow-y-auto pr-1'>
        {panels.map((panel, i) => {
          const bullets = Array.isArray(panel.bullets) ? panel.bullets : [];
          const hasDetails =
            panel.detailsLabel !== undefined ||
            panel.detailsRef !== undefined ||
            bullets.length > 0;
          return (
            <div
              key={`gambit-panel-${i}`}
              className='flex flex-col gap-1.5 rounded-md border border-neutral-200 bg-white p-2'
            >
              <div className='flex items-center gap-2'>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={panel.imageUrl}
                  alt=''
                  className='size-9 shrink-0 rounded object-contain ring-1 ring-neutral-200'
                />
                <Input
                  value={panel.imageUrl}
                  onChange={e => update(i, { imageUrl: e.target.value })}
                  placeholder='URL ảnh'
                  className='h-8 border-neutral-200 bg-white text-xs'
                />
                <button
                  type='button'
                  onClick={() => remove(i)}
                  aria-label={`Xoá panel ${i + 1}`}
                  className='flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-md text-rose-500 hover:bg-rose-50'
                >
                  <Trash2 className='size-3.5' />
                </button>
              </div>
              <Textarea
                value={panel.title}
                onChange={e => update(i, { title: e.target.value })}
                placeholder='Tiêu đề'
                className='min-h-12 resize-none border-neutral-200 bg-white text-xs font-semibold'
              />
              <Textarea
                value={panel.body ?? ''}
                onChange={e => update(i, { body: e.target.value })}
                placeholder='Mô tả'
                className='min-h-16 resize-none border-neutral-200 bg-white text-xs'
              />
              {hasDetails ? (
                <Textarea
                  value={bullets.join('\n')}
                  onChange={e =>
                    update(i, {
                      bullets: e.target.value
                        .split('\n')
                        .map(line => line.trim())
                        .filter(Boolean),
                    })
                  }
                  placeholder='Gạch đầu dòng — mỗi dòng 1 mục'
                  className='min-h-16 resize-none border-neutral-200 bg-white text-xs'
                />
              ) : null}
            </div>
          );
        })}
      </div>
      <AddRow onAdd={add} label='Thêm panel' />
    </PopoverTrigger>
  );
}

/**
 * Quản lý sản phẩm gợi ý của `gambit_related_products`: mỗi ô = ảnh + tên +
 * chất liệu. Số sản phẩm đổi thì stagger vào của lưới cũng dài/ngắn theo.
 */
function GambitRelatedProductsControls({
  content,
  onContentChange,
}: {
  content: GambitRelatedProductsContent;
  onContentChange: (next: BlockContent) => void;
}) {
  const products = resolveGambitRelatedProducts(content);

  const write = (next: GambitRelatedProductItem[]) =>
    onContentChange({ ...content, products: next } as BlockContent);

  const update = (i: number, patch: Partial<GambitRelatedProductItem>) =>
    write(products.map((p, idx) => (idx === i ? { ...p, ...patch } : p)));

  const remove = (i: number) => {
    if (products.length <= 1) {
      toast.error('Cần ít nhất 1 sản phẩm');
      return;
    }
    write(products.filter((_, idx) => idx !== i));
  };

  const add = () => write([...products, { ...GAMBIT_RELATED_NEW_PRODUCT }]);

  return (
    <PopoverTrigger
      label='Sản phẩm'
      preview={`${products.length} sản phẩm`}
      icon={<ImageIcon className='size-3.5' />}
      width={420}
    >
      <div className='flex max-h-80 flex-col gap-2 overflow-y-auto pr-1'>
        {products.map((product, i) => (
          <div
            key={`gambit-related-${i}`}
            className='flex flex-col gap-1.5 rounded-md border border-neutral-200 bg-white p-2'
          >
            <div className='flex items-center gap-2'>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={product.imageUrl}
                alt=''
                className='size-9 shrink-0 rounded object-contain ring-1 ring-neutral-200'
              />
              <Input
                value={product.imageUrl}
                onChange={e => update(i, { imageUrl: e.target.value })}
                placeholder='URL ảnh'
                className='h-8 border-neutral-200 bg-white text-xs'
              />
              <button
                type='button'
                onClick={() => remove(i)}
                aria-label={`Xoá sản phẩm ${i + 1}`}
                className='flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-md text-rose-500 hover:bg-rose-50'
              >
                <Trash2 className='size-3.5' />
              </button>
            </div>
            <div className='flex items-center gap-2'>
              <Input
                value={product.name}
                onChange={e => update(i, { name: e.target.value })}
                placeholder='Tên sản phẩm'
                className='h-8 border-neutral-200 bg-white text-xs font-semibold'
              />
              <Input
                value={product.material}
                onChange={e => update(i, { material: e.target.value })}
                placeholder='Chất liệu'
                className='h-8 border-neutral-200 bg-white text-xs'
              />
            </div>
          </div>
        ))}
      </div>
      <AddRow onAdd={add} label='Thêm sản phẩm' />
    </PopoverTrigger>
  );
}

/**
 * 5 manager mảng của `gambit_product_details` — ảnh / màu / size / accordion /
 * hành động. Mỗi manager ghi thẳng vào content; block + Lớp đọc lại qua cùng
 * hàm `resolveGambitDetails*` nên không lệch nhau.
 *
 * Số ảnh quyết định quãng cuộn ngang (travel) nên thêm/bớt ảnh cũng đổi độ
 * dài scrub của block.
 */
function GambitDetailsGalleryControls({
  content,
  onContentChange,
}: {
  content: GambitProductDetailsContent;
  onContentChange: (next: BlockContent) => void;
}) {
  const images = resolveGambitDetailsGallery(content);

  const write = (next: string[]) =>
    onContentChange({ ...content, galleryImages: next } as BlockContent);

  const update = (i: number, value: string) =>
    write(images.map((src, idx) => (idx === i ? value : src)));

  const remove = (i: number) => {
    if (images.length <= 1) {
      toast.error('Cần ít nhất 1 ảnh');
      return;
    }
    write(images.filter((_, idx) => idx !== i));
  };

  return (
    <PopoverTrigger
      label='Ảnh'
      preview={`${images.length} ảnh`}
      icon={<ImageIcon className='size-3.5' />}
      width={420}
    >
      <div className='flex max-h-80 flex-col gap-2 overflow-y-auto pr-1'>
        {images.map((src, i) => (
          <div
            key={`gambit-detail-img-${i}`}
            className='flex items-center gap-2'
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt=''
              className='size-9 shrink-0 rounded object-contain ring-1 ring-neutral-200'
            />
            <Input
              value={src}
              onChange={e => update(i, e.target.value)}
              placeholder='URL ảnh'
              className='h-8 border-neutral-200 bg-white text-xs'
            />
            <button
              type='button'
              onClick={() => remove(i)}
              aria-label={`Xoá ảnh ${i + 1}`}
              className='flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-md text-rose-500 hover:bg-rose-50'
            >
              <Trash2 className='size-3.5' />
            </button>
          </div>
        ))}
      </div>
      <AddRow
        onAdd={() => write([...images, GAMBIT_DETAILS_NEW_IMAGE])}
        label='Thêm ảnh'
      />
    </PopoverTrigger>
  );
}

function GambitDetailsColorsControls({
  content,
  onContentChange,
}: {
  content: GambitProductDetailsContent;
  onContentChange: (next: BlockContent) => void;
}) {
  const colors = resolveGambitDetailsColors(content);

  const write = (next: GambitProductDetailsColor[]) =>
    onContentChange({ ...content, colors: next } as BlockContent);

  const update = (i: number, patch: Partial<GambitProductDetailsColor>) =>
    write(colors.map((c, idx) => (idx === i ? { ...c, ...patch } : c)));

  const remove = (i: number) => {
    if (colors.length <= 1) {
      toast.error('Cần ít nhất 1 màu');
      return;
    }
    write(colors.filter((_, idx) => idx !== i));
  };

  return (
    <PopoverTrigger
      label='Màu'
      preview={`${colors.length} màu`}
      icon={<Palette className='size-3.5' />}
      width={380}
    >
      <div className='flex max-h-80 flex-col gap-2 overflow-y-auto pr-1'>
        {colors.map((color, i) => (
          <div
            key={`gambit-detail-color-${i}`}
            className='flex items-center gap-2'
          >
            <input
              type='color'
              value={/^#[0-9a-f]{6}$/i.test(color.hex) ? color.hex : '#888888'}
              onChange={e => update(i, { hex: e.target.value })}
              aria-label={`Mã màu ${i + 1}`}
              className='size-8 shrink-0 cursor-pointer rounded border border-neutral-200 bg-white p-0.5'
            />
            <Input
              value={color.label}
              onChange={e => update(i, { label: e.target.value })}
              placeholder='Tên màu'
              className='h-8 border-neutral-200 bg-white text-xs'
            />
            <Input
              value={color.hex}
              onChange={e => update(i, { hex: e.target.value })}
              placeholder='#000000'
              className='h-8 w-24 shrink-0 border-neutral-200 bg-white text-xs'
            />
            <button
              type='button'
              onClick={() => remove(i)}
              aria-label={`Xoá màu ${i + 1}`}
              className='flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-md text-rose-500 hover:bg-rose-50'
            >
              <Trash2 className='size-3.5' />
            </button>
          </div>
        ))}
      </div>
      <AddRow
        onAdd={() => write([...colors, { ...GAMBIT_DETAILS_NEW_COLOR }])}
        label='Thêm màu'
      />
    </PopoverTrigger>
  );
}

function GambitDetailsSizesControls({
  content,
  onContentChange,
}: {
  content: GambitProductDetailsContent;
  onContentChange: (next: BlockContent) => void;
}) {
  const sizes = resolveGambitDetailsSizes(content);

  const write = (next: string[]) =>
    onContentChange({ ...content, sizes: next } as BlockContent);

  const remove = (i: number) => {
    if (sizes.length <= 1) {
      toast.error('Cần ít nhất 1 size');
      return;
    }
    write(sizes.filter((_, idx) => idx !== i));
  };

  return (
    <PopoverTrigger
      label='Size'
      preview={`${sizes.length} size`}
      icon={<Ruler className='size-3.5' />}
      width={320}
    >
      <div className='flex max-h-80 flex-col gap-2 overflow-y-auto pr-1'>
        {sizes.map((size, i) => (
          <div
            key={`gambit-detail-size-${i}`}
            className='flex items-center gap-2'
          >
            <Input
              value={size}
              onChange={e =>
                write(sizes.map((s, idx) => (idx === i ? e.target.value : s)))
              }
              placeholder='Tên size'
              className='h-8 border-neutral-200 bg-white text-xs'
            />
            <button
              type='button'
              onClick={() => remove(i)}
              aria-label={`Xoá size ${i + 1}`}
              className='flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-md text-rose-500 hover:bg-rose-50'
            >
              <Trash2 className='size-3.5' />
            </button>
          </div>
        ))}
      </div>
      <AddRow
        onAdd={() => write([...sizes, GAMBIT_DETAILS_NEW_SIZE])}
        label='Thêm size'
      />
    </PopoverTrigger>
  );
}

function GambitDetailsAccordionsControls({
  content,
  onContentChange,
}: {
  content: GambitProductDetailsContent;
  onContentChange: (next: BlockContent) => void;
}) {
  const items = resolveGambitDetailsAccordions(content);

  const write = (next: GambitProductDetailsAccordion[]) =>
    onContentChange({ ...content, accordions: next } as BlockContent);

  const update = (i: number, patch: Partial<GambitProductDetailsAccordion>) =>
    write(items.map((it, idx) => (idx === i ? { ...it, ...patch } : it)));

  const remove = (i: number) => {
    if (items.length <= 1) {
      toast.error('Cần ít nhất 1 mục');
      return;
    }
    write(items.filter((_, idx) => idx !== i));
  };

  return (
    <PopoverTrigger
      label='Accordion'
      preview={`${items.length} mục`}
      icon={<ListChecks className='size-3.5' />}
      width={440}
    >
      <div className='flex max-h-80 flex-col gap-2 overflow-y-auto pr-1'>
        {items.map((item, i) => (
          <div
            key={`gambit-detail-acc-${i}`}
            className='flex flex-col gap-1.5 rounded-md border border-neutral-200 bg-white p-2'
          >
            <div className='flex items-center gap-2'>
              <Input
                value={item.title}
                onChange={e => update(i, { title: e.target.value })}
                placeholder='Tiêu đề'
                className='h-8 border-neutral-200 bg-white text-xs font-semibold'
              />
              <button
                type='button'
                onClick={() => remove(i)}
                aria-label={`Xoá mục ${i + 1}`}
                className='flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-md text-rose-500 hover:bg-rose-50'
              >
                <Trash2 className='size-3.5' />
              </button>
            </div>
            <Textarea
              value={item.body}
              onChange={e => update(i, { body: e.target.value })}
              placeholder='Nội dung'
              className='min-h-16 resize-none border-neutral-200 bg-white text-xs'
            />
          </div>
        ))}
      </div>
      <AddRow
        onAdd={() => write([...items, { ...GAMBIT_DETAILS_NEW_ACCORDION }])}
        label='Thêm mục'
      />
    </PopoverTrigger>
  );
}

/**
 * Hành động: nhãn + icon dựng sẵn + cờ "nhấn" (nền đen). URL đặt qua link
 * picker của từng layer `actions[i].href` — không nhập tay ở đây.
 */
function GambitDetailsActionsControls({
  content,
  onContentChange,
}: {
  content: GambitProductDetailsContent;
  onContentChange: (next: BlockContent) => void;
}) {
  const actions = resolveGambitDetailsActions(content);

  const write = (next: GambitProductDetailsAction[]) =>
    onContentChange({ ...content, actions: next } as BlockContent);

  const update = (i: number, patch: Partial<GambitProductDetailsAction>) =>
    write(actions.map((a, idx) => (idx === i ? { ...a, ...patch } : a)));

  const remove = (i: number) => {
    if (actions.length <= 1) {
      toast.error('Cần ít nhất 1 hành động');
      return;
    }
    write(actions.filter((_, idx) => idx !== i));
  };

  return (
    <PopoverTrigger
      label='Hành động'
      preview={`${actions.length} dòng`}
      icon={<MousePointerClick className='size-3.5' />}
      width={440}
    >
      <div className='flex max-h-80 flex-col gap-2 overflow-y-auto pr-1'>
        {actions.map((action, i) => (
          <div
            key={`gambit-detail-action-${i}`}
            className='flex items-center gap-2'
          >
            <Input
              value={action.label}
              onChange={e => update(i, { label: e.target.value })}
              placeholder='Nhãn'
              className='h-8 border-neutral-200 bg-white text-xs'
            />
            <select
              value={action.icon}
              onChange={e =>
                update(i, {
                  icon: e.target.value as GambitProductDetailsActionIcon,
                })
              }
              aria-label={`Icon hành động ${i + 1}`}
              className='text-2xs h-8 shrink-0 rounded-md border border-neutral-200 bg-white px-1'
            >
              {GAMBIT_DETAILS_ACTION_ICONS.map(opt => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <label className='text-2xs flex shrink-0 cursor-pointer items-center gap-1 text-neutral-600'>
              <input
                type='checkbox'
                checked={Boolean(action.primary)}
                onChange={e => update(i, { primary: e.target.checked })}
                className='size-3.5 cursor-pointer'
              />
              Nhấn
            </label>
            <button
              type='button'
              onClick={() => remove(i)}
              aria-label={`Xoá hành động ${i + 1}`}
              className='flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-md text-rose-500 hover:bg-rose-50'
            >
              <Trash2 className='size-3.5' />
            </button>
          </div>
        ))}
      </div>
      <AddRow
        onAdd={() => write([...actions, { ...GAMBIT_DETAILS_NEW_ACTION }])}
        label='Thêm hành động'
      />
    </PopoverTrigger>
  );
}

function CiteFlowFaqsControls({
  content,
  onContentChange,
}: {
  content: CiteFlowFaqContent;
  onContentChange: (next: BlockContent) => void;
}) {
  const items = content.items ?? [];

  const update = (i: number, patch: Partial<CiteFlowFaqItem>) =>
    onContentChange({
      ...content,
      items: items.map((it, idx) => (idx === i ? { ...it, ...patch } : it)),
    } as BlockContent);

  const remove = (i: number) =>
    onContentChange({
      ...content,
      items: items.filter((_, idx) => idx !== i),
    } as BlockContent);

  const add = () =>
    onContentChange({
      ...content,
      items: [
        ...items,
        {
          question: 'Câu hỏi mới',
          answer: '',
        },
      ],
    } as BlockContent);

  return (
    <PopoverTrigger label='FAQ' preview={`${items.length} mục`} width={460}>
      <div className='flex max-h-80 flex-col gap-2 overflow-y-auto pr-1'>
        {items.length === 0 ? (
          <p className='text-2xs rounded-md border border-dashed border-neutral-200 bg-neutral-50 px-3 py-4 text-center text-neutral-500'>
            Chưa có FAQ — thêm câu hỏi / trả lời.
          </p>
        ) : null}
        {items.map((it, i) => (
          <div
            key={`cfl-faq-${i}`}
            className='flex flex-col gap-1.5 rounded-md border border-neutral-200 bg-white p-2'
          >
            <div className='flex items-center gap-2'>
              <Input
                value={it.question}
                onChange={e => update(i, { question: e.target.value })}
                placeholder='Câu hỏi'
                className='h-8 border-neutral-200 bg-white text-xs font-semibold'
              />
              <button
                type='button'
                onClick={() => remove(i)}
                aria-label='Xoá FAQ'
                className='flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-md text-rose-500 hover:bg-rose-50'
              >
                <Trash2 className='size-3.5' />
              </button>
            </div>
            <Textarea
              value={it.answer}
              onChange={e => update(i, { answer: e.target.value })}
              placeholder='Trả lời'
              className='min-h-16 resize-none border-neutral-200 bg-white text-xs'
            />
          </div>
        ))}
      </div>
      <AddRow onAdd={add} label='Thêm FAQ' />
    </PopoverTrigger>
  );
}

function CiteFlowAmenityListControls({
  content,
  onContentChange,
}: {
  content: CiteFlowAmenityContent;
  onContentChange: (next: BlockContent) => void;
}) {
  const items = content.listItems ?? [];

  const update = (i: number, value: string) =>
    onContentChange({
      ...content,
      listItems: items.map((it, idx) => (idx === i ? value : it)),
    } as BlockContent);

  const remove = (i: number) =>
    onContentChange({
      ...content,
      listItems: items.filter((_, idx) => idx !== i),
    } as BlockContent);

  const add = () =>
    onContentChange({
      ...content,
      listItems: [...items, 'Mục mới'],
    } as BlockContent);

  return (
    <PopoverTrigger
      label='Danh sách'
      preview={`${items.length} mục`}
      width={420}
    >
      <div className='flex max-h-80 flex-col gap-2 overflow-y-auto pr-1'>
        {items.length === 0 ? (
          <p className='text-2xs rounded-md border border-dashed border-neutral-200 bg-neutral-50 px-3 py-4 text-center text-neutral-500'>
            Chưa có mục — thêm dòng mới.
          </p>
        ) : null}
        {items.map((it, i) => (
          <div key={`cfl-amenity-${i}`} className='flex items-center gap-2'>
            <Input
              value={it}
              onChange={e => update(i, e.target.value)}
              placeholder='Nội dung'
              className='h-8 border-neutral-200 bg-white text-xs'
            />
            <button
              type='button'
              onClick={() => remove(i)}
              aria-label='Xoá mục'
              className='flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-md text-rose-500 hover:bg-rose-50'
            >
              <Trash2 className='size-3.5' />
            </button>
          </div>
        ))}
      </div>
      <AddRow onAdd={add} label='Thêm mục' />
    </PopoverTrigger>
  );
}

function CiteFlowHeaderSocialLinksControls({
  content,
  onContentChange,
}: {
  content: CiteFlowHeaderContent;
  onContentChange: (next: BlockContent) => void;
}) {
  const links = content.socialLinks ?? [];

  const update = (i: number, patch: Partial<CiteFlowHeaderSocialLink>) =>
    onContentChange({
      ...content,
      socialLinks: links.map((l, idx) => (idx === i ? { ...l, ...patch } : l)),
    } as BlockContent);

  const remove = (i: number) =>
    onContentChange({
      ...content,
      socialLinks: links.filter((_, idx) => idx !== i),
    } as BlockContent);

  const add = () =>
    onContentChange({
      ...content,
      socialLinks: [...links, { label: 'Social mới', href: '#' }],
    } as BlockContent);

  return (
    <PopoverTrigger label='Social' preview={`${links.length} mục`} width={420}>
      <div className='flex max-h-80 flex-col gap-2 overflow-y-auto pr-1'>
        {links.length === 0 ? (
          <p className='text-2xs rounded-md border border-dashed border-neutral-200 bg-neutral-50 px-3 py-4 text-center text-neutral-500'>
            Chưa có social — thêm link mới.
          </p>
        ) : null}
        {links.map((l, i) => (
          <div
            key={`cfl-social-${i}`}
            className='flex flex-col gap-1.5 rounded-md border border-neutral-200 bg-white p-2'
          >
            <div className='flex items-center gap-2'>
              <Input
                value={l.label}
                onChange={e => update(i, { label: e.target.value })}
                placeholder='Nhãn'
                className='h-8 border-neutral-200 bg-white text-xs font-semibold'
              />
              <button
                type='button'
                onClick={() => remove(i)}
                aria-label='Xoá social'
                className='flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-md text-rose-500 hover:bg-rose-50'
              >
                <Trash2 className='size-3.5' />
              </button>
            </div>
            <Input
              value={l.href}
              onChange={e => update(i, { href: e.target.value })}
              placeholder='Link'
              className='h-8 border-neutral-200 bg-white text-xs'
            />
          </div>
        ))}
      </div>
      <AddRow onAdd={add} label='Thêm social' />
    </PopoverTrigger>
  );
}

// ─────────────────────────────────────────── DELVAUX FRAMES (pattern + JSON)

function resolveDelvauxFrameCount(content: DelvauxHeroContent): number {
  if (Array.isArray(content.frameUrls) && content.frameUrls.length > 1) {
    return content.frameUrls.length;
  }
  const pattern = content.frameUrlPattern ?? '';
  const n = Number(content.frameCount) || 0;
  if (pattern.includes('{i}') && n > 1) return n;
  return 0;
}

function DelvauxFramesControls({
  content,
  onContentChange,
}: {
  content: DelvauxHeroContent;
  onContentChange: (next: BlockContent) => void;
}) {
  const listCount = Array.isArray(content.frameUrls)
    ? content.frameUrls.length
    : 0;
  const usesList = listCount > 1;
  const count = resolveDelvauxFrameCount(content);
  const isDefault =
    usesList &&
    listCount === DELVAUX_HERO_FRAMES.length &&
    content.frameUrls?.[0] === DELVAUX_HERO_FRAMES[0];

  const [pattern, setPattern] = React.useState(
    () => content.frameUrlPattern ?? ''
  );
  const [frameCount, setFrameCount] = React.useState(() =>
    String(content.frameCount > 1 ? content.frameCount : 96)
  );
  const [draft, setDraft] = React.useState(() =>
    JSON.stringify(usesList ? content.frameUrls : DELVAUX_HERO_FRAMES, null, 2)
  );
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    setPattern(content.frameUrlPattern ?? '');
    setFrameCount(String(content.frameCount > 1 ? content.frameCount : 96));
    const list =
      Array.isArray(content.frameUrls) && content.frameUrls.length > 1
        ? content.frameUrls
        : DELVAUX_HERO_FRAMES;
    setDraft(JSON.stringify(list, null, 2));
    setError(null);
  }, [content.frameUrls, content.frameUrlPattern, content.frameCount]);

  const handleApplyPattern = () => {
    const trimmed = pattern.trim();
    const n = Math.floor(Number(frameCount));
    if (!trimmed.includes('{i}')) {
      setError('URL phải chứa {i} (chỉ số frame 1-based).');
      toast.error('Pattern thiếu {i}');
      return;
    }
    if (!Number.isFinite(n) || n < 2) {
      setError('Số frame phải ≥ 2.');
      toast.error('Số frame không hợp lệ');
      return;
    }
    setError(null);
    onContentChange({
      ...content,
      frameUrlPattern: trimmed,
      frameCount: n,
      frameUrls: [],
    } as BlockContent);
    toast.success(`Đã áp dụng pattern · ${n} frames`);
  };

  const handleApplyJson = () => {
    try {
      const parsed: unknown = JSON.parse(draft);
      if (
        !Array.isArray(parsed) ||
        parsed.length < 2 ||
        !parsed.every(u => typeof u === 'string' && u.trim().length > 0)
      ) {
        setError('JSON phải là mảng ≥ 2 URL string.');
        toast.error('JSON frames sai schema');
        return;
      }
      const urls = parsed.map(u => (u as string).trim());
      setError(null);
      onContentChange({
        ...content,
        frameUrls: urls,
        frameCount: urls.length,
        frameUrlPattern: '',
      } as BlockContent);
      toast.success(`Đã cập nhật chuỗi frame · ${urls.length} frames`);
    } catch {
      setError('Không parse được JSON.');
      toast.error('JSON không hợp lệ');
    }
  };

  const handleReset = () => {
    onContentChange({
      ...content,
      frameUrls: [...DELVAUX_HERO_FRAMES],
      frameCount: DELVAUX_HERO_FRAMES.length,
      frameUrlPattern: '',
    } as BlockContent);
    setDraft(JSON.stringify(DELVAUX_HERO_FRAMES, null, 2));
    setPattern('');
    setFrameCount(String(DELVAUX_HERO_FRAMES.length));
    setError(null);
    toast.success(
      `Đã reset chuỗi frame · ${DELVAUX_HERO_FRAMES.length} frames`
    );
  };

  const modeLabel = isDefault
    ? ' (mặc định)'
    : usesList
      ? ' (JSON)'
      : count > 0
        ? ' (pattern)'
        : '';

  return (
    <PopoverTrigger
      label='Chuỗi frame'
      preview={`${count || 0} frames${modeLabel}`}
      width={520}
    >
      <p className='text-2xs mb-2 text-neutral-500'>
        Lớp intro tua theo scroll sau khi ảnh khung fade. Dùng pattern URL có
        {' {i} '}hoặc dán JSON mảng URL (CDN uuid).
      </p>

      <p className='text-2xs mb-1 font-medium text-neutral-700'>
        Pattern nhanh
      </p>
      <Input
        value={pattern}
        onChange={e => {
          setPattern(e.target.value);
          setError(null);
        }}
        placeholder='https://cdn.example.com/frame-{i}.jpg'
        className='mb-1.5 h-8 border-neutral-200 bg-white font-mono text-[11px]'
        aria-label='Frame URL pattern'
      />
      <div className='mb-2 flex gap-1.5'>
        <Input
          type='number'
          min={2}
          value={frameCount}
          onChange={e => {
            setFrameCount(e.target.value);
            setError(null);
          }}
          className='h-8 w-24 border-neutral-200 bg-white text-xs'
          aria-label='Số frame'
        />
        <button
          type='button'
          onClick={handleApplyPattern}
          className='flex h-8 flex-1 cursor-pointer items-center justify-center rounded-md bg-neutral-900 text-xs font-medium text-white transition-colors hover:bg-neutral-800'
        >
          Áp dụng pattern
        </button>
      </div>

      <p className='text-2xs mb-1 font-medium text-neutral-700'>
        JSON mảng URL
      </p>
      <Textarea
        value={draft}
        onChange={e => {
          setDraft(e.target.value);
          setError(null);
        }}
        spellCheck={false}
        data-lenis-prevent
        className='mb-2 field-sizing-fixed h-40 max-h-[40vh] min-h-0 resize-y overflow-y-auto overscroll-contain border-neutral-200 bg-white font-mono text-[11px] leading-relaxed'
        aria-label='Frames JSON array'
      />
      {error && (
        <p className='text-2xs mb-2 text-rose-600' role='alert'>
          {error}
        </p>
      )}
      <div className='flex gap-1.5'>
        <button
          type='button'
          onClick={handleApplyJson}
          className='flex h-8 flex-1 cursor-pointer items-center justify-center rounded-md bg-neutral-900 text-xs font-medium text-white transition-colors hover:bg-neutral-800'
        >
          Áp dụng JSON
        </button>
        <button
          type='button'
          onClick={handleReset}
          className='flex h-8 flex-1 cursor-pointer items-center justify-center rounded-md bg-neutral-50 text-xs font-medium text-neutral-700 ring-1 ring-neutral-200/70 transition-colors hover:bg-white'
        >
          Reset mặc định
        </button>
      </div>
    </PopoverTrigger>
  );
}

// ─────────────────────────────────────────── PNJ SCRIM (preset + JSON)

function PnjScrimControls({
  content,
  onContentChange,
}: {
  content: PnjHeroContent;
  onContentChange: (next: BlockContent) => void;
}) {
  const resolved = resolvePnjHeroScrim(content);
  const [draft, setDraft] = React.useState(() =>
    JSON.stringify(resolved.layers, null, 2)
  );
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    setDraft(JSON.stringify(resolvePnjHeroScrim(content).layers, null, 2));
    setError(null);
  }, [content.scrim]);

  const preview = resolved.isCustom
    ? `custom · ${resolved.layers.length} layer`
    : PNJ_HERO_SCRIM_PRESET_LABELS[resolved.presetId];

  const handlePreset = (preset: (typeof PNJ_HERO_SCRIM_PRESET_IDS)[number]) => {
    onContentChange({
      ...content,
      scrim: { preset },
    } as BlockContent);
    toast.success(`Scrim: ${PNJ_HERO_SCRIM_PRESET_LABELS[preset]}`);
  };

  const handleApplyJson = () => {
    try {
      const parsed: unknown = JSON.parse(draft);
      if (!Array.isArray(parsed)) {
        setError('JSON phải là mảng layers.');
        toast.error('JSON scrim không hợp lệ');
        return;
      }
      const candidate = { layers: parsed };
      if (!isPnjHeroScrimConfig(candidate)) {
        setError(
          'Mỗi layer cần background (string); top/right/bottom/left/height/width? string; opacity? number.'
        );
        toast.error('JSON scrim sai schema');
        return;
      }
      setError(null);
      onContentChange({
        ...content,
        scrim: {
          preset: content.scrim?.preset ?? 'pnj',
          layers: candidate.layers,
        },
      } as BlockContent);
      toast.success(
        `Đã cập nhật ${candidate.layers?.length ?? 0} lớp mờ (custom)`
      );
    } catch {
      setError('Không parse được JSON.');
      toast.error('JSON không hợp lệ');
    }
  };

  const handleReset = () => {
    const next = { ...content } as Record<string, unknown>;
    delete next.scrim;
    onContentChange(next as BlockContent);
    setDraft(JSON.stringify(PNJ_HERO_SCRIM_PNJ_LAYERS, null, 2));
    setError(null);
    toast.success('Đã reset lớp mờ về PNJ mặc định');
  };

  return (
    <PopoverTrigger label='Lớp mờ' preview={preview} width={480}>
      <p className='text-2xs mb-2 text-neutral-500'>
        Preset nhanh hoặc JSON layers (background CSS + vị trí tùy chọn).
      </p>
      <div className='mb-2 flex flex-wrap gap-1.5'>
        {PNJ_HERO_SCRIM_PRESET_IDS.map(id => {
          const active = !resolved.isCustom && resolved.presetId === id;
          return (
            <button
              key={id}
              type='button'
              onClick={() => handlePreset(id)}
              className={cn(
                'h-7 cursor-pointer rounded-md px-2.5 text-[11px] font-medium transition-colors',
                active
                  ? 'bg-neutral-900 text-white'
                  : 'bg-neutral-50 text-neutral-700 ring-1 ring-neutral-200/70 hover:bg-white'
              )}
            >
              {PNJ_HERO_SCRIM_PRESET_LABELS[id]}
            </button>
          );
        })}
      </div>
      <Textarea
        value={draft}
        onChange={e => {
          setDraft(e.target.value);
          setError(null);
        }}
        spellCheck={false}
        data-lenis-prevent
        className='field-sizing-fixed h-48 max-h-[40vh] min-h-0 resize-y overflow-y-auto overscroll-contain border-neutral-200 bg-white font-mono text-[11px] leading-relaxed'
        aria-label='Scrim layers JSON'
      />
      {error && (
        <p className='text-2xs mt-1.5 text-rose-600' role='alert'>
          {error}
        </p>
      )}
      <div className='mt-2 flex gap-1.5'>
        <button
          type='button'
          onClick={handleApplyJson}
          className='flex h-8 flex-1 cursor-pointer items-center justify-center rounded-md bg-neutral-900 text-xs font-medium text-white transition-colors hover:bg-neutral-800'
        >
          Áp dụng JSON
        </button>
        <button
          type='button'
          onClick={handleReset}
          className='flex h-8 flex-1 cursor-pointer items-center justify-center rounded-md bg-neutral-50 text-xs font-medium text-neutral-700 ring-1 ring-neutral-200/70 transition-colors hover:bg-white'
        >
          Reset PNJ
        </button>
      </div>
    </PopoverTrigger>
  );
}

// ─────────────────────────────────────────────────────────── AI BUTTON

function AiButton({
  onAi,
  blockType,
}: {
  onAi: (prompt: string) => Promise<void>;
  blockType: string;
}) {
  const [open, setOpen] = React.useState(false);
  const [prompt, setPrompt] = React.useState('');
  const [busy, setBusy] = React.useState(false);

  const submit = async () => {
    setBusy(true);
    try {
      await onAi(prompt);
      setPrompt('');
      setOpen(false);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button
          type='button'
          aria-label='AI tạo nội dung'
          title='AI tạo nội dung'
          className='flex h-7 cursor-pointer items-center gap-1 rounded-md bg-neutral-900 px-2.5 text-[10px] font-semibold tracking-wide text-white transition-colors hover:bg-neutral-800'
        >
          <Sparkles className='size-3.5 text-sky-300' />
          AI
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          align='end'
          sideOffset={8}
          className='z-50 w-80 rounded-lg border border-neutral-200/80 bg-white p-3 shadow-[0_8px_24px_rgba(0,0,0,0.08),0_2px_4px_rgba(0,0,0,0.04)] outline-none'
        >
          <div className='mb-2 flex items-center gap-2'>
            <Sparkles className='size-3 text-violet-500' />
            <span className='text-3xs font-semibold tracking-[0.16em] text-neutral-700 uppercase'>
              AI tạo nội dung
            </span>
            <span className='text-3xs ml-auto font-mono tracking-tight text-neutral-400'>
              {blockType.replace('_', ' ')}
            </span>
          </div>
          <Textarea
            autoFocus
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey) && !busy) {
                e.preventDefault();
                void submit();
              }
            }}
            placeholder='Mô tả gì bạn muốn AI viết… (⌘+Enter để gửi)'
            className='min-h-20 resize-none border-neutral-200 bg-white text-xs leading-5'
          />
          <div className='mt-2 flex items-center justify-between'>
            <span className='text-3xs font-mono tracking-tight text-neutral-400'>
              ⌘ Enter
            </span>
            <button
              type='button'
              onClick={() => void submit()}
              disabled={busy}
              className='text-2xs flex h-7 cursor-pointer items-center gap-1.5 rounded-md bg-neutral-900 px-3 font-semibold tracking-tight text-white transition-colors hover:bg-neutral-700 disabled:opacity-50'
            >
              {busy ? (
                <>
                  <Loader2 className='size-3 animate-spin' />
                  Đang tạo…
                </>
              ) : (
                <>
                  <Sparkles className='size-3 text-violet-300' />
                  Tạo
                </>
              )}
            </button>
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}

// ─────────────────────────────────────────────────────────── HELPERS

function PopoverTrigger({
  label,
  preview,
  icon,
  width = 360,
  primary = false,
  children,
}: {
  label: string;
  preview: string;
  icon?: React.ReactNode;
  width?: number;
  /** Emphasize as the main action in a sparse toolbar (e.g. image manage). */
  primary?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <button
          type='button'
          className={cn(
            'flex h-7 cursor-pointer items-center gap-1.5 rounded-md px-2.5 text-[11px] font-medium transition-colors',
            primary
              ? 'bg-neutral-900 text-white hover:bg-neutral-800'
              : 'bg-neutral-50 text-neutral-700 ring-1 ring-neutral-200/70 hover:bg-white hover:text-neutral-900 hover:ring-neutral-300'
          )}
        >
          {icon ? (
            <span
              className={cn(
                'shrink-0',
                primary ? 'text-white/80' : 'text-neutral-500'
              )}
            >
              {icon}
            </span>
          ) : null}
          <span className={cn(primary ? 'text-white' : 'text-neutral-800')}>
            {label}
          </span>
          <span
            className={cn(
              'max-w-[9rem] truncate text-[11px]',
              primary ? 'text-white/55' : 'text-neutral-400'
            )}
          >
            {preview}
          </span>
          <ChevronDown
            className={cn(
              'size-3.5 shrink-0',
              primary ? 'text-white/50' : 'text-neutral-400'
            )}
          />
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          align='start'
          sideOffset={10}
          style={{ width }}
          className='z-50 flex flex-col gap-2.5 rounded-xl border border-neutral-200/80 bg-white p-3.5 shadow-[0_12px_40px_rgba(15,15,15,0.1),0_2px_6px_rgba(15,15,15,0.04)] outline-none'
        >
          {children}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}

function ToolbarBtn({
  active,
  label,
  className,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  active?: boolean;
  label?: string;
}) {
  return (
    <button
      type='button'
      title={label}
      aria-label={label}
      aria-pressed={active}
      className={cn(
        'flex size-7 cursor-pointer items-center justify-center rounded-md text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900',
        active &&
          'bg-neutral-900 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] hover:bg-neutral-900 hover:text-white',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

function AddRow({ onAdd, label }: { onAdd: () => void; label: string }) {
  return (
    <button
      type='button'
      onClick={e => {
        e.preventDefault();
        e.stopPropagation();
        onAdd();
      }}
      className='flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-dashed border-neutral-300 py-2 text-xs font-medium text-neutral-500 hover:border-neutral-900 hover:text-neutral-900'
    >
      <Plus className='size-3.5' />
      {label}
    </button>
  );
}

function Sep() {
  return <div className='mx-0.5 h-5 w-px shrink-0 bg-neutral-200/90' />;
}

function InlineLabel({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <span className='flex items-center gap-2'>
      <span className='text-[10px] font-medium tracking-[0.06em] text-neutral-400 uppercase'>
        {label}
      </span>
      {children}
    </span>
  );
}

// ─────────────────────────────────────────── COLOR SWATCH (token + custom hex)

function normalizeCssColor(raw: string): string | null {
  const s = raw.trim();
  if (!s) return null;
  if (/^(rgb|rgba|hsl|hsla)\(/i.test(s)) return s;
  const withHash = s.startsWith('#') ? s : `#${s}`;
  if (/^#([0-9a-fA-F]{3})$/.test(withHash)) {
    const [, a, b, c] = withHash.match(/^#(.)(.)(.)$/)!;
    return `#${a}${a}${b}${b}${c}${c}`.toLowerCase();
  }
  if (/^#([0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(withHash)) {
    return withHash.toLowerCase();
  }
  return null;
}

/** Display value for the hex field — raw color as-is, token → preview hex. */
function colorInputDisplay(value: string): string {
  const role = brandTokenKey(value);
  if (role) return previewColor(role);
  if (/^#|^rgb|^hsl/i.test(value.trim())) return value.trim();
  return value;
}

// Brand token swatches + free-form hex/rgb. Tokens store `token:<role>`;
// custom colors store raw CSS so `resolveColorValue` passes them through.
function ColorSwatch({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (next: string) => void;
}) {
  const activeRole = brandTokenKey(value);
  const isCustom = !activeRole;
  const [draft, setDraft] = React.useState(() => colorInputDisplay(value));
  const [hexError, setHexError] = React.useState(false);
  const valueRef = React.useRef(value);
  const draftRef = React.useRef(draft);
  const onChangeRef = React.useRef(onChange);
  valueRef.current = value;
  draftRef.current = draft;
  onChangeRef.current = onChange;

  React.useEffect(() => {
    setDraft(colorInputDisplay(value));
    setHexError(false);
  }, [value]);

  // Commit pending hex on unmount — clicking canvas closes the toolbar
  // without firing input blur, which used to drop the typed color.
  React.useEffect(() => {
    return () => {
      const next = normalizeCssColor(draftRef.current);
      if (!next) return;
      if (next === valueRef.current) return;
      if (next === colorInputDisplay(valueRef.current)) return;
      onChangeRef.current(next);
    };
  }, []);

  const commitHex = (raw: string, { soft = false } = {}) => {
    const next = normalizeCssColor(raw);
    if (!next) {
      if (!soft) {
        setHexError(true);
        setDraft(colorInputDisplay(value));
      }
      return;
    }
    setHexError(false);
    if (next !== value) onChange(next);
  };

  const nativeColor =
    normalizeCssColor(colorInputDisplay(value))?.slice(0, 7) ?? '#111111';

  return (
    <div
      className='flex h-7 items-center gap-1.5 rounded-md px-1.5'
      title={`${label} — token thương hiệu hoặc mã màu`}
    >
      <span className='text-3xs font-mono tracking-[0.08em] text-neutral-400 uppercase'>
        {label}
      </span>
      <div className='flex items-center gap-1'>
        {BRAND_COLOR_ROLES.map(role => {
          const selected = activeRole === role.key;
          return (
            <button
              key={role.key}
              type='button'
              onClick={() => onChange(brandToken(role.key))}
              title={role.label}
              aria-label={`${label}: ${role.label}`}
              className={cn(
                'size-4 rounded-sm ring-1 ring-black/10 transition',
                selected && 'ring-2 ring-sky-500 ring-offset-1'
              )}
              style={{ backgroundColor: previewColor(role.key) }}
            />
          );
        })}
      </div>
      <span className='mx-0.5 h-4 w-px shrink-0 bg-neutral-200' aria-hidden />
      <label className='relative size-4 shrink-0 cursor-pointer overflow-hidden rounded-sm ring-1 ring-black/10'>
        <span
          className='pointer-events-none absolute inset-0'
          style={{ backgroundColor: nativeColor }}
          aria-hidden
        />
        <input
          type='color'
          value={nativeColor}
          onChange={e => onChange(e.target.value.toLowerCase())}
          aria-label={`${label}: chọn màu`}
          className='absolute inset-0 cursor-pointer opacity-0'
        />
      </label>
      <Input
        value={draft}
        onChange={e => {
          const next = e.target.value;
          setDraft(next);
          setHexError(false);
          // Live-apply when the typed value is already a complete valid color.
          commitHex(next, { soft: true });
        }}
        onBlur={() => commitHex(draft)}
        onKeyDown={e => {
          if (e.key === 'Enter') {
            e.preventDefault();
            commitHex(draft);
          }
        }}
        placeholder='#hex'
        spellCheck={false}
        aria-label={`${label}: mã màu`}
        aria-invalid={hexError}
        className={cn(
          'h-6 w-[5.5rem] border-neutral-200 bg-white px-1.5 font-mono text-[10px] tracking-tight',
          isCustom && 'ring-1 ring-sky-400/60',
          hexError && 'border-rose-400 text-rose-600'
        )}
      />
    </div>
  );
}

// ─────────────────────────────── WESTLY RESIDENCES (hotspot bản vẽ)
function WestlyResidenceHotspotsControls({
  content,
  selectedKey,
  onContentChange,
}: {
  content: WestlyResidencesContent;
  selectedKey: string;
  onContentChange: (next: BlockContent) => void;
}) {
  const match = selectedKey.match(/^residences\[(\d+)\]\.hotspots$/);
  const idx = match ? Number(match[1]) : 0;
  // resolve có fallback: content rỗng thì lần chỉnh đầu materialize bộ mặc
  // định vào content (copy-on-write).
  const residences = resolveWestlyResidences(content);
  const hotspots = residences[idx]?.hotspots ?? [];

  const commit = (next: WestlyResidenceHotspot[]) =>
    onContentChange({
      ...content,
      residences: residences.map((r, i) =>
        i === idx ? { ...r, hotspots: next } : r
      ),
    } as BlockContent);

  const updateSpot = (i: number, patch: Partial<WestlyResidenceHotspot>) =>
    commit(hotspots.map((h, hi) => (hi === i ? { ...h, ...patch } : h)));
  const removeSpot = (i: number) =>
    commit(hotspots.filter((_, hi) => hi !== i));
  const addSpot = () =>
    commit([
      ...hotspots,
      {
        id: `hs_${Date.now().toString(36)}`,
        name: 'Điểm mới',
        x: 50,
        y: 50,
        specs: [{ label: 'Dimension', value: '' }],
      },
    ]);

  const updateSpec = (
    i: number,
    si: number,
    patch: Partial<{ label: string; value: string }>
  ) =>
    updateSpot(i, {
      specs: (hotspots[i]?.specs ?? []).map((sp, spi) =>
        spi === si ? { ...sp, ...patch } : sp
      ),
    });
  const addSpec = (i: number) =>
    updateSpot(i, {
      specs: [...(hotspots[i]?.specs ?? []), { label: '', value: '' }],
    });
  const removeSpec = (i: number, si: number) =>
    updateSpot(i, {
      specs: (hotspots[i]?.specs ?? []).filter((_, spi) => spi !== si),
    });

  return (
    <PopoverTrigger
      label={`Hotspot — ${residences[idx]?.title ?? `Căn ${idx + 1}`}`}
      preview={`${hotspots.length} hotspot`}
      width={480}
    >
      <div className='flex max-h-80 flex-col gap-2 overflow-y-auto pr-1'>
        {hotspots.length === 0 ? (
          <p className='text-2xs rounded-md border border-dashed border-neutral-200 bg-neutral-50 px-3 py-4 text-center text-neutral-500'>
            Chưa có hotspot trên bản vẽ này.
          </p>
        ) : null}
        {hotspots.map((h, i) => (
          <div
            key={h.id || i}
            className='flex flex-col gap-1.5 rounded-md border border-neutral-200 bg-white p-2'
          >
            <div className='flex items-center gap-2'>
              <Input
                value={h.name ?? ''}
                onChange={e => updateSpot(i, { name: e.target.value })}
                placeholder='Tên phòng'
                className='h-8 border-neutral-200 bg-white text-xs font-semibold'
              />
              <button
                type='button'
                onClick={() => removeSpot(i)}
                aria-label='Xoá hotspot'
                className='flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-md text-rose-500 hover:bg-rose-50'
              >
                <Trash2 className='size-3.5' />
              </button>
            </div>
            <div className='flex items-center gap-2'>
              <label className='text-2xs flex flex-1 items-center gap-1 text-neutral-500'>
                X%
                <Input
                  type='number'
                  min={0}
                  max={100}
                  step={0.5}
                  value={h.x ?? 0}
                  onChange={e => updateSpot(i, { x: Number(e.target.value) })}
                  className='h-8 border-neutral-200 bg-white text-xs'
                />
              </label>
              <label className='text-2xs flex flex-1 items-center gap-1 text-neutral-500'>
                Y%
                <Input
                  type='number'
                  min={0}
                  max={100}
                  step={0.5}
                  value={h.y ?? 0}
                  onChange={e => updateSpot(i, { y: Number(e.target.value) })}
                  className='h-8 border-neutral-200 bg-white text-xs'
                />
              </label>
            </div>
            {(h.specs ?? []).map((sp, si) => (
              <div key={si} className='flex items-center gap-1.5'>
                <Input
                  value={sp.label ?? ''}
                  onChange={e => updateSpec(i, si, { label: e.target.value })}
                  placeholder='Nhãn (Dimension…)'
                  className='h-7 border-neutral-200 bg-white text-xs'
                />
                <Input
                  value={sp.value ?? ''}
                  onChange={e => updateSpec(i, si, { value: e.target.value })}
                  placeholder='Giá trị'
                  className='h-7 border-neutral-200 bg-white text-xs'
                />
                <button
                  type='button'
                  onClick={() => removeSpec(i, si)}
                  aria-label='Xoá dòng spec'
                  className='flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-md text-rose-500 hover:bg-rose-50'
                >
                  <Trash2 className='size-3' />
                </button>
              </div>
            ))}
            <AddRow onAdd={() => addSpec(i)} label='Thêm dòng spec' />
          </div>
        ))}
      </div>
      <AddRow onAdd={addSpot} label='Thêm hotspot' />
    </PopoverTrigger>
  );
}
