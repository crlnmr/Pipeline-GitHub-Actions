import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/core/database/prisma.service';
import * as cookieParser from 'cookie-parser';

describe('Auth Integration (POST /v1/auth)', () => {
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

  describe('POST /v1/auth/sign-in', () => {
    it('should return 401 when Clerk is not configured', async () => {
      const res = await request(app.getHttpServer())
        .post('/v1/auth/sign-in')
        .send({ email: 'test@test.com', password: 'password' });

      expect(res.status).toBe(401);
      expect(res.body).toMatchObject({
        statusCode: 401,
        message: 'Authentication service is not configured',
      });
    });

    it('should return 400 with validation errors for missing fields', async () => {
      const res = await request(app.getHttpServer())
        .post('/v1/auth/sign-in')
        .send({ email: '', password: '' });

      expect(res.status).toBe(400);
    });
  });

  describe('POST /v1/auth/sign-up', () => {
    it('should return 400 with validation errors for short password', async () => {
      const res = await request(app.getHttpServer())
        .post('/v1/auth/sign-up')
        .send({ email: 'test@test.com', password: '123' });

      expect(res.status).toBe(400);
    });
  });

  describe('protected route without token', () => {
    it('should return 401 for protected route', async () => {
      const res = await request(app.getHttpServer()).get('/v1/auth/me');

      expect(res.status).toBe(401);
      expect(res.body).toMatchObject({
        title: 'Unauthorized',
        detail: 'Token de autenticação não fornecido',
      });
    });
  });
});
