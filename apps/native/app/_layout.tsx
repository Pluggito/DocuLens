import "../global.css";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { useAuthStore } from "../stores/authStore";

SplashScreen.preventAutoHideAsync();

const AppLayout = () => {
  const { initialize, isLoading } = useAuthStore();

  useEffect(() => {
    initialize();
  }, []);

  useEffect(() => {
    if (!isLoading) {
      SplashScreen.hideAsync();
    }
  }, [isLoading]);

  return <Stack screenOptions={{ headerShown: false }} />
}

export default AppLayout
