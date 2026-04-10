import { DarkTheme, type Theme } from "@react-navigation/native";
import { COLORS } from "./colors";

export const NAVIGATION_THEME: Theme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: COLORS.background,
    card: COLORS.background,
    border: COLORS.border,
    primary: COLORS.primary,
    text: COLORS.text,
    notification: COLORS.primary,
  },
};
