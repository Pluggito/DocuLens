import Link from 'next/link';
import { redirect } from 'next/navigation';
import { StatCard } from "../../components/dashboard/stat-card";
import { RecentDocuments } from "../../components/dashboard/recent-documents";
import { 
  FileText, 
  BrainCircuit, 
  Clock,
  AlertCircle,
  UploadCloud
} from "lucide-react";
import { getSession } from '@/lib/auth';
import { getDashboardData } from '@/lib/dashboard';

export default async function DashboardPage() {
  const session = await getSession();
  
  if (!session) {
    redirect('/signin');
  }

  const { user, userId } = session;
  const data = await getDashboardData(userId);

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Welcome back, {user?.fullName?.split(' ')[0] || 'there'}</h1>
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
          value={data.metrics.totalProcessed}
          icon={<FileText size={20} />}
          colorVariant="brand"
        />
        <StatCard 
          title="Automation Rate"
          value={data.metrics.automationRate}
          icon={<BrainCircuit size={20} />}
          colorVariant="success"
        />
        <StatCard 
          title="Time Saved"
          value={data.metrics.timeSaved}
          icon={<Clock size={20} />}
          colorVariant="default"
        />
        <StatCard 
          title="Needs Review"
          value={data.metrics.needsReview}
          icon={<AlertCircle size={20} />}
          colorVariant={parseInt(data.metrics.needsReview) > 0 ? "warning" : "default"}
        />
      </div>

      {/* Recent Documents Table */}
      <RecentDocuments documents={data.recentDocuments} />

    </div>
  );
}
