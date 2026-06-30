import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CategoriesService } from '../services/categories.service';
import { CreateCategoryDto } from '../dto/create-category.dto';
import { UpdateCategoryDto } from '../dto/update-category.dto';
import { CatalogQueryDto } from '../dto/catalog-query.dto';
import { Roles } from '../../../core/auth/decorators/roles.decorator';
import { OptionalAuth } from '../../../core/auth/decorators/optional-auth.decorator';
import type { Request } from 'express';

@ApiTags('categories')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @Roles('ADMIN')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new category (ADMIN only)' })
  @ApiResponse({ status: 201, description: 'Category created' })
  @ApiResponse({ status: 409, description: 'Category name already exists' })
  async create(@Body() dto: CreateCategoryDto) {
    return this.categoriesService.create(dto);
  }

  @Get()
  @OptionalAuth()
  @ApiOperation({ summary: 'List categories (public: active only, admin: all)' })
  @ApiResponse({ status: 200, description: 'Paginated list of categories' })
  async findAll(@Query() query: CatalogQueryDto, @Req() req: Request) {
    const user = (req as Request & { user?: { role?: string } }).user;
    const isAdmin = user?.role === 'ADMIN';
    return this.categoriesService.findAll(query, isAdmin);
  }

  @Get(':id')
  @OptionalAuth()
  @ApiOperation({ summary: 'Get category by ID' })
  @ApiResponse({ status: 200, description: 'Category found' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  async findById(@Param('id') id: string, @Req() _req: Request) {
    return this.categoriesService.findById(id);
  }

  @Patch(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Update category (ADMIN only)' })
  @ApiResponse({ status: 200, description: 'Category updated' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  async update(@Param('id') id: string, @Body() dto: UpdateCategoryDto) {
    return this.categoriesService.update(id, dto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete category (ADMIN only)' })
  @ApiResponse({ status: 204, description: 'Category deleted' })
  @ApiResponse({ status: 409, description: 'Category has active products' })
  async remove(@Param('id') id: string) {
    await this.categoriesService.remove(id);
  }
}
