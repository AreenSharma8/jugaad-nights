import { useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area
} from "recharts";

const dailyData = [
  { date: "Feb 10", sales: 195000 }, { date: "Feb 11", sales: 210000 },
  { date: "Feb 12", sales: 185000 }, { date: "Feb 13", sales: 240000 },
  { date: "Feb 14", sales: 310000 }, { date: "Feb 15", sales: 275000 },
  { date: "Feb 16", sales: 248000 }, { date: "Feb 17", sales: 260000 },
];

const onlineOffline = [
  { name: "Online", value: 104000, color: "hsl(40, 70%, 55%)" },
  { name: "Offline", value: 144000, color: "hsl(0, 65%, 45%)" },
];

const peakHours = [
  { hour: "11AM", orders: 12 }, { hour: "12PM", orders: 38 }, { hour: "1PM", orders: 52 },
  { hour: "2PM", orders: 35 }, { hour: "3PM", orders: 15 }, { hour: "4PM", orders: 8 },
  { hour: "5PM", orders: 10 }, { hour: "6PM", orders: 18 }, { hour: "7PM", orders: 42 },
  { hour: "8PM", orders: 65 }, { hour: "9PM", orders: 78 }, { hour: "10PM", orders: 55 },
  { hour: "11PM", orders: 30 },
];

const itemSales = [
  { name: "Butter Chicken", category: "Main Course", qty: 86, revenue: 34400, avgPrice: 400 },
  { name: "Paneer Tikka", category: "Starters", qty: 72, revenue: 21600, avgPrice: 300 },
  { name: "Biryani Special", category: "Main Course", qty: 68, revenue: 27200, avgPrice: 400 },
  { name: "Dal Makhani", category: "Main Course", qty: 54, revenue: 13500, avgPrice: 250 },
  { name: "Tandoori Platter", category: "Starters", qty: 48, revenue: 28800, avgPrice: 600 },
  { name: "Gulab Jamun", category: "Dessert", qty: 42, revenue: 8400, avgPrice: 200 },
  { name: "Naan Basket", category: "Breads", qty: 120, revenue: 12000, avgPrice: 100 },
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

const Sales = () => {
  const [period, setPeriod] = useState<"daily" | "weekly" | "monthly">("daily");

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="font-display text-2xl font-bold text-foreground">Sales & Billing</h1>
        <div className="ml-auto flex gap-1 bg-secondary rounded-lg p-1">
          {(["daily", "weekly", "monthly"] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium capitalize transition-colors ${
                period === p ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* Sales Trend */}
        <div className="lg:col-span-2 glass-card p-5">
          <h3 className="font-display text-lg font-semibold text-foreground mb-4">Sales Summary</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={dailyData}>
              <defs>
                <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(0, 65%, 45%)" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="hsl(0, 65%, 45%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 22%)" />
              <XAxis dataKey="date" tick={{ fill: "hsl(220, 10%, 55%)", fontSize: 12 }} axisLine={false} />
              <YAxis tick={{ fill: "hsl(220, 10%, 55%)", fontSize: 12 }} axisLine={false} tickFormatter={(v) => `₹${v / 1000}K`} />
              <Tooltip {...tt} formatter={(v: number) => [`₹${v.toLocaleString()}`, "Sales"]} />
              <Area type="monotone" dataKey="sales" stroke="hsl(0, 65%, 45%)" fill="url(#salesGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Online vs Offline */}
        <div className="glass-card p-5">
          <h3 className="font-display text-lg font-semibold text-foreground mb-4">Online vs Offline</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={onlineOffline} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                {onlineOffline.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Pie>
              <Tooltip {...tt} formatter={(v: number) => [`₹${v.toLocaleString()}`, ""]} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-4 mt-2">
            {onlineOffline.map((item) => (
              <div key={item.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                {item.name}: ₹{(item.value / 1000).toFixed(0)}K
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Peak Hours */}
      <div className="glass-card p-5">
        <h3 className="font-display text-lg font-semibold text-foreground mb-4">Peak Hours</h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={peakHours}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 22%)" />
            <XAxis dataKey="hour" tick={{ fill: "hsl(220, 10%, 55%)", fontSize: 11 }} axisLine={false} />
            <YAxis tick={{ fill: "hsl(220, 10%, 55%)", fontSize: 12 }} axisLine={false} />
            <Tooltip {...tt} />
            <Bar dataKey="orders" fill="hsl(40, 70%, 55%)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Item Table */}
      <div className="glass-card p-5 overflow-x-auto">
        <h3 className="font-display text-lg font-semibold text-foreground mb-4">Item-wise Sales</h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-muted-foreground text-xs border-b border-border">
              <th className="text-left py-3 font-medium">Item</th>
              <th className="text-left py-3 font-medium">Category</th>
              <th className="text-right py-3 font-medium">Qty</th>
              <th className="text-right py-3 font-medium">Revenue</th>
              <th className="text-right py-3 font-medium">Avg Price</th>
            </tr>
          </thead>
          <tbody>
            {itemSales.map((item) => (
              <tr key={item.name} className="border-b border-border/50 hover:bg-secondary/50 transition-colors">
                <td className="py-3 text-foreground font-medium">{item.name}</td>
                <td className="py-3 text-muted-foreground">{item.category}</td>
                <td className="py-3 text-right text-foreground">{item.qty}</td>
                <td className="py-3 text-right text-foreground">₹{item.revenue.toLocaleString()}</td>
                <td className="py-3 text-right text-muted-foreground">₹{item.avgPrice}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Sales;
