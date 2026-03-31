import { useState } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Festival {
  id: string;
  festival_name: string;
  start_date: string;
  end_date: string;
  expected_sales: number;
  budget: number;
  status: "Planning" | "Active" | "Completed";
  notes: string;
}

const Festivals = () => {
  const [showForm, setShowForm] = useState(false);
  const [festivals, setFestivals] = useState<Festival[]>([]);
  const [formData, setFormData] = useState({
    festival_name: "",
    start_date: "",
    end_date: "",
    expected_sales: 0,
    budget: 0,
    status: "Planning" as const,
    notes: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === "expected_sales" || name === "budget" ? parseFloat(value) || 0 : value,
    });
  };

  const handleSubmitFestival = (e: React.FormEvent) => {
    e.preventDefault();
    const newFestival: Festival = {
      id: Date.now().toString(),
      festival_name: formData.festival_name,
      start_date: formData.start_date,
      end_date: formData.end_date,
      expected_sales: formData.expected_sales,
      budget: formData.budget,
      status: formData.status,
      notes: formData.notes,
    };
    setFestivals([...festivals, newFestival]);
    console.log("Festival created:", newFestival);
    alert("Festival created successfully!");
    setShowForm(false);
    setFormData({
      festival_name: "",
      start_date: "",
      end_date: "",
      expected_sales: 0,
      budget: 0,
      status: "Planning",
      notes: "",
    });
  };

  const handleDeleteFestival = (id: string) => {
    setFestivals(festivals.filter((f) => f.id !== id));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Planning":
        return "bg-blue-500/20 text-blue-400";
      case "Active":
        return "bg-green-500/20 text-green-400";
      case "Completed":
        return "bg-gray-500/20 text-gray-400";
      default:
        return "bg-gray-500/20 text-gray-400";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-bold text-foreground">Festival Analytics</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> {showForm ? "Cancel" : "Add Festival"}
        </button>
      </div>

      {showForm && (
        <div className="glass-card p-6">
          <form onSubmit={handleSubmitFestival} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="festival_name">Festival Name</Label>
                <Input
                  id="festival_name"
                  name="festival_name"
                  placeholder="e.g., Diwali 2026"
                  value={formData.festival_name}
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
                  <option value="Planning">Planning</option>
                  <option value="Active">Active</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="start_date">Start Date</Label>
                <Input
                  id="start_date"
                  name="start_date"
                  type="date"
                  value={formData.start_date}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="end_date">End Date</Label>
                <Input
                  id="end_date"
                  name="end_date"
                  type="date"
                  value={formData.end_date}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="expected_sales">Expected Sales (₹)</Label>
                <Input
                  id="expected_sales"
                  name="expected_sales"
                  type="number"
                  step="0.01"
                  placeholder="0"
                  value={formData.expected_sales}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="budget">Budget (₹)</Label>
                <Input
                  id="budget"
                  name="budget"
                  type="number"
                  step="0.01"
                  placeholder="0"
                  value={formData.budget}
                  onChange={handleInputChange}
                />
              </div>
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
                Add Festival
              </Button>
            </div>
          </form>
        </div>
      )}

      {festivals.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {festivals.map((festival) => (
            <div key={festival.id} className="glass-card p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-foreground">{festival.festival_name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {festival.start_date} to {festival.end_date}
                  </p>
                </div>
                <div className="flex gap-2">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(festival.status)}`}>
                    {festival.status}
                  </span>
                  <button
                    onClick={() => handleDeleteFestival(festival.id)}
                    className="text-destructive hover:text-destructive/90"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Expected Sales:</span>
                  <span className="font-medium">₹{festival.expected_sales.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Budget:</span>
                  <span className="font-medium">₹{festival.budget.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Margin:</span>
                  <span className="font-medium text-green-400">
                    ₹{(festival.expected_sales - festival.budget).toLocaleString()}
                  </span>
                </div>
              </div>

              {festival.notes && (
                <div className="mt-3 p-2 bg-muted/30 rounded text-sm text-muted-foreground">
                  {festival.notes}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="glass-card p-12 text-center">
          <div className="text-lg font-semibold text-foreground mb-2">No Festivals</div>
          <p className="text-muted-foreground max-w-md mx-auto">
            Click "Add Festival" to create a new festival
          </p>
        </div>
      )}
    </div>
  );
};

export default Festivals;
