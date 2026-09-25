// Trang đọc public/ bằng node:fs lúc render — chỉ chạy được lúc build. Phục vụ HTML đã
// prerender từ static assets để Worker (không có public/ trên fs) không render lại.
import { defineCloudflareConfig } from '@opennextjs/cloudflare';
import staticAssetsIncrementalCache from '@opennextjs/cloudflare/overrides/incremental-cache/static-assets-incremental-cache';

export default defineCloudflareConfig({
  incrementalCache: staticAssetsIncrementalCache,
  enableCacheInterception: true,
});
