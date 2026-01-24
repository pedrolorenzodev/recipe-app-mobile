import React from "react";
import { Redirect, Stack } from "expo-router";
import { useAuth } from "@clerk/clerk-expo";

export default function AuthRoutesLayout(): React.ReactElement | null {
  const { isSignedIn } = useAuth();

  if (isSignedIn) return <Redirect href={"/" as any} />;

  return <Stack screenOptions={{ headerShown: false }} />;
}
