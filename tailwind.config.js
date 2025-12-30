/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      colors: {
        // Theme-aware colors using CSS variables
        bg: {
          primary: 'var(--bg-primary)',
          secondary: 'var(--bg-secondary)',
          card: 'var(--bg-card)',
          hover: 'var(--bg-hover)',
          accent: 'var(--bg-accent)',
        },
        text: {
          primary: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          muted: 'var(--text-muted)',
          inverse: 'var(--text-inverse)',
        },
        border: {
          DEFAULT: 'var(--border-color)',
          color: 'var(--border-color)',
          hover: 'var(--border-hover)',
          accent: 'var(--border-accent)',
        },
        // Legacy dark theme colors (for backward compatibility)
        dark: {
          bg: '#0F0F15',
          card: '#25252B',
          border: '#2A2A35',
          text: {
            primary: '#FFFFFF',
            secondary: '#A1A1AA',
            muted: '#71717A',
          },
        },
        // Position colors
        position: {
          fwd: '#DC2626',
          mid: '#F59E0B',
          def: '#059669',
          gkp: '#3B82F6',
        },
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

