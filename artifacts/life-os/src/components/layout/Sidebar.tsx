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
    <GlassPanel className="w-64 h-screen fixed left-0 top-0 flex flex-col border-r border-y-0 border-l-0 rounded-none z-50">
      {/* Header with profile */}
      <div className="p-5 flex items-center gap-3 border-b border-white/5">
        <div className="relative flex-shrink-0 group">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-[#6CE5D8]/30 to-[#9B86F2]/30 border border-white/20 flex items-center justify-center hover:border-[#6CE5D8]/50 transition-colors"
          >
            {profilePic ? (
              <img src={profilePic} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <Camera className="w-4 h-4 text-[#6CE5D8] opacity-70" />
            )}
          </button>
          <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-[#6CE5D8] border-2 border-[#07080F] hidden group-hover:flex items-center justify-center" style={{ fontSize: "7px" }}>+</div>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleProfileUpload} />
        </div>
        <div className="min-w-0">
          <h1 className="font-display text-base font-bold tracking-tight text-white leading-tight">LifeOS</h1>
          <p className="text-[10px] text-[#5E6386]">Second Brain</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-3 px-3 space-y-0.5 custom-scrollbar">
        {NAV_ITEMS.map((item) => {
          const isActive = location === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <div
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer",
                  isActive
                    ? "bg-white/10 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]"
                    : "text-[#A7ACC8] hover:bg-white/5 hover:text-white"
                )}
              >
                <item.icon className={cn("w-4 h-4 flex-shrink-0", isActive ? "text-[#6CE5D8]" : "opacity-70")} />
                {item.label}
              </div>
            </Link>
          );
        })}
      </div>
    </GlassPanel>
  );
}
