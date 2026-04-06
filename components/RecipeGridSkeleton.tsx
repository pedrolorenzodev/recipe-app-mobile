import React from "react";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { homeStyles } from "../assets/styles/home.styles";
import RecipeCardSkeleton from "./RecipeCardSkeleton";

interface RecipeGridSkeletonProps {
  count?: number;
  showDescription?: boolean;
}

export default function RecipeGridSkeleton({
  count = 6,
  showDescription = true,
}: RecipeGridSkeletonProps): React.ReactElement {
  const skeletonData = Array.from({ length: count }, (_, i) => i);

  return (
    <Animated.FlatList
      entering={FadeIn.duration(250)}
      exiting={FadeOut.duration(150)}
      data={skeletonData}
      renderItem={() => (
        <RecipeCardSkeleton showDescription={showDescription} />
      )}
      keyExtractor={(item) => `skeleton-${item}`}
      numColumns={2}
      columnWrapperStyle={homeStyles.row}
      contentContainerStyle={homeStyles.recipesGrid}
      scrollEnabled={false}
    />
  );
}
