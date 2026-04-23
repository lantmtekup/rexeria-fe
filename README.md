# Base Source Next.js App 15

A modern, production-ready Next.js 15 application built with TypeScript, featuring internationalization, component-based architecture, and comprehensive development tooling.

## 🚀 Features

- ✅ **Next.js 15** with App Router and Turbopack
- ✅ **TypeScript** for type safety
- ✅ **Internationalization (i18n)** with next-intl (English & Vietnamese)
- ✅ **TailwindCSS 4** for modern styling
- ✅ **shadcn/ui** components with Radix UI primitives (New York style)
- ✅ **Redux** state management (@reduxjs/toolkit, react-redux)
- ✅ **Forms & Validation** with react-hook-form, @hookform/resolvers, and Zod
- ✅ **Markdown** rendering (react-markdown, remark-gfm, rehype)
- ✅ **Theme** support (next-themes)
- ✅ **Modular Architecture** with layouts, store, services, hooks, helpers, settings
- ✅ **Authentication Layout** and web client layout (Header, Footer)
- ✅ **Development Tools**: ESLint, Prettier, Husky, Commitlint, lint-staged
- ✅ **Conventional Commits** with Commitizen
- ✅ **Module generator** script for scaffolding

## 🛠️ Tech Stack

### Core
- **next** 15.3.8, **react** 19, **react-dom** 19
- **typescript** 5

### Styling
- **tailwindcss** 4, **@tailwindcss/postcss**
- **class-variance-authority**, **clsx**, **tailwind-merge**
- **tw-animate-css** (dev)

