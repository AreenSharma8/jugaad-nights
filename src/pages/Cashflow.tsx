import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar
} from "recharts";
import { TrendingUp, TrendingDown, DollarSign, ArrowUpRight, ArrowDownRight, Loader } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useCashFlow, useCashFlowSummary } from "@/hooks/useApi";

const tt = {
  contentStyle: {
    backgroundColor: "hsl(220, 18%, 14%)",
    border: "1px solid hsl(220, 15%, 22%)",
    borderRadius: "8px",
    color: "hsl(30, 15%, 90%)",
    fontSize: "12px",
  },
};

const Cashflow = () => {
  const { user } = useAuth();
  const { data: cashFlowData, isLoading } = useCashFlow(user?.outlet_id);
  const { data: summaryData } = useCashFlowSummary(user?.outlet_id || "");

  const dailyInflow = cashFlowData?.map((entry: any) => ({
    date: new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    inflow: entry.inflow || 0,
    outflow: entry.outflow || 0,
  })) || [];

  const summaryStats = summaryData || {
    total_inflow: 0,
    total_outflow: 0,
    net_profit: 0,
    avg_daily: 0,
  };
  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold text-foreground">Cashflow Analytics</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: "Total Inflow", value: `₹${(summaryStats.total_inflow || 0).toLocaleString()}`, change: "+14%", up: true, icon: ArrowUpRight },
          { title: "Total Outflow", value: `₹${(summaryStats.total_outflow || 0).toLocaleString()}`, change: "+8%", up: true, icon: ArrowDownRight },
          { title: "Net Profit", value: `₹${(summaryStats.net_profit || 0).toLocaleString()}`, change: "+18%", up: true, icon: TrendingUp },
          { title: "Avg Daily", value: `₹${(summaryStats.avg_daily || 0).toLocaleString()}`, change: "-3%", up: false, icon: DollarSign },
        ].map((card) => (
          <div key={card.title} className="glass-card p-4">
            <div className="flex items-center justify-between mb-2">
              <card.icon className={`w-4 h-4 ${card.up ? "text-success" : "text-destructive"}`} />
              <span className={`text-xs font-medium ${card.up ? "text-success" : "text-destructive"}`}>{card.change}</span>
            </div>
            <p className="text-xl font-bold text-foreground">{card.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{card.title}</p>
          </div>
        ))}
      </div>

      {/* Inflow vs Outflow */}
      {dailyInflow.length > 0 && (
      <div className="glass-card p-5">
        <h3 className="font-display text-lg font-semibold text-foreground mb-4">Revenue vs Expenses</h3>
        <ResponsiveContainer width="100%" height={320}>
          <AreaChart data={dailyInflow}>
            <defs>
              <linearGradient id="inflowGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(145, 60%, 42%)" stopOpacity={0.2} />
                <stop offset="100%" stopColor="hsl(145, 60%, 42%)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="outflowGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(0, 65%, 45%)" stopOpacity={0.2} />
                <stop offset="100%" stopColor="hsl(0, 65%, 45%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 22%)" />
            <XAxis dataKey="date" tick={{ fill: "hsl(220, 10%, 55%)", fontSize: 12 }} axisLine={false} />
            <YAxis tick={{ fill: "hsl(220, 10%, 55%)", fontSize: 12 }} axisLine={false} tickFormatter={(v) => `₹${v / 1000}K`} />
            <Tooltip {...tt} formatter={(v: number) => [`₹${v.toLocaleString()}`, ""]} />
            <Area type="monotone" dataKey="inflow" stroke="hsl(145, 60%, 42%)" fill="url(#inflowGrad)" strokeWidth={2} name="Inflow" />
            <Area type="monotone" dataKey="outflow" stroke="hsl(0, 65%, 45%)" fill="url(#outflowGrad)" strokeWidth={2} name="Outflow" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      )}

      {/* Outlet Profitability - Placeholder for single outlet */}
      <div className="glass-card p-5">
        <h3 className="font-display text-lg font-semibold text-foreground mb-4">Cashflow Summary</h3>
        <p className="text-sm text-muted-foreground">Daily cashflow data for {user?.outlet_name || 'your outlet'}</p>
      </div>
    </div>
  );
};

export default Cashflow;
