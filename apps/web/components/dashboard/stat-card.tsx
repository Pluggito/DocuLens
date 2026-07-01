import { ReactNode } from "react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: string;
  trendUp?: boolean;
  colorVariant?: "default" | "success" | "warning" | "brand";
}

export function StatCard({ title, value, icon, trend, trendUp, colorVariant = "default" }: StatCardProps) {
  
  const iconColors = {
    default: "text-slate-500 bg-slate-50 group-hover:text-blue-500 group-hover:bg-blue-50",
    success: "text-emerald-500 bg-emerald-50 group-hover:text-emerald-600 group-hover:bg-emerald-100",
    warning: "text-amber-500 bg-amber-50 group-hover:text-amber-600 group-hover:bg-amber-100",
    brand: "text-slate-400 bg-slate-50 group-hover:text-orange-500 group-hover:bg-orange-50",
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-[0_8px_30px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] transition-all duration-300 flex flex-col justify-between group">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-sm font-medium text-slate-500">{title}</h3>
        <div className={`p-2.5 rounded-xl transition-colors ${iconColors[colorVariant]}`}>
          {icon}
        </div>
      </div>
      <div>
        <div className="text-3xl font-bold text-slate-900 tracking-tight">{value}</div>
        {trend && (
          <div className={`text-sm mt-2 font-medium flex items-center gap-1 ${trendUp ? 'text-emerald-500' : 'text-rose-500'}`}>
            <span>{trendUp ? '↑' : '↓'}</span>
            {trend}
            <span className="text-slate-400 font-normal ml-1">vs last month</span>
          </div>
        )}
      </div>
    </div>
  );
}
