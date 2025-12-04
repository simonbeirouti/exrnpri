import { useLogin } from "@privy-io/expo/ui";
import { TouchableOpacity, View, Text, StyleSheet } from "react-native";
import { useState } from "react";
import { useTheme } from "@react-navigation/native";
import { Colors, Spacing, BorderRadius, FontSize, getThemeShadows } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";

export default function PrivyUI() {
  const [error, setError] = useState("");
  const theme = useTheme();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme === 'dark' ? 'dark' : 'light'];
  const shadows = getThemeShadows(colorScheme);
  const { login } = useLogin();

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.button,
          { backgroundColor: colors.primary },
          shadows.lg,
        ]}
        activeOpacity={0.8}
        onPress={() => {
          login({ loginMethods: ["email"] })
            .then((session) => {
              console.log("User logged in", session.user);
            })
            .catch((err) => {
              setError(JSON.stringify(err.error) as string);
            });
        }}
      >
        <Text style={[styles.buttonText, { color: colors.buttonText }]}>Login with Privy</Text>
      </TouchableOpacity>
      {error && <Text style={[styles.errorText, { color: colors.error }]}>Error: {error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  button: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xxl,
    borderRadius: BorderRadius.lg,
    minWidth: 200,
    alignItems: "center",
  },
  buttonText: {
    fontSize: FontSize.lg,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  errorText: {
    marginTop: Spacing.sm,
  },
});



