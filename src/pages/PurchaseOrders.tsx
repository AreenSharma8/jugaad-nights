import { Clock, Plus } from "lucide-react";

const PurchaseOrders = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-bold text-foreground">Purchase Orders</h1>
        <button className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg flex items-center gap-2 cursor-not-allowed opacity-50">
          <Plus className="w-4 h-4" /> Create PO
        </button>
      </div>

      <div className="glass-card p-12 text-center">
        <div className="w-16 h-16 rounded-full bg-warning/10 flex items-center justify-center mx-auto mb-4">
          <Clock className="w-8 h-8 text-warning" />
        </div>
        <h2 className="text-2xl font-semibold text-foreground mb-2">Coming Soon</h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          The Purchase Orders feature is currently under development and will be available in the next update.
        </p>
      </div>
    </div>
  );
};

export default PurchaseOrders;
