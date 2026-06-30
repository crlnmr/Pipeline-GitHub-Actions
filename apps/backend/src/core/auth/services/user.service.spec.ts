import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { PrismaService } from '../../database/prisma.service';

describe('UserService', () => {
  let service: UserService;

  const mockPrisma = {
    user: {
      upsert: jest.fn(),
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('upsertByClerkId', () => {
    it('should call prisma.user.upsert with correct data', async () => {
      mockPrisma.user.upsert.mockResolvedValue({ id: 'uuid', clerkId: 'clerk_123' });

      const result = await service.upsertByClerkId('clerk_123', {
        email: 'test@test.com',
        name: 'Test',
        role: 'CUSTOMER',
      });

      expect(mockPrisma.user.upsert).toHaveBeenCalledWith({
        where: { clerkId: 'clerk_123' },
        create: { clerkId: 'clerk_123', email: 'test@test.com', name: 'Test', role: 'CUSTOMER' },
        update: { email: 'test@test.com', name: 'Test', role: 'CUSTOMER' },
      });
      expect(result).toEqual({ id: 'uuid', clerkId: 'clerk_123' });
    });

    it('should default role to CUSTOMER when not provided', async () => {
      mockPrisma.user.upsert.mockResolvedValue({ id: 'uuid', clerkId: 'clerk_456' });

      await service.upsertByClerkId('clerk_456', {
        email: 'test@test.com',
      });

      expect(mockPrisma.user.upsert).toHaveBeenCalledWith({
        where: { clerkId: 'clerk_456' },
        create: { clerkId: 'clerk_456', email: 'test@test.com', name: null, role: 'CUSTOMER' },
        update: { email: 'test@test.com', name: null, role: 'CUSTOMER' },
      });
    });

    it('should default name to null when not provided', async () => {
      mockPrisma.user.upsert.mockResolvedValue({ id: 'uuid', clerkId: 'clerk_789' });

      await service.upsertByClerkId('clerk_789', {
        email: 'test@test.com',
        role: 'ADMIN',
      });

      expect(mockPrisma.user.upsert).toHaveBeenCalledWith({
        where: { clerkId: 'clerk_789' },
        create: { clerkId: 'clerk_789', email: 'test@test.com', name: null, role: 'ADMIN' },
        update: { email: 'test@test.com', name: null, role: 'ADMIN' },
      });
    });
  });

  describe('findByClerkId', () => {
    it('should call prisma.user.findUnique with clerkId', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'uuid', clerkId: 'clerk_123' });

      const result = await service.findByClerkId('clerk_123');

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({ where: { clerkId: 'clerk_123' } });
      expect(result).toEqual({ id: 'uuid', clerkId: 'clerk_123' });
    });
  });
});
