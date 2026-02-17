import { cn } from "@/lib/utils";
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";

interface KPICardProps {
  title: string;
  value: string;
  change?: string;
  trend?: "up" | "down";
  icon: LucideIcon;
  variant?: "default" | "gold" | "success" | "destructive";
  delay?: number;
}

const KPICard = ({ title, value, change, trend, icon: Icon, variant = "default", delay = 0 }: KPICardProps) => {
  const variantStyles = {
    default: "border-border/50",
    gold: "border-gold/20",
    success: "border-success/20",
    destructive: "border-destructive/20",
  };

  const iconBg = {
    default: "bg-primary/10 text-primary",
    gold: "bg-gold/10 text-gold",
    success: "bg-success/10 text-success",
    destructive: "bg-destructive/10 text-destructive",
  };

  return (
    <div
      className={cn("glass-card p-5 animate-fade-up", variantStyles[variant])}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", iconBg[variant])}>
          <Icon className="w-5 h-5" />
        </div>
        {change && (
          <div className={cn(
            "flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full",
            trend === "up" ? "text-success bg-success/10" : "text-destructive bg-destructive/10"
          )}>
            {trend === "up" ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {change}
          </div>
        )}
      </div>
      <p className="text-2xl font-bold text-foreground">{value}</p>
      <p className="text-xs text-muted-foreground mt-1">{title}</p>
    </div>
  );
};

export default KPICard;
