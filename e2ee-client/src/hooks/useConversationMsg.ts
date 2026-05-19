"use client";

import { useEffect } from "react";
import { getLatestMessage, saveMessages, getConversationMessages } from "@/lib/idb/chat-db";
import { useChatStore } from "@/store/chat.store";
import api from "@/config/axios";
import { decryptMessage } from "@/lib/libsodium/decrypt";
import { ensureSession } from "@/lib/libsodium/services/ensureSession";
import { ChatMessage } from "@/types/message.type";

type IncomingEncryptedMessage = {
  id: string;
  conversationId: string;
  senderId: string;
  ciphertext: string;
  nonce: string;
  createdAt: string;
  clientTempId?: string;
  status?: string;
};

export default function useConversationMsg(conversationId: string) {
  const setMessages = useChatStore((s) => s.setMessages);
  const appendMessages = useChatStore((s) => s.appendMessages)
  const conversations = useChatStore((s) => s.conversations)

  useEffect(() => {
    async function loadConversation() {

      try {
        if (!conversationId) return;
        const localMsg = await getConversationMessages(conversationId);
        setMessages(conversationId, localMsg);


        const latest = await getLatestMessage(conversationId);
        const { data } = await api.get<IncomingEncryptedMessage[]>(`api/conversation/sync`, {
          params: {
            conversationId,
            after: latest?.id,
          },
        });

        const activeConversation = conversations.find((c) => c.conversationId === conversationId)

        const peerUserId = activeConversation?.participant.uniqueUserId;

        if (!peerUserId) {
          console.warn(
            "peer user id missing"
          );
          return;
        }

        const sessionKey = await ensureSession(
          conversationId,
          peerUserId
        );

        const decryptedMessages: ChatMessage[] = await Promise.all(

          data.map(async (message) => {
            const plaintext = await decryptMessage(
              message.ciphertext,
              message.nonce,
              sessionKey
            );
            return {
              id: message.id,
              conversationId: message.conversationId,
              senderId: message.senderId,
              content: plaintext,
              nonce: message.nonce,
              createdAt: message.createdAt,
              clientTempId: message.clientTempId,
              status: message.status?.toLowerCase() as ChatMessage["status"],
            };
          })
        );

        if (decryptedMessages.length > 0) {
          await saveMessages(decryptedMessages);

          appendMessages(conversationId, decryptedMessages);
        }

      } catch (err) {
        console.error(err, "failed getting new msgs")
      }

    }

    loadConversation();
  }, [conversationId, setMessages, appendMessages, conversations]);
}






