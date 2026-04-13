"use client"

import api from "@/config/axios"
import axios from "axios";
import { useState } from "react"
import { useRouter } from "next/navigation";
import { useChatStore } from "@/store/chat.store";

type ConversationRes = {
  conversationId: string;
  participant: {
    uniqueUserId: string;
    displayName: string;
  }
}
export default function SearchBar() {
  const router = useRouter();
  const setIsSearchOpen = useChatStore((state) => state.setIsSearchOpen);
  const addConversation = useChatStore((state) => state.addConversation)
  const setActiveConversation = useChatStore((state) => state.setActiveConversationId)
  const loadMessages = useChatStore((state) => state.loadMessages)


  const [UserId, setUserId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (loading) return; // prevent double click

    if (!UserId.trim()) {
      setError("userid is required");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const res = await api.post<ConversationRes>(
        "api/conversation/getid",
        { to: UserId.trim() }
      );

      const conversationId = res.data.conversationId;
      const user = res.data.participant;

      if (conversationId) {
        addConversation({
          conversationId: conversationId,
          participant: user
        });
        setActiveConversation(conversationId);
        loadMessages(conversationId);
        router.push(`/chat/${conversationId}`);
        setIsSearchOpen(false);
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || "Request failed");
      } else {
        setError("Something went wrong");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-center items-start pt-10 bg-black/40 backdrop-blur-sm"
      onClick={() => setIsSearchOpen(false)}
    >
      <div
        className="w-full max-w-2xl bg-gray-600 rounded-xl shadow-2xl p-4 mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <form
          className="flex flex-row gap-3 w-full"
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch();
          }}
        >
          <input
            autoFocus
            disabled={loading}
            className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500 text-black disabled:opacity-50"
            type="text"
            placeholder="Search users by userId..."
            value={UserId}
            onChange={(e) => {
              setUserId(e.target.value);
              setError(null);
            }}
          />

          <button
            type="submit"
            disabled={loading}
            className="bg-green-800 hover:bg-green-900 text-white px-6 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading ? "Starting..." : "Start Chat"}
          </button>
        </form>

        {error && (
          <p className="text-white text-sm mt-2">{error}</p>
        )}
      </div>
    </div>
  )
}
