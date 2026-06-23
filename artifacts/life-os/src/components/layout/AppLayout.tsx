import { ReactNode } from "react";
import { Sidebar } from "./Sidebar";

export function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#07080F] text-[#F1F2FA] flex selection:bg-[#6CE5D8]/30">
      {/* Ambient background blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-[#6CE5D8]/10 blur-[120px] mix-blend-screen opacity-50 animate-pulse-slow" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-[#9B86F2]/10 blur-[120px] mix-blend-screen opacity-50 animate-pulse-slow" style={{ animationDelay: "2s" }} />
      </div>

      <Sidebar />
      
      <main className="flex-1 ml-64 min-h-screen relative z-10">
        <div className="max-w-[1200px] mx-auto p-8 md:p-12">
          {children}
        </div>
      </main>
    </div>
  );
}
