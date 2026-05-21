# Portal Demo → Production Migration Plan

**Mục tiêu**: Migrate UI demo từ `/overview/portal-demo/*` (fake data + showcase) sang `(client-portal)/portal/*` (live, auth-gated, BE-backed) khi BE Phase 1 sẵn sàng.

**Date**: 2026-05-21
**Reviewer**: FE Lan, PM
**Related**: [phase1-audit-conflicts.md](phase1-audit-conflicts.md) — issue M-01

---

## 0. Trạng thái hiện tại

| Path | Auth | Data source | Pages | Trạng thái |
|---|---|---|---|---|
| `/overview/portal-demo/*` | KHÔNG | Fake + hybrid loader | 8 pages | ✅ Full UI hoàn chỉnh (demo) |
| `(client-portal)/portal/*` | CÓ (JWT) | `rexerApi.clientPortal.*` | 1 page + 1 detail | 🟡 Skeleton, ít content |

---

## 1. Pages mapping

Mỗi demo page sẽ migrate sang vị trí thật. Đường dẫn route giữ nguyên cấu trúc, đổi route group `overview/portal-demo` → `(client-portal)/portal`.

| Demo path | Production path | BE dependency | Priority |
|---|---|---|---|
| `/overview/portal-demo` | `(client-portal)/portal` | `dashboard.summary` (đã có), `clientPortal.myProjects` (đã có) | P1 |
| `/overview/portal-demo/templates` | `(client-portal)/portal/landing-pages` | `clientPortal.myProjects` + analytics | P1 |
| `/overview/portal-demo/ads` | `(client-portal)/portal/ads` | **Meta Marketing API + Google Ads + TikTok** (chưa có) | P3 |
| `/overview/portal-demo/curate` | `(client-portal)/portal/curate` | `be-template-analytics-spec` analytics_events | P2 |
| `/overview/portal-demo/media` | `(client-portal)/portal/media` | `media.list` (đã có) + folder API (**MỚI**) | P2 |
| `/overview/portal-demo/products` | `(client-portal)/portal/products` | `products.list/create/update` (đã có) | P1 |
| `/overview/portal-demo/comments` | `(client-portal)/portal/comments` | `be-client-portal-spec` comments (**MỚI**) | P2 |
| `/overview/portal-demo/profile` | `(client-portal)/portal/profile` | `clients.users/inviteUser` (đã có) + workspace switcher | P1 |

**Rename trong production**:
- Route `/templates/` → `/landing-pages/` (consistent với label N-01 đã đổi)
- Component `PortalTemplate*` giữ nguyên (internal)

---

## 2. BE dependency chain

```
P0. Workspace multitenancy + JWT claims                  [be-workspace-multitenancy-spec]
     │
     ├─► P1. Brand client portal endpoints (dashboard, templates, products, profile)
     │       [be-client-portal-spec §3.1, 3.2, 3.3]
     │
     ├─► P1. Asset upload (direct-to-S3)                  [be-asset-upload-spec]
     │
     ├─► P2. Folder hierarchy on assets                    [be-asset-upload-spec extension]
     │
     ├─► P2. Comments thread                               [be-client-portal-spec §1]
     │
     ├─► P2. Notifications                                 [be-client-portal-spec §2]
     │
     ├─► P2. Template Analytics (analytics_events ingest)  [be-template-analytics-spec]
     │
     └─► P3. Ads platform integrations                     (spec mới — chưa viết)
```

---

## 3. Migration steps (per page)

### 3.1. Generic checklist
For mỗi demo page, bước migrate:

1. **Copy file** từ `src/app/overview/portal-demo/<page>/page.tsx` → `src/app/(client-portal)/portal/<page>/page.tsx`
2. **Rename route segment** nếu cần (`/templates/` → `/landing-pages/`)
3. **Remove fake fallback** trong `_remote.tsx` — chỉ live BE call, throw on error
4. **Thay `useActiveWorkspace()`** trong demo bằng workspace từ JWT claims (server-side via `/auth/me` hoặc client-side useEffect)
5. **Remove "UI Demo · Fake data" badge** + banner vàng
6. **Add error boundary** + loading skeleton thật (replace `setLoading(false)` setTimeout)
7. **Test với staff Rexer login** + brand client login (E2E Playwright)
8. **Deprecate demo route**: thêm banner ở `/overview/portal-demo/<page>` redirect tới production sau 30 ngày

