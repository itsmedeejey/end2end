import { AxiosError } from "axios";
import { create } from "zustand";
import api from "@/config/axios";
import { GetConversationsResponse } from "@/types/loadConversation.type";
import { ChatMessage } from "@/types/message.type";

type ChatStore = {
  conversations: GetConversationsResponse;
  activeConversationId: string | null;
  messagesByConversation: Record<string, ChatMessage[]>;
  socketConnected: boolean;

  // actions
  setConversations: (convs: GetConversationsResponse) => void;
  setActiveConversationId: (id: string | null) => void;
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

  // actions
  setConversations: (convs) => set({ conversations: convs }),

  setActiveConversationId: (id) => set({ activeConversationId: id }),

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
        [conversationId]: messages,
      },
    })),

  appendMessage: (message) =>
    set((state) => {
      const existing = state.messagesByConversation[message.conversationId] || [];
      const alreadyExists = existing.some((item) => item.id === message.id);

      if (alreadyExists) return state;

      return {
        messagesByConversation: {
          ...state.messagesByConversation,
          [message.conversationId]: [...existing, message],
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
          [conversationId]: data ?? [],
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

  markSocketConnected: (connected) => set({ socketConnected: connected }),
}));
