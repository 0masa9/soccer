import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em]",
  {
    variants: {
      variant: {
        default:
          "border-[var(--border)] bg-[var(--card-strong)] text-[var(--ink)]",
        accent:
          "border-[rgba(26,143,122,0.4)] bg-[rgba(26,143,122,0.12)] text-[var(--accent-2)]",
        warning:
          "border-[rgba(240,93,59,0.4)] bg-[rgba(240,93,59,0.12)] text-[var(--accent)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant, className }))} {...props} />;
}

export { Badge, badgeVariants };
