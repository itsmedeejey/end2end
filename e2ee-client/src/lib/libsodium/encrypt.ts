import { sodium } from "./libsodium";

export async function encryptMessage(
  plaintext: string,
  sessionKeyBase64: string
) {
  const key = sodium.from_base64(
    sessionKeyBase64,
    sodium.base64_variants.ORIGINAL
  );

  const nonce = sodium.randombytes_buf(
    sodium.crypto_aead_xchacha20poly1305_ietf_NPUBBYTES
  );

  const cipher =
    sodium.crypto_aead_xchacha20poly1305_ietf_encrypt(
      plaintext,
      null,
      null,
      nonce,
      key
    );

  return {
    ciphertext: sodium.to_base64(
      cipher,
      sodium.base64_variants.ORIGINAL
    ),

    nonce: sodium.to_base64(
      nonce,
      sodium.base64_variants.ORIGINAL
    ),
  };
}
