import {
  ConflictException,
  type ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import type { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthGuard } from '../../src/guards/auth.guard.js';
import { AuthService } from '../../src/auth/auth.service.js';
import {
  type AuthenticatedRequest,
  LoginDto,
  RegisterDto,
} from '../../src/types/auth/types.js';
import type { UsersService } from '../../src/users/users.service.js';
import { buildUser } from '../fixtures/entities.js';
import { validateDto } from '../fixtures/validation.js';

function contextFor(request: Partial<AuthenticatedRequest>): ExecutionContext {
  return {
    getHandler: () => undefined,
    getClass: () => undefined,
    switchToHttp: () => ({ getRequest: () => request }),
  } as unknown as ExecutionContext;
}

describe('AuthGuard', () => {
  const jwtService = new JwtService({ secret: 'a'.repeat(32) });
  const reflector = { getAllAndOverride: vi.fn() };
  const guard = new AuthGuard(jwtService, reflector as unknown as Reflector);

  beforeEach(() => {
    reflector.getAllAndOverride.mockReturnValue(undefined);
  });

  it('lets public routes through without a token', async () => {
    reflector.getAllAndOverride.mockReturnValue(true);

    await expect(guard.canActivate(contextFor({ headers: {} }))).resolves.toBe(
      true,
    );
  });

  it('sets the user id from a valid token', async () => {
    const token = await jwtService.signAsync({ sub: 42 });
    const request = { headers: { authorization: `Bearer ${token}` } };

    await expect(guard.canActivate(contextFor(request))).resolves.toBe(true);
    expect((request as Partial<AuthenticatedRequest>).userId).toBe(42);
  });

  it.each([
    ['no header', undefined],
    ['a non-bearer scheme', 'Basic abc'],
    ['an empty bearer token', 'Bearer '],
    ['a malformed token', 'Bearer not-a-jwt'],
  ])('rejects %s', async (_case, authorization) => {
    await expect(
      guard.canActivate(contextFor({ headers: { authorization } })),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('rejects a token signed with another secret', async () => {
    const foreignToken = await new JwtService({
      secret: 'b'.repeat(32),
    }).signAsync({ sub: 42 });

    await expect(
      guard.canActivate(
        contextFor({ headers: { authorization: `Bearer ${foreignToken}` } }),
      ),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('rejects an expired token', async () => {
    const expiredToken = await jwtService.signAsync(
      { sub: 42 },
      { expiresIn: -1 },
    );

    await expect(
      guard.canActivate(
        contextFor({ headers: { authorization: `Bearer ${expiredToken}` } }),
      ),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});

describe('AuthService', () => {
  const usersService = {
    create: vi.fn<UsersService['create']>(),
    findByEmailWithPassword: vi.fn(),
  };
  const jwtService = { signAsync: vi.fn() };
  const service = new AuthService(
    usersService as unknown as UsersService,
    jwtService as unknown as JwtService,
  );

  beforeEach(() => {
    jwtService.signAsync.mockResolvedValue('signed-token');
  });

  describe('register', () => {
    const registerDto = {
      email: 'roey@example.com',
      password: 'correct-horse',
      name: 'Roey Apel',
    };

    it('stores an argon2id hash and returns a token with the user', async () => {
      usersService.create.mockImplementation((data) =>
        Promise.resolve(buildUser(data)),
      );

      const response = await service.register(registerDto);

      const { passwordHash } = usersService.create.mock.calls[0][0];
      expect(passwordHash).toMatch(/^\$argon2id\$/);
      expect(await argon2.verify(passwordHash, registerDto.password)).toBe(
        true,
      );
      expect(jwtService.signAsync).toHaveBeenCalledWith({ sub: 1 });
      expect(response).toEqual({
        accessToken: 'signed-token',
        user: { id: 1, email: registerDto.email, name: registerDto.name },
      });
    });

    it('propagates a conflict for an existing email', async () => {
      usersService.create.mockRejectedValue(new ConflictException());

      await expect(service.register(registerDto)).rejects.toBeInstanceOf(
        ConflictException,
      );
    });
  });

  describe('login', () => {
    const password = 'correct-horse';

    it('returns a token for valid credentials', async () => {
      usersService.findByEmailWithPassword.mockResolvedValue(
        buildUser({ passwordHash: await argon2.hash(password) }),
      );

      const response = await service.login({
        email: 'roey@example.com',
        password,
      });

      expect(response.accessToken).toBe('signed-token');
      expect(response.user).toEqual({
        id: 1,
        email: 'roey@example.com',
        name: 'Roey Apel',
      });
    });

    it('rejects a wrong password', async () => {
      usersService.findByEmailWithPassword.mockResolvedValue(
        buildUser({ passwordHash: await argon2.hash(password) }),
      );

      await expect(
        service.login({ email: 'roey@example.com', password: 'wrong-pass' }),
      ).rejects.toThrow(new UnauthorizedException('Invalid email or password'));
    });

    it('rejects an unknown email with the same error', async () => {
      usersService.findByEmailWithPassword.mockResolvedValue(null);

      await expect(
        service.login({ email: 'nobody@example.com', password }),
      ).rejects.toThrow(new UnauthorizedException('Invalid email or password'));
    });
  });
});

describe('RegisterDto', () => {
  const valid = {
    email: 'roey@example.com',
    password: 'correct-horse',
    name: 'Roey Apel',
  };

  it('trims and lowercases the email and trims the name', async () => {
    const { dto: registerDto, errors } = await validateDto(RegisterDto, {
      ...valid,
      email: '  Roey@Example.COM ',
      name: '  Roey Apel  ',
    });

    expect(errors).toEqual([]);
    expect(registerDto.email).toBe('roey@example.com');
    expect(registerDto.name).toBe('Roey Apel');
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
    const { dto: loginDto, errors } = await validateDto(LoginDto, {
      email: 'ROEY@example.com',
      password: 'anything',
    });

    expect(errors).toEqual([]);
    expect(loginDto.email).toBe('roey@example.com');
  });
});
