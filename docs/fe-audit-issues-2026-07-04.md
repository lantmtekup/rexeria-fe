# FE Audit — Danh sách issue cho team `fe-rexerai`

> **Trạng thái khắc phục (2026-07-04, nhánh `fix/fe-audit-2026-07-04`):**
> - ✅ Đã fix: S1 S2 S3 S4 S5 S6 S7 S8 · Q1 (type-check xanh + pre-push hook) Q2 Q4 Q5 Q7 Q8 · P1 P2 P3 P4 P7
> - ⚠️ Ghi chú: S1 giữ ACL `public-read` (asset public là chủ đích — đã có `S3_USE_ACL=false` để tắt); Q3 không áp dụng (checkout này không có CLAUDE.md); P2 revalidate 60s + purge chủ động qua `/api/revalidate-page` khi publish/unpublish/activate.
> - ⏳ Còn lại (nợ dài hạn / cần quyết định riêng): Q6 (`apps/` 24MB — cần quyết chuyển repo), Q9 (migrate `next lint` → ESLint CLI), P5 (`next/image` sweep), P6 (TanStack Query cho data layer), P8 (giảm `'use client'`).


> Nguồn: audit tĩnh (đọc code) toàn bộ `fe-rexerai` (Next.js 15 App Router, React 19, TypeScript).
> Ngày: 2026-07-04. Phạm vi: bảo mật, kiến trúc, chất lượng, hiệu năng của **frontend**.
> Mọi issue đều đã được xác minh bằng cách đọc code thật (có `file:line`). Đây là phân tích tĩnh — chưa pentest/profiling động, nên vài chi phí hiệu năng cần xác nhận thêm bằng bundle analyzer / Lighthouse.

## Bối cảnh trust boundary (đọc trước khi sửa phần auth/upload)

- Toàn bộ `/api/*` của Next **bị loại khỏi `middleware.ts`** (matcher negative-lookahead + `/api` trong publicRoutes) → **mỗi API route phải tự authorize**.
- Một `JWT_SECRET` đang ký **cả** cookie "gate marker" (`_access_token`, chỉ đánh dấu đã đăng nhập) **lẫn** token credential thật → không tách tầng tin cậy.
- Sign-in thật đi qua Rexer BE `/v1/auth/login` rồi `/api/auth/session-set` chỉ **ký** cookie gate. Đống Mongo `Admin` / `ensureInitialAdmin` / `/api/auth/login` là **boilerplate legacy** nhưng vẫn *reachable*.

---

## Bảng tổng hợp mức độ

