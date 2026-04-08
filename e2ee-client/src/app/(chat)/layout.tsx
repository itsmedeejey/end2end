"use client"

import { useEffect } from "react";
import ContactsBar from "@/components/contactsBar";
import { useChatStore } from "@/store/chat.store";
import { SocketProvider } from "@/provider/socketProvider";
import { useAuthStore } from "@/store/auth.store";
import api from "@/config/axios";

export default function ChatLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const loadConversations = useChatStore((state) => state.loadConversations);
  const setUserId = useAuthStore((state) => state.setUserId);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  useEffect(() => {
    const loadCurrentUser = async () => {
      try {
        const { data } = await api.get<{ user?: { sub?: string } }>("/api/auth/me");
        const sub = data?.user?.sub;

        if (sub) {
          setUserId(sub);
        }
      } catch (err) {
        console.error("Failed to load auth profile:", err);
      }
    };

    loadCurrentUser();
  }, [setUserId]);

  return (
    <SocketProvider>
      <div className="flex h-screen w-screen overflow-hidden bg-gray-900">
        <div className="flex bg-gray-800 w-2/5  lg:w-1/5">
          <ContactsBar />
        </div>

        <div className="flex w-3/5 lg:w-4/5 flex-col">
          {children}
        </div>
      </div>

    </SocketProvider>
  );
}