### UI / Components
- **@radix-ui/** (accordion, checkbox, dialog, label, popover, scroll-area, select, slot, tabs)
- **lucide-react** (icons)
- **framer-motion**, **cmdk**, **sonner**, **swiper**
- **next-themes**
- **input-otp**, **react-day-picker**, **react-phone-input-2**, **react-phone-number-input**
- **react-countdown**, **react-share**
- **resize-observer-polyfill**

### Forms & Validation
- **react-hook-form**, **@hookform/resolvers**, **zod**

### State
- **@reduxjs/toolkit**, **react-redux**

### i18n
- **next-intl**

### Content / Markdown
- **react-markdown**, **remark-gfm**, **rehype-highlight**, **rehype-raw**, **remove-markdown**

### Utilities
- **date-fns**, **dayjs**, **js-cookie**

### Development / Lint
- **eslint** 9, **eslint-config-next**, **eslint-config-prettier**, **eslint-plugin-prettier**
- **prettier**, **prettier-plugin-tailwindcss**
- **husky**, **lint-staged**
- **@commitlint/cli**, **@commitlint/config-conventional**
- **commitizen**, **cz-conventional-changelog**

## 📁 Project Structure

```
src/
├── app/                      # Next.js App Router
│   ├── api/health/           # API routes (e.g. route.ts)
│   ├── (web-client)/         # Web client route group
│   │   ├── layout.tsx
│   │   └── (home)/page.tsx, loading.tsx
│   ├── layout.tsx
│   ├── providers.tsx
│   ├── error.tsx
│   ├── not-found.tsx
│   ├── manifest.ts
│   ├── sitemap.ts
│   └── robots.ts
├── components/
│   └── layouts/              # WebClient, Header, Footer, Authentication
├── i18n/
│   ├── messages/common/      # en.json, vi.json
│   └── request.ts
├── lib/                      # Utilities & config
│   ├── metadata/             # SEO, schema-org, generators
│   ├── sitemap/              # Sitemap types & generators
│   ├── cn.ts
│   ├── webStorageClient.ts
│   ├── webSessionStorage.ts
│   └── swiper.ts
├── store/                    # Redux
│   ├── slices/authSlice.ts
│   └── index.ts
├── services/
│   ├── base/fetchInstance.ts
│   └── endpoint/
├── settings/
│   ├── constants/            # router, index
│   └── enums/
├── hooks/                    # useWindowSize, useRouter, useRoutePattern, useRedux, useLocale
├── helpers/
│   ├── transformation/
│   └── mock/
├── types/
│   └── api.ts
└── styles/
    ├── globals.css
    └── news.css
```

## 🏁 Getting Started

### Prerequisites
- Node.js 18+ 
- Yarn (recommended) or npm

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd base-source-next-app-15
   ```

2. **Install dependencies**
   ```bash
   yarn install
   # or
   npm install
   ```

3. **Environment**
   Copy `.env.example` to `.env` and fill in the values (see [Environment](#-environment) section below).

4. **Start development server**
   ```bash
   yarn dev
   # or
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📜 Available Scripts

### Development
```bash
yarn dev                    # Start development server with Turbopack
yarn build                  # Build for production
yarn start                  # Start production server
```

### Code Quality
```bash
yarn lint                   # Run ESLint
yarn lint:fix               # Fix ESLint issues automatically
yarn format                 # Format code with Prettier
yarn format:check           # Check code formatting
yarn type-check             # Run TypeScript type checking
```

### Git & Commits
```bash
yarn commit                 # Create conventional commit with Commitizen
yarn commitlint             # Validate commit messages
yarn pre-commit             # Run pre-commit hooks manually
```

### Codegen
```bash
yarn generate-module        # Generate a new module (scripts/generate-module.js)
```

## 🌐 Environment

Copy `.env.example` to `.env` and configure:

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_API_URL` | API base URL |
| `NEXT_PUBLIC_ASSETS_URL` | Assets base URL |
| `NEXT_PUBLIC_DOMAIN_IMAGE` | Image domain for Next.js images |
| `NEXT_PUBLIC_SITE_URL` | Site URL for SEO |
| `NEXT_PUBLIC_SITE_NAME` | Site name |
| `NEXT_PUBLIC_FACEBOOK_CLIENT_ID` | Facebook OAuth |
| `FACEBOOK_CLIENT_SECRET` | Facebook OAuth secret |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Google OAuth |
| `GOOGLE_CLIENT_SECRET` | Google OAuth secret |

## 🌍 Internationalization

The project supports multiple languages using `next-intl`:

- **English** (`en`) - Default locale
- **Vietnamese** (`vi`) - Additional locale

### Adding Translations

1. Add translations to respective JSON files in `src/i18n/messages/`
2. Organize by feature: `common/` for shared translations, `home/` for page-specific

### Usage in Components
```tsx
import { useTranslations } from 'next-intl';

export default function Component() {
  const t = useTranslations('common');
  return <h1>{t('title')}</h1>;
}
```

## 🎨 UI Components

This project uses shadcn/ui components with the "New York" style:

### Adding New Components
```bash
npx shadcn@latest add <component-name>
```

### Component Configuration
- **Style**: New York
- **Base Color**: Neutral
- **CSS Variables**: Enabled
- **Icon Library**: Lucide React

## 🔧 Development Guidelines

### Code Quality Standards
- **ESLint** rules enforce code consistency
- **Prettier** automatically formats code
- **TypeScript** provides type safety
- **Husky** runs pre-commit hooks
- **Commitlint** ensures conventional commit messages

### Commit Message Format
```
type(scope): description

[optional body]

[optional footer]
```

**Commit Types:**
- `feat`: New features
- `fix`: Bug fixes
- `docs`: Documentation updates
- `style`: Code styling changes
- `refactor`: Code refactoring
- `test`: Test additions/modifications
- `chore`: Maintenance tasks

### Pre-commit Process
1. **Automatic linting** and formatting on staged files
2. **Type checking** to catch TypeScript errors
3. **Commit message validation** for conventional format

## 🏗️ Architecture Patterns

### Component Organization
- **Layouts**: Reusable layout components
- **Modules**: Feature-specific component groups
- **UI**: Base UI components from shadcn/ui

### Type Safety
- Centralized type definitions in `src/types/`
- Strict TypeScript configuration
- Type-safe internationalization

### Styling Approach
- **TailwindCSS** for utility-first styling
- **CSS Variables** for theme customization
- **Responsive design** built-in

## 🚀 Deployment

### Build the Project
```bash
yarn build
```

### Run Production Server
```bash
yarn start
```

### Deployment Platforms
- **Vercel** (recommended for Next.js)
- **Netlify**
- **Railway**
- **Docker** (containerized deployment)

## 📚 Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [TailwindCSS Docs](https://tailwindcss.com/docs)
- [shadcn/ui Components](https://ui.shadcn.com/)
- [next-intl Documentation](https://next-intl-docs.vercel.app/)

## 🤝 Contributing

1. Follow the established code style and conventions
2. Use `yarn commit` for conventional commit messages
3. Ensure all tests pass and code is properly formatted
4. See `DEVELOPMENT.md` for detailed development guidelines

## 📄 License

This project is private and proprietary.

---

