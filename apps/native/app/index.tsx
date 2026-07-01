import { useEffect } from "react";
import { Text, View, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useAuthStore } from "../stores/authStore";
import { useRouter } from "expo-router";
import * as SplashScreen from 'expo-splash-screen';
import { Scan, FileText, AlertCircle, LogOut } from "lucide-react-native";

const DOCUMENTS = [
  { id: "1", name: "Invoice_INV-2023.pdf", status: "Processed", date: "Just now" },
  { id: "2", name: "Employee_Onboarding.pdf", status: "Pending", date: "2 hrs ago" },
  { id: "3", name: "Vendor_Contract.docx", status: "Error", date: "5 hrs ago" },
];

export default function Native() {
  const router = useRouter();
  const { user, isLoading, initialize, signOut } = useAuthStore();

  useEffect(() => {
    initialize();
  }, []);

  useEffect(() => {
    if (!isLoading) {
      SplashScreen.hideAsync();
      if (!user) {
        router.replace("/(auth)/signin");
      }
    }
  }, [user, isLoading]);

  if (isLoading || !user) {
    return null;
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-50" style={{ flex: 1 }}>
      <ScrollView className="flex-1 px-6 pt-4" contentContainerStyle={{ paddingBottom: 100 }}>
        
        {/* Header */}
        <View className="flex-row justify-between items-center mb-8">
          <View>
            <Text className="text-slate-500 text-sm font-medium uppercase tracking-wider mb-1">Welcome back</Text>
            <Text className="text-slate-900 text-3xl font-bold tracking-tight">{user.fullName}</Text>
          </View>
          <TouchableOpacity onPress={signOut} className="w-12 h-12 bg-white rounded-full items-center justify-center shadow-sm border border-slate-100">
            <LogOut size={20} color="#64748b" />
          </TouchableOpacity>
        </View>

        {/* Metrics Grid */}
        <View className="flex-row justify-between gap-4 mb-8">
          <View className="flex-1 bg-white p-5 rounded-3xl shadow-sm border border-slate-100">
            <View className="w-10 h-10 rounded-xl bg-orange-50 items-center justify-center mb-4">
              <FileText size={20} color="#f97316" />
            </View>
            <Text className="text-slate-500 text-sm font-medium mb-1">Total Processed</Text>
            <Text className="text-slate-900 text-3xl font-black">1,245</Text>
          </View>
          
          <View className="flex-1 bg-white p-5 rounded-3xl shadow-sm border border-slate-100">
            <View className="w-10 h-10 rounded-xl bg-rose-50 items-center justify-center mb-4">
              <AlertCircle size={20} color="#f43f5e" />
            </View>
            <Text className="text-slate-500 text-sm font-medium mb-1">Needs Review</Text>
            <Text className="text-slate-900 text-3xl font-black">24</Text>
          </View>
        </View>

        {/* Recent Documents */}
        <View className="mb-6 flex-row justify-between items-end">
          <Text className="text-slate-900 text-xl font-bold">Recent Documents</Text>
          <TouchableOpacity>
            <Text className="text-orange-500 font-medium text-sm">View All</Text>
          </TouchableOpacity>
        </View>

        <View className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden mb-8">
          {DOCUMENTS.map((doc, index) => (
            <View 
              key={doc.id} 
              className={`p-4 flex-row items-center justify-between ${index !== DOCUMENTS.length - 1 ? 'border-b border-slate-50' : ''}`}
            >
              <View className="flex-row items-center gap-4">
                <View className="w-10 h-10 rounded-xl bg-blue-50 items-center justify-center">
                  <FileText size={18} color="#3b82f6" />
                </View>
                <View>
                  <Text className="text-slate-900 font-bold mb-0.5">{doc.name}</Text>
                  <Text className="text-slate-400 text-xs font-medium">{doc.date}</Text>
                </View>
              </View>
              <View className={`px-2.5 py-1 rounded-full ${
                doc.status === 'Processed' ? 'bg-emerald-50' : 
                doc.status === 'Pending' ? 'bg-amber-50' : 'bg-rose-50'
              }`}>
                <Text className={`text-[10px] font-bold uppercase tracking-wider ${
                  doc.status === 'Processed' ? 'text-emerald-600' : 
                  doc.status === 'Pending' ? 'text-amber-600' : 'text-rose-600'
                }`}>
                  {doc.status}
                </Text>
              </View>
            </View>
          ))}
        </View>

      </ScrollView>

      {/* FAB - Scan Document */}
      <View className="absolute bottom-8 left-0 right-0 items-center">
        <TouchableOpacity className="bg-slate-900 flex-row items-center gap-3 px-8 py-5 rounded-full shadow-[0_8px_30px_rgba(0,0,0,0.2)]">
          <Scan size={24} color="white" />
          <Text className="text-white font-bold text-lg">Scan Document</Text>
        </TouchableOpacity>
      </View>
      
      <StatusBar style="dark" />
    </SafeAreaView>
  );
}
