import { Button } from "@/components/ui/button";
import { FileText, Plus, Download, CheckCircle, Clock } from "lucide-react";

const quotations = [
  { id: "QT-201", client: "Sharma Wedding", event: "Mar 5", items: 15, total: 185000, status: "pending" },
  { id: "QT-200", client: "Patel Corp Event", event: "Feb 28", items: 8, total: 92000, status: "converted" },
  { id: "QT-199", client: "Mehta Birthday", event: "Feb 22", items: 6, total: 45000, status: "converted" },
  { id: "QT-198", client: "NGO Annual Dinner", event: "Mar 10", items: 20, total: 240000, status: "pending" },
];

const PartyOrders = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-bold text-foreground">Party Orders & Quotations</h1>
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2">
          <Plus className="w-4 h-4" /> New Quotation
        </Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Active Quotations", value: "4", icon: FileText },
          { label: "Pending", value: "2", icon: Clock },
          { label: "Converted", value: "2", icon: CheckCircle },
          { label: "Total Value", value: "₹5.62L", icon: Download },
        ].map((s) => (
          <div key={s.label} className="glass-card p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <s.icon className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-xl font-bold text-foreground">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="glass-card p-5 overflow-x-auto">
        <h3 className="font-display text-lg font-semibold text-foreground mb-4">Quotations</h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-muted-foreground text-xs border-b border-border">
              <th className="text-left py-3 font-medium">ID</th>
              <th className="text-left py-3 font-medium">Client</th>
              <th className="text-left py-3 font-medium">Event Date</th>
              <th className="text-right py-3 font-medium">Items</th>
              <th className="text-right py-3 font-medium">Total</th>
              <th className="text-left py-3 font-medium">Status</th>
              <th className="text-right py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {quotations.map((q) => (
              <tr key={q.id} className="border-b border-border/50 hover:bg-secondary/50 transition-colors">
                <td className="py-3 text-foreground font-medium">{q.id}</td>
                <td className="py-3 text-foreground">{q.client}</td>
                <td className="py-3 text-muted-foreground">{q.event}</td>
                <td className="py-3 text-right text-muted-foreground">{q.items}</td>
                <td className="py-3 text-right text-foreground font-medium">₹{q.total.toLocaleString()}</td>
                <td className="py-3">
                  <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full capitalize ${
                    q.status === "converted" ? "text-success bg-success/10" : "text-warning bg-warning/10"
                  }`}>
                    {q.status === "converted" ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                    {q.status}
                  </span>
                </td>
                <td className="py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    {q.status === "pending" && (
                      <Button size="sm" variant="outline" className="h-7 text-xs">Convert</Button>
                    )}
                    <Button size="sm" variant="outline" className="h-7 text-xs gap-1">
                      <Download className="w-3 h-3" /> PDF
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PartyOrders;
