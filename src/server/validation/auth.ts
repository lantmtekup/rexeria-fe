import { z } from 'zod';

export const loginBodySchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

export const setupBodySchema = z.object({
  setupKey: z.string().min(1),
  username: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(1),
  name: z.string().optional(),
});
