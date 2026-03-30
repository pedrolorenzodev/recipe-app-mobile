import { AuthGateProvider } from "@/contexts/AuthGateContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { ClerkProvider, useAuth } from "@clerk/clerk-expo";
import { tokenCache } from "@clerk/clerk-expo/token-cache";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import * as Notifications from "expo-notifications";
import { Stack } from "expo-router";
import React from "react";
import { ActivityIndicator, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldSetBadge: true,
    shouldPlaySound: false,
  }),
});

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

if (!publishableKey) {
  throw new Error("Missing Publishable Key.");
}

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
    <BottomSheetModalProvider>
      <AuthGateProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen
            name="(auth)"
            options={{
              animation: "none",
              presentation: "card",
            }}
          />
          <Stack.Screen
            name="(tabs)"
            options={{
              animation: "none",
              presentation: "card",
            }}
          />
          <Stack.Screen name="recipe/[id]" />
        </Stack>
      </AuthGateProvider>
    </BottomSheetModalProvider>
  );
}

export default function RootLayout(): React.ReactElement {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ClerkProvider tokenCache={tokenCache} publishableKey={publishableKey}>
        <NotificationProvider>
          <RootLayoutNav />
        </NotificationProvider>
      </ClerkProvider>
    </GestureHandlerRootView>
  );
}
