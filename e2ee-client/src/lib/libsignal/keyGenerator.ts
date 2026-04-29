import * as libsignal from "@privacyresearch/libsignal-protocol-typescript"
import { getSignalStore } from "./storeInstance";

export async function generateKeys() {

  const signalStore = getSignalStore()
  const identityKeyPair = await libsignal.KeyHelper.generateIdentityKeyPair()
  const registrationId = libsignal.KeyHelper.generateRegistrationId()

  await signalStore.putIdentityKeyPair(identityKeyPair);
  await signalStore.putRegistrationId(registrationId);

  const signedPreKey = await libsignal.KeyHelper.generateSignedPreKey(
    identityKeyPair,
    1
  )

  await signalStore.storeSignedPreKey(
    signedPreKey.keyId,
    signedPreKey.keyPair
  );

  // generate multiple prekeys manually
  const preKeys = [];

  for (let i = 1; i <= 10; i++) {
    const preKey = await libsignal.KeyHelper.generatePreKey(i);

    await signalStore.storePreKey(preKey.keyId, preKey.keyPair);

    preKeys.push({
      keyId: preKey.keyId,
      publicKey: preKey.keyPair.pubKey,
    });
  }

  return {
    identityKey: identityKeyPair.pubKey,
    registrationId,
    signedPreKey: {
      keyId: signedPreKey.keyId,
      publicKey: signedPreKey.keyPair.pubKey,
      signature: signedPreKey.signature,
    },
    preKeys,
  };
}
