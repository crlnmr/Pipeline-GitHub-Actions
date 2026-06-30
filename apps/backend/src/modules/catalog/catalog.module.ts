import { Module } from '@nestjs/common';
import { AuditModule } from '../../core/audit/audit.module';
import { CategoriesService } from './services/categories.service';
import { ProductsService } from './services/products.service';
import { CategoriesController } from './controllers/categories.controller';
import { ProductsController } from './controllers/products.controller';

@Module({
  imports: [AuditModule],
  controllers: [CategoriesController, ProductsController],
  providers: [CategoriesService, ProductsService],
})
export class CatalogModule {}
