export type keyBundle = {
  identityKey: string;
  registrationId: number;
  signedPreKey: {
    keyId: number;
    publicKey: string;
    signature: string;
  }
  preKeys: preKeysType[];
}

type preKeysType = {
  keyId: number;
  publicKey: string;
}
