/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0A0A0F',
        surface: {
          DEFAULT: '#111118',
          raised: '#1A1A24',
        },
        border: {
          DEFAULT: '#2A2A3A',
          light: '#3A3A4A',
        },
        accent: {
          primary: '#6366F1',
          secondary: '#22D3EE',
          success: '#10B981',
          warning: '#F59E0B',
          error: '#EF4444',
        },
        text: {
          primary: '#F1F5F9',
          secondary: '#94A3B8',
          muted: '#475569',
        },
        node: {
          bio: '#0E4A3A',
          bioBorder: '#22D3EE',
          elec: '#1E1B4B',
          elecBorder: '#6366F1',
          material: '#2D1B00',
          materialBorder: '#F59E0B',
        }
      },
      fontFamily: {
        sans: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      }
    },
  },
  plugins: [],
}
