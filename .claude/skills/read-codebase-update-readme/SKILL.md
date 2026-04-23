---
name: read-codebase-update-readme
description: Reads the codebase to discover the full tech stack and project structure, then updates the README with accurate Features, Tech Stack, Project Structure, and Scripts. Use when the user asks to update README, sync README with codebase, document tech stack, or refresh project documentation.
---

# Read Codebase and Update README

## When to Use

- User asks to update or refresh the README
- User wants the README to reflect the current tech stack and structure
- After adding/removing dependencies or folders

## Workflow

### 1. Discover Tech Stack

**Read these files (in order):**

- `package.json` — dependencies, devDependencies, scripts, name, version
- `next.config.ts` or `next.config.js` — framework config, rewrites, env
- `tsconfig.json` — TypeScript/language setup
- `components.json` — if present (shadcn: style, aliases, icon library)
- `.env.example` — env vars to document

**From `package.json`:**

- List every dependency and devDependency (no guessing).
- Group into categories for the README Tech Stack section:
  - **Core**: next, react, react-dom, typescript
  - **Styling**: tailwindcss, class-variance-authority, clsx, tailwind-merge, tw-animate-css
  - **UI / Components**: @radix-ui/*, shadcn-related, lucide-react, framer-motion, cmdk, sonner, swiper
  - **Forms & Validation**: react-hook-form, @hookform/resolvers, zod
  - **State**: @reduxjs/toolkit, react-redux
  - **i18n**: next-intl
  - **Data / API**: (fetch, axios, or project-specific clients)
  - **Utilities**: date-fns, dayjs, js-cookie, etc.
  - **Dev / Lint**: eslint, prettier, husky, commitlint, commitizen, lint-staged

Add or remove categories based on what the project actually has. Do not list packages that are not in package.json.

### 2. Discover Project Structure

**Build the folder tree from real paths:**

- Use `Glob` or directory listing on `src/` (e.g. `src/**/*`) to get actual files/folders.
- Include important roots: `app/`, `components/`, `lib/`, `hooks/`, `store/`, `services/`, `i18n/`, `styles/`, `types/`, `helpers/`, `settings/`.
- Show 1–2 levels of nesting with key files (e.g. `layout.tsx`, `page.tsx`, `route.ts`). Do not invent paths; only document what exists.
- If the repo has `scripts/`, mention it in structure or in a Scripts section.

### 3. Scripts and Commands

- Copy `scripts` from `package.json` into the README "Available Scripts" (or equivalent).
- Group as: Development (dev, build, start), Code quality (lint, format, type-check), Git/commits (commit, pre-commit) if present.
- Use the same package manager the README or lockfile implies (yarn vs npm); keep commands consistent.

### 4. Update README

- **Do not** remove existing sections unless they are wrong or empty; prefer updating in place.
- **Features**: Sync with tech stack (e.g. Next.js 15, TypeScript, i18n, Tailwind, shadcn, Redux, forms with react-hook-form + zod).
- **Tech Stack**: Replace with the categorized list from step 1. Use bullet lists and short descriptions where helpful.
- **Project Structure**: Replace the tree with the one from step 2. Use a fenced code block with a clear root (e.g. `src/`).
- **Getting Started / Prerequisites**: Keep or add Node version if specified in package.json engines or docs; add env setup if `.env.example` exists (e.g. "Copy `.env.example` to `.env` and fill in values").
- **Available Scripts**: Replace with the list from step 3.
- **Environment**: If `.env.example` exists, add a short "Environment variables" subsection listing the variable names (and optionally brief purpose); do not paste secret values.
- Preserve tone (e.g. professional, minimal) and any project-specific sections (e.g. Deployment, Contributing, License).

### 5. Verify

- README must only mention packages that exist in `package.json`.
- All script names in the README must exist in `package.json` scripts.
- Folder and file names in the structure must match the repository (no placeholder or outdated paths).

## Output

- Apply edits to `README.md` in the project root.
- Prefer **search_replace** to update specific sections rather than rewriting the entire file when only tech stack, structure, or scripts changed.
- If the README is missing a Tech Stack or Project Structure section, add it in a logical place (e.g. after Features).

## Notes

- Use the project's existing README section headings when updating (e.g. "🛠️ Tech Stack", "📁 Project Structure") so the document stays consistent.
- For monorepos or multiple apps, scope the structure and scripts to the current app or document each app separately as the user prefers.

 ## Additional resources

- For README section order and tech stack category examples, see [reference.md](reference.md).
