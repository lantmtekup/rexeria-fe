import {
  BarChart3,
  Boxes,
  Building2,
  FileText,
  Image as ImageIcon,
  LayoutDashboard,
  LayoutTemplate,
  MousePointerClick,
  Package,
  Save,
  ShieldCheck,
  ShoppingBag,
  Share2,
  Sparkles,
  Table,
  UploadCloud,
  Wand2,
  type LucideIcon,
} from 'lucide-react';

export type Status = 'new' | 'inprogress' | 'done';
export type Priority = 1 | 2 | 3;
export type Category =
  | 'auth'
  | 'ai'
  | 'canvas'
  | 'collections'
  | 'analytics'
  | 'platform'
  | 'product'
  | 'tenancy'
  | 'portal'
  | 'misc';

export type Accent =
  | 'blue'
  | 'violet'
  | 'fuchsia'
  | 'emerald'
  | 'amber'
  | 'cyan'
  | 'rose'
  | 'orange'
  | 'sky'
  | 'indigo';

export type SpecDoc = {
  id: string;
  num: number;
  title: string;
  filename: string;
  status: Status;
  priority: Priority;
  est_time: string;
  category: Category;
  accent: Accent;
  icon: LucideIcon;
  goal: string;
  prereq?: string;
  endpoints: string[];
  schema_tables: string[];
  requirements: React.ReactNode[];
};

export const STATUS_META: Record<
  Status,
  { label: string; chip: string; dot: string }
> = {
  new: {
    label: '🆕 Mới',
    chip: 'bg-blue-100 text-blue-700',
    dot: 'bg-blue-500',
  },
  inprogress: {
    label: '🔄 Đang làm',
    chip: 'bg-amber-100 text-amber-700',
    dot: 'bg-amber-500',
  },
  done: {
    label: '✅ Xong',
    chip: 'bg-emerald-100 text-emerald-700',
    dot: 'bg-emerald-500',
  },
};

export const CATEGORY_META: Record<
  Category,
  { label: string; accent: Accent }
> = {
  tenancy: { label: 'Multi-tenancy', accent: 'cyan' },
  portal: { label: 'Client Portal', accent: 'cyan' },
  auth: { label: 'Auth & Account', accent: 'rose' },
  ai: { label: 'AI Engine', accent: 'fuchsia' },
  canvas: { label: 'Canvas & Blocks', accent: 'blue' },
  collections: { label: 'Collections', accent: 'emerald' },
  analytics: { label: 'Analytics', accent: 'amber' },
  platform: { label: 'Platform / Registry', accent: 'indigo' },
  product: { label: 'Products', accent: 'orange' },
  misc: { label: 'Misc / Reference', accent: 'sky' },
};

/* ---------- 22 SPECS ---------- */

