import { randomBytes } from 'node:crypto';
import {
  TRANSACTION_CODE_ALPHABET,
  TRANSACTION_CODE_LENGTH,
  TRANSACTION_NUMBER_PREFIX,
} from '../types/payments/types.js';

/** A card stays valid through the last day of its expiry month (UTC). */
export function isCardExpired(
  expiryMonth: number,
  expiryYear: number,
  now: Date,
): boolean {
  const currentYear = now.getUTCFullYear();
  const currentMonth = now.getUTCMonth() + 1;

  return (
    expiryYear < currentYear ||
    (expiryYear === currentYear && expiryMonth < currentMonth)
  );
}

export function generateTransactionNumber(): string {
  const code = Array.from(
    randomBytes(TRANSACTION_CODE_LENGTH),
    (byte) =>
      TRANSACTION_CODE_ALPHABET[byte % TRANSACTION_CODE_ALPHABET.length],
  ).join('');

  return `${TRANSACTION_NUMBER_PREFIX}${code}`;
}
