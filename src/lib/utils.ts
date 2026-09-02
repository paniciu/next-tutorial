import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// De ce: `cn()` devine punctul unic în care combinăm condițional clase și rezolvăm conflictele Tailwind, ca să păstrăm componentele UI coerente pe măsură ce cresc.
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
