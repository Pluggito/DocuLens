import { View, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthStore } from "../../stores/authStore";
import { LogOut, User, Mail, Settings, Shield } from "lucide-react-native";

export default function ProfileTab() {
  const { user, signOut } = useAuthStore();

  if (!user) return null;

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <View className="flex-1 p-6">
        <View className="mb-8">
          <Text className="text-3xl font-black text-slate-900 mb-2">Profile</Text>
          <Text className="text-slate-500 text-base">
            Manage your account and settings
          </Text>
        </View>

        {/* User Info Card */}
        <View className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm mb-6 items-center">
          <View className="w-20 h-20 bg-slate-100 rounded-full items-center justify-center mb-4">
            <User size={36} color="#94a3b8" />
          </View>
          <Text className="text-xl font-bold text-slate-900">{user.fullName}</Text>
          
          <View className="flex-row items-center mt-2">
            <Mail size={14} color="#64748b" className="mr-1.5" />
            <Text className="text-slate-500">{user.email}</Text>
          </View>
          
          <View className="bg-emerald-50 px-3 py-1 rounded-full mt-4 flex-row items-center">
            <Shield size={12} color="#059669" className="mr-1" />
            <Text className="text-emerald-700 text-xs font-bold uppercase tracking-wide">
              {user.role}
            </Text>
          </View>
        </View>

        {/* Settings Links */}
        <View className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden mb-8">
          <TouchableOpacity className="flex-row items-center justify-between p-4 border-b border-slate-50">
            <View className="flex-row items-center">
              <View className="w-10 h-10 bg-slate-50 rounded-xl items-center justify-center mr-3">
                <Settings size={20} color="#64748b" />
              </View>
              <Text className="text-slate-900 font-medium">Account Settings</Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity className="flex-row items-center justify-between p-4 border-b border-slate-50">
            <View className="flex-row items-center">
              <View className="w-10 h-10 bg-slate-50 rounded-xl items-center justify-center mr-3">
                <Shield size={20} color="#64748b" />
              </View>
              <Text className="text-slate-900 font-medium">Privacy & Security</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <TouchableOpacity 
          onPress={signOut}
          className="bg-rose-50 flex-row items-center justify-center gap-2 p-4 rounded-2xl border border-rose-100"
        >
          <LogOut size={20} color="#e11d48" />
          <Text className="text-rose-600 font-bold text-lg">Sign Out</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