| Mã | Mức | Issue | File chính |
|---|---|---|---|
| S1 | 🔴 High | Upload S3 không xác thực (secret fail-open) | `src/app/api/upload/route.ts`, `src/server/services/upload.service.ts:73-77,164` |
| S2 | 🔴 High | Upload tin `Content-Type` của attacker → stored HTML/XSS | `src/server/services/upload.service.ts:60-64,235` |
| S3 | 🟠 Med | Cookie gate được nhận như credential trên Mongo CRUD (mọi role/brand) | `src/server/auth/session.ts:18-34`, `src/server/controllers/product.controller.ts:16-22` |
| S4 | 🟠 Med | Route login legacy còn sống + seed password yếu, không rate-limit | `src/app/api/auth/login/route.ts`, `src/server/init/ensureInitialAdmin.ts` |
| S5 | 🟠 Med | Stored XSS qua `dangerouslySetInnerHTML` trên block content brand tự nhập | `src/components/modules/block-editor/blocks/FramerArpeggioHeroV2.tsx:416-420` |
| S6 | 🟡 Med | `session-set` ký `role`/`scope` lấy thẳng từ body client (forgeable) | `src/app/api/auth/session-set/route.ts:29-40` |
| S7 | 🟢 Low | Middleware không gate theo role (mọi user đăng nhập load được `/admin` shell) | `src/middleware.ts:128-152` |
| S8 | 🟢 Low | MongoDB `$regex` từ input user → ReDoS | `src/server/services/product.service.ts:34` |
| Q1 | 🔴 High | `yarn type-check` hỏng — **37 lỗi**, quality gate đang tắt | `tsconfig.json:25`, template 3D |
| Q2 | 🟡 Med | Rule lint container-query khớp **0 file** (glob sai path) — guardrail chết | `eslint.config.mjs:51` |
| Q3 | 🟡 Med | Doc drift CLAUDE.md (path block-editor sai, `src/blocks/` đã xoá) | `CLAUDE.md`, `../CLAUDE.md` |
| Q4 | 🟡 Med | Boilerplate Mongo auth legacy còn reachable (nên xoá) | `src/instrumentation.ts:6-8`, `src/models/Admin.ts` |
| Q5 | 🟡 Med | Dead code: client backend thứ 3 (`fetchInstance`) không còn importer | `src/services/base/fetchInstance.ts` |
| Q6 | 🟡 Med | 24MB / 283 file app nhúng trong `apps/` commit vào repo | `apps/` |
| Q7 | 🟡 Med | Route demo `/dev/blocks`, `/overview` serve prod không auth | `src/app/dev/blocks/page.tsx`, `src/app/overview/**` |
| Q8 | 🟢 Low | `exhaustive-deps` bug thật (autoplay timer teardown mỗi render) | `Stories.tsx:61`, `Quiz.tsx:59-60` |
| Q9 | 🟢 Low | `next lint` bị bỏ ở Next 16; root inferred sai từ pnpm-lock lạ | `package.json`, `next.config.ts` |
| P1 | 🔴 High | Public block-page tải **toàn bộ ~74 block** (31 kéo gsap/framer, 2 kéo three) | `src/app/p/[id]/_block-render.tsx`, `.../block-editor/blocks/renderBlock.tsx` |
| P2 | 🔴 High | Public page fetch `cache: 'no-store'` → mỗi view là round-trip BE đầy đủ | `src/app/p/[id]/page.tsx:69,106` |
| P3 | 🟠 Med | Thiếu `generateMetadata` cho public landing (lỗ SEO/social share) | `src/app/p/[id]/` |
| P4 | 🟠 Med | URL BE prod hardcode làm fallback → env sai đọc/ghi nhầm prod | `src/app/p/[id]/page.tsx:36`, `next.config.ts:111` |
| P5 | 🟡 Med | Raw `<img>` khắp nơi (97 file, 150 chỗ `eslint-disable`), gần như 0 `next/image` | toàn `src` |
| P6 | 🟡 Med | Data layer client tự viết, không cache/dedupe/AbortController | `src/services/rexer/use-rexer.ts:18-45` |
| P7 | 🟢 Low | Font Google `<link>` per-template render-time → FOUT | `src/templates/maison-*/index.tsx` |
| P8 | 🟢 Low | ~397/518 component là `'use client'` (~77%) — dùng RSC chưa hiệu quả | toàn `src/components` |

---

## 🔴 BẢO MẬT — cần xử lý sớm

### S1 — Upload S3 không xác thực (fail-open)
**File:** `src/app/api/upload/route.ts` → `src/server/controllers/upload.controller.ts` → `src/server/services/upload.service.ts:73-77,164`

`/api/upload` không nằm trong `middleware.ts`. Guard duy nhất là `checkUploadSecret()`, mà hàm này **trả `true` khi `UPLOAD_API_SECRET` rỗng** (mặc định ở `.env.example`/`.env.dev`/`.env.prod`). Uploader thật của app (`ImageUpload.tsx:70-74`) gọi route với `credentials: 'include'` và **không** gửi `x-upload-secret` → để app chạy được thì secret phải rỗng → endpoint thực tế mở cho mọi người.

**Rủi ro:** bất kỳ ai trên internet POST file (≤10MB/file, không giới hạn số lượng, không rate-limit) vào bucket S3, mặc định `ACL: public-read` (`upload.service.ts:139`) → lạm dụng lưu trữ / host nội dung phishing dưới asset domain của brand.

**Sửa:** bắt buộc session hợp lệ (verify `_access_token` qua `verifyJwtFromRequest`, giống `product.controller`), thêm rate-limit per-user, bỏ `public-read` mặc định. Đừng để `UPLOAD_API_SECRET` rỗng = pass.

### S2 — Upload tin `Content-Type` → stored HTML/XSS
**File:** `src/server/services/upload.service.ts:60-64,235`

