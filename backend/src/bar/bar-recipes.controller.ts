import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { BarRecipesService } from './bar-recipes.service';
import { CreateBarRecipeDto } from './dto/create-bar-recipe.dto';
import { UpdateBarRecipeDto } from './dto/update-bar-recipe.dto';
import { AddIngredientDto } from './dto/add-ingredient.dto';
import { PermissionsGuard } from '../rbac/permissions.guard';
import { RequirePermissions } from '../rbac/require-permissions.decorator';

@UseGuards(PermissionsGuard)
@Controller('bar/recipes')
export class BarRecipesController {
  constructor(private readonly barRecipesService: BarRecipesService) {}

  @RequirePermissions('bar.view')
  @Get()
  findAll() {
    return this.barRecipesService.findAll();
  }

  @RequirePermissions('bar.view')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.barRecipesService.findOne(id);
  }

  @RequirePermissions('bar.create')
  @Post()
  create(@Body() dto: CreateBarRecipeDto) {
    return this.barRecipesService.create(dto);
  }

  @RequirePermissions('bar.update')
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateBarRecipeDto) {
    return this.barRecipesService.update(id, dto);
  }

  @RequirePermissions('bar.delete')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.barRecipesService.remove(id);
  }

  @RequirePermissions('bar.update')
  @Post(':id/ingredients')
  addIngredient(@Param('id') id: string, @Body() dto: AddIngredientDto) {
    return this.barRecipesService.addIngredient(id, dto);
  }

  @RequirePermissions('bar.update')
  @Delete(':id/ingredients/:ingredientId')
  removeIngredient(
    @Param('id') id: string,
    @Param('ingredientId') ingredientId: string,
  ) {
    return this.barRecipesService.removeIngredient(id, ingredientId);
  }
}
