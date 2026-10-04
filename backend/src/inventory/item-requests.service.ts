import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Item } from './item.entity';
import { Warehouse } from './warehouse.entity';
import { ItemRequest } from './item-request.entity';
import { ItemRequestStatus } from './item-request.enum';
import { StockMovementType } from './stock-movement.enum';
import { StockLedgerService } from './stock-ledger.service';
import { CreateItemRequestDto } from './dto/create-item-request.dto';

const RELATIONS = {
  warehouse: true,
  requester: true,
  decider: true,
  items: { item: true },
} as const;

@Injectable()
export class ItemRequestsService {
  constructor(
    @InjectRepository(ItemRequest)
    private readonly itemRequestsRepository: Repository<ItemRequest>,
    @InjectRepository(Item)
    private readonly itemsRepository: Repository<Item>,
    @InjectRepository(Warehouse)
    private readonly warehousesRepository: Repository<Warehouse>,
    private readonly stockLedger: StockLedgerService,
    private readonly dataSource: DataSource,
  ) {}

  // Only the fields a requester needs — no cost or stock levels reach a
  // role that holds the request permission but not inventory.view.
  async catalog(branchId: string | null) {
    const [items, warehouses] = await Promise.all([
      this.itemsRepository.find({
        select: {
          id: true,
          name: true,
          sku: true,
          unit: { id: true, name: true, abbreviation: true },
        },
        relations: { unit: true },
        order: { name: 'ASC' },
      }),
      this.warehousesRepository.find({
        where: branchId ? { branch_id: branchId } : {},
        select: { id: true, name: true },
        order: { name: 'ASC' },
      }),
    ]);
    return { items, warehouses };
  }

  findAll(): Promise<ItemRequest[]> {
    return this.itemRequestsRepository.find({
      relations: RELATIONS,
      order: { created_at: 'DESC' },
    });
  }

  // Requesters can see their own history but not item cost data, so the
  // joined item is narrowed to the fields the request screen displays.
  findMine(userId: string): Promise<ItemRequest[]> {
    return this.itemRequestsRepository.find({
      where: { requested_by: userId },
      select: {
        id: true,
        warehouse_id: true,
        notes: true,
        status: true,
        requested_by: true,
        decided_by: true,
        created_at: true,
        warehouse: { id: true, name: true },
        items: {
          id: true,
          item_id: true,
          quantity: true,
          item: { id: true, name: true, sku: true },
        },
      },
      relations: { warehouse: true, items: { item: true } },
      order: { created_at: 'DESC' },
    });
  }

  async findOne(id: string): Promise<ItemRequest> {
    const request = await this.itemRequestsRepository.findOne({
      where: { id },
      relations: RELATIONS,
    });
    if (!request) {
      throw new NotFoundException('Item request not found');
    }
    return request;
  }

  create(dto: CreateItemRequestDto, requestedBy: string): Promise<ItemRequest> {
    if (dto.items.some((line) => !(Number(line.quantity) > 0))) {
      throw new BadRequestException(
        'Every requested quantity must be greater than zero',
      );
    }
    const request = this.itemRequestsRepository.create({
      warehouse_id: dto.warehouse_id,
      notes: dto.notes ?? null,
      requested_by: requestedBy,
      items: dto.items,
    });
    return this.itemRequestsRepository.save(request);
  }

  // Approving issues every requested line out of the warehouse through the
  // ledger. All lines run in one transaction: if any line lacks stock, the
  // whole request stays pending instead of being half-issued.
  async decide(
    id: string,
    approve: boolean,
    deciderId: string,
  ): Promise<ItemRequest> {
    return this.dataSource.transaction(async (manager) => {
      const request = await manager.findOne(ItemRequest, {
        where: { id },
        relations: { items: true },
      });
      if (!request) {
        throw new NotFoundException('Item request not found');
      }
      if (request.status !== ItemRequestStatus.PENDING) {
        throw new BadRequestException(
          'This item request has already been decided',
        );
      }

      if (approve) {
        for (const line of request.items) {
          await this.stockLedger.applyMovement(
            {
              itemId: line.item_id,
              warehouseId: request.warehouse_id,
              type: StockMovementType.STOCK_OUT,
              quantity: line.quantity,
              referenceType: 'item_request',
              referenceId: request.id,
              performedBy: deciderId,
            },
            manager,
          );
        }
      }

      request.status = approve
        ? ItemRequestStatus.APPROVED
        : ItemRequestStatus.REJECTED;
      request.decided_by = deciderId;
      await manager.save(request);
      return manager.findOneOrFail(ItemRequest, {
        where: { id: request.id },
        relations: RELATIONS,
      });
    });
  }
}
