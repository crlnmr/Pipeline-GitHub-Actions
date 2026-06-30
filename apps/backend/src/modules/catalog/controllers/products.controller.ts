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
import { ProductsService } from '../services/products.service';
import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';
import { CatalogQueryDto } from '../dto/catalog-query.dto';
import { Roles } from '../../../core/auth/decorators/roles.decorator';
import { OptionalAuth } from '../../../core/auth/decorators/optional-auth.decorator';
import type { Request } from 'express';

@ApiTags('products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @Roles('ADMIN')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new product (ADMIN only)' })
  @ApiResponse({ status: 201, description: 'Product created' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  async create(@Body() dto: CreateProductDto) {
    return this.productsService.create(dto);
  }

  @Get()
  @OptionalAuth()
  @ApiOperation({ summary: 'List products (public: active only, admin: all)' })
  @ApiResponse({ status: 200, description: 'Paginated list of products' })
  async findAll(@Query() query: CatalogQueryDto, @Req() req: Request) {
    const user = (req as Request & { user?: { role?: string } }).user;
    const isAdmin = user?.role === 'ADMIN';
    return this.productsService.findAll(query, isAdmin);
  }

  @Get(':id')
  @OptionalAuth()
  @ApiOperation({ summary: 'Get product by ID' })
  @ApiResponse({ status: 200, description: 'Product found' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async findById(@Param('id') id: string, @Req() _req: Request) {
    return this.productsService.findById(id);
  }

  @Patch(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Update product (ADMIN only)' })
  @ApiResponse({ status: 200, description: 'Product updated' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.productsService.update(id, dto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete product (ADMIN only)' })
  @ApiResponse({ status: 204, description: 'Product deleted' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async remove(@Param('id') id: string) {
    await this.productsService.remove(id);
  }
}
