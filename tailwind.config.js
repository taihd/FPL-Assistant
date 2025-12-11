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
        // Dark theme colors matching the design
        dark: {
          bg: '#0F0F15', // Main background - deep dark purplish-grey
          card: '#25252B', // Card/section background - lighter dark grey
          border: '#2A2A35', // Border color
          text: {
            primary: '#FFFFFF', // Primary text
            secondary: '#A1A1AA', // Secondary text
            muted: '#71717A', // Muted text
          },
        },
        // Position colors
        position: {
          fwd: '#DC2626', // Muted red for FWD
          mid: '#F59E0B', // Amber for MID
          def: '#059669', // Muted green for DEF
          gkp: '#3B82F6', // Blue for GKP
        },
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

