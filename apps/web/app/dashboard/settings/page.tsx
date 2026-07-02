import { getSession } from "@/lib/auth";
import { User, Shield, Bell, Key } from "lucide-react";

export default async function SettingsPage() {
  const session = await getSession();
  
  return (
    <div className="p-6 lg:p-10 max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Settings</h1>
        <p className="text-slate-500 mt-1">Manage your account preferences and integrations.</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-slate-900 flex items-center justify-center text-white font-bold text-2xl shadow-inner">
            {session?.user?.fullName?.charAt(0).toUpperCase() || "U"}
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">{session?.user?.fullName}</h2>
            <p className="text-slate-500">{session?.user?.email}</p>
          </div>
        </div>
        
        <div className="p-0">
          <div className="divide-y divide-slate-100">
            <div className="p-6 flex items-start gap-4 hover:bg-slate-50 transition-colors cursor-pointer group">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-100 transition-colors">
                <User size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">Profile Information</h3>
                <p className="text-sm text-slate-500 mt-0.5">Update your name, phone number, and basic details.</p>
              </div>
            </div>
            
            <div className="p-6 flex items-start gap-4 hover:bg-slate-50 transition-colors cursor-pointer group">
              <div className="p-2 bg-purple-50 text-purple-600 rounded-lg group-hover:bg-purple-100 transition-colors">
                <Key size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">API Keys</h3>
                <p className="text-sm text-slate-500 mt-0.5">Manage your API keys for integrating DocuLens into your own apps.</p>
              </div>
            </div>
            
            <div className="p-6 flex items-start gap-4 hover:bg-slate-50 transition-colors cursor-pointer group">
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg group-hover:bg-emerald-100 transition-colors">
                <Shield size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">Security</h3>
                <p className="text-sm text-slate-500 mt-0.5">Change your password and manage two-factor authentication.</p>
              </div>
            </div>
            
            <div className="p-6 flex items-start gap-4 hover:bg-slate-50 transition-colors cursor-pointer group">
              <div className="p-2 bg-orange-50 text-orange-600 rounded-lg group-hover:bg-orange-100 transition-colors">
                <Bell size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">Notifications</h3>
                <p className="text-sm text-slate-500 mt-0.5">Configure email alerts for document processing and limits.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="text-center">
        <p className="text-sm text-slate-400">DocuLens Platform v1.0.0</p>
      </div>
    </div>
  );
}
