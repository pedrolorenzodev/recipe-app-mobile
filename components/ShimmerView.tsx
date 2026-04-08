import React from "react";
import { StyleSheet, ViewStyle } from "react-native";
import Animated from "react-native-reanimated";

const shimmerKeyframes = {
  from: { opacity: 0.4 },
  "50%": { opacity: 1 },
  to: { opacity: 0.4 },
};

interface ShimmerViewProps {
  style?: ViewStyle | ViewStyle[];
}

export default function ShimmerView({
  style,
}: ShimmerViewProps): React.ReactElement {
  return (
    <Animated.View
      style={[
        styles.base,
        style,
        {
          animationName: shimmerKeyframes,
          animationDuration: "1200ms",
          animationTimingFunction: "ease-in-out",
          animationIterationCount: "infinite",
        },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: "#1E1E1E",
    borderRadius: 8,
  },
});
