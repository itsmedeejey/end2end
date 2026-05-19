import { AxiosError } from "axios";
import { create } from "zustand";
import api from "@/config/axios";
import {
  getCachedConversations,
  saveConversations,
  updateConversationCache,
} from "@/lib/idb/chat-db";
import {
  ConversationConnection,
  GetConversationsResponse,
} from "@/types/loadConversation.type";
import { ChatMessage } from "@/types/message.type";

const getTimestamp = (createdAt: string | null): number => {
  if (!createdAt) return 0;
  const ts = Date.parse(createdAt);
  return Number.isNaN(ts) ? 0 : ts;
};

const sortMessages = (messages: ChatMessage[]): ChatMessage[] =>
  [...messages].sort((a, b) => {
    if (a.id !== b.id) return a.id.localeCompare(b.id);
    return getTimestamp(a.createdAt) - getTimestamp(b.createdAt);
  });

const sortConversations = (
  conversations: ConversationConnection[]
): ConversationConnection[] =>
  [...conversations].sort(
    (a, b) => getTimestamp(b.updatedAt) - getTimestamp(a.updatedAt)
  );

const isSameMessage = (left: ChatMessage, right: ChatMessage): boolean => {
  if (left.id === right.id) return true;
  if (!left.clientTempId || !right.clientTempId) return false;
  return (
    left.clientTempId === right.clientTempId &&
    left.senderId === right.senderId
  );
};

const upsertMessages = (
  existing: ChatMessage[],
  incoming: ChatMessage[]
): ChatMessage[] => {
  const next = [...existing];

  for (const message of incoming) {
    const index = next.findIndex((item) => isSameMessage(item, message));

    if (index === -1) {
      next.push(message);
      continue;
    }

    next[index] = { ...next[index], ...message };
  }

  return sortMessages(next);
};

const upsertConversations = (
  existing: ConversationConnection[],
  incoming: ConversationConnection[]
): ConversationConnection[] => {
  const byId = new Map<string, ConversationConnection>();

  for (const conversation of existing) {
    byId.set(conversation.conversationId, conversation);
  }

  for (const conversation of incoming) {
    const previous = byId.get(conversation.conversationId);
    byId.set(conversation.conversationId, {
      ...previous,
      ...conversation,
      lastMessageText:
        conversation.lastMessageText ?? previous?.lastMessageText ?? null,
    });
  }

  return sortConversations([...byId.values()]);
};

const buildConversation = (
  conversation: Partial<ConversationConnection> & {
    conversationId: string;
    participant: ConversationConnection["participant"];
  }
): ConversationConnection => {
  const now = new Date().toISOString();

  return {
    id: conversation.id ?? conversation.conversationId,
    conversationId: conversation.conversationId,
    title: conversation.title ?? conversation.participant.displayName,
    lastMessageId: conversation.lastMessageId ?? null,
    lastMessageText: conversation.lastMessageText ?? null,
    lastMessageAt: conversation.lastMessageAt ?? null,
    lastMessageSenderId: conversation.lastMessageSenderId ?? null,
    unreadCount: conversation.unreadCount ?? 0,
    updatedAt: conversation.updatedAt ?? now,
    participant: conversation.participant,
  };
};

type ChatStore = {
  conversations: GetConversationsResponse;
  activeConversationId: string | null;
  messagesByConversation: Record<string, ChatMessage[]>;
  oldestLoadedMessageId: Record<string, string | null>;
  loadingOlder: Record<string, boolean>;
  hasMore: Record<string, boolean>;
  socketConnected: boolean;
  isSearchOpen: boolean;
  isProfileOpen: boolean;

  addConversation: (
    conv: Partial<ConversationConnection> & {
      conversationId: string;
      participant: ConversationConnection["participant"];
    }
  ) => void;
  setConversations: (convs: GetConversationsResponse) => void;
  setActiveConversationId: (id: string | null) => void;
  setIsSearchOpen: (open: boolean) => void;
  setIsProfileOpen: (open: boolean) => void;
  loadConversations: () => Promise<void>;
  setMessages: (conversationId: string, messages: ChatMessage[]) => void;
  appendMessage: (message: ChatMessage) => void;
  appendMessages: (conversationId: string, messages: ChatMessage[]) => void;
  updateMessage: (
    messageId: string,
    updates: Partial<ChatMessage>
  ) => void;
  setPaginationState: (
    conversationId: string,
    state: Partial<{
      oldestLoadedMessageId: string | null;
      loadingOlder: boolean;
      hasMore: boolean;
    }>
  ) => void;
  updateConversationFromMessage: (
    message: ChatMessage,
    currentUserId: string | null,
    isActive: boolean
  ) => void;
  markConversationRead: (conversationId: string) => void;
  markSocketConnected: (connected: boolean) => void;
};

