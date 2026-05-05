import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';
import prettierPlugin from 'eslint-plugin-prettier';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends('next/core-web-vitals', 'next/typescript', 'prettier'),
  {
    plugins: {
      prettier: prettierPlugin,
    },
    rules: {
      'prettier/prettier': 'error',
      '@typescript-eslint/no-unused-vars': 'error',
      '@typescript-eslint/no-explicit-any': 'off',
      'react-hooks/exhaustive-deps': 'warn',
      'no-console': 'error',
    },
  },
  {
    // Block templates must use container queries (`@2xl:` / `@4xl:`), not
    // viewport breakpoints (`md:` / `lg:` / etc.) — see
    // docs/canvas-block-responsive-spec.md §R1. Editor pages are exempt.
    files: [
      'src/components/modules/CanvasTemplate/block-editor/blocks/**/*.{ts,tsx}',
    ],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector:
            "Literal[value=/(^|[\\s'\\\"`])(sm|md|lg|xl|2xl):/]",
          message:
            'Use container queries (@sm:, @2xl:, @4xl:) instead of viewport breakpoints in block templates. See docs/canvas-block-responsive-spec.md §R1.',
        },
        {
          selector:
            "TemplateElement[value.raw=/(^|[\\s'\\\"`])(sm|md|lg|xl|2xl):/]",
          message:
            'Use container queries (@sm:, @2xl:, @4xl:) instead of viewport breakpoints in block templates. See docs/canvas-block-responsive-spec.md §R1.',
        },
      ],
    },
  },
];

export default eslintConfig;
