import * as bcrypt from 'bcrypt';
export async function verifyRecoveryKey(
  plainKey: string,
  storedHash: string,
): Promise<boolean> {
  return bcrypt.compare(plainKey, storedHash);
}
