"use client";

import { useMemo, useState } from "react";
import { ChevronUp, MoreHorizontal, Plus } from "lucide-react";
import { toast } from "sonner";

import { SettingsDialog } from "@/components/settings/settings-dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/useAppStore";

// De ce: sidebar-ul concentrează navigația persistentă a conversațiilor ca zona centrală să rămână dedicată strict dialogului cu agentul.
export function AppSidebar() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const profile = useAppStore(state => state.profile);
  const conversations = useAppStore(state => state.conversations);
  const activeConversationId = useAppStore(state => state.activeConversationId);
  const setActiveConversation = useAppStore(state => state.setActiveConversation);
  const startNewConversation = useAppStore(state => state.startNewConversation);
  const renameConversation = useAppStore(state => state.renameConversation);
  const deleteConversation = useAppStore(state => state.deleteConversation);

  const sortedConversations = useMemo(
    () => [...conversations].sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt)),
    [conversations]
  );

  return (
    <>
      <Sidebar collapsible="offcanvas">
        <SidebarHeader className="gap-3 p-3">
          <Button className="w-full justify-start gap-2" onClick={startNewConversation}>
            <Plus className="size-4" />+ New
          </Button>
        </SidebarHeader>

        <SidebarSeparator />

        <SidebarContent>
          <div className="px-3 pt-3">
            <p className="text-xs font-medium tracking-[0.14em] text-sidebar-foreground/65 uppercase">
              Chats and tasks
            </p>
          </div>

          <ScrollArea className="h-[calc(100svh-180px)] px-2 py-2">
            <SidebarMenu>
              {sortedConversations.map(conversation => {
                const isActive = conversation.id === activeConversationId;

                return (
                  <SidebarMenuItem key={conversation.id} className="group/item">
                    <SidebarMenuButton
                      isActive={isActive}
                      onClick={() => setActiveConversation(conversation.id)}
                      className={cn("justify-start pr-8", isActive ? "font-medium" : "")}
                    >
                      <span className="truncate">{conversation.title}</span>
                    </SidebarMenuButton>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          className="absolute top-1.5 right-1.5 opacity-0 group-hover/item:opacity-100"
                        >
                          <MoreHorizontal className="size-3.5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuItem
                          onClick={() => {
                            const nextTitle = window.prompt("Redenumește conversația", conversation.title)?.trim();
                            if (nextTitle) {
                              renameConversation(conversation.id, nextTitle);
                              toast.success("Conversație redenumită.");
                            }
                          }}
                        >
                          Redenumește
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          variant="destructive"
                          onClick={() => {
                            deleteConversation(conversation.id);
                            toast.success("Conversație ștearsă.");
                          }}
                        >
                          Șterge
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </ScrollArea>
        </SidebarContent>

        <SidebarFooter className="border-t p-3">
          <button
            type="button"
            className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left hover:bg-sidebar-accent"
            onClick={() => setIsSettingsOpen(true)}
          >
            <Avatar size="sm">
              <AvatarFallback>{profile.name.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <span className="truncate text-sm font-medium">{profile.name}</span>
            <ChevronUp className="ml-auto size-4 text-sidebar-foreground/70" />
          </button>
        </SidebarFooter>
      </Sidebar>

      <SettingsDialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen} />
    </>
  );
}
