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
        // Obsidian Luxury Palette
        'obsidian': {
          DEFAULT: '#040814',
          '950': '#03060f',
          '900': '#060b18',
          '800': '#0a1128',
          '700': '#111c38',
          'card': '#0d162d',
          'border': 'rgba(255, 255, 255, 0.08)',
          'glass': 'rgba(13, 22, 45, 0.75)',
        },
        // Polished Bullion Gold
        'bullion': {
          DEFAULT: '#f59e0b',
          '50': '#fffbeb',
          '100': '#fef3c7',
          '200': '#fde68a',
          '300': '#fcd34d',
          '400': '#fbbf24',
          '500': '#f59e0b',
          '600': '#d97706',
          '700': '#b45309',
        },
        // Terminal Emerald
        'gain': {
          DEFAULT: '#10b981',
          'surface': 'rgba(16, 185, 129, 0.12)',
          'border': 'rgba(16, 185, 129, 0.28)',
          'text': '#34d399',
        },
        // Ruby Crimson
        'loss': {
          DEFAULT: '#f43f5e',
          'surface': 'rgba(244, 63, 94, 0.12)',
          'border': 'rgba(244, 63, 94, 0.28)',
          'text': '#fb7185',
        },
        // Legacy design tokens compatibility
        'surface': '#060b18',
        'surface-dim': '#040814',
        'surface-bright': '#152244',
        'surface-container-lowest': '#03060f',
        'surface-container-low': '#0a1128',
        'surface-container': '#0d162d',
        'surface-container-high': '#131f3f',
        'surface-container-highest': '#1a2a52',
        'on-surface': '#f8fafc',
        'on-surface-variant': '#94a3b8',
        'outline': '#64748b',
        'outline-variant': '#334155',
        'surface-tint': '#fbbf24',
        'primary': '#fbbf24',
        'on-primary': '#451a03',
        'primary-container': '#f59e0b',
        'on-primary-container': '#451a03',
        'inverse-primary': '#b45309',
        'secondary': '#10b981',
        'on-secondary': '#022c22',
        'secondary-container': '#059669',
        'on-secondary-container': '#022c22',
        'tertiary': '#f43f5e',
        'error': '#f43f5e',
        'error-container': '#881337',
        'background': '#040814',
        'on-background': '#f8fafc',
        'surface-variant': '#131f3f',
      },
      borderRadius: {
        'DEFAULT': '0.375rem',
        'sm': '0.25rem',
        'md': '0.5rem',
        'lg': '0.75rem',
        'xl': '1rem',
        '2xl': '1.25rem',
        '3xl': '1.5rem',
        'full': '9999px',
      },
      fontFamily: {
        sans: ['var(--font-vazirmatn)', 'var(--font-jakarta)', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
        num: ['var(--font-mono)', 'var(--font-vazirmatn)', 'monospace'],
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(50%)' },
        },
        glow: {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '0.8' },
        },
      },
      animation: {
        marquee: 'marquee 30s linear infinite',
        glow: 'glow 3s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
