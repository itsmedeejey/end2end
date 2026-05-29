"use client";

import { useCallback, useEffect, useRef } from "react";
import api from '@/config/axios';

import {
  getLatestMessages,
  getLatestSyncedMessage,
  getOlderLocalMessages,
  saveMessages,
} from "@/lib/idb/chat-db";

import {
  decryptIncomingMessages,
  IncomingEncryptedMessage,
  PaginatedMessagesResponse,
} from "@/lib/chat/messages";

import { useChatStore } from "@/store/chat.store";

const PAGE_SIZE = 30;

export default function useConversationMsg(conversationId: string) {
  const appendMessages = useChatStore((s) => s.appendMessages);

  const conversations = useChatStore((s) => s.conversations);

  const hasMore = useChatStore(
    (s) => s.hasMore[conversationId] ?? true
  );

  const loadingOlder = useChatStore((s) => s.loadingOlder[conversationId] ?? false);

  const oldestLoadedMessageId = useChatStore(
    (s) => s.oldestLoadedMessageId[conversationId] ?? null
  );

  const setMessages = useChatStore((s) => s.setMessages);

  const setPaginationState = useChatStore(
    (s) => s.setPaginationState
  );

  const loadingOlderRef = useRef(false);

  const activeConversation = conversations.find(
    (conversation) =>
      conversation.conversationId === conversationId
  );

  const peerUserId =
    activeConversation?.participant.uniqueUserId;

  useEffect(() => {
    let cancelled = false;

    async function loadInitialConversation() {
      if (!conversationId || !peerUserId) return;

      try {
        // LOAD LOCAL CACHE FIRST
        const localMessages = await getLatestMessages(
          conversationId,
          PAGE_SIZE
        );

        if (cancelled) return;

        if (localMessages.length > 0) {
          setMessages(conversationId, localMessages);

          setPaginationState(conversationId, {
            oldestLoadedMessageId:
              localMessages[0]?.id ?? null,

            hasMore:
              localMessages.length >= PAGE_SIZE,
          });
        }

        // SYNC NEWER MESSAGES
        const latest = await getLatestSyncedMessage(conversationId);

        if (latest) {
          const { data } =
            await api.get<IncomingEncryptedMessage[]>(
              `/api/messages/${conversationId}/sync`,
              {
                params: {
                  after: latest.id,
                },
              }
            );

          if (cancelled) return;

          const decryptedMessages = await decryptIncomingMessages(
            data,
            peerUserId
          );

          if (decryptedMessages.length > 0) {
            await saveMessages(decryptedMessages);

            appendMessages(
              conversationId,
              decryptedMessages
            );
          }

          return;
        }

        // INITIAL SERVER PAGE
        const { data } = await api.get<PaginatedMessagesResponse>(
          `/api/messages/${conversationId}`,
          {
            params: {
              limit: PAGE_SIZE,
            },
          }
        );

        if (cancelled) return;

        const decryptedMessages =
          await decryptIncomingMessages(
            data.messages,
            peerUserId
          );

        if (decryptedMessages.length > 0) {
          await saveMessages(decryptedMessages);

          setMessages(
            conversationId,
            decryptedMessages
          );
        }

        setPaginationState(conversationId, {
          oldestLoadedMessageId:
            data.nextCursor,

          hasMore: data.hasMore,
        });
      } catch (err) {
        console.error(
          "failed loading conversation messages",
          err
        );
      }
    }

    void loadInitialConversation();

    return () => {
      cancelled = true;
    };
  }, [
    appendMessages,
    conversationId,
    peerUserId,
    setMessages,
    setPaginationState,
  ]);

  const loadOlderMessages = useCallback(async () => {
    if (
      !conversationId ||
      !peerUserId ||
      loadingOlderRef.current ||
      loadingOlder ||
      !hasMore
    ) {
      return;
    }

    const beforeId = oldestLoadedMessageId;

    if (!beforeId) {
      setPaginationState(conversationId, {
        hasMore: false,
      });

      return;
    }

    loadingOlderRef.current = true;

    setPaginationState(conversationId, {
      loadingOlder: true,
    });

    try {
      // TRY LOCAL OLDER MESSAGES
      const localMessages = await getOlderLocalMessages(
        conversationId,
        beforeId,
        PAGE_SIZE
      );

      if (localMessages.length > 0) {
        appendMessages(
          conversationId,
          localMessages
        );

        setPaginationState(conversationId, {
          oldestLoadedMessageId:
            localMessages[0]?.id ?? beforeId,
        });

        return;
      }

      // FETCH OLDER FROM SERVER
      const { data } = await api.get<PaginatedMessagesResponse>(
        `/api/messages/${conversationId}`,
        {
          params: {
            before: beforeId,
            limit: PAGE_SIZE,
          },
        }
      );

      // STOP PAGINATION SAFELY
      if (
        data.messages.length === 0 ||
        data.nextCursor === beforeId
      ) {
        setPaginationState(conversationId, {
          hasMore: false,
          oldestLoadedMessageId: null,
        });

        return;
      }

      const decryptedMessages = await decryptIncomingMessages(
        data.messages,
        peerUserId
      );

      if (decryptedMessages.length > 0) {
        await saveMessages(decryptedMessages);

        appendMessages(
          conversationId,
          decryptedMessages
        );
      }

      setPaginationState(conversationId, {
        oldestLoadedMessageId:
          data.nextCursor,

        hasMore: data.hasMore,
      });
    } catch (err) {
      console.error(
        "failed loading older messages",
        err
      );
    } finally {
      loadingOlderRef.current = false;

      setPaginationState(conversationId, {
        loadingOlder: false,
      });
    }
  }, [
    appendMessages,
    conversationId,
    hasMore,
    loadingOlder,
    oldestLoadedMessageId,
    peerUserId,
    setPaginationState,
  ]);

  return {
    hasMore,
    loadingOlder,
    loadOlderMessages,
  };
}
