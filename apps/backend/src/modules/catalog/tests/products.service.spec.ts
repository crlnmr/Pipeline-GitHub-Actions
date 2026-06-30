import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../../core/database/prisma.service';
import { AuditService } from '../../../core/audit/audit.service';
import { ProductsService } from '../services/products.service';

const mockPrisma = {
  category: {
    findUnique: jest.fn(),
  },
  product: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    count: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

const mockAuditService = {
  log: jest.fn(),
};

describe('ProductsService', () => {
  let service: ProductsService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: AuditService, useValue: mockAuditService },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
  });

  describe('create', () => {
    it('should create a product with valid data', async () => {
      mockPrisma.category.findUnique.mockResolvedValue({ id: 'cat-1', name: 'Bebidas' });
      mockPrisma.product.create.mockResolvedValue({
        id: 'prod-1',
        name: 'Coca-Cola 350ml',
        categoryId: 'cat-1',
        price: 5.5,
        stock: 100,
        active: true,
      });

      const result = await service.create({
        name: 'Coca-Cola 350ml',
        categoryId: 'cat-1',
        price: 5.5,
        stock: 100,
      });

      expect(result.name).toBe('Coca-Cola 350ml');
      expect(mockPrisma.product.create).toHaveBeenCalled();
    });

    it('should throw NotFoundException when category does not exist', async () => {
      mockPrisma.category.findUnique.mockResolvedValue(null);

      await expect(
        service.create({ name: 'Test', categoryId: 'invalid', price: 10 }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('should return only active products for public', async () => {
      mockPrisma.product.findMany.mockResolvedValue([
        { id: '1', name: 'Coca', active: true, category: { id: 'cat-1', name: 'Bebidas' } },
      ]);
      mockPrisma.product.count.mockResolvedValue(1);

      const result = await service.findAll({ page: 1, limit: 10 }, false);

      expect(result.data).toHaveLength(1);
      expect(mockPrisma.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { active: true },
        }),
      );
    });

    it('should return all products for admin', async () => {
      mockPrisma.product.findMany.mockResolvedValue([]);
      mockPrisma.product.count.mockResolvedValue(0);

      await service.findAll({ page: 1, limit: 10 }, true);

      expect(mockPrisma.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: {} }),
      );
    });

    it('should filter by categoryId', async () => {
      mockPrisma.product.findMany.mockResolvedValue([]);
      mockPrisma.product.count.mockResolvedValue(0);

      await service.findAll({ categoryId: 'cat-1' }, false);

      expect(mockPrisma.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { active: true, categoryId: 'cat-1' },
        }),
      );
    });

    it('should filter by search term', async () => {
      mockPrisma.product.findMany.mockResolvedValue([]);
      mockPrisma.product.count.mockResolvedValue(0);

      await service.findAll({ search: 'coca' }, false);

      expect(mockPrisma.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            active: true,
            name: { contains: 'coca', mode: 'insensitive' },
          },
        }),
      );
    });

    it('should apply sort parameter', async () => {
      mockPrisma.product.findMany.mockResolvedValue([]);
      mockPrisma.product.count.mockResolvedValue(0);

      await service.findAll({ sort: 'price', order: 'desc' }, false);

      expect(mockPrisma.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { price: 'desc' },
        }),
      );
    });
  });

  describe('findById', () => {
    it('should return product when found', async () => {
      mockPrisma.product.findUnique.mockResolvedValue({
        id: '1',
        name: 'Coca',
        category: { id: 'cat-1', name: 'Bebidas' },
      });

      const result = await service.findById('1');

      expect(result.name).toBe('Coca');
    });

    it('should throw NotFoundException when not found', async () => {
      mockPrisma.product.findUnique.mockResolvedValue(null);

      await expect(service.findById('999')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update product and audit price change', async () => {
      mockPrisma.product.findUnique.mockResolvedValue({
        id: '1',
        name: 'Coca',
        price: 5.0,
        stock: 10,
        categoryId: 'cat-1',
      });
      mockPrisma.product.update.mockResolvedValue({
        id: '1',
        name: 'Coca',
        price: 6.0,
        stock: 10,
        category: { id: 'cat-1', name: 'Bebidas' },
      });

      await service.update('1', { price: 6.0 });

      expect(mockAuditService.log).toHaveBeenCalledWith(
        expect.objectContaining({ acao: 'product.price.updated' }),
      );
    });

    it('should throw NotFoundException when product does not exist', async () => {
      mockPrisma.product.findUnique.mockResolvedValue(null);

      await expect(service.update('999', { name: 'Test' })).rejects.toThrow(NotFoundException);
    });

    it('should audit stock change on update', async () => {
      mockPrisma.product.findUnique.mockResolvedValue({
        id: '1', name: 'Coca', price: 5.0, stock: 10, categoryId: 'cat-1',
      });
      mockPrisma.product.update.mockResolvedValue({
        id: '1', name: 'Coca', price: 5.0, stock: 20, category: {},
      });

      await service.update('1', { stock: 20 });

      expect(mockAuditService.log).toHaveBeenCalledWith(
        expect.objectContaining({ acao: 'product.stock.updated' }),
      );
    });

    it('should validate category on update when categoryId changes', async () => {
      mockPrisma.product.findUnique.mockResolvedValue({
        id: '1', name: 'Coca', price: 5.0, stock: 10, categoryId: 'cat-1',
      });
      mockPrisma.category.findUnique.mockResolvedValue({ id: 'cat-2', name: 'Nova Cat' });
      mockPrisma.product.update.mockResolvedValue({
        id: '1', name: 'Coca', price: 5.0, stock: 10, category: {},
      });

      await service.update('1', { categoryId: 'cat-2' });

      expect(mockPrisma.category.findUnique).toHaveBeenCalledWith({ where: { id: 'cat-2' } });
    });

    it('should throw NotFoundException when new category does not exist', async () => {
      mockPrisma.product.findUnique.mockResolvedValue({
        id: '1', name: 'Coca', price: 5.0, stock: 10, categoryId: 'cat-1',
      });
      mockPrisma.category.findUnique.mockResolvedValue(null);

      await expect(service.update('1', { categoryId: 'invalid' })).rejects.toThrow(NotFoundException);
    });

    it('should not audit when price and stock remain unchanged', async () => {
      mockPrisma.product.findUnique.mockResolvedValue({
        id: '1', name: 'Coca', price: 5.0, stock: 10, categoryId: 'cat-1',
      });
      mockPrisma.product.update.mockResolvedValue({
        id: '1', name: 'Coca Updated', price: 5.0, stock: 10, category: {},
      });

      await service.update('1', { name: 'Coca Updated' });

      expect(mockAuditService.log).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should remove existing product', async () => {
      mockPrisma.product.findUnique.mockResolvedValue({ id: '1', name: 'Coca' });
      mockPrisma.product.delete.mockResolvedValue({ id: '1' });

      await service.remove('1');

      expect(mockPrisma.product.delete).toHaveBeenCalledWith({ where: { id: '1' } });
    });

    it('should throw NotFoundException when product does not exist', async () => {
      mockPrisma.product.findUnique.mockResolvedValue(null);

      await expect(service.remove('999')).rejects.toThrow(NotFoundException);
    });
  });
});
