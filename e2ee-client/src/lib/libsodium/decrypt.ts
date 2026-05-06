import { sodium } from "./libsodium";

export async function decryptMessage(
  ciphertextBase64: string,
  nonceBase64: string,
  sessionKeyBase64: string
) {
  const ciphertext = sodium.from_base64(
    ciphertextBase64,
    sodium.base64_variants.ORIGINAL
  );

  const nonce = sodium.from_base64(
    nonceBase64,
    sodium.base64_variants.ORIGINAL
  );

  const key = sodium.from_base64(
    sessionKeyBase64,
    sodium.base64_variants.ORIGINAL
  );

  const plaintext =
    sodium.crypto_aead_xchacha20poly1305_ietf_decrypt(
      null,
      ciphertext,
      null,
      nonce,
      key
    );

  return sodium.to_string(plaintext);
}