export const SPECS: SpecDoc[] = [
  /* === Phase 1 — Managed service (new) === */
  {
    id: 'be-workspace-multitenancy',
    num: 1,
    title: 'Workspace Multi-tenancy',
    filename: 'be-workspace-multitenancy-spec.md',
    status: 'new',
    priority: 3,
    est_time: '2 tuần',
    category: 'tenancy',
    accent: 'cyan',
    icon: Building2,
    goal: 'Phase 1 foundation: mỗi brand = 1 workspace. Staff thấy mọi workspace, BrandClient chỉ thấy workspace của mình.',
    endpoints: [
      'POST /v1/admin/workspaces',
      'POST /v1/admin/workspaces/{id}/invite',
      'POST /v1/auth/accept-invite',
      'GET /v1/me/workspaces',
      'POST /v1/me/workspace/switch',
    ],
    schema_tables: [
      'workspaces (slug unique, status, plan, logo, contact)',
      'workspace_members (user_id × workspace_id, role)',
      '+ workspace_id column trên 6 bảng cũ',
    ],
    requirements: [
      <>
        Tạo bảng <code>workspaces</code> + <code>workspace_members</code>.
      </>,
      <>
        Migration: thêm <code>workspace_id</code> NOT NULL vào canvas_templates
        / data_collections / products / assets / analytics_events / saved_blocks
        (backfill = default workspace).
      </>,
      <>
        JWT claims: <code>role</code>, <code>active_workspace_id</code>,{' '}
        <code>memberships[]</code>.
      </>,
      <>
        Middleware <code>WorkspaceScope</code> tự inject{' '}
        <code>WHERE workspace_id=?</code>.
      </>,
      <>
        Staff bypass qua header <code>X-Workspace-Override</code> (sticky cookie
        cho UX).
      </>,
      <>Email invite flow với token TTL 7 ngày.</>,
      <>Role enum: brand_owner / brand_member / brand_viewer.</>,
    ],
  },
  {
    id: 'be-asset-upload',
    num: 2,
    title: 'Asset Upload (Direct-to-S3)',
    filename: 'be-asset-upload-spec.md',
    status: 'new',
    priority: 3,
    est_time: '2 tuần',
    category: 'portal',
    accent: 'cyan',
    icon: UploadCloud,
    goal: 'Brand Client upload tài liệu/hình ảnh trực tiếp lên S3 qua presigned URL. Staff dùng làm input AI/canvas.',
    prereq: 'be-workspace-multitenancy (workspace_id scope)',
    endpoints: [
      'POST /v1/assets/presign',
      'POST /v1/assets/{id}/confirm',
      'GET /v1/assets',
      'PATCH /v1/assets/{id}',
      'DELETE /v1/assets/{id}',
    ],
    schema_tables: [
      'assets (s3_key, mime, size, kind, tags, scan_status, workspace_id)',
    ],
    requirements: [
      <>
        Direct-to-S3: BE sinh presigned POST (TTL 5 phút, content-type lock,
        max-size lock).
      </>,
      <>FE upload thẳng S3, gọi confirm để BE HEAD verify size + mime thực.</>,
      <>
        MIME whitelist: image / video / pdf / docx / xlsx / pptx / zip. KHÔNG
        cho <code>application/javascript</code> / <code>text/html</code>.
      </>,
      <>Size limit: 100MB image/doc, 500MB video. Quota: 10GB/workspace.</>,
      <>Lambda gen thumbnail 256×256 (sharp cho image, ffmpeg cho video).</>,
      <>
        ClamAV scan async, flag <code>scan_status</code> nhưng không block
        download Alpha.
      </>,
      <>Notification cho Staff khi brand upload mới (throttle 5 phút batch).</>,
      <>Soft delete + cron xoá S3 sau 30 ngày.</>,
    ],
  },
  {
    id: 'be-client-portal',
    num: 3,
    title: 'Brand Client Portal API',
    filename: 'be-client-portal-spec.md',
    status: 'new',
    priority: 3,
    est_time: '2 tuần',
    category: 'portal',
    accent: 'cyan',
    icon: LayoutDashboard,
    goal: 'Endpoint cho /portal/* FE: dashboard stats, templates list scoped, comments thread, notifications, staff inbox.',
    prereq:
      'be-workspace-multitenancy, be-asset-upload, be-template-analytics, be-canvas-templates',
    endpoints: [
      'GET /v1/portal/dashboard',
      'GET /v1/portal/templates',
      'POST /v1/portal/templates/{id}/comments',
      'GET /v1/portal/notifications',
      'GET /v1/admin/inbox',
    ],
    schema_tables: [
      'comments (template_id, parent_id, body markdown, status)',
      'notifications (user_id, kind, subject_type/id, read_at)',
    ],
    requirements: [
      <>
        Dashboard endpoint cache 60s, trả 8 stat + trend 7d + open_comments +
        unread_notifications.
      </>,
      <>
        Comments: 1 thread / template, 1 level reply, status open/resolved (chỉ
        root).
      </>,
      <>Markdown body ≤ 4000 ký tự, strip image/iframe (XSS).</>,
      <>
        Notification 6 kind: template_published, template_updated, comment_new,
        comment_resolved, asset_uploaded, workspace_invited.
      </>,
      <>
        Throttle notification qua Redis sorted-set (khoá theo
        user_id+kind+subject).
      </>,
      <>Staff inbox endpoint aggregate task cross-workspace.</>,
      <>Real-time: polling 30s; WebSocket Phase 2.</>,
    ],
  },

  /* === Auth & Onboarding === */
  {
    id: 'be-alpha',
    num: 4,
    title: 'Alpha Test Bundle (Auth + Feedback)',
    filename: 'be-alpha-spec.md',
    status: 'inprogress',
    priority: 3,
    est_time: '3 tuần',
    category: 'auth',
    accent: 'rose',
    icon: ShieldCheck,
    goal: '3 core features: email/password signup, Google OAuth (Firebase), in-app feedback có upload screenshot.',
    endpoints: [
      'POST /v1/auth/register',
      'POST /v1/auth/firebase/login',
      'POST /v1/feedback',
      'GET /v1/admin/feedback',
      'GET /v1/admin/feedback/export.csv',
    ],
    schema_tables: ['users', 'sessions', 'auth_identities', 'feedback'],
    requirements: [
      <>
        Register hash password (bcrypt ≥12), tạo user + identity, issue session
        nhưng <b>chưa</b> set cookie.
      </>,
      <>
        Firebase login verify ID token, upsert user, set httpOnly cookie, detect
        new vs returning.
      </>,
      <>
        Feedback có category / message / page_url required; optional severity /
        rating / screenshot.
      </>,
      <>Admin list / update / export feedback theo status.</>,
      <>Validate email unique (case-insensitive).</>,
      <>Rate-limit register 5/IP/min, feedback 10/user/giờ.</>,
    ],
  },

  /* === AI === */
  {
    id: 'be-ai-block-content',
    num: 5,
    title: 'AI Block Content Generation',
    filename: 'be-ai-block-content-spec.md',
    status: 'new',
    priority: 3,
    est_time: '1 tuần',
    category: 'ai',
    accent: 'fuchsia',
    icon: Sparkles,
    goal: 'POST /v1/ai/block-content cho FE block-editor sinh nội dung 6 block type qua Claude + billing + audit.',
    endpoints: ['POST /v1/ai/block-content'],
    schema_tables: ['ai_block_content_logs'],
    requirements: [
      <>Support 6 block types với structured JSON response khớp schema.</>,
      <>Gọi Claude Opus 4.7 với prompt caching để tiết kiệm token.</>,
      <>Rate-limit 60 req/phút/user, 200K input + 50K output token/ngày.</>,
      <>Validate output theo schema từng block trước khi trả về.</>,
      <>Log mọi call với token usage để billing.</>,
      <>
        Timeout {'>'}15s → trả <code>504</code>.
      </>,
      <>
        Support rewrite-in-context qua{' '}
        <code>current_content + selected_field</code>.
      </>,
    ],
  },
  {
    id: 'be-ai-canvas-apply-product',
    num: 6,
    title: 'AI Canvas Apply Product',
    filename: 'be-ai-canvas-apply-product-spec.md',
    status: 'new',
    priority: 3,
    est_time: '2 tuần',
    category: 'ai',
    accent: 'fuchsia',
    icon: Wand2,
    goal: 'Một LLM call rewrite toàn bộ block trong canvas theo product data + match ảnh từ product.media, trả canvas_data sẵn save.',
    prereq:
      'be-ai-block-content (schema 5 block), be-canvas-templates (canvas_data structure)',
    endpoints: ['POST /v1/ai/canvas-templates/{id}/apply-product'],
    schema_tables: ['ai_canvas_apply_logs'],
    requirements: [
      <>Một LLM call xử lý 6-7 block, trả full canvas_data.</>,
      <>
        Map product attributes (name, features, colors, sizes) → block fields
        theo block type.
      </>,
      <>
        Match ảnh theo aspect ratio heuristic: hero 0.75, overlay 1.78, gallery
        landscape.
      </>,
      <>Preserve user overrides (elementStyles, background) khi flag=true.</>,
      <>Rewrite theo locale (vi / en).</>,
      <>ETag check để optimistic locking.</>,
      <>Trả stats: blocks_rewritten, images_replaced, fields_modified.</>,
    ],
  },
  {
    id: 'be-ai-usage',
    num: 7,
    title: 'AI Token Usage Tracking',
    filename: 'be-ai-usage-spec.md',
    status: 'new',
    priority: 2,
    est_time: '2 tuần',
    category: 'ai',
    accent: 'fuchsia',
    icon: BarChart3,
    goal: 'Theo dõi token tiêu thụ per-user / workspace cho billing + quota setup post-Alpha. Admin xem summary + export CSV.',
    prereq:
      'Tất cả endpoint AI (product_enrich, block_content, canvas_apply_product...)',
    endpoints: [
      'GET /v1/me/ai-usage',
      'GET /v1/admin/users/{id}/ai-usage',
      'GET /v1/admin/ai-usage',
      'GET /v1/admin/ai-usage/export.csv',
    ],
    schema_tables: ['ai_usage', 'users (thêm 4 cột quota)'],
    requirements: [
      <>
        Log mọi AI request: model, provider, prompt/completion tokens, cost_usd.
      </>,
      <>Config giá per-model (Opus 4.7: $15 input / $75 output / 1M token).</>,
      <>
        Wrap mọi AI handler bằng middleware <code>withAIUsage</code>.
      </>,
      <>
        Thêm 4 cột quota vào <code>users</code>: tokens_month, cost_usd_month...
      </>,
      <>Admin summary: time-series + per-feature + top users.</>,
      <>User self-view (không có error log).</>,
      <>Export CSV cho reconciliation.</>,
    ],
  },

  /* === Products === */
  {
    id: 'be-api-products',
    num: 8,
    title: 'Products & Categories API',
    filename: 'be-api-products-spec.md',
    status: 'inprogress',
    priority: 3,
    est_time: '1 tuần',
    category: 'product',
    accent: 'orange',
    icon: ShoppingBag,
    goal: 'CRUD products + product_categories. Hỗ trợ sizes/colors/features arrays, media bindings, slug unique.',
    endpoints: [
      'POST /v1/products',
      'GET /v1/products',
      'PATCH /v1/products/{id}',
      'POST /v1/product-categories',
    ],
    schema_tables: ['products', 'product_categories'],
    requirements: [
      <>CRUD products: name required, auto-gen slug.</>,
      <>
        Hỗ trợ: sizes (array), colors (hex), variants, ingredients,
        certifications, features (label+desc).
      </>,
      <>
        Validate SKU/slug unique per <code>client_id</code>.
      </>,
      <>
        Media binding qua <code>media_ids</code> FK.
      </>,
      <>3 status: draft / active / archived.</>,
      <>PATCH partial update.</>,
      <>
        Soft delete (<code>deleted_at</code>).
      </>,
      <>Category có template features để inheritance.</>,
    ],
  },

  /* === Canvas & Blocks === */
  {
    id: 'be-canvas-templates',
    num: 9,
    title: 'Canvas Templates (Design Builder)',
    filename: 'be-canvas-templates-spec.md',
    status: 'done',
    priority: 3,
    est_time: '3 ngày',
    category: 'canvas',
    accent: 'blue',
    icon: LayoutTemplate,
    goal: 'Resource canvas_templates cho FE designer: persist canvas (layers + animation + multi-page) với lazy-load & ETag.',
    prereq: 'be-extra-elements, be-block-types-wave3, canvas-block-responsive',
    endpoints: [
      'GET /v1/canvas-templates',
      'GET /v1/canvas-templates/{id}/canvas',
      'POST /v1/canvas-templates',
      'PATCH /v1/canvas-templates/{id}',
      'PUT /v1/canvas-templates/{id}/thumbnail',
    ],
    schema_tables: [
      'canvas_templates (canvas_data JSONB, canvas_etag, version)',
    ],
    requirements: [
      <>List trả metadata only — KHÔNG có canvas_data (giảm payload).</>,
      <>
        Lazy GET <code>/canvas</code> endpoint với ETag +{' '}
        <code>Cache-Control: max-age=86400</code>.
      </>,
      <>Metadata-only PATCH KHÔNG recompute ETag.</>,
      <>canvas-data PATCH recompute SHA-256 ETag.</>,
      <>
        Optimistic lock qua <code>version</code> field.
      </>,
      <>Canvas size {'≤'} 10MB hard limit.</>,
      <>Support multi-page, animation per layer, DeviceVariants responsive.</>,
    ],
  },
  {
    id: 'be-block-management',
    num: 10,
    title: 'Block Type Registry & Admin API',
    filename: 'be-block-management-spec.md',
    status: 'inprogress',
    priority: 3,
    est_time: '3 ngày',
    category: 'platform',
    accent: 'indigo',
    icon: Boxes,
    goal: 'Admin table block_type_registry quản lý 14 block type (enable/disable/deprecate/version) per workspace, KHÔNG cần deploy FE.',
    prereq: 'be-block-types-wave3 (schema 14 type)',
    endpoints: [
      'GET /v1/block-types',
      'GET /v1/admin/block-types',
      'POST/PATCH/DELETE /v1/admin/block-types/{type}',
    ],
    schema_tables: [
      'block_type_registry',
      'workspace_block_type_overrides (phase 2)',
    ],
    requirements: [
      <>Registry seed 14 type (hero_split → panorama).</>,
      <>Admin enable / disable / deprecate không cần deploy.</>,
      <>
        User list filter: <code>is_active=true</code>, không deprecated, check{' '}
        <code>min_app_version</code>.
      </>,
      <>Per-workspace override (phase 2).</>,
      <>Cache response 5 phút trên user list.</>,
      <>
        Admin có thể set <code>sort_order</code> cho AddBlockDialog.
      </>,
    ],
  },
  {
    id: 'be-block-platform',
    num: 11,
    title: 'Block Platform (Registry + Saved Blocks)',
    filename: 'be-block-platform-spec.md',
    status: 'inprogress',
    priority: 3,
    est_time: '5 ngày',
    category: 'platform',
    accent: 'indigo',
    icon: Package,
    goal: 'Spec hợp nhất: block-type registry (admin) + saved-blocks (user library). User save block → reuse cross-canvas.',
    prereq: 'be-block-management, be-extra-elements, be-block-types-wave3',
    endpoints: [
      'GET /v1/block-types',
      'GET/POST/PATCH/DELETE /v1/saved-blocks',
      'POST /v1/saved-blocks/import',
    ],
    schema_tables: [
      'block_type_registry',
      'saved_blocks',
      'users (has_migrated_saved_blocks)',
    ],
    requirements: [
      <>Seed registry 14 block type + 4 per-workspace fields.</>,
      <>User CRUD saved blocks (cap 100/user).</>,
      <>
        Validate block theo schema_version 2.0 (14 type + 10 extra-element
        kind).
      </>,
      <>Bulk import endpoint cho FE localStorage migration.</>,
      <>Soft delete saved blocks.</>,
      <>Optimistic lock trên update.</>,
    ],
  },
  {
    id: 'be-block-types-wave3',
    num: 12,
    title: 'Block Types Wave 3-4 (7 new types)',
    filename: 'be-block-types-wave3-spec.md',
    status: 'inprogress',
    priority: 3,
    est_time: '3 ngày',
    category: 'canvas',
    accent: 'blue',
    icon: Boxes,
    goal: 'Schema definitions cho 7 new block type: stories, split_screen, quiz, poll, carousel_3d, flipbook, panorama. BE validator phải chấp nhận shape này.',
    prereq: 'be-canvas-templates',
    endpoints: ['Validator integration vào POST/PATCH /v1/canvas-templates'],
    schema_tables: ['(schema-only, embed trong canvas_data validator)'],
    requirements: [
      <>
        <b>stories</b>: 1-20 slides có mediaUrl, title, body, ctaDuration
        1000-30000ms.
      </>,
      <>
        <b>split_screen</b>: 2-4 views có label/imageUrl/title/body.
      </>,
      <>
        <b>quiz</b>: 1-10 question, 2-6 option/q, 1-10 result bucket với
        minScore.
      </>,
      <>
        <b>poll</b>: 2-6 option, baseVotes {'≥'}0.
      </>,
      <>
        <b>carousel_3d</b>: extends image_carousel + mode3d + perspectivePx
        400-3000.
      </>,
      <>
        <b>flipbook</b>: 2-30 page, aspect ratio enum.
      </>,
      <>
        <b>panorama</b>: 2:1 equirectangular image, initialYaw / sensitivity.
      </>,
    ],
  },
  {
    id: 'be-extra-elements',
    num: 13,
    title: 'Block Extra Elements (Free-Drag)',
    filename: 'be-extra-elements-spec.md',
    status: 'inprogress',
    priority: 2,
    est_time: '2 tuần',
    category: 'canvas',
    accent: 'blue',
    icon: MousePointerClick,
    goal: '10 free-drag element trong block: text, edit_text, photo, video, hotspot, compare, range, countdown, reveal, spin_wheel. Persist trong Block.extraElements.',
    prereq: 'be-canvas-templates, be-saved-blocks',
    endpoints: ['Validator integration vào POST/PATCH /v1/canvas-templates'],
    schema_tables: ['(embed trong canvas_data như Block.extraElements JSONB)'],
    requirements: [
      <>
        10 kind: text, edit_text, photo, video, hotspot, compare, range,
        countdown, reveal, spin_wheel.
      </>,
      <>
        Base chung: id, kind, position, size, rotation, zIndex, style,
        isVisible.
      </>,
      <>
        Per-kind content shape (text, photo.mediaId, editText.placeholder...).
      </>,
      <>Cap 50 extra-element / block.</>,
      <>Validate: URL scheme, media existence, enum.</>,
      <>Position relative to block frame (absolute offset).</>,
    ],
  },
  {
    id: 'be-element-positions-carousel',
    num: 14,
    title: 'Element Positions + Image Carousel',
    filename: 'be-element-positions-and-carousel-spec.md',
    status: 'inprogress',
    priority: 2,
    est_time: '5 ngày',
    category: 'canvas',
    accent: 'blue',
    icon: ImageIcon,
    goal: '2 enhancement: elementPositions cho Figma-style nudge + image_carousel block type với autoplay + pagination.',
    prereq: 'be-canvas-templates',
    endpoints: ['Validator vào POST/PATCH /v1/canvas-templates'],
    schema_tables: ['(schema-only trong canvas_data)'],
    requirements: [
      <>
        <b>elementPositions</b>: DeviceVariants map của {'{x, y}'} offset
        (-10000 ≤ x,y ≤ 10000).
      </>,
      <>
        Áp dụng qua CSS <code>transform:translate()</code>, không phá flex
        siblings.
      </>,
      <>
        <b>image_carousel</b>: 1-20 slides, mỗi slide có imageUrl, caption,
        ctaHref optional.
      </>,
      <>
        Carousel: autoplayMs (0 hoặc 1000-60000), showPagination, showNavArrows.
      </>,
      <>Element keys: eyebrow, title, description, slides.</>,
      <>Validate URL scheme http(s) only, không relative path.</>,
      <>Forward-compat: block không có elementPositions vẫn pass validator.</>,
    ],
  },
  {
    id: 'be-saved-blocks',
    num: 15,
    title: 'Saved Blocks (Reusable Library)',
    filename: 'be-saved-blocks-spec.md',
    status: 'inprogress',
    priority: 2,
    est_time: '2 tuần',
    category: 'canvas',
    accent: 'blue',
    icon: Save,
    goal: 'User save block đã customize → reuse cross-template. Phase 1 FE localStorage xong. Phase 2 BE-backed với CRUD + migration.',
    prereq: 'be-block-types-wave3, be-extra-elements, be-canvas-templates',
    endpoints: [
      'GET/POST/PATCH/DELETE /v1/saved-blocks',
      'POST /v1/saved-blocks/import',
    ],
    schema_tables: [
      'saved_blocks (user_id, name, block_type, block JSONB, version)',
    ],
    requirements: [
      <>Save block full payload (extraElements + elementStyles + motion).</>,
      <>Validate block theo schema v2.0.</>,
      <>Cap 100 saved blocks / user (tier-based phase 2).</>,
      <>
        Update yêu cầu <code>version</code> (optimistic lock).
      </>,
      <>
        Soft delete (<code>deleted_at</code>).
      </>,
      <>Bulk import từ FE localStorage.</>,
      <>
        Flag <code>has_migrated_saved_blocks</code> trên user profile.
      </>,
    ],
  },
  {
    id: 'be-public-canvas-view',
    num: 16,
    title: 'Public Canvas View (Share Link)',
    filename: 'be-public-canvas-view-spec.md',
    status: 'inprogress',
    priority: 2,
    est_time: '3 ngày',
    category: 'canvas',
    accent: 'blue',
    icon: Share2,
    goal: 'Viewer không cần auth xem published canvas qua share token. Filter các field nhạy cảm.',
    prereq: 'be-canvas-templates',
    endpoints: ['GET /v1/public/canvas-templates/{id}/canvas?share_token=X'],
    schema_tables: [
      '(query existing canvas_templates, check publish + shareToken)',
    ],
    requirements: [
      <>Token verify với constant-time compare (anti timing-attack).</>,
      <>
        Filter ra: publish.shareToken, activeBlockId, blocks isVisible=false.
      </>,
      <>Unified 404 cho mọi failure (tránh info leak).</>,
      <>
        ETag + <code>Cache-Control: public, max-age=60, s-maxage=300</code>.
      </>,
      <>Rate-limit 120 req/phút/IP, 600/phút/token.</>,
      <>Trả metadata: name, description, thumbnail_url, published_at.</>,
    ],
  },

  /* === Collections === */
  {
    id: 'be-collections',
    num: 17,
    title: 'Collections (Data Table Builder)',
    filename: 'be-collections-spec.md',
    status: 'inprogress',
    priority: 2,
    est_time: '3 ngày',
    category: 'collections',
    accent: 'emerald',
    icon: Table,
    goal: 'data_collections + records cho FE Airtable-like. Migrate FE localStorage → BE. 17 field type, validation, unique constraint.',
    endpoints: [
      'GET/POST/PATCH/DELETE /v1/collections',
      'GET/POST/PATCH/DELETE /v1/collections/{id}/records',
      'POST /v1/collections/{id}/records/bulk (phase 2)',
    ],
    schema_tables: [
      'data_collections (slug unique per client, fields JSONB)',
      'data_collection_records (data JSONB keyed by fieldKey)',
    ],
    requirements: [
      <>
        Tạo collection với dynamic field: fieldKey, type, label, required,
        isUnique, isPrimary.
      </>,
      <>Auto-gen slug từ name, collision retry.</>,
      <>
        17 field type: text, email, number, dropdown, radio, checkbox, date,
        file, image, relation...
      </>,
      <>Validate per field: required, regex, min/max, unique, relation ref.</>,
      <>Record CRUD: unique field check → 409.</>,
      <>
        Soft delete collection (<code>is_active</code>), hard delete record.
      </>,
      <>
        Trigger sync <code>record_count</code> on insert/delete.
      </>,
    ],
  },

  /* === Analytics === */
  {
    id: 'be-template-analytics',
    num: 18,
    title: 'Template Analytics (Admin)',
    filename: 'be-template-analytics-spec.md',
    status: 'new',
    priority: 2,
    est_time: '3 tuần',
    category: 'analytics',
    accent: 'amber',
    icon: BarChart3,
    goal: 'Track viewer interaction trên published canvas. Admin xem per-template views/clicks, per-block breakdown, funnel BookingForm, slides carousel.',
    prereq: 'be-canvas-templates (canvas_data structure)',
    endpoints: [
      'POST /v1/analytics/events (public ingest)',
      'GET /v1/admin/analytics/templates/summary',
      'GET /v1/admin/analytics/templates/{id}/breakdown',
    ],
    schema_tables: [
      'analytics_events (template_id, block_id, visitor_id, session_id, event_type, action, target, dwell_ms, viewport, utm_*, meta JSONB)',
    ],
    requirements: [
      <>
        Event type: template_view, block_view (50% IntersectionObserver),
        block_click, form_submit, field_focus/blur/error.
      </>,
      <>
        Ingest validate: template published, action enum, dwell_ms clamp 0-600s.
      </>,
      <>Rate-limit 100/phút/visitor, 1000/giờ/IP.</>,
      <>Admin summary: views/visitors/blocks_viewed/clicks per template.</>,
      <>
        Admin breakdown: per-block metrics + actions + top targets +
        funnel/slides/images.
      </>,
      <>Retention 90 ngày rolling delete.</>,
      <>KHÔNG log PII (visitor_id = opaque cookie).</>,
    ],
  },

  /* === Reference / Misc === */
  {
    id: 'be-issues-master',
    num: 19,
    title: 'BE Issues Master Log',
    filename: 'be-issues-master.md',
    status: 'done',
    priority: 1,
    est_time: 'reference',
    category: 'misc',
    accent: 'sky',
    icon: FileText,
    goal: 'Catalog các API design issue gặp phải (hard-code localhost, Date serialize, pagination format) để tránh lặp lại.',
    endpoints: ['(reference doc, không có endpoint)'],
    schema_tables: [],
    requirements: [
      <>
        <b>BUG-01</b>: KHÔNG hard-code <code>localhost:9090</code> trong
        response.
      </>,
      <>
        <b>BUG-02</b>: Dùng <code>X-Forwarded-For</code> cho real IP.
      </>,
      <>
        <b>BUG-04</b>: Trả ISO-8601 string trực tiếp, không wrap{' '}
        <code>SimpleDate{'{}'}</code>.
      </>,
      <>
        <b>DX-01</b>: List response phải có <code>total_pages</code>.
      </>,
      <>
        Common: snake_case JSON, standard <code>ErrorBody</code> envelope.
      </>,
    ],
  },
  {
    id: 'be-canvas-save-persistence',
    num: 20,
    title: 'Canvas Save Persistence',
    filename: 'be-canvas-save-persistence-issue.md',
    status: 'done',
    priority: 1,
    est_time: 'reference',
    category: 'misc',
    accent: 'sky',
    icon: Save,
    goal: 'Reference document về autosave + optimistic locking pattern cho canvas_data PATCH.',
    prereq: 'be-canvas-templates',
    endpoints: ['(reference)'],
    schema_tables: [],
    requirements: [
      <>
        Maintain <code>version</code> field + ETag trong response để FE track
        edit.
      </>,
      <>Autosave mỗi 1.5s.</>,
      <>Conflict (409) handle bằng UI merge hoặc manual retry.</>,
      <>Document trong FE integration section.</>,
    ],
  },
  {
    id: 'be-data-gap-home',
    num: 21,
    title: 'Home Page Data Gap Analysis',
    filename: 'be-data-gap-home.md',
    status: 'done',
    priority: 1,
    est_time: 'reference',
    category: 'misc',
    accent: 'sky',
    icon: FileText,
    goal: 'Analysis về structure data thiếu (me endpoint, workspace context, permissions) cho home page UI.',
    prereq: 'be-alpha (auth)',
    endpoints: ['(reference)'],
    schema_tables: [],
    requirements: [
      <>
        <code>/auth/me</code> phải trả user + current workspace + roles.
      </>,
      <>Workspace context cần thiết cho list/CRUD filter.</>,
      <>Permission checks cho create/delete actions.</>,
    ],
  },
  {
    id: 'be-ai-template-questions',
    num: 22,
    title: 'AI Template Q&A (Open Questions)',
    filename: 'be-ai-template-questions.md',
    status: 'new',
    priority: 1,
    est_time: 'reference',
    category: 'ai',
    accent: 'fuchsia',
    icon: FileText,
    goal: 'Danh sách câu hỏi mở từ FE team về AI template behavior cần BE align (prompt structure, retry, cache scope).',
    endpoints: ['(Q&A doc)'],
    schema_tables: [],
    requirements: [
      <>Định nghĩa scope prompt caching (per-user hay per-template).</>,
      <>Retry strategy khi Claude trả invalid JSON.</>,
      <>Versioning của prompt template (rollback nếu cần).</>,
      <>Streaming response — Alpha cần hay đợi Beta?</>,
    ],
  },
];
