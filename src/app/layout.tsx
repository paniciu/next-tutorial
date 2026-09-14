import type { Metadata } from "next";
import { Geist } from "next/font/google";

import { ThemeProvider } from "@/components/theme/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { LEGACY_APP_STORE_STORAGE_KEY, THEME_STORAGE_KEY } from "@/lib/theme";
import { TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

import "./globals.css";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-sans"
});

// De ce: layout-ul rădăcină este locul unde Next.js separă shell-ul comun de rutele concrete, iar asta ne ajută să păstrăm stabilă structura aplicației când adăugăm chat, profil și memorie.
export const metadata: Metadata = {
  title: "SkillForge",
  description: "SkillForge este fundația unui copilot personal de skills și carieră."
};

const themeInitializationScript = `
(() => {
  const THEME_KEY = "${THEME_STORAGE_KEY}";
  const LEGACY_STORE_KEY = "${LEGACY_APP_STORE_STORAGE_KEY}";
  const isThemePreference = value => value === "system" || value === "light" || value === "dark";

  const readThemePreference = () => {
    try {
      const savedPreference = window.localStorage.getItem(THEME_KEY);
      if (isThemePreference(savedPreference)) {
        return savedPreference;
      }

      // De ce: punte temporară de migrare; dacă noua cheie lipsește, folosim preferința veche din store ca să evităm flash-ul la primul load după update.
      const legacyStoreRaw = window.localStorage.getItem(LEGACY_STORE_KEY);
      if (!legacyStoreRaw) {
        return "system";
      }

      const parsedLegacyStore = JSON.parse(legacyStoreRaw);
      const legacyPreference = parsedLegacyStore?.state?.themePreference;

      if (isThemePreference(legacyPreference)) {
        window.localStorage.setItem(THEME_KEY, legacyPreference);
        return legacyPreference;
      }
    } catch {
      return "system";
    }

    return "system";
  };

  const preference = readThemePreference();
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const resolvedTheme = preference === "system" ? (prefersDark ? "dark" : "light") : preference;

  document.documentElement.classList.toggle("dark", resolvedTheme === "dark");
  document.documentElement.style.colorScheme = resolvedTheme;
})();
`;

// De ce: html și body trăiesc aici ca să nu duplicăm infrastructura comună pe fiecare rută nouă.
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ro" className={cn("font-sans", geist.variable)} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitializationScript }} />
      </head>
      <body>
        <ThemeProvider>
          <TooltipProvider>{children}</TooltipProvider>
          <Toaster position="top-right" richColors />
        </ThemeProvider>
      </body>
    </html>
  );
}
