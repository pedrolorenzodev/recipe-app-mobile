import React from "react";
import { StyleSheet, View } from "react-native";
import { recipeCardStyles } from "../assets/styles/home.styles";
import { COLORS } from "../constants/colors";

interface RecipeCardSkeletonProps {
  showDescription?: boolean;
}

export default function RecipeCardSkeleton({
  showDescription = true,
}: RecipeCardSkeletonProps): React.ReactElement {
  return (
    <View style={recipeCardStyles.container}>
      {/* Image skeleton */}
      <View style={[recipeCardStyles.imageContainer, skeletonStyles.shimmer]} />

      <View style={recipeCardStyles.content}>
        {/* Title skeleton (2 lines) */}
        <View style={skeletonStyles.titleLine1} />
        <View style={skeletonStyles.titleLine2} />

        {/* Description skeleton (2 lines) - conditional */}
        {showDescription && (
          <>
            <View style={skeletonStyles.descLine1} />
            <View style={skeletonStyles.descLine2} />
          </>
        )}

        {/* Footer skeleton */}
        <View style={recipeCardStyles.footer}>
          <View style={skeletonStyles.timeContainer}>
            <View style={skeletonStyles.icon} />
            <View style={skeletonStyles.timeText} />
          </View>
          <View style={skeletonStyles.servingsContainer}>
            <View style={skeletonStyles.icon} />
            <View style={skeletonStyles.servingsText} />
          </View>
        </View>
      </View>
    </View>
  );
}

const skeletonStyles = StyleSheet.create({
  shimmer: {
    backgroundColor: COLORS.border,
  },
  titleLine1: {
    height: 16,
    backgroundColor: COLORS.border,
    borderRadius: 4,
    marginBottom: 6,
    width: "100%",
  },
  titleLine2: {
    height: 16,
    backgroundColor: COLORS.border,
    borderRadius: 4,
    marginBottom: 8,
    width: "75%",
  },
  descLine1: {
    height: 12,
    backgroundColor: COLORS.border,
    borderRadius: 4,
    marginBottom: 4,
    width: "100%",
  },
  descLine2: {
    height: 12,
    backgroundColor: COLORS.border,
    borderRadius: 4,
    marginBottom: 10,
    width: "90%",
  },
  timeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  servingsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  icon: {
    width: 14,
    height: 14,
    backgroundColor: COLORS.border,
    borderRadius: 7,
  },
  timeText: {
    width: 45,
    height: 11,
    backgroundColor: COLORS.border,
    borderRadius: 4,
  },
  servingsText: {
    width: 20,
    height: 11,
    backgroundColor: COLORS.border,
    borderRadius: 4,
  },
});
