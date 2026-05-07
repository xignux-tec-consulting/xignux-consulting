/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          'Inter',
          '-apple-system', 'BlinkMacSystemFont',
          '"Helvetica Neue"', 'Arial', 'sans-serif',
        ],
        mono: [
          '"JetBrains Mono"',
          'ui-monospace', '"SF Mono"',
          '"Cascadia Code"', 'Menlo', 'Monaco',
          'Consolas', 'monospace',
        ],
      },
      letterSpacing: {
        display: '-0.03em',
        tight: '-0.022em',
        snug:  '-0.011em',
      },
    },
  },
  plugins: [],
}
