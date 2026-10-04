import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { BarRecipe } from './bar-recipe.entity';
import { BarRecipeIngredient } from './bar-recipe-ingredient.entity';
import { BarSale } from './bar-sale.entity';
import { BarStockCount } from './bar-stock-count.entity';

import { BarRecipesService } from './bar-recipes.service';
import { BarRecipesController } from './bar-recipes.controller';
import { BarSalesService } from './bar-sales.service';
import { BarSalesController } from './bar-sales.controller';
import { BarStockCountsService } from './bar-stock-counts.service';
import { BarStockCountsController } from './bar-stock-counts.controller';
import { BarController } from './bar.controller';

import { RbacModule } from '../rbac/rbac.module';
import { InventoryModule } from '../inventory/inventory.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      BarRecipe,
      BarRecipeIngredient,
      BarSale,
      BarStockCount,
    ]),
    RbacModule,
    InventoryModule,
  ],
  controllers: [
    BarRecipesController,
    BarSalesController,
    BarStockCountsController,
    BarController,
  ],
  providers: [BarRecipesService, BarSalesService, BarStockCountsService],
  exports: [TypeOrmModule],
})
export class BarModule {}
