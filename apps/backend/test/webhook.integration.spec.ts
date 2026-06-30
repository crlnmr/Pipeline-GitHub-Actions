import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/core/database/prisma.service';
import { UserService } from '../src/core/auth/services/user.service';
import * as cookieParser from 'cookie-parser';

describe('POST /v1/auth/webhook', () => {
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

  it('should accept webhook event without CLERK_WEBHOOK_SECRET configured', async () => {
    const userService = app.get(UserService);
    const upsertSpy = jest.spyOn(userService, 'upsertByClerkId');

    const res = await request(app.getHttpServer())
      .post('/v1/auth/webhook')
      .send({
        type: 'user.created',
        data: {
          id: 'clerk_123',
          email_addresses: [{ email_address: 'test@test.com' }],
          first_name: 'Test',
        },
      });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ received: true });
    expect(upsertSpy).toHaveBeenCalledWith('clerk_123', {
      email: 'test@test.com',
      name: 'Test',
      role: 'CUSTOMER',
    });
  });

  it('should require webhook signature when CLERK_WEBHOOK_SECRET is set', async () => {
    process.env.CLERK_WEBHOOK_SECRET = 'whsec_test';

    const res = await request(app.getHttpServer())
      .post('/v1/auth/webhook')
      .send({ type: 'user.created', data: { id: 'clerk_123' } });

    expect(res.status).toBe(401);

    delete process.env.CLERK_WEBHOOK_SECRET;
  });

  it('should accept webhook event with valid signature headers', async () => {
    process.env.CLERK_WEBHOOK_SECRET = 'whsec_test';

    const res = await request(app.getHttpServer())
      .post('/v1/auth/webhook')
      .set('svix-id', 'msg_123')
      .set('svix-timestamp', '1234567890')
      .set('svix-signature', 'v1,sig_123')
      .send({
        type: 'user.updated',
        data: {
          id: 'clerk_456',
          email_addresses: [{ email_address: 'updated@test.com' }],
          first_name: 'Updated',
          public_metadata: { role: 'ADMIN' },
        },
      });

    expect(res.status).toBe(200);

    delete process.env.CLERK_WEBHOOK_SECRET;
  });
});
