import { useAuth } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React from "react";
import { Pressable } from "react-native";
import { COLORS } from "../../constants/colors";
import { useAuthGate } from "../../contexts/AuthGateContext";

const TabsLayout = (): React.ReactElement => {
  const { isSignedIn } = useAuth();
  const { requireAuth } = useAuthGate();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textLight,
        tabBarButton: (props: any) => (
          <Pressable
            {...props}
            style={[
              props.style,
              {
                justifyContent: "center",
                alignItems: "center",
              },
            ]}
          >
            {props.children}
          </Pressable>
        ),
        tabBarStyle: {
          backgroundColor: "rgba(22, 22, 22, 0.92)",
          borderTopColor: "transparent",
          borderTopWidth: 0,
          position: "absolute",
          paddingBottom: 8,
          paddingTop: 8,
          height: 80,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Recipes",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="restaurant" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: "Search",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="search" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          title: "Favorites",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="heart" color={color} size={size} />
          ),
        }}
        listeners={{
          tabPress: (e) => {
            if (!isSignedIn) {
              e.preventDefault();
              requireAuth();
            }
          },
        }}
      />
    </Tabs>
  );
};

export default TabsLayout;
