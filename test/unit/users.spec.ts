import { ConflictException, NotFoundException } from '@nestjs/common';
import type { Repository } from 'typeorm';
import { describe, expect, it, vi } from 'vitest';
import type { User } from '../../src/entities/user.entity.js';
import { USER_EMAIL_UNIQUE_CONSTRAINT } from '../../src/types/users/types.js';
import { UsersService } from '../../src/users/users.service.js';
import { buildUniqueViolation, buildUser } from '../fixtures/entities.js';

describe('UsersService', () => {
  const repository = {
    create: vi.fn((data: object) => data),
    save: vi.fn(),
    findOneBy: vi.fn(),
  };
  const service = new UsersService(repository as unknown as Repository<User>);
  const data = {
    email: 'roey@example.com',
    name: 'Roey Apel',
    passwordHash: 'hash',
  };

  describe('create', () => {
    it('saves and returns the new user', async () => {
      repository.save.mockResolvedValue(buildUser());

      await expect(service.create(data)).resolves.toEqual(buildUser());
      expect(repository.save).toHaveBeenCalledWith(data);
    });

    it('turns a duplicate email into a conflict', async () => {
      repository.save.mockRejectedValue(
        buildUniqueViolation(USER_EMAIL_UNIQUE_CONSTRAINT),
      );

      await expect(service.create(data)).rejects.toThrow(
        new ConflictException('Email is already registered'),
      );
    });

    it('rethrows other errors', async () => {
      const error = new Error('connection lost');
      repository.save.mockRejectedValue(error);

      await expect(service.create(data)).rejects.toBe(error);
    });
  });

  describe('getById', () => {
    it('throws when the user does not exist', async () => {
      repository.findOneBy.mockResolvedValue(null);

      await expect(service.getById(1)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });
});
