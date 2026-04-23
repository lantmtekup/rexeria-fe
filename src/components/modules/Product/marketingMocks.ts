// Mock marketing data shared across Discovery / Concept / Assets / Campaign
// sub-pages. Replace with real API wiring in a later phase.
import type { MarketingInstance } from '@/components/organisms/MarketingSidebar';

export const MARKETINGS: MarketingInstance[] = [
  { id: 'm1', title: 'Marketing 01' },
  { id: 'm2', title: 'Marketing 02' },
  { id: 'm3', title: 'Marketing 03' },
  { id: 'm4', title: 'Marketing 04' },
];

export const MOCK_DESCRIPTIONS = {
  marketingConcept:
    'The Marketing Concept is a business philosophy that emphasizes understanding and meeting the needs of customers. It focuses on creating value for customers through tailored products and services, ensuring that the organization aligns its goals with custo…',
  messageDevelopment:
    'Message development in marketing involves crafting clear and compelling messages that resonate with the target audience. It focuses on understanding customer needs and preferences, ensuring that the messaging aligns with the brand’s values and objectives. E…',
  creativeDirection:
    'Creative direction in marketing involves guiding the visual and conceptual elements of a campaign to ensure they resonate with the target audience. It encompasses everything from the overall aesthetic to the messaging strategy, aiming to create a cohesive brand id…',
  contentMap:
    'A Content Map in marketing is a strategic tool that outlines the types of content needed to engage your audience at different stages of their journey. It helps marketers visualize how content aligns with customer needs, ensuring that the right message reaches the right pe…',
  aboutConcept:
    'Explore our latest fashion collection that combines style and comfort. Discover unique pieces that elevate your wardrobe, perfect for any occasion. From chic dresses to trendy accessories, we have everything you need to express your personal style.',
  targetAudience:
    'Introducing our latest product, designed specifically for the dynamic lifestyle of individuals aged 24 to 30. This innovative solution seamlessly blends functionality with style, catering to your needs whether you’re at work, at the gym, or out with friends. Experience the perf…',
  plan: 'We’re excited to unveil our new marketing plan aimed at engaging customers and boosting product awareness. Our strategy includes a mix of social media campaigns, influencer partnerships, and targeted email outreach. We’ll focus on creating compelling content th…',
  campaignPlanning:
    'Campaign planning in marketing involves outlining the strategies and tactics that will be used to achieve specific goals. This process includes defining the target audience, setting objectives, determining the budget, and selecting the right channels for communication.…',
};
