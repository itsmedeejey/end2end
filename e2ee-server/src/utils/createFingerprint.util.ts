import { createHash } from 'crypto';

export function createFingerprint(mnemonic: string): string {
  return createHash('sha256')
    .update(mnemonic.trim().toLowerCase())
    .digest('hex')
    .slice(0, 16);
}
