"use client";

import { useState } from "react";
import { Search, Bell, Menu, X, LayoutDashboard, Files, UploadCloud, Settings, LogOut } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export function Topbar({ user }: { user?: any }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const getInitials = (name: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  const initials = getInitials(user?.fullName);

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
    <>
      <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200/60 sticky top-0 z-30 flex items-center justify-between px-4 lg:px-10">
        <div className="flex items-center gap-3 flex-1">
          {/* Hamburger Menu (Mobile Only) */}
          <button 
            className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <Menu size={24} />
          </button>

          <div className="flex-1 max-w-xl hidden sm:block">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-slate-400 group-focus-within:text-slate-800 transition-colors" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-full leading-5 bg-slate-50/50 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all text-sm"
                placeholder="Search documents, entities..."
              />
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3 sm:gap-4 ml-4">
          {/* Mobile Search Icon (Since search bar is hidden on very small screens) */}
          <button className="sm:hidden p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
            <Search size={20} />
          </button>
          
          <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors relative">
            <Bell size={20} />
            <span className="absolute top-2 right-2 block h-1.5 w-1.5 rounded-full bg-red-500 ring-2 ring-white" />
          </button>
          <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-slate-900 flex items-center justify-center text-white font-bold shadow-sm cursor-pointer hover:shadow-md transition-all border-2 border-white ring-1 ring-slate-200">
            <span className="text-xs sm:text-sm tracking-tight">{initials}</span>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          
          {/* Sidebar Sheet */}
          <aside className="relative flex w-64 flex-col bg-white h-full shadow-2xl animate-in slide-in-from-left duration-300">
            <div className="h-16 flex items-center justify-between px-4 border-b border-slate-200/60">
              <Link 
                href="/dashboard" 
                className="text-xl font-black text-slate-900 tracking-tighter flex items-center gap-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <div className="w-7 h-7 rounded-full bg-slate-900 flex items-center justify-center shadow-sm">
                  <span className="text-white font-bold text-xs">D</span>
                </div>
                DocuLens Studio
              </Link>
              <button 
                className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="flex-1 py-6 px-4 flex flex-col gap-1 overflow-y-auto">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 px-3">Menu</div>
              {navItems.map((item, idx) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={idx}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
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
              <Link 
                href="/dashboard/settings" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all group font-medium mb-1"
              >
                <Settings size={20} className="text-slate-400 group-hover:text-slate-600 transition-colors" />
                Settings
              </Link>
              <button 
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 hover:text-red-600 hover:bg-red-50 transition-all group font-medium"
              >
                <LogOut size={20} className="text-slate-400 group-hover:text-red-500 transition-colors" />
                Sign Out
              </button>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
