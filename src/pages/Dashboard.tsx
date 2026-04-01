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

/**
 * ============================================================================
 * DASHBOARD PAGE - Main Application Dashboard
 * ============================================================================
 * Displays real-time business metrics and analytics for the current outlet.
 * Provides executives and staff with KPIs, sales trends, inventory status,
 * and operational alerts at a glance.
 * ============================================================================
 *
 * Key Components:
 * 1. KPI Cards: Quick metrics (sales, orders, wastage, cash position)
 * 2. Outlet Performance Chart: Bar chart comparing online vs offline sales
 * 3. Attendance Snapshot: Donut chart showing staff attendance
 * 4. Weekly Sales Trend: Line chart showing sales over the week
 * 5. Top Selling Items: Table of best-performing products
 * 6. Notifications: Real-time alerts and warnings
 *
 * Data Flow:
 * - Hooks fetch latest metrics from backend API
 * - Data is formatted and transformed for chart components
 * - Charts update automatically when data changes
 * - Format: useHook(outlet_id) -> returns {data, isLoading, error}
 * ============================================================================
 */

// ========== CHART STYLING CONSTANTS ==========
// Consistent styling for all recharts components (tooltips, colors, etc.)
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
  // ========== STATE & HOOKS ==========
  const { user } = useAuth(); // Current authenticated user with outlet_id
  const [selectedOutlets, setSelectedOutlets] = useState<string[]>([]); // For multi-outlet filtering
  
  // ========== DATA FETCHING - REAL-TIME API CALLS ==========
  // These hooks connect to backend API endpoints to fetch dashboard data
  // They handle loading, error states, and automatic refetching
  
  // Main dashboard metrics: sales, orders, wastage, cash position
  const { data: metrics, isLoading: metricsLoading } = useDashboardMetrics(user?.outlet_id || "");
  
  // Sales trends analysis: weekly/monthly sales data
  const { data: trends } = useSalesTrendAnalytics(user?.outlet_id || "", "weekly");
  
  // Inventory alerts: items below minimum stock levels
  const { data: lowStockItems } = useLowStockItems(user?.outlet_id || "");

  // ========== UTILITY FUNCTIONS ==========
  
  /**
   * Format currency values to Indian Rupees with proper locale formatting
   * Input: 10000 -> Output: "₹10,000"
   */
  const formatCurrency = (value: number) => `₹${value?.toLocaleString() || "0"}`;

  // ========== DEFAULT DATA STRUCTURE ==========
  // Fallback metrics used while API data is loading or if no data is returned
  // Ensures UI doesn't break if backend is slow or unavailable
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

  // ========== DATA TRANSFORMATION FOR CHARTS ==========
  
  /**
   * Transform outlet comparison data for BarChart component
   * Format: [{ name: "Outlet A", sales: 50000, online: 30000, offline: 20000 }, ...]
   */
  const outletData = data.outlet_comparison?.map((o: any) => ({
    name: o.outlet_name,
    sales: o.total_sales || 0,
    online: o.online_sales || 0,
    offline: o.offline_sales || 0,
  })) || [];

  /**
   * Extract top 5 selling items with revenue and quantity sold
   * Format: [{ rank: 1, name: "Chai", qty: 150, revenue: "₹7500" }, ...]
   */
  const topItems = data.sales_breakdown?.slice(0, 5).map((item: any, i: number) => ({
    rank: i + 1,
    name: item.item_name,
    qty: item.quantity,
    revenue: formatCurrency(item.revenue),
  })) || [];

  /**
   * Prepare attendance data for PieChart (Present, Absent, Late)
   * Only includes non-zero values to keep chart clean
   */
  const attendanceData = [
    { name: "Present", value: data.attendance_summary?.present || 0, color: "hsl(145, 60%, 42%)" },
    { name: "Absent", value: data.attendance_summary?.absent || 0, color: "hsl(0, 65%, 45%)" },
    { name: "Late", value: data.attendance_summary?.late || 0, color: "hsl(40, 70%, 55%)" },
  ].filter(d => d.value > 0);

  /**
   * Weekly sales trend data for LineChart
   * Format: [{ day: "Mon", sales: 45000 }, ...]
   */
  const weeklyTrend = trends?.weekly || [];

  // ========== NOTIFICATION GENERATION ==========
  // Creates real-time alerts based on current business data
  
  const notifications = [];
  
  // Add low stock alerts for first 2 items
  lowStockItems?.slice(0, 2).forEach((item: any) => {
    notifications.push({
      type: "alert",
      text: `Low stock: ${item.name} (${item.current_stock} ${item.unit} remaining)`,
      time: "Recently detected",
    });
  });

  // Add wastage alert if there's wastage today
  if (data.wastage_today > 0) {
    notifications.push({
      type: "wastage",
      text: `Wastage alert: ${data.wastage_today} KG today`,
      time: "Latest",
    });
  }

  return (
    <div className="space-y-6">
      {/* ========== FILTERS SECTION ========== */}
      {/* Allows users to filter dashboard data by date range and outlet scope */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Date Range Filter */}
        <select className="bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary min-w-[140px]">
          <option>Today</option>
          <option>Yesterday</option>
          <option>This Week</option>
          <option>This Month</option>
        </select>
        
        {/* Outlet Scope Filter */}
        <select className="bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary min-w-[140px]">
          <option>All Outlets</option>
          <option>Current Outlet</option>
        </select>
      </div>

      {/* ========== KPI CARDS ROW ========== */}
      {/* Seven key performance indicators displayed as cards with trend indicators */}
      {/* Each card shows: icon, title, value, and trend (up/down) */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        {/* Total Sales - Main revenue metric for the day */}
        <KPICard icon={IndianRupee} title="Total Sales Today" value={formatCurrency(data.total_sales)} change="+12%" trend="up" delay={0} />
        
        {/* Online Sales - E-commerce/app sales */}
        <KPICard icon={CreditCard} title="Online Sales" value={formatCurrency(data.online_sales)} change="+18%" trend="up" variant="gold" delay={50} />
        
        {/* Offline Sales - In-store/cash sales */}
        <KPICard icon={Banknote} title="Offline Sales" value={formatCurrency(data.offline_sales)} change="+7%" trend="up" delay={100} />
        
        {/* Total Bills - Number of transactions */}
        <KPICard icon={Receipt} title="Total Bills" value={data.total_orders} change="+5%" trend="up" delay={150} />
        
        {/* Average Bill Value - Metric for customer spending patterns */}
        <KPICard icon={TrendingUp} title="Avg Bill Value" value={formatCurrency(data.avg_bill_value)} change="-2%" trend="down" variant="destructive" delay={200} />
        
        {/* Wastage Today - Food/product wastage tracking */}
        <KPICard icon={Trash2} title="Wastage Today" value={`${data.wastage_today} KG`} change="+15%" trend="up" variant="destructive" delay={250} />
        
        {/* Cash Position - Total cash available */}
        <KPICard icon={Wallet} title="Cash Position" value={formatCurrency(data.cash_position)} variant="success" delay={300} />
      </div>

      {/* ========== ANALYTICS CHARTS ROW 1 ========== */}
      {/* Main performance visualizations */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* OUTLET PERFORMANCE CHART */}
        {/* Bar chart comparing online vs offline sales across all outlets */}
        {/* Helps identify which outlets are performing best and sales channel distribution */}
        {outletData.length > 0 && (
          <div className="lg:col-span-2 glass-card p-5">
            <h3 className="font-display text-lg font-semibold text-foreground mb-4">Outlet Performance</h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={outletData} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 22%)" />
                <XAxis dataKey="name" tick={{ fill: "hsl(220, 10%, 55%)", fontSize: 12 }} axisLine={false} />
                <YAxis tick={{ fill: "hsl(220, 10%, 55%)", fontSize: 12 }} axisLine={false} tickFormatter={(v) => `₹${v / 1000}K`} />
                <Tooltip {...chartTooltipStyle} formatter={(value: number) => [`₹${value.toLocaleString()}`, ""]} />
                {/* Orange bar: Online sales (credit card transactions) */}
                <Bar dataKey="online" fill="hsl(40, 70%, 55%)" radius={[4, 4, 0, 0]} name="Online" />
                {/* Red bar: Offline sales (cash transactions) */}
                <Bar dataKey="offline" fill="hsl(0, 65%, 45%)" radius={[4, 4, 0, 0]} name="Offline" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* ATTENDANCE SNAPSHOT CHART */}
        {/* Donut chart showing staff attendance status for today */}
        {/* Green: Present, Red: Absent, Orange: Late */}
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
                  {/* Color cells for each attendance category */}
                  {attendanceData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip {...chartTooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
            {/* Legend below donut chart */}
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

      {/* ========== ANALYTICS CHARTS ROW 2 ========== */}
      {/* Additional insights: trends, top performers, and alerts */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* WEEKLY SALES TREND CHART */}
        {/* Line chart showing sales progression over the week */}
        {/* Helps identify peak sales days and trends for demand forecasting */}
        {weeklyTrend.length > 0 && (
          <div className="glass-card p-5">
            <h3 className="font-display text-lg font-semibold text-foreground mb-4">Weekly Sales Trend</h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={weeklyTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 22%)" />
                <XAxis dataKey="day" tick={{ fill: "hsl(220, 10%, 55%)", fontSize: 12 }} axisLine={false} />
                <YAxis tick={{ fill: "hsl(220, 10%, 55%)", fontSize: 12 }} axisLine={false} tickFormatter={(v) => `₹${v / 1000}K`} />
                <Tooltip {...chartTooltipStyle} formatter={(value: number) => [`₹${value.toLocaleString()}`, "Sales"]} />
                {/* Golden line showing sales trend with data points */}
                <Line type="monotone" dataKey="sales" stroke="hsl(40, 70%, 55%)" strokeWidth={2} dot={{ fill: "hsl(40, 70%, 55%)", r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* TOP SELLING ITEMS TABLE */}
        {/* Ranked list of the 5 most profitable product items */}
        {/* Shows product name, quantity sold, and total revenue */}
        {topItems.length > 0 && (
          <div className="glass-card p-5">
            <h3 className="font-display text-lg font-semibold text-foreground mb-4">Top 5 Selling Items</h3>
            <div className="space-y-3">
              {topItems.map((item) => (
                <div key={item.name} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                  <div className="flex items-center gap-3">
                    {/* Rank badge */}
                    <span className="text-xs font-bold text-muted-foreground w-5">#{item.rank}</span>
                    {/* Product name */}
                    <span className="text-sm text-foreground">{item.name}</span>
                  </div>
                  <div className="text-right">
                    {/* Revenue generated from this item */}
                    <p className="text-sm font-semibold text-foreground">{item.revenue}</p>
                    {/* Quantity sold */}
                    <p className="text-xs text-muted-foreground">{item.qty} sold</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* NOTIFICATIONS PANEL */}
        {/* Real-time alerts and warnings about business operations */}
        {/* Low stock alerts, wastage warnings, system notifications */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-lg font-semibold text-foreground">Notifications</h3>
            <Bell className="w-4 h-4 text-muted-foreground" />
          </div>
          {notifications.length > 0 ? (
            <div className="space-y-3">
              {notifications.map((n, i) => (
                <div key={i} className="flex items-start gap-3 py-2 border-b border-border/50 last:border-0">
                  {/* Notification icon - changes based on notification type */}
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
                    {/* Notification message */}
                    <p className="text-sm text-foreground leading-tight">{n.text}</p>
                    {/* Time the notification was raised */}
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
