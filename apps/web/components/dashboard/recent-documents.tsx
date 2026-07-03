"use client"

import { FileText, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { RecentDocument } from "@/lib/dashboard";
import Link from "next/link";
import { useRouter } from "next/navigation";

const StatusBadge = ({ status }: { status: string }) => {
  if (status === "Verified") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 border border-emerald-200">
        <CheckCircle2 size={12} /> Verified
      </span>
    );
  }
  if (status === "Needs Review") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-600 border border-blue-100">
        <AlertCircle size={12} /> Needs Review
      </span>
    );
  }
  if (status === "Pending") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-600 border border-amber-100">
        <Clock size={12} /> Pending
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-50 text-rose-600 border border-rose-100">
      <AlertCircle size={12} /> Error
    </span>
  );
};

export function RecentDocuments({ documents }: { documents: RecentDocument[] }) {
  const router = useRouter();

  if (documents.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_8px_30px_rgba(0,0,0,0.03)] overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">Recent Documents</h2>
        </div>
        <div className="p-12 text-center text-slate-500">
          <FileText size={32} className="mx-auto mb-3 text-slate-300" />
          <p>No documents processed yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_8px_30px_rgba(0,0,0,0.03)] overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-900 tracking-tight">Recent Documents</h2>
        <Link href="/dashboard/documents" className="text-sm font-medium text-orange-500 hover:text-orange-600 transition-colors">
          View All
        </Link>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead>
            <tr className="bg-slate-50/50 text-xs uppercase tracking-wider text-slate-500 border-b border-slate-100">
              <th className="px-6 py-4 font-medium">Document Name</th>
              <th className="px-6 py-4 font-medium">Type</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium">Date</th>
              <th className="px-6 py-4 font-medium text-right">Size</th>
            </tr>
          </thead>
          <tbody className="text-sm divide-y divide-slate-100">
            {documents.map((doc) => (
              <tr 
                key={doc.id} 
                className="hover:bg-slate-50/50 transition-colors group cursor-pointer"
                onClick={() => router.push(`/dashboard/documents/${doc.id}`)}
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 text-blue-500 rounded-lg group-hover:scale-105 transition-transform">
                      <FileText size={16} />
                    </div>
                    <span className="font-medium text-slate-700 max-w-[200px] truncate block" title={doc.name}>{doc.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-slate-500">{doc.type}</td>
                <td className="px-6 py-4">
                  <StatusBadge status={doc.status} />
                </td>
                <td className="px-6 py-4 text-slate-500">{doc.date}</td>
                <td className="px-6 py-4 text-right text-slate-500">{doc.size}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