### 3.2. Page-specific notes

#### Dashboard (`portal/page.tsx`)
- Use `rexerApi.dashboard.summary()` directly — đã có loader
- Stats per workspace: cần BE add `workspace_id` filter (hiện trả global)
- Activity feed: chưa có endpoint — giữ fake 1 sprint nữa hoặc add `GET /v1/portal/activity`

#### Landing pages (`portal/landing-pages/page.tsx`)
- Use `clientPortal.myProjects()` — đã có converter
- Filter theo `workspace_id` — cần BE accept query param `?workspace_id=`
- Link to analytics detail: keep `/overview/analytics/templates/[id]` hoặc move sang `(client-portal)/portal/landing-pages/[id]/analytics`

#### Media (`portal/media/page.tsx`)
- **Lớn nhất** — phải đợi BE folder API + workspace_id trên assets
- Upload flow đã sẵn (`media.initUpload` → `uploadRaw` → `completeUpload`)
- Folder tree: implement client-side với BE flat list `media.list({ folder_id })`

#### Products (`portal/products/page.tsx`)
- Đã có CRUD live trong demo (`_product-modal.tsx` đã wire `products.create/update`)
- Move modal sang production path; product form đã reuse `ProductInformationEditor`
- BE bonus: thêm `workspace_id` vào create payload

#### Profile (`portal/profile/page.tsx`)
- `clients.get(client_id)` + `clients.users(client_id)` đã có
- Workspace member list: chưa có endpoint — cần `GET /v1/workspaces/:id/members` (be-client-portal-spec)
- Logo upload qua media API

#### Comments + Notifications + Ads + Curate
- Chờ BE spec implement (P2-P3)
- Giữ fake với banner "Đang chờ BE — Sprint X" cho tới khi sẵn

---

## 4. Deprecation plan của `/overview/portal-demo`

**Phase A** (Sprint sau khi BE P1 done):
- Migrate Dashboard + Landing pages + Products + Profile sang production
- Demo route giữ nguyên — banner cyan top "Đang xem demo — production ở `/portal`"

**Phase B** (P2 done):
- Migrate Media + Comments + Notifications
- Demo route show 301 redirect modal: "Xem ở `/portal`"

**Phase C** (P3 done hoặc 60 ngày sau A):
- Demo route trở thành **read-only showcase** cho sales/marketing
- Thêm watermark "DEMO" overlay
- Hoặc xoá hẳn nếu không cần showcase nữa

---

## 5. Risks

| Risk | Mitigation |
|---|---|
| Migration làm break demo cho Sales đang dùng | Phase A giữ demo song song; banner thay vì xoá |
| BE delay → FE block | Pages có dependency chỉ migrate khi BE ready; pages độc lập migrate sớm |
| User confusion (2 portal) | Banner clear, sidebar trong `/overview` redirect khi user login |
| Workspace switcher UX khác production | Test với 1 user thật có 2+ workspace trước khi go-live |
| Route `/landing-pages/` vs `/templates/` SEO/bookmark cũ | 301 redirect `/portal/templates → /portal/landing-pages` |

---

## 6. Checklist tổng

- [ ] BE workspace multitenancy deployed
- [ ] JWT claims có `client_id` + `active_workspace_id`
- [ ] `/auth/me` trả `memberships[]`
- [ ] Migrate Dashboard (P1)
- [ ] Migrate Landing pages (P1)
- [ ] Migrate Products (P1)
- [ ] Migrate Profile (P1)
- [ ] BE asset folder API done → migrate Media (P2)
- [ ] BE comments API done → migrate Comments (P2)
- [ ] BE analytics_events ingest → migrate Curate (P2)
- [ ] Ads platforms integration → migrate Ads (P3)
- [ ] Deprecation banner trên `/overview/portal-demo`
- [ ] Sales team được brief về production URL mới
- [ ] E2E test 2 actor (staff + brand client) qua mọi page production

---

**Owner**: FE Lan + PM
**Liên quan**:
- [phase1-audit-conflicts.md](phase1-audit-conflicts.md)
- [be-workspace-multitenancy-spec.md](be-workspace-multitenancy-spec.md)
- [be-client-portal-spec.md](be-client-portal-spec.md)
- [be-asset-upload-spec.md](be-asset-upload-spec.md)
