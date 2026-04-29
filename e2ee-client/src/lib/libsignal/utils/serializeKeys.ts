import { arrayBufferToBase64 } from "./cipherTextConvert";

type KeyBundle = {
  identityKey: ArrayBuffer;
  registrationId: number;
  signedPreKey: {
    keyId: number;
    publicKey: ArrayBuffer;
    signature: ArrayBuffer;
  };
  preKeys: {
    keyId: number;
    publicKey: ArrayBuffer;
  }[];
};

export function serializeKeyBundle(bundle: KeyBundle) {
  return {
    identityKey: arrayBufferToBase64(bundle.identityKey),

    registrationId: bundle.registrationId,

    signedPreKey: {
      keyId: bundle.signedPreKey.keyId,
      publicKey: arrayBufferToBase64(bundle.signedPreKey.publicKey),
      signature: arrayBufferToBase64(bundle.signedPreKey.signature),
    },

    preKeys: bundle.preKeys.map(pk => ({
      keyId: pk.keyId,
      publicKey: arrayBufferToBase64(pk.publicKey),
    })),
  };
}