Đuôi file bị allow-list (`jpg|jpeg|png|webp|pdf`) nhưng `ContentType` object lưu lên S3 lấy từ `file.type` (`resolveContentType` ưu tiên `file.type` — do attacker kiểm soát), **không đối chiếu với đuôi**. Đặt tên `x.png`, `Content-Type: text/html`, body là HTML/JS → qua allow-list, lưu `public-read` với `text/html`, browser render từ asset domain.

**Chuỗi tấn công (kết hợp S1):** upload ẩn danh → stored XSS/HTML từ asset domain. Nghiêm trọng hơn nếu asset domain **same-origin/cookies** với app.

**Sửa:** suy `Content-Type` **chỉ** từ allow-list đuôi (bỏ `file.type`); set `X-Content-Type-Options: nosniff` + `Content-Disposition: attachment` cho object; validate magic byte.

### S3 — Cookie gate được nhận như credential trên Mongo CRUD
**File:** `src/server/auth/session.ts:18-34`, `src/server/controllers/product.controller.ts:16-22`, `siteSettings.controller.ts:24-30`

`session-set` ký `_access_token` với `sub: 'rexer-session'`. Các API Mongo authorize bằng `verifyJwtFromRequest` + `requireAuth` mà **chỉ kiểm `payload.sub` có tồn tại** → **mọi user đã đăng nhập, bất kỳ role/brand nào** đều pass `/api/products` (GET/POST), `/api/products/[id]` (PATCH/DELETE), `/api/cms/site-settings` (PUT). Không kiểm role, không scope tenant (`productService` chỉ lọc `isDeleted`; site-settings là global). → user brand bất kỳ sửa/xoá mirror sản phẩm chung và ghi đè branding/SEO toàn site.

**Sửa:** phân biệt loại token (audience/claim riêng hoặc secret riêng cho gate vs credential); enforce role + tenant-scope trong controller Mongo, không chỉ dựa `sub`.

### S4 — Login legacy còn sống + password seed yếu, không brute-force defense
**File:** `src/app/api/auth/login/route.ts`, `src/server/services/auth.service.ts:17-62`, `src/server/init/ensureInitialAdmin.ts`

Dù CLAUDE.md gọi là "boilerplate không dùng", `/api/auth/login` vẫn **reachable**: credential Mongo `Admin` hợp lệ → ký cookie cùng `JWT_SECRET`, `role: admin`, được chấp nhận ở mọi nơi cookie thật được chấp nhận (kể cả CRUD Mongo qua S3). `ensureInitialAdmin` tự tạo admin từ `INIT_ADMIN_*` lúc boot; `.env.local` seed `INIT_ADMIN_PASSWORD=Admin1234` (yếu). **Không rate-limit/lockout** trên login. Nếu `INIT_ADMIN_*` từng set ở env deploy → đường admin thay thế brute-force được.

**Sửa:** xoá/tắt route login+setup legacy và `ensureInitialAdmin` ở env deploy (hoặc gate sau flag); thêm rate-limit + lockout; không ship default credential yếu.

### S5 — Stored XSS trên block content brand tự nhập
**File:** `src/components/modules/block-editor/blocks/FramerArpeggioHeroV2.tsx:416-420`

`content.headline` (slot brand nhập) được inject raw: `__html: content.headline.replace('\n','<br />')`. Không sanitize → brand user nhét `<img src=x onerror=...>` chạy trên mọi visitor của trang published đó. *(Lưu ý: hai chỗ `dangerouslySetInnerHTML` khác ở `(landing)/layout.tsx:45,49` là JSON-LD từ constant tĩnh — an toàn.)*

**Sửa:** escape text trước rồi mới chèn `<br>`, hoặc dùng DOMPurify. **Cần sweep toàn bộ `block-editor/blocks/**`** tìm pattern tương tự (variant analysis).

### S6 — `session-set` ký `role`/`scope` từ body client (forgeable)
**File:** `src/app/api/auth/session-set/route.ts:29-40`

`role`/`scope` đọc thẳng từ POST body của client rồi nhét vào cookie ký, không verify với BE. User có thể mint cookie `role: admin`. Hiện chỉ ảnh hưởng **routing** (`middleware.ts`, `roleTarget.ts`) vì authz thật ở BE — nhưng là **bẫy leo thang quyền** cho bất kỳ code server nào sau này tin `payload.role`.

