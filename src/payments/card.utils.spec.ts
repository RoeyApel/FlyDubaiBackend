import { describe, expect, it } from 'vitest';
import { generateTransactionNumber, isCardExpired } from './card.utils.js';

describe('isCardExpired', () => {
  const now = new Date('2026-11-03T12:00:00.000Z');

  it('treats the current month as still valid', () => {
    expect(isCardExpired(11, 2026, now)).toBe(false);
  });

  it('accepts a future month or year', () => {
    expect(isCardExpired(12, 2026, now)).toBe(false);
    expect(isCardExpired(1, 2027, now)).toBe(false);
  });

  it('rejects a past month or year', () => {
    expect(isCardExpired(10, 2026, now)).toBe(true);
    expect(isCardExpired(12, 2025, now)).toBe(true);
  });
});

describe('generateTransactionNumber', () => {
  it('returns TXN- followed by 8 unambiguous characters', () => {
    expect(generateTransactionNumber()).toMatch(/^TXN-[A-HJ-NP-Z2-9]{8}$/);
  });

  it('returns a different number each call', () => {
    const numbers = new Set(
      Array.from({ length: 100 }, () => generateTransactionNumber()),
    );

    expect(numbers.size).toBe(100);
  });
});
