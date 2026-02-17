import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Clock, Plus, Eye } from "lucide-react";

const pendingPOs = [
  { id: "PO-1042", vendor: "Fresh Farms", items: 8, total: 18500, date: "Feb 17", outlet: "Navrangpura" },
  { id: "PO-1043", vendor: "Dairy Best", items: 4, total: 8200, date: "Feb 17", outlet: "Prahlad Nagar" },
  { id: "PO-1044", vendor: "Spice World", items: 12, total: 6800, date: "Feb 16", outlet: "Sindhu Bhavan" },
];

const recentPOs = [
  { id: "PO-1040", vendor: "Metro Supply", items: 6, total: 22000, date: "Feb 15", status: "approved" },
  { id: "PO-1039", vendor: "Fresh Farms", items: 10, total: 31000, date: "Feb 14", status: "approved" },
  { id: "PO-1038", vendor: "Dairy Best", items: 3, total: 4500, date: "Feb 14", status: "rejected" },
  { id: "PO-1037", vendor: "Spice World", items: 7, total: 9200, date: "Feb 13", status: "approved" },
];

const statusBadge = (status: string) => {
  const styles = {
    approved: "text-success bg-success/10",
    rejected: "text-destructive bg-destructive/10",
    pending: "text-warning bg-warning/10",
  };
  const icons = {
    approved: <CheckCircle className="w-3 h-3" />,
    rejected: <XCircle className="w-3 h-3" />,
    pending: <Clock className="w-3 h-3" />,
  };
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full capitalize ${styles[status as keyof typeof styles]}`}>
      {icons[status as keyof typeof icons]} {status}
    </span>
  );
};

const PurchaseOrders = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-bold text-foreground">Purchase Orders</h1>
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2">
          <Plus className="w-4 h-4" /> Create PO
        </Button>
      </div>

      {/* Pending Approvals */}
      <div className="glass-card p-5">
        <h3 className="font-display text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          Pending Approvals
          <span className="text-xs bg-warning/10 text-warning px-2 py-0.5 rounded-full">{pendingPOs.length}</span>
        </h3>
        <div className="space-y-3">
          {pendingPOs.map((po) => (
            <div key={po.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-secondary/50 rounded-lg border border-border/50 gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-semibold text-foreground">{po.id}</span>
                  {statusBadge("pending")}
                </div>
                <p className="text-sm text-muted-foreground">
                  {po.vendor} · {po.items} items · {po.outlet}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-foreground">₹{po.total.toLocaleString()}</span>
                <div className="flex gap-2">
                  <Button size="sm" className="bg-success/10 text-success hover:bg-success/20 border-0 h-8">
                    <CheckCircle className="w-3.5 h-3.5 mr-1" /> Approve
                  </Button>
                  <Button size="sm" variant="outline" className="text-destructive border-destructive/20 hover:bg-destructive/10 h-8">
                    <XCircle className="w-3.5 h-3.5 mr-1" /> Reject
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent POs */}
      <div className="glass-card p-5 overflow-x-auto">
        <h3 className="font-display text-lg font-semibold text-foreground mb-4">Recent Orders</h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-muted-foreground text-xs border-b border-border">
              <th className="text-left py-3 font-medium">PO #</th>
              <th className="text-left py-3 font-medium">Vendor</th>
              <th className="text-right py-3 font-medium">Items</th>
              <th className="text-right py-3 font-medium">Total</th>
              <th className="text-left py-3 font-medium">Date</th>
              <th className="text-left py-3 font-medium">Status</th>
              <th className="text-right py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {recentPOs.map((po) => (
              <tr key={po.id} className="border-b border-border/50 hover:bg-secondary/50 transition-colors">
                <td className="py-3 text-foreground font-medium">{po.id}</td>
                <td className="py-3 text-foreground">{po.vendor}</td>
                <td className="py-3 text-right text-muted-foreground">{po.items}</td>
                <td className="py-3 text-right text-foreground font-medium">₹{po.total.toLocaleString()}</td>
                <td className="py-3 text-muted-foreground">{po.date}</td>
                <td className="py-3">{statusBadge(po.status)}</td>
                <td className="py-3 text-right">
                  <button className="text-muted-foreground hover:text-foreground"><Eye className="w-4 h-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PurchaseOrders;
