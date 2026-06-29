import { FileText, CheckCircle2, Clock, AlertCircle } from "lucide-react";

const DOCUMENTS = [
  { id: "doc_1", name: "Q3_Financial_Report.pdf", type: "Financial", date: "Just now", status: "Processed", size: "2.4 MB" },
  { id: "doc_2", name: "Employee_Onboarding_Form.pdf", type: "HR", date: "2 hrs ago", status: "Pending", size: "856 KB" },
  { id: "doc_3", name: "Vendor_Contract_Acme.docx", type: "Legal", date: "5 hrs ago", status: "Error", size: "1.1 MB" },
  { id: "doc_4", name: "Invoice_INV-2023-08.pdf", type: "Billing", date: "Yesterday", status: "Processed", size: "432 KB" },
  { id: "doc_5", name: "NDA_TechSolutions.pdf", type: "Legal", date: "Yesterday", status: "Processed", size: "3.2 MB" },
];

const StatusBadge = ({ status }: { status: string }) => {
  if (status === "Processed") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-600 border border-emerald-100">
        <CheckCircle2 size={12} /> Processed
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

export function RecentDocuments() {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_8px_30px_rgba(0,0,0,0.03)] overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-900 tracking-tight">Recent Documents</h2>
        <button className="text-sm font-medium text-orange-500 hover:text-orange-600 transition-colors">
          View All
        </button>
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
            {DOCUMENTS.map((doc) => (
              <tr key={doc.id} className="hover:bg-slate-50/50 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 text-blue-500 rounded-lg group-hover:scale-105 transition-transform">
                      <FileText size={16} />
                    </div>
                    <span className="font-medium text-slate-700">{doc.name}</span>
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
