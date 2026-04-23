---
name: feature-section
description: Guide Claude to implement a new CMS-managed section (FE + BE + Admin) following the project's architectural conventions. Each section has its own structure — use this skill to understand the patterns, not as a rigid template.
---

# Feature Section — Architecture Guide

## Purpose

This skill teaches the **conventions and patterns** used in this project when adding a new CMS-managed section. It does **not** prescribe a one-size-fits-all structure — every feature has different fields, different UI needs, and different public display requirements.

Use this skill to understand *how* things are wired together, then adapt for the specific feature at hand.

---

## 1. Understand the Feature First

Before writing any code, ask (or infer from context):

- What **data fields** does this feature have? (text, image, URL, boolean flags…)
- Does any field need **bilingual content**? → use `LocalizedText = { vi: string; en: string }`
- Is there a **public-facing display** on the landing page?
- Does uploading files (images, videos) need to happen through S3?

The answers change what files you create and how they look.

---

## 2. Read the Reference Implementation

Always read the VideoSlide implementation before writing code for a new feature. It is the canonical example of how all layers connect:

```
src/types/videoSlide.ts
src/models/videoSlide.model.ts
src/server/services/videoSlide.service.ts
src/server/controllers/videoSlide.controller.ts
src/app/api/db/video-slides/route.ts
src/app/api/db/video-slides/[id]/route.ts
src/services/endpoint/videoSlide.ts
src/services/logic/videoSlide.ts
src/settings/constants/videoSlide.ts
src/components/modules/Admin/VideoSliders/
src/app/(cms)/cms/video-slides/page.tsx
```

Use these as **patterns to adapt**, not to copy verbatim.

---

## 3. Architectural Conventions (non-negotiable)

These rules apply to every feature, regardless of its specific structure. See `reference.md` for code-level examples.

### Types (`src/types/`)
- One file per feature — export `IFeatureName`, `CreateFeatureNameDto`, `UpdateFeatureNameDto`

### Mongoose Model (`src/models/`)
- `import 'server-only'` — first line, always
- Register with `getOrCreateModel<T>('ModelName', schema)` — never `mongoose.model()` directly
- Index `{ order: 1 }` and compound `{ isActive: 1, order: 1 }` when the feature is ordered and togglable
- `{ timestamps: true }` always

### Server Service (`src/server/services/`)
- `import 'server-only'` — first line
- Always `await connectDB()` before any Mongoose call
- Use `HttpException.*` for all errors — never `throw new Error()`
- Validate MongoDB ObjectId with `mongoose.Types.ObjectId.isValid` before queries
- On conflict (e.g. duplicate `order`): `HttpException.conflict(...)`
- `catch (err) { if (err instanceof HttpException) throw err; throw HttpException.internal(...) }`

### Server Controller (`src/server/controllers/`)
- `import 'server-only'` — first line
- **Thin layer only** — parse request → call service → return `sendSuccess` / `sendError`
- No business logic here

### API Routes (`src/app/api/db/`)
- `params` in Next.js 15 is a **Promise** → always `await params` before destructuring
- Add `// TODO: wrap POST/PUT/DELETE with withAuth once auth is implemented` comment

### Client Endpoint (`src/services/endpoint/`)
- One file per feature, default export, then re-export in `index.ts`

### Client Logic Service (`src/services/logic/`)
- All methods return `Promise<ClientApiResponse<T>>`
- Use `successResponse` / `errorResponse` from `@/helpers/transformation`
- Catch errors: `e instanceof Error ? e.message : 'Fallback'` — never re-throw
- Then re-export in `index.ts`

### Admin UI (`src/components/modules/Admin/FeaturePlural/`)
- `'use client'` must be the very first line in every client component
- **Management** = container (state + handlers + `loadData`)
- **Table** = display only; internal `TableSkeleton` + `EmptyState` sub-functions
- **FormDialog** = create + edit in one component, distinguished by `editItem !== null`
- **DeleteDialog** = confirmation only, never calls service directly
- **schema.ts** = Zod schema + inferred form type
- `DEFAULT_VALUES` declared outside the component
- `useEffect([editItem])` → `form.reset()` when dialog opens in edit mode
- `loadData(silent?: boolean)` — pass `true` after CRUD to refresh without full loading state
- `toast.success / toast.error` from `sonner` for feedback

### CMS Page (`src/app/(cms)/cms/featureSlug/page.tsx`)
- Thin shell — just imports and renders `FeatureNameManagement`

### Public Component (`src/components/modules/LandingPage/`) — optional
- Server Component by default — no `'use client'`
- Fetch `getActive()` directly in the async component

---

## 4. Code Quality Rules

| Do | Don't |
|---|---|
| `@/` alias for all imports | Relative `../../` paths |
| `cn()` from `@/lib/cn` for conditional classes | String concatenation for class names |
| `next/image` `<Image>` for thumbnails | Raw `<img>` tag |
| `fetchInstance` for all HTTP | Raw `fetch()` |
| `aria-label` on every icon-only button | Icon button without accessibility label |
| All CMS UI copy in Vietnamese | English-only CMS strings |

---

## 5. What to Adapt Per Feature

| Concern | Adapt how? |
|---|---|
| Fields | Match schema, DTOs, form inputs, and table columns to actual data |
| LocalizedText | Add `{ vi, en }` object for any human-facing text; use nested `name="field.vi"` in form |
| Image upload | Use `ImageUpload` molecule + `useRef<ImageUploadHandle>` only when needed |
| `order` uniqueness | Only enforce if the feature uses `order` for display sequencing |
| Public section | Only create landing page component if feature is publicly visible |
| Constants file | Only needed if there are display config values (badge colors, labels, icons) to centralize |

---

Refer to `reference.md` for concrete code snippets for each layer.

---

## 6. Real Examples in This Project

Two features illustrate how the same architecture adapts to different needs:

### ProgramFormat (`/api/db/program-formats`)
- **No `isActive`** → no `getActiveItems`, no `?all=true` filter, endpoint has only `GET_ALL_PROGRAM_FORMATS`
- **No toggle** → controller `getAll` always fetches everything, no `?all=true` query param handling needed
- **Fields**: `title: LocalizedText`, `description: LocalizedText`, `imageUrl`, `order`
- **No `isActive`** → model has only `{ order: 1 }` index, no compound `{ isActive, order }`
- **FE service**: only `getAll`, `getById`, `create`, `update`, `remove` — no `getActive`

### Episode (`/api/db/episodes`)
- **Has `isActive`** → server has both `getAllItems` and `getActiveItems`
- **Controller `getAll`** reads `?all=true` to switch between them
- **Endpoint** has both `GET_ALL_EPISODES` (with `{ queryString: { all: true } }`) and `GET_ACTIVE_EPISODES`
- **Fields**: `title: LocalizedText`, `description?: LocalizedText`, `thumbnailUrl`, `youtubeUrl`, `order`, `isActive`
- **Model**: compound index `{ isActive: 1, order: 1 }` for efficient active-only queries

> These two features are the **primary references** to read before scaffolding a new section.

