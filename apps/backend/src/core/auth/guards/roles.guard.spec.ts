import { ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import { RolesGuard } from './roles.guard';

function createMockContext(user?: { role: string }) {
  const handler = () => {};
  const cls = class {};

  return {
    switchToHttp: () => ({
      getRequest: () => ({ user, url: '/v1/admin' }),
    }),
    getHandler: () => handler,
    getClass: () => cls,
  } as any;
}

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RolesGuard, Reflector],
    }).compile();

    guard = module.get<RolesGuard>(RolesGuard);
    reflector = module.get<Reflector>(Reflector);
  });

  it('should allow access when no roles are required', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);

    const result = guard.canActivate(createMockContext({ role: 'CUSTOMER' }));
    expect(result).toBe(true);
  });

  it('should allow ADMIN user to access ADMIN route', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['ADMIN']);

    const result = guard.canActivate(createMockContext({ role: 'ADMIN' }));
    expect(result).toBe(true);
  });

  it('should throw ForbiddenException for CUSTOMER on ADMIN route', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['ADMIN']);

    expect(() =>
      guard.canActivate(createMockContext({ role: 'CUSTOMER' })),
    ).toThrow(ForbiddenException);
  });

  it('should throw ForbiddenException when user is not present', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['ADMIN']);

    expect(() =>
      guard.canActivate(createMockContext(undefined as any)),
    ).toThrow(ForbiddenException);
  });
});
