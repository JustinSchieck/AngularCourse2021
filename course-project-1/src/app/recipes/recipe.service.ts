import { EventEmitter, Injectable } from '@angular/core';
import { Ingredient } from '../shared/ingredient.model';
import { ShoppingListService } from '../shopping-list/shopping-list.service';
import { Recipe } from './recipe.model';

@Injectable()
export class RecipeService {
  recipeSelected = new EventEmitter<Recipe>();
  private recipes: Recipe[] = [
    new Recipe(
      'Garlic Bread Chicken Sandwich',
      'Marinated Chicken Breast on a Garlic Bread Bun, with Granny Smith Apple, Romaine Lettuce and Goats Cheese',
      '../../assets/chicken-sandwich.jpg',
      [
        new Ingredient('Chicken Breast', 1),
        new Ingredient('Garlic Bread', 2),
        new Ingredient('Apple', 1),
        new Ingredient('Goat Cheese', 2),
        new Ingredient('Lettuce', 3),
      ]
    ),
    new Recipe(
      'PB & J Wings',
      'A Spicy Peanut Butter Satay Sauce and a light drizzle of a Berry Compote',
      '../../assets/peanut-butter-jelly-wings.jpg',
      [
        new Ingredient('Chicken Wings', 12),
        new Ingredient('Satay Sauce', 2),
        new Ingredient('Berries', 25),
        new Ingredient('Sugar', 1),
      ]
    ),
  ];

  constructor(private slService: ShoppingListService) {}

  getRecipes() {
    return this.recipes.slice();
  }

  addToShoppingList(ingredients: Ingredient[]) {
    this.slService.addIngredients(ingredients);
  }
}
