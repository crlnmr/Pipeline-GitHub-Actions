import { Test, TestingModule } from '@nestjs/testing';
import { Reflector } from '@nestjs/core';
import { AuditInterceptor } from './audit.interceptor';
import { AuditService } from './audit.service';
import { of } from 'rxjs';

const mockAuditService = {
  log: jest.fn(),
};

describe('AuditInterceptor', () => {
  let interceptor: AuditInterceptor;
  let reflector: Reflector;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditInterceptor,
        Reflector,
        { provide: AuditService, useValue: mockAuditService },
      ],
    }).compile();

    interceptor = module.get<AuditInterceptor>(AuditInterceptor);
    reflector = module.get<Reflector>(Reflector);
  });

  it('should pass through when no audit metadata', (done) => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);

    const mockCtx = {
      switchToHttp: () => ({
        getRequest: () => ({ params: {}, body: {}, url: '/test' }),
      }),
      getHandler: () => ({}),
      getClass: () => ({}),
    };

    interceptor.intercept(mockCtx as any, { handle: () => of('ok') }).subscribe({
      next: (value) => {
        expect(value).toBe('ok');
        expect(mockAuditService.log).not.toHaveBeenCalled();
        done();
      },
    });
  });

  it('should log audit when metadata is present', (done) => {
    const auditMeta = { action: 'test.action', resource: 'Test' };
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(auditMeta);

    const mockCtx = {
      switchToHttp: () => ({
        getRequest: () => ({
          params: { id: '123' },
          body: { name: 'test' },
          url: '/test/123',
          method: 'PATCH',
          user: { clerkId: 'user-1', email: 'user@test.com' },
        }),
      }),
      getHandler: () => ({}),
      getClass: () => ({}),
    };

    interceptor.intercept(mockCtx as any, { handle: () => of('updated') }).subscribe({
      next: (value) => {
        expect(value).toBe('updated');
        expect(mockAuditService.log).toHaveBeenCalledWith({
          usuario: 'user-1',
          objeto: 'Test:123',
          acao: 'test.action',
          payload: {
            method: 'PATCH',
            path: '/test/123',
            body: { name: 'test' },
          },
        });
        done();
      },
    });
  });
});
