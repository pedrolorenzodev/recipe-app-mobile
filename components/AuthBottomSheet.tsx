import { Ionicons } from "@expo/vector-icons";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import React, { forwardRef, useCallback } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { COLORS } from "../constants/colors";

const PRIVACY_POLICY_URL =
  "https://pedrolorenzodev.github.io/recipe-finder-privacy/privacy.html";
const TERMS_OF_SERVICE_URL =
  "https://pedrolorenzodev.github.io/recipe-finder-privacy/terms.html";

const AuthBottomSheet = forwardRef<BottomSheetModal>((_, ref) => {
  const router = useRouter();

  const handleOpenLink = async (url: string): Promise<void> => {
    try {
      await WebBrowser.openBrowserAsync(url);
    } catch (error) {
      console.log("Error opening link:", error);
    }
  };

  const dismiss = useCallback(() => {
    if (ref && "current" in ref && ref.current) {
      ref.current.dismiss();
    }
  }, [ref]);

  const handleSignIn = useCallback(() => {
    dismiss();
    router.push("/(auth)/sign-in" as any);
  }, [dismiss, router]);

  const handleCreateAccount = useCallback(() => {
    dismiss();
    router.push("/(auth)/sign-up" as any);
  }, [dismiss, router]);

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
      />
    ),
    [],
  );

  return (
    <BottomSheetModal
      ref={ref}
      enableDynamicSizing
      backdropComponent={renderBackdrop}
      handleIndicatorStyle={styles.handleIndicator}
      backgroundStyle={styles.background}
    >
      <BottomSheetView style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons name="restaurant" size={40} color={COLORS.primary} />
        </View>

        <Text style={styles.title}>Welcome!</Text>
        <Text style={styles.subtitle}>
          Sign in to save your favorite recipes and access them anytime.
        </Text>

        <TouchableOpacity
          style={styles.signInButton}
          onPress={handleSignIn}
          activeOpacity={0.8}
        >
          <Ionicons name="log-in-outline" size={22} color={COLORS.white} />
          <Text style={styles.signInButtonText}>Sign In</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.createAccountButton}
          onPress={handleCreateAccount}
          activeOpacity={0.8}
        >
          <Ionicons name="person-add-outline" size={22} color={COLORS.text} />
          <Text style={styles.createAccountButtonText}>Create Account</Text>
        </TouchableOpacity>

        <View style={styles.policyContainer}>
          <Text style={styles.policyText}>By continuing, you agree to our</Text>
          <View style={styles.policyLinks}>
            <TouchableOpacity
              onPress={() => handleOpenLink(TERMS_OF_SERVICE_URL)}
            >
              <Text style={styles.policyLink}>Terms of Service</Text>
            </TouchableOpacity>
            <Text style={styles.policyText}> and </Text>
            <TouchableOpacity
              onPress={() => handleOpenLink(PRIVACY_POLICY_URL)}
            >
              <Text style={styles.policyLink}>Privacy Policy</Text>
            </TouchableOpacity>
          </View>
        </View>
      </BottomSheetView>
    </BottomSheetModal>
  );
});

AuthBottomSheet.displayName = "AuthBottomSheet";

const styles = StyleSheet.create({
  handleIndicator: {
    backgroundColor: COLORS.border,
    width: 40,
  },
  background: {
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 40,
    alignItems: "center",
  },
  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLORS.primary + "15",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: COLORS.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: COLORS.textLight,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 28,
    paddingHorizontal: 16,
  },
  signInButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 14,
    width: "100%",
    marginBottom: 12,
  },
  signInButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.white,
  },
  createAccountButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: COLORS.white,
    paddingVertical: 16,
    borderRadius: 14,
    width: "100%",
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  createAccountButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.text,
  },
  policyContainer: {
    alignItems: "center",
    marginTop: 20,
  },
  policyText: {
    fontSize: 13,
    color: COLORS.textLight,
    textAlign: "center",
  },
  policyLinks: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginTop: 4,
  },
  policyLink: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: "600",
  },
});

export default AuthBottomSheet;
