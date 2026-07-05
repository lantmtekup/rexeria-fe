/**
 * Default content cho bộ block `q80_*` — copy/asset NGUYÊN BẢN của
 * quadplex80.com (trích runtime Pinia store của bản mirror; media đã migrate
 * lên S3/CloudFront qua BE media API — xem scratchpad q80-media-urls.json).
 *
 * FILE NÀY DO SCRIPT SINH RA (q80-gen-content trong scratchpad session) —
 * sửa nội dung thì sửa trực tiếp, nhưng đổi cấu trúc thì đổi types.ts trước.
 */
import type { Q80ExperienceContent, Q80MenuContent } from '../../../types';

export const Q80_EXPERIENCE_CONTENT: Q80ExperienceContent = {
  introTitle: 'Above\nThe\nClouds',
  introText:
    'Rise above the hustle and bustle of the city and escape to your private sanctuary in the clouds. Experience a world of endless horizons.',
  enterLabel: 'Enter experience',
  enterNoSoundLabel: 'Enter without sound',
  loadingLabel: 'Loading',
  homeEyebrow: '111 West 57th Street',
  homeTitle: 'Your Sanctuary\nIn The Clouds',
  homeText:
    'The most iconic of all Manhattan addresses will now be the location of the grandest residence of all.',
  homePrice: 'Offered at $98,000,000',
  overviewLabel: 'Overview',
  overviewTitle: 'Manhattan’s\nNewest Landmark',
  overviewDesc:
    'Manhattan’s most extraordinary residential offering at the crown of 111 West 57th Street, an architectural masterpiece by SHoP Architects with interior architecture by Studio Sofield. Across four floors, Quadplex 80 offers over 11,480 square feet of meticulously designed interior space and 618 square feet of breathtaking south-facing exterior terraces. The grand residence offers ﬁve bedrooms, six full bathrooms, and two powder rooms, providing plentiful space for refined living and entertaining.\n\n A private internal elevator and custom circular staircase offers access to a world of reﬁned elegance, where 360° open views reveal the splendor of the perfectly centered views of Central Park, dazzling city skyline, and river to river experience. Towering ceiling heights of up to 14 feet, coupled with ﬂoor-to-ceiling windows, ﬂood the space with natural light, showcasing the exquisite custom design details throughout. This is a once-in-a-lifetime purchasing opportunity.\n\nQuadplex 80 Residence Highlights:\n\n360-degree views overlooking Central Park, Manhattan skyline, and river to river\nFull ﬂoor 2,947 square-foot Primary Suite\nCrown Suite ﬂoor complete with billiards, full bar, screening room and sunset lounge\n2 Private Terraces\nFloor-to-ceiling windows\nCeiling heights up to 14’\nCustom spiral staircase\nWhite macauba stone ﬂoor at entry\nCustom smoke gray solid oak ﬂoors with intricate patterns in the Great Room\n9’ custom doors and transoms throughout with custom bronze door handles and hinges\nZoned year-round fan coil HVAC system\nPrivate internal elevator',
  overviewThumbUrl:
    'https://d10zufojjcedud.cloudfront.net/uploads/2307adca-e9b0-41d9-bf49-61ebf23faa45/quadplex80-ext-datocms-143478-1772466458-111-thumb.jpg',
  overviewFloorplanPdfUrl:
    'https://d10zufojjcedud.cloudfront.net/uploads/7281149e-6437-4e8e-a1bd-896e1a783eea/quadplex80-ext-datocms-143478-1741544774-quadplex-plans.pdf',
  homeViewVideoUrl:
    'https://d10zufojjcedud.cloudfront.net/uploads/4c7cabad-26f4-496d-9de2-7d1c49a90e78/quadplex80-ext-mux-stream-02m02xcpw102SbsAq402lDR02VvougICRYSA5-high.mp4',
  homeViewVideoLabel: '80 - Quadplex',
  infoItems: [
    {
      title: 'Interior Sq Ft / Sq M',
      text: '11,480 sq ft',
    },
    {
      title: 'Exterior Sq Ft / Sq M',
      text: '618 sq ft',
    },
    {
      title: 'Exposure',
      text: 'N,E,S,W',
    },
    {
      title: 'Bedroom/Bathroom',
      text: '5/6',
    },
    {
      title: 'Powder Room',
      text: '2',
    },
  ],
  features: [
    'Direct elevator entry',
    'White macauba stone floor at entry',
    "Ceiling heights up to 14'",
    'Floor-to-ceiling windows',
    'Custom smoke-gray solid oak floors with intricate pattern in Great Room',
    "9' custom doors and transoms throughout with custom, bronze door handles and hinges",
    'Zoned, year round fan coil HVAC system',
    'Private internal elevator',
    'Custom staircase',
    'Private outdoor space',
    'Observatory',
  ],
  floorplansLabel: 'Floor plans',
  suites: [
    {
      slug: 'great-room',
      title: 'Entertaining Suite',
      floorDisplay: '80th Floor',
      imageUrl:
        'https://d10zufojjcedud.cloudfront.net/uploads/3967ceaf-75cc-4e88-8f0f-f98c36278067/quadplex80-ext-datocms-143478-1772208514-quadplex-8.jpg',
      viewVideoUrl:
        'https://d10zufojjcedud.cloudfront.net/uploads/4c7cabad-26f4-496d-9de2-7d1c49a90e78/quadplex80-ext-mux-stream-02m02xcpw102SbsAq402lDR02VvougICRYSA5-high.mp4',
      viewVideoThumbUrl:
        'https://d10zufojjcedud.cloudfront.net/uploads/e3e3b68d-421f-40a3-83cf-575e09c02f5c/quadplex80-ext-mux-image-02m02xcpw102SbsAq402lDR02VvougICRYSA5-thumbnail.jpg',
      desc: 'The residence features direct elevator entry to a grand receiving hall with white macauba stone ﬂooring leading to the expansive Great Room with custom smoke-gray solid oak ﬂoors in an intricate pattern. An ideal place for dining and entertaining, this space is complemented by a sophisticated library area to the South, offering expansive views of the Manhattan skyline. \n\nThe corner south-facing kitchen offers stunning city skyline views, custom cabinetry designed by Studio Soﬁeld, crystallo white quartzite countertops and backsplash, and a full suite of Gaggenau appliances, including a gas cooktop with a fully vented hood, steam oven, and wine refrigerator. This kitchen seamlessly connects to the private Sunset Lounge and outdoor terrace, facilitating effortless indoor-outdoor living at an extraordinary elevation.',
      thumbnailUrl:
        'https://d10zufojjcedud.cloudfront.net/uploads/bf020a07-d6d9-4a77-86dd-e5cf2259a587/quadplex80-ext-datocms-143478-1769008987-2-111_w_57_80-nfield-22.jpg',
      floorplanUrl:
        'https://d10zufojjcedud.cloudfront.net/uploads/82f5399c-07a2-4019-b757-89b90a2b8248/quadplex80-ext-datocms-143478-1743160005-f1-gr.jpg',
      floorplanPdfUrl:
        'https://d10zufojjcedud.cloudfront.net/uploads/91c9c398-9508-4a4e-800d-9f9ecbf69781/quadplex80-ext-datocms-143478-1743160245-111w57_quadplex80_floor-plans-1.pdf',
    },
    {
      slug: 'guest-suite',
      title: 'Guest Suite',
      floorDisplay: '81st Floor',
      imageUrl:
        'https://d10zufojjcedud.cloudfront.net/uploads/fa3892aa-b146-47ce-a644-9b68118a5ecd/quadplex80-ext-datocms-143478-1772208547-quadplex-10.jpg',
      viewVideoUrl:
        'https://d10zufojjcedud.cloudfront.net/uploads/4c7cabad-26f4-496d-9de2-7d1c49a90e78/quadplex80-ext-mux-stream-02m02xcpw102SbsAq402lDR02VvougICRYSA5-high.mp4',
      viewVideoThumbUrl:
        'https://d10zufojjcedud.cloudfront.net/uploads/e3e3b68d-421f-40a3-83cf-575e09c02f5c/quadplex80-ext-mux-image-02m02xcpw102SbsAq402lDR02VvougICRYSA5-thumbnail.jpg',
      desc: 'Each of the four private bedrooms offer striking views in all directions. Every suite is generously proportioned with ample closet space and en-suite bathrooms ﬁnished in distinctive crystallo gold quartzite and custom Studio Soﬁeld-designed ﬁxtures. This level includes a private Sunset Lounge and wet bar and a full laundry room for ultimate convenience.',
      thumbnailUrl:
        'https://d10zufojjcedud.cloudfront.net/uploads/461cff12-92b0-4b3b-9b3b-11c93e2ec07a/quadplex80-ext-datocms-143478-1772451888-primary-suite-thumb.jpg',
      floorplanUrl:
        'https://d10zufojjcedud.cloudfront.net/uploads/fe072f71-d52a-4e83-8f26-4ebd29f54067/quadplex80-ext-datocms-143478-1741893262-guest-suites.png',
      floorplanPdfUrl: '',
    },
    {
      slug: 'sunset-lounge',
      title: 'Primary Suite',
      floorDisplay: '82nd Floor',
      imageUrl:
        'https://d10zufojjcedud.cloudfront.net/uploads/ee1cca56-ffbb-4896-8f99-dd416e0aeecd/quadplex80-ext-datocms-143478-1772208451-quadplex-9.jpg',
      viewVideoUrl:
        'https://d10zufojjcedud.cloudfront.net/uploads/bc23cd95-f39e-4d1a-9fdd-98fb1ee62867/quadplex80-ext-mux-stream-7ANZVAlrGoXAceb71s8U01B5FUQPt5Rx3-high.mp4',
      viewVideoThumbUrl:
        'https://d10zufojjcedud.cloudfront.net/uploads/51f9ae62-6b71-4010-abd9-e86f57df0250/quadplex80-ext-mux-image-7ANZVAlrGoXAceb71s8U01B5FUQPt5Rx3-thumbnail.jpg',
      desc: 'The magniﬁcent, luxuriously appointed private Primary Suite offers an entire floor of private programming, a respite above exciting city life. The approximately 2,947 square-foot full ﬂoor suite offers northern, perfectly centered Central Park views and double primary bathrooms facing north with views of the park. \n\nOne primary bath is fully clad in hand-selected white onyx, while the other is clad in veined gray onyx. Both feature custom freestanding polished nickel bathtubs by William Holland, and beautiful custom-designed ﬁxtures hand-cast by P.E. Guerin. The primary suite also features two large dressing halls with spacious closets. Added conveniences include a full custom wet bar and coffee station, an intimate Sunset Lounge to enjoy the views, and a serene private office space.',
      thumbnailUrl:
        'https://d10zufojjcedud.cloudfront.net/uploads/d6115f69-5c98-48bf-b683-7ca2415b494a/quadplex80-ext-datocms-143478-1739205618-9-111_w_57-nfield-13.jpg',
      floorplanUrl:
        'https://d10zufojjcedud.cloudfront.net/uploads/4775d9bb-25d5-48d9-9d6d-e48189590fa9/quadplex80-ext-datocms-143478-1743160062-f3-ps.jpg',
      floorplanPdfUrl:
        'https://d10zufojjcedud.cloudfront.net/uploads/7ecede4a-1a75-44f8-95c8-34e0e3ac5898/quadplex80-ext-datocms-143478-1743160212-111w57_quadplex80_floor-plans-3.pdf',
    },
    {
      slug: 'crown-suite',
      title: 'Crown Suite',
      floorDisplay: '83rd Floor',
      imageUrl:
        'https://d10zufojjcedud.cloudfront.net/uploads/60388228-a4d3-4ccd-8c2e-cf1d677cd5f8/quadplex80-ext-datocms-143478-1772208577-quadplex-12.jpg',
      viewVideoUrl:
        'https://d10zufojjcedud.cloudfront.net/uploads/bc23cd95-f39e-4d1a-9fdd-98fb1ee62867/quadplex80-ext-mux-stream-7ANZVAlrGoXAceb71s8U01B5FUQPt5Rx3-high.mp4',
      viewVideoThumbUrl:
        'https://d10zufojjcedud.cloudfront.net/uploads/51f9ae62-6b71-4010-abd9-e86f57df0250/quadplex80-ext-mux-image-7ANZVAlrGoXAceb71s8U01B5FUQPt5Rx3-thumbnail.jpg',
      desc: "The residence's pinnacle floor offers an expansive, meticulously curated private entertainment space, ideal for memorable events and gatherings. The crown suite boasts a magnificent bar, billiards table, screening room, service kitchen, private indoor Sunset Lounge, powder room, and a private terrace, ensuring a complete and luxurious entertainment experience.",
      thumbnailUrl:
        'https://d10zufojjcedud.cloudfront.net/uploads/dded992b-4805-4a8c-90e0-3fbf5eecfcb8/quadplex80-ext-datocms-143478-1772450672-terrace-thumb.jpg',
      floorplanUrl:
        'https://d10zufojjcedud.cloudfront.net/uploads/8e1e1ddc-69c6-4664-9503-114c0b30500c/quadplex80-ext-datocms-143478-1743160087-f4-cs.jpg',
      floorplanPdfUrl:
        'https://d10zufojjcedud.cloudfront.net/uploads/d2e3e146-4333-4749-b2d5-5b52fdcadc1b/quadplex80-ext-datocms-143478-1743160197-111w57_quadplex80_floor-plans-4.pdf',
    },
  ],
  contactEyebrow: 'Contact us',
  contactTitle: 'Endless\nhorizons\nawait',
  contactSubtitle:
    'For more information or to arrange a viewing please get in touch.',
  email: 'info@111w57.com',
  phone: '212-935-5757',
  ambientUrl:
    'https://d10zufojjcedud.cloudfront.net/uploads/bc6fc784-3633-4d01-b9eb-98c682b34ea7/quadplex80-sound-ambient.mp3',
  backgroundUrl:
    'https://d10zufojjcedud.cloudfront.net/uploads/f446bcfe-175f-4c8e-95f3-171b599dca6e/quadplex80-sound-background.mp3',
  soundLabel: 'Sound',
  scrollLabel: 'Scroll to explore',
  pressHoldLabel: 'Press & Hold',
  seeViewLabel: 'See the view',
  glbUrl:
    'https://d10zufojjcedud.cloudfront.net/uploads/0854b656-1bb0-47ec-be47-5f0130ca6401/quadplex80-gl-sothebys_111w57_04.glb',
  hdrUrl:
    'https://d10zufojjcedud.cloudfront.net/uploads/49584630-097e-4ca4-811d-154c96defaa2/quadplex80-gl-images-HDR_AboveTheClouds.test.jpg',
  cloudTintUrl:
    'https://d10zufojjcedud.cloudfront.net/uploads/0e494304-546d-4b83-9693-68621c62ee30/quadplex80-gl-images-Cloud-tint-8.png',
  introCloudUrl:
    'https://d10zufojjcedud.cloudfront.net/uploads/1163d9f2-25bc-46b7-a234-e9180add8b82/quadplex80-gl-images-intro-cloud.png',
  layerUrls: [
    'https://d10zufojjcedud.cloudfront.net/uploads/cf343204-eb64-4f3c-ac79-5e745f8dc55f/quadplex80-gl-images-layer0.png',
    'https://d10zufojjcedud.cloudfront.net/uploads/cc6e5f7d-484c-4de8-b17b-469c685e0465/quadplex80-gl-images-layer1.png',
    'https://d10zufojjcedud.cloudfront.net/uploads/b8e79768-5958-4e08-a38b-01162563ad9e/quadplex80-gl-images-layer2.png',
    'https://d10zufojjcedud.cloudfront.net/uploads/ff22343b-f2cc-4197-961e-bc278d91eb6c/quadplex80-gl-images-layer3.png',
    'https://d10zufojjcedud.cloudfront.net/uploads/9b975b29-0ad8-40e2-a66f-ed7f147b6a05/quadplex80-gl-images-layer4.png',
  ],
  buildingUrls: [
    'https://d10zufojjcedud.cloudfront.net/uploads/cc7df143-5c7f-4505-9845-2d85a114694f/quadplex80-gl-images-building0.png',
    'https://d10zufojjcedud.cloudfront.net/uploads/41f8c587-ee4a-454b-9d67-e1bd3c5653ee/quadplex80-gl-images-building1.png',
    'https://d10zufojjcedud.cloudfront.net/uploads/1969c4db-b96d-4bac-8b97-a78124d252e5/quadplex80-gl-images-building2.png',
    'https://d10zufojjcedud.cloudfront.net/uploads/3a785186-1fdc-4307-afd9-7da0ef784a74/quadplex80-gl-images-building3new.png',
  ],
  flare1Url:
    'https://d10zufojjcedud.cloudfront.net/uploads/60beda0a-2f88-44ba-9b7a-692f46176ced/quadplex80-gl-images-flare-flare-1.jpg',
  flare2Url:
    'https://d10zufojjcedud.cloudfront.net/uploads/b16d4c2a-edd3-4ff3-a382-c3119db01b93/quadplex80-gl-images-flare-flare-2.jpg',
};

