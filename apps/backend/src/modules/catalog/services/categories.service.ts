import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../core/database/prisma.service';
import { AuditService } from '../../../core/audit/audit.service';
import { CreateCategoryDto } from '../dto/create-category.dto';
import { UpdateCategoryDto } from '../dto/update-category.dto';
import { CatalogQueryDto } from '../dto/catalog-query.dto';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/client';

@Injectable()
export class CategoriesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async create(dto: CreateCategoryDto) {
    try {
      return await this.prisma.category.create({
        data: { name: dto.name },
      });
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException({
          type: 'about:blank',
          title: 'Conflict',
          status: 409,
          detail: 'Category name already exists',
        });
      }
      throw error;
    }
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

    const orderBy: Record<string, string> = {};
    if (query.sort) {
      orderBy[query.sort] = query.order ?? 'asc';
    } else {
      orderBy.name = 'asc';
    }

    const [data, total] = await Promise.all([
      this.prisma.category.findMany({
        where,
        orderBy,
        skip,
        take: limit,
      }),
      this.prisma.category.count({ where }),
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
    const category = await this.prisma.category.findUnique({ where: { id } });
    if (!category) {
      throw new NotFoundException({
        type: 'about:blank',
        title: 'Not Found',
        status: 404,
        detail: 'Category not found',
        instance: `/v1/categories/${id}`,
      });
    }
    return category;
  }

  async update(id: string, dto: UpdateCategoryDto) {
    await this.findById(id);

    const old = await this.prisma.category.findUnique({ where: { id } });
    if (dto.name && old && dto.name !== old.name) {
      await this.auditService.log({
        usuario: 'system',
        objeto: `Category:${id}`,
        acao: 'category.name.updated',
        payload: { oldName: old.name, newName: dto.name },
      });
    }

    try {
      return await this.prisma.category.update({
        where: { id },
        data: dto,
      });
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException({
          type: 'about:blank',
          title: 'Conflict',
          status: 409,
          detail: 'Category name already exists',
        });
      }
      throw error;
    }
  }

  async remove(id: string) {
    await this.findById(id);

    const activeProducts = await this.prisma.product.count({
      where: { categoryId: id, active: true },
    });

    if (activeProducts > 0) {
      throw new ConflictException({
        type: 'about:blank',
        title: 'Conflict',
        status: 409,
        detail: 'Cannot delete category with active products',
      });
    }

    await this.prisma.category.delete({ where: { id } });
  }
}