**Sửa:** suy `role`/`scope` **từ response login của BE** (server-side), đừng lấy từ input client; hoặc bỏ chúng khỏi cookie.

### S7 — Middleware không gate theo role (Low, defense-in-depth)
**File:** `src/middleware.ts:128-152` — `isProtectedRoute` chỉ kiểm session tồn tại → user brand/client load được shell `/admin` client-side (data vẫn 401 từ BE). Là lỗ UX/defense-in-depth, phụ thuộc fix S6 trước.

### S8 — ReDoS qua Mongo `$regex`
**File:** `src/server/services/product.service.ts:34` — `search` (chỉ validate là string) truyền vào `{ $regex: search, $options: 'i' }`. Không injection operator nhưng pattern catastrophic → DoS. **Sửa:** escape regex metachar hoặc dùng text index; cap độ dài input.

---

## 🔧 KIẾN TRÚC & CHẤT LƯỢNG

### Q1 — `yarn type-check` hỏng: 37 lỗi (quality gate đang tắt) 🔴
Hai nguyên nhân (môi trường + hygiene, không phải bug source): (a) `@react-three/fiber`/`@react-three/drei` khai báo trong `package.json:43-44` nhưng thiếu trong `node_modules` → ~33 lỗi cascade ở `src/templates/lux-coin-3d/Coin.tsx`, `src/templates/particle-wave-3d/Scene.tsx`; (b) `tsconfig.json:25` include `.next/types/**`, và `.next/types/validator.ts` stale tham chiếu 4 route đã xoá (`tmp-3d-test`, `tmp-block-test`, `tmp-vault`, `(admin)/admin/block-types`). Trong lúc gate đỏ, regression type ship lọt. **Sửa:** `yarn install`, xoá/rebuild `.next`, **đưa type-check vào CI**.

### Q2 — Rule lint container-query khớp 0 file (glob sai) 🟡
`eslint.config.mjs:51` scope `no-restricted-syntax` vào `src/components/modules/CanvasTemplate/block-editor/blocks/**`, nhưng block thật ở `src/components/modules/block-editor/blocks/` (dir `CanvasTemplate/` chỉ chứa `BlockEditor.tsx`…). **Đã xác minh: path trong glob không tồn tại.** Đây là convention *bắt buộc* (CLAUDE.md §R1) nhưng guardrail chết → vi phạm đã lọt: `MintV2Works.tsx:102,106,116,120` và `MintVaultCollection.tsx:66` dùng viewport class `md:`. **Sửa:** đổi glob thành `src/components/modules/block-editor/blocks/**` và dọn 2 file vi phạm.

### Q3 — Doc drift CLAUDE.md 🟡
Cả FE CLAUDE.md và workspace CLAUDE.md tham chiếu `src/blocks/` (đã xoá) và định vị block editor ở `.../CanvasTemplate/block-editor/` (thật: `.../block-editor/`). Chính drift này sinh ra Q2. **Sửa:** một lượt cập nhật doc sau khi hợp nhất block-system. *(Điểm tốt: vấn đề "2 hệ block trùng lặp" có vẻ đã giải quyết — `src/blocks` đã xoá.)*

### Q4 — Boilerplate Mongo auth legacy còn reachable 🟡
`/api/auth/login`, `/api/auth/setup`, `src/models/Admin.ts`, `ensureInitialAdmin` (`instrumentation.ts:6-8`, chạy mỗi boot khi `INIT_ADMIN_*` set) — trong khi sign-in thật qua Rexer BE. Endpoint auth không dùng nhưng reachable = attack surface + bẫy wiring. **Sửa:** xoá route controller + model `Admin` + init hook, hoặc 404 sau flag env. *(Xem S4 — cùng gốc.)*

### Q5 — Dead code: backend "thứ 3" 🟡
`src/services/base/fetchInstance.ts` **không còn importer nào** (chỉ còn 1 comment ở `src/server/response.ts:3` — đã xác minh), nhưng cả hai CLAUDE.md và `NEXT_PUBLIC_API_URL` vẫn tài liệu hoá nó là seam sống. Thực tế chỉ còn **2 backend**. **Sửa:** xoá `fetchInstance.ts`, bỏ `NEXT_PUBLIC_API_URL` khỏi env template, cập nhật doc.

