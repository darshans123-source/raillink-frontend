/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        railway: {
          darkest: '#081c15',
          dark: '#1b4332',
          primary: '#2d6a4f',
          medium: '#40916c',
          light: '#52b788',
          mint: '#74c69d',
          soft: '#b7e4c7',
          pale: '#d8f3dc',
          bg: '#f8fafc',
          surface: '#ffffff',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)',
        'card-hover': '0 4px 12px 0 rgba(27, 67, 50, 0.08), 0 2px 4px -1px rgba(27, 67, 50, 0.06)',
      }
    },
  },
  plugins: [],
}
