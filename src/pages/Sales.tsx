import { useState } from "react";
import { Loader, Plus, X } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area
} from "recharts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { useOrders, useSalesTrends, useCreateOrder } from "@/hooks/useApi";

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
  const { user } = useAuth();
  const [period, setPeriod] = useState<"daily" | "weekly" | "monthly">("daily");
  const [showForm, setShowForm] = useState(true);
  const [formData, setFormData] = useState({
    customer_name: "",
    customer_phone: "",
    order_type: "Dine In",
    payment_type: "Cash",
    items: [{ item_name: "", quantity: 1, unit_price: 0 }],
  });

  const handleAddItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { item_name: "", quantity: 1, unit_price: 0 }],
    });
  };

  const handleRemoveItem = (index: number) => {
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index),
    });
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setFormData({ ...formData, items: newItems });
  };

  const createOrderMutation = useCreateOrder();

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const orderData = {
      customer_name: formData.customer_name || 'Walk-in Customer',
      customer_phone: formData.customer_phone || 'N/A',
      order_type: formData.order_type,
      payment_type: formData.payment_type,
      items: formData.items.filter(item => item.item_name && item.quantity),
      outlet_id: user?.outlet_id,
    };
    
    if (orderData.items.length === 0) {
      alert('Please add at least one item');
      return;
    }

    createOrderMutation.mutateAsync(orderData).then(() => {
      setFormData({
        customer_name: "",
        customer_phone: "",
        order_type: "Dine In",
        payment_type: "Cash",
        items: [{ item_name: "", quantity: 1, unit_price: 0 }],
      });
    }).catch((error: any) => {
      console.error('Order submission error:', error);
      alert('Failed to create order: ' + (error?.message || 'Unknown error'));
    });
  };

  // Calculate date range based on period
  const getDates = () => {
    const today = new Date();
    const startDate = new Date(today);
    
    if (period === "daily") {
      startDate.setDate(today.getDate() - 1);
    } else if (period === "weekly") {
      startDate.setDate(today.getDate() - 7);
    } else {
      startDate.setMonth(today.getMonth() - 1);
    }
    
    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: today.toISOString().split('T')[0],
    };
  };

  const { startDate, endDate } = getDates();

  // Fetch real sales data
  const { data: orders, isLoading: ordersLoading } = useOrders(user?.outlet_id);
  const { data: trends, isLoading: trendsLoading } = useSalesTrends(
    user?.outlet_id || "",
    startDate,
    endDate
  );

  // Transform orders to itemSales format
  const itemSalesMap = new Map();
  orders?.forEach((order: any) => {
    const key = order.item_name || "Unknown Item";
    const existing = itemSalesMap.get(key) || { qty: 0, revenue: 0, price: 0 };
    itemSalesMap.set(key, {
      name: key,
      category: order.category || "Other",
      qty: existing.qty + (order.quantity || 0),
      revenue: existing.revenue + (order.total_amount || 0),
      avgPrice: order.unit_price || 0,
    });
  });

  const itemSales = Array.from(itemSalesMap.values()).sort((a, b) => b.revenue - a.revenue);

  // Default data structures
  const dailyData = trends?.daily || [];
  const peakHours = trends?.peak_hours || [];
  
  const onlineOffline = [
    { name: "Online", value: trends?.online_sales || 0, color: "hsl(40, 70%, 55%)" },
    { name: "Offline", value: trends?.offline_sales || 0, color: "hsl(0, 65%, 45%)" },
  ].filter(d => d.value > 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-bold text-foreground">Sales & Billing</h1>
        <div className="flex gap-2 items-center">
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex gap-1 items-center"
          >
            <Plus className="w-4 h-4" /> {showForm ? "Hide" : "New"} Order
          </button>
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
      </div>

      {/* Order Entry Form */}
      {showForm && (
        <form onSubmit={handleSubmitOrder} className="glass-card p-5 space-y-4">
          <h3 className="font-display text-lg font-semibold text-foreground">Record New Order</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-muted-foreground text-sm">Outlet</Label>
              <div className="w-full bg-secondary border border-border rounded-lg px-3 py-2.5 text-sm text-foreground">
                Navrangpura
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-muted-foreground text-sm">Customer Name</Label>
              <Input
                type="text"
                placeholder="e.g. Rajesh Patel"
                value={formData.customer_name}
                onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                className="bg-secondary border-border h-11"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-muted-foreground text-sm">Phone</Label>
              <Input
                type="tel"
                placeholder="e.g. 9876543210"
                value={formData.customer_phone}
                onChange={(e) => setFormData({ ...formData, customer_phone: e.target.value })}
                className="bg-secondary border-border h-11"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-muted-foreground text-sm">Order Type</Label>
              <select
                value={formData.order_type}
                onChange={(e) => setFormData({ ...formData, order_type: e.target.value })}
                className="w-full bg-secondary border border-border rounded-lg px-3 py-2.5 text-sm text-foreground"
              >
                <option>Dine In</option>
                <option>Pick Up</option>
                <option>Delivery</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label className="text-muted-foreground text-sm">Payment Type</Label>
              <select
                value={formData.payment_type}
                onChange={(e) => setFormData({ ...formData, payment_type: e.target.value })}
                className="w-full bg-secondary border border-border rounded-lg px-3 py-2.5 text-sm text-foreground"
              >
                <option>Cash</option>
                <option>Card</option>
                <option>Online</option>
                <option>Part Payment</option>
              </select>
            </div>
          </div>

          {/* Items Section */}
          <div className="space-y-3 pt-4 border-t border-border">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-foreground">Items</h4>
              <button
                type="button"
                onClick={handleAddItem}
                className="text-primary hover:text-primary/80 text-xs font-medium flex gap-1 items-center"
              >
                <Plus className="w-3 h-3" /> Add Item
              </button>
            </div>
            {formData.items.map((item, idx) => (
              <div key={idx} className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
                <div className="space-y-2">
                  <Label className="text-muted-foreground text-xs">Item Name</Label>
                  <Input
                    type="text"
                    placeholder="e.g. Butter Chicken"
                    value={item.item_name}
                    onChange={(e) => handleItemChange(idx, "item_name", e.target.value)}
                    className="bg-secondary border-border h-10 text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-muted-foreground text-xs">Qty</Label>
                  <Input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(idx, "quantity", parseInt(e.target.value))}
                    className="bg-secondary border-border h-10 text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-muted-foreground text-xs">Price</Label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="250"
                    value={item.unit_price}
                    onChange={(e) => handleItemChange(idx, "unit_price", parseFloat(e.target.value))}
                    className="bg-secondary border-border h-10 text-sm"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveItem(idx)}
                  className="h-10 px-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors flex items-center justify-center"
                  disabled={formData.items.length === 1}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground">
              Save Order
            </Button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 rounded-lg border border-border text-foreground hover:bg-secondary transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="grid lg:grid-cols-3 gap-4">
        {/* Sales Trend */}
        {dailyData.length > 0 && (
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
        )}

        {/* Online vs Offline */}
        {onlineOffline.length > 0 && (
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
        </div>
        )}
      </div>

      {/* Peak Hours */}
      {peakHours.length > 0 && (
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
      )}

      {/* Item Table */}
      {itemSales.length > 0 && (
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
      )}
    </div>
  );
};

export default Sales;
