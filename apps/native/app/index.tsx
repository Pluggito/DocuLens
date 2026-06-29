import { useEffect } from "react";
import { Text, View, ActivityIndicator, TouchableOpacity } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useAuthStore } from "../stores/authStore";
import { useRouter } from "expo-router";

export default function Native() {
  const router = useRouter();
  const { user, isLoading, initialize, signOut } = useAuthStore();

  useEffect(() => {
    initialize();
  }, []);

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/(auth)/signin");
    }
  }, [user, isLoading]);

  if (isLoading) {
    return (
      <View className="flex-1 bg-[#090a0f] items-center justify-center">
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <View className="flex-1 bg-[#fffaf7] items-center justify-center p-6">
      <View className="w-16 h-16 rounded-3xl bg-slate-900 items-center justify-center mb-6 shadow-sm">
        <Text className="text-white font-bold text-3xl">D</Text>
      </View>
      <Text className="font-black text-5xl text-slate-900 tracking-tighter mb-2">DocuLens</Text>
      <Text className="text-lg text-slate-500 font-medium mb-12">Welcome, {user.fullName}!</Text>
      
      <View className="w-full max-w-sm bg-white border border-slate-100 rounded-[32px] p-8 items-center shadow-sm">
        <Text className="text-slate-900 font-bold text-xl mb-6">Dashboard Access</Text>
        <TouchableOpacity 
          className="w-full bg-slate-100 border border-slate-200 rounded-full py-4 px-8 items-center justify-center" 
          onPress={signOut}
        >
          <Text className="text-slate-700 font-bold text-base tracking-wide">Sign Out</Text>
        </TouchableOpacity>
      </View>
      
      <StatusBar style="dark" />
    </View>
  );
}
