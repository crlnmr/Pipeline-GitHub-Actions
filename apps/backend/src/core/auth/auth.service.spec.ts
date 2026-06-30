import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../database/prisma.service';

const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('AuthService', () => {
  let service: AuthService;
  const originalEnv = process.env.CLERK_SECRET_KEY;

  beforeEach(async () => {
    delete process.env.CLERK_SECRET_KEY;
    mockFetch.mockReset();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: {} },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterAll(() => {
    if (originalEnv) process.env.CLERK_SECRET_KEY = originalEnv;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('onModuleInit', () => {
    it('should log error when CLERK_SECRET_KEY is not set', () => {
      const loggerSpy = jest.spyOn(service['logger'], 'error');
      service.onModuleInit();
      expect(loggerSpy).toHaveBeenCalledWith('CLERK_SECRET_KEY is not configured. Auth module will not work.');
    });

    it('should create Clerk client when CLERK_SECRET_KEY is set', () => {
      process.env.CLERK_SECRET_KEY = 'sk_test_123';
      service.onModuleInit();
      expect((service as any).clerk).toBeDefined();
    });
  });

  describe('signIn', () => {
    it('should throw UnauthorizedException when Clerk is not configured', async () => {
      await expect(service.signIn('test@test.com', 'password')).rejects.toThrow(
        'Authentication service is not configured',
      );
    });

    it('should return sessionId on successful sign-in', async () => {
      process.env.CLERK_SECRET_KEY = 'sk_test_123';
      service.onModuleInit();

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ session_id: 'sess_123' }),
      });
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ foo: 'bar' }),
      });

      const result = await service.signIn('test@test.com', 'password');
      expect(result).toEqual({ sessionId: 'sess_123' });
    });

    it('should throw UnauthorizedException on Clerk API error', async () => {
      process.env.CLERK_SECRET_KEY = 'sk_test_123';
      service.onModuleInit();

      mockFetch.mockRejectedValue(new Error('Clerk API error'));

      await expect(
        service.signIn('test@test.com', 'password'),
      ).rejects.toThrow();
    });
  });

  describe('signUp', () => {
    it('should throw UnauthorizedException when Clerk is not configured', async () => {
      await expect(service.signUp('test@test.com', 'password')).rejects.toThrow(
        'Authentication service is not configured',
      );
    });

    it('should return user data on successful sign-up', async () => {
      process.env.CLERK_SECRET_KEY = 'sk_test_123';
      service.onModuleInit();

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: 'user_123',
          email_addresses: [{ email_address: 'test@test.com' }],
          first_name: 'Test',
        }),
      });

      const result = await service.signUp('test@test.com', 'password', 'Test');
      expect(result).toEqual({
        id: 'user_123',
        email: 'test@test.com',
        name: 'Test',
      });
    });
  });

  describe('validateToken', () => {
    it('should throw UnauthorizedException when Clerk is not configured', async () => {
      await expect(service.validateToken('some-token')).rejects.toThrow(
        'Authentication service is not configured',
      );
    });

    it('should return user data on valid token', async () => {
      process.env.CLERK_SECRET_KEY = 'sk_test_123';
      service.onModuleInit();

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ sub: 'clerk_123' }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            id: 'clerk_123',
            email_addresses: [{ email_address: 'test@test.com' }],
            first_name: 'Test',
            public_metadata: { role: 'ADMIN' },
          }),
        });

      const result = await service.validateToken('valid-token');
      expect(result).toEqual({
        clerkId: 'clerk_123',
        email: 'test@test.com',
        name: 'Test',
        role: 'ADMIN',
      });
    });

    it('should throw UnauthorizedException on Clerk API error', async () => {
      process.env.CLERK_SECRET_KEY = 'sk_test_123';
      service.onModuleInit();

      mockFetch.mockRejectedValue(new Error('Clerk API error'));

      await expect(
        service.validateToken('invalid-token'),
      ).rejects.toThrow();
    });
  });
});
