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


export type fetchKeyBundle = {
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
