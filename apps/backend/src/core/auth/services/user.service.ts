import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async upsertByClerkId(clerkId: string, data: { email: string; name?: string; role?: string }) {
    return this.prisma.user.upsert({
      where: { clerkId },
      create: {
        clerkId,
        email: data.email,
        name: data.name ?? null,
        role: (data.role as 'ADMIN' | 'CUSTOMER') ?? 'CUSTOMER',
      },
      update: {
        email: data.email,
        name: data.name ?? null,
        role: (data.role as 'ADMIN' | 'CUSTOMER') ?? 'CUSTOMER',
      },
    });
  }

  async findByClerkId(clerkId: string) {
    return this.prisma.user.findUnique({ where: { clerkId } });
  }

  async findById(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }
}
