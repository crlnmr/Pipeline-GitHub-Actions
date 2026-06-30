import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/client';
import { PrismaService } from '../../../core/database/prisma.service';
import { AuditService } from '../../../core/audit/audit.service';
import { CategoriesService } from '../services/categories.service';

const mockPrisma = {
  category: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    count: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  product: {
    count: jest.fn(),
  },
};

const mockAuditService = {
  log: jest.fn(),
};

describe('CategoriesService', () => {
  let service: CategoriesService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriesService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: AuditService, useValue: mockAuditService },
      ],
    }).compile();

    service = module.get<CategoriesService>(CategoriesService);
  });

  describe('create', () => {
    it('should create a category with valid name', async () => {
      mockPrisma.category.create.mockResolvedValue({ id: '1', name: 'Bebidas', active: true });

      const result = await service.create({ name: 'Bebidas' });

      expect(result).toEqual({ id: '1', name: 'Bebidas', active: true });
      expect(mockPrisma.category.create).toHaveBeenCalledWith({ data: { name: 'Bebidas' } });
    });

    it('should throw ConflictException for duplicate name', async () => {
      const prismaError = new PrismaClientKnownRequestError('Unique constraint failed', { code: 'P2002', clientVersion: '7.0.0' });
      mockPrisma.category.create.mockRejectedValue(prismaError);

      await expect(service.create({ name: 'Bebidas' })).rejects.toThrow(ConflictException);
    });

    it('should rethrow non-P2002 Prisma errors', async () => {
      const prismaError = new PrismaClientKnownRequestError('Connection failed', { code: 'P1000', clientVersion: '7.0.0' });
      mockPrisma.category.create.mockRejectedValue(prismaError);

      await expect(service.create({ name: 'Bebidas' })).rejects.toThrow(PrismaClientKnownRequestError);
    });
  });

  describe('findAll', () => {
    it('should return paginated categories for public (active only)', async () => {
      mockPrisma.category.findMany.mockResolvedValue([
        { id: '1', name: 'Bebidas', active: true },
      ]);
      mockPrisma.category.count.mockResolvedValue(1);

      const result = await service.findAll({ page: 1, limit: 10 }, false);

      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
      expect(mockPrisma.category.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { active: true },
          skip: 0,
          take: 10,
        }),
      );
    });

    it('should return all categories for admin', async () => {
      mockPrisma.category.findMany.mockResolvedValue([
        { id: '1', name: 'Bebidas', active: true },
        { id: '2', name: 'Inativas', active: false },
      ]);
      mockPrisma.category.count.mockResolvedValue(2);

      const result = await service.findAll({ page: 1, limit: 10 }, true);

      expect(result.data).toHaveLength(2);
      expect(mockPrisma.category.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {},
          skip: 0,
          take: 10,
        }),
      );
    });

    it('should filter by search term', async () => {
      mockPrisma.category.findMany.mockResolvedValue([]);
      mockPrisma.category.count.mockResolvedValue(0);

      await service.findAll({ search: 'beb' }, false);

      expect(mockPrisma.category.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            active: true,
            name: { contains: 'beb', mode: 'insensitive' },
          },
        }),
      );
    });

    it('should apply sort parameter', async () => {
      mockPrisma.category.findMany.mockResolvedValue([]);
      mockPrisma.category.count.mockResolvedValue(0);

      await service.findAll({ sort: 'name', order: 'desc' }, false);

      expect(mockPrisma.category.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { name: 'desc' },
        }),
      );
    });
  });

  describe('findById', () => {
    it('should return category when found', async () => {
      mockPrisma.category.findUnique.mockResolvedValue({ id: '1', name: 'Bebidas', active: true });

      const result = await service.findById('1');

      expect(result).toEqual({ id: '1', name: 'Bebidas', active: true });
    });

    it('should throw NotFoundException when not found', async () => {
      mockPrisma.category.findUnique.mockResolvedValue(null);

      await expect(service.findById('999')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update category name', async () => {
      mockPrisma.category.findUnique
        .mockResolvedValueOnce({ id: '1', name: 'Bebidas', active: true })
        .mockResolvedValueOnce({ id: '1', name: 'Bebidas', active: true });
      mockPrisma.category.update.mockResolvedValue({ id: '1', name: 'Bebidas Geladas', active: true });

      const result = await service.update('1', { name: 'Bebidas Geladas' });

      expect(result.name).toBe('Bebidas Geladas');
      expect(mockAuditService.log).toHaveBeenCalledWith(
        expect.objectContaining({ acao: 'category.name.updated' }),
      );
    });

    it('should throw NotFoundException when category does not exist', async () => {
      mockPrisma.category.findUnique.mockResolvedValue(null);

      await expect(service.update('999', { name: 'Test' })).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException on duplicate name during update', async () => {
      mockPrisma.category.findUnique
        .mockResolvedValueOnce({ id: '1', name: 'Bebidas', active: true })
        .mockResolvedValueOnce({ id: '1', name: 'Bebidas', active: true });

      const prismaError = new PrismaClientKnownRequestError('Unique constraint failed', { code: 'P2002', clientVersion: '7.0.0' });
      mockPrisma.category.update.mockRejectedValue(prismaError);

      await expect(service.update('1', { name: 'Duplicated' })).rejects.toThrow(ConflictException);
    });
  });

  describe('remove', () => {
    it('should remove category without products', async () => {
      mockPrisma.category.findUnique.mockResolvedValue({ id: '1', name: 'Bebidas', active: true });
      mockPrisma.product.count.mockResolvedValue(0);
      mockPrisma.category.delete.mockResolvedValue({ id: '1' });

      await service.remove('1');

      expect(mockPrisma.category.delete).toHaveBeenCalledWith({ where: { id: '1' } });
    });

    it('should throw ConflictException when category has active products', async () => {
      mockPrisma.category.findUnique.mockResolvedValue({ id: '1', name: 'Bebidas', active: true });
      mockPrisma.product.count.mockResolvedValue(5);

      await expect(service.remove('1')).rejects.toThrow(ConflictException);
    });
  });
});
