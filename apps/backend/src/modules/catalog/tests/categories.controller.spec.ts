import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesController } from '../controllers/categories.controller';
import { CategoriesService } from '../services/categories.service';

const mockCategoriesService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findById: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

describe('CategoriesController', () => {
  let controller: CategoriesController;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoriesController],
      providers: [
        { provide: CategoriesService, useValue: mockCategoriesService },
      ],
    }).compile();

    controller = module.get<CategoriesController>(CategoriesController);
  });

  describe('create', () => {
    it('should call service.create and return 201', async () => {
      const dto = { name: 'Bebidas' };
      mockCategoriesService.create.mockResolvedValue({ id: '1', name: 'Bebidas' });

      const result = await controller.create(dto);

      expect(result).toEqual({ id: '1', name: 'Bebidas' });
      expect(mockCategoriesService.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('findAll', () => {
    it('should return categories (public - no auth)', async () => {
      const query = { page: 1, limit: 10 };
      const mockReq = { user: undefined };
      mockCategoriesService.findAll.mockResolvedValue({ data: [], meta: { page: 1, limit: 10, total: 0, totalPages: 0 } });

      await controller.findAll(query as any, mockReq as any);

      expect(mockCategoriesService.findAll).toHaveBeenCalledWith(query, false);
    });

    it('should return all categories for admin', async () => {
      const query = { page: 1, limit: 10 };
      const mockReq = { user: { role: 'ADMIN' } };
      mockCategoriesService.findAll.mockResolvedValue({ data: [], meta: { page: 1, limit: 10, total: 0, totalPages: 0 } });

      await controller.findAll(query as any, mockReq as any);

      expect(mockCategoriesService.findAll).toHaveBeenCalledWith(query, true);
    });
  });

  describe('findById', () => {
    it('should return category by id', async () => {
      mockCategoriesService.findById.mockResolvedValue({ id: '1', name: 'Bebidas' });

      const result = await controller.findById('1', { user: undefined } as any);

      expect(result).toEqual({ id: '1', name: 'Bebidas' });
    });
  });

  describe('update', () => {
    it('should call service.update', async () => {
      const dto = { name: 'Bebidas Geladas' };
      mockCategoriesService.update.mockResolvedValue({ id: '1', name: 'Bebidas Geladas' });

      const result = await controller.update('1', dto);

      expect(result).toEqual({ id: '1', name: 'Bebidas Geladas' });
      expect(mockCategoriesService.update).toHaveBeenCalledWith('1', dto);
    });
  });

  describe('remove', () => {
    it('should call service.remove', async () => {
      mockCategoriesService.remove.mockResolvedValue(undefined);

      await controller.remove('1');

      expect(mockCategoriesService.remove).toHaveBeenCalledWith('1');
    });
  });
});
