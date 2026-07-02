import { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Camera, Image as ImageIcon, FileText } from "lucide-react-native";
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { uploadDocument, processDocument } from "../../utils/api";
import { useRouter } from "expo-router";

export default function ScanTab() {
  const router = useRouter();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");

  const handleUpload = async (uri: string, name: string, mimeType: string) => {
    try {
      setIsUploading(true);
      
      setUploadStatus("Uploading document...");
      const uploadRes = await uploadDocument(uri, name, mimeType);
      
      setUploadStatus("AI is analyzing...");
      await processDocument(uploadRes.document.id, uploadRes.document.fileUrl);
      
      Alert.alert(
        "Success", 
        "Document processed successfully!",
        [{ text: "View Details", onPress: () => router.push(`/document/${uploadRes.document.id}`) }]
      );
    } catch (err) {
      Alert.alert("Error", err instanceof Error ? err.message : "Upload failed");
    } finally {
      setIsUploading(false);
      setUploadStatus("");
    }
  };

  const handleDocumentPick = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        await handleUpload(file.uri, file.name, file.mimeType || 'application/octet-stream');
      }
    } catch (err) {
      Alert.alert("Error", "Failed to pick document");
    }
  };

  const handleImagePick = async (useCamera: boolean) => {
    try {
      const options: ImagePicker.ImagePickerOptions = {
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      };

      if (useCamera) {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission Denied', 'Camera permission is required');
          return;
        }
      }

      const result = useCamera 
        ? await ImagePicker.launchCameraAsync(options)
        : await ImagePicker.launchImageLibraryAsync(options);

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        const fileName = file.uri.split('/').pop() || 'scanned_image.jpg';
        await handleUpload(file.uri, fileName, 'image/jpeg');
      }
    } catch (err) {
      Alert.alert("Error", "Failed to get image");
    }
  };

  if (isUploading) {
    return (
      <View className="flex-1 bg-white items-center justify-center p-8">
        <ActivityIndicator size="large" color="#f97316" className="mb-4" />
        <Text className="text-lg font-bold text-slate-900">{uploadStatus}</Text>
        <Text className="text-slate-500 text-center mt-2">
          Please wait while we securely process your document.
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <View className="flex-1 p-6">
        <View className="mb-8">
          <Text className="text-3xl font-black text-slate-900 mb-2">Scan Document</Text>
          <Text className="text-slate-500 text-base">
            Upload a document, receipt, or invoice for AI processing.
          </Text>
        </View>

        <View className="gap-4">
          <TouchableOpacity 
            onPress={() => handleImagePick(true)}
            className="bg-white p-6 rounded-3xl border border-slate-100 flex-row items-center shadow-sm"
          >
            <View className="w-14 h-14 bg-orange-50 rounded-2xl items-center justify-center mr-4">
              <Camera size={28} color="#f97316" />
            </View>
            <View className="flex-1">
              <Text className="text-lg font-bold text-slate-900">Take Photo</Text>
              <Text className="text-slate-500 text-sm">Use your camera to scan</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => handleImagePick(false)}
            className="bg-white p-6 rounded-3xl border border-slate-100 flex-row items-center shadow-sm"
          >
            <View className="w-14 h-14 bg-blue-50 rounded-2xl items-center justify-center mr-4">
              <ImageIcon size={28} color="#3b82f6" />
            </View>
            <View className="flex-1">
              <Text className="text-lg font-bold text-slate-900">Photo Library</Text>
              <Text className="text-slate-500 text-sm">Select an existing photo</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={handleDocumentPick}
            className="bg-white p-6 rounded-3xl border border-slate-100 flex-row items-center shadow-sm"
          >
            <View className="w-14 h-14 bg-emerald-50 rounded-2xl items-center justify-center mr-4">
              <FileText size={28} color="#10b981" />
            </View>
            <View className="flex-1">
              <Text className="text-lg font-bold text-slate-900">Browse Files</Text>
              <Text className="text-slate-500 text-sm">Upload a PDF or image file</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
