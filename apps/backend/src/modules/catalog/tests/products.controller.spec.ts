import { Test, TestingModule } from '@nestjs/testing';
import { ProductsController } from '../controllers/products.controller';
import { ProductsService } from '../services/products.service';

const mockProductsService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findById: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

describe('ProductsController', () => {
  let controller: ProductsController;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [
        { provide: ProductsService, useValue: mockProductsService },
      ],
    }).compile();

    controller = module.get<ProductsController>(ProductsController);
  });

  describe('create', () => {
    it('should call service.create and return 201', async () => {
      const dto = { name: 'Coca-Cola', categoryId: 'cat-1', price: 5.5 };
      mockProductsService.create.mockResolvedValue({ id: '1', name: 'Coca-Cola' });

      const result = await controller.create(dto);

      expect(result).toEqual({ id: '1', name: 'Coca-Cola' });
      expect(mockProductsService.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('findAll', () => {
    it('should return products (public - no auth)', async () => {
      const query = { page: 1, limit: 10 };
      const mockReq = { user: undefined };
      mockProductsService.findAll.mockResolvedValue({ data: [], meta: { page: 1, limit: 10, total: 0, totalPages: 0 } });

      await controller.findAll(query as any, mockReq as any);

      expect(mockProductsService.findAll).toHaveBeenCalledWith(query, false);
    });

    it('should return all products for admin', async () => {
      const query = { page: 1, limit: 10 };
      const mockReq = { user: { role: 'ADMIN' } };

      await controller.findAll(query as any, mockReq as any);

      expect(mockProductsService.findAll).toHaveBeenCalledWith(query, true);
    });
  });

  describe('findById', () => {
    it('should return product by id', async () => {
      mockProductsService.findById.mockResolvedValue({ id: '1', name: 'Coca-Cola' });

      const result = await controller.findById('1', { user: undefined } as any);

      expect(result).toEqual({ id: '1', name: 'Coca-Cola' });
    });
  });

  describe('update', () => {
    it('should call service.update', async () => {
      const dto = { price: 6.0 };
      mockProductsService.update.mockResolvedValue({ id: '1', price: 6.0 });

      const result = await controller.update('1', dto);

      expect(result).toEqual({ id: '1', price: 6.0 });
      expect(mockProductsService.update).toHaveBeenCalledWith('1', dto);
    });
  });

  describe('remove', () => {
    it('should call service.remove', async () => {
      mockProductsService.remove.mockResolvedValue(undefined);

      await controller.remove('1');

      expect(mockProductsService.remove).toHaveBeenCalledWith('1');
    });
  });
});
