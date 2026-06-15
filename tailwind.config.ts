import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        butter: '#fff7cf',
        honey: '#facc15',
        mandarin: '#fb923c',
        peach: '#ffedd5',
        mint: '#bbf7d0',
        skysoft: '#dbeafe',
        ink: '#1f2937',
      },
      boxShadow: {
        board: '0 18px 40px rgba(251, 146, 60, 0.16)',
        card: '0 10px 24px rgba(31, 41, 55, 0.08)',
      },
    },
  },
  plugins: [],
} satisfies Config;
