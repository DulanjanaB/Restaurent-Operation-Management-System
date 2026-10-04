import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { Auditable } from '../audit-log/auditable.decorator';

@Auditable()
@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column({ nullable: true })
  description: string;

  // Protects built-in roles (e.g. "Owner") from deletion.
  @Column({ default: false })
  is_system_role: boolean;
}
