import { cn } from "@/lib/utils";
import { motion, HTMLMotionProps } from "framer-motion";
import { forwardRef } from "react";

export interface GlassCardProps extends HTMLMotionProps<"div"> {
  interactive?: boolean;
}

export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, interactive = false, children, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        className={cn(
          "relative overflow-hidden rounded-2xl bg-[#12152C]/55 backdrop-blur-[22px] backdrop-saturate-[1.4] border border-white/10 text-[#F1F2FA]",
          interactive && "hover:border-white/20 cursor-pointer transition-colors duration-300",
          className
        )}
        whileHover={interactive ? { y: -4 } : {}}
        {...props}
      >
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-white/[0.07] to-transparent" />
        <div className="relative z-10">{children}</div>
      </motion.div>
    );
  }
);
GlassCard.displayName = "GlassCard";

export const GlassPanel = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "bg-[#0D1023]/55 backdrop-blur-[22px] backdrop-saturate-[1.4] border border-white/10 text-[#F1F2FA]",
          className
        )}
        {...props}
      >
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-white/[0.07] to-transparent" />
        <div className="relative z-10">{children}</div>
      </div>
    );
  }
);
GlassPanel.displayName = "GlassPanel";
