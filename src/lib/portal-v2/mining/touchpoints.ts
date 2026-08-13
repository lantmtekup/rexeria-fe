export type MiningTouchpoint = {
  id: string;
  name: string;
  measuredBy: string[];
};

export const MINING_TOUCHPOINTS: MiningTouchpoint[] = [
  { id: 'meta', name: 'Meta', measuredBy: ['ga4'] },
  { id: 'email', name: 'Email', measuredBy: ['klaviyo', 'ga4'] },
  { id: 'google', name: 'Google', measuredBy: ['ga4'] },
  { id: 'tiktok', name: 'TikTok', measuredBy: ['tiktok', 'ga4'] },
  { id: 'qr', name: 'Retail QR', measuredBy: ['tag'] },
  { id: 'web', name: 'Web microsite', measuredBy: ['tag', 'ga4'] },
  { id: 'instagram', name: 'Instagram', measuredBy: ['ga4'] },
  { id: 'paidsocial', name: 'Paid social', measuredBy: ['ga4'] },
  { id: 'shopify', name: 'Shopify', measuredBy: ['shopify'] },
];
