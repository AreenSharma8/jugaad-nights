import { Loader, AlertTriangle, CheckCircle } from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar
} from "recharts";
import { useAuth } from "@/context/AuthContext";
import { useInventory, useLowStockItems, useInventoryHealth } from "@/hooks/useApi";

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
  const { user } = useAuth();
  
  // Fetch real inventory data
  const { data: inventory, isLoading: invLoading } = useInventory(user?.outlet_id);
  const { data: lowStock } = useLowStockItems(user?.outlet_id || "");
  const { data: health } = useInventoryHealth(user?.outlet_id || "");

  // Transform to stockItems format
  const stockItems = inventory?.map((item: any) => ({
    name: item.item_name,
    current: item.current_stock,
    reorder: item.reorder_level,
    unit: item.unit,
    status: item.current_stock < item.reorder_level ? (item.current_stock < (item.reorder_level * 0.5) ? "critical" : "low") : "ok",
  })) || [];

  // Use health data for analytics
  const purchaseTrend = health?.purchase_trend || [];
  const vendorComparison = health?.vendor_comparison || [];

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold text-foreground">Inventory & Purchase Analytics</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <select className="bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-foreground">
          <option>Current Outlet</option>
        </select>
        <select className="bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-foreground">
          <option>This Month</option>
          <option>Last Month</option>
          <option>Last 3 Months</option>
        </select>
      </div>

      {/* Stock Status - Critical alerts first */}
      {stockItems.length > 0 && (
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
              {stockItems.sort((a: any, b: any) => {
                const statusPriority: any = { critical: 0, low: 1, ok: 2 };
                return statusPriority[a.status] - statusPriority[b.status];
              }).map((item: any) => (
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
      )}

      <div className="grid lg:grid-cols-2 gap-4">
        {/* Purchase Trend */}
        {purchaseTrend.length > 0 && (
          <div className="glass-card p-5">
            <h3 className="font-display text-lg font-semibold text-foreground mb-4">Purchase Trend</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={purchaseTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 22%)" />
                <XAxis dataKey="period" tick={{ fill: "hsl(220, 10%, 55%)", fontSize: 12 }} axisLine={false} />
                <YAxis tick={{ fill: "hsl(220, 10%, 55%)", fontSize: 12 }} axisLine={false} tickFormatter={(v) => `₹${v / 1000}K`} />
                <Tooltip {...tt} formatter={(v: number) => [`₹${v.toLocaleString()}`, "Amount"]} />
                <Line type="monotone" dataKey="amount" stroke="hsl(40, 70%, 55%)" strokeWidth={2} dot={{ fill: "hsl(40, 70%, 55%)", r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Vendor Comparison */}
        {vendorComparison.length > 0 && (
          <div className="glass-card p-5">
            <h3 className="font-display text-lg font-semibold text-foreground mb-4">Top Vendors</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={vendorComparison} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 22%)" />
                <XAxis type="number" tick={{ fill: "hsl(220, 10%, 55%)", fontSize: 12 }} axisLine={false} tickFormatter={(v) => `₹${v / 1000}K`} />
                <YAxis dataKey="name" type="category" tick={{ fill: "hsl(220, 10%, 55%)", fontSize: 11 }} axisLine={false} width={100} />
                <Tooltip {...tt} formatter={(v: number) => [`₹${v.toLocaleString()}`, "Amount"]} />
                <Bar dataKey="amount" fill="hsl(0, 65%, 45%)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
};

export default Inventory;
