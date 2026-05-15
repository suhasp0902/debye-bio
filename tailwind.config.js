/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#E6FBFF',
        surface: {
          DEFAULT: '#F8FDFF',
          raised: '#E8F7FB',
        },
        border: {
          DEFAULT: 'rgba(6,37,58,0.13)',
          light: 'rgba(6,37,58,0.22)',
        },
        accent: {
          primary: '#0B67B2',
          secondary: '#25C9DC',
          success: '#10B981',
          warning: '#F5B836',
          error: '#EF4444',
        },
        text: {
          primary: '#06253A',
          secondary: '#43677A',
          muted: '#6E8A98',
        },
        node: {
          bio: '#DFF9FF',
          bioBorder: '#25C9DC',
          elec: '#DCEEFF',
          elecBorder: '#0B67B2',
          material: '#FFF0B7',
          materialBorder: '#F5B836',
          biochem: '#064E3B',
          biochemBorder: '#10B981',
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
