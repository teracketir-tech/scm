/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',  
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
      "./src/assets/styles/style-important.css", // <--- این خط را اضافه کن
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#ecf3ff',
          100: '#dde9ff',
          200: '#c2d6ff',
          500: '#465fff',
          600: '#3641f5',
          700: '#2a31d8',
        },
        gray: {
          50: '#f9fafb',
          100: '#f2f4f7',
          200: '#e4e7ec',
          300: '#d0d5dd',
          400: '#98a2b3',
          500: '#667085',
          600: '#475467',
          700: '#344054',
          800: '#1d2939',
          900: '#101828',
        },
        success: {
          500: '#12b76a',
          50: '#ecfdf3',
        },
        error: {
          500: '#f04438',
          50: '#fef3f2',
        },
        warning: {
          500: '#f79009',
          50: '#fffaeb',
        },
      },
      fontFamily: {
        sans: ['Vazirmatn', 'Tahoma', 'sans-serif'],
      },
      borderRadius: {
        'xl': '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        'soft': '0 1px 3px 0 rgba(16, 24, 40, 0.1), 0 1px 2px -1px rgba(16, 24, 40, 0.1)',
        'card': '0 4px 6px -1px rgba(16, 24, 40, 0.05), 0 2px 4px -2px rgba(16, 24, 40, 0.05)',
      },
    },
  },
  plugins: [],
}