export const Q80_MENU_CONTENT: Q80MenuContent = {
  logoText: '111\nW\n57',
  menuLabel: 'Menu',
  closeLabel: 'Close',
  inquireLabel: 'Inquire',
  inquireUrl: 'https://111w57.com/contact',
  menuImageUrl:
    'https://d10zufojjcedud.cloudfront.net/uploads/1b52cb02-e828-49ae-8138-e5523d32d403/quadplex80-ext-datocms-143478-1743600979-111-comp-nav-new-2x.jpg',
  links: [
    {
      label: 'Home',
      target: 'home',
    },
    {
      label: 'Entertaining Suite',
      target: 'great-room',
    },
    {
      label: 'Guest Suite',
      target: 'guest-suite',
    },
    {
      label: 'Primary Suite',
      target: 'sunset-lounge',
    },
    {
      label: 'Crown Suite',
      target: 'crown-suite',
    },
    {
      label: 'Floorplans',
      target: 'floorplans',
    },
    {
      label: 'Contact',
      target: 'contact',
    },
  ],
  mainSiteLabel: 'Visit main site',
  mainSiteUrl: 'https://111w57.com/',
  creditsLabel: 'Credits',
  creditsTitle:
    'A world-class team of experts,\nvisionaries, designers & artists',
  credits: [
    {
      title: 'JDS Development Group',
      text: 'JDS Development Group is a team of innovators and builders pioneering progressive new forms of large-scale urban development that challenge the status quo of the real estate industry. Founded in 2002 and headquartered in New York and Miami, JDS is a national firm focused on acquisition, development, and construction, recognized for its architecturally significant mixed-use projects that respond to each community and push the boundaries of engineering and design. JDS projects include 111 West 57th Street, The Brooklyn Tower, The American Copper Buildings, Walker Tower, 888 Brickell Dolce & Gabbana Miami, Mercedes-Benz Places Miami, Monad Terrace and other award-winning collaborations with the world’s top architects and designers.',
    },
    {
      title: 'Property Markets Group',
      text: 'Property Markets Group (PMG) was founded by Kevin Maloney in 1991 and is a premier real estate investment, development, and general construction firm. The company is headquartered in New York with offices in Miami and Chicago. PMG is one of the few remaining full-service, large-scale development companies with staff capable of maneuvering all facets of the development process. With direct hands-on experience in the acquisition, renovation,financing, operation, and marketing of commercial and residential real estate, PMG has completed 85 residential buildings in New York, Florida, and Chicago, and over 150 real estate projects throughout the United States. During its 27-year history, PMG has developed projects across all asset types and distinguished itself by focusing on premier luxury residential properties.',
    },
    {
      title: 'SHoP',
      text: 'SHoP harnesses the power of interdisciplinary expertise to create architecture that makes our cities more vibrant, more beautiful, and more rewarding places for all to live. Operating from its studios in New York’s historic Woolworth Building, the critically-acclaimed firm has a staff of 180 talented people and projects completed or underway on four continents. At the heart of SHoP’s work is a respect for the expressive potential of traditional architectural materials, and a pioneering technological capability that transforms them into inspiring statements for the world of today.',
    },
    {
      title: 'Studio Sofield ',
      text: 'Studio Sofield, led by Principal William Sofield, is a design firm with the reputation for a thoughtful, multi-disciplined approach to design characterized by working in response to not only the project locale but the unique needs of the client. All of Sofield’s projects imbue a restrained luxury in design through choices in materials and craft as well as through a process of discovery where clients decipher their very own concept of luxury. With 111 West 57th Street, William Sofield has incorporated this philosophy with his Historicist training to develop a considerate and contemporary response to the changing New York City skyline.',
    },
    {
      title: 'Apollo Commercial Real Estate Finance, Inc (“ARI”)',
      text: 'Apollo Commercial Real Estate Finance, Inc.(“ARI”) is a real estate investment trust that primarily originates and invests in senior mortgages, mezzanine loans and other commercial real estate-related debt investments collateralized by properties throughout the United States and Europe. As of June 30, 2024, ARI’s diversified loan portfolio totaled ~$9.0 billion and as of August1, 2024, ARI’s market cap was ~$1.6 billion. ARI’s externally managed by ACREFI Management, LLC, an indirect subsidiary of Apollo Global Management, Inc. (“Apollo”), a leading global alternative investment manager with AUM of~$696 billion as of June 30, 2024. Since 2009, Apollo’s real estate credit group has invested over $81 billion of capital into commercial real estate debt investments, $23 billion of which was on behalf of ARI. ARI is led by an experienced team of senior real estate professionals who have significant experience in commercial property ownership and finance. ARI’s relationship with Apollo provides significant advantages in insourcing, evaluating, underwriting and managing investments.',
    },
    {
      title: 'Sotheby’s International Realty',
      text: "Sotheby's International Realty was founded in 1976 as a real estate service for discerning clients of Sotheby's auction house. Today, the company's global footprint spans 1,115 offices located in 84 countries and territories worldwide, including 49 company-owned brokerage offices in key metropolitan and resort markets. In February 2004, Anywhere Real Estate Inc. entered a long-term strategic alliance with Sotheby’s, the operator of the auction house. The agreement provided for the licensing of the Sotheby’s International Realty name and the development of a franchise system. The franchise system consists of an affiliate network, where each office is independently owned and operated. Sotheby’s International Realty supports its affiliates and agents with a host of operational, marketing, recruiting, educational and business development resources. Affiliates and agents also benefit from an association with the venerable Sotheby’s auction house, established in 1744. For more information, visit www.sothebysrealty.com.\n\n The affiliate network is operated by Sotheby’s International Realty Affiliates LLC, and the company owned brokerages are operated by Sotheby's International Realty, Inc. Both entities are subsidiaries of Anywhere Real Estate Inc. (NYSE: HOUS) a global leader in real estate franchising and provider of real estate brokerage, relocation and settlement services. Both Sotheby’s International Realty Affiliates LLC and Sotheby’s International Realty, Inc. fully support the principles of the Fair Housing Act and the Equal Opportunity Act.",
    },
    {
      title: 'Outpost',
      text: 'Outpost is a design studio crafting true digital expressions of brands that leave a lasting impression. Harnessing insight, strategy and creativity to drive innovation and brand transformation to create digital experiences that connect with consumers and drive engagement. Collaborating with best teams and talent all over the world, Outpost has a deep desire to push boundaries and deliver amazing results for their clients.',
    },
    {
      title: 'Hayes Davidson',
      text: 'Hayes Davidson is one of the world’s leading visualisation studios. Collaborative to our core, we partner with the most respected and visionary architects, developers, planners and agencies, to create exceptional ways to help them communicate their ideas and ambitions.',
    },
  ],
  legalLabel: 'Legal',
  legalText:
    'All renderings, floor plans and specifications are for illustrative purposes only. Sponsor reserves the right to make changes in accordance with the offering plan.',
  phone: '212-935-5757',
};
