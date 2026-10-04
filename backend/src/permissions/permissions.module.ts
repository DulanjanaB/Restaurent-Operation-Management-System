import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Permission } from './permission.entity';
import { PermissionsSeeder } from './permissions.seeder';
import { PermissionsController } from './permissions.controller';
import { RbacModule } from '../rbac/rbac.module';

@Module({
  imports: [TypeOrmModule.forFeature([Permission]), RbacModule],
  controllers: [PermissionsController],
  providers: [PermissionsSeeder],
  exports: [TypeOrmModule, PermissionsSeeder],
})
export class PermissionsModule {}
