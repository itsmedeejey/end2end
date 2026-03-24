import { generateMnemonic } from 'bip39';

export function generateRecoveryKey(): string {
  return generateMnemonic(); //128 bits 
}
