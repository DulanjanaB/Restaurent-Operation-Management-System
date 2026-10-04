import { IsEmail, IsOptional, IsString, MaxLength } from 'class-validator';

// Self-service subset of UpdateUserDto — deliberately excludes `username`
// (changing your own login identifier) and `primary_branch_id` (org
// structure), both of which stay admin-only via PATCH /users/:id.
export class UpdateMyProfileDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  // Empty string clears the photo.
  @IsOptional()
  @IsString()
  @MaxLength(500)
  avatar_url?: string;
}
