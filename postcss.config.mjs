// De ce: Tailwind v4 intră în pipeline prin pluginul PostCSS oficial, iar asta păstrează setup-ul compatibil cu Next.js fără configurări paralele.
const config = {
  plugins: {
    "@tailwindcss/postcss": {}
  }
};

export default config;
