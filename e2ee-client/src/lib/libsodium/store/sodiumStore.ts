"use client";

import { openDB, IDBPDatabase } from "idb";

const DB_NAME = "e2ee-chat";
const DB_VERSION = 1;

const IDENTITY_STORE = "identity";
const SESSION_STORE = "sessions";



/* =========================
   Database Cache
========================= */

let dbInstance:
  Promise<IDBPDatabase> | null = null;



/* =========================
   Lazy DB Initializer
========================= */

async function getDB() {

  if (typeof window === "undefined") {
    throw new Error(
      "indexedDB unavailable on server"
    );
  }

  if (!dbInstance) {

    dbInstance = openDB(
      DB_NAME,
      DB_VERSION,
      {

        upgrade(db) {

          if (
            !db.objectStoreNames.contains(
              IDENTITY_STORE
            )
          ) {

            db.createObjectStore(
              IDENTITY_STORE
            );
          }



          if (
            !db.objectStoreNames.contains(
              SESSION_STORE
            )
          ) {

            db.createObjectStore(
              SESSION_STORE,
              {
                keyPath:
                  "conversationId",
              }
            );
          }
        },
      }
    );
  }

  return dbInstance;
}



/* =========================
   Identity Keys
========================= */

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
    {
      publicKey,
      privateKey,
    },
    "identity"
  );
}



export async function getIdentityKeys():
  Promise<IdentityKeys | undefined> {

  const db = await getDB();

  return db.get(
    IDENTITY_STORE,
    "identity"
  );
}



/* =========================
   Session Keys
========================= */

export async function saveSessionKey(
  conversationId: string,
  sessionKey: string
) {

  const db = await getDB();

  await db.put(
    SESSION_STORE,
    {
      conversationId,
      sessionKey,
    }
  );
}



export async function getSessionKey(
  conversationId: string
) {

  const db = await getDB();

  const session = await db.get(
    SESSION_STORE,
    conversationId
  );

  return session?.sessionKey || null;
}



export async function deleteSessionKey(
  conversationId: string
) {

  const db = await getDB();

  await db.delete(
    SESSION_STORE,
    conversationId
  );
}
