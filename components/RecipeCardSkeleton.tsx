import React from "react";
import { StyleSheet, View } from "react-native";
import { recipeCardStyles } from "../assets/styles/home.styles";
import ShimmerView from "./ShimmerView";

interface RecipeCardSkeletonProps {
  showDescription?: boolean;
}

export default function RecipeCardSkeleton({
  showDescription = true,
}: RecipeCardSkeletonProps): React.ReactElement {
  const cardHeight = showDescription ? 260 : 230;

  return (
    <View style={[recipeCardStyles.container, { minHeight: cardHeight }]}>
      {/* Image skeleton */}
      <ShimmerView style={skeletonStyles.image} />

      <View style={recipeCardStyles.content}>
        {/* Title skeleton (2 lines) */}
        <ShimmerView style={skeletonStyles.titleLine1} />
        <ShimmerView style={skeletonStyles.titleLine2} />

        {/* Description skeleton (2 lines) - conditional */}
        {showDescription && (
          <>
            <ShimmerView style={skeletonStyles.descLine1} />
            <ShimmerView style={skeletonStyles.descLine2} />
          </>
        )}

        {/* Footer skeleton */}
        <View style={recipeCardStyles.footer}>
          <View style={skeletonStyles.row}>
            <ShimmerView style={skeletonStyles.icon} />
            <ShimmerView style={skeletonStyles.timeText} />
          </View>
          <View style={skeletonStyles.row}>
            <ShimmerView style={skeletonStyles.icon} />
            <ShimmerView style={skeletonStyles.servingsText} />
          </View>
        </View>
      </View>
    </View>
  );
}

const skeletonStyles = StyleSheet.create({
  image: {
    height: 140,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    borderRadius: 0,
  },
  titleLine1: {
    height: 14,
    marginBottom: 6,
    width: "100%",
  },
  titleLine2: {
    height: 14,
    marginBottom: 8,
    width: "75%",
  },
  descLine1: {
    height: 11,
    marginBottom: 5,
    width: "100%",
  },
  descLine2: {
    height: 11,
    marginBottom: 10,
    width: "90%",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  icon: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  timeText: {
    width: 45,
    height: 11,
  },
  servingsText: {
    width: 20,
    height: 11,
  },
});
