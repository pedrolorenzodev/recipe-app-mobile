import React from "react";
import { StatusBar, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { searchStyles } from "../assets/styles/search.styles";
import { COLORS } from "../constants/colors";
import RecipeGridSkeleton from "./RecipeGridSkeleton";

export default function SearchScreenSkeleton(): React.ReactElement {
  const { top } = useSafeAreaInsets();

  return (
    <View style={{ ...searchStyles.container, paddingTop: top }}>
      <StatusBar hidden={false} />

      {/* Search Section Skeleton */}
      <View style={searchStyles.searchSection}>
        <View style={searchStyles.searchContainer}>
          {/* Search icon skeleton */}
          <View style={[skeletonStyles.searchIcon, searchStyles.searchIcon]} />
          {/* Search input skeleton */}
          <View style={skeletonStyles.searchInput} />
        </View>
      </View>

      {/* Results Section Skeleton */}
      <View style={searchStyles.resultsSection}>
        <View style={searchStyles.resultsHeader}>
          {/* Results title skeleton */}
          <View style={skeletonStyles.resultsTitle} />
          {/* Results count skeleton */}
          <View style={skeletonStyles.resultsCount} />
        </View>

        {/* Recipe Cards Grid Skeleton */}
        <RecipeGridSkeleton count={12} />
      </View>
    </View>
  );
}

const skeletonStyles = StyleSheet.create({
  searchIcon: {
    width: 20,
    height: 20,
    backgroundColor: COLORS.border,
    borderRadius: 10,
  },
  searchInput: {
    flex: 1,
    height: 20,
    backgroundColor: COLORS.border,
    borderRadius: 4,
  },
  resultsTitle: {
    height: 18,
    width: 140,
    backgroundColor: COLORS.border,
    borderRadius: 4,
  },
  resultsCount: {
    height: 14,
    width: 60,
    backgroundColor: COLORS.border,
    borderRadius: 4,
  },
});
