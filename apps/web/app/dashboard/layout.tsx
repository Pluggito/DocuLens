import { Sidebar } from "../../components/dashboard/sidebar";
import { Topbar } from "../../components/dashboard/topbar";

import { getSession } from "@/lib/auth";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  return (
    <div className="flex h-screen bg-[#FAFAFA] overflow-hidden font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Topbar user={session?.user} />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
