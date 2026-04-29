
import * as libsignal from "@privacyresearch/libsignal-protocol-typescript";
import type { StorageType } from "@privacyresearch/libsignal-protocol-typescript";
import { getAddress } from "./address";
import { arrayBufferToBase64 } from "./utils/cipherTextConvert";

export type EncryptedMessage = {
  type: number;        // 1 = normal, 3 = prekey
  body: string;        // base64 encoded
};
export async function encryptMessage(
  store: StorageType,
  receiverId: string,
  plaintext: string
): Promise<EncryptedMessage> {
  const address = getAddress(receiverId);

  const cipher = new libsignal.SessionCipher(store, address);

  // converting string to ArrayBuffer , WHY? casuse libsignal encrypt only ArrayBuffer
  const encoded = new TextEncoder().encode(plaintext).buffer;

  const encrypted = await cipher.encrypt(encoded); // encrypting the data in the ArrayBuffer

  if (!encrypted.body || typeof encrypted.body === "string") {
    throw new Error("Invalid encrypted body");
  }

  return {
    type: encrypted.type,
    body: arrayBufferToBase64(encrypted.body), // converting ArrayBuffer to base64 for transporting
  };
}
