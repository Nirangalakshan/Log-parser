// components/ui/chart.tsx
import * as React from "react";
import { cn } from "@/lib/utils";

export type ChartConfig = {
  [key: string]: {
    label: string;
    color: string;
  };
};

export interface ChartContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  config: ChartConfig;
}

export function ChartContainer({ className, children }: ChartContainerProps) {
  return (
    <div
      className={cn(
        "relative flex items-center justify-center rounded-md border bg-muted p-6 shadow-sm",
        className
      )}
    >
      {children}
    </div>
  );
}
