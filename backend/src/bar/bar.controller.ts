import { Body, Controller, Param, Post, UseGuards } from '@nestjs/common';
import { StockTransfersService } from '../inventory/stock-transfers.service';
import { CreateStockTransferDto } from '../inventory/dto/create-stock-transfer.dto';
import { WastageService } from '../inventory/wastage.service';
import { PermissionsGuard } from '../rbac/permissions.guard';
import { RequirePermissions } from '../rbac/require-permissions.decorator';
import { CurrentUser } from '../auth/current-user.decorator';
import { User } from '../users/user.entity';

// Bridging endpoints — Bar deliberately has no Stock/StockTransfer/Wastage
// tables of its own (see docs/bar-management-design.md). These reuse
// Inventory's entities/services directly, gated on Bar's own permissions
// so a bartender can hold bar.stock_issue/.approve without the broader
// inventory.transfer/.approve.
@UseGuards(PermissionsGuard)
@Controller('bar')
export class BarController {
  constructor(
    private readonly stockTransfersService: StockTransfersService,
    private readonly wastageService: WastageService,
  ) {}

  @RequirePermissions('bar.stock_issue')
  @Post('stock-issue')
  requestStockIssue(
    @Body() dto: CreateStockTransferDto,
    @CurrentUser() actor: User,
  ) {
    return this.stockTransfersService.create(dto, actor.id);
  }

  @RequirePermissions('bar.approve')
  @Post('wastage/:id/approve')
  approveWastage(@Param('id') id: string, @CurrentUser() actor: User) {
    return this.wastageService.decide(id, true, actor.id);
  }

  @RequirePermissions('bar.approve')
  @Post('wastage/:id/reject')
  rejectWastage(@Param('id') id: string, @CurrentUser() actor: User) {
    return this.wastageService.decide(id, false, actor.id);
  }
}