### Q6 — 24MB / 283 file `apps/` commit vào repo 🟡
`apps/{delvaux,icggallery,mint2026,mintcoin,mintcoin-v2,real-estate}` — app Next standalone nhúng, bị exclude khỏi `tsconfig` nhưng vẫn commit (~19% file tracked, đã xác minh 24M/283 file). **Sửa:** chuyển ra ngoài repo hoặc gitignore như `recon-archive/`.

### Q7 — Route demo serve prod không auth 🟡
`src/app/dev/blocks/page.tsx` và `src/app/overview/**` không nằm trong `protectedRoutes`, không cố ý public → middleware fall-through `NextResponse.next()`. **Sửa:** gate hoặc strip `/dev` + `/overview` ở production.

### Q8 — `exhaustive-deps` bug thật (Low) 🟢
`src/components/modules/block-editor/blocks/Stories.tsx:61` — `slides` recompute mỗi render và là dep của `useEffect` autoplay (`:99`) → timer story teardown/restart mỗi render. Cùng pattern ở `Quiz.tsx:59-60`. Stale-closure ở `Blocks/BlockDetailView.tsx:115` (thiếu `block`), `portal/marketing/_editor.tsx:271`. **Sửa:** hoist `?? []` vào `useMemo`, hoàn thiện dep array.

### Q9 — Tooling deprecation (Low) 🟢
`yarn lint` dùng `next lint` (gỡ ở Next 16) → migrate sang ESLint CLI (`npx @next/codemod@canary next-lint-to-eslint-cli .`). Next còn infer workspace root sai từ `/mnt/data/hasaki/pnpm-lock.yaml` lạ → set `outputFileTracingRoot` trong `next.config.ts`.

---

## ⚡ HIỆU NĂNG (phần FE)

### P1 — Public block-page tải toàn bộ ~74 block 🔴
`src/app/p/[id]/_block-render.tsx` là `'use client'` → import `RenderBlock` từ `block-editor/blocks/renderBlock.tsx`, mà file này **static-import cả ~74 block** (31 kéo gsap/framer-motion, 2 kéo three.js). Trang landing 3 block → visitor ẩn danh hydrate cả 74. **Sửa:** chuyển switch thành map `Record<BlockType, dynamic(() => import('./X'))>` — đúng pattern `src/templates/registry.tsx` đã dùng.

### P2 — Public page fetch `cache: 'no-store'` 🔴
`src/app/p/[id]/page.tsx:69` (và `:106` cho HTML fallback) dùng `cache: 'no-store'` → mỗi lượt xem ẩn danh là round-trip BE đầy đủ (BE lại chạy 5-7 query). Trang published immutable per `release_no`. **Sửa:** `next: { revalidate: N, tags: ['page:'+slug] }` + `revalidateTag` khi publish. Kết hợp P1+P2 xoá gần hết chi phí per-view của trang phổ biến.

### P3 — Thiếu `generateMetadata` cho public landing 🟠
Không có metadata export nào dưới `src/app/p/`. Mọi trang published ship title/OG của root layout thay vì tên/mô tả/ảnh social của chính trang. Với sản phẩm mà **deliverable chính là landing page public**, đây là lỗ SEO/share-preview. **Sửa:** thêm `generateMetadata` dùng lại `fetchPublicPage` bọc trong React `cache()` để share 1 lần gọi BE.

### P4 — URL BE prod hardcode làm fallback 🟠
`src/app/p/[id]/page.tsx:36` và `next.config.ts:111` fallback về `'https://rexerai.tekupsoftware.com'` khi `NEXT_PUBLIC_REXER_API` rỗng → env cấu hình sai âm thầm đọc/ghi **prod**. **Sửa:** throw lúc boot khi thiếu var (fail loud), URL chỉ để trong `.env.*`.

