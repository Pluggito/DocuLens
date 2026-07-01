import "../global.css";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";

SplashScreen.preventAutoHideAsync();

const AppLayout = () => {
  return <Stack screenOptions={{ headerShown: false }} />
}

export default AppLayout
