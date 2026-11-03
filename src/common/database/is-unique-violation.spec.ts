import { QueryFailedError } from 'typeorm';
import { describe, expect, it } from 'vitest';
import { buildUniqueViolation } from '../../../test/fixtures/entities.js';
import { isUniqueViolation } from './is-unique-violation.js';

describe('isUniqueViolation', () => {
  it('matches a unique violation of the given constraint', () => {
    expect(isUniqueViolation(buildUniqueViolation('UQ_a'), 'UQ_a')).toBe(true);
  });

  it('ignores a unique violation of another constraint', () => {
    expect(isUniqueViolation(buildUniqueViolation('UQ_b'), 'UQ_a')).toBe(false);
  });

  it('ignores other database errors', () => {
    const error = new QueryFailedError('INSERT', [], new Error('syntax'));

    expect(isUniqueViolation(error, 'UQ_a')).toBe(false);
  });

  it('ignores non-database errors', () => {
    expect(isUniqueViolation(new Error('boom'), 'UQ_a')).toBe(false);
  });
});
