import { Injectable, Logger, OnModuleInit, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

interface ClerkClient {
  signIn: (params: { identifier: string; password: string }) => Promise<{ session: { id: string } }>;
  signUp: (params: { emailAddress: string; password: string; firstName?: string }) => Promise<{ id: string; emailAddress: string; firstName?: string }>;
  verifyToken: (token: string) => Promise<{ sub: string }>;
  users: {
    getUser: (userId: string) => Promise<{ id: string; emailAddresses: Array<{ emailAddress: string }>; firstName?: string; publicMetadata?: Record<string, unknown> }>;
    updateUser: (userId: string, params: { publicMetadata?: Record<string, unknown> }) => Promise<void>;
  };
}

@Injectable()
export class AuthService implements OnModuleInit {
  private readonly logger = new Logger(AuthService.name);
  private clerk!: ClerkClient;

  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    const secretKey = process.env.CLERK_SECRET_KEY;
    if (!secretKey) {
      this.logger.error('CLERK_SECRET_KEY is not configured. Auth module will not work.');
      return;
    }
    this.clerk = this.createClerkClient(secretKey);
  }

  private createClerkClient(secretKey: string): ClerkClient {
    const baseUrl = 'https://api.clerk.com/v1';

    async function clerkFetch(path: string, options?: RequestInit) {
      const res = await fetch(`${baseUrl}${path}`, {
        ...options,
        headers: {
          'Authorization': `Bearer ${secretKey}`,
          'Content-Type': 'application/json',
          ...options?.headers,
        },
      });
      if (!res.ok) {
        const body = await res.text();
        throw new Error(`Clerk API error ${res.status}: ${body}`);
      }
      return res.json();
    }

    return {
      signIn: async (params) => {
        const signInAttempt = await clerkFetch('/sign_attempts', {
          method: 'POST',
          body: JSON.stringify({
            identifier: params.identifier,
            password: params.password,
            strategy: 'password',
          }),
        });
        return { session: { id: signInAttempt.session_id } };
      },

      signUp: async (params) => {
        const user = await clerkFetch('/users', {
          method: 'POST',
          body: JSON.stringify({
            email_address: [params.emailAddress],
            password: params.password,
            first_name: params.firstName,
          }),
        });
        return { id: user.id, emailAddress: user.email_addresses[0]?.email_address ?? params.emailAddress, firstName: user.first_name };
      },

      verifyToken: async (token: string) => {
        const result = await clerkFetch('/jwt/verify', {
          method: 'POST',
          body: JSON.stringify({ token }),
        });
        return { sub: result.sub };
      },

      users: {
        getUser: async (userId: string) => {
          const user = await clerkFetch(`/users/${userId}`);
          return {
            id: user.id,
            emailAddresses: user.email_addresses.map((e: { email_address: string }) => ({ emailAddress: e.email_address })),
            firstName: user.first_name,
            publicMetadata: user.public_metadata,
          };
        },
        updateUser: async (userId: string, params) => {
          await clerkFetch(`/users/${userId}`, {
            method: 'PATCH',
            body: JSON.stringify({ public_metadata: params.publicMetadata }),
          });
        },
      },
    };
  }

  async signIn(email: string, password: string) {
    if (!this.clerk) {
      throw new UnauthorizedException('Authentication service is not configured');
    }
    try {
      const result = await this.clerk.signIn({ identifier: email, password });
      return { sessionId: result.session.id };
    } catch {
      throw new UnauthorizedException({ type: 'about:blank', title: 'Unauthorized', status: 401, detail: 'Email ou senha inválidos', instance: '/v1/auth/sign-in' });
    }
  }

  async signUp(email: string, password: string, name?: string) {
    if (!this.clerk) {
      throw new UnauthorizedException('Authentication service is not configured');
    }
    const user = await this.clerk.signUp({ emailAddress: email, password, firstName: name });
    return { id: user.id, email: user.emailAddress, name: user.firstName };
  }

  async validateToken(token: string) {
    if (!this.clerk) {
      throw new UnauthorizedException('Authentication service is not configured');
    }
    try {
      const payload = await this.clerk.verifyToken(token);
      const user = await this.clerk.users.getUser(payload.sub);
      return {
        clerkId: user.id,
        email: user.emailAddresses[0]?.emailAddress ?? '',
        name: user.firstName,
        role: (user.publicMetadata?.role as string) ?? 'CUSTOMER',
      };
    } catch {
      throw new UnauthorizedException({ type: 'about:blank', title: 'Unauthorized', status: 401, detail: 'Token inválido ou expirado', instance: '/v1/auth' });
    }
  }
}
