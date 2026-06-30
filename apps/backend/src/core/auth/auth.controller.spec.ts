import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserService } from './services/user.service';
import { PrismaService } from '../database/prisma.service';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        AuthService,
        UserService,
        { provide: PrismaService, useValue: { user: { upsert: jest.fn(), findUnique: jest.fn() } } },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
    authService.onModuleInit();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('signIn', () => {
    it('should set __session cookie on successful sign-in', async () => {
      const mockRes = {
        cookie: jest.fn(),
      };
      jest.spyOn(authService, 'signIn').mockResolvedValue({ sessionId: 'sess_123' });

      const result = await controller.signIn(
        { email: 'test@test.com', password: 'password' },
        mockRes as any,
      );

      expect(mockRes.cookie).toHaveBeenCalledWith('__session', 'sess_123', {
        httpOnly: true,
        secure: false,
        sameSite: 'strict',
        path: '/',
      });
      expect(result).toEqual({ message: 'Autenticado com sucesso' });
    });
  });

  describe('signUp', () => {
    it('should return user data on successful sign-up', async () => {
      jest.spyOn(authService, 'signUp').mockResolvedValue({
        id: 'user_123',
        email: 'test@test.com',
        name: 'Test',
      });

      const result = await controller.signUp({
        email: 'test@test.com',
        password: 'password123',
        name: 'Test',
      });

      expect(result).toEqual({
        id: 'user_123',
        email: 'test@test.com',
        name: 'Test',
      });
    });
  });

  describe('getProfile', () => {
    it('should return user when provided', () => {
      const mockUser = { clerkId: 'clerk_123', email: 'test@test.com', role: 'CUSTOMER' };

      const result = controller.getProfile(mockUser);
      expect(result).toEqual(mockUser);
    });
  });
});
