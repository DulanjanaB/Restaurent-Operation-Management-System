import { IsOptional, IsString, MinLength } from 'class-validator';

// newPassword is optional — if omitted, the service generates a random
// temporary one and returns it once in the response (see
// docs/user-management-design.md's "Reset Password" action).
export class ResetPasswordDto {
  @IsOptional()
  @IsString()
  @MinLength(8)
  newPassword?: string;
}
