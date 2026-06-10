// OpenNext → Cloudflare Workers. Mặc định đủ cho app này (SSR + middleware +
// API routes + rewrites proxy /api/rexer/*). Incremental cache (ISR) chưa bật —
// app không dùng ISR; khi cần thì thêm R2 incremental cache theo docs OpenNext.
import { defineCloudflareConfig } from '@opennextjs/cloudflare';

export default defineCloudflareConfig();
