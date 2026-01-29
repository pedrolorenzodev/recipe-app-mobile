import { useClerk, useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import React, { useCallback, useState } from "react";
import {
  Alert,
  FlatList,
  RefreshControl,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { favoritesStyles } from "../../assets/styles/favorites.styles";
import NoFavoritesFound from "../../components/NoFavoritesFound";
import RecipeCard from "../../components/RecipeCard";
import RecipeGridSkeleton from "../../components/RecipeGridSkeleton";
import { API_URL } from "../../constants/api";
import { COLORS } from "../../constants/colors";
import { FavoriteRecipe } from "../../types";

const PRIVACY_POLICY_URL =
  "https://pedrolorenzodev.github.io/recipe-finder-privacy/privacy.html";
const TERMS_OF_SERVICE_URL =
  "https://pedrolorenzodev.github.io/recipe-finder-privacy/terms.html";

const FavoritesScreen = (): React.ReactElement => {
  const { signOut } = useClerk();
  const { user } = useUser();
  const { top } = useSafeAreaInsets();
  const [favoriteRecipes, setFavoriteRecipes] = useState<FavoriteRecipe[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const loadFavorites = useCallback(async (): Promise<void> => {
    try {
      const response = await fetch(`${API_URL}/favorites/${user?.id}`);
      if (!response.ok) throw new Error("Failed to fetch favorites");

      const favorites: FavoriteRecipe[] = await response.json();

      // transform de data to match the RecipeCard component's expected format
      const transformedFavorites = favorites.map((favorite) => ({
        ...favorite,
        id: favorite.recipeId,
      }));

      setFavoriteRecipes(transformedFavorites);
    } catch (error) {
      console.log("Error loading favorites", error);
      Alert.alert("Error", "Failed to load favorites");
    }
  }, [user?.id]);

  const handleRefresh = async (): Promise<void> => {
    setRefreshing(true);
    await loadFavorites();
    setRefreshing(false);
  };

  // Load favorites when the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      const loadData = async (): Promise<void> => {
        setLoading(true);
        await loadFavorites();
        setLoading(false);
      };

      loadData();
    }, [loadFavorites]),
  );

  const handleSignOut = (): void => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: () => signOut(),
      },
    ]);
  };

  const handleOpenLink = async (url: string): Promise<void> => {
    try {
      await WebBrowser.openBrowserAsync(url);
    } catch (error) {
      console.log("Error opening link:", error);
      Alert.alert("Error", "Could not open link");
    }
  };

  const handleDeleteAccount = (): void => {
    Alert.alert(
      "Delete Account",
      "This will permanently delete your account and all saved recipes. This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            // Second confirmation
            Alert.alert(
              "Are you absolutely sure?",
              "Your account will be permanently deleted. You will not be able to log in again with these credentials.",
              [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Delete Forever",
                  style: "destructive",
                  onPress: executeAccountDeletion,
                },
              ],
            );
          },
        },
      ],
    );
  };

  const executeAccountDeletion = async (): Promise<void> => {
    try {
      // Step 1: Delete from Clerk (this is the source of truth)
      await user?.delete();

      // Step 2: Try to delete backend data (best effort)
      try {
        const response = await fetch(`${API_URL}/users/${user?.id}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          console.warn(
            "Backend deletion failed, but account removed from Clerk",
          );
        }
      } catch (backendError) {
        // Non-blocking: Account already deleted from Clerk
        console.warn("Could not delete backend data:", backendError);
      }

      // Step 3: Sign out (account is gone)
      await signOut();

      // Navigation to sign-in happens automatically via auth redirect
    } catch (clerkError: any) {
      // ONLY show error if Clerk deletion failed
      console.error("Clerk deletion error:", clerkError);
      Alert.alert(
        "Deletion Failed",
        "We could not delete your account. Please try again or contact support.",
        [{ text: "OK" }],
      );
    }
  };

  return (
    <View style={{ ...favoritesStyles.container, paddingTop: top }}>
      <StatusBar hidden={false} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={COLORS.primary}
          />
        }
      >
        <View style={favoritesStyles.header}>
          <Text style={favoritesStyles.title}>Favorites</Text>
        </View>

        {/* Account Section */}
        <View style={favoritesStyles.accountSection}>
          <Text style={favoritesStyles.accountSectionTitle}>Account</Text>

          {/* Privacy Policy */}
          <TouchableOpacity
            style={favoritesStyles.accountLink}
            onPress={() => handleOpenLink(PRIVACY_POLICY_URL)}
            activeOpacity={0.7}
          >
            <Text style={favoritesStyles.accountLinkText}>Privacy Policy</Text>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={COLORS.textLight}
            />
          </TouchableOpacity>

          {/* Terms of Service */}
          <TouchableOpacity
            style={favoritesStyles.accountLink}
            onPress={() => handleOpenLink(TERMS_OF_SERVICE_URL)}
            activeOpacity={0.7}
          >
            <Text style={favoritesStyles.accountLinkText}>
              Terms of Service
            </Text>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={COLORS.textLight}
            />
          </TouchableOpacity>

          {/* Sign Out */}
          <TouchableOpacity
            style={favoritesStyles.accountLink}
            onPress={handleSignOut}
            activeOpacity={0.7}
          >
            <Text style={favoritesStyles.accountLinkText}>Sign Out</Text>
            <Ionicons
              name="log-out-outline"
              size={20}
              color={COLORS.textLight}
            />
          </TouchableOpacity>

          {/* Delete Account */}
          <TouchableOpacity
            style={[
              favoritesStyles.accountLink,
              favoritesStyles.accountLinkLast,
            ]}
            onPress={handleDeleteAccount}
            activeOpacity={0.7}
          >
            <Text style={favoritesStyles.deleteAccountText}>
              Delete Account
            </Text>
            <Ionicons name="trash-outline" size={20} color={COLORS.error} />
          </TouchableOpacity>
        </View>

        <View style={favoritesStyles.recipesSection}>
          {loading || refreshing ? (
            <RecipeGridSkeleton count={6} showDescription={false} />
          ) : (
            <FlatList
              data={favoriteRecipes}
              renderItem={({ item }) => <RecipeCard recipe={item} />}
              keyExtractor={(item) => (item.id || item.recipeId).toString()}
              numColumns={2}
              columnWrapperStyle={favoritesStyles.row}
              contentContainerStyle={favoritesStyles.recipesGrid}
              scrollEnabled={false}
              ListEmptyComponent={<NoFavoritesFound />}
            />
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default FavoritesScreen;
