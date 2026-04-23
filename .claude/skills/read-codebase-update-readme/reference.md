# Reference: README Sections and Tech Stack Categories

## Suggested README section order

1. Title and short description
2. Features (bullets, synced with actual stack)
3. Tech Stack (grouped by category)
4. Project Structure (tree from `src/` and key roots)
5. Getting Started (prerequisites, install, env, run)
6. Available Scripts (from package.json)
7. Environment variables (if .env.example exists)
8. Optional: i18n, UI components, guidelines, deployment, contributing, license

## Tech stack categories (adjust per project)

| Category | Typical packages |
|----------|------------------|
| Core | next, react, react-dom, typescript |
| Styling | tailwindcss, class-variance-authority, clsx, tailwind-merge |
| UI / Components | @radix-ui/*, lucide-react, framer-motion, cmdk, sonner, swiper |
| Forms & Validation | react-hook-form, @hookform/resolvers, zod |
| State | @reduxjs/toolkit, react-redux |
| i18n | next-intl |
| Data / API | fetch wrappers, axios, project API clients |
| Utilities | date-fns, dayjs, js-cookie, etc. |
| Dev / Lint | eslint, prettier, husky, commitlint, commitizen, lint-staged |

## Building the src/ tree

- Prefer listing real directories: `app/`, `components/`, `lib/`, `hooks/`, `store/`, `services/`, `i18n/`, `styles/`, `types/`, `helpers/`, `settings/`.
- Show one level of children with representative file names (e.g. `layout.tsx`, `page.tsx`).
- Omit empty or irrelevant folders. Do not document `node_modules` or build output.
