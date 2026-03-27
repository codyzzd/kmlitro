import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type Accent = "green" | "yellow" | "red" | "default";

interface KpiCardProps {
  title: string;
  value: string;
  description?: string;
  icon?: LucideIcon;
  accent?: Accent;
}

const accentStyles: Record<Accent, { icon: string; value: string }> = {
  green:   { icon: "text-green-500",  value: "text-green-600 dark:text-green-400" },
  yellow:  { icon: "text-yellow-500", value: "text-yellow-600 dark:text-yellow-400" },
  red:     { icon: "text-red-500",    value: "text-red-600 dark:text-red-400" },
  default: { icon: "text-muted-foreground", value: "" },
};

export function KpiCard({ title, value, description, icon: Icon, accent = "default" }: KpiCardProps) {
  const styles = accentStyles[accent];

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
          {Icon && <Icon className={cn("h-4 w-4", styles.icon)} />}
        </div>
      </CardHeader>
      <CardContent>
        <div className={cn("text-2xl font-bold", styles.value)}>{value}</div>
        {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
      </CardContent>
    </Card>
  );
}
