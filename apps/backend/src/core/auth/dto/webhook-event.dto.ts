import { IsObject, IsOptional, IsString } from 'class-validator';

export class WebhookEventDto {
  @IsObject()
  data!: Record<string, unknown>;

  @IsOptional()
  @IsString()
  object?: string;

  @IsString()
  type!: string;
}
