/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef6ff',
          100: '#d9eaff',
          200: '#bcd9ff',
          300: '#8ec1ff',
          400: '#589dff',
          500: '#2575fc',
          600: '#0052e0',
          700: '#0040b3',
          800: '#003594',
          900: '#062d77',
          950: '#051b47',
        },
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        surface: {
          darker: '#070a12',
          dark: '#0b0f19',
          card: '#111726',
          border: '#1e293b',
          muted: '#64748b'
        }
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"SF Pro Display"',
          '"SF Pro Text"',
          '"Plus Jakarta Sans"',
          '"Inter"',
          'system-ui',
          'sans-serif'
        ],
      }
    },
  },
  plugins: [],
}
