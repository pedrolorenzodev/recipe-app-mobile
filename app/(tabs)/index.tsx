import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  FlatList,
  RefreshControl,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Carousel from "react-native-reanimated-carousel";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  CAROUSEL_HEIGHT,
  CAROUSEL_WIDTH,
  homeStyles,
} from "../../assets/styles/home.styles";
import CategoryFilter from "../../components/CategoryFilter";
import LoadingSpinner from "../../components/LoadingSpinner";
import RecipeCard from "../../components/RecipeCard";
import RecipeGridSkeleton from "../../components/RecipeGridSkeleton";
import { COLORS } from "../../constants/colors";
import { MealAPI } from "../../services/mealAPI";
import { Category, MealDBMeal, Recipe } from "../../types";

const HomeScreen = (): React.ReactElement => {
  const router = useRouter();
  const { top } = useSafeAreaInsets();
  const carouselRef = useRef<any>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredRecipes, setFeaturedRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [categoryLoading, setCategoryLoading] = useState<boolean>(false);
  const [categoryMealIds, setCategoryMealIds] = useState<string[]>([]);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(true);

  const loadData = async (): Promise<void> => {
    try {
      setLoading(true);

      // you can call this anything
      const [apiCategories, randomMeals, ...featuredMeals] = await Promise.all([
        MealAPI.getCategories(),
        MealAPI.getRandomMeals(14),
        MealAPI.getRandomMeal(),
        MealAPI.getRandomMeal(),
        MealAPI.getRandomMeal(),
        MealAPI.getRandomMeal(),
        MealAPI.getRandomMeal(),
      ]);

      const transformedCategories: Category[] = apiCategories.map(
        (cat, index) => ({
          id: index + 1,
          name: cat.strCategory,
          image: cat.strCategoryThumb,
          description: cat.strCategoryDescription,
        }),
      );

      setCategories(transformedCategories);

      const transformedMeals = randomMeals
        .map((meal) => MealAPI.transformMealData(meal))
        .filter((meal): meal is Recipe => meal !== null);
      setRecipes(transformedMeals);

      const transformedFeatured = featuredMeals
        .map((meal) => MealAPI.transformMealData(meal))
        .filter((meal): meal is Recipe => meal !== null);
      setFeaturedRecipes(transformedFeatured);
    } catch (error) {
      console.log("Error loading the data", error);
    } finally {
      setLoading(false);
    }
  };

  const loadCategoryData = async (category: string): Promise<void> => {
    try {
      const meals = await MealAPI.filterByCategory(category);

      // Store all meal IDs for "load more" functionality
      const allMealIds = meals
        .filter((meal) => meal?.idMeal)
        .map((meal) => meal.idMeal);

      setCategoryMealIds(allMealIds);
      setHasMore(allMealIds.length > 14);

      // Load first 14 meals
      const firstBatch = allMealIds.slice(0, 14);
      await loadMealsByIds(firstBatch, false);
    } catch (error) {
      console.error("Error loading category data:", error);
      setRecipes([]);
      setCategoryMealIds([]);
      setHasMore(false);
    }
  };

  const loadMealsByIds = async (
    mealIds: string[],
    append: boolean = false,
  ): Promise<void> => {
    try {
      // Fetch full details in smaller batches to avoid overwhelming the API
      const batchSize = 5;
      const detailedMeals: (MealDBMeal | null)[] = [];

      for (let i = 0; i < mealIds.length; i += batchSize) {
        const batch = mealIds.slice(i, i + batchSize);
        const batchResults = await Promise.all(
          batch.map((id) => MealAPI.getMealById(id)),
        );
        detailedMeals.push(...batchResults);
      }

      const transformedMeals = detailedMeals
        .map((meal) => MealAPI.transformMealData(meal))
        .filter((meal): meal is Recipe => meal !== null);

      if (append) {
        setRecipes((prev) => [...prev, ...transformedMeals]);
      } else {
        setRecipes(transformedMeals);
      }
    } catch (error) {
      console.error("Error loading meals by IDs:", error);
    }
  };

  const loadRandomMeals = async (): Promise<void> => {
    try {
      const randomMeals = await MealAPI.getRandomMeals(14);
      const transformedMeals = randomMeals
        .map((meal) => MealAPI.transformMealData(meal))
        .filter((meal): meal is Recipe => meal !== null);
      setRecipes(transformedMeals);
      setCategoryMealIds([]);
      setHasMore(true); // Always can load more random meals
    } catch (error) {
      console.error("Error loading random meals:", error);
      setRecipes([]);
    }
  };

  const loadMoreRecipes = async (): Promise<void> => {
    if (loadingMore || !hasMore) return;

    setLoadingMore(true);

    try {
      if (selectedCategory && categoryMealIds.length > 0) {
        // Load more from category
        const currentCount = recipes.length;
        const nextBatch = categoryMealIds.slice(
          currentCount,
          currentCount + 14,
        );

        if (nextBatch.length === 0) {
          setHasMore(false);
          return;
        }

        await loadMealsByIds(nextBatch, true);
        setHasMore(categoryMealIds.length > currentCount + nextBatch.length);
      } else {
        // Load more random meals
        const randomMeals = await MealAPI.getRandomMeals(14);
        const transformedMeals = randomMeals
          .map((meal) => MealAPI.transformMealData(meal))
          .filter((meal): meal is Recipe => meal !== null);

        setRecipes((prev) => [...prev, ...transformedMeals]);
      }
    } catch (error) {
      console.error("Error loading more recipes:", error);
    } finally {
      setLoadingMore(false);
    }
  };

  const handleCategorySelect = async (category: string): Promise<void> => {
    // Toggle: if clicking the same category, deselect it
    if (selectedCategory === category) {
      setSelectedCategory(null);
      setCategoryLoading(true);
      await loadRandomMeals();
      setCategoryLoading(false);
      return;
    }

    // Select new category
    setSelectedCategory(category);
    setCategoryLoading(true);
    await loadCategoryData(category);
    setCategoryLoading(false);
  };

  const handleRefresh = async (): Promise<void> => {
    setRefreshing(true);
    setSelectedCategory(null);
    setCategoryMealIds([]);
    setHasMore(true);
    await loadData();
    setRefreshing(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  // Auto-scroll carousel every 5 seconds
  useEffect(() => {
    if (featuredRecipes.length <= 1) return;

    const interval = setInterval(() => {
      carouselRef.current?.next();
    }, 5000);

    return () => clearInterval(interval);
  }, [featuredRecipes]);

  if (loading && !refreshing)
    return <LoadingSpinner message="Loading delicious recipes..." />;

  return (
    <View style={{ ...homeStyles.container, paddingTop: top }}>
      <StatusBar hidden={false} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={COLORS.primary}
          />
        }
        contentContainerStyle={homeStyles.scrollContent}
      >
        {/* FEATURED CAROUSEL */}
        {featuredRecipes.length > 0 && (
          <View style={homeStyles.featuredSection}>
            <Carousel
              ref={carouselRef}
              loop={featuredRecipes.length > 1}
              width={CAROUSEL_WIDTH}
              height={CAROUSEL_HEIGHT}
              data={featuredRecipes}
              scrollAnimationDuration={500}
              mode="parallax"
              modeConfig={{
                parallaxScrollingScale: 0.92,
                parallaxScrollingOffset: 60,
              }}
              renderItem={({ item: featuredRecipe }) => (
                <TouchableOpacity
                  style={homeStyles.featuredCard}
                  activeOpacity={0.9}
                  onPress={() =>
                    router.push(`/recipe/${featuredRecipe.id}` as any)
                  }
                >
                  <View style={homeStyles.featuredImageContainer}>
                    <Image
                      source={{ uri: featuredRecipe.image }}
                      style={homeStyles.featuredImage}
                      contentFit="cover"
                      transition={500}
                    />
                    <LinearGradient
                      colors={[
                        "transparent",
                        "rgba(0,0,0,0.05)",
                        "rgba(0,0,0,0.3)",
                        "rgba(0,0,0,0.6)",
                        "rgba(0,0,0,0.85)",
                      ]}
                      locations={[0, 0.3, 0.5, 0.7, 1]}
                      style={homeStyles.featuredOverlay}
                    >
                      <View style={homeStyles.featuredBadge}>
                        <Text style={homeStyles.featuredBadgeText}>
                          Featured
                        </Text>
                      </View>

                      <View style={homeStyles.featuredContent}>
                        <Text
                          style={homeStyles.featuredTitle}
                          numberOfLines={1}
                        >
                          {featuredRecipe.title}
                        </Text>

                        <View style={homeStyles.featuredMeta}>
                          <View style={homeStyles.metaItem}>
                            <Ionicons
                              name="time-outline"
                              size={16}
                              color={COLORS.white}
                            />
                            <Text style={homeStyles.metaText}>
                              {featuredRecipe.cookTime}
                            </Text>
                          </View>
                          <View style={homeStyles.metaItem}>
                            <Ionicons
                              name="people-outline"
                              size={16}
                              color={COLORS.white}
                            />
                            <Text style={homeStyles.metaText}>
                              {featuredRecipe.servings}
                            </Text>
                          </View>
                          {featuredRecipe.area && (
                            <View style={homeStyles.metaItem}>
                              <Ionicons
                                name="location-outline"
                                size={16}
                                color={COLORS.white}
                              />
                              <Text style={homeStyles.metaText}>
                                {featuredRecipe.area}
                              </Text>
                            </View>
                          )}
                        </View>
                      </View>
                    </LinearGradient>
                  </View>
                </TouchableOpacity>
              )}
            />
          </View>
        )}

        {categories.length > 0 && (
          <CategoryFilter
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={handleCategorySelect}
          />
        )}

        <View style={homeStyles.recipesSection}>
          <View style={homeStyles.sectionHeader}>
            <Text style={homeStyles.sectionTitle}>
              {selectedCategory || "Discover Recipes"}
            </Text>
          </View>

          {refreshing || categoryLoading ? (
            <RecipeGridSkeleton count={14} />
          ) : recipes.length > 0 ? (
            <>
              <FlatList
                data={recipes}
                renderItem={({ item }) => <RecipeCard recipe={item} />}
                keyExtractor={(item) => item.id.toString()}
                numColumns={2}
                columnWrapperStyle={homeStyles.row}
                contentContainerStyle={homeStyles.recipesGrid}
                scrollEnabled={false}
              />

              {hasMore && (
                <TouchableOpacity
                  style={homeStyles.loadMoreButton}
                  onPress={loadMoreRecipes}
                  disabled={loadingMore}
                  activeOpacity={0.7}
                >
                  {loadingMore ? (
                    <View style={homeStyles.loadMoreContent}>
                      <Text style={homeStyles.loadMoreText}>Loading...</Text>
                    </View>
                  ) : (
                    <View style={homeStyles.loadMoreContent}>
                      <Ionicons
                        name="add-circle-outline"
                        size={20}
                        color={COLORS.primary}
                      />
                      <Text style={homeStyles.loadMoreText}>
                        Load More Recipes
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              )}
            </>
          ) : (
            <View style={homeStyles.emptyState}>
              <Ionicons
                name="restaurant-outline"
                size={64}
                color={COLORS.textLight}
              />
              <Text style={homeStyles.emptyTitle}>No recipes found</Text>
              <Text style={homeStyles.emptyDescription}>
                Try a different category
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default HomeScreen;
