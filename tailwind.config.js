/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#FDF0EB',
          100: '#FAD9C8',
          500: '#D97757',
          600: '#C4623E',
          900: '#9A3412',
        },
      },
      fontFamily: {
        sans: ['Inter', 'PingFang SC', 'Microsoft YaHei', 'sans-serif'],
      },
      borderRadius: {
        'xl': '14px',
        '2xl': '20px',
      },
    },
  },
  plugins: [],
}
