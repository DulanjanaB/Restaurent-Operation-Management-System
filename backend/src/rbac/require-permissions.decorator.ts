import { SetMetadata } from '@nestjs/common';

export const PERMISSIONS_KEY = 'permissions';

// e.g. @RequirePermissions('inventory.stock_adjustment')
// Multiple keys require all of them.
export const RequirePermissions = (...permissions: string[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
