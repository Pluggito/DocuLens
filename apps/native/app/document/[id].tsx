import { useEffect, useState } from "react";
import { Text, View, ScrollView, TouchableOpacity, ActivityIndicator, Linking, Image, TextInput, Alert, ActionSheetIOS, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft, AlertCircle, FileText, Download, CheckCircle2, Trash2, RefreshCw, FileEdit } from "lucide-react-native";
import { fetchDocumentDetails, updateDocument, deleteDocument, reprocessDocument, updateDocumentType } from "../../utils/api";
import Pdf from 'react-native-pdf';

export default function DocumentDetails() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  
  const [document, setDocument] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (id) {
      loadDocument();
    }
  }, [id]);

  const loadDocument = async () => {
    try {
      setIsLoading(true);
      setError("");
      const res = await fetchDocumentDetails(id as string);
      setDocument(res.document);
      
      if (res.document.extractedData) {
        const flatData: Record<string, string> = {};
        Object.entries(res.document.extractedData).forEach(([key, value]) => {
          flatData[key] = typeof value === 'object' ? JSON.stringify(value) : String(value);
        });
        setFormData(flatData);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load document");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async () => {
    try {
      setIsSubmitting(true);
      await updateDocument(id as string, formData);
      setDocument((prev: any) => ({ ...prev, processingStatus: "verified", extractedData: formData }));
    } catch (err) {
      console.error(err);
      // could show an alert here
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    if (status === 'completed') return 'text-emerald-600 bg-emerald-50';
    if (status === 'failed') return 'text-rose-600 bg-rose-50';
    return 'text-amber-600 bg-amber-50';
  };

  const handleDelete = () => {
    Alert.alert("Delete Document", "Are you sure you want to delete this document? This action cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      { 
        text: "Delete", 
        style: "destructive", 
        onPress: async () => {
          try {
            await deleteDocument(id as string);
            router.back();
          } catch (err) {
            Alert.alert("Error", "Failed to delete document.");
          }
        } 
      }
    ]);
  };

  const handleReprocess = () => {
    Alert.alert("Reprocess Document", "Are you sure you want to re-run the AI pipeline? Current extracted data will be lost.", [
      { text: "Cancel", style: "cancel" },
      { 
        text: "Reprocess", 
        onPress: async () => {
          try {
            setIsSubmitting(true);
            await reprocessDocument(id as string);
            await loadDocument();
          } catch (err) {
            Alert.alert("Error", "Failed to reprocess document.");
          } finally {
            setIsSubmitting(false);
          }
        } 
      }
    ]);
  };

  const handleChangeType = () => {
    const documentTypes = [
      'invoice', 'receipt', 'cv', 'contract', 'bank_statement', 'id_document', 'letter', 'generic'
    ];
    
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancel', ...documentTypes.map(t => t.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()))],
          cancelButtonIndex: 0,
          title: "Change Document Type",
          message: "Select a new type. This will re-run data extraction."
        },
        async (buttonIndex) => {
          if (buttonIndex !== 0) {
            const newType = documentTypes[buttonIndex - 1];
            if (newType === document.documentType) return;
            try {
              setIsSubmitting(true);
              await updateDocumentType(id as string, newType);
              await loadDocument();
            } catch (err) {
              Alert.alert("Error", "Failed to update document type");
            } finally {
              setIsSubmitting(false);
            }
          }
        }
      );
    } else {
      Alert.alert(
        "Change Type",
        "Select new type",
        [
          { text: "Cancel", style: "cancel" },
          ...documentTypes.map(t => ({
            text: t.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
            onPress: async () => {
              if (t === document.documentType) return;
              try {
                setIsSubmitting(true);
                await updateDocumentType(id as string, t);
                await loadDocument();
              } catch (err) {
                Alert.alert("Error", "Failed to update document type");
              } finally {
                setIsSubmitting(false);
              }
            }
          }))
        ]
      );
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-slate-50 justify-center items-center">
        <ActivityIndicator size="large" color="#f97316" />
        <Text className="text-slate-500 font-medium mt-4">Loading document details...</Text>
      </SafeAreaView>
    );
  }

  if (error || !document) {
    return (
      <SafeAreaView className="flex-1 bg-slate-50 p-6">
        <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 bg-white rounded-full items-center justify-center shadow-sm border border-slate-200 mb-8">
          <ArrowLeft size={20} color="#64748b" />
        </TouchableOpacity>
        
        <View className="flex-1 justify-center items-center">
          <AlertCircle size={48} color="#cbd5e1" className="mb-4" />
          <Text className="text-xl font-bold text-slate-900 mb-2">Document Not Found</Text>
          <Text className="text-slate-500 text-center mb-6">{error || "The document does not exist."}</Text>
          <TouchableOpacity onPress={() => router.back()} className="bg-slate-900 px-6 py-3 rounded-full">
            <Text className="text-white font-bold">Back to Dashboard</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const isPdf = document.mimeType === "application/pdf";
  const isImage = document.mimeType.includes("image");

  return (
    <SafeAreaView className="flex-1 bg-slate-50" style={{ flex: 1 }}>
      {/* Header */}
      <View className="px-6 py-4 flex-row items-center gap-4 bg-white border-b border-slate-100 z-10">
        <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 bg-white rounded-full items-center justify-center border border-slate-200">
          <ArrowLeft size={20} color="#64748b" />
        </TouchableOpacity>
        <View className="flex-1">
          <Text className="text-lg font-bold text-slate-900" numberOfLines={1}>{document.fileName}</Text>
          <View className="flex-row items-center gap-2 mt-1">
            <View className={`px-2 py-0.5 rounded-md ${getStatusColor(document.processingStatus)}`}>
              <Text className={`text-[10px] font-bold uppercase tracking-wider ${getStatusColor(document.processingStatus).split(' ')[0]}`}>
                {document.processingStatus}
              </Text>
            </View>
          </View>
        </View>
        <View className="flex-row gap-2">
          <TouchableOpacity 
            onPress={handleChangeType}
            disabled={isSubmitting || document.processingStatus === 'processing'}
            className="w-10 h-10 bg-slate-50 rounded-full items-center justify-center"
            style={{ opacity: (isSubmitting || document.processingStatus === 'processing') ? 0.5 : 1 }}
          >
            <FileEdit size={18} color="#64748b" />
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={handleReprocess}
            disabled={isSubmitting || document.processingStatus === 'processing'}
            className="w-10 h-10 bg-slate-50 rounded-full items-center justify-center"
            style={{ opacity: (isSubmitting || document.processingStatus === 'processing') ? 0.5 : 1 }}
          >
            <RefreshCw size={18} color="#64748b" />
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={handleDelete}
            className="w-10 h-10 bg-rose-50 rounded-full items-center justify-center"
          >
            <Trash2 size={18} color="#f43f5e" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 100 }}>
        
        {/* Document Preview Area (react-native-pdf or Image) */}
        <View className="h-80 bg-slate-200 relative justify-center items-center overflow-hidden">
          {isPdf ? (
            <Pdf
              source={{ uri: document.fileUrl, cache: true }}
              style={{ flex: 1, width: '100%', height: '100%' }}
              trustAllCerts={false}
              onError={(error) => console.log(error)}
            />
          ) : isImage ? (
            <Image 
              source={{ uri: document.fileUrl }} 
              style={{ width: '100%', height: '100%' }} 
              resizeMode="contain" 
            />
          ) : (
            <View className="items-center justify-center p-6">
              <FileText size={48} color="#94a3b8" className="mb-4" />
              <Text className="text-slate-500 font-medium">Preview not available</Text>
            </View>
          )}
          
          <TouchableOpacity 
            onPress={() => Linking.openURL(document.fileUrl)}
            className="absolute bottom-4 right-4 bg-white/90 px-4 py-2 rounded-full flex-row items-center gap-2 shadow-sm"
          >
            <Download size={16} color="#334155" />
            <Text className="text-slate-700 font-bold text-sm">Download</Text>
          </TouchableOpacity>
        </View>

        {/* AI Results Area */}
        <View className="p-6">
          <Text className="text-lg font-bold text-slate-900 mb-4">AI Extraction Results</Text>
          
          {document.processingStatus === "processing" || document.processingStatus === "uploading" ? (
            <View className="items-center py-10 bg-white rounded-3xl border border-slate-100 shadow-sm">
              <ActivityIndicator size="large" color="#f97316" />
              <Text className="text-slate-500 font-medium mt-4">AI is analyzing document...</Text>
            </View>
          ) : document.processingStatus === "failed" ? (
            <View className="items-center py-10 bg-rose-50 rounded-3xl border border-rose-100">
              <AlertCircle size={32} color="#f43f5e" />
              <Text className="text-rose-600 font-medium mt-4 text-center px-6">
                {document.processingError || "Failed to extract data."}
              </Text>
            </View>
          ) : (
            <View className="space-y-6">
              
              <View className="flex-row gap-4">
                <View className="flex-1 bg-blue-50 p-4 rounded-2xl border border-blue-100">
                  <Text className="text-blue-400 text-xs font-bold uppercase tracking-wider mb-1">Type</Text>
                  <Text className="text-blue-900 font-bold text-base capitalize">{document.documentType || "Unknown"}</Text>
                </View>
                
                <View className="flex-1 bg-emerald-50 p-4 rounded-2xl border border-emerald-100">
                  <Text className="text-emerald-500 text-xs font-bold uppercase tracking-wider mb-1">Confidence</Text>
                  <Text className="text-emerald-700 font-bold text-base">
                    {document.confidence ? `${(document.confidence * 100).toFixed(0)}%` : 'N/A'}
                  </Text>
                </View>
              </View>

              <View className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
                <Text className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Reasoning</Text>
                <Text className="text-slate-700 leading-relaxed">
                  {document.classificationReasoning || "No reasoning provided."}
                </Text>
              </View>

              <View className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden p-5">
                <View className="flex-row items-center justify-between mb-4">
                  <Text className="text-slate-400 text-xs font-bold uppercase tracking-wider">Extracted Data</Text>
                  {document.processingStatus === "verified" && (
                    <View className="flex-row items-center bg-emerald-100 px-2.5 py-1 rounded-full gap-1.5">
                      <CheckCircle2 size={12} color="#059669" />
                      <Text className="text-emerald-700 font-bold text-xs">Verified</Text>
                    </View>
                  )}
                </View>

                {Object.keys(formData).length === 0 ? (
                  <Text className="text-slate-500 text-center py-4">No data extracted.</Text>
                ) : (
                  <View className="space-y-4">
                    {Object.entries(formData).map(([key, value]) => (
                      <View key={key} className="mb-4">
                        <Text className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </Text>
                        <TextInput
                          value={value}
                          onChangeText={(text) => setFormData(prev => ({ ...prev, [key]: text }))}
                          editable={document.processingStatus !== "verified" && !isSubmitting}
                          className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-medium"
                          style={{ opacity: document.processingStatus === "verified" || isSubmitting ? 0.7 : 1 }}
                        />
                      </View>
                    ))}
                  </View>
                )}

                {document.processingStatus !== "verified" && (
                  <TouchableOpacity
                    onPress={handleVerify}
                    disabled={isSubmitting || Object.keys(formData).length === 0}
                    className="mt-6 bg-slate-900 flex-row items-center justify-center py-3.5 rounded-xl gap-2 shadow-sm"
                    style={{ opacity: isSubmitting || Object.keys(formData).length === 0 ? 0.7 : 1 }}
                  >
                    {isSubmitting ? (
                      <ActivityIndicator size="small" color="#ffffff" />
                    ) : (
                      <CheckCircle2 size={18} color="#ffffff" />
                    )}
                    <Text className="text-white font-bold text-base">
                      {isSubmitting ? "Verifying..." : "Approve & Verify Data"}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>

            </View>
          )}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