export const useChatStore = create<ChatStore>((set, get) => ({
  conversations: [],
  activeConversationId: null,
  messagesByConversation: {},
  oldestLoadedMessageId: {},
  loadingOlder: {},
  hasMore: {},
  socketConnected: false,
  isSearchOpen: false,
  isProfileOpen: false,

  setConversations: (convs) => {
    const normalized = convs.map(buildConversation);
    set({ conversations: sortConversations(normalized) });
    void saveConversations(normalized);
  },

  setActiveConversationId: (id) => {
    set({ activeConversationId: id });
    if (id) {
      get().markConversationRead(id);
    }
  },

  setIsSearchOpen: (open) => set({ isSearchOpen: open }),

  loadConversations: async () => {
    const cached = await getCachedConversations();
    if (cached.length > 0) {
      set({ conversations: cached });
    }

    try {
      const { data } = await api.get<GetConversationsResponse>(
        "/api/conversation"
      );
      const merged = upsertConversations(
        get().conversations,
        (data ?? []).map(buildConversation)
      );

      set({ conversations: merged });
      await saveConversations(merged);
    } catch (err) {
      const error = err as AxiosError;
      console.error(
        "Failed to fetch conversations:",
        error.response?.data || error.message
      );
    }
  },

  setMessages: (conversationId, messages) =>
    set((state) => {
      const merged = upsertMessages(
        state.messagesByConversation[conversationId] || [],
        messages
      );

      return {
        messagesByConversation: {
          ...state.messagesByConversation,
          [conversationId]: merged,
        },
        oldestLoadedMessageId: {
          ...state.oldestLoadedMessageId,
          [conversationId]:
            merged[0]?.id ?? state.oldestLoadedMessageId[conversationId] ?? null,
        },
      };
    }),

  appendMessage: (message) =>
    set((state) => {
      const existing = state.messagesByConversation[message.conversationId] || [];
      const merged = upsertMessages(existing, [message]);

      return {
        messagesByConversation: {
          ...state.messagesByConversation,
          [message.conversationId]: merged,
        },
        oldestLoadedMessageId: {
          ...state.oldestLoadedMessageId,
          [message.conversationId]:
            merged[0]?.id ?? state.oldestLoadedMessageId[message.conversationId] ?? null,
        },
      };
    }),

  appendMessages: (conversationId, messages) =>
    set((state) => {
      const merged = upsertMessages(
        state.messagesByConversation[conversationId] || [],
        messages
      );

      return {
        messagesByConversation: {
          ...state.messagesByConversation,
          [conversationId]: merged,
        },
        oldestLoadedMessageId: {
          ...state.oldestLoadedMessageId,
          [conversationId]:
            merged[0]?.id ?? state.oldestLoadedMessageId[conversationId] ?? null,
        },
      };
    }),

  updateMessage: (messageId, updates) =>
    set((state) => {
      const updated: Record<string, ChatMessage[]> = {};
      let touched = false;

      for (const [convId, messages] of Object.entries(
        state.messagesByConversation
      )) {
        const mapped = messages.map((msg) => {
          if (msg.id === messageId || msg.clientTempId === messageId) {
            touched = true;
            return { ...msg, ...updates };
          }

          return msg;
        });

        updated[convId] = upsertMessages([], mapped);
      }

      if (!touched) return state;

      return {
        messagesByConversation: updated,
      };
    }),

  setPaginationState: (conversationId, nextState) =>
    set((state) => ({
      oldestLoadedMessageId: {
        ...state.oldestLoadedMessageId,
        ...(Object.hasOwn(nextState, "oldestLoadedMessageId")
          ? { [conversationId]: nextState.oldestLoadedMessageId ?? null }
          : {}),
      },
      loadingOlder: {
        ...state.loadingOlder,
        ...(Object.hasOwn(nextState, "loadingOlder")
          ? { [conversationId]: nextState.loadingOlder ?? false }
          : {}),
      },
      hasMore: {
        ...state.hasMore,
        ...(Object.hasOwn(nextState, "hasMore")
          ? { [conversationId]: nextState.hasMore ?? false }
          : {}),
      },
    })),

  updateConversationFromMessage: (message, currentUserId, isActive) =>
    set((state) => {
      const updatedAt = message.createdAt;
      const conversations = state.conversations.map((conversation) => {
        if (conversation.conversationId !== message.conversationId) {
          return conversation;
        }

        const isIncoming = Boolean(currentUserId) && message.senderId !== currentUserId;

        return {
          ...conversation,
          lastMessageId: message.id,
          lastMessageText: message.content,
          lastMessageAt: message.createdAt,
          lastMessageSenderId: message.senderId,
          updatedAt,
          unreadCount:
            isIncoming && !isActive
              ? conversation.unreadCount + 1
              : isActive
                ? 0
                : conversation.unreadCount,
        };
      });

      const sorted = sortConversations(conversations);
      const changed = sorted.find(
        (conversation) => conversation.conversationId === message.conversationId
      );

      if (changed) {
        void updateConversationCache(changed);
      }

      return { conversations: sorted };
    }),

  markConversationRead: (conversationId) =>
    set((state) => {
      const conversations = state.conversations.map((conversation) =>
        conversation.conversationId === conversationId
          ? { ...conversation, unreadCount: 0 }
          : conversation
      );

      const changed = conversations.find(
        (conversation) => conversation.conversationId === conversationId
      );

      if (changed) {
        void updateConversationCache(changed);
      }

      return { conversations };
    }),

  markSocketConnected: (connected) => set({ socketConnected: connected }),

  addConversation: (conv) =>
    set((state) => {
      const normalized = buildConversation(conv);
      const conversations = upsertConversations(state.conversations, [
        normalized,
      ]);

      void saveConversations(conversations);

      return { conversations };
    }),
}));

