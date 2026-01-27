import React from "react";
import { View, FlatList } from "react-native";
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
    <FlatList
      data={skeletonData}
      renderItem={() => <RecipeCardSkeleton showDescription={showDescription} />}
      keyExtractor={(item) => `skeleton-${item}`}
      numColumns={2}
      columnWrapperStyle={homeStyles.row}
      contentContainerStyle={homeStyles.recipesGrid}
      scrollEnabled={false}
    />
  );
}
