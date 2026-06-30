import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import type { Prisma } from '../../../generated/client';

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  async log(params: {
    usuario: string;
    objeto: string;
    acao: string;
    payload?: Record<string, unknown>;
  }) {
    return this.prisma.auditLog.create({
      data: {
        usuario: params.usuario,
        objeto: params.objeto,
        acao: params.acao,
        payload: params.payload as Prisma.InputJsonValue,
      },
    });
  }
}
