import { Test, TestingModule } from '@nestjs/testing';
import { AuditService } from './audit.service';
import { PrismaService } from '../database/prisma.service';

const mockPrisma = {
  auditLog: {
    create: jest.fn(),
  },
};

describe('AuditService', () => {
  let service: AuditService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<AuditService>(AuditService);
  });

  it('should create audit log entry', async () => {
    const params = {
      usuario: 'user-123',
      objeto: 'Product:1',
      acao: 'product.price.updated',
      payload: { oldPrice: 5.0, newPrice: 6.0 },
    };

    mockPrisma.auditLog.create.mockResolvedValue({
      id: 'audit-1',
      ...params,
      timestamp: new Date(),
    });

    const result = await service.log(params);

    expect(result.id).toBe('audit-1');
    expect(mockPrisma.auditLog.create).toHaveBeenCalledWith({
      data: params,
    });
  });

  it('should create audit log without payload', async () => {
    const params = {
      usuario: 'user-123',
      objeto: 'Category:1',
      acao: 'category.name.updated',
    };

    mockPrisma.auditLog.create.mockResolvedValue({
      id: 'audit-2',
      ...params,
      payload: null,
      timestamp: new Date(),
    });

    const result = await service.log(params);

    expect(result.id).toBe('audit-2');
  });
});
