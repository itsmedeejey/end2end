import * as libsignal from "@privacyresearch/libsignal-protocol-typescript";

export function getAddress(userId: string) {
  return new libsignal.SignalProtocolAddress(userId, 1);
}
