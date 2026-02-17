import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar
} from "recharts";
import { AlertTriangle, CheckCircle } from "lucide-react";

const stockItems = [
  { name: "Paneer", current: 2.5, reorder: 5, unit: "KG", status: "critical" },
  { name: "Chicken Breast", current: 4, reorder: 8, unit: "KG", status: "critical" },
  { name: "Basmati Rice", current: 25, reorder: 10, unit: "KG", status: "ok" },
  { name: "Onions", current: 18, reorder: 15, unit: "KG", status: "ok" },
  { name: "Tomatoes", current: 8, reorder: 10, unit: "KG", status: "low" },
  { name: "Cream", current: 3, reorder: 5, unit: "L", status: "critical" },
  { name: "Cooking Oil", current: 12, reorder: 8, unit: "L", status: "ok" },
  { name: "Spice Mix", current: 6, reorder: 4, unit: "KG", status: "ok" },
];

const purchaseTrend = [
  { week: "W1", amount: 85000 }, { week: "W2", amount: 92000 },
  { week: "W3", amount: 78000 }, { week: "W4", amount: 105000 },
];

const vendorComparison = [
  { name: "Fresh Farms", amount: 125000 },
  { name: "Metro Supply", amount: 98000 },
  { name: "Spice World", amount: 45000 },
  { name: "Dairy Best", amount: 67000 },
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

const Inventory = () => {
  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold text-foreground">Inventory & Purchase Analytics</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <select className="bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-foreground">
          <option>All Outlets</option>
          <option>Navrangpura</option>
          <option>Prahlad Nagar</option>
          <option>Sindhu Bhavan</option>
        </select>
        <select className="bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-foreground">
          <option>This Month</option>
          <option>Last Month</option>
          <option>Last 3 Months</option>
        </select>
      </div>

      {/* Stock Status */}
      <div className="glass-card p-5 overflow-x-auto">
        <h3 className="font-display text-lg font-semibold text-foreground mb-4">Current Stock Status</h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-muted-foreground text-xs border-b border-border">
              <th className="text-left py-3 font-medium">Item</th>
              <th className="text-right py-3 font-medium">Current Stock</th>
              <th className="text-right py-3 font-medium">Reorder Level</th>
              <th className="text-right py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {stockItems.map((item) => (
              <tr key={item.name} className={`border-b border-border/50 transition-colors ${item.status === "critical" ? "bg-destructive/5" : ""}`}>
                <td className="py-3 text-foreground font-medium">{item.name}</td>
                <td className="py-3 text-right text-foreground">{item.current} {item.unit}</td>
                <td className="py-3 text-right text-muted-foreground">{item.reorder} {item.unit}</td>
                <td className="py-3 text-right">
                  {item.status === "critical" ? (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-destructive bg-destructive/10 px-2 py-1 rounded-full">
                      <AlertTriangle className="w-3 h-3" /> Critical
                    </span>
                  ) : item.status === "low" ? (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-warning bg-warning/10 px-2 py-1 rounded-full">
                      Low
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-success bg-success/10 px-2 py-1 rounded-full">
                      <CheckCircle className="w-3 h-3" /> OK
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* Purchase Trend */}
        <div className="glass-card p-5">
          <h3 className="font-display text-lg font-semibold text-foreground mb-4">Purchase Trend</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={purchaseTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 22%)" />
              <XAxis dataKey="week" tick={{ fill: "hsl(220, 10%, 55%)", fontSize: 12 }} axisLine={false} />
              <YAxis tick={{ fill: "hsl(220, 10%, 55%)", fontSize: 12 }} axisLine={false} tickFormatter={(v) => `₹${v / 1000}K`} />
              <Tooltip {...tt} formatter={(v: number) => [`₹${v.toLocaleString()}`, "Purchases"]} />
              <Line type="monotone" dataKey="amount" stroke="hsl(200, 60%, 50%)" strokeWidth={2} dot={{ fill: "hsl(200, 60%, 50%)", r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Vendor Comparison */}
        <div className="glass-card p-5">
          <h3 className="font-display text-lg font-semibold text-foreground mb-4">Vendor Comparison</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={vendorComparison} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 22%)" />
              <XAxis type="number" tick={{ fill: "hsl(220, 10%, 55%)", fontSize: 12 }} axisLine={false} tickFormatter={(v) => `₹${v / 1000}K`} />
              <YAxis type="category" dataKey="name" tick={{ fill: "hsl(220, 10%, 55%)", fontSize: 12 }} axisLine={false} width={100} />
              <Tooltip {...tt} formatter={(v: number) => [`₹${v.toLocaleString()}`, "Total"]} />
              <Bar dataKey="amount" fill="hsl(40, 70%, 55%)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Inventory;
