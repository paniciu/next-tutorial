"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

import {
  LEGACY_APP_STORE_STORAGE_KEY,
  THEME_MEDIA_QUERY,
  THEME_STORAGE_KEY,
  isThemePreference,
  readLegacyThemePreference,
  resolveThemePreference
} from "@/lib/theme";
import type { ResolvedTheme, ThemePreference } from "@/lib/types";

type ThemeProviderProps = {
  children: React.ReactNode;
};

type ThemeContextValue = {
  themePreference: ThemePreference;
  resolvedTheme: ResolvedTheme;
  setThemePreference: (theme: ThemePreference) => void;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

function getSystemPreference(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  return window.matchMedia(THEME_MEDIA_QUERY).matches;
}

function getInitialThemePreference(): ThemePreference {
  if (typeof window === "undefined") {
    return "system";
  }

  try {
    const rawThemePreference = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (isThemePreference(rawThemePreference)) {
      return rawThemePreference;
    }

    // De ce: punte temporară pentru utilizatorii care aveau tema în cheia veche de store; evităm resetul preferinței după update.
    const legacyPreference = readLegacyThemePreference(window.localStorage.getItem(LEGACY_APP_STORE_STORAGE_KEY));
    if (legacyPreference) {
      window.localStorage.setItem(THEME_STORAGE_KEY, legacyPreference);
      return legacyPreference;
    }
  } catch {
    return "system";
  }

  return "system";
}

// De ce: izolăm logica de temă într-un provider dedicat ca schimbările viitoare să nu polueze layout-ul global cu efecte de browser.
export function ThemeProvider({ children }: ThemeProviderProps) {
  const [themePreference, setThemePreference] = useState<ThemePreference>(getInitialThemePreference);
  const [systemPrefersDark, setSystemPrefersDark] = useState<boolean>(getSystemPreference);

  const resolvedTheme = useMemo(
    () => resolveThemePreference(themePreference, systemPrefersDark),
    [themePreference, systemPrefersDark]
  );

  useEffect(() => {
    document.documentElement.classList.toggle("dark", resolvedTheme === "dark");
    document.documentElement.style.colorScheme = resolvedTheme;
  }, [resolvedTheme]);

  useEffect(() => {
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, themePreference);
    } catch {
      // De ce: dacă storage-ul e blocat (privacy mode / policy), aplicația trebuie să continue fără persistență.
    }
  }, [themePreference]);

  useEffect(() => {
    if (themePreference !== "system") {
      return;
    }

    const mediaQuery = window.matchMedia(THEME_MEDIA_QUERY);

    // De ce: init state cu valoarea curentă, dar se face după render ca să nu triggere cascading renders.
    const handleInitAndChange = (event?: MediaQueryListEvent) => {
      setSystemPrefersDark(event ? event.matches : mediaQuery.matches);
    };

    // Inițializare
    handleInitAndChange();

    mediaQuery.addEventListener("change", handleInitAndChange);
    return () => mediaQuery.removeEventListener("change", handleInitAndChange);
  }, [themePreference]);

  const contextValue = useMemo(
    () => ({
      themePreference,
      resolvedTheme,
      setThemePreference
    }),
    [themePreference, resolvedTheme]
  );

  return <ThemeContext.Provider value={contextValue}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme trebuie folosit în interiorul ThemeProvider.");
  }

  return context;
}
