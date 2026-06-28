import { ReactNode } from "react";
import { Sidebar } from "./Sidebar";

export function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div
      className="min-h-screen flex selection:bg-[#6CE5D8]/20"
      style={{ background: "var(--los-page-bg)", color: "var(--los-text-primary)" }}
    >
      {/* Ambient background blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div
          className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] rounded-full blur-[120px] animate-pulse-slow"
          style={{ background: "var(--los-blob-1)", mixBlendMode: "var(--los-blob-blend)" as React.CSSProperties["mixBlendMode"], opacity: 0.7 }}
        />
        <div
          className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] rounded-full blur-[120px] animate-pulse-slow"
          style={{ background: "var(--los-blob-2)", mixBlendMode: "var(--los-blob-blend)" as React.CSSProperties["mixBlendMode"], opacity: 0.7, animationDelay: "2s" }}
        />
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
