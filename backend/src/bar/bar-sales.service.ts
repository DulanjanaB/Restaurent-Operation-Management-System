import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { BarSale } from './bar-sale.entity';
import { BarRecipe } from './bar-recipe.entity';
import { BarRecipeIngredient } from './bar-recipe-ingredient.entity';
import { Item } from '../inventory/item.entity';
import { StockLedgerService } from '../inventory/stock-ledger.service';
import { StockMovementType } from '../inventory/stock-movement.enum';
import { CreateBarSaleDto } from './dto/create-bar-sale.dto';

// Recording a sale writes one stock_out StockMovement per ingredient — see
// docs/bar-management-design.md#barsale. This is what "Consumption" means
// in the design doc: the aggregate of these movements, not a separately
// entered number.
@Injectable()
export class BarSalesService {
  constructor(
    @InjectRepository(BarSale)
    private readonly barSalesRepository: Repository<BarSale>,
    @InjectRepository(BarRecipe)
    private readonly barRecipesRepository: Repository<BarRecipe>,
    @InjectRepository(BarRecipeIngredient)
    private readonly ingredientsRepository: Repository<BarRecipeIngredient>,
    @InjectRepository(Item)
    private readonly itemsRepository: Repository<Item>,
    private readonly stockLedger: StockLedgerService,
    private readonly dataSource: DataSource,
  ) {}

  findAll(warehouseId?: string): Promise<BarSale[]> {
    return this.barSalesRepository.find({
      where: warehouseId ? { warehouse_id: warehouseId } : {},
      relations: { recipe: true },
      order: { sold_at: 'DESC' },
    });
  }

  // Runs the sale row + every ingredient's stock deduction in one
  // transaction — otherwise a deduction failing partway through (e.g.
  // insufficient stock on a later ingredient) would leave the sale row
  // and any earlier deductions committed, charging a sale that was never
  // fully fulfilled. See the orphaned-row bug this replaced.
  async create(dto: CreateBarSaleDto, soldBy: string): Promise<BarSale> {
    const recipe = await this.barRecipesRepository.findOne({
      where: { id: dto.recipe_id },
    });
    if (!recipe) {
      throw new NotFoundException('Bar recipe not found');
    }

    const quantity = Number(dto.quantity);
    const totalAmount = Number(recipe.selling_price) * quantity;

    return this.dataSource.transaction(async (manager) => {
      const sale = await manager.save(
        manager.create(BarSale, {
          warehouse_id: dto.warehouse_id,
          recipe_id: dto.recipe_id,
          quantity: dto.quantity,
          unit_price: recipe.selling_price,
          total_amount: totalAmount.toFixed(2),
          sold_by: soldBy,
        }),
      );

      const ingredients = await manager.find(BarRecipeIngredient, {
        where: { recipe_id: dto.recipe_id },
      });
      for (const ingredient of ingredients) {
        const item = await manager.findOne(Item, {
          where: { id: ingredient.item_id },
        });
        const baseUnitQuantity = item?.base_unit_quantity
          ? Number(item.base_unit_quantity)
          : 1;
        const deduction =
          (Number(ingredient.quantity_per_serving) * quantity) /
          baseUnitQuantity;

        await this.stockLedger.applyMovement(
          {
            itemId: ingredient.item_id,
            warehouseId: dto.warehouse_id,
            type: StockMovementType.STOCK_OUT,
            quantity: deduction.toFixed(3),
            referenceType: 'bar_sale',
            referenceId: sale.id,
            performedBy: soldBy,
          },
          manager,
        );
      }

      return sale;
    });
  }
}
