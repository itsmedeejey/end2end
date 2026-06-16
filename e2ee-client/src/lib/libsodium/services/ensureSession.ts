"use client"
import { deriveSessionKey } from "../session";
import { getSessionKey } from "../store/sodiumStore";
import { getIdentityKeys } from "../store/sodiumStore";
import { saveSessionKey } from "../store/sodiumStore";
import api from "@/config/axios";

export async function ensureSession(
    conversationId: string,
    receiverId: string
) {
    try {
        let sessionKey = await getSessionKey(conversationId)
        if (sessionKey) return sessionKey;

        const response = await api.get(`/api/keys/${receiverId}`);

        const ReceiverPubKey = response.data.publicKey;

        const keys = await getIdentityKeys()
        if (!keys) {
            throw new Error(
                "identity keys missing"
            );
        }

        sessionKey = await deriveSessionKey(keys.privateKey, ReceiverPubKey)
        await saveSessionKey(conversationId, sessionKey)
        return sessionKey

    } catch (err) {
        console.log(err)
        throw err;
    }

}
