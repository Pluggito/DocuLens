"use client";

import { FileText, ChevronRight, CheckCircle, Database } from "lucide-react";

interface DocumentData {
  id: string;
  fileName: string;
  documentType: string | null;
  confidence: number | null;
  extractedData: Record<string, any> | null;
  classificationReasoning: string | null;
}

export function ExtractionResult({ document }: { document: DocumentData }) {
  if (!document) return null;

  // Format confidence to percentage
  const confidencePercent = document.confidence 
    ? Math.round(document.confidence * 100) 
    : 0;

  // Helper to nicely format the extracted JSON keys
  const formatKey = (key: string) => {
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (str) => str.toUpperCase());
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden animate-in slide-in-from-bottom-4 duration-500">
      <div className="border-b border-slate-100 p-6 bg-slate-50/50">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Database className="text-blue-600" size={24} />
          AI Extraction Results
        </h2>
        <p className="text-slate-500 mt-1">Here is what our AI found in your document.</p>
      </div>

      <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left Column: Classification Info */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-blue-900 uppercase tracking-wider mb-3">Classification</h3>
            
            <div className="flex items-end gap-3 mb-2">
              <span className="text-3xl font-bold text-blue-700 capitalize">
                {document.documentType?.replace('_', ' ') || 'Unknown'}
              </span>
            </div>

            <div className="flex items-center gap-2 mb-4">
              <div className="flex-1 h-2 bg-blue-200 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full ${confidencePercent > 80 ? 'bg-green-500' : 'bg-blue-500'}`} 
                  style={{ width: `${confidencePercent}%` }}
                />
              </div>
              <span className="text-sm font-medium text-slate-700">{confidencePercent}%</span>
            </div>

            {document.classificationReasoning && (
              <div className="mt-4 text-sm text-blue-800 bg-white/60 p-3 rounded-lg border border-blue-100/50">
                <p className="font-medium mb-1">AI Reasoning:</p>
                <p className="opacity-90 leading-relaxed">{document.classificationReasoning}</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Extracted Data */}
        <div className="md:col-span-2 space-y-4">
          <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <FileText size={20} className="text-slate-400" />
            Structured Data
          </h3>

          {document.extractedData && Object.keys(document.extractedData).length > 0 ? (
            <div className="bg-slate-50 border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-sm text-left">
                <tbody>
                  {Object.entries(document.extractedData).map(([key, value], idx) => (
                    <tr 
                      key={key} 
                      className={`border-b border-slate-100 last:border-0 hover:bg-white transition-colors ${idx % 2 === 0 ? 'bg-transparent' : 'bg-slate-100/50'}`}
                    >
                      <th className="py-4 px-5 font-medium text-slate-600 w-1/3 align-top border-r border-slate-100">
                        {formatKey(key)}
                      </th>
                      <td className="py-4 px-5 text-slate-900 font-medium">
                        {value === null || value === undefined ? (
                          <span className="text-slate-400 italic font-normal">Not found</span>
                        ) : typeof value === 'object' ? (
                          <pre className="whitespace-pre-wrap text-xs bg-slate-100 p-2 rounded text-slate-700 font-mono">
                            {JSON.stringify(value, null, 2)}
                          </pre>
                        ) : (
                          <span className="flex items-center gap-2">
                            {String(value)}
                            <CheckCircle size={14} className="text-green-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center p-12 border border-slate-200 border-dashed rounded-xl bg-slate-50">
              <p className="text-slate-500">No structured data was extracted.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
