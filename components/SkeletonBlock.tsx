import React from "react";
import { StyleSheet, StyleProp, View, ViewStyle } from "react-native";

const SKELETON_BASE = "#232323";
const SKELETON_IMAGE_BASE = "#212121";

type SkeletonBlockVariant = "default" | "image";

interface SkeletonBlockProps {
  style?: StyleProp<ViewStyle>;
  variant?: SkeletonBlockVariant;
}

export default function SkeletonBlock({
  style,
  variant = "default",
}: SkeletonBlockProps): React.ReactElement {
  return (
    <View
      style={[
        styles.base,
        variant === "image" ? styles.image : styles.default,
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 8,
  },
  default: {
    backgroundColor: SKELETON_BASE,
  },
  image: {
    backgroundColor: SKELETON_IMAGE_BASE,
  },
});
