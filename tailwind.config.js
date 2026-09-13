/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
          950: '#042f2e',
        },
        navy: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#0a1120',
        },
        ivory: {
          50: '#fdfdfc',
          100: '#faf9f5',
          200: '#f5f3ec',
          300: '#ece8dc',
          400: '#dad3bf',
        },
        mint: {
          50: '#f0fdf9',
          100: '#ccfbf1',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
        },
        priority: {
          must: {
            bg: 'rgba(239, 68, 68, 0.1)',
            border: 'rgba(239, 68, 68, 0.3)',
            text: '#ef4444',
            solid: '#dc2626',
          },
          high: {
            bg: 'rgba(249, 115, 22, 0.1)',
            border: 'rgba(249, 115, 22, 0.3)',
            text: '#f97316',
            solid: '#ea580c',
          },
          medium: {
            bg: 'rgba(245, 158, 11, 0.1)',
            border: 'rgba(245, 158, 11, 0.3)',
            text: '#f59e0b',
            solid: '#d97706',
          },
          low: {
            bg: 'rgba(100, 116, 139, 0.1)',
            border: 'rgba(100, 116, 139, 0.3)',
            text: '#94a3b8',
            solid: '#64748b',
          },
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      borderRadius: {
        'control': '8px',
        'card': '12px',
        'panel': '16px',
      },
    },
  },
  plugins: [],
};
