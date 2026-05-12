import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 font-mono text-[10px] font-medium uppercase tracking-wide",
  {
    variants: {
      variant: {
        default: "border-primary/25 bg-primary/10 text-primary",
        success: "border-trading-green/25 bg-trading-green/10 text-trading-green",
        warning: "border-trading-amber/25 bg-trading-amber/10 text-trading-amber",
        danger: "border-trading-red/25 bg-trading-red/10 text-trading-red",
        muted: "border-white/10 bg-white/5 text-muted-foreground",
        purple: "border-trading-purple/25 bg-trading-purple/10 text-trading-purple"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}
