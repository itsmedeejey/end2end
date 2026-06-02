"use client";

import { ChatMessage } from "@/types/message.type";
import { ConversationConnection } from "@/types/loadConversation.type";
import { getDB } from "./db";

const MESSAGE_STORE = "messages";
const CONVERSATION_STORE = "conversations";

//SAVE 
export async function saveMessages(
    messages: ChatMessage[]
) {
    const db = await getDB();

    const tx = db.transaction(
        MESSAGE_STORE,
        "readwrite"
    );

    for (const msg of messages) {
        tx.store.put(msg);
    }

    await tx.done;
}

export async function replaceMessage(
    oldMessageId: string,
    message: ChatMessage
) {
    const db = await getDB();

    const tx = db.transaction(
        MESSAGE_STORE,
        "readwrite"
    );

    await tx.store.delete(oldMessageId);
    await tx.store.put(message);
    await tx.done;
}

//  GET ALL 
export async function getConversationMessages(
    conversationId: string
) {
    const db = await getDB();

    const tx = db.transaction(MESSAGE_STORE);

    const index = tx.store.index(
        "conversationId-id"
    );

    const range = IDBKeyRange.bound(
        [conversationId, ""],
        [conversationId, "\uffff"]
    );

    return index.getAll(range);
}

//GET LATEST 
export async function getLatestMessage(
    conversationId: string
) {
    const db = await getDB();

    const tx = db.transaction(MESSAGE_STORE);

    const index = tx.store.index(
        "conversationId-id"
    );

    const cursor = await index.openCursor(
        IDBKeyRange.bound(
            [conversationId, ""],
            [conversationId, "\uffff"]
        ),
        "prev"
    );

    return cursor?.value || null;
}

export async function getLatestSyncedMessage(
    conversationId: string
) {
    const db = await getDB();

    const tx = db.transaction(MESSAGE_STORE);

    const index = tx.store.index(
        "conversationId-id"
    );

    let cursor = await index.openCursor(
        IDBKeyRange.bound(
            [conversationId, ""],
            [conversationId, "\uffff"]
        ),
        "prev"
    );

    while (cursor) {
        const message = cursor.value as ChatMessage;

        if (!message.id.startsWith("local-")) {
            return message;
        }

        cursor = await cursor.continue();
    }

    return null;
}

//GET OLDEST

export async function getOldestMessage(
    conversationId: string
) {
    const db = await getDB();

    const tx = db.transaction(MESSAGE_STORE);

    const index = tx.store.index(
        "conversationId-id"
    );

    const cursor = await index.openCursor(
        IDBKeyRange.bound(
            [conversationId, ""],
            [conversationId, "\uffff"]
        ),
        "next"
    );

    return cursor?.value || null;
}

//GET LATEST PAGE 

export async function getLatestMessages(
    conversationId: string,
    limit = 30
) {
    const db = await getDB();

    const tx = db.transaction(MESSAGE_STORE);

    const index = tx.store.index(
        "conversationId-id"
    );

    const range = IDBKeyRange.bound(
        [conversationId, ""],
        [conversationId, "\uffff"]
    );

    const messages: ChatMessage[] = [];

    let cursor = await index.openCursor(
        range,
        "prev"
    );

    while (cursor && messages.length < limit) {
        messages.push(cursor.value);

        cursor = await cursor.continue();
    }

    return messages.reverse();
}

// GET OLDER LOCAL MESSAGES 

export async function getOlderLocalMessages(
    conversationId: string,
    beforeId: string,
    limit = 30
) {
    const db = await getDB();

    const tx = db.transaction(MESSAGE_STORE);

    const index = tx.store.index(
        "conversationId-id"
    );

    const range = IDBKeyRange.bound(
        [conversationId, ""],
        [conversationId, beforeId],
        false,
        true
    );

    const messages: ChatMessage[] = [];

    let cursor = await index.openCursor(
        range,
        "prev"
    );

    while (cursor && messages.length < limit) {
        messages.push(cursor.value);

        cursor = await cursor.continue();
    }

    return messages.reverse();
}

//DELETE CONVERSATION CACHE 
export async function deleteConversationMessages(
    conversationId: string
) {
    const db = await getDB();

    const tx = db.transaction(
        MESSAGE_STORE,
        "readwrite"
    );

    const index = tx.store.index(
        "conversationId"
    );

    let cursor = await index.openCursor(
        conversationId
    );

    while (cursor) {
        cursor.delete();

        cursor = await cursor.continue();
    }

    await tx.done;
}

export async function saveConversations(
    conversations: ConversationConnection[]
) {
    const db = await getDB();

    const tx = db.transaction(
        CONVERSATION_STORE,
        "readwrite"
    );

    for (const conversation of conversations) {
        tx.store.put(conversation);
    }

    await tx.done;
}

export async function getCachedConversations(
    limit = 100
): Promise<ConversationConnection[]> {
    const db = await getDB();

    const tx = db.transaction(CONVERSATION_STORE);
    const index = tx.store.index("updatedAt");
    const conversations: ConversationConnection[] = [];

    let cursor = await index.openCursor(null, "prev");

    while (cursor && conversations.length < limit) {
        conversations.push(cursor.value);
        cursor = await cursor.continue();
    }

    return conversations;
}

export async function updateConversationCache(
    conversation: ConversationConnection
) {
    const db = await getDB();

    const tx = db.transaction(
        CONVERSATION_STORE,
        "readwrite"
    );

    await tx.store.put(conversation);
    await tx.done;
}
