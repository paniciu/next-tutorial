import type { ResolvedTheme, ThemePreference } from "@/lib/types";

export const THEME_STORAGE_KEY = "skillforge-theme";
export const LEGACY_APP_STORE_STORAGE_KEY = "skillforge-app";
export const THEME_MEDIA_QUERY = "(prefers-color-scheme: dark)";

const validThemePreferences: ThemePreference[] = ["system", "light", "dark"];

export function isThemePreference(value: unknown): value is ThemePreference {
  return typeof value === "string" && validThemePreferences.includes(value as ThemePreference);
}

// De ce: păstrăm regula de decizie într-o funcție pură și reutilizabilă, ca toate punctele de aplicare a temei să fie consistente.
export function resolveThemePreference(preference: ThemePreference, systemPrefersDark: boolean): ResolvedTheme {
  if (preference === "system") {
    return systemPrefersDark ? "dark" : "light";
  }

  return preference;
}

export function readLegacyThemePreference(rawLegacyStore: string | null): ThemePreference | null {
  if (!rawLegacyStore) {
    return null;
  }

  try {
    const parsed = JSON.parse(rawLegacyStore) as { state?: { themePreference?: unknown } };
    const legacyPreference = parsed?.state?.themePreference;

    return isThemePreference(legacyPreference) ? legacyPreference : null;
  } catch {
    return null;
  }
}
