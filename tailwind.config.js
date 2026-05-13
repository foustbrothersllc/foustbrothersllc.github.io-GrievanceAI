/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'ups-brown': '#351C15',
        'ups-gold': '#FFB81C',
        'ups-black': '#0a0a0a',
      },
    },
  },
  plugins: [],
}
