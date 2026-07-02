import { useEffect, useState } from "react";
import { Text, View, ScrollView, TouchableOpacity, Alert, ActivityIndicator, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useAuthStore } from "../../stores/authStore";
import { useRouter } from "expo-router";
import * as SplashScreen from 'expo-splash-screen';
import { FileText, AlertCircle, LogOut, Scan } from "lucide-react-native";
import { fetchDashboardData } from "../../utils/api";

export default function Native() {
  const router = useRouter();
  const { user, isLoading, initialize, signOut } = useAuthStore();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");
  const [dashboardData, setDashboardData] = useState<{
    metrics: any;
    recentDocuments: any[];
  } | null>(null);
  const [isFetchingDashboard, setIsFetchingDashboard] = useState(true);

  useEffect(() => {
    if (!isLoading) {
      SplashScreen.hideAsync();
      if (!user) {
        router.replace("/(auth)/signin");
      } else {
        loadDashboardData();
      }
    }
  }, [user, isLoading]);

  const loadDashboardData = async () => {
    try {
      setIsFetchingDashboard(true);
      const data = await fetchDashboardData();
      setDashboardData(data);
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
    } finally {
      setIsFetchingDashboard(false);
    }
  };



  if (isLoading || !user) {
    return null;
  }

  const metrics = dashboardData?.metrics || {
    totalProcessed: "0",
    needsReview: "0"
  };
  const documents = dashboardData?.recentDocuments || [];

  return (
    <SafeAreaView className="flex-1 bg-slate-50" style={{ flex: 1 }}>
      <ScrollView className="flex-1 px-6 pt-4" contentContainerStyle={{ paddingBottom: 100 }}>
        
        {/* Header */}
        <View className="flex-row justify-between items-center mb-8">
          <View>
            <Text className="text-slate-500 text-sm font-medium uppercase tracking-wider mb-1">Welcome back</Text>
            <Text className="text-slate-900 text-3xl font-bold tracking-tight">{user.fullName.split(' ')[0]}</Text>
          </View>
        </View>

        {/* Metrics Grid */}
        <View className="flex-row justify-between gap-4 mb-8">
          <View className="flex-1 bg-white p-5 rounded-3xl shadow-sm border border-slate-100">
            <View className="w-10 h-10 rounded-xl bg-orange-50 items-center justify-center mb-4">
              <FileText size={20} color="#f97316" />
            </View>
            <Text className="text-slate-500 text-sm font-medium mb-1">Total Processed</Text>
            <Text className="text-slate-900 text-3xl font-black">
              {isFetchingDashboard ? "..." : metrics.totalProcessed}
            </Text>
          </View>
          
          <View className="flex-1 bg-white p-5 rounded-3xl shadow-sm border border-slate-100">
            <View className="w-10 h-10 rounded-xl bg-rose-50 items-center justify-center mb-4">
              <AlertCircle size={20} color="#f43f5e" />
            </View>
            <Text className="text-slate-500 text-sm font-medium mb-1">Needs Review</Text>
            <Text className="text-slate-900 text-3xl font-black">
              {isFetchingDashboard ? "..." : metrics.needsReview}
            </Text>
          </View>
        </View>

        {/* Recent Documents */}
        <View className="mb-6 flex-row justify-between items-end">
          <Text className="text-slate-900 text-xl font-bold">Recent Documents</Text>
          <TouchableOpacity onPress={() => router.push('/documents')}>
            <Text className="text-orange-500 font-medium text-sm">View All</Text>
          </TouchableOpacity>
        </View>

        <View className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden mb-8">
          {documents.length === 0 ? (
            <View className="p-8 items-center justify-center">
               <Text className="text-slate-500 font-medium text-center">
                 {isFetchingDashboard ? "Loading documents..." : "No documents scanned yet."}
               </Text>
            </View>
          ) : (
            documents.map((doc, index) => (
              <TouchableOpacity 
                key={doc.id} 
                className={`p-4 flex-row items-center justify-between ${index !== documents.length - 1 ? 'border-b border-slate-50' : ''}`}
                onPress={() => router.push(`/document/${doc.id}`)}
              >
                <View className="flex-row items-center gap-4 flex-1">
                  <View className="w-10 h-10 rounded-xl bg-blue-50 items-center justify-center">
                    <FileText size={18} color="#3b82f6" />
                  </View>
                  <View className="flex-1 pr-2">
                    <Text className="text-slate-900 font-bold mb-0.5" numberOfLines={1}>{doc.name}</Text>
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
              </TouchableOpacity>
            ))
          )}
        </View>

      </ScrollView>


      
      <StatusBar style="dark" />
      
      {/* Floating Action Button for Scan */}
      <TouchableOpacity 
        onPress={() => router.push('/scan')}
        className="absolute right-6 w-16 h-16 bg-[#0f172a] rounded-full items-center justify-center shadow-lg"
        style={{
          bottom: Platform.OS === 'ios' ? 112 : 24, // Lift above floating menu on iOS
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 4.65,
          elevation: 8,
        }}
      >
        <Scan size={28} color="white" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}
