/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        armac: {
          blue: '#002A9B',
          blueDark: '#001F73',
          blueDarker: '#001452',
          green: '#00A742',
          greenDark: '#008536',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
