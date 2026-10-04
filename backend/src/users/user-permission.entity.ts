import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { User } from './user.entity';
import { Permission } from '../permissions/permission.entity';
import { PermissionEffect } from '../permissions/permission-effect.enum';
import { Auditable } from '../audit-log/auditable.decorator';

// Per-user override on top of role permissions. GRANT adds a permission the
// user's roles don't already give them; REVOKE removes one their roles
// would otherwise give them, and always wins — see
// docs/rbac-design.md#permission-resolution.
@Auditable()
@Entity('user_permissions')
export class UserPermission {
  @PrimaryColumn('uuid')
  user_id: string;

  @PrimaryColumn('uuid')
  permission_id: string;

  @Column({ type: 'enum', enum: PermissionEffect })
  effect: PermissionEffect;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Permission, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'permission_id' })
  permission: Permission;
}
