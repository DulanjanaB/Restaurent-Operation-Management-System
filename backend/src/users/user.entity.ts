import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ActiveStatus } from '../common/enums/active-status.enum';
import { Branch } from '../branches/branch.entity';
import { Auditable } from '../audit-log/auditable.decorator';

@Auditable()
@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  username: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  avatar_url: string | null;

  // Never selected by default — use { select: false } style queries or
  // .addSelect('user.password_hash') only where a password check is needed.
  @Column({ select: false })
  password_hash: string;

  @Column()
  name: string;

  @Column({ type: 'enum', enum: ActiveStatus, default: ActiveStatus.ACTIVE })
  status: ActiveStatus;

  @Column('uuid', { nullable: true })
  primary_branch_id: string | null;

  @ManyToOne(() => Branch, { nullable: true })
  @JoinColumn({ name: 'primary_branch_id' })
  primary_branch: Branch | null;
}
