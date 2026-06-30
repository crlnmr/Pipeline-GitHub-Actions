import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthService } from '../auth.service';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { OPTIONAL_AUTH_KEY } from '../decorators/optional-auth.decorator';
import type { Request } from 'express';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly authService: AuthService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const isOptional = this.reflector.getAllAndOverride<boolean>(OPTIONAL_AUTH_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractToken(request);

    if (!token) {
      if (isOptional) return true;
      throw new UnauthorizedException({
        type: 'about:blank',
        title: 'Unauthorized',
        status: 401,
        detail: 'Token de autenticação não fornecido',
        instance: request.url,
      });
    }

    try {
      const user = await this.authService.validateToken(token);
      (request as Request & { user: unknown }).user = user;
      return true;
    } catch {
      if (isOptional) return true;
      throw new UnauthorizedException({
        type: 'about:blank',
        title: 'Unauthorized',
        status: 401,
        detail: 'Token inválido ou expirado',
        instance: request.url,
      });
    }
  }

  private extractToken(request: Request): string | null {
    const cookie = request.headers.cookie;
    if (cookie) {
      const match = cookie.match(/__session=([^;]+)/);
      if (match) return match[1];
    }
    const authHeader = request.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      return authHeader.slice(7);
    }
    return null;
  }
}
