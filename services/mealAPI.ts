import {
  MealDBMeal,
  MealDBCategory,
  MealDBSearchResponse,
  MealDBCategoriesResponse,
  Recipe,
  MealAPIService,
} from "../types";

const BASE_URL = "https://www.themealdb.com/api/json/v1/1";

export const MealAPI: MealAPIService = {
  // search meals by name
  searchMealsByName: async (query: string): Promise<MealDBMeal[]> => {
    try {
      const response = await fetch(
        `${BASE_URL}/search.php?s=${encodeURIComponent(query)}`
      );
      // "encodeURIComponent" chicken and rice => %20 => Chicken%20and%20Rice
      const data: MealDBSearchResponse = await response.json();
      return data.meals || [];
    } catch (error) {
      console.error("Error searching meals by name", error);
      return [];
    }
  },

  // lookup full meal details by id
  getMealById: async (id: string): Promise<MealDBMeal | null> => {
    try {
      const response = await fetch(`${BASE_URL}/lookup.php?i=${id}`);
      const data: MealDBSearchResponse = await response.json();
      return data.meals ? data.meals[0] : null;
    } catch (error) {
      console.error("Error getting meals by id", error);
      return null;
    }
  },

  // lookup a single random meal
  getRandomMeal: async (): Promise<MealDBMeal | null> => {
    try {
      const response = await fetch(`${BASE_URL}/random.php`);
      const data: MealDBSearchResponse = await response.json();
      return data.meals ? data.meals[0] : null;
    } catch (error) {
      console.error("Error getting random meal", error);
      return null;
    }
  },

  // get multiple random meals
  getRandomMeals: async (count: number = 6): Promise<MealDBMeal[]> => {
    try {
      const promises = Array(count)
        .fill(null)
        .map(() => MealAPI.getRandomMeal());
      const meals = await Promise.all(promises);
      return meals.filter((meal): meal is MealDBMeal => meal !== null);
    } catch (error) {
      console.error("Error getting random meals", error);
      return [];
    }
  },

  // list all meal categories
  getCategories: async (): Promise<MealDBCategory[]> => {
    try {
      const response = await fetch(`${BASE_URL}/categories.php`);
      const data: MealDBCategoriesResponse = await response.json();
      return data.categories || [];
    } catch (error) {
      console.error("Error getting categories", error);
      return [];
    }
  },

  // filter by main ingredient
  filterByIngredient: async (ingredient: string): Promise<MealDBMeal[]> => {
    try {
      const response = await fetch(
        `${BASE_URL}/filter.php?i=${encodeURIComponent(ingredient)}`
      );
      const data: MealDBSearchResponse = await response.json();
      return data.meals || [];
    } catch (error) {
      console.error("Error filtering by ingredient", error);
      return [];
    }
  },

  // filter by category
  filterByCategory: async (category: string): Promise<MealDBMeal[]> => {
    try {
      const response = await fetch(
        `${BASE_URL}/filter.php?c=${encodeURIComponent(category)}`
      );
      const data: MealDBSearchResponse = await response.json();
      return data.meals || [];
    } catch (error) {
      console.error("Error filtering by category", error);
      return [];
    }
  },

  // transform TheMealDB meal data to our app format
  transformMealData: (meal: MealDBMeal | null): Recipe | null => {
    if (!meal) return null;

    // extract ingredients from the meal object
    const ingredients: string[] = [];
    for (let i = 1; i <= 20; i++) {
      const ingredient = meal[`strIngredient${i}` as keyof MealDBMeal];
      const measure = meal[`strMeasure${i}` as keyof MealDBMeal];

      if (ingredient && typeof ingredient === "string" && ingredient.trim()) {
        const measureText =
          measure && typeof measure === "string" && measure.trim()
            ? ` ${measure.trim()}`
            : "";
        ingredients.push(`${measureText}${ingredient.trim()}`);
      }
    }

    // extract instructions
    const instructions = meal.strInstructions
      ? meal.strInstructions
          .split(/\r?\n/)
          .filter((step) => step.trim())
      : [];

    return {
      id: meal.idMeal,
      title: meal.strMeal,
      description: meal.strInstructions
        ? meal.strInstructions.substring(0, 120) + "..."
        : "Delicious meal from TheMealDB",
      image: meal.strMealThumb,
      cookTime: "30 minutes",
      servings: 4,
      category: meal.strCategory || "Main Course",
      area: meal.strArea,
      ingredients,
      instructions,
      originalData: meal,
    };
  },
};
