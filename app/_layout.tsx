import { COLORS } from "@/constants/colors";
import { NAVIGATION_THEME } from "@/constants/navigationTheme";
import { AuthGateProvider } from "@/contexts/AuthGateContext";
import { useNotificationObserver } from "@/hooks/useNotificationObserver";
import { ClerkProvider, useAuth } from "@clerk/clerk-expo";
import { tokenCache } from "@clerk/clerk-expo/token-cache";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { ThemeProvider } from "@react-navigation/native";
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
  useNotificationObserver(isLoaded);

  if (!isLoaded) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: COLORS.background,
        }}
      >
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <BottomSheetModalProvider>
      <AuthGateProvider>
        <ThemeProvider value={NAVIGATION_THEME}>
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: COLORS.background },
            }}
          >
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
        </ThemeProvider>
      </AuthGateProvider>
    </BottomSheetModalProvider>
  );
}

export default function RootLayout(): React.ReactElement {
  return (
    <GestureHandlerRootView
      style={{ flex: 1, backgroundColor: COLORS.background }}
    >
      <ClerkProvider tokenCache={tokenCache} publishableKey={publishableKey}>
        <RootLayoutNav />
      </ClerkProvider>
    </GestureHandlerRootView>
  );
}
