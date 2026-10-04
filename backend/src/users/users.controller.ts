import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateMyProfileDto } from './dto/update-my-profile.dto';
import { ChangeMyPasswordDto } from './dto/change-my-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { AssignRoleDto } from './dto/assign-role.dto';
import { SetUserPermissionDto } from './dto/set-user-permission.dto';
import { PermissionsGuard } from '../rbac/permissions.guard';
import { RequirePermissions } from '../rbac/require-permissions.decorator';
import { CurrentUser } from '../auth/current-user.decorator';
import { User } from './user.entity';

@UseGuards(PermissionsGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // Self-service — authenticated only, no administration.user.* permission.
  // Registered before the `:id` routes below so "me" is never swallowed as
  // a literal id (same reasoning as GET /roster/employees/me).
  @Get('me')
  getMyProfile(@CurrentUser() actor: User) {
    return this.usersService.findOne(actor.id);
  }

  @Patch('me')
  updateMyProfile(@CurrentUser() actor: User, @Body() dto: UpdateMyProfileDto) {
    return this.usersService.updateMyProfile(actor.id, dto);
  }

  @Post('me/change-password')
  changeMyPassword(
    @CurrentUser() actor: User,
    @Body() dto: ChangeMyPasswordDto,
  ) {
    return this.usersService.changeMyPassword(
      actor.id,
      dto.currentPassword,
      dto.newPassword,
    );
  }

  @RequirePermissions('administration.user.view')
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @RequirePermissions('administration.user.view')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @RequirePermissions('administration.user.create')
  @Post()
  create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  @RequirePermissions('administration.user.update')
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.usersService.update(id, dto);
  }

  @RequirePermissions('administration.user.delete')
  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() actor: User) {
    return this.usersService.remove(id, actor.id);
  }

  @RequirePermissions('administration.user.activate')
  @Post(':id/activate')
  activate(@Param('id') id: string) {
    return this.usersService.setActive(id, true);
  }

  @RequirePermissions('administration.user.activate')
  @Post(':id/deactivate')
  deactivate(@Param('id') id: string) {
    return this.usersService.setActive(id, false);
  }

  @RequirePermissions('administration.user.reset_password')
  @Post(':id/reset-password')
  resetPassword(@Param('id') id: string, @Body() dto: ResetPasswordDto) {
    return this.usersService.resetPassword(id, dto.newPassword);
  }

  @RequirePermissions('administration.user.view')
  @Get(':id/roles')
  listRoles(@Param('id') id: string) {
    return this.usersService.listRoleAssignments(id);
  }

  @RequirePermissions('administration.user.assign_role')
  @Post(':id/roles')
  assignRole(
    @Param('id') id: string,
    @Body() dto: AssignRoleDto,
    @CurrentUser() actor: User,
  ) {
    return this.usersService.assignRole(
      id,
      dto.role_id,
      dto.branch_id ?? null,
      actor.id,
    );
  }

  @RequirePermissions('administration.user.assign_role')
  @Delete(':id/roles/:userRoleId')
  removeRole(
    @Param('id') id: string,
    @Param('userRoleId') userRoleId: string,
    @CurrentUser() actor: User,
  ) {
    return this.usersService.removeRoleAssignment(id, userRoleId, actor.id);
  }

  @RequirePermissions('administration.user.view')
  @Get(':id/permissions')
  listPermissionOverrides(@Param('id') id: string) {
    return this.usersService.listPermissionOverrides(id);
  }

  @RequirePermissions('administration.user.manage_permissions')
  @Put(':id/permissions')
  setPermissionOverride(
    @Param('id') id: string,
    @Body() dto: SetUserPermissionDto,
    @CurrentUser() actor: User,
  ) {
    return this.usersService.setPermissionOverride(
      id,
      dto.permission_id,
      dto.effect,
      actor.id,
    );
  }

  @RequirePermissions('administration.user.manage_permissions')
  @Delete(':id/permissions/:permissionId')
  removePermissionOverride(
    @Param('id') id: string,
    @Param('permissionId') permissionId: string,
    @CurrentUser() actor: User,
  ) {
    return this.usersService.removePermissionOverride(
      id,
      permissionId,
      actor.id,
    );
  }
}
