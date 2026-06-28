import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { GlassPanel } from "@/components/ui/glass";
import { useRef, useState, useEffect } from "react";
import { fileToBase64 } from "@/lib/useImageUpload";
import {
  Home,
  Image,
  FileText,
  GraduationCap,
  Trophy,
  Briefcase,
  ListTodo,
  BarChart2,
  Users,
  Mail,
  Settings,
  Camera,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/", label: "Home", icon: Home },
  { href: "/memories", label: "Memories", icon: Image },
  { href: "/notes", label: "Smart Notes", icon: FileText },
  { href: "/university", label: "University", icon: GraduationCap },
  { href: "/achievements", label: "Achievements", icon: Trophy },
  { href: "/projects", label: "Projects", icon: Briefcase },
  { href: "/bucketlist", label: "Bucket List", icon: ListTodo },
  { href: "/statistics", label: "Statistics", icon: BarChart2 },
  { href: "/friends", label: "Friends Archive", icon: Users },
  { href: "/future-letters", label: "Future Letters", icon: Mail },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const [location] = useLocation();
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem("lifeos-profile-pic");
    if (saved) setProfilePic(saved);
  }, []);

  const handleProfileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const b64 = await fileToBase64(file);
    setProfilePic(b64);
    localStorage.setItem("lifeos-profile-pic", b64);
  };

  return (
    <GlassPanel className="w-64 h-screen fixed left-0 top-0 flex flex-col rounded-none z-50">
      {/* Header with profile */}
      <div
        className="p-5 flex items-center gap-3"
        style={{ borderBottom: "1px solid var(--los-sidebar-border)" }}
      >
        <div className="relative flex-shrink-0 group">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center transition-all"
            style={{
              background: "linear-gradient(135deg, rgba(8,145,178,0.20), rgba(124,58,237,0.20))",
              border: "1px solid var(--los-border-2)",
            }}
          >
            {profilePic ? (
              <img src={profilePic} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <Camera className="w-4 h-4" style={{ color: "var(--los-cyan)", opacity: 0.8 }} />
            )}
          </button>
          <div
            className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 hidden group-hover:flex items-center justify-center text-white"
            style={{ background: "var(--los-cyan)", borderColor: "var(--los-page-bg)", fontSize: "7px" }}
          >+</div>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleProfileUpload} />
        </div>
        <div className="min-w-0">
          <h1
            className="font-display text-base font-bold tracking-tight leading-tight"
            style={{ color: "var(--los-text-primary)" }}
          >
            LifeOS
          </h1>
          <p className="text-[10px]" style={{ color: "var(--los-text-muted)" }}>Second Brain</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-3 px-3 space-y-0.5 custom-scrollbar">
        {NAV_ITEMS.map((item) => {
          const isActive = location === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <div
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer"
                )}
                style={{
                  background: isActive ? "var(--los-nav-active-bg)" : "transparent",
                  color: isActive ? "var(--los-nav-active-text)" : "var(--los-nav-inactive-text)",
                  boxShadow: isActive ? "inset 0 1px 0 rgba(255,255,255,0.06)" : "none",
                }}
                onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = "var(--los-nav-hover-bg)"; }}
                onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
              >
                <item.icon
                  className="w-4 h-4 flex-shrink-0"
                  style={{ color: isActive ? "var(--los-nav-active-icon)" : "var(--los-text-muted)", opacity: isActive ? 1 : 0.8 }}
                />
                {item.label}
              </div>
            </Link>
          );
        })}
      </div>
    </GlassPanel>
  );
}
