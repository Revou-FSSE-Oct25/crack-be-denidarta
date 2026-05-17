import { SetMetadata } from '@nestjs/common';

export const RESOURCE_OWNER_KEY = 'resourceOwnerParam';
export const ResourceOwner = (paramName: string) =>
  SetMetadata(RESOURCE_OWNER_KEY, paramName);
