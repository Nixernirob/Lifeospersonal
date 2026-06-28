import { cn } from "@/lib/utils";
import { motion, HTMLMotionProps } from "framer-motion";
import { forwardRef } from "react";

export interface GlassCardProps extends HTMLMotionProps<"div"> {
  interactive?: boolean;
}

export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, interactive = false, children, style, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        className={cn(
          "los-card relative overflow-hidden rounded-2xl text-[#F1F2FA]",
          interactive && "cursor-pointer",
          className
        )}
        style={{
          background: "var(--los-card-bg)",
          backdropFilter: "blur(22px) saturate(1.4)",
          WebkitBackdropFilter: "blur(22px) saturate(1.4)",
          border: "1px solid var(--los-card-border)",
          boxShadow: "var(--los-card-shadow)",
          color: "var(--los-text-primary)",
          ...style,
        }}
        whileHover={interactive ? { y: -3, boxShadow: "0 8px 30px rgba(0,0,0,0.10)" } : {}}
        transition={{ duration: 0.2 }}
        {...props}
      >
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-br rounded-2xl"
          style={{ background: "linear-gradient(135deg, var(--los-glass-overlay) 0%, transparent 60%)" }} />
        <div className="relative z-10">{children as React.ReactNode}</div>
      </motion.div>
    );
  }
);
GlassCard.displayName = "GlassCard";

export const GlassPanel = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, style, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("los-panel relative", className)}
        style={{
          background: "var(--los-sidebar-bg)",
          backdropFilter: "blur(24px) saturate(1.5)",
          WebkitBackdropFilter: "blur(24px) saturate(1.5)",
          borderRight: "1px solid var(--los-sidebar-border)",
          ...style,
        }}
        {...props}
      >
        {children}
      </div>
    );
  }
);
GlassPanel.displayName = "GlassPanel";
