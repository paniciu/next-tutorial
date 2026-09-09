"use client";

import { Download, FileJson2, FileText } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useAppStore } from "@/store/useAppStore";

type AppHeaderProps = {
  onExportJson: () => void;
  onExportMarkdown: () => void;
};

// De ce: păstrăm header-ul minimal pentru orientare și acces mobil la navigație, fără să aglomerăm ecranul principal de conversație.
export function AppHeader({ onExportJson, onExportMarkdown }: AppHeaderProps) {
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

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon-sm" className="ml-auto" aria-label="Export conversație">
            <Download className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Export conversație</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={onExportMarkdown}>
            <FileText className="size-4" />
            Export Markdown (.md)
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onExportJson}>
            <FileJson2 className="size-4" />
            Export JSON (.json)
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
