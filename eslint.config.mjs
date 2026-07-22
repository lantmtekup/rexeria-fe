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
  {
    // Các app standalone trong apps/* (mint2026, protection…) có toolchain +
    // eslint riêng, không chịu convention của host app rexerai.
    ignores: ['apps/**'],
  },
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
    // Node-side scripts (Playwright snaps, seed scripts) — `console.log` is
    // their primary I/O, so the global `no-console` ban doesn't apply here.
    files: ['scripts/**/*.{js,mjs,cjs,ts}'],
    rules: {
      'no-console': 'off',
    },
  },
  {
    // Ad-format components vendored từ ads_demo-rexer (showcase /rexer/ads).
    // Giữ sát source — nới các rule house không hợp với JS port (props nhận
    // nhưng không render, <img> nền quảng cáo, deps effect theo style gốc).
    files: ['src/components/landing/ad-showcase/ads/**/*.{js,jsx}'],
    rules: {
      '@typescript-eslint/no-unused-vars': 'off',
      '@next/next/no-img-element': 'off',
      'react-hooks/exhaustive-deps': 'off',
    },
  },
  {
    // Block templates must use container queries (`@2xl:` / `@4xl:`), not
    // viewport breakpoints (`md:` / `lg:` / etc.) — see
    // docs/canvas-block-responsive-spec.md §R1. Editor pages are exempt.
    files: ['src/components/modules/block-editor/blocks/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector: 'Literal[value=/(^|[\\s\'\\"`])(sm|md|lg|xl|2xl):/]',
          message:
            'Use container queries (@sm:, @2xl:, @4xl:) instead of viewport breakpoints in block templates. See docs/canvas-block-responsive-spec.md §R1.',
        },
        {
          selector:
            'TemplateElement[value.raw=/(^|[\\s\'\\"`])(sm|md|lg|xl|2xl):/]',
          message:
            'Use container queries (@sm:, @2xl:, @4xl:) instead of viewport breakpoints in block templates. See docs/canvas-block-responsive-spec.md §R1.',
        },
      ],
    },
  },
];

export default eslintConfig;
