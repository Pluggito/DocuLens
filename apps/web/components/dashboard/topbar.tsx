import { Search, Bell, User } from "lucide-react";

export function Topbar({ user }: { user?: any }) {
  // Get initials (e.g. "John Doe" -> "JD", "Test" -> "T")
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

  return (
    <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200/60 sticky top-0 z-30 flex items-center justify-between px-6 lg:px-10">
      <div className="flex-1 max-w-xl">
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-400 group-focus-within:text-slate-800 transition-colors" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-full leading-5 bg-slate-50/50 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all sm:text-sm"
            placeholder="Search documents, entities, or workflows..."
          />
        </div>
      </div>
      
      <div className="flex items-center gap-4 ml-4">
        <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors relative">
          <Bell size={20} />
          <span className="absolute top-2 right-2 block h-1.5 w-1.5 rounded-full bg-red-500 ring-2 ring-white" />
        </button>
        <div className="h-9 w-9 rounded-full bg-slate-900 flex items-center justify-center text-white font-bold shadow-sm cursor-pointer hover:shadow-md transition-all border-2 border-white ring-1 ring-slate-200">
          <span className="text-sm tracking-tight">{initials}</span>
        </div>
      </div>
    </header>
  );
}
