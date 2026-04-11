import { useState } from "react";
import { Plus, X, Loader, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { usePurchaseOrders, useCreatePurchaseOrder, useUpdatePurchaseOrderStatus } from "@/hooks/useApi";

interface POItem {
  item_name: string;
  quantity: number;
  unit_price: number;
  unit?: string;
}

interface POFormData {
  po_number: string;
  supplier_name: string;
  order_date: string;
  delivery_date: string;
  items: POItem[];
  total_amount: number;
  status: "Pending" | "Confirmed" | "Delivered";
  notes: string;
}

const PurchaseOrders = () => {
  const { user } = useAuth();
  const { data: ordersData = [], isLoading } = usePurchaseOrders(user?.outlet_id);
  const createOrderMutation = useCreatePurchaseOrder();
  const updateStatusMutation = useUpdatePurchaseOrderStatus();
  const [showForm, setShowForm] = useState(false);
  const [editingStatusId, setEditingStatusId] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<"Pending" | "Confirmed" | "Delivered">("Pending");
  const [formData, setFormData] = useState<POFormData>({
    po_number: "",
    supplier_name: "",
    order_date: new Date().toISOString().split("T")[0],
    delivery_date: "",
    items: [{ item_name: "", quantity: 1, unit_price: 0, unit: "" }],
    total_amount: 0,
    status: "Pending",
    notes: "",
  });

  const handleAddItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { item_name: "", quantity: 1, unit_price: 0, unit: "" }],
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
    const total = newItems.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
    setFormData({ ...formData, items: newItems, total_amount: total });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmitPO = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.po_number.trim() || !formData.supplier_name.trim()) {
      alert("Please fill in all required fields");
      return;
    }

    if (formData.items.length === 0 || formData.items.some(item => !item.item_name.trim())) {
      alert("Please add at least one item");
      return;
    }

    try {
      const totalAmount = formData.items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
      
      await createOrderMutation.mutateAsync({
        outlet_id: user?.outlet_id,
        po_number: formData.po_number,
        supplier_name: formData.supplier_name,
        order_date: new Date(formData.order_date),
        delivery_date: new Date(formData.delivery_date),
        total_amount: totalAmount,
        status: formData.status,
        notes: formData.notes || null,
        items: formData.items.map(item => ({
          item_name: item.item_name,
          quantity: item.quantity,
          unit_price: item.unit_price,
          unit: item.unit || undefined,
        })),
      });
      
      alert("Purchase Order created successfully!");
      setShowForm(false);
      setFormData({
        po_number: "",
        supplier_name: "",
        order_date: new Date().toISOString().split("T")[0],
        delivery_date: "",
        items: [{ item_name: "", quantity: 1, unit_price: 0, unit: "" }],
        total_amount: 0,
        status: "Pending",
        notes: "",
      });
    } catch (error) {
      alert("Failed to create order: " + (error instanceof Error ? error.message : "Unknown error"));
    }
  };

  const handleStatusUpdate = async (orderId: string, newStatus: "Pending" | "Confirmed" | "Delivered") => {
    try {
      await updateStatusMutation.mutateAsync({ id: orderId, status: newStatus });
      setEditingStatusId(null);
      alert("Status updated successfully!");
    } catch (error) {
      alert("Failed to update status: " + (error instanceof Error ? error.message : "Unknown error"));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-bold text-foreground">Purchase Orders</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> {showForm ? "Cancel" : "Create PO"}
        </button>
      </div>

      {showForm ? (
        <div className="glass-card p-6">
          <form onSubmit={handleSubmitPO} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="po_number">PO Number</Label>
                <Input
                  id="po_number"
                  name="po_number"
                  placeholder="e.g., PO-2026-001"
                  value={formData.po_number}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="supplier_name">Supplier Name</Label>
                <Input
                  id="supplier_name"
                  name="supplier_name"
                  placeholder="Supplier name"
                  value={formData.supplier_name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="order_date">Order Date</Label>
                <Input
                  id="order_date"
                  name="order_date"
                  type="date"
                  value={formData.order_date}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="delivery_date">Delivery Date</Label>
                <Input
                  id="delivery_date"
                  name="delivery_date"
                  type="date"
                  value={formData.delivery_date}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-background border border-input rounded-md text-foreground"
                >
                  <option value="Pending">Pending</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Delivered">Delivered</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="total_amount">Total Amount (₹)</Label>
                <Input
                  id="total_amount"
                  type="number"
                  placeholder="Auto-calculated"
                  value={formData.total_amount}
                  readOnly
                  className="bg-muted"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">Items</Label>
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="text-primary hover:text-primary/90 text-sm flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" /> Add Item
                </button>
              </div>

              {formData.items.map((item, index) => (
                <div key={index} className="flex gap-3 items-end bg-muted/30 p-3 rounded">
                  <div className="flex-1 space-y-1">
                    <Label htmlFor={`item_name_${index}`} className="text-xs">Item Name</Label>
                    <Input
                      id={`item_name_${index}`}
                      placeholder="Item name"
                      value={item.item_name}
                      onChange={(e) => handleItemChange(index, "item_name", e.target.value)}
                    />
                  </div>
                  <div className="w-20 space-y-1">
                    <Label htmlFor={`quantity_${index}`} className="text-xs">Qty</Label>
                    <Input
                      id={`quantity_${index}`}
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(index, "quantity", parseInt(e.target.value) || 1)}
                    />
                  </div>
                  <div className="w-24 space-y-1">
                    <Label htmlFor={`unit_price_${index}`} className="text-xs">Unit Price</Label>
                    <Input
                      id={`unit_price_${index}`}
                      type="number"
                      step="0.01"
                      value={item.unit_price}
                      onChange={(e) => handleItemChange(index, "unit_price", parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div className="w-20 space-y-1">
                    <Label htmlFor={`unit_${index}`} className="text-xs">Unit</Label>
                    <select
                      id={`unit_${index}`}
                      value={item.unit || ""}
                      onChange={(e) => handleItemChange(index, "unit", e.target.value)}
                      className="w-full px-2 py-1 bg-background border border-input rounded-md text-foreground text-sm"
                    >
                      <option value="">Select</option>
                      <option value="kg">kg</option>
                      <option value="ltr">ltr</option>
                      <option value="piece">piece</option>
                      <option value="box">box</option>
                    </select>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(index)}
                    className="text-destructive hover:text-destructive/90"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <textarea
                id="notes"
                name="notes"
                placeholder="Add any additional notes..."
                value={formData.notes}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 bg-background border border-input rounded-md text-foreground"
              />
            </div>

            <div className="flex gap-3 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="bg-primary hover:bg-primary/90"
                disabled={createOrderMutation.isPending}
              >
                {createOrderMutation.isPending ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin mr-2" />
                    Creating...
                  </>
                ) : (
                  "Create Purchase Order"
                )}
              </Button>
            </div>
          </form>
        </div>
      ) : (
        <div className="glass-card">
          {isLoading ? (
            <div className="p-12 text-center">
              <Loader className="w-8 h-8 animate-spin mx-auto mb-3 text-primary" />
              <p className="text-muted-foreground">Loading orders...</p>
            </div>
          ) : Array.isArray(ordersData) && ordersData.length > 0 ? (
            <>
              {console.log('📦 Purchase Orders Debug:', ordersData[0]?.items ? `${ordersData[0].items.length} items` : 'No items in first order')}
              <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-muted-foreground text-xs border-b border-border bg-muted/50">
                    <th className="text-left py-3 px-4 font-medium">PO Number</th>
                    <th className="text-left py-3 px-4 font-medium">Supplier</th>
                    <th className="text-left py-3 px-4 font-medium">Order Date</th>
                    <th className="text-left py-3 px-4 font-medium">Delivery Date</th>
                    <th className="text-left py-3 px-4 font-medium">Items</th>
                    <th className="text-right py-3 px-4 font-medium">Amount</th>
                    <th className="text-left py-3 px-4 font-medium">Status</th>
                    <th className="text-center py-3 px-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {ordersData.map((order: any) => {
                    const itemsDisplay = order.items?.length > 0 
                      ? order.items.map((item: any) => {
                          const unitDisplay = item.unit ? ` ${item.unit}` : '';
                          return `${item.item_name} (${item.quantity}${unitDisplay})`;
                        }).join(', ')
                      : 'No items';
                    
                    return (
                      <tr key={order.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                        <td className="py-3 px-4 text-foreground font-medium">{order.po_number}</td>
                        <td className="py-3 px-4 text-foreground">{order.supplier_name}</td>
                        <td className="py-3 px-4 text-muted-foreground">
                          {new Date(order.order_date).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric',
                            year: '2-digit'
                          })}
                        </td>
                        <td className="py-3 px-4 text-muted-foreground">
                          {new Date(order.delivery_date).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric',
                            year: '2-digit'
                          })}
                        </td>
                        <td className="py-3 px-4 text-muted-foreground text-xs max-w-xs truncate">{itemsDisplay}</td>
                        <td className="py-3 px-4 text-right font-medium">₹{parseFloat(order.total_amount).toFixed(2)}</td>
                        <td className="py-3 px-4">
                          {editingStatusId === order.id ? (
                            <div className="flex gap-2 items-center">
                              <select
                                value={selectedStatus}
                                onChange={(e) => setSelectedStatus(e.target.value as "Pending" | "Confirmed" | "Delivered")}
                                className="px-2 py-1 bg-background border border-input rounded text-sm"
                              >
                                <option value="Pending">Pending</option>
                                <option value="Confirmed">Confirmed</option>
                                <option value="Delivered">Delivered</option>
                              </select>
                              <button
                                onClick={() => handleStatusUpdate(order.id, selectedStatus)}
                                disabled={updateStatusMutation.isPending}
                                className="px-2 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs font-medium disabled:opacity-50"
                              >
                                {updateStatusMutation.isPending ? <Loader className="w-3 h-3 animate-spin" /> : '✓'}
                              </button>
                              <button
                                onClick={() => setEditingStatusId(null)}
                                className="px-2 py-1 bg-secondary hover:bg-secondary/80 text-foreground rounded text-xs"
                              >
                                ✕
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <span className={`inline-block px-2 py-1 rounded-md text-xs font-medium ${
                                order.status === 'Delivered' ? 'bg-green-500/20 text-green-700' :
                                order.status === 'Confirmed' ? 'bg-blue-500/20 text-blue-700' :
                                'bg-yellow-500/20 text-yellow-700'
                              }`}>
                                {order.status}
                              </span>
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {editingStatusId !== order.id && (
                            <button
                              onClick={() => {
                                setEditingStatusId(order.id);
                                setSelectedStatus(order.status);
                              }}
                              className="px-3 py-1 bg-primary/20 hover:bg-primary/30 text-primary rounded text-xs font-medium transition-colors flex items-center gap-1 mx-auto"
                            >
                              <ChevronDown className="w-3 h-3" /> Edit
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            </>
          ) : (
            <div className="p-12 text-center">
              <div className="text-lg font-semibold text-foreground mb-2">No Purchase Orders</div>
              <p className="text-muted-foreground max-w-md mx-auto">
                Click "Create PO" to add a new purchase order
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PurchaseOrders;
