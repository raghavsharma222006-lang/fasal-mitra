/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        green: { primary: '#1a6b2f', light: '#2d9e47', dark: '#0f3d1f' },
        gold:  { primary: '#f5c518', dark: '#e6ac00' },
        earth: '#8B6914',
      },
      fontFamily: { poppins: ['Poppins', 'sans-serif'] },
      animation: {
        'float':    'floatY 3.5s ease-in-out infinite',
        'pulse-sm': 'pulse 2.2s ease-in-out infinite',
        'shimmer':  'shimmer 1.5s infinite',
        'grad':     'gradientShift 8s ease infinite',
        'slide-up': 'slideUp 0.4s cubic-bezier(.16,1,.3,1)',
        'fade-up':  'fadeInUp 0.65s ease both',
      },
      keyframes: {
        floatY:        { '0%,100%':{ transform:'translateY(0)' }, '50%':{ transform:'translateY(-18px)' } },
        shimmer:       { '0%':{ backgroundPosition:'-200% 0' }, '100%':{ backgroundPosition:'200% 0' } },
        gradientShift: { '0%,100%':{ backgroundPosition:'0% 50%' }, '50%':{ backgroundPosition:'100% 50%' } },
        slideUp:       { from:{ transform:'translateY(100%)' }, to:{ transform:'translateY(0)' } },
        fadeInUp:      { from:{ opacity:'0', transform:'translateY(30px)' }, to:{ opacity:'1', transform:'translateY(0)' } },
      }
    }
  },
  plugins: []
}
