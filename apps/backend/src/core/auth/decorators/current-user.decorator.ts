import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';

export interface AuthenticatedUser {
  clerkId: string;
  email: string;
  name?: string;
  role: string;
}

export const CurrentUser = createParamDecorator<keyof AuthenticatedUser | undefined, AuthenticatedUser | string | undefined>(
  (data, ctx) => {
    const request = ctx.switchToHttp().getRequest<Request & { user?: AuthenticatedUser }>();
    const user = request.user;
    if (!user) return undefined;
    return data ? user[data] : user;
  },
);
