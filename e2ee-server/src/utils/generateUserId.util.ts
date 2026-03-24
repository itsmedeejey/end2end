import { randomBytes } from 'crypto';

export function generateUserId(): string {
  return randomBytes(32).toString('hex');
}
