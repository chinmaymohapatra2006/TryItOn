/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['"Playfair Display"', '"Cormorant Garamond"', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
      },
      colors: {
        sand: {
          50: '#FDFCF9',
          100: '#FAF7F2',
          200: '#F3EDE2',
          300: '#E7DEC8',
          400: '#D5C4A1',
          500: '#C2AA7D',
          600: '#A88F61',
          700: '#8A734C',
          800: '#69573A',
          900: '#4D3F2B',
        },
        latte: {
          50: '#FBF9F7',
          100: '#F5F0EB',
          200: '#EBDDCE',
          300: '#D9C4AF',
          400: '#C2A68D',
          500: '#A88B74',
          600: '#8C6D58',
          700: '#6E5341',
          800: '#523D30',
          900: '#382920',
        },
        espresso: {
          50: '#F6F6F6',
          100: '#E7E7E7',
          200: '#D1D1D1',
          300: '#B0B0B0',
          400: '#888888',
          500: '#6D6D6D',
          600: '#4F4F4F',
          700: '#3A3633',
          800: '#292524',
          900: '#1C1917',
          950: '#12100F',
        },
        brand: {
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
        }
      }
    },
  },
  plugins: [],
}
