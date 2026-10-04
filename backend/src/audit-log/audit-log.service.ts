import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from './audit-log.entity';

export interface RecordEventParams {
  action: string;
  entityType: string;
  actorId?: string | null;
  actorName?: string | null;
  entityId?: string | null;
  entityLabel?: string | null;
  branchId?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
}

@Injectable()
export class AuditLogService {
  constructor(
    @InjectRepository(AuditLog)
    private readonly auditLogRepository: Repository<AuditLog>,
  ) {}

  findAll(filters: {
    actorId?: string;
    entityType?: string;
    entityId?: string;
    dateFrom?: string;
    dateTo?: string;
  }): Promise<AuditLog[]> {
    const qb = this.auditLogRepository
      .createQueryBuilder('log')
      .orderBy('log.created_at', 'DESC');

    if (filters.actorId)
      qb.andWhere('log.actor_id = :actorId', { actorId: filters.actorId });
    if (filters.entityType)
      qb.andWhere('log.entity_type = :entityType', {
        entityType: filters.entityType,
      });
    if (filters.entityId)
      qb.andWhere('log.entity_id = :entityId', { entityId: filters.entityId });
    if (filters.dateFrom)
      qb.andWhere('log.created_at >= :dateFrom', {
        dateFrom: filters.dateFrom,
      });
    if (filters.dateTo)
      qb.andWhere('log.created_at <= :dateTo', { dateTo: filters.dateTo });

    return qb.getMany();
  }

  // The two events that aren't a database mutation (login/logout, report
  // view/export), so the subscriber can't catch them — explicit calls
  // from AuthService and the reporting layer. See
  // docs/audit-log-design.md#capture-mechanism--automatic-not-per-call.
  record(params: RecordEventParams): Promise<AuditLog> {
    return this.auditLogRepository.save(
      this.auditLogRepository.create({
        actor_id: params.actorId ?? null,
        actor_name: params.actorName ?? null,
        action: params.action,
        entity_type: params.entityType,
        entity_id: params.entityId ?? null,
        entity_label: params.entityLabel ?? null,
        changes: null,
        branch_id: params.branchId ?? null,
        ip_address: params.ipAddress ?? null,
        user_agent: params.userAgent ?? null,
      }),
    );
  }
}
