import { create } from "zustand";

export type IncomingMessage = {
  id: string;
  conversationId: string;
  senderId: string;
  ciphertext: string;   // base64
  messageType: number;  // 1 | 3
  createdAt: string;
  clientTempId?: string;
  status?: string;
};

type State = {
  queue: IncomingMessage[];
  enqueue: (msg: IncomingMessage) => void;
  dequeue: (id: string) => void;
  clear: () => void;
};

export const useIncomingStore = create<State>((set) => ({
  queue: [],
  enqueue: (msg) =>
    set((s) => {
      // avoid duplicates (server retries / reconnect)
      if (s.queue.some((m) => m.id === msg.id)) return s;
      return { queue: [...s.queue, msg] };
    }),
  dequeue: (id) =>
    set((s) => ({ queue: s.queue.filter((m) => m.id !== id) })),
  clear: () => set({ queue: [] }), //clears the whole queue
}));
