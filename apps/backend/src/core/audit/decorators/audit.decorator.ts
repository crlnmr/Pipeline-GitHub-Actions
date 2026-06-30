import { SetMetadata } from '@nestjs/common';

export const AUDIT_KEY = 'audit';
export const Audit = (metadata: { action: string; resource: string }) =>
  SetMetadata(AUDIT_KEY, metadata);
