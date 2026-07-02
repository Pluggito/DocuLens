"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2, Download, FileText } from "lucide-react";

export function DocumentReviewForm({ document }: { document: any }) {
  const router = useRouter();
  
  // Initialize form state, parsing any stringified JSON values left over from legacy saves
  const [formData, setFormData] = useState<Record<string, any>>(() => {
    const rawData = document.extractedData || {};
    const parsedData: Record<string, any> = {};
    Object.entries(rawData).forEach(([key, value]) => {
      if (typeof value === "string") {
        try {
          // Attempt to parse if it looks like a JSON array or object
          if ((value.startsWith("[") && value.endsWith("]")) || (value.startsWith("{") && value.endsWith("}"))) {
            parsedData[key] = JSON.parse(value);
            return;
          }
        } catch (e) {
          // Ignore parsing errors and keep as string
        }
      }
      parsedData[key] = value;
    });
    return parsedData;
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleInputChange = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleVerify = async () => {
    try {
      setIsSubmitting(true);
      setError("");

      const res = await fetch(`/api/documents/${document.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ extractedData: formData }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to verify document");
      }

      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownload = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    let htmlContent = `
      <html>
        <head>
          <title>${document.fileName || "Document Summary"}</title>
          <style>
            body { font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #111827; max-width: 800px; margin: 0 auto; padding: 40px; }
            h1 { font-size: 24px; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px; margin-bottom: 20px; color: #111827; }
            .section { margin-bottom: 24px; }
            .label { font-size: 12px; font-weight: 700; text-transform: uppercase; color: #6b7280; letter-spacing: 0.05em; margin-bottom: 4px; }
            .value { font-size: 16px; margin-bottom: 16px; background: #f9fafb; padding: 12px; border-radius: 8px; border: 1px solid #e5e7eb; }
            .array-item { background: #ffffff; border: 1px solid #e5e7eb; padding: 12px; border-radius: 8px; margin-bottom: 8px; }
            .tag { display: inline-block; background: #eff6ff; color: #1d4ed8; padding: 4px 12px; border-radius: 999px; font-size: 14px; font-weight: 500; margin: 0 8px 8px 0; border: 1px solid #dbeafe; }
            @media print {
              body { padding: 0; }
              .value, .array-item { border: 1px solid #d1d5db; }
              @page { margin: 1cm; }
            }
          </style>
        </head>
        <body>
          <h1>Document Summary - ${document.fileName || ""}</h1>
    `;

    const renderHtml = (data: any): string => {
      let html = '';
      Object.entries(data).forEach(([key, value]) => {
        const title = key.replace(/([A-Z])/g, ' $1').trim().replace(/^./, str => str.toUpperCase());
        html += `<div class="section"><div class="label">${title}</div>`;
        
        if (Array.isArray(value)) {
          if (value.length > 0 && typeof value[0] === 'string') {
            html += `<div>${value.map(item => `<span class="tag">${item}</span>`).join('')}</div>`;
          } else {
            html += `<div class="value" style="background:transparent; padding:0; border:none;">`;
            value.forEach((item: any) => {
              html += `<div class="array-item">`;
              Object.entries(item).forEach(([subKey, subVal]) => {
                const subTitle = subKey.replace(/([A-Z])/g, ' $1').trim().replace(/^./, str => str.toUpperCase());
                html += `<div style="margin-bottom:4px;"><strong>${subTitle}:</strong> ${subVal}</div>`;
              });
              html += `</div>`;
            });
            html += `</div>`;
          }
        } else if (typeof value === 'object' && value !== null) {
          html += `<div class="value">${renderHtml(value)}</div>`;
        } else {
          html += `<div class="value">${String(value)}</div>`;
        }
        html += `</div>`;
      });
      return html;
    };

    htmlContent += renderHtml(formData);
    htmlContent += `
          <script>
            window.onload = function() { 
              setTimeout(() => {
                window.print(); 
                window.onafterprint = function(){ window.close(); }
              }, 500);
            }
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  const isVerified = document.processingStatus === "verified";

  const renderDataNode = (key: string, value: any) => {
    const title = key.replace(/([A-Z])/g, ' $1').trim();

    if (Array.isArray(value)) {
      // Check if it's an array of strings (e.g. skills)
      if (value.length > 0 && typeof value[0] === 'string') {
        return (
          <div key={key} className="mb-4">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{title}</label>
            <div className="flex flex-wrap gap-2">
              {value.map((item, i) => (
                <span key={i} className="px-3 py-1 bg-blue-50 text-blue-700 text-sm font-medium rounded-full border border-blue-100 shadow-sm">
                  {item}
                </span>
              ))}
            </div>
          </div>
        );
      }
      
      // Array of objects (e.g. experience)
      return (
        <div key={key} className="mb-6">
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{title}</label>
          <div className="space-y-3">
            {value.map((item, i) => (
              <div key={i} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition-all">
                {Object.entries(item).map(([subKey, subVal]) => (
                  <div key={subKey} className="mb-2 last:mb-0 text-sm">
                    <span className="font-semibold text-slate-700 capitalize w-24 inline-block">{subKey.replace(/([A-Z])/g, ' $1')}:</span>
                    <span className="text-slate-600">{String(subVal)}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (typeof value === 'object' && value !== null) {
      return (
        <div key={key} className="mb-4 pl-4 border-l-2 border-slate-200">
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{title}</label>
          {Object.entries(value).map(([subKey, subVal]) => renderDataNode(subKey, subVal))}
        </div>
      );
    }

    // Primitive (string, number, boolean)
    return (
      <div key={key} className="mb-4">
        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">{title}</label>
        {String(value).length > 60 ? (
          <textarea
            value={value as string}
            onChange={(e) => handleInputChange(key, e.target.value)}
            disabled={isVerified || isSubmitting}
            className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2.5 text-slate-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-70 disabled:bg-slate-50 transition-all min-h-[100px]"
          />
        ) : (
          <input
            type="text"
            value={value as string}
            onChange={(e) => handleInputChange(key, e.target.value)}
            disabled={isVerified || isSubmitting}
            className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2.5 text-slate-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-70 disabled:bg-slate-50 transition-all"
          />
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Extracted Data
        </h3>
        <div className="flex items-center gap-2">
          <button 
            onClick={handleDownload}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-sm"
          >
            <FileText size={14} /> Download Summary
          </button>
          {isVerified && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-emerald-100 text-emerald-700">
              <CheckCircle2 size={14} /> Verified
            </span>
          )}
        </div>
      </div>

      <div className="bg-slate-50 rounded-xl border border-slate-200 p-6 shadow-inner max-h-[800px] overflow-y-auto custom-scrollbar">
        {Object.keys(formData).length === 0 ? (
          <p className="text-slate-500 text-sm text-center py-8 bg-white rounded-lg border border-slate-100">No data extracted.</p>
        ) : (
          Object.entries(formData).map(([key, value]) => renderDataNode(key, value))
        )}

        {error && (
          <p className="text-rose-500 text-sm font-medium mt-4 p-3 bg-rose-50 rounded-lg border border-rose-100">{error}</p>
        )}
      </div>

      {!isVerified && (
        <button
          onClick={handleVerify}
          disabled={isSubmitting || Object.keys(formData).length === 0}
          className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2 disabled:opacity-70"
        >
          {isSubmitting ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <CheckCircle2 size={18} />
          )}
          {isSubmitting ? "Verifying..." : "Approve & Verify Data"}
        </button>
      )}
    </div>
  );
}
