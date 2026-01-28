import { useSignIn, useSignUp } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { authStyles } from "../../assets/styles/auth.styles";
import CodeInput, { CodeInputRef } from "../../components/CodeInput";
import { COLORS } from "../../constants/colors";

type VerificationType = "sign-in" | "sign-up";

const VerifyCodeScreen = (): React.ReactElement => {
  const router = useRouter();
  const {
    signIn,
    setActive: setSignInActive,
    isLoaded: isSignInLoaded,
  } = useSignIn();
  const {
    signUp,
    setActive: setSignUpActive,
    isLoaded: isSignUpLoaded,
  } = useSignUp();
  const { top } = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const codeInputRef = useRef<CodeInputRef>(null);

  const email = params.email as string;
  const type = params.type as VerificationType;

  const [code, setCode] = useState<string>("");
  const [verifying, setVerifying] = useState<boolean>(false);
  const [resending, setResending] = useState<boolean>(false);
  const [resendTimer, setResendTimer] = useState<number>(60);
  const [canResend, setCanResend] = useState<boolean>(false);
  const [hasError, setHasError] = useState<boolean>(false);
  const keyboardBehavior = Platform.OS === "ios" ? "padding" : "height";
  const verticalOffset = 0;

  // Countdown timer
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => {
        setResendTimer(resendTimer - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [resendTimer]);

  const handleCodeChange = (text: string) => {
    setCode(text);
    if (hasError && text.length > 0) {
      setHasError(false);
    }
  };

  const handleVerifyCode = useCallback(async (): Promise<void> => {
    if (!code || code.length !== 6) {
      return;
    }

    const isLoaded = type === "sign-in" ? isSignInLoaded : isSignUpLoaded;
    if (!isLoaded) return;

    setVerifying(true);

    try {
      if (type === "sign-in") {
        // Sign-in verification
        const signInAttempt = await signIn!.attemptSecondFactor({
          strategy: "email_code",
          code: code,
        });

        if (signInAttempt.status === "complete") {
          await setSignInActive!({ session: signInAttempt.createdSessionId });
          router.replace("/(tabs)" as any);
        } else {
          setHasError(true);
          setCode(""); // Clear code on error
          setTimeout(() => codeInputRef.current?.focus(), 100);
        }
      } else {
        // Sign-up verification
        const signUpAttempt = await signUp!.attemptEmailAddressVerification({
          code: code,
        });

        if (signUpAttempt.status === "complete") {
          await setSignUpActive!({ session: signUpAttempt.createdSessionId });
          router.replace("/(tabs)" as any);
        } else {
          setHasError(true);
          setCode(""); // Clear code on error
          setTimeout(() => codeInputRef.current?.focus(), 100);
        }
      }
    } catch (err: any) {
      setHasError(true);
      setCode(""); // Clear code on error
      setTimeout(() => codeInputRef.current?.focus(), 100);
      console.error("Verification error:", JSON.stringify(err, null, 2));
    } finally {
      setVerifying(false);
    }
  }, [
    code,
    type,
    isSignInLoaded,
    isSignUpLoaded,
    signIn,
    signUp,
    setSignInActive,
    setSignUpActive,
    router,
  ]);

  // Auto-submit when code is complete
  useEffect(() => {
    if (code.length === 6) {
      handleVerifyCode();
    }
  }, [code, handleVerifyCode]);

  const handleResendCode = async (): Promise<void> => {
    if (!canResend) return;

    setResending(true);
    setCanResend(false);
    setResendTimer(60);

    try {
      if (type === "sign-in") {
        await signIn!.prepareSecondFactor({
          strategy: "email_code",
        });
      } else {
        await signUp!.prepareEmailAddressVerification({
          strategy: "email_code",
        });
      }
    } catch (err: any) {
      const errorMessage =
        err.errors?.[0]?.message || "Failed to resend code. Please try again.";
      Alert.alert("Error", errorMessage);
      setCanResend(true);
      setResendTimer(0);
    } finally {
      setResending(false);
    }
  };

  const getTitle = () => {
    return type === "sign-in" ? "Verify Your Email" : "Verify Your Email";
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
          {/* Header with icon */}
          <View style={styles.headerContainer}>
            <Ionicons
              name="mail-outline"
              size={80}
              color={COLORS.primary}
              style={{ marginBottom: 24 }}
            />
            <Text style={[authStyles.title, { marginBottom: 15 }]}>
              {getTitle()}
            </Text>
            <View style={styles.subtitleContainer}>
              <Text style={[authStyles.subtitle, { marginBottom: 4 }]}>
                We sent a 6-digit code to
              </Text>
              <Text
                style={[
                  authStyles.subtitle,
                  { fontWeight: "600", color: COLORS.text },
                ]}
              >
                {email}
              </Text>
            </View>
          </View>

          {/* Code Input */}
          <View style={authStyles.formContainer}>
            <CodeInput
              ref={codeInputRef}
              length={6}
              value={code}
              onChangeText={handleCodeChange}
              autoFocus
              hasError={hasError}
            />

            {/* Error Message */}
            {hasError && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>
                  Wrong code. Please try again
                </Text>
              </View>
            )}

            {/* Timer and Resend */}
            <View style={styles.resendContainer}>
              {!canResend ? (
                <Text style={styles.timerText}>
                  Resend code in {resendTimer}s
                </Text>
              ) : (
                <TouchableOpacity
                  onPress={handleResendCode}
                  disabled={resending}
                  activeOpacity={0.7}
                >
                  <Text style={styles.resendText}>
                    {resending ? "Sending..." : "Resend Code"}
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Verify Button */}
            <TouchableOpacity
              style={[
                authStyles.authButton,
                (verifying || code.length !== 6) && authStyles.buttonDisabled,
              ]}
              onPress={handleVerifyCode}
              disabled={verifying || code.length !== 6}
              activeOpacity={0.8}
            >
              <Text style={authStyles.buttonText}>
                {verifying ? "Verifying..." : "Verify Code"}
              </Text>
            </TouchableOpacity>

            {/* Back button */}
            <TouchableOpacity
              style={authStyles.linkContainer}
              onPress={() => router.back()}
            >
              <Text style={authStyles.linkText}>
                <Text style={authStyles.link}>
                  ← Back to {type === "sign-in" ? "sign in" : "sign up"}
                </Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    alignItems: "center",
    marginBottom: 8,
  },
  subtitleContainer: {
    alignItems: "center",
    paddingHorizontal: 40,
    marginBottom: 45,
  },
  errorContainer: {
    alignItems: "flex-start",
    marginTop: 12,
    paddingHorizontal: 4,
  },
  errorText: {
    fontSize: 14,
    color: "#E53935",
    fontWeight: "500",
  },
  resendContainer: {
    alignItems: "center",
    marginTop: 20,
    marginBottom: 30,
    minHeight: 24,
  },
  timerText: {
    fontSize: 15,
    color: COLORS.textLight,
    fontWeight: "500",
  },
  resendText: {
    fontSize: 15,
    color: COLORS.primary,
    fontWeight: "600",
  },
});

export default VerifyCodeScreen;
