import Link from 'next/link';
import { StatCard } from "../../components/dashboard/stat-card";
import { RecentDocuments } from "../../components/dashboard/recent-documents";
import { 
  FileText, 
  BrainCircuit, 
  Clock,
  AlertCircle,
  UploadCloud
} from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Welcome back, Alex</h1>
          <p className="text-slate-500 mt-1 text-lg">Here is what's happening with your documents today.</p>
        </div>
        
        <Link href="/dashboard/upload" className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-medium py-3 px-6 rounded-full transition-all shadow-[0_4px_14px_rgba(0,0,0,0.1)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.15)] hover:-translate-y-0.5 group">
          <UploadCloud size={18} className="group-hover:-translate-y-0.5 transition-transform" />
          Upload Document
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Processed"
          value="1,245"
          icon={<FileText size={20} />}
          trend="12%"
          trendUp={true}
          colorVariant="brand"
        />
        <StatCard 
          title="Automation Rate"
          value="94.2%"
          icon={<BrainCircuit size={20} />}
          trend="2.4%"
          trendUp={true}
          colorVariant="success"
        />
        <StatCard 
          title="Time Saved"
          value="142 hrs"
          icon={<Clock size={20} />}
          trend="18 hrs"
          trendUp={true}
          colorVariant="default"
        />
        <StatCard 
          title="Needs Review"
          value="24"
          icon={<AlertCircle size={20} />}
          colorVariant="warning"
        />
      </div>

      {/* Recent Documents Table */}
      <RecentDocuments />

    </div>
  );
}
