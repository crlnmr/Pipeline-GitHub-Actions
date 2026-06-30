import {
  Injectable,
  type CallHandler,
  type ExecutionContext,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, tap } from 'rxjs';
import { AuditService } from './audit.service';
import { AUDIT_KEY } from './decorators/audit.decorator';
import type { Request } from 'express';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(
    private readonly reflector: Reflector,
    private readonly auditService: AuditService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const auditMeta = this.reflector.getAllAndOverride<{
      action: string;
      resource: string;
    }>(AUDIT_KEY, [context.getHandler(), context.getClass()]);

    if (!auditMeta) return next.handle();

    const request = context.switchToHttp().getRequest<Request>();
    const user = (request as Request & { user?: { clerkId?: string; email?: string } }).user;

    return next.handle().pipe(
      tap(() => {
        const resourceId =
          request.params.id || (request.body as Record<string, string>)?.id || 'unknown';

        this.auditService.log({
          usuario: user?.clerkId || user?.email || 'anonymous',
          objeto: `${auditMeta.resource}:${resourceId}`,
          acao: auditMeta.action,
          payload: {
            method: request.method,
            path: request.url,
            body: request.body,
          },
        });
      }),
    );
  }
}
