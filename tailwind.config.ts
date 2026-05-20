import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Black + neon red theme
        ink: {
          950: '#000000',
          900: '#0a0a0a',
          800: '#141414',
          700: '#1f1f1f',
          600: '#2a2a2a',
          500: '#3a3a3a',
        },
        neon: {
          DEFAULT: '#ff003c',       // primary neon red
          glow: '#ff1f4f',
          dim: '#a8002a',
          muted: '#660019',
        },
        bone: '#f5f5f5',            // off-white for text
        mute: '#9a9a9a',            // secondary text
      },
      fontFamily: {
        sans: ['system-ui', '-apple-system', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      boxShadow: {
        'neon': '0 0 0 1px #ff003c, 0 0 12px rgba(255,0,60,0.35)',
        'neon-sm': '0 0 0 1px #ff003c',
      },
    },
  },
  plugins: [],
};

export default config;
