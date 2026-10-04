import { Module, OnModuleInit } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { AuditLog } from './audit-log.entity';
import { AuditLogService } from './audit-log.service';
import { AuditLogController } from './audit-log.controller';
import { AuditSubscriber } from './audit.subscriber';
import { RequestContextService } from './request-context.service';
import { RequestContextInterceptor } from './request-context.interceptor';
import { RbacModule } from '../rbac/rbac.module';
import { ExportModule } from '../export/export.module';

@Module({
  imports: [TypeOrmModule.forFeature([AuditLog]), RbacModule, ExportModule],
  controllers: [AuditLogController],
  providers: [
    AuditLogService,
    AuditSubscriber,
    RequestContextService,
    RequestContextInterceptor,
  ],
  exports: [
    AuditLogService,
    RequestContextService,
    RequestContextInterceptor,
    TypeOrmModule,
  ],
})
export class AuditLogModule implements OnModuleInit {
  constructor(
    private readonly dataSource: DataSource,
    private readonly auditSubscriber: AuditSubscriber,
  ) {}

  // @nestjs/typeorm doesn't wire DI-constructed subscribers into the
  // DataSource automatically — register it here so AuditSubscriber can
  // receive RequestContextService via Nest's container instead of
  // TypeORM's own (DI-less) subscriber instantiation.
  onModuleInit(): void {
    this.dataSource.subscribers.push(this.auditSubscriber);
  }
}
