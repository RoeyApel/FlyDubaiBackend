import { describe, expect, it } from 'vitest';
import { validateDto } from '../../../test/fixtures/validation.js';
import { LoginDto, RegisterDto } from './types.js';

describe('RegisterDto', () => {
  const valid = {
    email: 'roey@example.com',
    password: 'correct-horse',
    name: 'Roey Apel',
  };

  it('trims and lowercases the email and trims the name', async () => {
    const { dto, errors } = await validateDto(RegisterDto, {
      ...valid,
      email: '  Roey@Example.COM ',
      name: '  Roey Apel  ',
    });

    expect(errors).toEqual([]);
    expect(dto.email).toBe('roey@example.com');
    expect(dto.name).toBe('Roey Apel');
  });

  it.each([
    ['an invalid email', { email: 'not-an-email' }, 'email'],
    ['a short password', { password: 'short' }, 'password'],
    ['a too long password', { password: 'x'.repeat(129) }, 'password'],
    ['a blank name', { name: '   ' }, 'name'],
  ])('rejects %s', async (_case, override, field) => {
    const { errors } = await validateDto(RegisterDto, {
      ...valid,
      ...override,
    });

    expect(errors).toEqual([field]);
  });
});

describe('LoginDto', () => {
  it('normalizes the email so login is case-insensitive', async () => {
    const { dto, errors } = await validateDto(LoginDto, {
      email: 'ROEY@example.com',
      password: 'anything',
    });

    expect(errors).toEqual([]);
    expect(dto.email).toBe('roey@example.com');
  });
});
