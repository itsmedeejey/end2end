"use client";

import { useState } from "react";
import { useAuthStore } from "@/store/auth.store";
import { Copy, Check } from "lucide-react";

export default function ProfileCard() {
  const name = useAuthStore((s) => s.name);
  const uniqueUserId = useAuthStore((s) => s.uniqueUserId);

  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    if (!uniqueUserId) return;

    try {
      await navigator.clipboard.writeText(uniqueUserId);

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error("Failed to copy user id", error);
    }
  }

  return (
    <div className=" w-full  h-full  rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl shadow-2xl">
      <div className="flex flex-col items-center text-center gap-5">
        {/* Avatar */}
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-linear-to-br from-emerald-200 to-green-600 text-2xl font-bold text-white shadow-lg">
          {name?.charAt(0).toUpperCase()}
        </div>

        {/* User Info */}

        <h2 className="text-2xl font-semibold text-white">
          {name || "Unknown User"}
        </h2>


        {/* User ID */}
        <div className="w-full rounded-2xl border border-white/10 bg-black/30 p-4">
          <div className="mb-2 text-xs uppercase tracking-widest text-zinc-500">
            User ID
          </div>

          <div className="flex items-center justify-between gap-3">
            <p className="truncate text-sm text-zinc-200">
              {uniqueUserId}
            </p>

            <button
              onClick={handleCopy}
              className="flex items-center gap-2 rounded-xl border cursor-pointer border-white/10 bg-white/10 px-3 py-2 text-sm text-white transition hover:bg-white/20 active:scale-95"
            >
              {copied ? (
                <>
                  <Check size={16} />
                  Copied
                </>
              ) : (
                <>
                  <Copy size={16} />
                  Copy
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
