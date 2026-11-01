import { describe, expect, it } from 'vitest';
import { NodeEnv, validateEnv } from './env.validation.js';

const REQUIRED_ENV = {
  DB_HOST: 'localhost',
  DB_USERNAME: 'user',
  DB_PASSWORD: 'password',
  DB_NAME: 'db',
};

describe('validateEnv', () => {
  it('applies defaults for optional variables', () => {
    const env = validateEnv(REQUIRED_ENV);

    expect(env.NODE_ENV).toBe(NodeEnv.Development);
    expect(env.PORT).toBe(3000);
    expect(env.LOG_LEVEL).toBe('info');
    expect(env.DB_PORT).toBe(5432);
  });

  it('coerces numeric variables', () => {
    const env = validateEnv({ ...REQUIRED_ENV, PORT: '8080', DB_PORT: '6543' });

    expect(env.PORT).toBe(8080);
    expect(env.DB_PORT).toBe(6543);
  });

  it('rejects an invalid LOG_LEVEL', () => {
    expect(() => validateEnv({ ...REQUIRED_ENV, LOG_LEVEL: 'loud' })).toThrow(
      /Invalid environment configuration/,
    );
  });

  it.each(Object.keys(REQUIRED_ENV))('requires %s', (name) => {
    const env: Record<string, string> = { ...REQUIRED_ENV };
    delete env[name];

    expect(() => validateEnv(env)).toThrow(name);
  });
});
