import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { UserRole } from './user-role.entity';
import { UserPermission } from './user-permission.entity';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { Permission } from '../permissions/permission.entity';
import { Role } from '../roles/role.entity';
import { RbacModule } from '../rbac/rbac.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      UserRole,
      UserPermission,
      Permission,
      Role,
    ]),
    RbacModule,
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [TypeOrmModule, UsersService],
})
export class UsersModule {}
