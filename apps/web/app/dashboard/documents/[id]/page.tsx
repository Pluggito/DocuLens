import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getSessionUserId } from '@/lib/auth';
import { getDb, documents, eq, and } from '@repo/db';
import { ArrowLeft, CheckCircle2, Clock, AlertCircle, FileText, Download } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

import { DocumentReviewForm } from '@/components/dashboard/document-review-form';
import { DocumentActions } from '@/components/dashboard/document-actions';

export default async function DocumentDetailsPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const userId = await getSessionUserId();
  
  if (!userId) {
    redirect('/signin');
  }

  const { id } = await params;
  const db = await getDb();
  const [document] = await db
    .select()
    .from(documents)
    .where(and(eq(documents.id, id), eq(documents.userId, userId)))
    .limit(1);

  if (!document) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <FileText size={48} className="text-slate-300 mb-4" />
        <h2 className="text-xl font-bold text-slate-900">Document Not Found</h2>
        <p className="text-slate-500 mb-6">The document you are looking for does not exist or you don't have access.</p>
        <Link href="/dashboard" className="bg-slate-900 text-white px-6 py-2 rounded-full font-medium hover:bg-slate-800 transition-colors">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Header Navigation */}
      <div className="flex items-center gap-4 mb-2">
        <Link href="/dashboard" className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-900 hover:border-slate-300 transition-all shadow-sm">
          <ArrowLeft size={18} />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
            {document.fileName}
            {document.processingStatus === "completed" && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-600 border border-blue-100">
                <AlertCircle size={12} /> Needs Review
              </span>
            )}
            {document.processingStatus === "verified" && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 border border-emerald-200">
                <CheckCircle2 size={12} /> Verified
              </span>
            )}
            {(document.processingStatus === "uploading" || document.processingStatus === "processing") && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-600 border border-amber-100">
                <Clock size={12} /> Processing...
              </span>
            )}
            {document.processingStatus === "failed" && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-50 text-rose-600 border border-rose-100">
                <AlertCircle size={12} /> Failed
              </span>
            )}
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Uploaded {formatDistanceToNow(new Date(document.createdAt), { addSuffix: true })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <DocumentActions 
            documentId={document.id} 
            isProcessing={document.processingStatus === "processing" || document.processingStatus === "uploading"} 
            currentType={document.documentType}
          />
          <a 
            href={document.fileUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-medium py-2 px-3 rounded-xl transition-all shadow-sm text-sm"
          >
            <Download size={16} />
            <span className="hidden sm:inline">Original</span>
          </a>
        </div>
      </div>

      {/* Main Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[800px]">
        
        {/* Left Side: Document Preview */}
        <div className="bg-slate-100 rounded-2xl border border-slate-200 overflow-hidden flex flex-col">
          <div className="p-4 bg-white border-b border-slate-200 flex justify-between items-center">
            <h2 className="font-semibold text-slate-700 flex items-center gap-2">
              <FileText size={18} className="text-blue-500" /> Document Preview
            </h2>
          </div>
          <div className="flex-1 relative bg-slate-100">
            {document.mimeType.includes("image") ? (
              <img 
                src={document.fileUrl} 
                alt={document.fileName}
                className="w-full h-full object-contain p-4"
              />
            ) : document.mimeType === "application/pdf" ? (
              <object 
                data={document.fileUrl} 
                type="application/pdf" 
                className="w-full h-full"
              >
                <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                  <p className="text-slate-500 mb-4">Your browser does not support inline PDF viewing.</p>
                  <a href={document.fileUrl} className="text-blue-500 font-medium hover:underline">Download PDF</a>
                </div>
              </object>
            ) : (
              <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                <FileText size={48} className="text-slate-300 mb-4" />
                <p className="text-slate-500">Preview not available for this file type.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Extracted Data */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h2 className="font-semibold text-slate-800">AI Extraction Results</h2>
            {document.confidence && (
              <div className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                document.confidence > 0.8 ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
              }`}>
                {(document.confidence * 100).toFixed(0)}% Confidence
              </div>
            )}
          </div>
          
          <div className="flex-1 overflow-y-auto p-6">
            {document.processingStatus === "processing" || document.processingStatus === "uploading" ? (
              <div className="flex flex-col items-center justify-center h-full space-y-4">
                <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-slate-500 font-medium">The AI is currently analyzing this document...</p>
              </div>
            ) : document.processingStatus === "failed" ? (
              <div className="flex flex-col items-center justify-center h-full space-y-3 text-rose-500 p-6 bg-rose-50 rounded-xl">
                <AlertCircle size={32} />
                <p className="font-medium text-center">{document.processingError || "Failed to extract data."}</p>
              </div>
            ) : (
              <div className="space-y-6">
                
                {/* Classification */}
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Document Classification</h3>
                  <div className="bg-blue-50/50 border border-blue-100 p-4 rounded-xl">
                    <p className="font-bold text-blue-900 mb-1 capitalize">{document.documentType || "Unknown"}</p>
                    <p className="text-sm text-blue-700/80 leading-relaxed">{document.classificationReasoning || "No reasoning provided."}</p>
                  </div>
                </div>

                {/* Editable JSON Data */}
                <DocumentReviewForm document={document} />

              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
