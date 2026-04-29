import * as libsignal from "@privacyresearch/libsignal-protocol-typescript";
import type { StorageType } from "@privacyresearch/libsignal-protocol-typescript";
import { getAddress } from "./address";

type PreKeyBundle = {
  registrationId: number;

  identityKey: ArrayBuffer;

  signedPreKey: {
    keyId: number;
    publicKey: ArrayBuffer;
    signature: ArrayBuffer;
  };
  preKey?: {
    keyId: number;
    publicKey: ArrayBuffer;
  };
};

export async function createSession(
  store: StorageType,
  receiverId: string,
  bundle: PreKeyBundle,
) {
  const address = getAddress(receiverId);
  const builder = new libsignal.SessionBuilder(store, address);

  await builder.processPreKey(bundle);
}
