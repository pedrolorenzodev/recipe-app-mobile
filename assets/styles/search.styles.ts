import { Platform, StyleSheet } from "react-native";
import { COLORS } from "../../constants/colors";

export const searchStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  searchSection: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.card,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 54,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text,
    lineHeight: 20,
    includeFontPadding: false,
    height: "100%",
    paddingHorizontal: 0,
    paddingVertical: 0,
    ...Platform.select({
      android: {
        textAlignVertical: "center",
      },
    }),
    textAlignVertical: "center",
  },
  clearButton: {
    padding: 4,
  },
  quickFilters: {
    marginTop: 20,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 12,
  },
  filterButtons: {
    flexDirection: "row",
    gap: 12,
  },
  quickFilterButton: {
    backgroundColor: COLORS.card,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  activeQuickFilter: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  quickFilterText: {
    fontSize: 14,
    fontWeight: "500",
    color: COLORS.text,
  },
  activeQuickFilterText: {
    color: COLORS.white,
  },
  resultsSection: {
    flex: 1,
    paddingHorizontal: 16,
    marginTop: 8,
  },
  resultsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 20,
    marginBottom: 16,
    marginTop: 16,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.text,
    flex: 1,
  },
  resultsCountContainer: {
    height: 25,
    alignSelf: "flex-start",
    justifyContent: "center",
  },
  resultsCount: {
    fontSize: 15,
    color: COLORS.textLight,
    fontWeight: "500",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  recipesGrid: {
    gap: 16,
    paddingBottom: 100,
    paddingVertical: 8,
  },
  row: {
    justifyContent: "flex-start",
    gap: 14,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 64,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: COLORS.textLight,
    textAlign: "center",
    lineHeight: 20,
  },
});
