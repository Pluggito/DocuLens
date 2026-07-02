import { redirect } from "next/navigation";
import Link from "next/link";
import { getSessionUserId } from "@/lib/auth";
import { getDb, documents, eq, and, desc, ilike, or, sql } from "@repo/db";
import { FileText, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { formatFileSize } from "@/lib/dashboard";
import { SearchFilterBar } from "@/components/dashboard/search-filter-bar";

const StatusBadge = ({ status, confidence }: { status: string; confidence?: number | null }) => {
  if (status === "verified") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 border border-emerald-200">
        <CheckCircle2 size={12} /> Verified
      </span>
    );
  }
  if (status === "completed") {
    if (confidence && confidence < 0.8) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-50 text-rose-600 border border-rose-100">
          <AlertCircle size={12} /> Needs Review
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-600 border border-emerald-100">
        <CheckCircle2 size={12} /> Processed
      </span>
    );
  }
  if (status === "processing" || status === "uploading") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-600 border border-amber-100">
        <Clock size={12} /> {status === "processing" ? "Processing" : "Uploading"}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-50 text-rose-600 border border-rose-100">
      <AlertCircle size={12} /> Failed
    </span>
  );
};

export default async function DocumentsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; status?: string }>;
}) {
  const userId = await getSessionUserId();

  if (!userId) {
    redirect("/signin");
  }

  const { search, status } = await searchParams;

  const db = await getDb();

  // Build the query conditions
  const conditions = [eq(documents.userId, userId)];

  if (status === "needs_review") {
    const reviewCondition = and(eq(documents.processingStatus, "completed"), sql`${documents.confidence} < 0.8`);
    if (reviewCondition) conditions.push(reviewCondition);
  } else if (status && status !== "all") {
    conditions.push(eq(documents.processingStatus, status));
  }

  if (search) {
    const searchTerm = `%${search}%`;
    const searchCondition = or(
      ilike(documents.fileName, searchTerm),
      ilike(sql`cast(${documents.extractedData} as text)`, searchTerm)
    );
    if (searchCondition) {
      conditions.push(searchCondition);
    }
  }

  const results = await db
    .select()
    .from(documents)
    .where(and(...conditions))
    .orderBy(desc(documents.createdAt));

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Document Library</h1>
          <p className="text-slate-500 text-sm mt-1">
            Browse, search, and manage all your processed documents.
          </p>
        </div>
      </div>

      <SearchFilterBar />

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mt-6">
        {results.length === 0 ? (
          <div className="p-16 text-center text-slate-500 flex flex-col items-center">
            <FileText size={48} className="text-slate-300 mb-4" />
            <p className="text-lg font-medium text-slate-900">No documents found</p>
            <p className="text-sm mt-1">Try adjusting your search or filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-slate-50/50 text-xs uppercase tracking-wider text-slate-500 border-b border-slate-200">
                  <th className="px-6 py-4 font-medium">Document Name</th>
                  <th className="px-6 py-4 font-medium">Type</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Date Uploaded</th>
                  <th className="px-6 py-4 font-medium text-right">Size</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-slate-100">
                {results.map((doc) => (
                  <Link 
                    key={doc.id} 
                    href={`/dashboard/documents/${doc.id}`}
                    legacyBehavior
                  >
                    <tr className="hover:bg-slate-50/50 transition-colors group cursor-pointer">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-50 text-blue-500 rounded-lg group-hover:scale-105 transition-transform">
                            <FileText size={16} />
                          </div>
                          <span className="font-medium text-slate-700 max-w-[250px] truncate block" title={doc.fileName}>
                            {doc.fileName}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-500 capitalize">{doc.documentType || "Unknown"}</td>
                      <td className="px-6 py-4">
                        <StatusBadge status={doc.processingStatus} confidence={doc.confidence} />
                      </td>
                      <td className="px-6 py-4 text-slate-500">
                        {formatDistanceToNow(new Date(doc.createdAt), { addSuffix: true })}
                      </td>
                      <td className="px-6 py-4 text-right text-slate-500">{formatFileSize(doc.fileSize)}</td>
                    </tr>
                  </Link>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
