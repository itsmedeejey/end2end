import { getAddress } from "../address";
import type { StorageType } from "@privacyresearch/libsignal-protocol-typescript";

import { createSession } from "../sessionManager";

export async function ensureSession(
  store: StorageType,
  receiverId: string
) {
  const address = getAddress(receiverId);

  const existing = await store.loadSession(address.toString());

  if (existing) return;

  // fetch from backend
  const bundle = await fetchPreKeyBundle(receiverId);

  await createSession(store, receiverId, bundle);
}
