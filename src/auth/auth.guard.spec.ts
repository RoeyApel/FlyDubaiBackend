import { type ExecutionContext, UnauthorizedException } from '@nestjs/common';
import type { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { AuthenticatedRequest } from '../types/auth/types.js';
import { AuthGuard } from './auth.guard.js';

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
