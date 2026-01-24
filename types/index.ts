// ============================================================================
// API Types - TheMealDB API Response Types
// ============================================================================

export interface MealDBMeal {
  idMeal: string;
  strMeal: string;
  strMealThumb: string;
  strCategory: string;
  strArea: string;
  strInstructions: string;
  strYoutube?: string;
  strTags?: string | null;
  strSource?: string;
  strImageSource?: string | null;
  strCreativeCommonsConfirmed?: string | null;
  dateModified?: string | null;
  // Dynamic ingredient/measure fields
  [key: `strIngredient${number}`]: string | undefined;
  [key: `strMeasure${number}`]: string | undefined;
}

export interface MealDBCategory {
  idCategory: string;
  strCategory: string;
  strCategoryThumb: string;
  strCategoryDescription: string;
}

export interface MealDBSearchResponse {
  meals: MealDBMeal[] | null;
}

export interface MealDBCategoriesResponse {
  categories: MealDBCategory[] | null;
}

// ============================================================================
// App Domain Types
// ============================================================================

export interface Recipe {
  id: string;
  title: string;
  description: string;
  image: string;
  cookTime: string;
  servings: number;
  category: string;
  area?: string;
  ingredients: string[];
  instructions: string[];
  originalData: MealDBMeal;
}

export interface Category {
  id: number;
  name: string;
  image: string;
  description?: string;
}

export interface FavoriteRecipe {
  recipeId: number;
  userId: string;
  title: string;
  description?: string;
  image: string;
  cookTime: string;
  servings: string | number;
  id?: number; // Transformed for RecipeCard compatibility
}

// ============================================================================
// Component Props Types
// ============================================================================

export interface RecipeCardProps {
  recipe: Recipe | FavoriteRecipe;
}

export interface CategoryFilterProps {
  categories: Category[];
  selectedCategory: string | null;
  onSelectCategory: (category: string) => void;
}

export interface LoadingSpinnerProps {
  message?: string;
  size?: "small" | "large";
}

export interface SafeScreenProps {
  children: React.ReactNode;
}

// ============================================================================
// Navigation Types (Expo Router)
// ============================================================================

export interface RecipeParams {
  id: string;
}

// ============================================================================
// API Service Types
// ============================================================================

export interface MealAPIService {
  searchMealsByName: (query: string) => Promise<MealDBMeal[]>;
  getMealById: (id: string) => Promise<MealDBMeal | null>;
  getRandomMeal: () => Promise<MealDBMeal | null>;
  getRandomMeals: (count?: number) => Promise<MealDBMeal[]>;
  getCategories: () => Promise<MealDBCategory[]>;
  filterByIngredient: (ingredient: string) => Promise<MealDBMeal[]>;
  filterByCategory: (category: string) => Promise<MealDBMeal[]>;
  transformMealData: (meal: MealDBMeal | null) => Recipe | null;
}

// ============================================================================
// Theme Types (for colors)
// ============================================================================

export interface ThemeColors {
  primary: string;
  primaryDark: string;
  primaryLight: string;
  secondary: string;
  secondaryDark: string;
  secondaryLight: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  textLight: string;
  textDark: string;
  white: string;
  black: string;
  error: string;
  success: string;
  warning: string;
  info: string;
  border: string;
  shadow: string;
  overlay: string;
  disabled: string;
  card: string;
  gradientStart: string;
  gradientEnd: string;
}

export interface Theme {
  name: string;
  colors: ThemeColors;
}

export interface ThemesCollection {
  coffee: Theme;
  forest: Theme;
  ocean: Theme;
  sunset: Theme;
  purple: Theme;
  minimal: Theme;
}
