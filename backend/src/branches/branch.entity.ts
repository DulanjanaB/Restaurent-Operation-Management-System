import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { ActiveStatus } from '../common/enums/active-status.enum';
import { Auditable } from '../audit-log/auditable.decorator';

@Auditable()
@Entity('branches')
export class Branch {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  code: string;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ type: 'enum', enum: ActiveStatus, default: ActiveStatus.ACTIVE })
  status: ActiveStatus;
}
