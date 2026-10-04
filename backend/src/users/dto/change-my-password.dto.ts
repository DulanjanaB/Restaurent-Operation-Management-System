import { IsString, MinLength } from 'class-validator';

// Self-service password change — distinct from the admin-triggered
// POST /users/:id/reset-password, which doesn't (and shouldn't) require
// knowing the old password. This one does, since anyone authenticated can
// call it on their own account with no other permission check.
export class ChangeMyPasswordDto {
  @IsString()
  currentPassword: string;

  @IsString()
  @MinLength(8)
  newPassword: string;
}
