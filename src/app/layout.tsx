import type { Metadata } from "next";
import { Geist } from "next/font/google";

import { ThemeProvider } from "@/components/theme/theme-provider";
import { Toaster } from "@/components/ui/sonner";
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

// De ce: html și body trăiesc aici ca să nu duplicăm infrastructura comună pe fiecare rută nouă.
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ro" className={cn("font-sans", geist.variable)} suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <TooltipProvider>{children}</TooltipProvider>
          <Toaster position="top-right" richColors />
        </ThemeProvider>
      </body>
    </html>
  );
}
