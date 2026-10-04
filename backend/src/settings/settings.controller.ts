import {
  Body,
  Controller,
  Get,
  Param,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { SettingsService } from './settings.service';
import { UpsertSettingDto } from './dto/upsert-setting.dto';
import { PermissionsGuard } from '../rbac/permissions.guard';
import { RequirePermissions } from '../rbac/require-permissions.decorator';
import { CurrentUser } from '../auth/current-user.decorator';
import { User } from '../users/user.entity';

@UseGuards(PermissionsGuard)
@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @RequirePermissions('settings.view')
  @Get()
  findAll(@Query('category') category?: string) {
    return this.settingsService.findAll(category);
  }

  @RequirePermissions('settings.view')
  @Get(':category/:key')
  findOne(@Param('category') category: string, @Param('key') key: string) {
    return this.settingsService.findOne(category, key);
  }

  // No static @RequirePermissions — which permission applies depends on
  // the category (security vs. everything else), checked inside the
  // service. See docs/settings-design.md#permissions.
  @Put(':category/:key')
  upsert(
    @Param('category') category: string,
    @Param('key') key: string,
    @Body() dto: UpsertSettingDto,
    @CurrentUser() actor: User,
    @Req() request: Request,
  ) {
    return this.settingsService.upsert(
      category,
      key,
      dto.value,
      actor,
      request,
    );
  }
}
