"use client";

import { openDB, IDBPDatabase } from "idb";

const DB_NAME = "e2ee-chat";
const DB_VERSION = 2;

let dbInstance: Promise<IDBPDatabase> | null =
  null;

export async function getDB() {
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
        upgrade(db, _oldVersion, _newVersion, tx) {

          // identity
          if (
            !db.objectStoreNames.contains(
              "identity"
            )
          ) {
            db.createObjectStore(
              "identity"
            );
          }

          // sessions
          if (
            !db.objectStoreNames.contains(
              "sessions"
            )
          ) {
            db.createObjectStore(
              "sessions",
              {
                keyPath:
                  "conversationId",
              }
            );
          }

          // messages
          if (
            !db.objectStoreNames.contains(
              "messages"
            )
          ) {
            const messageStore =
              db.createObjectStore(
                "messages",
                {
                  keyPath: "id",
                }
              );

            messageStore.createIndex(
              "conversationId",
              "conversationId"
            );

            messageStore.createIndex(
              "conversationId-id",
              [
                "conversationId",
                "id",
              ]
            );
          }

          // conversations
          if (
            !db.objectStoreNames.contains(
              "conversations"
            )
          ) {
            const conversationStore =
              db.createObjectStore(
                "conversations",
                {
                  keyPath: "id",
                }
              );

            conversationStore.createIndex(
              "lastMessageId",
              "lastMessageId"
            );

            conversationStore.createIndex(
              "updatedAt",
              "updatedAt"
            );
          } else {
            const conversationStore = tx.objectStore("conversations");

            if (!conversationStore.indexNames.contains("updatedAt")) {
              conversationStore.createIndex("updatedAt", "updatedAt");
            }
          }
        },
      }
    );
  }

  return dbInstance;
}
