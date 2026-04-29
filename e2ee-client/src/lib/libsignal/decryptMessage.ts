import * as libsignal from "@privacyresearch/libsignal-protocol-typescript";
import type { StorageType } from "@privacyresearch/libsignal-protocol-typescript";
import { getAddress } from "./address";
import { base64ToArrayBuffer } from "./utils/cipherTextConvert";
export async function decryptMessage(
  store: StorageType,
  senderId: string,
  message: {
    type: number;
    body: string;
  }
): Promise<string> {
  const address = getAddress(senderId);

  const cipher = new libsignal.SessionCipher(store, address);

  const binary = base64ToArrayBuffer(message.body);

  let decrypted: ArrayBuffer;

  if (message.type === 3) {
    // First message → creates session
    decrypted = await cipher.decryptPreKeyWhisperMessage(binary, "binary");
  } else {
    // Normal message
    decrypted = await cipher.decryptWhisperMessage(binary, "binary");
  }

  // convert binary → string
  return new TextDecoder().decode(decrypted);
}
