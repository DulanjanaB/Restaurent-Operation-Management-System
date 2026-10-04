import { Module } from '@nestjs/common';
import { InitialDataSeeder } from './initial-data.seeder';
import { BranchesModule } from '../branches/branches.module';
import { RolesModule } from '../roles/roles.module';
import { PermissionsModule } from '../permissions/permissions.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [BranchesModule, RolesModule, PermissionsModule, UsersModule],
  providers: [InitialDataSeeder],
})
export class SeedModule {}
