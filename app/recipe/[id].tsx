import { useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Linking,
    Pressable,
    ScrollView,
    StatusBar,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import Animated, {
    FadeIn,
    FadeOut,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from "react-native-reanimated";
import { recipeDetailStyles } from "../../assets/styles/recipe-detail.styles";
import LoadingSpinner from "../../components/LoadingSpinner";
import { API_URL } from "../../constants/api";
import { COLORS } from "../../constants/colors";
import { useAuthGate } from "../../contexts/AuthGateContext";
import { MealAPI } from "../../services/mealAPI";
import { Recipe } from "../../types";

interface RecipeWithVideo extends Recipe {
  youtubeUrl?: string | null;
}

const RecipeDetailScreen = (): React.ReactElement => {
  // "id" as the name of the file
  const { id: recipeId } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [recipe, setRecipe] = useState<RecipeWithVideo | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [clipboardCopied, setClipboardCopied] = useState<boolean>(false);

  const { user } = useUser();
  const userId = user?.id;
  const { requireAuth } = useAuthGate();
  const initialCheck = useRef(false);

  const heartFilling = useSharedValue(isSaved ? 1 : 0);

  const filteredInstructions = recipe?.instructions.filter((instruction) => {
    const normalizedInstruction = instruction.trim();

    // Remove empty values and "step X" indicator rows from the API payload.
    return (
      normalizedInstruction.length > 0 &&
      !/^step\s*\d+[\s:.-]*$/i.test(normalizedInstruction) &&
      !/^\d+$/.test(normalizedInstruction)
    );
  });

  useEffect(() => {
    if (!initialCheck.current) return;

    heartFilling.value = withSpring(isSaved ? 1 : 0, {
      damping: 8,
      stiffness: 150,
      mass: 0.5,
    });
  }, [heartFilling, isSaved, initialCheck]);

  const heartStyle = useAnimatedStyle(() => ({
    transform: [{ scale: heartFilling.value }],
    opacity: heartFilling.value,
  }));
  const heartOutlineStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 - heartFilling.value }],
    opacity: 1 - heartFilling.value,
  }));

  useEffect(() => {
    const checkIfSaved = async (): Promise<void> => {
      if (!userId) return;
      try {
        const response = await fetch(`${API_URL}/favorites/${userId}`);
        const favorites = await response.json();
        const isRecipeSaved = favorites.some(
          (fav: any) => fav.recipeId === parseInt(recipeId),
        );
        setIsSaved(isRecipeSaved);
        heartFilling.value = isRecipeSaved ? 1 : 0;
        initialCheck.current = true;
      } catch (error) {
        console.error("Error checking if recipe is saved", error);
      }
    };

    const loadRecipeDetail = async (): Promise<void> => {
      setLoading(true);
      try {
        const mealData = await MealAPI.getMealById(recipeId);
        if (mealData) {
          const transformedRecipe = MealAPI.transformMealData(mealData);

          if (transformedRecipe) {
            const recipeWithVideo: RecipeWithVideo = {
              ...transformedRecipe,
              youtubeUrl: mealData.strYoutube || null,
            };
            setRecipe(recipeWithVideo);
          }
        }
      } catch (error) {
        console.error("Error loading recipe detail", error);
      } finally {
        setLoading(false);
      }
    };

    checkIfSaved();
    loadRecipeDetail();
  }, [recipeId, userId]);

  const getYoutubeThumbnail = (url: string): string => {
    // example url: https://www.youtube.com/watch?v=dQw4w9WgXcQ
    const videoId = url.split("v=")[1];
    return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
  };

  const openYoutubeVideo = async (): Promise<void> => {
    if (!recipe?.youtubeUrl) return;

    try {
      await Linking.openURL(recipe.youtubeUrl);
    } catch (error) {
      console.error("Error opening YouTube video:", error);
      Alert.alert("Error", "Cannot open video");
    }
  };

  const handleToggleSave = async (): Promise<void> => {
    if (!recipe) return;
    if (!requireAuth()) return;

    setIsSaving(true);
    try {
      if (isSaved) {
        // remove from favorites
        setIsSaved(false);
        const response = await fetch(
          `${API_URL}/favorites/${userId}/${recipeId}`,
          {
            method: "DELETE",
          },
        );
        if (!response.ok) throw new Error("Failed to remove recipe");

        // setIsSaved(false);
      } else {
        // add to favorites
        setIsSaved(true);
        const response = await fetch(`${API_URL}/favorites`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId,
            recipeId: parseInt(recipeId),
            title: recipe.title,
            image: recipe.image,
            cookTime: recipe.cookTime,
            servings: recipe.servings,
          }),
        });
        if (!response.ok) throw new Error("Failed to save recipe");
        // setIsSaved(true);
      }
    } catch (error) {
      console.error("Error toggling recipe save:", error);
      Alert.alert("Error", `Something went wrong. Please try again.`);
    } finally {
      setIsSaving(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    await Clipboard.setStringAsync(text);
    setClipboardCopied(true);

    setTimeout(() => {
      setClipboardCopied(false);
    }, 2500);
  };

  const copiedToClipboardBadge = () => (
    <Animated.View
      style={recipeDetailStyles.textCopiedBadge}
      entering={FadeIn.duration(250)}
      exiting={FadeOut.duration(150)}
    >
      <Text style={recipeDetailStyles.textCopied}>Copied to clipboard!</Text>
    </Animated.View>
  );

  if (loading) return <LoadingSpinner message="Loading recipe details..." />;
  if (!recipe) return <LoadingSpinner message="Recipe not found..." />;

  return (
    <View style={{ ...recipeDetailStyles.container }}>
      <StatusBar hidden={true} />
      <ScrollView bounces={false}>
        {/* HEADER */}
        <View style={recipeDetailStyles.headerContainer}>
          <View style={recipeDetailStyles.imageContainer}>
            <Image
              source={{ uri: recipe.image }}
              style={recipeDetailStyles.headerImage}
              contentFit="cover"
            />
          </View>

          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.5)", "rgba(0,0,0,0.8)"]}
            style={recipeDetailStyles.gradientOverlay}
          />

          <View style={recipeDetailStyles.floatingButtons}>
            <Pressable
              style={({ pressed }) => [
                recipeDetailStyles.floatingButton,
                pressed && { opacity: 0.8 },
              ]}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={24} color={COLORS.white} />
            </Pressable>

            <Pressable
              style={[
                recipeDetailStyles.floatingButton,
                isSaved
                  ? recipeDetailStyles.recipeSavedShadow
                  : recipeDetailStyles.saveRecipeShadow,
              ]}
              onPress={handleToggleSave}
            >
              <Animated.View
                style={[heartStyle, recipeDetailStyles.floatingSaveButton]}
              >
                <Ionicons
                  name="heart"
                  size={24}
                  style={{ position: "absolute" }}
                  color={COLORS.red}
                />
              </Animated.View>
              <Animated.View
                style={[
                  heartOutlineStyle,
                  recipeDetailStyles.floatingSaveButton,
                ]}
              >
                <Ionicons
                  name="heart-outline"
                  size={24}
                  style={{ position: "absolute" }}
                  color={COLORS.white}
                />
              </Animated.View>
            </Pressable>
          </View>

          {/* Title Section */}
          <View style={recipeDetailStyles.titleSection}>
            <View style={recipeDetailStyles.categoryBadge}>
              <Text style={recipeDetailStyles.categoryText}>
                {recipe.category}
              </Text>
            </View>

            <Pressable
              style={({ pressed }) => [
                recipeDetailStyles.recipeTitleContainer,
                pressed && recipeDetailStyles.recipeTitlePressed,
              ]}
              onLongPress={() => copyToClipboard(recipe.title)}
            >
              {clipboardCopied && copiedToClipboardBadge()}
              <Text style={recipeDetailStyles.recipeTitle}>{recipe.title}</Text>
            </Pressable>

            {recipe.area && (
              <View style={recipeDetailStyles.locationRow}>
                <Ionicons name="location" size={16} color={COLORS.white} />
                <Text style={recipeDetailStyles.locationText}>
                  {recipe.area} Cuisine
                </Text>
              </View>
            )}
          </View>
        </View>

        <View style={recipeDetailStyles.contentSection}>
          {/* QUICK STATS */}
          <View style={recipeDetailStyles.statsContainer}>
            <View style={recipeDetailStyles.statCard}>
              <View style={recipeDetailStyles.statIconContainer}>
                <Ionicons name="time" size={20} color={COLORS.primary} />
              </View>
              <Text style={recipeDetailStyles.statValue}>
                {recipe.cookTime}
              </Text>
              <Text style={recipeDetailStyles.statLabel}>Prep Time</Text>
            </View>

            <View style={recipeDetailStyles.statCard}>
              <View style={recipeDetailStyles.statIconContainer}>
                <Ionicons name="people" size={20} color={COLORS.primary} />
              </View>
              <Text style={recipeDetailStyles.statValue}>
                {recipe.servings}
              </Text>
              <Text style={recipeDetailStyles.statLabel}>Servings</Text>
            </View>
          </View>

          {recipe.youtubeUrl && (
            <View style={recipeDetailStyles.sectionContainer}>
              <View style={recipeDetailStyles.sectionTitleRow}>
                <View style={recipeDetailStyles.sectionIcon}>
                  <Ionicons name="play" size={16} color={COLORS.primary} />
                </View>

                <Text style={recipeDetailStyles.sectionTitle}>
                  Video Tutorial
                </Text>
              </View>

              {/* VIDEO CARD */}
              <TouchableOpacity
                style={recipeDetailStyles.videoCard}
                onPress={openYoutubeVideo}
                activeOpacity={0.9}
              >
                <Image
                  source={{ uri: getYoutubeThumbnail(recipe.youtubeUrl) }}
                  style={recipeDetailStyles.webview}
                  contentFit="cover"
                />

                <View style={recipeDetailStyles.videoOverlay} />

                <View style={recipeDetailStyles.videoPlayButtonContainer}>
                  <View style={recipeDetailStyles.videoPlayButton}>
                    <Ionicons
                      name="play-sharp"
                      size={24}
                      color="#FFFFFF"
                      style={recipeDetailStyles.videoPlayIcon}
                    />
                  </View>
                </View>

                <View style={recipeDetailStyles.videoYoutubeBadge}>
                  <Ionicons name="logo-youtube" size={20} color="#FF0000" />
                  <Text style={recipeDetailStyles.videoYoutubeBadgeText}>
                    Watch on YouTube
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          )}

          {/* INGREDIENTS SECTION */}
          <View style={recipeDetailStyles.sectionContainer}>
            <View style={recipeDetailStyles.sectionTitleRow}>
              <View style={recipeDetailStyles.sectionIcon}>
                <Ionicons name="list" size={16} color={COLORS.primary} />
              </View>
              <Text style={recipeDetailStyles.sectionTitle}>Ingredients</Text>
              <View style={recipeDetailStyles.countBadge}>
                <Text style={recipeDetailStyles.countText}>
                  {recipe.ingredients.length}
                </Text>
              </View>
            </View>

            <View style={recipeDetailStyles.ingredientsGrid}>
              {recipe.ingredients.map((ingredient, index) => (
                <View style={recipeDetailStyles.ingredientCard} key={index}>
                  <View style={recipeDetailStyles.ingredientNumber}>
                    <Text style={recipeDetailStyles.ingredientNumberText}>
                      {index + 1}
                    </Text>
                  </View>
                  <Text style={recipeDetailStyles.ingredientText}>
                    {ingredient}
                  </Text>
                  <View style={recipeDetailStyles.ingredientCheck}>
                    <Ionicons
                      name="checkmark-circle-outline"
                      size={20}
                      color={COLORS.primary}
                    />
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* INSTRUCTIONS SECTION */}
          <View style={recipeDetailStyles.sectionContainer}>
            <View style={recipeDetailStyles.sectionTitleRow}>
              <View style={recipeDetailStyles.sectionIcon}>
                <Ionicons name="book" size={16} color={COLORS.primary} />
              </View>
              <Text style={recipeDetailStyles.sectionTitle}>Instructions</Text>
              <View style={recipeDetailStyles.countBadge}>
                <Text style={recipeDetailStyles.countText}>
                  {filteredInstructions?.length ?? 0}
                </Text>
              </View>
            </View>

            <View style={recipeDetailStyles.instructionsContainer}>
              {filteredInstructions?.map((instruction, index) => (
                <View style={recipeDetailStyles.instructionCard} key={index}>
                  <View style={recipeDetailStyles.stepIndicator}>
                    <Text style={recipeDetailStyles.stepNumber}>
                      {index + 1}
                    </Text>
                  </View>

                  <View style={recipeDetailStyles.instructionContent}>
                    <Text style={recipeDetailStyles.instructionText}>
                      {instruction} {/* FIXME: */}
                    </Text>
                    <View style={recipeDetailStyles.instructionFooter}>
                      <Text style={recipeDetailStyles.stepLabel}>
                        Step {index + 1}
                      </Text>
                      <TouchableOpacity
                        style={recipeDetailStyles.completeButton}
                      >
                        <Ionicons
                          name="checkmark"
                          size={16}
                          color={COLORS.primary}
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </View>

          <TouchableOpacity
            style={[
              recipeDetailStyles.primaryButton,
              isSaving && {
                opacity: 0.8,
              },
            ]}
            onPress={handleToggleSave}
            disabled={isSaving}
            activeOpacity={0.8}
          >
            {isSaving ? (
              <ActivityIndicator size="small" color={COLORS.white} />
            ) : (
              <>
                <Ionicons name="heart" size={20} color={COLORS.white} />
                <Text style={recipeDetailStyles.buttonText}>
                  {isSaved ? "Remove from Favorites" : "Add to Favorites"}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

export default RecipeDetailScreen;
