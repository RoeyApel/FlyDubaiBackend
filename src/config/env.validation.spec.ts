import { describe, expect, it } from 'vitest';
import { NodeEnv, validateEnv } from './env.validation.js';

describe('validateEnv', () => {
  it('applies defaults for an empty environment', () => {
    const env = validateEnv({});

    expect(env.NODE_ENV).toBe(NodeEnv.Development);
    expect(env.PORT).toBe(3000);
    expect(env.LOG_LEVEL).toBe('info');
  });

  it('coerces PORT to a number', () => {
    expect(validateEnv({ PORT: '8080' }).PORT).toBe(8080);
  });

  it('rejects an invalid LOG_LEVEL', () => {
    expect(() => validateEnv({ LOG_LEVEL: 'loud' })).toThrow(
      /Invalid environment configuration/,
    );
  });
});
