/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{ts,tsx,js,jsx}'
  ],
  theme: {
    extend: {
      colors: {
        primary: '#4A90E2',
        secondary: '#50E3C2'
      },
      boxShadow: {
        soft: '0 10px 30px rgba(0,0,0,0.2)'
      },
      backdropBlur: {
        xl: '12px'
      }
    }
  },
  plugins: []
}
