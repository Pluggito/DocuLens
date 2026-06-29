import Link from "next/link";
import { 
  LayoutDashboard, 
  Files, 
  Settings, 
  LogOut,
  BrainCircuit,
  Workflow
} from "lucide-react";

export function Sidebar() {
  const navItems = [
    { label: "Dashboard", href: "/dashboard", icon: <LayoutDashboard size={20} /> },
    { label: "Documents", href: "/dashboard/documents", icon: <Files size={20} /> },
    { label: "Workflows", href: "/dashboard/workflows", icon: <Workflow size={20} /> },
    { label: "AI Models", href: "/dashboard/models", icon: <BrainCircuit size={20} /> },
  ];

  return (
    <aside className="w-64 flex-shrink-0 hidden md:flex flex-col bg-white border-r border-slate-200/60 sticky top-0 h-screen">
      <div className="h-16 flex items-center px-6 border-b border-slate-200/60">
        <Link href="/" className="text-xl font-black text-slate-900 tracking-tighter flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-slate-900 flex items-center justify-center shadow-sm">
            <span className="text-white font-bold text-xs">D</span>
          </div>
          DocuLens
        </Link>
      </div>
      
      <div className="flex-1 py-6 px-4 flex flex-col gap-1 overflow-y-auto">
        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 px-3">Menu</div>
        {navItems.map((item, idx) => (
          <Link
            key={idx}
            href={item.href}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all group font-medium"
          >
            <div className="text-slate-400 group-hover:text-slate-800 transition-colors">
              {item.icon}
            </div>
            {item.label}
          </Link>
        ))}
      </div>

      <div className="p-4 border-t border-slate-200/60">
        <Link href="/dashboard/settings" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all group font-medium mb-1">
          <Settings size={20} className="text-slate-400 group-hover:text-slate-600 transition-colors" />
          Settings
        </Link>
        <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 hover:text-red-600 hover:bg-red-50 transition-all group font-medium">
          <LogOut size={20} className="text-slate-400 group-hover:text-red-500 transition-colors" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
