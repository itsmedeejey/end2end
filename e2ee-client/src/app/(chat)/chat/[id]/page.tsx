"use client"

import ChatInputBox from "@/components/chatInputBox";
import ChatTopBar from "@/components/chatTopBar";
import { useParams } from "next/navigation";
import { useChatStore } from "@/store/chat.store";
import { useAuthStore } from "@/store/auth.store";
import ChatUi from "@/components/chatUi";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { useChatSocket } from "@/hooks/useChatSocket";
import useConversationMsg from "@/hooks/useConversationMsg";
import { getSocket } from "@/lib/socket/socket";
import ContactProfileCard from "@/components/contactProfileCard";


export default function Chat() {
    const params = useParams<{ id: string }>();
    const conversationId = params.id;

    const setIsProfileOpen = useChatStore((s) => s.setIsProfileOpen)
    const isProfileOpen = useChatStore((s) => s.isProfileOpen)

    const conversations = useChatStore((s) => s.conversations);
    const messagesByConversation = useChatStore((s) => s.messagesByConversation);
    const setActiveConversationId = useChatStore((s) => s.setActiveConversationId);
    const currentUserId = useAuthStore((s) => s.uniqueUserId);

    const { joinConversation, leaveConversation } = useChatSocket();

    const scrollRef = useRef<HTMLDivElement>(null);
    const bottomRef = useRef<HTMLDivElement>(null);
    const wasNearBottomRef = useRef(true);
    const previousConversationIdRef = useRef<string | null>(null);
    const previousMessageCountRef = useRef(0);

    const { loadOlderMessages, loadingOlder } = useConversationMsg(conversationId)

    //when a new conversatioin is added this connects the user to the that converstion room
    useEffect(() => {
        if (!conversationId) return;

        joinConversation(conversationId);

        return () => {
            leaveConversation(conversationId);
        };
    }, [conversationId, joinConversation, leaveConversation]);

    useEffect(() => {
        if (!conversationId) return;

        setActiveConversationId(conversationId);
        getSocket().emit("conversation:read", { conversationId });

        return () => setActiveConversationId(null);
    }, [conversationId, setActiveConversationId]);

    const activeConversation = conversations.find(
        (c) => c.conversationId === conversationId
    );


    const messages = useMemo(
        () => (conversationId ? messagesByConversation[conversationId] || [] : []),
        [conversationId, messagesByConversation]
    );


    const handleLoadOlder = useCallback(async () => {
        const el = scrollRef.current;
        if (!el || loadingOlder) return;

        const previousScrollHeight = el.scrollHeight;

        await loadOlderMessages();

        requestAnimationFrame(() => {
            const current = scrollRef.current;
            if (!current) return;
            current.scrollTop = current.scrollHeight - previousScrollHeight;
        });
    }, [loadOlderMessages, loadingOlder]);

    // Track bottom proximity and trigger upward infinite scroll.
    useEffect(() => {
        const el = scrollRef.current;
        if (!el) return;

        const handleScroll = () => {
            wasNearBottomRef.current =
                el.scrollHeight - el.scrollTop - el.clientHeight < 120;

            if (el.scrollTop < 100) {
                void handleLoadOlder();
            }
        };

        handleScroll();
        el.addEventListener("scroll", handleScroll);
        return () => el.removeEventListener("scroll", handleScroll);
    }, [handleLoadOlder]);


    // Auto-scroll on initial load / conversation switch / incoming new messages.
    useEffect(() => {
        const hasConversationChanged = previousConversationIdRef.current !== conversationId;
        const hasNewMessage = messages.length > previousMessageCountRef.current;

        if (hasConversationChanged) {
            previousConversationIdRef.current = conversationId;
            previousMessageCountRef.current = messages.length;
            requestAnimationFrame(() => {
                bottomRef.current?.scrollIntoView({ behavior: "auto" });
            });
            return;
        }

        if (hasNewMessage && wasNearBottomRef.current) {
            requestAnimationFrame(() => {
                bottomRef.current?.scrollIntoView({ behavior: "smooth" });
            });
        }

        previousMessageCountRef.current = messages.length;
    }, [conversationId, messages.length]);


    if (!conversationId) return null;

    return (
        <div className="flex h-full flex-col">

            <div onClick={() => setIsProfileOpen(true)}>
                <ChatTopBar
                    displayName={activeConversation?.participant.displayName ?? ""}
                />
            </div>

            {isProfileOpen &&
                (
                    <div className="p-5">
                        <ContactProfileCard
                            name={activeConversation?.participant.displayName} uniqueUserId={activeConversation?.participant.uniqueUserId}></ContactProfileCard>
                    </div>
                )
            }


            <div ref={scrollRef} className="flex-1 overflow-y-scroll">
                {loadingOlder && (
                    <div className="py-2 text-center text-xs text-gray-400">
                        Loading older messages...
                    </div>
                )}

                {messages.map((message) => {
                    const isSent = currentUserId
                        ? message.senderId === currentUserId
                        : false;

                    return (
                        <ChatUi
                            key={message.id}
                            content={message.content}
                            type={isSent ? "sent" : "received"}
                        />
                    );
                })}

                <div ref={bottomRef} />
            </div>

            <div className="p-2">
                <ChatInputBox />
            </div>
        </div>
    );
}
