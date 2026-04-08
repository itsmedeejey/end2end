"use client"

import ChatInputBox from "@/components/chatInputBox";
import ChatTopBar from "@/components/chatTopBar";
import { useParams } from "next/navigation";
import { useChatStore } from "@/store/chat.store";
import { useAuthStore } from "@/store/auth.store";
import ChatUi from "@/components/chatUi";
import { useEffect, useRef } from "react";


export default function Chat() {
  const params = useParams<{ id: string }>();
  const conversationId = params.id;

  const conversations = useChatStore((s) => s.conversations);
  const messagesByConversation = useChatStore((s) => s.messagesByConversation);
  const loadMessages = useChatStore((s) => s.loadMessages);
  const setActiveConversationId = useChatStore((s) => s.setActiveConversationId);
  const currentUserId = useAuthStore((s) => s.userId);

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!conversationId) return;

    setActiveConversationId(conversationId);
    loadMessages(conversationId);
  }, [conversationId]);

  const activeConversation = conversations.find(
    (c) => c.conversationId === conversationId
  );

  const messages =
    conversationId ? messagesByConversation[conversationId] || [] : [];

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const isNearBottom =
      el.scrollHeight - el.scrollTop - el.clientHeight < 100;

    if (isNearBottom) {
      el.scrollTop = el.scrollHeight;
    }
  }, [messages.length]);

  if (!conversationId) return null;

  return (
    <div className="flex h-full flex-col">
      <ChatTopBar
        displayName={activeConversation?.participant.displayName ?? ""}
      />

      <div ref={scrollRef} className="flex-1 overflow-y-scroll">
        {messages.map((message) => {
          const isSent = currentUserId
            ? message.senderId === currentUserId
            : false;

          return (
            <ChatUi
              key={message.id}
              content={message.ciphertext}
              type={isSent ? "sent" : "received"}
            />
          );
        })}
      </div>

      <div className="p-2">
        <ChatInputBox />
      </div>
    </div>
  );
}
