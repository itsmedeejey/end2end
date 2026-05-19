"use client";

import { getDB } from "@/lib/idb/db";

const IDENTITY_STORE = "identity";
const SESSION_STORE = "sessions";



//Identity Keys

type IdentityKeys = {
  publicKey: string;
  privateKey: string;
};

export async function saveIdentityKeys(
  publicKey: string,
  privateKey: string
) {
  const db = await getDB();

  await db.put(
    IDENTITY_STORE,
    { publicKey, privateKey },
    "identity"
  );
}

export async function getIdentityKeys(): Promise<IdentityKeys | undefined> {
  const db = await getDB();

  return db.get(IDENTITY_STORE, "identity");
}

//  Session Keys

export async function saveSessionKey(
  conversationId: string,
  sessionKey: string
) {
  const db = await getDB();

  await db.put(SESSION_STORE, {
    conversationId,
    sessionKey,
  });
}

export async function getSessionKey(conversationId: string) {
  const db = await getDB();

  const session = await db.get(
    SESSION_STORE,
    conversationId
  );

  return session?.sessionKey || null;
}

export async function deleteSessionKey(conversationId: string) {
  const db = await getDB();

  await db.delete(SESSION_STORE, conversationId);
}
