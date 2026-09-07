"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { useAppStore } from "@/store/useAppStore";

// De ce: păstrăm header-ul minimal pentru orientare și acces mobil la navigație, fără să aglomerăm ecranul principal de conversație.
export function AppHeader() {
  const activeConversationId = useAppStore(state => state.activeConversationId);
  const conversations = useAppStore(state => state.conversations);

  const activeConversation = conversations.find(item => item.id === activeConversationId);

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b bg-background/95 px-4 backdrop-blur supports-backdrop-filter:bg-background/70">
      <SidebarTrigger className="md:hidden" />
      <div className="min-w-0">
        <p className="text-xs font-medium tracking-[0.16em] text-muted-foreground uppercase">SkillForge</p>
        <p className="truncate text-sm font-medium">{activeConversation?.title ?? "Conversație nouă"}</p>
      </div>
    </header>
  );
}
