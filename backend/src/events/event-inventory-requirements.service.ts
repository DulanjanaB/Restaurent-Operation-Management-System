import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventInventoryRequirement } from './event-inventory-requirement.entity';
import { CreateInventoryRequirementDto } from './dto/create-inventory-requirement.dto';
import { IssueInventoryDto } from './dto/issue-inventory.dto';
import { StockLedgerService } from '../inventory/stock-ledger.service';
import { StockMovementType } from '../inventory/stock-movement.enum';

@Injectable()
export class EventInventoryRequirementsService {
  constructor(
    @InjectRepository(EventInventoryRequirement)
    private readonly requirementsRepository: Repository<EventInventoryRequirement>,
    private readonly stockLedger: StockLedgerService,
  ) {}

  findAll(eventId: string): Promise<EventInventoryRequirement[]> {
    return this.requirementsRepository.find({
      where: { event_id: eventId },
      relations: { inventory_item: true },
    });
  }

  create(
    eventId: string,
    dto: CreateInventoryRequirementDto,
  ): Promise<EventInventoryRequirement> {
    return this.requirementsRepository.save(
      this.requirementsRepository.create({
        event_id: eventId,
        inventory_item_id: dto.inventory_item_id,
        quantity_required: dto.quantity_required,
      }),
    );
  }

  async remove(eventId: string, requirementId: string): Promise<void> {
    const requirement = await this.getRequirement(eventId, requirementId);
    await this.requirementsRepository.remove(requirement);
  }

  // Actually pulls stock for the event — writes a stock_out movement via
  // the same ledger every other inventory-consuming action uses. See
  // docs/event-management-design.md's EventInventoryRequirement note.
  async issue(
    eventId: string,
    requirementId: string,
    dto: IssueInventoryDto,
    performedBy: string,
  ) {
    const requirement = await this.getRequirement(eventId, requirementId);

    const alreadyIssued = Number(requirement.quantity_issued);
    const issuingNow = Number(dto.quantity);
    const required = Number(requirement.quantity_required);
    if (alreadyIssued + issuingNow > required) {
      throw new BadRequestException(
        `Issuing ${dto.quantity} would exceed the ${requirement.quantity_required} required`,
      );
    }

    await this.stockLedger.applyMovement({
      itemId: requirement.inventory_item_id,
      warehouseId: dto.warehouse_id,
      type: StockMovementType.STOCK_OUT,
      quantity: dto.quantity,
      referenceType: 'event',
      referenceId: eventId,
      performedBy,
    });

    requirement.quantity_issued = (alreadyIssued + issuingNow).toFixed(3);
    return this.requirementsRepository.save(requirement);
  }

  private async getRequirement(
    eventId: string,
    requirementId: string,
  ): Promise<EventInventoryRequirement> {
    const requirement = await this.requirementsRepository.findOne({
      where: { id: requirementId, event_id: eventId },
    });
    if (!requirement) {
      throw new NotFoundException(
        'Inventory requirement not found on this event',
      );
    }
    return requirement;
  }
}
