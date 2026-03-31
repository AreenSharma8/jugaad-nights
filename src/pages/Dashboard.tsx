import { useEffect, useState } from "react";
import {
  IndianRupee, CreditCard, Banknote, Receipt, TrendingUp, Trash2, Wallet,
  Bell, AlertTriangle, Package, Clock, Loader
} from "lucide-react";
import KPICard from "@/components/KPICard";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from "recharts";
import { useAuth } from "@/hooks/useAuth";
import { useDashboardMetrics, useSalesTrendAnalytics, useLowStockItems, useOutletComparison } from "@/hooks/useApi";

const chartTooltipStyle = {
  contentStyle: {
    backgroundColor: "hsl(220, 18%, 14%)",
    border: "1px solid hsl(220, 15%, 22%)",
    borderRadius: "8px",
    color: "hsl(30, 15%, 90%)",
    fontSize: "12px",
  },
};

const Dashboard = () => {
  const { user } = useAuth();
  const [selectedOutlets, setSelectedOutlets] = useState<string[]>([]);
  
  // Fetch dashboard metrics for current outlet
  const { data: metrics, isLoading: metricsLoading } = useDashboardMetrics(user?.outlet_id || "");
  
  // Fetch sales trends
  const { data: trends } = useSalesTrendAnalytics(user?.outlet_id || "", "weekly");
  
  // Fetch low stock items
  const { data: lowStockItems } = useLowStockItems(user?.outlet_id || "");

  // Format currency
  const formatCurrency = (value: number) => `₹${value?.toLocaleString() || "0"}`;

  // Default data structure if metrics not available
  const defaultMetrics = {
    total_sales: 0,
    online_sales: 0,
    offline_sales: 0,
    total_orders: 0,
    avg_bill_value: 0,
    wastage_today: 0,
    cash_position: 0,
    outlet_comparison: [],
    sales_breakdown: [],
    attendance_summary: { present: 0, absent: 0, late: 0 },
  };

  const data = metrics || defaultMetrics;

  // Format chart data
  const outletData = data.outlet_comparison?.map((o: any) => ({
    name: o.outlet_name,
    sales: o.total_sales || 0,
    online: o.online_sales || 0,
    offline: o.offline_sales || 0,
  })) || [];

  const topItems = data.sales_breakdown?.slice(0, 5).map((item: any, i: number) => ({
    rank: i + 1,
    name: item.item_name,
    qty: item.quantity,
    revenue: formatCurrency(item.revenue),
  })) || [];

  const attendanceData = [
    { name: "Present", value: data.attendance_summary?.present || 0, color: "hsl(145, 60%, 42%)" },
    { name: "Absent", value: data.attendance_summary?.absent || 0, color: "hsl(0, 65%, 45%)" },
    { name: "Late", value: data.attendance_summary?.late || 0, color: "hsl(40, 70%, 55%)" },
  ].filter(d => d.value > 0);

  const weeklyTrend = trends?.weekly || [];

  // Generate notifications from real data
  const notifications = [];
  
  // Add low stock alerts
  lowStockItems?.slice(0, 2).forEach((item: any) => {
    notifications.push({
      type: "alert",
      text: `Low stock: ${item.name} (${item.current_stock} ${item.unit} remaining)`,
      time: "Recently detected",
    });
  });

  // Add other notifications
  if (data.wastage_today > 0) {
    notifications.push({
      type: "wastage",
      text: `Wastage alert: ${data.wastage_today} KG today`,
      time: "Latest",
    });
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <select className="bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary min-w-[140px]">
          <option>Today</option>
          <option>Yesterday</option>
          <option>This Week</option>
          <option>This Month</option>
        </select>
        <select className="bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary min-w-[140px]">
          <option>All Outlets</option>
          <option>Current Outlet</option>
        </select>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <KPICard icon={IndianRupee} title="Total Sales Today" value={formatCurrency(data.total_sales)} change="+12%" trend="up" delay={0} />
        <KPICard icon={CreditCard} title="Online Sales" value={formatCurrency(data.online_sales)} change="+18%" trend="up" variant="gold" delay={50} />
        <KPICard icon={Banknote} title="Offline Sales" value={formatCurrency(data.offline_sales)} change="+7%" trend="up" delay={100} />
        <KPICard icon={Receipt} title="Total Bills" value={data.total_orders} change="+5%" trend="up" delay={150} />
        <KPICard icon={TrendingUp} title="Avg Bill Value" value={formatCurrency(data.avg_bill_value)} change="-2%" trend="down" variant="destructive" delay={200} />
        <KPICard icon={Trash2} title="Wastage Today" value={`${data.wastage_today} KG`} change="+15%" trend="up" variant="destructive" delay={250} />
        <KPICard icon={Wallet} title="Cash Position" value={formatCurrency(data.cash_position)} variant="success" delay={300} />
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Outlet Performance */}
        {outletData.length > 0 && (
          <div className="lg:col-span-2 glass-card p-5">
            <h3 className="font-display text-lg font-semibold text-foreground mb-4">Outlet Performance</h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={outletData} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 22%)" />
                <XAxis dataKey="name" tick={{ fill: "hsl(220, 10%, 55%)", fontSize: 12 }} axisLine={false} />
                <YAxis tick={{ fill: "hsl(220, 10%, 55%)", fontSize: 12 }} axisLine={false} tickFormatter={(v) => `₹${v / 1000}K`} />
                <Tooltip {...chartTooltipStyle} formatter={(value: number) => [`₹${value.toLocaleString()}`, ""]} />
                <Bar dataKey="online" fill="hsl(40, 70%, 55%)" radius={[4, 4, 0, 0]} name="Online" />
                <Bar dataKey="offline" fill="hsl(0, 65%, 45%)" radius={[4, 4, 0, 0]} name="Offline" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Attendance */}
        {attendanceData.length > 0 && (
          <div className="glass-card p-5">
            <h3 className="font-display text-lg font-semibold text-foreground mb-4">Attendance Snapshot</h3>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={attendanceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {attendanceData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip {...chartTooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-4 mt-2">
              {attendanceData.map((item) => (
                <div key={item.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  {item.name}: {item.value}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Row */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Weekly Trend */}
        {weeklyTrend.length > 0 && (
          <div className="glass-card p-5">
            <h3 className="font-display text-lg font-semibold text-foreground mb-4">Weekly Sales Trend</h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={weeklyTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 22%)" />
                <XAxis dataKey="day" tick={{ fill: "hsl(220, 10%, 55%)", fontSize: 12 }} axisLine={false} />
                <YAxis tick={{ fill: "hsl(220, 10%, 55%)", fontSize: 12 }} axisLine={false} tickFormatter={(v) => `₹${v / 1000}K`} />
                <Tooltip {...chartTooltipStyle} formatter={(value: number) => [`₹${value.toLocaleString()}`, "Sales"]} />
                <Line type="monotone" dataKey="sales" stroke="hsl(40, 70%, 55%)" strokeWidth={2} dot={{ fill: "hsl(40, 70%, 55%)", r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Top Selling Items */}
        {topItems.length > 0 && (
          <div className="glass-card p-5">
            <h3 className="font-display text-lg font-semibold text-foreground mb-4">Top 5 Selling Items</h3>
            <div className="space-y-3">
              {topItems.map((item) => (
                <div key={item.name} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-muted-foreground w-5">#{item.rank}</span>
                    <span className="text-sm text-foreground">{item.name}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-foreground">{item.revenue}</p>
                    <p className="text-xs text-muted-foreground">{item.qty} sold</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Notifications */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-lg font-semibold text-foreground">Notifications</h3>
            <Bell className="w-4 h-4 text-muted-foreground" />
          </div>
          {notifications.length > 0 ? (
            <div className="space-y-3">
              {notifications.map((n, i) => (
                <div key={i} className="flex items-start gap-3 py-2 border-b border-border/50 last:border-0">
                  <div className={`mt-0.5 w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                    n.type === "alert" ? "bg-destructive/10 text-destructive" :
                    n.type === "wastage" ? "bg-warning/10 text-warning" :
                    "bg-primary/10 text-primary"
                  }`}>
                    {n.type === "alert" ? <AlertTriangle className="w-3 h-3" /> :
                     n.type === "po" ? <Package className="w-3 h-3" /> :
                     <Clock className="w-3 h-3" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground leading-tight">{n.text}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{n.time}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No notifications at this time</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
