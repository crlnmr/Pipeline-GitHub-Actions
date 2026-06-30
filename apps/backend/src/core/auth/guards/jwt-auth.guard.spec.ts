import { UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import { JwtAuthGuard } from './jwt-auth.guard';
import { AuthService } from '../auth.service';
import { PrismaService } from '../../database/prisma.service';

function createMockContext(overrides?: {
  cookie?: string;
  authorization?: string;
  url?: string;
}) {
  const headers: Record<string, string> = {};
  if (overrides?.cookie) headers.cookie = overrides.cookie;
  if (overrides?.authorization) headers.authorization = overrides.authorization;

  const handler = () => {};
  const cls = class {};

  return {
    switchToHttp: () => ({
      getRequest: () => ({
        headers,
        url: overrides?.url ?? '/v1/test',
      }),
    }),
    getHandler: () => handler,
    getClass: () => cls,
  } as any;
}

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtAuthGuard,
        Reflector,
        AuthService,
        { provide: PrismaService, useValue: {} },
      ],
    }).compile();

    guard = module.get<JwtAuthGuard>(JwtAuthGuard);
    authService = module.get<AuthService>(AuthService);
  });

  describe('public routes', () => {
    it('should allow access to public routes', async () => {
      const reflector = (guard as any).reflector as Reflector;
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(true);

      const result = await guard.canActivate(createMockContext());
      expect(result).toBe(true);
    });
  });

  describe('protected routes', () => {
    it('should throw UnauthorizedException when no token is provided', async () => {
      await expect(
        guard.canActivate(createMockContext()),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when token is invalid', async () => {
      jest.spyOn(authService, 'validateToken').mockRejectedValue(new Error());

      await expect(
        guard.canActivate(createMockContext({ cookie: '__session=invalid-token' })),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should allow access when token is valid via cookie', async () => {
      jest.spyOn(authService, 'validateToken').mockResolvedValue({
        clerkId: 'clerk_123',
        email: 'test@test.com',
        name: undefined,
        role: 'CUSTOMER',
      });

      const result = await guard.canActivate(
        createMockContext({ cookie: '__session=valid-token' }),
      );
      expect(result).toBe(true);
    });

    it('should allow access when token is valid via Authorization header', async () => {
      jest.spyOn(authService, 'validateToken').mockResolvedValue({
        clerkId: 'clerk_123',
        email: 'test@test.com',
        name: undefined,
        role: 'ADMIN',
      });

      const result = await guard.canActivate(
        createMockContext({ authorization: 'Bearer valid-jwt-token' }),
      );
      expect(result).toBe(true);
    });
  });
});
