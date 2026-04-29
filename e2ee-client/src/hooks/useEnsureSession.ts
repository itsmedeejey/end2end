"use client";

import { useCallback } from "react";
import { ensureSession } from "@/lib/libsignal/services/session.service";
import type { StorageType } from "@privacyresearch/libsignal-protocol-typescript";

export function useEnsureSession(store: StorageType | null) {
  return useCallback(
    async (receiverId: string) => {
      if (!store) return;
      await ensureSession(store, receiverId);
    },
    [store]
  );
}
