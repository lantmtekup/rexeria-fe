/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Be Vietnam Pro', 'system-ui', 'sans-serif'],
        // Tiêu đề (font-serif) cũng dùng Be Vietnam Pro — đồng bộ một font.
        serif: ['Be Vietnam Pro', 'system-ui', 'sans-serif'],
        // Chỉ cho wordmark logo The Magnolia (MagnoliaLogo.jsx).
        logo: ['Playfair Display', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
};
