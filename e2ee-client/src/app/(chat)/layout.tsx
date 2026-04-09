"use client"

import { useEffect } from "react";
import ContactsBar from "@/components/contactsBar";
import { useChatStore } from "@/store/chat.store";
import { useAuthStore } from "@/store/auth.store";
import { useInitAuth } from "@/hooks/useInitAuth";
import { useSocketInit } from "@/hooks/useSocketInit";
import { useSocketConnection } from "@/hooks/useSocketConnection";

export default function ChatLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  useInitAuth();
  useSocketInit();
  useSocketConnection();

  const status = useAuthStore((state) => state.status);
  const loadConversations = useChatStore((state) => state.loadConversations);

  useEffect(() => {
    if (status === "authenticated") {
      loadConversations();
    }
  }, [status, loadConversations]);

  const content =
    status === "loading" ? (
      <div className="flex h-screen w-screen items-center justify-center bg-gray-900 text-white">
        Authenticating...
      </div>
    ) : status !== "authenticated" ? (
      <div className="flex h-screen w-screen items-center justify-center bg-gray-900 text-gray-300">
        Redirecting to login...
      </div>
    ) : (
      <div className="flex h-screen w-screen overflow-hidden bg-gray-900">
        <div className="flex bg-gray-800 w-2/5 lg:w-1/5">
          <ContactsBar />
        </div>

        <div className="flex w-3/5 lg:w-4/5 flex-col">{children}</div>
      </div>
    );

  return content;
}
