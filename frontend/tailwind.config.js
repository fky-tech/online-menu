/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
      },
      colors: {
        brand: {
          background: '#F9F9F7', // Light beige background from image
          primary: '#F97316',    // Orange accent (Tailwind's orange-500)
          text: '#1c1917',       // Dark text (stone-900)
          muted: '#78716c',      // Muted text (stone-500)
        }
      }
    },
  },
  plugins: [],
}