import {
    DarkTheme,
    DefaultTheme,
    ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

import { store } from "@/store";
import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import { Provider, useSelector } from "react-redux";
import { useColorScheme } from "../hooks/useColorScheme";

// Create a wrapper component to handle auth routing
function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const segments = useSegments();
  const router = useRouter();
  
  // Get auth state from Redux store
  const { isAuthenticated, user } = useSelector((state: any) => state.auth);

  useEffect(() => {
    const inAuthGroup = segments[0] === "(auth)";
    
    if (!isAuthenticated && !inAuthGroup) {
      // User is not authenticated and not in auth group, redirect to sign in
      router.replace("/(auth)/Signin");
    } else if (isAuthenticated && inAuthGroup) {
      // User is authenticated but still in auth group, redirect to main app
      router.replace("/(mapScreen)/mapScreen");
    }
  }, [isAuthenticated, segments]);

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen
          name="(auth)/Signin"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="(mapScreen)/mapScreen"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="+not-found"
          options={{ headerShown: false }}
        />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <Provider store={store}>
      <RootLayoutNav />
    </Provider>
  );
}
