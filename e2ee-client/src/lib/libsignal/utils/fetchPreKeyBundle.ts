import api from "@/config/axios";
import { base64ToArrayBuffer } from "./cipherTextConvert";

type fetchKeyBundle = {
  registrationId: number;
  identityKey: string;
  signedPreKey: {
    keyId: number;
    publicKey: string;
    signature: string;
  };
  preKey: {
    keyId: number;
    publicKey: string;
  } | undefined;
}

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

export const fetchPreKeyBundle = async (recieverId: string) => {
  const res = await api.post<fetchKeyBundle>("api/keys/getKeys", { recieverId: recieverId })
  const keys = res.data;


  let preKey;

  if (keys.preKey) {
    preKey = {
      keyId: keys.preKey.keyId,
      publicKey: base64ToArrayBuffer(keys.preKey.publicKey)
    };
  }

  const bundle: PreKeyBundle = {
    registrationId: keys.registrationId,
    identityKey: base64ToArrayBuffer(keys.identityKey),
    signedPreKey: {
      keyId: keys.signedPreKey.keyId,
      publicKey: base64ToArrayBuffer(keys.signedPreKey.publicKey),
      signature: base64ToArrayBuffer(keys.signedPreKey.signature)
    },
    preKey
  };

  return bundle;

}
