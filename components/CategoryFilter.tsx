import React from "react";
import { ScrollView, View } from "react-native";
import { homeStyles } from "../assets/styles/home.styles";
import { CategoryFilterProps } from "../types";
import { CategoryButtonItem } from "./CategoryButtonItem";

export default function CategoryFilter({
  categories,
  selectedCategory,
  onSelectCategory,
}: CategoryFilterProps): React.ReactElement {
  return (
    <View style={homeStyles.categoryFilterContainer}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={homeStyles.categoryFilterScrollContent}
      >
        {categories.map((category) => (
          <CategoryButtonItem
            key={category.id}
            category={category}
            isSelected={selectedCategory === category.name}
            onSelectCategory={onSelectCategory}
          />
        ))}
      </ScrollView>
    </View>
  );
}
