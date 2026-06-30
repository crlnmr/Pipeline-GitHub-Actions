import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/core/database/prisma.service';
import { AuthService } from '../src/core/auth/auth.service';
import * as cookieParser from 'cookie-parser';

describe('GET /v1/auth/me', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue({
        $connect: jest.fn(),
        $disconnect: jest.fn(),
        user: {
          upsert: jest.fn().mockResolvedValue({ id: 'uuid-1' }),
          findUnique: jest.fn().mockResolvedValue(null),
        },
      })
      .compile();

    app = module.createNestApplication();
    app.setGlobalPrefix('v1');
    app.use(cookieParser());
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
    );
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('should return 401 when not authenticated', async () => {
    const res = await request(app.getHttpServer()).get('/v1/auth/me');
    expect(res.status).toBe(401);
  });

  it('should return user when authenticated with valid token', async () => {
    const authService = app.get(AuthService);
    process.env.CLERK_SECRET_KEY = 'sk_test';
    authService.onModuleInit();

    const mockFetch = jest.fn();
    (global as any).fetch = mockFetch;
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ sub: 'clerk_123' }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: 'clerk_123',
          email_addresses: [{ email_address: 'test@test.com' }],
          first_name: 'Test',
          public_metadata: { role: 'CUSTOMER' },
        }),
      });

    const res = await request(app.getHttpServer())
      .get('/v1/auth/me')
      .set('Cookie', '__session=valid-token');

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      clerkId: 'clerk_123',
      email: 'test@test.com',
      name: 'Test',
      role: 'CUSTOMER',
    });

    delete process.env.CLERK_SECRET_KEY;
  });
});
