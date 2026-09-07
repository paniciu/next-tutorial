import { Chat } from "@/components/chat/chat";
import { AppHeader } from "@/components/layout/app-header";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

// De ce: pagina principală devine shell-ul final de aplicație pentru a valida complet UX-ul înainte de integrarea cu modele reale.
export default function HomePage() {
  return (
    <SidebarProvider defaultOpen>
      <AppSidebar />
      <SidebarInset>
        <AppHeader />
        <Chat />
      </SidebarInset>
    </SidebarProvider>
  );
}
