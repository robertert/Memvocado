import "../tamagui-web.css";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";

import { Stack } from "expo-router";

import { View, useColorScheme } from "react-native";

import { TamaguiProvider } from "tamagui";
import { tamaguiConfig } from "../tamagui.config";
import Header from "../ui/Header";
import * as SplashScreen from "expo-splash-screen"
import { useFonts,loadAsync } from 'expo-font';
import { useCallback, useEffect } from "react";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();

  const [fontsLoaded, fontError] = useFonts({
    "Peace Sans": require("../assets/Peace Sans.otf"),
    "Frank Serif": require("../assets/FrankRuhlLibre-Black.ttf"),
  });

  const onLayoutRootView = useCallback(async () => {
    console.log(fontsLoaded);
    if (fontsLoaded || fontError) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if(!fontsLoaded){
    return null;
  }

  return (
    <View onLayout={onLayoutRootView} style={{flex: 1}}>
      <TamaguiProvider config={tamaguiConfig} defaultTheme={colorScheme}>
        <ThemeProvider
          value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
        >
          <Stack initialRouteName="(auth)/signUp2" screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(auth)/authLogin" />
            <Stack.Screen name="(auth)/authSignUp" />
            <Stack.Screen name="(auth)/resetPassword" />
            <Stack.Screen name="(auth)/signUp2" />
          </Stack>
        </ThemeProvider>
      </TamaguiProvider>
    </View>
  );
}
