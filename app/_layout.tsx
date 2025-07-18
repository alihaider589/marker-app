import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

import { persistor, store } from "@/store";
import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { Provider, useSelector } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { colors } from "../constants/Colors";
import { useColorScheme } from "../hooks/useColorScheme";

// Loading component for PersistGate
function LoadingScreen() {
  return (
    <View style={{ 
      flex: 1, 
      justifyContent: 'center', 
      alignItems: 'center', 
      backgroundColor: colors.background 
    }}>
      <ActivityIndicator size="large" color={colors.accent} />
      <Text style={{ 
        color: colors.text, 
        fontSize: 18, 
        marginTop: 20,
        fontFamily: colors.pixelFont 
      }}>
        Loading...
      </Text>
    </View>
  );
}

// Create a wrapper component to handle auth routing
function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const segments = useSegments();
  const router = useRouter();
  
  // Get auth state from Redux store
  const { isAuthenticated, isRestoring } = useSelector((state: any) => state.auth);

  useEffect(() => {
    // Don't navigate until auth restoration is complete
    if (isRestoring) return;

    const inAuthGroup = segments[0] === "(auth)";
    
    if (!isAuthenticated && !inAuthGroup) {
      // User is not authenticated and not in auth group, redirect to sign in
      router.replace("/(auth)/Signin");
    } else if (isAuthenticated && inAuthGroup) {
      // User is authenticated but still in auth group, redirect to main app
      router.replace("/(mapScreen)/mapScreen");
    }
  }, [isAuthenticated, isRestoring, segments]);

  // Show loading screen while restoring auth state
  if (isRestoring) {
    return <LoadingScreen />;
  }

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen
          name="(auth)/Signin"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="(auth)/Signup"
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
      <PersistGate loading={<LoadingScreen />} persistor={persistor}>
        <RootLayoutNav />
      </PersistGate>
    </Provider>
  );
}
