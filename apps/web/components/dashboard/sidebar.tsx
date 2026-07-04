"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Files, 
  Settings, 
  LogOut,
  UploadCloud
} from "lucide-react";

export function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/auth/signin');
    } catch (e) {
      console.error(e);
    }
  };

  const navItems = [
    { label: "Dashboard", href: "/dashboard", icon: <LayoutDashboard size={20} /> },
    { label: "Documents", href: "/dashboard/documents", icon: <Files size={20} /> },
    { label: "Upload Document", href: "/dashboard/upload", icon: <UploadCloud size={20} /> },
  ];

  return (
    <aside className="w-64 flex-shrink-0 hidden md:flex flex-col bg-white border-r border-slate-200/60 sticky top-0 h-screen">
      <div className="h-16 flex items-center px-6 border-b border-slate-200/60">
        <Link href="/dashboard" className="text-xl font-black text-slate-900 tracking-tighter flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-slate-900 flex items-center justify-center shadow-sm">
            <span className="text-white font-bold text-xs">D</span>
          </div>
          DocuLens Studio
        </Link>
      </div>
      
      <div className="flex-1 py-6 px-4 flex flex-col gap-1 overflow-y-auto">
        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 px-3">Menu</div>
        {navItems.map((item, idx) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={idx}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group font-medium ${
                isActive 
                  ? "bg-slate-900 text-white shadow-md shadow-slate-900/10" 
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              <div className={`transition-colors ${isActive ? "text-white" : "text-slate-400 group-hover:text-slate-800"}`}>
                {item.icon}
              </div>
              {item.label}
            </Link>
          );
        })}
      </div>

      <div className="p-4 border-t border-slate-200/60">
        <Link href="/dashboard/settings" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all group font-medium mb-1">
          <Settings size={20} className="text-slate-400 group-hover:text-slate-600 transition-colors" />
          Settings
        </Link>
        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 hover:text-red-600 hover:bg-red-50 transition-all group font-medium"
        >
          <LogOut size={20} className="text-slate-400 group-hover:text-red-500 transition-colors" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
