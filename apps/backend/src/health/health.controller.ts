import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { PrismaService } from '../core/database/prisma.service';
import { Public } from '../core/auth/decorators/public.decorator';

@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Public()
  @Get()
  async check() {
    const dbConnected = await this.prisma.isConnected();
    if (!dbConnected) {
      throw new ServiceUnavailableException({ status: 'error' });
    }
    return { status: 'ok' };
  }
}
