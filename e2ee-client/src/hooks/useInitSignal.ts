"use client";

import { generateKeys } from "@/lib/libsignal/keyGenerator";
import { serializeKeyBundle } from "@/lib/libsignal/utils/serializeKeys";
import { useRef, useEffect } from "react";
import api from "@/config/axios";
import { getSignalStore } from "@/lib/libsignal/storeInstance";

import { useAuthStore } from "@/store/auth.store";

export const useInitSignal = () => {
  const userId = useAuthStore((s) => s.userId);
  const initialized = useRef(false);


  useEffect(() => {
    if (!userId) return;
    if (initialized.current) return;
    initialized.current = true;

    const init = async () => {
      try {

        const signalStore = getSignalStore();

        const keys = await generateKeys();

        const identity = await signalStore.getIdentityKeyPair();

        if (!identity) return;

        const payload = serializeKeyBundle(keys);

        await api.post("api/keys/upload", payload);

      } catch (err) {
        console.error("Signal init failed:", err);
        initialized.current = false; // allow retry if failed
      }
    };

    init();
  }, [userId]);
};
