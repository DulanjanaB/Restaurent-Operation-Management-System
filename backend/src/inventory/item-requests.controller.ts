import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { ItemRequestsService } from './item-requests.service';
import { CreateItemRequestDto } from './dto/create-item-request.dto';
import { PermissionsGuard } from '../rbac/permissions.guard';
import { RequirePermissions } from '../rbac/require-permissions.decorator';
import { resolveBranchId } from '../rbac/branch-context.util';
import { CurrentUser } from '../auth/current-user.decorator';
import { User } from '../users/user.entity';

@UseGuards(PermissionsGuard)
@Controller('inventory/item-requests')
export class ItemRequestsController {
  constructor(private readonly itemRequestsService: ItemRequestsService) {}

  @RequirePermissions('inventory.item_request.create')
  @Get('catalog')
  catalog(@Req() request: Request, @CurrentUser() actor: User) {
    return this.itemRequestsService.catalog(resolveBranchId(request, actor));
  }

  @RequirePermissions('inventory.item_request.create')
  @Get('mine')
  findMine(@CurrentUser() actor: User) {
    return this.itemRequestsService.findMine(actor.id);
  }

  @RequirePermissions('inventory.approve')
  @Get()
  findAll() {
    return this.itemRequestsService.findAll();
  }

  @RequirePermissions('inventory.item_request.create')
  @Post()
  create(@Body() dto: CreateItemRequestDto, @CurrentUser() actor: User) {
    return this.itemRequestsService.create(dto, actor.id);
  }

  @RequirePermissions('inventory.approve')
  @Post(':id/approve')
  approve(@Param('id') id: string, @CurrentUser() actor: User) {
    return this.itemRequestsService.decide(id, true, actor.id);
  }

  @RequirePermissions('inventory.approve')
  @Post(':id/reject')
  reject(@Param('id') id: string, @CurrentUser() actor: User) {
    return this.itemRequestsService.decide(id, false, actor.id);
  }
}
