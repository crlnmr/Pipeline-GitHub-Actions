import { Module } from '@nestjs/common';
import { HealthModule } from './health/health.module';
import { DatabaseModule } from './core/database/database.module';
import { AuthModule } from './core/auth/auth.module';
import { AuditModule } from './core/audit/audit.module';
import { CatalogModule } from './modules/catalog/catalog.module';

@Module({
  imports: [HealthModule, DatabaseModule, AuthModule, AuditModule, CatalogModule],
})
export class AppModule {}
