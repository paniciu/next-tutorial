import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

// De ce: folosim configurația recomandată de Next.js 16 ca să prindem devreme problemele dintre cod de server, cod de client și TypeScript.
export default defineConfig([
  ...nextVitals,
  ...nextTypescript,
  globalIgnores([".next/**", "out/**", "coverage/**", "next-env.d.ts"])
]);
