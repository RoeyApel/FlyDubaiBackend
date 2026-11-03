import { ConflictException, UnauthorizedException } from '@nestjs/common';
import type { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { buildUser } from '../../test/fixtures/entities.js';
import type { UsersService } from '../users/users.service.js';
import { AuthService } from './auth.service.js';

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
    const dto = {
      email: 'roey@example.com',
      password: 'correct-horse',
      name: 'Roey Apel',
    };

    it('stores an argon2id hash and returns a token with the user', async () => {
      usersService.create.mockImplementation((data) =>
        Promise.resolve(buildUser(data)),
      );

      const response = await service.register(dto);

      const { passwordHash } = usersService.create.mock.calls[0][0];
      expect(passwordHash).toMatch(/^\$argon2id\$/);
      expect(await argon2.verify(passwordHash, dto.password)).toBe(true);
      expect(jwtService.signAsync).toHaveBeenCalledWith({ sub: 1 });
      expect(response).toEqual({
        accessToken: 'signed-token',
        user: { id: 1, email: dto.email, name: dto.name },
      });
    });

    it('propagates a conflict for an existing email', async () => {
      usersService.create.mockRejectedValue(new ConflictException());

      await expect(service.register(dto)).rejects.toBeInstanceOf(
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
