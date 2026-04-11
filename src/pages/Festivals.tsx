import { useState } from "react";
import { Plus, X, TrendingUp, DollarSign, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import {
  useFestivals,
  useCreateFestival,
  useUpdateFestival,
  useDeleteFestival,
  useFestivalMetrics,
} from "@/hooks/useApi";
import { useEffect } from "react";

interface Festival {
  id: string;
  festival_name: string;
  start_date: string;
  end_date: string;
  expected_sales: number;
  actual_sales: number;
  budget: number;
  actual_expenses: number;
  status: "planning" | "active" | "completed";
  notes: string;
}

const FestivalSkeleton = () => (
  <div className="glass-card p-4 animate-pulse">
    <div className="h-6 bg-secondary rounded w-32 mb-2"></div>
    <div className="h-4 bg-secondary rounded w-48 mb-3"></div>
    <div className="space-y-2">
      <div className="h-4 bg-secondary rounded w-full"></div>
      <div className="h-4 bg-secondary rounded w-3/4"></div>
    </div>
  </div>
);

const Festivals = () => {
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [selectedFestival, setSelectedFestival] = useState<Festival | null>(null);
  
  const { data: festivals, isLoading } = useFestivals(user?.outlet_id);
  const createMutation = useCreateFestival();
  const updateMutation = useUpdateFestival(selectedFestival?.id || "");
  const deleteMutation = useDeleteFestival();

  const [formData, setFormData] = useState({
    festival_name: "",
    start_date: "",
    end_date: "",
    expected_sales: 0,
    actual_sales: 0,
    budget: 0,
    actual_expenses: 0,
    status: "planning" as const,
    notes: "",
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]:
        [
          "expected_sales",
          "actual_sales",
          "budget",
          "actual_expenses",
        ].includes(name)
          ? parseFloat(value) || 0
          : value,
    });
  };

  const handleSubmitFestival = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      console.log("📝 Submitting festival form:", { selectedFestival, formData });
      
      if (selectedFestival) {
        console.log("🔄 Updating festival:", selectedFestival.id);
        await updateMutation.mutateAsync(formData);
        console.log("✅ Festival updated successfully");
        setSelectedFestival(null);
      } else {
        const newFestival = {
          ...formData,
          outlet_id: user?.outlet_id,
        };
        console.log("➕ Creating new festival:", newFestival);
        await createMutation.mutateAsync(newFestival);
        console.log("✅ Festival created successfully");
      }
      resetForm();
      setShowForm(false);
      console.log("📊 Festival data submitted, form closed");
    } catch (error: any) {
      console.error("❌ Error saving festival:", error);
      alert("Failed to save festival: " + (error?.message || "Unknown error"));
    }
  };

  const handleEditFestival = (festival: Festival) => {
    setSelectedFestival(festival);
    setFormData({
      festival_name: festival.festival_name,
      start_date: festival.start_date.split("T")[0],
      end_date: festival.end_date.split("T")[0],
      expected_sales: festival.expected_sales,
      actual_sales: festival.actual_sales,
      budget: festival.budget,
      actual_expenses: festival.actual_expenses,
      status: festival.status,
      notes: festival.notes,
    });
    setShowForm(true);
  };

  const handleDeleteFestival = async (id: string) => {
    if (confirm("Are you sure you want to delete this festival?")) {
      try {
        await deleteMutation.mutateAsync(id);
      } catch (error: any) {
        console.error("Error deleting festival:", error);
        alert("Failed to delete festival");
      }
    }
  };

  const resetForm = () => {
    setFormData({
      festival_name: "",
      start_date: "",
      end_date: "",
      expected_sales: 0,
      actual_sales: 0,
      budget: 0,
      actual_expenses: 0,
      status: "planning",
      notes: "",
    });
    setSelectedFestival(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "planning":
        return "bg-blue-500/20 text-blue-700";
      case "active":
        return "bg-green-500/20 text-green-700";
      case "completed":
        return "bg-gray-500/20 text-gray-700";
      default:
        return "bg-gray-500/20 text-gray-700";
    }
  };

  const festivalList = Array.isArray(festivals) ? festivals : [];
  const activeFestivals = festivalList.filter((f) => f.status === "active").length;
  const totalExpectedSales = festivalList.reduce((sum, f) => sum + (f.expected_sales || 0), 0);
  const totalActualSales = festivalList.reduce((sum, f) => sum + (f.actual_sales || 0), 0);
  const totalBudget = festivalList.reduce((sum, f) => sum + (f.budget || 0), 0);
  // Log festivals data for debugging
  useEffect(() => {
    console.log("📊 Festivals data updated:", {
      count: festivalList.length,
      loading: isLoading,
      data: festivalList,
      totalActualSales,
      totalExpenses,
    });
  }, [festivals, isLoading]);  const totalExpenses = festivalList.reduce((sum, f) => sum + (f.actual_expenses || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-bold text-foreground">
          Festival Analytics
        </h1>
        <Button
          onClick={() => {
            if (selectedFestival) {
              resetForm();
            }
            setShowForm(!showForm);
          }}
          className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
        >
          <Plus className="w-4 h-4" /> {showForm ? "Cancel" : "Add Festival"}
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass-card p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Zap className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-xl font-bold text-foreground">{festivalList.length}</p>
            <p className="text-xs text-muted-foreground">Total Festivals</p>
          </div>
        </div>

        <div className="glass-card p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <p className="text-xl font-bold text-foreground">{activeFestivals}</p>
            <p className="text-xs text-muted-foreground">Active Now</p>
          </div>
        </div>

        <div className="glass-card p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
            <DollarSign className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-xl font-bold text-foreground">
              ₹{(totalActualSales / 100000).toFixed(1)}L
            </p>
            <p className="text-xs text-muted-foreground">Actual Sales</p>
          </div>
        </div>

        <div className="glass-card p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
            <DollarSign className="w-5 h-5 text-orange-600" />
          </div>
          <div>
            <p className="text-xl font-bold text-foreground">
              ₹{((totalActualSales - totalExpenses) / 100000).toFixed(1)}L
            </p>
            <p className="text-xs text-muted-foreground">Net Profit</p>
          </div>
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <div className="glass-card p-6">
          <form onSubmit={handleSubmitFestival} className="space-y-4">
            <h3 className="font-display text-lg font-semibold text-foreground">
              {selectedFestival ? "Edit Festival" : "Create New Festival"}
            </h3>

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
                  <option value="planning">Planning</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
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
                <Label htmlFor="actual_sales">Actual Sales (₹)</Label>
                <Input
                  id="actual_sales"
                  name="actual_sales"
                  type="number"
                  step="0.01"
                  placeholder="0"
                  value={formData.actual_sales}
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

              <div className="space-y-2">
                <Label htmlFor="actual_expenses">Actual Expenses (₹)</Label>
                <Input
                  id="actual_expenses"
                  name="actual_expenses"
                  type="number"
                  step="0.01"
                  placeholder="0"
                  value={formData.actual_expenses}
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
                onClick={() => {
                  resetForm();
                  setShowForm(false);
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-primary hover:bg-primary/90"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {createMutation.isPending || updateMutation.isPending
                  ? "Saving..."
                  : selectedFestival
                  ? "Update Festival"
                  : "Add Festival"}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Festivals Table */}
      {isLoading ? (
        <div className="glass-card p-6">
          <div className="space-y-2">
            <div className="h-12 bg-secondary rounded animate-pulse"></div>
            <div className="h-12 bg-secondary rounded animate-pulse"></div>
            <div className="h-12 bg-secondary rounded animate-pulse"></div>
            <div className="h-12 bg-secondary rounded animate-pulse"></div>
          </div>
        </div>
      ) : festivalList.length > 0 ? (
        <div className="glass-card p-5 overflow-x-auto">
          <h3 className="font-display text-lg font-semibold text-foreground mb-4">Festivals Analytics</h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-muted-foreground text-xs border-b border-border">
                <th className="text-left py-3 px-4 font-medium">Festival Name</th>
                <th className="text-left py-3 px-4 font-medium">Date Range</th>
                <th className="text-right py-3 px-4 font-medium">Expected Sales</th>
                <th className="text-right py-3 px-4 font-medium">Actual Sales</th>
                <th className="text-right py-3 px-4 font-medium">Budget</th>
                <th className="text-right py-3 px-4 font-medium">Expenses</th>
                <th className="text-center py-3 px-4 font-medium">ROI</th>
                <th className="text-center py-3 px-4 font-medium">Variance</th>
                <th className="text-center py-3 px-4 font-medium">Status</th>
                <th className="text-center py-3 px-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {festivalList.map((festival) => {
                const roi =
                  festival.actual_expenses > 0
                    ? ((festival.actual_sales - festival.actual_expenses) /
                        festival.actual_expenses) *
                      100
                    : 0;
                const variance =
                  festival.expected_sales > 0
                    ? ((festival.actual_sales - festival.expected_sales) /
                        festival.expected_sales) *
                      100
                    : 0;

                return (
                  <tr key={festival.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-4 text-foreground font-medium">{festival.festival_name}</td>
                    <td className="py-3 px-4 text-muted-foreground text-xs">
                      {new Date(festival.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })} -{" "}
                      {new Date(festival.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })}
                    </td>
                    <td className="py-3 px-4 text-right font-medium">₹{(festival.expected_sales || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</td>
                    <td className="py-3 px-4 text-right font-medium">₹{(festival.actual_sales || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</td>
                    <td className="py-3 px-4 text-right text-muted-foreground">₹{(festival.budget || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</td>
                    <td className="py-3 px-4 text-right text-muted-foreground">₹{(festival.actual_expenses || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                          roi > 0 ? "bg-green-500/20 text-green-700" : roi < 0 ? "bg-red-500/20 text-red-700" : "bg-gray-500/20 text-gray-700"
                        }`}
                      >
                        {roi.toFixed(1)}%
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                          variance > 0 ? "bg-green-500/20 text-green-700" : variance < 0 ? "bg-red-500/20 text-red-700" : "bg-gray-500/20 text-gray-700"
                        }`}
                      >
                        {variance > 0 ? "+" : ""}
                        {variance.toFixed(1)}%
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-block px-2 py-1 rounded text-xs font-medium capitalize ${getStatusColor(
                          festival.status
                        )}`}
                      >
                        {festival.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={() => handleEditFestival(festival)}
                          className="px-3 py-1 bg-primary/20 hover:bg-primary/30 text-primary rounded text-xs font-medium transition-colors"
                          title="Edit festival"
                        >
                          ✎ Edit
                        </button>
                        <button
                          onClick={() => handleDeleteFestival(festival.id)}
                          className="px-3 py-1 bg-destructive/20 hover:bg-destructive/30 text-destructive rounded text-xs font-medium transition-colors"
                          title="Delete festival"
                        >
                          <X className="w-3 h-3 inline mr-1" /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="glass-card p-12 text-center">
          <div className="text-lg font-semibold text-foreground mb-2">
            No Festivals
          </div>
          <p className="text-muted-foreground max-w-md mx-auto">
            Click "Add Festival" to create a new festival and track analytics
          </p>
        </div>
      )}
    </div>
  );
};

export default Festivals;
