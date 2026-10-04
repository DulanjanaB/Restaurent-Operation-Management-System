import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BranchesModule } from './branches/branches.module';
import { PermissionsModule } from './permissions/permissions.module';
import { RolesModule } from './roles/roles.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { RbacModule } from './rbac/rbac.module';
import { SeedModule } from './seed/seed.module';
import { RosterModule } from './roster/roster.module';
import { InventoryModule } from './inventory/inventory.module';
import { TipSharingModule } from './tip-sharing/tip-sharing.module';
import { EventsModule } from './events/events.module';
import { FoodPreservationModule } from './food-preservation/food-preservation.module';
import { BarModule } from './bar/bar.module';
import { SettingsModule } from './settings/settings.module';
import { AuditLogModule } from './audit-log/audit-log.module';
import { RequestContextInterceptor } from './audit-log/request-context.interceptor';
import { ReportsModule } from './reports/reports.module';
import { ChecklistModule } from './checklist/checklist.module';
import { UploadsModule } from './uploads/uploads.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('DB_HOST'),
        port: config.get('DB_PORT'),
        username: config.get('DB_USERNAME'),
        password: config.get('DB_PASSWORD'),
        database: config.get('DB_NAME'),
        autoLoadEntities: true,
        // Creates and updates tables from the entities. Keep it on for a fresh
        // install; set DB_SYNC=false once the schema is in place on a live server.
        synchronize: config.get('DB_SYNC', 'true') !== 'false',
      }),
    }),
    BranchesModule,
    PermissionsModule,
    RolesModule,
    UsersModule,
    AuthModule,
    RbacModule,
    SeedModule,
    RosterModule,
    InventoryModule,
    TipSharingModule,
    EventsModule,
    FoodPreservationModule,
    BarModule,
    SettingsModule,
    AuditLogModule,
    ReportsModule,
    ChecklistModule,
    UploadsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: RequestContextInterceptor,
    },
  ],
})
export class AppModule {}
