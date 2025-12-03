import React from "react";
import { ActivityIndicator, View, StyleSheet } from "react-native";
import Constants from "expo-constants";
import { Stack } from "expo-router";
import { DarkTheme, DefaultTheme, ThemeProvider, useTheme } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { PrivyProvider, usePrivy } from "@privy-io/expo";
import { PrivyElements } from "@privy-io/expo/ui";
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
} from "@expo-google-fonts/inter";
import { useFonts } from "expo-font";
import { useColorScheme } from "@/hooks/useColorScheme";
import LoginScreen from "@/components/LoginScreen";

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isReady } = usePrivy();
  const theme = useTheme();

  if (!isReady) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  if (!user) {
    return <LoginScreen />;
  }

  return <>{children}</>;
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });

  return (
    <PrivyProvider
      appId={Constants.expoConfig?.extra?.privyAppId}
      clientId={Constants.expoConfig?.extra?.privyClientId}
    >
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <AuthGuard>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          </Stack>
        </AuthGuard>
        <StatusBar style="auto" />
      </ThemeProvider>
      <PrivyElements />
    </PrivyProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
