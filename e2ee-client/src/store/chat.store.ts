import { AxiosError } from "axios";
import { create } from "zustand";
import api from "@/config/axios";
import { GetConversationsResponse } from "@/types/loadConversation.type";
import { ChatMessage } from "@/types/message.type";

const getTimestamp = (createdAt: string): number => {
  const ts = Date.parse(createdAt);
  return Number.isNaN(ts) ? 0 : ts;
};

const sortMessages = (messages: ChatMessage[]): ChatMessage[] =>
  [...messages].sort(
    (a, b) => getTimestamp(a.createdAt) - getTimestamp(b.createdAt)
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

type ChatStore = {
  conversations: GetConversationsResponse;
  activeConversationId: string | null;
  messagesByConversation: Record<string, ChatMessage[]>;
  socketConnected: boolean;
  isSearchOpen: boolean;

  updateMessage: (
    messageId: string,
    updates: Partial<ChatMessage>
  ) => void;

  // actions
  addConversation: (conv: GetConversationsResponse[number]) => void;
  setConversations: (convs: GetConversationsResponse) => void;
  setActiveConversationId: (id: string | null) => void;
  setIsSearchOpen: (open: boolean) => void;
  loadConversations: () => Promise<void>;
  setMessages: (conversationId: string, messages: ChatMessage[]) => void;
  appendMessage: (message: ChatMessage) => void;
  loadMessages: (conversationId: string) => Promise<void>;
  markSocketConnected: (connected: boolean) => void;
};
export const useChatStore = create<ChatStore>((set) => ({
  // state
  conversations: [],
  activeConversationId: null,
  messagesByConversation: {},
  socketConnected: false,
  isSearchOpen: false,

  // actions
  setConversations: (convs) => set({ conversations: convs }),

  setActiveConversationId: (id) => set({ activeConversationId: id }),
  setIsSearchOpen: (open) => set({ isSearchOpen: open }),

  loadConversations: async () => {
    try {
      const { data } = await api.get<GetConversationsResponse>("/api/conversation");
      set({ conversations: data ?? [] });
    } catch (err) {
      const error = err as AxiosError;
      console.error(
        "Failed to fetch conversations:",
        error.response?.data || error.message
      );
    }
  },

  setMessages: (conversationId, messages) =>
    set((state) => ({
      messagesByConversation: {
        ...state.messagesByConversation,
        [conversationId]: upsertMessages(
          state.messagesByConversation[conversationId] || [],
          messages
        ),
      },
    })),

  appendMessage: (message) =>
    set((state) => {
      const existing = state.messagesByConversation[message.conversationId] || [];
      const merged = upsertMessages(existing, [message]);

      return {
        messagesByConversation: {
          ...state.messagesByConversation,
          [message.conversationId]: merged,
        },
      };
    }),

  loadMessages: async (conversationId) => {
    try {
      const { data } = await api.get<ChatMessage[]>("/api/conversation/loadchats", {
        params: { conversationId },
      });

      set((state) => ({
        messagesByConversation: {
          ...state.messagesByConversation,
          [conversationId]: upsertMessages(
            state.messagesByConversation[conversationId] || [],
            data ?? []
          ),
        },
      }));
    } catch (err) {
      const error = err as AxiosError;
      console.error(
        `Failed to fetch messages for conversation ${conversationId}:`,
        error.response?.data || error.message
      );
    }
  },
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

      if (!touched) {
        return state;
      }

      return {
        messagesByConversation: updated,
      };
    }),


  markSocketConnected: (connected) => set({ socketConnected: connected }),

  //adding new conversation after serach returns conversationId

  addConversation: (conv) =>
    set((state) => {
      const exists = state.conversations.find(
        (c) => c.conversationId === conv.conversationId
      );

      if (exists) return state;

      return {
        conversations: [conv, ...state.conversations], // add on top
      };
    }),

}));
