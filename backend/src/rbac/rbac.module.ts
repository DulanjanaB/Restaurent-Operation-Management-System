import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PermissionsResolverService } from './permissions-resolver.service';
import { PermissionsGuard } from './permissions.guard';
import { UserRole } from '../users/user-role.entity';
import { UserPermission } from '../users/user-permission.entity';

// Registers UserRole/UserPermission repositories directly (rather than
// importing UsersModule) so RbacModule has no dependency on UsersModule —
// UsersModule in turn depends on RbacModule (for PermissionsGuard and
// escalation checks in UsersService), and NestJS modules can't import each
// other circularly.
@Module({
  imports: [TypeOrmModule.forFeature([UserRole, UserPermission])],
  providers: [PermissionsResolverService, PermissionsGuard],
  exports: [PermissionsResolverService, PermissionsGuard],
})
export class RbacModule {}
