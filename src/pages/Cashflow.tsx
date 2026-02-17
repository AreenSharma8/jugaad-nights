import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar
} from "recharts";
import { TrendingUp, TrendingDown, DollarSign, ArrowUpRight, ArrowDownRight } from "lucide-react";

const dailyInflow = [
  { date: "Feb 10", inflow: 195000, outflow: 85000 },
  { date: "Feb 11", inflow: 210000, outflow: 92000 },
  { date: "Feb 12", inflow: 185000, outflow: 78000 },
  { date: "Feb 13", inflow: 240000, outflow: 105000 },
  { date: "Feb 14", inflow: 310000, outflow: 120000 },
  { date: "Feb 15", inflow: 275000, outflow: 95000 },
  { date: "Feb 16", inflow: 248000, outflow: 88000 },
  { date: "Feb 17", inflow: 260000, outflow: 92000 },
];

const outletProfit = [
  { name: "Navrangpura", profit: 142000 },
  { name: "Prahlad Nagar", profit: 178000 },
  { name: "Sindhu Bhavan", profit: 118000 },
];

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
  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold text-foreground">Cashflow Analytics</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: "Total Inflow", value: "₹19,23,000", change: "+14%", up: true, icon: ArrowUpRight },
          { title: "Total Outflow", value: "₹7,55,000", change: "+8%", up: true, icon: ArrowDownRight },
          { title: "Net Profit", value: "₹11,68,000", change: "+18%", up: true, icon: TrendingUp },
          { title: "Avg Daily", value: "₹2,40,375", change: "-3%", up: false, icon: DollarSign },
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

      {/* Outlet Profitability */}
      <div className="glass-card p-5">
        <h3 className="font-display text-lg font-semibold text-foreground mb-4">Outlet-wise Profitability</h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={outletProfit}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 22%)" />
            <XAxis dataKey="name" tick={{ fill: "hsl(220, 10%, 55%)", fontSize: 12 }} axisLine={false} />
            <YAxis tick={{ fill: "hsl(220, 10%, 55%)", fontSize: 12 }} axisLine={false} tickFormatter={(v) => `₹${v / 1000}K`} />
            <Tooltip {...tt} formatter={(v: number) => [`₹${v.toLocaleString()}`, "Profit"]} />
            <Bar dataKey="profit" fill="hsl(40, 70%, 55%)" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Cashflow;
