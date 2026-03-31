import { Button } from "@/components/ui/button";
import { FileText, Plus, Download, CheckCircle, Clock, Loader } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { usePartyOrders, useUpdatePartyOrderStatus } from "@/hooks/useApi";

const SkeletonRow = () => (
  <tr className="border-b border-border/50 animate-pulse">
    <td className="py-3"><div className="h-4 bg-secondary rounded w-12"></div></td>
    <td className="py-3"><div className="h-4 bg-secondary rounded w-24"></div></td>
    <td className="py-3"><div className="h-4 bg-secondary rounded w-16"></div></td>
    <td className="py-3"><div className="h-4 bg-secondary rounded w-8 ml-auto"></div></td>
    <td className="py-3"><div className="h-4 bg-secondary rounded w-20 ml-auto"></div></td>
    <td className="py-3"><div className="h-4 bg-secondary rounded w-20"></div></td>
    <td className="py-3"><div className="h-4 bg-secondary rounded w-12 ml-auto"></div></td>
  </tr>
);

const SummaryCardSkeleton = () => (
  <div className="glass-card p-4 flex items-center gap-3 animate-pulse">
    <div className="w-10 h-10 rounded-lg bg-secondary"></div>
    <div className="flex-1">
      <div className="h-5 bg-secondary rounded w-12 mb-2"></div>
      <div className="h-3 bg-secondary rounded w-32"></div>
    </div>
  </div>
);

const PartyOrders = () => {
  const { user } = useAuth();
  const { data: partyOrdersData, isLoading } = usePartyOrders(user?.outlet_id);
  const updateMutation = useUpdatePartyOrderStatus();

  const quotations = partyOrdersData?.map((order: any) => ({
    id: order.id || `QT-${Math.random().toString(36).substr(2, 3).toUpperCase()}`,
    client: order.client_name,
    event: new Date(order.event_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    items: order.number_of_items || 0,
    total: order.total_amount || 0,
    status: order.status?.toLowerCase() || "pending",
  })) || [];

  const pendingCount = quotations.filter(q => q.status === "pending").length;
  const convertedCount = quotations.filter(q => q.status === "converted").length;
  const totalValue = quotations.reduce((sum, q) => sum + q.total, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-bold text-foreground">Party Orders & Quotations</h1>
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2">
          <Plus className="w-4 h-4" /> New Quotation
        </Button>
      </div>

      {/* Summary - Shows immediately even while loading */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading ? (
          <>
            <SummaryCardSkeleton />
            <SummaryCardSkeleton />
            <SummaryCardSkeleton />
            <SummaryCardSkeleton />
          </>
        ) : (
          <>
            <div className="glass-card p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xl font-bold text-foreground">{quotations.length}</p>
                <p className="text-xs text-muted-foreground">Active Quotations</p>
              </div>
            </div>
            <div className="glass-card p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xl font-bold text-foreground">{pendingCount}</p>
                <p className="text-xs text-muted-foreground">Pending</p>
              </div>
            </div>
            <div className="glass-card p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xl font-bold text-foreground">{convertedCount}</p>
                <p className="text-xs text-muted-foreground">Converted</p>
              </div>
            </div>
            <div className="glass-card p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Download className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xl font-bold text-foreground">₹{(totalValue / 100000).toFixed(2)}L</p>
                <p className="text-xs text-muted-foreground">Total Value</p>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Table with progressive loading */}
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
            {isLoading ? (
              <>
                <SkeletonRow />
                <SkeletonRow />
                <SkeletonRow />
              </>
            ) : quotations.length > 0 ? (
              quotations.map((q) => (
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
              ))
            ) : (
              <tr>
                <td colSpan={7} className="py-6 text-center text-muted-foreground">No quotations found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PartyOrders;