### P5 — Raw `<img>` khắp nơi 🟡
97 file dùng `<img>`, chỉ 2 dùng `next/image`; **150 chỗ `eslint-disable @next/next/no-img-element`** (đã đếm). LCP landing không srcset/AVIF/lazy. Canvas block với URL tuỳ ý là ràng buộc hợp lệ (cần loader permissive), nhưng **code template + thumbnail admin dùng `next/image` được ngay** (`next.config.ts:27` đã có `remotePatterns`). **Sửa:** ưu tiên đường public + code template; tối thiểu thêm `loading="lazy"` + kích thước cho `<img>` dưới màn.

### P6 — Data layer client không cache/dedupe 🟡
`src/services/rexer/use-rexer.ts:18-45` (`useRexer`) fetch on-mount mỗi instance component: không dedupe request, không revalidate, không `AbortController` (chỉ cờ `alive`), refetch mỗi remount; list page admin/portal render full client sau spinner. Là lựa chọn MVP có chủ đích, nhưng khi admin lớn lên sẽ sinh call BE trùng + waterfall spinner. **Sửa:** dùng TanStack Query/SWR cho tầng rx, hoặc tối thiểu thêm in-flight map cấp module.

### P7 — Font Google `<link>` per-template → FOUT (Low) 🟢
`src/templates/maison-{atelier,clair,noir}/index.tsx:49/30/50` inject font lúc render (`@next/next/no-page-custom-font`) → FOUT trên trang public. **Sửa:** `next/font` per template hoặc preload theo route segment.

### P8 — ~77% component là `'use client'` (Low, structural) 🟢
397/518 file TSX mang `'use client'`. Kéo phần lớn render về client, undercut model RSC của Next 15 → bundle nặng, TTI chậm hơn cần thiết. Là khoản nợ kiến trúc dài hạn, không phải bug. **Hướng:** dần chuyển component thuần present/fetch-only sang server component; giữ `'use client'` cho phần thật sự tương tác.

---

## Không phải issue (đã kiểm, nêu để khỏi nhầm)

- `middleware.ts` gate cookie ký (verify signature + role routing qua `roleHomePath`) — đúng.
- `p/[id]` đã sửa: ưu tiên `template_code`, `template_name` chỉ là fallback phòng thủ (`page.tsx:78-101`) — không còn là workaround.
- `src/templates/registry.tsx` code-split đúng qua `next/dynamic` → template three.js không bloat route khác.
- `dangerouslySetInnerHTML` ở `(landing)/layout.tsx` là JSON-LD từ constant — an toàn.
- `sendBeacon`/upload bypass `rx()` là đúng công cụ cho việc đó.
- `.env.dev`/`.env.prod` **có** commit vào git nhưng giá trị secret hiện **rỗng** (template) — chưa rò rỉ, nhưng nên gitignore để tránh footgun tương lai. *(`.env.local` chứa secret thật thì đã untracked — đúng.)*

---

## Thứ tự khắc phục đề xuất

1. **S1 + S2** — xác thực `/api/upload`, ngừng tin `file.type`, bỏ `public-read` mặc định. *(chuỗi tấn công nghiêm trọng nhất, ẩn danh)*
2. **S4 + S3 + S6** — tắt/gate login legacy ở prod + rate-limit; tách gate-token khỏi credential + enforce role/tenant ở Mongo controller; ngừng tin `role` từ client.
3. **Q1** — sửa type-check gate + đưa vào CI (chặn regression tương lai).
4. **P1 + P2 + P3** — đường public: code-split block library, bật revalidate cache, thêm metadata. (Impact/effort tốt nhất cho traffic cao nhất.)
5. **S5** — sanitize block content HTML (sweep `block-editor/blocks/**`).
6. **Q2/Q3** — sửa glob lint + dọn 2 file `md:`, cập nhật doc.
7. Phần còn lại (Q4-Q9, P4-P8, S7/S8) theo nhóm khi có thời gian: dọn dead code (`fetchInstance`, `apps/`, Mongo boilerplate), `next/image` cho public path, gate `/dev` + `/overview`, migrate `next lint`.

---
*File này chỉ gồm issue của FE. Backend (`be-ReXeR.ai`) có cụm lỗi phân quyền chéo tenant nghiêm trọng hơn (BOLA/IDOR + Firebase self-provision staff) được audit riêng.*
