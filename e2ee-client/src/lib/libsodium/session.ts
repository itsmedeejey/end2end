import { sodium } from "./libsodium";

export async function deriveSessionKey(
  privateKeyBase64: string,
  receiverPublicKeyBase64: string
) {
  const privateKey = sodium.from_base64(
    privateKeyBase64,
    sodium.base64_variants.ORIGINAL
  );

  const receiverPublicKey = sodium.from_base64(
    receiverPublicKeyBase64,
    sodium.base64_variants.ORIGINAL
  );

  const sharedSecret = sodium.crypto_scalarmult(
    privateKey,
    receiverPublicKey
  );

  const sessionKey = sodium.crypto_generichash(
    32,
    sharedSecret,
    null
  );

  return sodium.to_base64(
    sessionKey,
    sodium.base64_variants.ORIGINAL
  );
}
