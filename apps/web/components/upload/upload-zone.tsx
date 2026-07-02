"use client";

import { useState, useRef, useEffect } from "react";
import { UploadCloud, File, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { ExtractionResult } from "./extraction-result";

type UploadState = "idle" | "uploading" | "processing" | "success" | "error";

export function UploadZone() {
  const [state, setState] = useState<UploadState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (state === "uploading") {
      setProgress(0);
      interval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 5, 50));
      }, 200);
    } else if (state === "processing") {
      setProgress(50);
      interval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 2, 95));
      }, 500);
    } else if (state === "success") {
      setProgress(100);
    } else {
      setProgress(0);
    }
    return () => clearInterval(interval);
  }, [state]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      await processFile(e.target.files[0]);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await processFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const processFile = async (file: File) => {
    setSelectedFile(file);
    setState("uploading");
    setError(null);
    setResult(null);

    try {
      // 1. Upload the file
      const formData = new FormData();
      formData.append("file", file);

      const uploadRes = await fetch("/api/documents/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadRes.ok) {
        const errorData = await uploadRes.json();
        throw new Error(errorData.message || errorData.error || "Failed to upload document");
      }

      const { document } = await uploadRes.json();
      
      // 2. Process the file
      setState("processing");
      
      const processRes = await fetch("/api/documents/process", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          documentId: document.id,
          url: document.fileUrl,
        }),
      });

      if (!processRes.ok) {
        const errorData = await processRes.json();
        throw new Error(errorData.error || "Failed to process document");
      }

      const processData = await processRes.json();
      setResult(processData.document);
      setState("success");
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "An unknown error occurred");
      setState("error");
    }
  };

  const reset = () => {
    setState("idle");
    setError(null);
    setResult(null);
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  if (state === "success" && result) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-xl">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="text-green-600" size={24} />
            <div>
              <p className="font-medium text-green-900">Processing Complete</p>
              <p className="text-sm text-green-700">{selectedFile?.name}</p>
            </div>
          </div>
          <button 
            onClick={reset}
            className="text-sm font-medium text-green-800 hover:text-green-900 bg-green-200/50 hover:bg-green-200 px-4 py-2 rounded-lg transition-colors"
          >
            Upload Another
          </button>
        </div>
        
        <ExtractionResult document={result} />
      </div>
    );
  }

  return (
    <div className="w-full">
      <div 
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => state === "idle" || state === "error" ? fileInputRef.current?.click() : null}
        className={`relative border-2 border-dashed rounded-xl p-12 transition-all flex flex-col items-center justify-center min-h-[320px] text-center
          ${isDragOver ? "border-blue-500 bg-blue-50" : "border-slate-300 hover:border-slate-400 hover:bg-slate-50"}
          ${(state === "idle" || state === "error") ? "cursor-pointer" : "cursor-default opacity-80"}
        `}
      >
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          onChange={handleFileChange}
          accept="image/*,application/pdf"
          disabled={state === "uploading" || state === "processing"}
        />

        {state === "idle" && (
          <div className="flex flex-col items-center space-y-4 animate-in fade-in zoom-in-95 duration-300">
            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
              <UploadCloud size={32} />
            </div>
            <div>
              <p className="text-lg font-semibold text-slate-900">Click to upload or drag and drop</p>
              <p className="text-slate-500 mt-1">PDF, JPG, PNG, or WEBP (max. 10MB)</p>
            </div>
          </div>
        )}

        {(state === "uploading" || state === "processing") && (
          <div className="flex flex-col items-center space-y-5 animate-in fade-in zoom-in-95 duration-300 w-full max-w-sm mx-auto">
            <div className="relative">
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
                <File size={28} className="opacity-50" />
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 size={36} className="text-blue-600 animate-spin" />
              </div>
            </div>
            <div>
              <p className="text-lg font-semibold text-slate-900">
                {state === "uploading" ? "Uploading document..." : "AI is analyzing..."}
              </p>
              <p className="text-slate-500 mt-1 truncate max-w-[250px]">
                {selectedFile?.name}
              </p>
            </div>

            {/* Progress Bar */}
            <div className="w-full mt-2">
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-600 rounded-full transition-all duration-300 ease-out" 
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-xs text-slate-400 mt-2 font-medium">{progress}%</p>
            </div>
          </div>
        )}

        {state === "error" && (
          <div className="flex flex-col items-center space-y-4 animate-in fade-in zoom-in-95 duration-300">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center">
              <AlertCircle size={32} />
            </div>
            <div>
              <p className="text-lg font-semibold text-slate-900">Upload Failed</p>
              <p className="text-red-500 mt-1 max-w-sm mx-auto">{error}</p>
            </div>
            <p className="text-sm font-medium text-slate-600 mt-4">Click to try again</p>
          </div>
        )}
      </div>
    </div>
  );
}
