import { useClerk, useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
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
import LoadingSpinner from "../../components/LoadingSpinner";
import NoFavoritesFound from "../../components/NoFavoritesFound";
import RecipeCard from "../../components/RecipeCard";
import { API_URL } from "../../constants/api";
import { COLORS } from "../../constants/colors";
import { FavoriteRecipe } from "../../types";

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
    }, [loadFavorites])
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

  if (loading) return <LoadingSpinner message="Loading your favorites..." />;
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
          <TouchableOpacity
            style={favoritesStyles.logoutButton}
            onPress={handleSignOut}
          >
            <Ionicons name="log-out-outline" size={22} color={COLORS.text} />
          </TouchableOpacity>
        </View>

        <View style={favoritesStyles.recipesSection}>
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
        </View>
      </ScrollView>
    </View>
  );
};

export default FavoritesScreen;
