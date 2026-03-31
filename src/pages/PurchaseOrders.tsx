import { useState } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface POItem {
  item_name: string;
  quantity: number;
  unit_price: number;
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
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<POFormData>({
    po_number: "",
    supplier_name: "",
    order_date: new Date().toISOString().split("T")[0],
    delivery_date: "",
    items: [{ item_name: "", quantity: 1, unit_price: 0 }],
    total_amount: 0,
    status: "Pending",
    notes: "",
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
    const total = newItems.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
    setFormData({ ...formData, items: newItems, total_amount: total });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmitPO = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Purchase Order submitted:", formData);
    alert("Purchase Order created successfully!");
    setShowForm(false);
    setFormData({
      po_number: "",
      supplier_name: "",
      order_date: new Date().toISOString().split("T")[0],
      delivery_date: "",
      items: [{ item_name: "", quantity: 1, unit_price: 0 }],
      total_amount: 0,
      status: "Pending",
      notes: "",
    });
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
              <Button type="submit" className="bg-primary hover:bg-primary/90">
                Create Purchase Order
              </Button>
            </div>
          </form>
        </div>
      ) : (
        <div className="glass-card p-12 text-center">
          <div className="text-lg font-semibold text-foreground mb-2">No Purchase Orders</div>
          <p className="text-muted-foreground max-w-md mx-auto">
            Click "Create PO" to add a new purchase order
          </p>
        </div>
      )}
    </div>
  );
};

export default PurchaseOrders;
