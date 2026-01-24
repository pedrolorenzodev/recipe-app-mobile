import { ClerkProvider } from "@clerk/clerk-expo";
import { tokenCache } from "@clerk/clerk-expo/token-cache";
import { Stack } from "expo-router";
import React from "react";

export default function RootLayout(): React.ReactElement {
  return (
    <ClerkProvider tokenCache={tokenCache}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen
          name="(auth)"
          options={{ animation: "slide_from_left" }}
        />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="recipe/[id]" />
      </Stack>
    </ClerkProvider>
  );
}
