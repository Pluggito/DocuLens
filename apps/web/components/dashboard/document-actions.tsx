"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, RefreshCw, FileEdit } from "lucide-react";

export function DocumentActions({ 
  documentId, 
  isProcessing,
  currentType
}: { 
  documentId: string, 
  isProcessing: boolean,
  currentType: string | null
}) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isReprocessing, setIsReprocessing] = useState(false);
  const [isChangingType, setIsChangingType] = useState(false);
  const [showTypeMenu, setShowTypeMenu] = useState(false);

  const documentTypes = [
    'invoice', 'receipt', 'cv', 'contract', 'bank_statement', 'id_document', 'letter', 'generic'
  ];

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this document? This action cannot be undone.")) return;
    
    try {
      setIsDeleting(true);
      const res = await fetch(`/api/documents/${documentId}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete document");

      router.push("/dashboard/documents");
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Failed to delete document.");
      setIsDeleting(false);
    }
  };

  const handleReprocess = async () => {
    if (!confirm("Are you sure you want to reprocess this document? Current extracted data will be lost.")) return;
    
    try {
      setIsReprocessing(true);
      const res = await fetch(`/api/documents/${documentId}/reprocess`, {
        method: "POST",
      });

      if (!res.ok) throw new Error("Failed to reprocess document");

      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Failed to reprocess document.");
    } finally {
      setIsReprocessing(false);
    }
  };

  const handleUpdateType = async (newType: string) => {
    if (newType === currentType) {
      setShowTypeMenu(false);
      return;
    }

    if (!confirm(`Are you sure you want to change type to ${newType} and re-extract data?`)) return;
    
    try {
      setIsChangingType(true);
      setShowTypeMenu(false);
      const res = await fetch(`/api/documents/${documentId}/type`, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ documentType: newType }),
      });

      if (!res.ok) throw new Error("Failed to change document type");

      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Failed to change document type.");
    } finally {
      setIsChangingType(false);
    }
  };

  return (
    <div className="flex items-center gap-2 relative">
      {showTypeMenu && (
        <div className="absolute top-12 right-0 bg-white border border-slate-200 shadow-lg rounded-xl p-2 z-50 w-48 animate-in fade-in zoom-in-95 duration-200">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-2 pt-1">Change Type</div>
          {documentTypes.map(type => (
            <button
              key={type}
              onClick={() => handleUpdateType(type)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentType === type ? 'bg-blue-50 text-blue-700' : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <span className="capitalize">{type.replace('_', ' ')}</span>
            </button>
          ))}
        </div>
      )}

      {showTypeMenu && (
        <div className="fixed inset-0 z-40" onClick={() => setShowTypeMenu(false)} />
      )}

      <button
        onClick={() => setShowTypeMenu(!showTypeMenu)}
        disabled={isProcessing || isChangingType}
        className="inline-flex relative z-50 items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-medium py-2 px-3 rounded-xl transition-all shadow-sm disabled:opacity-50 text-sm"
        title="Override Document Type"
      >
        <FileEdit size={16} className={isChangingType ? "animate-pulse text-blue-500" : ""} />
        <span className="hidden sm:inline">{isChangingType ? "Updating..." : "Type"}</span>
      </button>

      <button
        onClick={handleReprocess}
        disabled={isReprocessing || isProcessing || isChangingType}
        className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-medium py-2 px-3 rounded-xl transition-all shadow-sm disabled:opacity-50 text-sm"
        title="Re-run AI pipeline"
      >
        <RefreshCw size={16} className={isReprocessing ? "animate-spin text-blue-500" : ""} />
        <span className="hidden sm:inline">{isReprocessing ? "Reprocessing..." : "Reprocess"}</span>
      </button>

      <button
        onClick={handleDelete}
        disabled={isDeleting || isChangingType}
        className="inline-flex items-center gap-2 bg-white hover:bg-rose-50 text-rose-600 border border-slate-200 hover:border-rose-200 font-medium py-2 px-3 rounded-xl transition-all shadow-sm disabled:opacity-50 text-sm"
      >
        <Trash2 size={16} />
        <span className="hidden sm:inline">{isDeleting ? "Deleting..." : "Delete"}</span>
      </button>
    </div>
  );
}
