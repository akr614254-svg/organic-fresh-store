/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        forest: '#1B4332',
        leaf: '#40916C',
        sprout: '#95D5B2',
        cream: '#FBF9F1',
        turmeric: '#E8A33D',
        charcoal: '#1F2318',
        // Dark-mode surface tokens — used only via `dark:` utilities and
        // the `.dark` overrides in index.css, so the light-mode palette
        // above is completely untouched.
        dusk: '#12140D',
        duskcard: '#1B2016',
      },
      fontFamily: {
        display: ['Fraunces', 'serif'],
        body: ['"Plus Jakarta Sans"', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
      borderRadius: {
        blob: '42% 58% 65% 35% / 45% 40% 60% 55%',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        floaty: {
          '0%, 100%': { transform: 'translateY(0px) rotate(-2deg)' },
          '50%': { transform: 'translateY(-14px) rotate(2deg)' },
        },
      },
      animation: {
        marquee: 'marquee 22s linear infinite',
        floaty: 'floaty 6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
