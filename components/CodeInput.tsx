import React, { useRef, useState } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  Keyboard,
  NativeSyntheticEvent,
  TextInputKeyPressEventData,
} from "react-native";
import { COLORS } from "../constants/colors";

interface CodeInputProps {
  length?: number;
  value: string;
  onChangeText: (text: string) => void;
  autoFocus?: boolean;
}

export default function CodeInput({
  length = 6,
  value,
  onChangeText,
  autoFocus = false,
}: CodeInputProps): React.ReactElement {
  const [focusedIndex, setFocusedIndex] = useState<number | null>(
    autoFocus ? 0 : null
  );
  const inputRefs = useRef<(TextInput | null)[]>([]);

  const handleChangeText = (text: string, index: number) => {
    // Only allow numbers
    const numericText = text.replace(/[^0-9]/g, "");

    if (numericText.length === 0) {
      // Handle deletion
      const newValue = value.split("");
      newValue[index] = "";
      onChangeText(newValue.join(""));
      return;
    }

    if (numericText.length === 1) {
      // Single digit input
      const newValue = value.split("");
      newValue[index] = numericText;
      onChangeText(newValue.join(""));

      // Move to next input
      if (index < length - 1) {
        inputRefs.current[index + 1]?.focus();
      } else {
        // Last digit, dismiss keyboard
        Keyboard.dismiss();
      }
    } else if (numericText.length > 1) {
      // Handle paste or multiple digits
      const digits = numericText.slice(0, length).split("");
      const newValue = value.split("");

      digits.forEach((digit, i) => {
        if (index + i < length) {
          newValue[index + i] = digit;
        }
      });

      onChangeText(newValue.join(""));

      // Focus the next empty input or last input
      const nextEmptyIndex = newValue.findIndex((v, i) => i > index && !v);
      if (nextEmptyIndex !== -1 && nextEmptyIndex < length) {
        inputRefs.current[nextEmptyIndex]?.focus();
      } else if (index + digits.length < length) {
        inputRefs.current[index + digits.length]?.focus();
      } else {
        Keyboard.dismiss();
      }
    }
  };

  const handleKeyPress = (
    e: NativeSyntheticEvent<TextInputKeyPressEventData>,
    index: number
  ) => {
    if (e.nativeEvent.key === "Backspace") {
      const currentValue = value[index];

      if (!currentValue && index > 0) {
        // Move to previous input if current is empty
        inputRefs.current[index - 1]?.focus();
      }
    }
  };

  const digits = value.split("");
  while (digits.length < length) {
    digits.push("");
  }

  return (
    <View style={styles.container}>
      {digits.map((digit, index) => (
        <TextInput
          key={index}
          ref={(ref) => (inputRefs.current[index] = ref)}
          style={[
            styles.input,
            focusedIndex === index && styles.inputFocused,
            digit && styles.inputFilled,
          ]}
          value={digit}
          onChangeText={(text) => handleChangeText(text, index)}
          onKeyPress={(e) => handleKeyPress(e, index)}
          onFocus={() => setFocusedIndex(index)}
          onBlur={() => setFocusedIndex(null)}
          keyboardType="number-pad"
          maxLength={1}
          autoFocus={autoFocus && index === 0}
          selectTextOnFocus
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    paddingHorizontal: 4,
  },
  input: {
    flex: 1,
    aspectRatio: 1,
    maxWidth: 52,
    fontSize: 24,
    fontWeight: "600",
    color: COLORS.text,
    textAlign: "center",
    backgroundColor: COLORS.background,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  inputFocused: {
    borderColor: COLORS.primary,
    borderWidth: 2,
  },
  inputFilled: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.background,
  },
});
