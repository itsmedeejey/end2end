import { sodium } from "./libsodium";
import { saveIdentityKeys } from "./store/sodiumStore";

export async function generateIdentityKeys() {
  try {
    const keyPair = sodium.crypto_kx_keypair();

    const publicKey = sodium.to_base64(
      keyPair.publicKey,
      sodium.base64_variants.ORIGINAL
    );

    const privateKey = sodium.to_base64(
      keyPair.privateKey,
      sodium.base64_variants.ORIGINAL
    );


    await saveIdentityKeys(publicKey, privateKey);
    return publicKey;
  } catch (err) {
    console.error(err);
    throw err;
  }
}
