import { ClerkProvider, useAuth } from "@clerk/clerk-expo";
import { tokenCache } from "@clerk/clerk-expo/token-cache";
import { Stack } from "expo-router";
import React from "react";
import { ActivityIndicator, View } from "react-native";

function RootLayoutNav(): React.ReactElement | null {
  const { isLoaded } = useAuth();

  if (!isLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" options={{ animation: "slide_from_left" }} />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="recipe/[id]" />
    </Stack>
  );
}

export default function RootLayout(): React.ReactElement {
  return (
    <ClerkProvider tokenCache={tokenCache}>
      <RootLayoutNav />
    </ClerkProvider>
  );
}
