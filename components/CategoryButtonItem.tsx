import { homeStyles } from "@/assets/styles/home.styles";
import { Category } from "@/types";
import { Image } from "expo-image";
import React, { useLayoutEffect } from "react";
import { Pressable, Text } from "react-native";
import Animated, {
    interpolate,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from "react-native-reanimated";

interface CategoryButtonItemProps {
  category: Category;
  isSelected: boolean;
  onSelectCategory: (categoryName: string) => void;
}

export function CategoryButtonItem({
  category,
  isSelected,
  onSelectCategory,
}: CategoryButtonItemProps): React.ReactElement {
  const progress = useSharedValue(isSelected ? 1 : 0);

  useLayoutEffect(() => {
    progress.value = withTiming(isSelected ? 1 : 0, { duration: 150 });
  }, [isSelected, progress]);

  const categoryButtonStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: interpolate(progress.value, [0, 1], [1, -6]) },
      { scale: interpolate(progress.value, [0, 1], [1, 1.06]) },
    ],
  }));

  return (
    <Animated.View style={categoryButtonStyle}>
      <Pressable
        style={({ pressed }) => [
          homeStyles.categoryButton,
          isSelected && homeStyles.selectedCategory,
          pressed && homeStyles.pressedCategory,
        ]}
        onPress={() => onSelectCategory(category.name)}
      >
        <Image
          source={{ uri: category.image }}
          style={[
            homeStyles.categoryImage,
            isSelected && homeStyles.selectedCategoryImage,
          ]}
          contentFit="cover"
          cachePolicy="memory-disk"
        />
        <Text
          style={[
            homeStyles.categoryText,
            isSelected && homeStyles.selectedCategoryText,
          ]}
        >
          {category.name}
        </Text>
      </Pressable>
    </Animated.View>
  );
}
