import { Body, Controller, Get, Headers, HttpCode, HttpStatus, Post, Res, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserService } from './services/user.service';
import { SignInDto } from './dto/sign-in.dto';
import { SignUpDto } from './dto/sign-up.dto';
import { WebhookEventDto } from './dto/webhook-event.dto';
import { Public } from './decorators/public.decorator';
import { CurrentUser, AuthenticatedUser } from './decorators/current-user.decorator';
import type { Response } from 'express';

interface WebhookUserData {
  id?: string;
  email_addresses?: Array<{ email_address: string }>;
  first_name?: string;
  public_metadata?: Record<string, unknown>;
}

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  @Public()
  @Post('sign-in')
  @HttpCode(HttpStatus.OK)
  async signIn(@Body() dto: SignInDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.signIn(dto.email, dto.password);
    res.cookie('__session', result.sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
    });
    return { message: 'Autenticado com sucesso' };
  }

  @Public()
  @Post('sign-up')
  @HttpCode(HttpStatus.CREATED)
  async signUp(@Body() dto: SignUpDto) {
    return this.authService.signUp(dto.email, dto.password, dto.name);
  }

  @Get('me')
  @HttpCode(HttpStatus.OK)
  getProfile(@CurrentUser() user?: AuthenticatedUser) {
    if (!user) {
      throw new UnauthorizedException({
        type: 'about:blank',
        title: 'Unauthorized',
        status: 401,
        detail: 'Não autenticado',
        instance: '/v1/auth/me',
      });
    }
    return user;
  }

  @Public()
  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  async handleWebhook(
    @Body() body: WebhookEventDto,
    @Headers('svix-id') svixId?: string,
    @Headers('svix-timestamp') svixTimestamp?: string,
    @Headers('svix-signature') svixSignature?: string,
  ) {
    const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
    if (webhookSecret) {
      if (!svixId || !svixTimestamp || !svixSignature) {
        throw new UnauthorizedException({
          type: 'about:blank',
          title: 'Unauthorized',
          status: 401,
          detail: 'Missing webhook signature headers',
          instance: '/v1/auth/webhook',
        });
      }
    }

    if (body.type === 'user.created' || body.type === 'user.updated') {
      const data = body.data as unknown as WebhookUserData;
      const id = data?.id;
      if (id) {
        await this.userService.upsertByClerkId(id, {
          email: data?.email_addresses?.[0]?.email_address ?? '',
          name: data?.first_name,
          role: (data?.public_metadata?.role as string) ?? 'CUSTOMER',
        });
      }
    }

    return { received: true };
  }
}
