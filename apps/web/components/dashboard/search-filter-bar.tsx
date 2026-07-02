"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, Filter } from "lucide-react";

export function SearchFilterBar() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentSearch = searchParams.get("search") || "";
  const currentStatus = searchParams.get("status") || "all";

  const [searchTerm, setSearchTerm] = useState(currentSearch);
  const [status, setStatus] = useState(currentStatus);

  // Debounce search term updates to the URL
  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      
      if (searchTerm) {
        params.set("search", searchTerm);
      } else {
        params.delete("search");
      }

      if (status !== "all") {
        params.set("status", status);
      } else {
        params.delete("status");
      }

      // We use router.push without scrolling to keep the user exactly where they are
      router.push(`/dashboard/documents?${params.toString()}`, { scroll: false });
    }, 400);

    return () => clearTimeout(timer);
  }, [searchTerm, status, router, searchParams]);

  return (
    <div className="flex flex-col md:flex-row gap-4 w-full bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
      
      {/* Search Input */}
      <div className="flex-1 relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search size={18} className="text-slate-400" />
        </div>
        <input
          type="text"
          placeholder="Search by file name or extracted data..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        />
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Filter size={16} className="text-slate-400" />
          </div>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="appearance-none pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="needs_review">Needs Review</option>
            <option value="verified">Verified</option>
            <option value="completed">Processed</option>
            <option value="processing">Processing</option>
            <option value="failed">Failed</option>
          </select>
          {/* Custom dropdown arrow */}
          <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
          </div>
        </div>
      </div>

    </div>
  );
}
