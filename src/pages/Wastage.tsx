import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2, Plus, Loader } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useWastage, useLogWastage } from "@/hooks/useApi";

const SkeletonHistoryRow = () => (
  <tr className="border-b border-border/50 animate-pulse">
    <td className="py-3"><div className="h-4 bg-secondary rounded w-16"></div></td>
    <td className="py-3"><div className="h-4 bg-secondary rounded w-24"></div></td>
    <td className="py-3"><div className="h-4 bg-secondary rounded w-20"></div></td>
    <td className="py-3"><div className="h-4 bg-secondary rounded w-12 ml-auto"></div></td>
    <td className="py-3"><div className="h-4 bg-secondary rounded w-24"></div></td>
  </tr>
);

const Wastage = () => {
  const { user } = useAuth();
  const { data: wastageData, isLoading } = useWastage(user?.outlet_id);
  const logWastageMutation = useLogWastage();
  const [outlet, setOutlet] = useState("");
  const [material, setMaterial] = useState("");
  const [weight, setWeight] = useState("");
  const [reason, setReason] = useState("");

  // Use "Navrangpura" for now - matches the hardcoded form field above
  const outletName = "Navrangpura";

  const wastageHistory = Array.isArray(wastageData) ? wastageData.map((item: any) => ({
    date: new Date(item.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    outlet: outletName,
    item: item.item_name,
    weight: item.quantity,
    reason: item.reason,
  })) : [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    logWastageMutation.mutateAsync({
      item_name: material,
      quantity: parseFloat(weight),
      reason,
      outlet_id: user?.outlet_id,
    }).finally(() => {
      setOutlet("");
      setMaterial("");
      setWeight("");
      setReason("");
    });
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <h1 className="font-display text-2xl font-bold text-foreground">Wastage Entry</h1>

      {/* Entry Form - Always visible, not blocked by loading */}
      <form onSubmit={handleSubmit} className="glass-card p-5 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-muted-foreground text-sm">Outlet</Label>
            <div className="w-full bg-secondary border border-border rounded-lg px-3 py-2.5 text-sm text-foreground">
              {outletName}
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-muted-foreground text-sm">Raw Material</Label>
            <select
              value={material}
              onChange={(e) => setMaterial(e.target.value)}
              className="w-full bg-secondary border border-border rounded-lg px-3 py-2.5 text-sm text-foreground"
              required
            >
              <option value="">Select Material</option>
              <option>Paneer</option>
              <option>Chicken Breast</option>
              <option>Tomatoes</option>
              <option>Onions</option>
              <option>Cream</option>
              <option>Rice</option>
              <option>Cooking Oil</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label className="text-muted-foreground text-sm">Weight (KG)</Label>
            <Input
              type="number"
              step="0.1"
              placeholder="e.g. 1.5"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="bg-secondary border-border h-11"
              required
            />
          </div>
          <div className="space-y-2">
            <Label className="text-muted-foreground text-sm">Reason</Label>
            <Input
              placeholder="e.g. Expired, Spoiled"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="bg-secondary border-border h-11"
              required
            />
          </div>
        </div>
        <Button 
          type="submit" 
          disabled={logWastageMutation.isPending}
          className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
        >
          {logWastageMutation.isPending ? (
            <>
              <Loader className="w-4 h-4 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <Plus className="w-4 h-4" />
              Submit Entry
            </>
          )}
        </Button>
      </form>

      {/* History - Shows progressively */}
      <div className="glass-card p-5 overflow-x-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-lg font-semibold text-foreground">Wastage History</h3>
          <div className="flex gap-1 bg-secondary rounded-lg p-1">
            <button className="px-3 py-1.5 rounded-md text-xs font-medium bg-primary text-primary-foreground">Daily</button>
            <button className="px-3 py-1.5 rounded-md text-xs font-medium text-muted-foreground hover:text-foreground">Weekly</button>
          </div>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-muted-foreground text-xs border-b border-border">
              <th className="text-left py-3 font-medium">Date</th>
              <th className="text-left py-3 font-medium">Outlet</th>
              <th className="text-left py-3 font-medium">Item</th>
              <th className="text-right py-3 font-medium">Weight</th>
              <th className="text-left py-3 font-medium">Reason</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <>
                <SkeletonHistoryRow />
                <SkeletonHistoryRow />
                <SkeletonHistoryRow />
              </>
            ) : wastageHistory.length > 0 ? (
              wastageHistory.map((item, i) => (
                <tr key={i} className="border-b border-border/50 hover:bg-secondary/50 transition-colors">
                  <td className="py-3 text-muted-foreground">{item.date}</td>
                  <td className="py-3 text-foreground">{item.outlet}</td>
                  <td className="py-3 text-foreground font-medium">{item.item}</td>
                  <td className="py-3 text-right text-destructive font-medium">{item.weight} KG</td>
                  <td className="py-3 text-muted-foreground">{item.reason}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="py-6 text-center text-muted-foreground">No wastage records found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Wastage;
