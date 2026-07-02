import { Tabs, useRouter } from "expo-router";
import { Home, Scan, FileText, User } from "lucide-react-native";
import { View, StyleSheet, ActivityIndicator, Platform } from "react-native";
import { useAuthStore } from "../../stores/authStore";
import { useEffect } from "react";

export default function TabsLayout() {
  const { user, isLoading } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/(auth)/signin");
    }
  }, [user, isLoading]);

  if (isLoading || !user) {
    return <View style={{ flex: 1, backgroundColor: '#fff' }} />;
  }

  const isIOS = Platform.OS === 'ios';

  return (
    <Tabs
      safeAreaInsets={isIOS ? { bottom: 0 } : undefined}
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: isIOS ? false : true,
        tabBarStyle: isIOS ? {
          position: 'absolute',
          bottom: 32,
          left: 60,
          right: 60,
          width: 350,
          marginLeft:28,
          marginRight: 30,
          backgroundColor: '#ffffff', // white pill
          borderRadius: 40,
          height: 64,
          borderTopWidth: 0,
          elevation: 10,
          paddingBottom: 0,
          paddingTop: 0,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.15,
          shadowRadius: 15,
        } : {
          backgroundColor: '#ffffff',
          borderTopColor: '#f1f5f9',
          borderTopWidth: 1,
          height: 85,
          paddingBottom: 25,
          paddingTop: 10,
        },
        tabBarItemStyle: isIOS ? {
          paddingTop: 0,
          paddingBottom: 0,
          justifyContent: 'center',
          alignItems: 'center',
        } : {},
        tabBarActiveTintColor: isIOS ? '#0f172a' : '#f97316',
        tabBarInactiveTintColor: isIOS ? '#94a3b8' : '#94a3b8',
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 4,
        },
        tabBarIconStyle: isIOS ? {
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
        } : {}
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color, size }) => (
            <Home size={size} color={color} />
          ),
        }}
      />
      
      <Tabs.Screen
        name="documents"
        options={{
          title: "Documents",
          tabBarIcon: ({ color, size }) => (
            <FileText size={size} color={color} />
          ),
        }}
      />
      
      <Tabs.Screen
        name="scan"
        options={{
          href: null,
          title: "Scan",
          tabBarIcon: ({ focused }) => (
            <View style={[
              styles.scanButton,
              focused ? styles.scanButtonActive : {}
            ]}>
              <Scan size={24} color="white" />
            </View>
          ),
        }}
      />
      
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => (
            <User size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  scanButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#0f172a', // Slate-900
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  scanButtonActive: {
    backgroundColor: '#f97316', // Orange-500
  }
});
