"use client";

import { useState } from "react";
import { Copy, Check, ShieldAlert } from "lucide-react";

type RecoveryKeyModalProps = {
  recoveryKey: string;
  onDone: () => void;
};

export default function RecoveryKeyCard({
  recoveryKey,
  onDone,
}: RecoveryKeyModalProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(recoveryKey);

      setCopied(true);
    } catch (error) {
      console.error("copy failed", error);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md px-4">
      <div className="w-full max-w-2xl rounded-3xl border border-white/10 bg-zinc-950 p-8 text-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-yellow-500/10 p-3 text-yellow-400">
            <ShieldAlert size={28} />
          </div>

          <div>
            <h2 className="text-2xl font-semibold">
              Save Your Recovery Key
            </h2>

            <p className="mt-1 text-sm text-zinc-400">
              This key is required to recover your encrypted account.
            </p>
          </div>
        </div>

        {/* Warning */}
        <div className="mt-6 rounded-2xl border border-yellow-500/20 bg-yellow-500/10 p-4 text-sm text-yellow-200">
          If you lose this recovery key, your encrypted messages and account
          cannot be recovered.
        </div>

        {/* Recovery Key */}
        <div className="mt-6 rounded-2xl border border-white/10 bg-black/40 p-5">
          <div className="mb-3 text-xs uppercase tracking-widest text-zinc-500">
            Recovery Key
          </div>

          <div className="break-all font-mono text-sm text-zinc-200">
            {recoveryKey}
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center cursor-pointer gap-2 rounded-xl border border-white/10 bg-white/10 px-5 py-3 text-sm font-medium transition hover:bg-white/20"
          >
            {copied ? (
              <>
                <Check size={18} />
                Copied
              </>
            ) : (
              <>
                <Copy size={18} />
                Copy Recovery Key
              </>
            )}
          </button>

          <button
            type="button"
            disabled={!copied}
            onClick={onDone}
            className={`rounded-xl cursor-pointer px-6 py-3 text-sm font-semibold transition ${copied
              ? "bg-white text-black hover:opacity-90"
              : "cursor-not-allowed bg-zinc-800 text-zinc-500"
              }`}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
