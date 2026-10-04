import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Role } from '../roles/role.entity';
import { Branch } from '../branches/branch.entity';
import { Auditable } from '../audit-log/auditable.decorator';

// branch_id = NULL means the role applies across all branches (e.g. an
// Owner/HQ-level role) — see docs/rbac-design.md#userrole-join.
//
// A plain unique constraint on (user_id, role_id, branch_id) wouldn't stop
// duplicate "all-branches" rows, since Postgres treats NULLs as distinct in
// unique constraints. The partial index below covers that case separately.
@Auditable()
@Entity('user_roles')
@Index(['user_id', 'role_id', 'branch_id'], { unique: true })
@Index('UQ_user_roles_all_branches', ['user_id', 'role_id'], {
  unique: true,
  where: 'branch_id IS NULL',
})
export class UserRole {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  user_id: string;

  @Column('uuid')
  role_id: string;

  @Column('uuid', { nullable: true })
  branch_id: string | null;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Role, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'role_id' })
  role: Role;

  @ManyToOne(() => Branch, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'branch_id' })
  branch: Branch | null;
}
