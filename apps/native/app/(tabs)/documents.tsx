import { useEffect, useState, useCallback, useMemo } from "react";
import { Text, View, ScrollView, TouchableOpacity, ActivityIndicator, TextInput, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ArrowLeft, Search, Filter, FileText, CheckCircle2, Clock, AlertCircle } from "lucide-react-native";
import { fetchDocuments } from "../../utils/api";
import { formatDistanceToNow } from 'date-fns';

type StatusFilter = 'all' | 'needs_review' | 'verified' | 'completed' | 'failed';

const STATUS_FILTERS: { label: string; value: StatusFilter }[] = [
  { label: 'All', value: 'all' },
  { label: 'Needs Review', value: 'needs_review' },
  { label: 'Verified', value: 'verified' },
  { label: 'Processed', value: 'completed' },
  { label: 'Failed', value: 'failed' },
];

export default function DocumentLibrary() {
  const router = useRouter();
  
  const [documents, setDocuments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState<StatusFilter>('all');

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    loadDocuments();
  }, [debouncedSearch, status]);

  const loadDocuments = async () => {
    try {
      setIsLoading(true);
      const res = await fetchDocuments({ 
        search: debouncedSearch, 
        status: status === 'all' ? undefined : status 
      });
      setDocuments(res.documents);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const renderStatusBadge = (doc: any) => {
    if (doc.processingStatus === "verified") {
      return (
        <View className="flex-row items-center bg-emerald-100 px-2 py-1 rounded-full gap-1 border border-emerald-200">
          <CheckCircle2 size={10} color="#059669" />
          <Text className="text-emerald-700 font-bold text-[10px] uppercase">Verified</Text>
        </View>
      );
    }
    if (doc.processingStatus === "completed") {
      if (doc.confidence && doc.confidence < 0.8) {
        return (
          <View className="flex-row items-center bg-rose-50 px-2 py-1 rounded-full gap-1 border border-rose-100">
            <AlertCircle size={10} color="#e11d48" />
            <Text className="text-rose-600 font-bold text-[10px] uppercase">Needs Review</Text>
          </View>
        );
      }
      return (
        <View className="flex-row items-center bg-emerald-50 px-2 py-1 rounded-full gap-1 border border-emerald-100">
          <CheckCircle2 size={10} color="#059669" />
          <Text className="text-emerald-600 font-bold text-[10px] uppercase">Processed</Text>
        </View>
      );
    }
    if (doc.processingStatus === "failed") {
      return (
        <View className="flex-row items-center bg-rose-50 px-2 py-1 rounded-full gap-1 border border-rose-100">
          <AlertCircle size={10} color="#e11d48" />
          <Text className="text-rose-600 font-bold text-[10px] uppercase">Failed</Text>
        </View>
      );
    }
    return (
      <View className="flex-row items-center bg-amber-50 px-2 py-1 rounded-full gap-1 border border-amber-100">
        <Clock size={10} color="#d97706" />
        <Text className="text-amber-600 font-bold text-[10px] uppercase">Processing</Text>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50" style={{ flex: 1 }}>
      {/* Header */}
      <View className="px-6 py-4 flex-row items-center gap-4 bg-white border-b border-slate-100">
        <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 bg-white rounded-full items-center justify-center border border-slate-200">
          <ArrowLeft size={20} color="#64748b" />
        </TouchableOpacity>
        <View>
          <Text className="text-lg font-bold text-slate-900">Document Library</Text>
          <Text className="text-xs font-medium text-slate-500">Search and filter your documents</Text>
        </View>
      </View>

      {/* Search & Filters */}
      <View className="bg-white px-6 py-4 border-b border-slate-100">
        <View className="flex-row items-center bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 mb-4">
          <Search size={18} color="#94a3b8" />
          <TextInput
            placeholder="Search documents or data..."
            placeholderTextColor="#94a3b8"
            value={search}
            onChangeText={setSearch}
            className="flex-1 ml-2 text-sm font-medium text-slate-900"
          />
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {STATUS_FILTERS.map((f) => (
            <TouchableOpacity
              key={f.value}
              onPress={() => setStatus(f.value)}
              className={`px-4 py-2 rounded-full mr-2 border ${
                status === f.value 
                  ? 'bg-slate-900 border-slate-900' 
                  : 'bg-white border-slate-200'
              }`}
            >
              <Text className={`text-sm font-bold ${
                status === f.value ? 'text-white' : 'text-slate-600'
              }`}>
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Document List */}
      <View className="flex-1 px-6 pt-4">
        {isLoading ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#f97316" />
          </View>
        ) : documents.length === 0 ? (
          <View className="flex-1 justify-center items-center">
            <FileText size={48} color="#cbd5e1" className="mb-4" />
            <Text className="text-lg font-bold text-slate-900 mb-1">No documents found</Text>
            <Text className="text-slate-500 text-center">Try adjusting your search or filters.</Text>
          </View>
        ) : (
          <FlatList
            data={documents}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 40 }}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => router.push(`/document/${item.id}`)}
                className="bg-white p-4 rounded-2xl mb-3 shadow-sm border border-slate-100"
              >
                <View className="flex-row items-start justify-between mb-3">
                  <View className="flex-row items-center gap-3 flex-1 pr-4">
                    <View className="w-10 h-10 rounded-xl bg-blue-50 items-center justify-center">
                      <FileText size={18} color="#3b82f6" />
                    </View>
                    <View className="flex-1">
                      <Text className="text-slate-900 font-bold mb-0.5" numberOfLines={1}>
                        {item.fileName}
                      </Text>
                      <Text className="text-slate-500 text-xs capitalize">
                        {item.documentType || "Unknown Type"}
                      </Text>
                    </View>
                  </View>
                  {renderStatusBadge(item)}
                </View>
                
                <View className="flex-row items-center justify-between mt-1 pt-3 border-t border-slate-50">
                  <Text className="text-slate-400 text-xs">
                    {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                  </Text>
                  {item.confidence && (
                    <Text className="text-slate-400 text-xs font-medium">
                      {(item.confidence * 100).toFixed(0)}% Confidence
                    </Text>
                  )}
                </View>
              </TouchableOpacity>
            )}
          />
        )}
      </View>
    </SafeAreaView>
  );
}
