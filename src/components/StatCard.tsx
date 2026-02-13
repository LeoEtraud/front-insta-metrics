import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    label: string;
  };
  className?: string;
  delay?: number; // animation delay in ms
}

export function StatCard({ title, value, icon: Icon, trend, className, delay = 0 }: StatCardProps) {
  const isPositive = trend && trend.value >= 0;

  return (
    <Card 
      className={cn(
        "overflow-hidden border-border/50 shadow-sm hover:shadow-md transition-all duration-300 animate-fade-in group",
        className
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground font-body">
          {title}
        </CardTitle>
        <div className="p-2 bg-primary/5 rounded-lg group-hover:bg-primary/10 transition-colors">
          <Icon className="h-4 w-4 text-primary" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold font-display tracking-tight">{value}</div>
        {trend && (
          <p className="text-xs mt-1 text-muted-foreground flex items-center gap-1">
            <span className={cn(
              "font-medium",
              isPositive ? "text-emerald-500" : "text-rose-500"
            )}>
              {isPositive ? "+" : ""}{trend.value}%
            </span>
            {trend.label}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
