import { useSignIn } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { authStyles } from "../../assets/styles/auth.styles";
import { COLORS } from "../../constants/colors";

const SignInScreen = (): React.ReactElement => {
  const router = useRouter();
  const { signIn, setActive, isLoaded } = useSignIn();
  const { top } = useSafeAreaInsets();

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [hasError, setHasError] = useState<boolean>(false);
  const keyboardBehavior = Platform.OS === "ios" ? "padding" : "height";
  const verticalOffset = Platform.OS === "ios" ? 64 : 0;

  const handleEmailChange = (text: string) => {
    setEmail(text);
    if (hasError) {
      setHasError(false);
    }
  };

  const handlePasswordChange = (text: string) => {
    setPassword(text);
    if (hasError) {
      setHasError(false);
    }
  };

  const handleSignIn = async (): Promise<void> => {
    if (!email || !password) {
      setHasError(true);
      return;
    }

    if (!isLoaded) return;

    setLoading(true);

    try {
      const signInAttempt = await signIn.create({
        identifier: email.trim(),
        password: password,
      });

      if (signInAttempt.status === "complete") {
        await setActive({ session: signInAttempt.createdSessionId });
        router.replace("/(tabs)" as any);
      } else if (signInAttempt.status === "needs_second_factor") {
        await signInAttempt.prepareSecondFactor({
          strategy: "email_code",
        });
        router.push({
          pathname: "/(auth)/verify-code",
          params: { email: email.trim(), type: "sign-in" },
        } as any);
      } else {
        setHasError(true);
        console.log("Sign in status:", signInAttempt.status);
        console.log("Sign in attempt:", JSON.stringify(signInAttempt, null, 2));
      }
    } catch (err: any) {
      setHasError(true);
      console.error("Sign in error:", JSON.stringify(err, null, 2));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ ...authStyles.container, paddingTop: top }}>
      <KeyboardAvoidingView
        style={authStyles.keyboardView}
        behavior={keyboardBehavior}
        keyboardVerticalOffset={verticalOffset}
      >
        <ScrollView
          contentContainerStyle={authStyles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={authStyles.imageContainer}>
            <Image
              source={require("../../assets/images/i1.png")}
              style={authStyles.image}
              contentFit="contain"
            />
            <Text style={authStyles.title}>Welcome Back</Text>
          </View>

          <View style={authStyles.formContainer}>
            <View style={authStyles.inputContainer}>
              <TextInput
                style={[
                  authStyles.textInput,
                  hasError && styles.inputError,
                ]}
                placeholder="Enter email"
                placeholderTextColor={COLORS.textLight}
                value={email}
                onChangeText={handleEmailChange}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={authStyles.inputContainer}>
              <TextInput
                style={[
                  authStyles.textInput,
                  hasError && styles.inputError,
                ]}
                placeholder="Enter password"
                placeholderTextColor={COLORS.textLight}
                value={password}
                onChangeText={handlePasswordChange}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                style={authStyles.eyeButton}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Ionicons
                  name={showPassword ? "eye-outline" : "eye-off-outline"}
                  size={20}
                  color={COLORS.textLight}
                />
              </TouchableOpacity>
            </View>

            {/* Error Message */}
            {hasError && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>
                  Email or password is incorrect. Please try again.
                </Text>
              </View>
            )}

            <TouchableOpacity
              style={[
                authStyles.authButton,
                loading && authStyles.buttonDisabled,
              ]}
              onPress={handleSignIn}
              disabled={loading}
              activeOpacity={0.8}
            >
              <Text style={authStyles.buttonText}>
                {loading ? "Signing In..." : "Sign In"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={authStyles.linkContainer}
              onPress={() => router.push("/(auth)/sign-up" as any)}
            >
              <Text style={authStyles.linkText}>
                Don&apos;t have an account?{" "}
                <Text style={authStyles.link}>Sign up</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  inputError: {
    borderColor: "#E53935",
    borderWidth: 2,
  },
  errorContainer: {
    alignItems: "flex-start",
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  errorText: {
    fontSize: 14,
    color: "#E53935",
    fontWeight: "500",
  },
});

export default SignInScreen;
