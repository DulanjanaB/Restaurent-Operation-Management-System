import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { BarRecipe } from './bar-recipe.entity';
import { BarRecipeIngredient } from './bar-recipe-ingredient.entity';
import { CreateBarRecipeDto } from './dto/create-bar-recipe.dto';
import { UpdateBarRecipeDto } from './dto/update-bar-recipe.dto';
import { AddIngredientDto } from './dto/add-ingredient.dto';

@Injectable()
export class BarRecipesService {
  constructor(
    @InjectRepository(BarRecipe)
    private readonly barRecipesRepository: Repository<BarRecipe>,
    @InjectRepository(BarRecipeIngredient)
    private readonly ingredientsRepository: Repository<BarRecipeIngredient>,
  ) {}

  findAll(): Promise<BarRecipe[]> {
    return this.barRecipesRepository.find({ order: { name: 'ASC' } });
  }

  async findOne(
    id: string,
  ): Promise<BarRecipe & { ingredients: BarRecipeIngredient[] }> {
    const recipe = await this.getRecipe(id);
    const ingredients = await this.ingredientsRepository.find({
      where: { recipe_id: id },
      relations: { item: true, unit: true },
    });
    return { ...recipe, ingredients };
  }

  create(dto: CreateBarRecipeDto): Promise<BarRecipe> {
    return this.barRecipesRepository.save(
      this.barRecipesRepository.create(dto),
    );
  }

  async update(id: string, dto: UpdateBarRecipeDto): Promise<BarRecipe> {
    const recipe = await this.getRecipe(id);
    this.barRecipesRepository.merge(recipe, dto);
    return this.barRecipesRepository.save(recipe);
  }

  async remove(id: string): Promise<void> {
    const recipe = await this.getRecipe(id);
    try {
      await this.barRecipesRepository.remove(recipe);
    } catch (error) {
      // Postgres 23503 = foreign_key_violation — sales recorded against
      // this recipe still reference it.
      if (
        error instanceof QueryFailedError &&
        error.driverError?.code === '23503'
      ) {
        throw new ConflictException(
          'This recipe has recorded sales and cannot be deleted',
        );
      }
      throw error;
    }
  }

  async addIngredient(
    recipeId: string,
    dto: AddIngredientDto,
  ): Promise<BarRecipeIngredient> {
    await this.getRecipe(recipeId);
    return this.ingredientsRepository.save(
      this.ingredientsRepository.create({ recipe_id: recipeId, ...dto }),
    );
  }

  async removeIngredient(
    recipeId: string,
    ingredientId: string,
  ): Promise<void> {
    const ingredient = await this.ingredientsRepository.findOne({
      where: { id: ingredientId, recipe_id: recipeId },
    });
    if (!ingredient) {
      throw new NotFoundException('Ingredient not found on this recipe');
    }
    await this.ingredientsRepository.remove(ingredient);
  }

  private async getRecipe(id: string): Promise<BarRecipe> {
    const recipe = await this.barRecipesRepository.findOne({ where: { id } });
    if (!recipe) {
      throw new NotFoundException('Bar recipe not found');
    }
    return recipe;
  }
}
