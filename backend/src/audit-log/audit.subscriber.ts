import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  EntitySubscriberInterface,
  InsertEvent,
  Repository,
  RemoveEvent,
  UpdateEvent,
} from 'typeorm';
import { AuditLog } from './audit-log.entity';
import { isAuditable } from './auditable.decorator';
import { RequestContextService } from './request-context.service';

// Columns never written to `changes`, regardless of entity.
const IGNORED_COLUMNS = new Set(['password_hash']);
// Checked in order — the first one present on the entity becomes
// entity_label.
const LABEL_FIELDS = ['name', 'username', 'batch_code', 'sku', 'title'];

// Not decorated with @EventSubscriber() — registered manually onto the
// DataSource in AuditLogModule so it can receive NestJS-injected
// dependencies (RequestContextService). Listens to every entity (no
// listenTo() override) and filters by @Auditable() itself, so adding
// audit coverage for a new entity is just adding that one decorator. See
// docs/audit-log-design.md#capture-mechanism--automatic-not-per-call.
@Injectable()
export class AuditSubscriber implements EntitySubscriberInterface {
  constructor(
    @InjectRepository(AuditLog)
    private readonly auditLogRepository: Repository<AuditLog>,
    private readonly requestContext: RequestContextService,
  ) {}

  afterInsert(event: InsertEvent<any>): void {
    if (!isAuditable(event.metadata.target as Function)) return;
    void this.write('create', event.metadata.name, event.entity, null);
  }

  afterUpdate(event: UpdateEvent<any>): void {
    if (!isAuditable(event.metadata.target as Function)) return;
    const changes = this.diff(
      event.databaseEntity,
      event.entity,
      event.updatedColumns.map((c) => c.propertyName),
    );
    if (Object.keys(changes).length === 0) return;
    void this.write(
      'update',
      event.metadata.name,
      event.entity ?? event.databaseEntity,
      changes,
    );
  }

  afterRemove(event: RemoveEvent<any>): void {
    if (!isAuditable(event.metadata.target as Function)) return;
    void this.write('delete', event.metadata.name, event.databaseEntity, null);
  }

  private diff(
    before: any,
    after: any,
    columns: string[],
  ): Record<string, { old: unknown; new: unknown }> {
    const changes: Record<string, { old: unknown; new: unknown }> = {};
    for (const column of columns) {
      if (IGNORED_COLUMNS.has(column)) continue;
      const oldValue = before?.[column];
      const newValue = after?.[column];
      if (oldValue !== newValue) {
        changes[column] = { old: oldValue, new: newValue };
      }
    }
    return changes;
  }

  private async write(
    action: string,
    entityType: string,
    entity: any,
    changes: Record<string, { old: unknown; new: unknown }> | null,
  ): Promise<void> {
    const context = this.requestContext.get();
    const label =
      LABEL_FIELDS.map((field) => entity?.[field]).find(
        (value) => typeof value === 'string',
      ) ?? null;

    await this.auditLogRepository.save(
      this.auditLogRepository.create({
        actor_id: context?.userId ?? null,
        actor_name: context?.userName ?? null,
        action,
        entity_type: entityType,
        entity_id: entity?.id ?? null,
        entity_label: label,
        changes,
        branch_id: entity?.branch_id ?? null,
        ip_address: context?.ipAddress ?? null,
        user_agent: context?.userAgent ?? null,
      }),
    );
  }
}
