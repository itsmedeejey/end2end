import * as bcrypt from 'bcrypt';

export function hashRecoveryKey(recoveryKey: string): Promise<string> {
  const normalized = recoveryKey.trim().toLowerCase().replace(/\s+/g, ' ');
  return bcrypt.hash(normalized, 12);
}
