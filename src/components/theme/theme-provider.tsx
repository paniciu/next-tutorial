"use client";

import { useEffect } from "react";

import { useAppStore } from "@/store/useAppStore";

type ThemeProviderProps = {
  children: React.ReactNode;
};

// De ce: izolăm logica de temă într-un provider dedicat ca schimbările viitoare să nu polueze layout-ul global cu efecte de browser.
export function ThemeProvider({ children }: ThemeProviderProps) {
  const themePreference = useAppStore(state => state.themePreference);
  const setResolvedTheme = useAppStore(state => state.setResolvedTheme);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const applyTheme = (prefersDark: boolean) => {
      const resolvedTheme = themePreference === "system" ? (prefersDark ? "dark" : "light") : themePreference;
      setResolvedTheme(resolvedTheme);
      document.documentElement.classList.toggle("dark", resolvedTheme === "dark");
      document.documentElement.style.colorScheme = resolvedTheme;
    };

    applyTheme(mediaQuery.matches);

    const handleChange = (event: MediaQueryListEvent) => {
      if (themePreference === "system") {
        applyTheme(event.matches);
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [setResolvedTheme, themePreference]);

  return children;
}
