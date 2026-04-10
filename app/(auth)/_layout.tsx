import { COLORS } from "@/constants/colors";
import { useAuth } from "@clerk/clerk-expo";
import { Redirect, Stack } from "expo-router";
import React from "react";

export default function AuthRoutesLayout(): React.ReactElement | null {
  const { isSignedIn } = useAuth();

  if (isSignedIn) return <Redirect href={"/" as any} />;

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: COLORS.background },
      }}
    >
      <Stack.Screen
        name="sign-in"
        options={{
          animation: "default",
        }}
      />
      <Stack.Screen
        name="sign-up"
        options={{
          animation: "default",
        }}
      />
      <Stack.Screen
        name="verify-code"
        options={{
          animation: "slide_from_right",
          presentation: "card",
        }}
      />
    </Stack>
  );
}
