import { z } from 'zod';

export const siteSettingsPutSchema = z.object({
  appName: z.string().min(1),
  description: z.string().min(1),
  logoUrl: z.string().optional(),
});
