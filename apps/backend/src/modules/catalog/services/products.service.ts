import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../core/database/prisma.service';
import { AuditService } from '../../../core/audit/audit.service';
import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';
import { CatalogQueryDto } from '../dto/catalog-query.dto';

@Injectable()
export class ProductsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async create(dto: CreateProductDto) {
    const category = await this.prisma.category.findUnique({
      where: { id: dto.categoryId },
    });

    if (!category) {
      throw new NotFoundException({
        type: 'about:blank',
        title: 'Not Found',
        status: 404,
        detail: 'Category not found',
        instance: '/v1/products',
      });
    }

    return this.prisma.product.create({
      data: {
        name: dto.name,
        categoryId: dto.categoryId,
        imageUrl: dto.imageUrl ?? null,
        description: dto.description ?? null,
        price: dto.price,
        stock: dto.stock ?? 0,
      },
    });
  }

  async findAll(query: CatalogQueryDto, isAdmin = false) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (!isAdmin) {
      where.active = true;
    }

    if (query.search) {
      where.name = { contains: query.search, mode: 'insensitive' };
    }

    if (query.categoryId) {
      where.categoryId = query.categoryId;
    }

    const orderBy: Record<string, string> = {};
    if (query.sort) {
      orderBy[query.sort] = query.order ?? 'asc';
    } else {
      orderBy.name = 'asc';
    }

    const [data, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: { category: true },
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: { category: true },
    });

    if (!product) {
      throw new NotFoundException({
        type: 'about:blank',
        title: 'Not Found',
        status: 404,
        detail: 'Product not found',
        instance: `/v1/products/${id}`,
      });
    }

    return product;
  }

  async update(id: string, dto: UpdateProductDto) {
    const product = await this.prisma.product.findUnique({ where: { id } });

    if (!product) {
      throw new NotFoundException({
        type: 'about:blank',
        title: 'Not Found',
        status: 404,
        detail: 'Product not found',
        instance: `/v1/products/${id}`,
      });
    }

    if (dto.price !== undefined && dto.price !== Number(product.price)) {
      await this.auditService.log({
        usuario: 'system',
        objeto: `Product:${id}`,
        acao: 'product.price.updated',
        payload: { oldPrice: Number(product.price), newPrice: dto.price },
      });
    }

    if (dto.stock !== undefined && dto.stock !== product.stock) {
      await this.auditService.log({
        usuario: 'system',
        objeto: `Product:${id}`,
        acao: 'product.stock.updated',
        payload: { oldStock: product.stock, newStock: dto.stock },
      });
    }

    if (dto.categoryId) {
      const category = await this.prisma.category.findUnique({
        where: { id: dto.categoryId },
      });
      if (!category) {
        throw new NotFoundException({
          type: 'about:blank',
          title: 'Not Found',
          status: 404,
          detail: 'Category not found',
          instance: `/v1/products/${id}`,
        });
      }
    }

    return this.prisma.product.update({
      where: { id },
      data: dto,
      include: { category: true },
    });
  }

  async remove(id: string) {
    const product = await this.prisma.product.findUnique({ where: { id } });

    if (!product) {
      throw new NotFoundException({
        type: 'about:blank',
        title: 'Not Found',
        status: 404,
        detail: 'Product not found',
        instance: `/v1/products/${id}`,
      });
    }

    await this.prisma.product.delete({ where: { id } });
  }
}
