"use client";

import { useEffect } from "react";
import { getSocket } from "@/lib/socket/socket";
import { useChatStore } from "@/store/chat.store";
import { useAuthStore } from "@/store/auth.store";
import { ensureSession } from "@/lib/libsodium/services/ensureSession";
import { decryptMessage } from "@/lib/libsodium/decrypt";
import { ChatMessage } from "@/types/message.type";


type IncomingEncryptedMessage = {
  id: string;
  conversationId: string;
  senderId: string;
  ciphertext: string;
  nonce: string;
  createdAt: string;
  clientTempId?: string;
  status?:
  | "sending"
  | "sent"
  | "delivered"
  | "read"
  | "failed";
};


export const useSocketConnection = () => {

  const appendMessage = useChatStore((s) => s.appendMessage);
  const updateMessage = useChatStore((s) => s.updateMessage);
  const markSocketConnected = useChatStore((s) => s.markSocketConnected);
  const conversations = useChatStore((s) => s.conversations)


  const currentUserId = useAuthStore.getState().uniqueUserId;

  useEffect(() => {

    let isMounted = true;
    const socket = getSocket();

    socket.on("connect", () => {
      console.log(
        "Socket connected:",
        socket.id
      );

      if (isMounted) {
        markSocketConnected(true);
      }
    });


    socket.on("disconnect", () => {
      console.log("Socket disconnected");

      if (isMounted) {
        markSocketConnected(false);
      }
    });

    socket.on(
      "receive_message",
      async (message: IncomingEncryptedMessage) => {

        if (!currentUserId) return;

        const activeConversation = conversations.find((c) => c.conversationId === message.conversationId);

        const otherPeerUserId = activeConversation?.participant.uniqueUserId;

        if (!otherPeerUserId) {
          console.error(
            "peer user id missing"
          );
          return;
        }
        const peerUserId = message.senderId === currentUserId ? otherPeerUserId : message.senderId;

        console.log("currentUserId", currentUserId)
        console.log("otherPeerUserId", otherPeerUserId)
        console.log("peerUserId", peerUserId)
        console.log("senderId", message.senderId)


        try {
          const sessionKey = await ensureSession(
            message.conversationId,
            peerUserId
          );

          const plaintext = await decryptMessage(
            message.ciphertext,
            message.nonce,
            sessionKey
          );

          console.log("decryptMessage", plaintext)


          const normalizedMessage: ChatMessage = {
            id: message.id,
            conversationId: message.conversationId,
            senderId: message.senderId,
            content: plaintext,
            nonce: message.nonce,
            createdAt: message.createdAt,
            clientTempId: message.clientTempId,
            status: message.status ?? "sent",
          };

          console.log("normalizedMessage:", normalizedMessage)

          if (normalizedMessage.clientTempId) {

            updateMessage(
              normalizedMessage.clientTempId,
              normalizedMessage
            );

          } else {
            appendMessage(normalizedMessage);
          }

        } catch (err) {

          console.error(
            "failed to decrypt incoming message",
            err
          );
        }
      }
    );




    socket.on(
      "connect_error",
      (err) => {

        console.error(
          "Socket error:",
          err.message
        );

        if (err.message === "Unauthorized") {
          if (isMounted) {
            markSocketConnected(false);
          }
          useAuthStore.getState().clearAuth();
        }
      }
    );

    return () => {
      isMounted = false;
      socket.off("connect");
      socket.off("disconnect");
      socket.off("receive_message");
      socket.off("connect_error");
    };

  },
    [
      currentUserId,
      conversations,
      appendMessage,
      updateMessage,
      markSocketConnected,
    ]);
};
