import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import {
  RECIPE_CARD_WIDTH,
  recipeCardStyles,
} from "../assets/styles/home.styles";
import { COLORS } from "../constants/colors";
import SkeletonBlock from "./SkeletonBlock";

const SHIMMER_WIDTH = RECIPE_CARD_WIDTH * 0.55;
const SHIMMER_DURATION = 1800;
const SHIMMER_COLORS = [
  "rgba(255,255,255,0)",
  "rgba(255,255,255,0.015)",
  "rgba(255,255,255,0.035)",
  "rgba(255,255,255,0.015)",
  "rgba(255,255,255,0)",
] as const;
const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

interface RecipeCardSkeletonProps {
  showDescription?: boolean;
}

export default function RecipeCardSkeleton({
  showDescription = true,
}: RecipeCardSkeletonProps): React.ReactElement {
  const cardHeight = showDescription ? 260 : 230;
  const shimmerTranslateX = useSharedValue(-SHIMMER_WIDTH);

  useEffect(() => {
    shimmerTranslateX.set(
      withRepeat(
        withTiming(RECIPE_CARD_WIDTH, {
          duration: SHIMMER_DURATION,
          easing: Easing.linear,
        }),
        -1,
        false,
      ),
    );

    return () => {
      cancelAnimation(shimmerTranslateX);
    };
  }, [shimmerTranslateX]);

  const shimmerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shimmerTranslateX.get() }],
  }));

  return (
    <View style={[recipeCardStyles.container, { minHeight: cardHeight }]}>
      <View style={skeletonStyles.surface}>
        <SkeletonBlock variant="image" style={skeletonStyles.image} />

        <View style={recipeCardStyles.content}>
          <SkeletonBlock style={skeletonStyles.titleLine1} />
          <SkeletonBlock style={skeletonStyles.titleLine2} />

          {showDescription && (
            <>
              <SkeletonBlock style={skeletonStyles.descLine1} />
              <SkeletonBlock style={skeletonStyles.descLine2} />
            </>
          )}

          <View style={recipeCardStyles.footer}>
            <View style={skeletonStyles.row}>
              <SkeletonBlock style={skeletonStyles.icon} />
              <SkeletonBlock style={skeletonStyles.timeText} />
            </View>
            <View style={skeletonStyles.row}>
              <SkeletonBlock style={skeletonStyles.icon} />
              <SkeletonBlock style={skeletonStyles.servingsText} />
            </View>
          </View>
        </View>

        <AnimatedLinearGradient
          pointerEvents="none"
          colors={SHIMMER_COLORS}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={[skeletonStyles.shimmer, shimmerStyle]}
        />
      </View>
    </View>
  );
}

const skeletonStyles = StyleSheet.create({
  surface: {
    flex: 1,
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: COLORS.card,
  },
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
  shimmer: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: SHIMMER_WIDTH,
  },
});
