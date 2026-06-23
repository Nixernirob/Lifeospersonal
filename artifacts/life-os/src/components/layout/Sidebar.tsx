import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { GlassPanel } from "@/components/ui/glass";
import { 
  Home, 
  Image, 
  FileText, 
  GraduationCap, 
  Trophy, 
  Briefcase, 
  ListTodo, 
  BarChart2, 
  BookOpen, 
  Users, 
  Mail, 
  Settings 
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
  { href: "/journal", label: "Daily Journal", icon: BookOpen },
  { href: "/friends", label: "Friends Archive", icon: Users },
  { href: "/future-letters", label: "Future Letters", icon: Mail },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const [location] = useLocation();

  return (
    <GlassPanel className="w-64 h-screen fixed left-0 top-0 flex flex-col border-r border-y-0 border-l-0 rounded-none z-50">
      <div className="p-6">
        <h1 className="font-display text-2xl font-bold tracking-tight text-white mb-1">LifeOS</h1>
        <p className="text-xs text-[#5E6386]">Second Brain</p>
      </div>

      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1 custom-scrollbar">
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
                <item.icon className={cn("w-4 h-4", isActive ? "text-[#6CE5D8]" : "opacity-70")} />
                {item.label}
              </div>
            </Link>
          );
        })}
      </div>
    </GlassPanel>
  );
}
