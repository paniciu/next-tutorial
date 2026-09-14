"use client";

import { useAppStore } from "@/store/useAppStore";

// De ce: persist hidratează asincron din localStorage, iar fără acest gard putem lua decizii pe valori implicite care nu sunt încă reale.
export function useStoreHydrated() {
  return useAppStore(state => state.hasHydrated);
}
