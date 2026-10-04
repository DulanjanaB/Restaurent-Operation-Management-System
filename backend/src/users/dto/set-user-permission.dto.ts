import { IsEnum, IsUUID } from 'class-validator';
import { PermissionEffect } from '../../permissions/permission-effect.enum';

export class SetUserPermissionDto {
  @IsUUID()
  permission_id: string;

  @IsEnum(PermissionEffect)
  effect: PermissionEffect;
}
