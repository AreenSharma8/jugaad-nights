import {
  IndianRupee, CreditCard, Banknote, Receipt, TrendingUp, Trash2, Wallet,
  Bell, AlertTriangle, Package, Clock
} from "lucide-react";
import KPICard from "@/components/KPICard";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from "recharts";

const outletData = [
  { name: "Navrangpura", sales: 82000, online: 34000, offline: 48000 },
  { name: "Prahlad Nagar", sales: 95000, online: 42000, offline: 53000 },
  { name: "Sindhu Bhavan", sales: 71000, online: 28000, offline: 43000 },
];

const topItems = [
  { name: "Butter Chicken", qty: 86, revenue: "₹34,400" },
  { name: "Paneer Tikka", qty: 72, revenue: "₹21,600" },
  { name: "Biryani Special", qty: 68, revenue: "₹27,200" },
  { name: "Dal Makhani", qty: 54, revenue: "₹13,500" },
  { name: "Tandoori Platter", qty: 48, revenue: "₹28,800" },
];

const attendanceData = [
  { name: "Present", value: 42, color: "hsl(145, 60%, 42%)" },
  { name: "Absent", value: 6, color: "hsl(0, 65%, 45%)" },
  { name: "Late", value: 4, color: "hsl(40, 70%, 55%)" },
];

const weeklyTrend = [
  { day: "Mon", sales: 185000 },
  { day: "Tue", sales: 210000 },
  { day: "Wed", sales: 195000 },
  { day: "Thu", sales: 240000 },
  { day: "Fri", sales: 310000 },
  { day: "Sat", sales: 380000 },
  { day: "Sun", sales: 350000 },
];

const notifications = [
  { type: "alert", text: "Low stock: Paneer (2.5 KG remaining)", time: "10m ago" },
  { type: "alert", text: "Low stock: Chicken Breast (4 KG)", time: "25m ago" },
  { type: "po", text: "PO #1042 pending approval – ₹18,500", time: "1h ago" },
  { type: "wastage", text: "Wastage alert: 3.2 KG at Navrangpura", time: "2h ago" },
  { type: "info", text: "WhatsApp report sent to all managers", time: "3h ago" },
];

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
          <option>Navrangpura</option>
          <option>Prahlad Nagar</option>
          <option>Sindhu Bhavan</option>
        </select>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <KPICard icon={IndianRupee} title="Total Sales Today" value="₹2,48,000" change="+12%" trend="up" delay={0} />
        <KPICard icon={CreditCard} title="Online Sales" value="₹1,04,000" change="+18%" trend="up" variant="gold" delay={50} />
        <KPICard icon={Banknote} title="Offline Sales" value="₹1,44,000" change="+7%" trend="up" delay={100} />
        <KPICard icon={Receipt} title="Total Bills" value="438" change="+5%" trend="up" delay={150} />
        <KPICard icon={TrendingUp} title="Avg Bill Value" value="₹566" change="-2%" trend="down" variant="destructive" delay={200} />
        <KPICard icon={Trash2} title="Wastage Today" value="8.2 KG" change="+15%" trend="up" variant="destructive" delay={250} />
        <KPICard icon={Wallet} title="Cash Position" value="₹1,82,000" variant="success" delay={300} />
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Outlet Performance */}
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

        {/* Attendance */}
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
      </div>

      {/* Bottom Row */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Weekly Trend */}
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

        {/* Top Selling Items */}
        <div className="glass-card p-5">
          <h3 className="font-display text-lg font-semibold text-foreground mb-4">Top 5 Selling Items</h3>
          <div className="space-y-3">
            {topItems.map((item, i) => (
              <div key={item.name} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-muted-foreground w-5">#{i + 1}</span>
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

        {/* Notifications */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-lg font-semibold text-foreground">Notifications</h3>
            <Bell className="w-4 h-4 text-muted-foreground" />
          </div>
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
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
