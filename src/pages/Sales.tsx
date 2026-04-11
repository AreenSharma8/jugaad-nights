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
import { useOrders, useSalesTrends, useCreateOrder, useUpdateOrder } from "@/hooks/useApi";

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
  const [editingOrderId, setEditingOrderId] = useState<string | null>(null);
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

  const validateForm = () => {
    const errors: string[] = [];
    
    // Validate customer name (alphabetical only)
    if (formData.customer_name && !/^[a-zA-Z\s]*$/.test(formData.customer_name)) {
      errors.push('Customer name must contain only alphabetical characters');
    }
    
    // Validate phone (numeric, max 10 digits)
    if (formData.customer_phone) {
      if (!/^\d+$/.test(formData.customer_phone)) {
        errors.push('Phone number must contain only digits');
      } else if (formData.customer_phone.length !== 10) {
        errors.push('Phone number must be exactly 10 digits');
      }
    }
    
    // Validate items
    for (let i = 0; i < formData.items.length; i++) {
      const item = formData.items[i];
      if (!item.item_name || !item.quantity || !item.unit_price) continue;
      
      // Validate item name (alphabetical only)
      if (!/^[a-zA-Z\s]*$/.test(item.item_name)) {
        errors.push(`Item ${i + 1}: Name must contain only alphabetical characters`);
      }
      
      // Validate quantity (positive integer)
      if (item.quantity < 1 || !Number.isInteger(item.quantity)) {
        errors.push(`Item ${i + 1}: Quantity must be a positive whole number`);
      }
      
      // Validate price (positive number)
      if (item.unit_price <= 0) {
        errors.push(`Item ${i + 1}: Price must be a positive number`);
      }
    }
    
    const validItems = formData.items.filter(item => item.item_name && item.quantity && item.unit_price);
    if (validItems.length === 0) {
      errors.push('Please add at least one valid item');
    }
    
    if (errors.length > 0) {
      alert('Validation errors:\n' + errors.join('\n'));
      return false;
    }
    return true;
  };

  const createOrderMutation = useCreateOrder();
  const updateOrderMutation = useUpdateOrder();

  const resetForm = () => {
    setFormData({
      customer_name: "",
      customer_phone: "",
      order_type: "Dine In",
      payment_type: "Cash",
      items: [{ item_name: "", quantity: 1, unit_price: 0 }],
    });
    setEditingOrderId(null);
  };

  const handleEditOrder = (order: any) => {
    // Pre-fill form with order data
    setFormData({
      customer_name: order.customer_info?.name || "",
      customer_phone: order.customer_info?.phone || "",
      order_type: order.order_type || "Dine In",
      payment_type: order.payment_type || "Cash",
      items: order.items?.map((item: any) => ({
        item_name: item.item_name,
        quantity: parseInt(String(item.quantity)) || 1,
        unit_price: parseFloat(String(item.unit_price)) || 0,
      })) || [{ item_name: "", quantity: 1, unit_price: 0 }],
    });
    setEditingOrderId(order.id);
    setShowForm(true);
  };

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const orderData = {
      customer_name: formData.customer_name || 'Walk-in Customer',
      customer_phone: formData.customer_phone || 'N/A',
      order_type: formData.order_type,
      payment_type: formData.payment_type,
      items: formData.items
        .filter(item => item.item_name && item.quantity && item.unit_price)
        .map(item => ({
          item_name: item.item_name,
          quantity: parseInt(String(item.quantity)) || 1,
          unit_price: parseFloat(String(item.unit_price)) || 0,
        })),
      outlet_id: user?.outlet_id,
    };

    if (editingOrderId) {
      // Update existing order
      updateOrderMutation.mutateAsync({ id: editingOrderId, data: orderData }).then(() => {
        resetForm();
        alert('Order updated successfully!');
      }).catch((error: any) => {
        console.error('Order update error:', error);
        alert('Failed to update order: ' + (error?.message || 'Unknown error'));
      });
    } else {
      // Create new order
      createOrderMutation.mutateAsync(orderData).then(() => {
        resetForm();
        alert('Order created successfully!');
      }).catch((error: any) => {
        console.error('Order submission error:', error);
        alert('Failed to create order: ' + (error?.message || 'Unknown error'));
      });
    }
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

  // 🔍 Debug: Log orders data to check if items are populated
  if (orders) {
    console.log("🔍 ORDERS DATA RECEIVED:", JSON.stringify(orders, null, 2));
    if (orders.length > 0) {
      console.log("🔍 FIRST ORDER ITEMS:", orders[0].items);
    }
  }

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
          <h3 className="font-display text-lg font-semibold text-foreground">{editingOrderId ? 'Edit Order' : 'Record New Order'}</h3>
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
                onChange={(e) => {
                  const value = e.target.value.replace(/[^a-zA-Z\s]/g, '');
                  setFormData({ ...formData, customer_name: value });
                }}
                className="bg-secondary border-border h-11"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-muted-foreground text-sm">Phone</Label>
              <Input
                type="tel"
                placeholder="e.g. 9876543210"
                value={formData.customer_phone}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                  setFormData({ ...formData, customer_phone: value });
                }}
                maxLength={10}
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
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^a-zA-Z\s]/g, '');
                      handleItemChange(idx, "item_name", value);
                    }}
                    className="bg-secondary border-border h-10 text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-muted-foreground text-xs">Qty</Label>
                  <Input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => {
                      const value = Math.max(1, parseInt(e.target.value) || 1);
                      handleItemChange(idx, "quantity", value);
                    }}
                    className="bg-secondary border-border h-10 text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-muted-foreground text-xs">Price</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="250"
                    value={item.unit_price || ''}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value) || 0;
                      handleItemChange(idx, "unit_price", Math.max(0, value));
                    }}
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
              {editingOrderId ? 'Update Order' : 'Save Order'}
            </Button>
            <button
              type="button"
              onClick={() => {
                resetForm();
                setShowForm(false);
              }}
              className="px-4 py-2 rounded-lg border border-border text-foreground hover:bg-secondary transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Orders Table */}
      {Array.isArray(orders) && orders.length > 0 && (
        <div className="glass-card p-5 overflow-x-auto">
          <h3 className="font-display text-lg font-semibold text-foreground mb-4">Recent Orders</h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-muted-foreground text-xs border-b border-border">
                <th className="text-left py-3 font-medium">Order ID</th>
                <th className="text-left py-3 font-medium">Customer Details</th>
                <th className="text-left py-3 font-medium">Items</th>
                <th className="text-right py-3 font-medium">Order Type</th>
                <th className="text-right py-3 font-medium">Payment Type</th>
                <th className="text-right py-3 font-medium">Subtotal</th>
                <th className="text-right py-3 font-medium">GST (5%)</th>
                <th className="text-right py-3 font-medium">Grand Total</th>
                <th className="text-center py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order: any) => {
                // Use backend-calculated totals
                const itemsSubtotal = parseFloat(order.total_amount as any) - parseFloat(order.tax_amount as any);
                const gst = parseFloat(order.tax_amount as any);
                const grandTotal = parseFloat(order.total_amount as any);
                const itemsDisplay = order.items?.length > 0 
                  ? order.items.map((item: any) => `${item.item_name} (${item.quantity})`).join(', ')
                  : 'No items';
                const orderDate = new Date(order.created_at).toLocaleString('en-IN', {
                  timeZone: 'Asia/Kolkata',
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                });

                return (
                  <tr key={order.id} className="border-b border-border/50 hover:bg-secondary/50 transition-colors">
                    <td className="py-3 text-foreground font-medium">#{order.order_number || '—'}</td>
                    <td className="py-3 text-muted-foreground">
                      <div className="text-xs">
                        <div className="text-foreground font-medium">{order.customer_info?.name || 'N/A'}</div>
                        <div>{order.customer_info?.phone || 'N/A'}</div>
                        <div className="text-xs mt-1">{orderDate}</div>
                      </div>
                    </td>
                    <td className="py-3 text-muted-foreground text-xs">{itemsDisplay}</td>
                    <td className="py-3 text-right text-foreground text-xs">{order.order_type || 'N/A'}</td>
                    <td className="py-3 text-right text-foreground text-xs">{order.payment_type || 'N/A'}</td>
                    <td className="py-3 text-right text-foreground">₹{itemsSubtotal.toFixed(2)}</td>
                    <td className="py-3 text-right text-foreground">₹{gst.toFixed(2)}</td>
                    <td className="py-3 text-right text-foreground font-bold">₹{grandTotal.toFixed(2)}</td>
                    <td className="py-3 text-center">
                      <button
                        onClick={() => handleEditOrder(order)}
                        className="px-2 py-1 bg-secondary hover:bg-secondary/80 text-foreground rounded-lg text-xs font-medium transition-colors"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
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


    </div>
  );
};

export default Sales;
