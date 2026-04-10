import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React from "react";
import { Pressable, Text, View } from "react-native";
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from "react-native-reanimated";
import { recipeCardStyles } from "../assets/styles/home.styles";
import { COLORS } from "../constants/colors";
import { RecipeCardProps } from "../types";

const SPRING_CONFIG = { damping: 15, stiffness: 200, mass: 0.5 } as const;

export default function RecipeCard({
  recipe,
  showDescription = true,
}: RecipeCardProps): React.ReactElement {
  const router = useRouter();
  const scale = useSharedValue(1);

  const cardHeight = showDescription ? 260 : 230;

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.97, SPRING_CONFIG);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, SPRING_CONFIG);
  };

  const handlePress = () => {
    router.navigate(`/recipe/${recipe.id}` as any);
  };

  const getCleanDescription = (description?: string | null): string => {
    if (!description) return "";

    let cleaned = description.trim();

    // "Step 1", "STEP 1"
    cleaned = cleaned.replace(/^step\s*\d+[\s:.-]*/i, "");
    // "1\n", "2\n"
    cleaned = cleaned.replace(/^\d+\s*\n+/, "");
    // "1." or "2)"
    cleaned = cleaned.replace(/^\d+\s*[\.\)-]\s*/, "");
    // checkbox-like symbols
    cleaned = cleaned.replace(/^[▢•▪◦●]\s*/, "");

    cleaned = cleaned.trim();

    return cleaned;
  };
  const filteredDescription = getCleanDescription(recipe.description)

  return (
    <Pressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Animated.View
        style={[
          recipeCardStyles.container,
          animatedStyle,
          { minHeight: cardHeight },
        ]}
      >
        <View style={recipeCardStyles.imageContainer}>
          <Image
            source={{ uri: recipe.image }}
            style={recipeCardStyles.image}
            contentFit="cover"
            transition={300}
          />
        </View>

        <View style={recipeCardStyles.content}>
          <Text style={recipeCardStyles.title} numberOfLines={2}>
            {recipe.title}
          </Text>
          {filteredDescription && (
            <Text style={recipeCardStyles.description} numberOfLines={2}>
              {filteredDescription}
            </Text>
          )}

          <View style={recipeCardStyles.footer}>
            {recipe.cookTime && (
              <View style={recipeCardStyles.timeContainer}>
                <Ionicons
                  name="time-outline"
                  size={14}
                  color={COLORS.textLight}
                />
                <Text style={recipeCardStyles.timeText}>{recipe.cookTime}</Text>
              </View>
            )}
            {recipe.servings && (
              <View style={recipeCardStyles.servingsContainer}>
                <Ionicons
                  name="people-outline"
                  size={14}
                  color={COLORS.textLight}
                />
                <Text style={recipeCardStyles.servingsText}>
                  {recipe.servings}
                </Text>
              </View>
            )}
          </View>
        </View>
      </Animated.View>
    </Pressable>
  );
}
