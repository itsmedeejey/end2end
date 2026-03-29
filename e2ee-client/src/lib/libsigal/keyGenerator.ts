import * as libsignal from "@privacyresearch/libsignal-protocol-typescript"

export async function generateKeys() {
  const identityKeyPair = await libsignal.KeyHelper.generateIdentityKeyPair()
  const registrationId = libsignal.KeyHelper.generateRegistrationId()

  const signedPreKey = await libsignal.KeyHelper.generateSignedPreKey(
    identityKeyPair,
    1
  )

  // generate multiple prekeys manually
  const preKeys = []

  for (let i = 1; i <= 10; i++) {
    const preKey = await libsignal.KeyHelper.generatePreKey(i)
    preKeys.push(preKey)
  }

  return {
    identityKeyPair,
    registrationId,
    signedPreKey,
    preKeys
  }
}
