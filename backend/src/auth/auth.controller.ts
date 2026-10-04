import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { PermissionsGuard } from '../rbac/permissions.guard';
import { PermissionsResolverService } from '../rbac/permissions-resolver.service';
import { resolveBranchId } from '../rbac/branch-context.util';
import { CurrentUser } from './current-user.decorator';
import { User } from '../users/user.entity';
import { BranchesService } from '../branches/branches.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly permissionsResolver: PermissionsResolverService,
    private readonly branchesService: BranchesService,
  ) {}

  // Logging in isn't "creating a resource," so 200 rather than NestJS's
  // default 201 for POST.
  @HttpCode(200)
  @Post('login')
  login(@Body() dto: LoginDto, @Req() request: Request) {
    return this.authService.login(dto.username, dto.password, {
      ipAddress: request.ip ?? null,
      userAgent: (request.headers['user-agent'] as string) ?? null,
    });
  }

  // Auth only — no @RequirePermissions — so the frontend can always ask
  // "who am I and what can I do" right after login.
  @UseGuards(PermissionsGuard)
  @Get('me')
  async me(@CurrentUser() user: User, @Req() request: Request) {
    const branchId = resolveBranchId(request, user);
    const permissions = await this.permissionsResolver.getEffectivePermissions(
      user.id,
      branchId,
    );

    return {
      id: user.id,
      username: user.username,
      name: user.name,
      email: user.email,
      avatar_url: user.avatar_url,
      primary_branch_id: user.primary_branch_id,
      current_branch_id: branchId,
      permissions: Array.from(permissions),
    };
  }

  // Branch switcher data source — GET /branches itself needs
  // administration.branch.view, which most non-admin users won't hold.
  // This route just answers "which branches can I switch into," gated by
  // nothing beyond being logged in.
  @UseGuards(PermissionsGuard)
  @Get('my-branches')
  async myBranches(@CurrentUser() user: User) {
    const { allBranches, branchIds } =
      await this.permissionsResolver.getAccessibleBranches(user.id);
    const branches = allBranches
      ? await this.branchesService.findAll()
      : await this.branchesService.findByIds(branchIds);

    return {
      allBranches,
      branches: branches.map((branch) => ({
        id: branch.id,
        name: branch.name,
        code: branch.code,
      })),
    };
  }
}
