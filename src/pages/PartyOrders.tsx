import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileText, Plus, Download, CheckCircle, Clock, Loader, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { usePartyOrders, useUpdatePartyOrderStatus, useCreatePartyOrder } from "@/hooks/useApi";

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
  const [showForm, setShowForm] = useState(false);
  const { data: partyOrdersData, isLoading } = usePartyOrders(user?.outlet_id);
  const updateMutation = useUpdatePartyOrderStatus();

  const [quoteForm, setQuoteForm] = useState({
    client_name: "",
    client_phone: "",
    event_date: "",
    number_of_items: "",
    estimated_amount: "",
    notes: "",
  });

  const createPartyOrderMutation = useCreatePartyOrder();

  const handleSubmitQuote = (e: React.FormEvent) => {
    e.preventDefault();
    const quoteData = {
      client_name: quoteForm.client_name,
      client_phone: quoteForm.client_phone,
      event_date: quoteForm.event_date,
      number_of_items: parseInt(quoteForm.number_of_items) || 0,
      total_amount: parseFloat(quoteForm.estimated_amount) || 0,
      notes: quoteForm.notes,
      outlet_id: user?.outlet_id,
      status: 'pending',
    };

    createPartyOrderMutation.mutateAsync(quoteData).then(() => {
      setQuoteForm({
        client_name: "",
        client_phone: "",
        event_date: "",
        number_of_items: "",
        estimated_amount: "",
        notes: "",
      });
      setShowForm(false);
    }).catch((error: any) => {
      console.error('Quotation submission error:', error);
      alert('Failed to create quotation: ' + (error?.message || 'Unknown error'));
    });
  };

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
        <Button
          onClick={() => setShowForm(!showForm)}
          className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
        >
          <Plus className="w-4 h-4" /> {showForm ? "Hide" : "New"} Quotation
        </Button>
      </div>

      {/* New Quotation Form */}
      {showForm && (
        <form onSubmit={handleSubmitQuote} className="glass-card p-5 space-y-4">
          <h3 className="font-display text-lg font-semibold text-foreground">Create New Quotation</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-muted-foreground text-sm">Outlet</Label>
              <div className="w-full bg-secondary border border-border rounded-lg px-3 py-2.5 text-sm text-foreground">
                Navrangpura
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-muted-foreground text-sm">Client Name *</Label>
              <Input
                type="text"
                placeholder="e.g. Rajesh Patel"
                value={quoteForm.client_name}
                onChange={(e) => setQuoteForm({ ...quoteForm, client_name: e.target.value })}
                className="bg-secondary border-border h-11"
                required
              />
            </div>
            <div className="space-y-2">
              <Label className="text-muted-foreground text-sm">Phone *</Label>
              <Input
                type="tel"
                placeholder="e.g. 9876543210"
                value={quoteForm.client_phone}
                onChange={(e) => setQuoteForm({ ...quoteForm, client_phone: e.target.value })}
                className="bg-secondary border-border h-11"
                required
              />
            </div>
            <div className="space-y-2">
              <Label className="text-muted-foreground text-sm">Event Date *</Label>
              <Input
                type="date"
                value={quoteForm.event_date}
                onChange={(e) => setQuoteForm({ ...quoteForm, event_date: e.target.value })}
                className="bg-secondary border-border h-11"
                required
              />
            </div>
            <div className="space-y-2">
              <Label className="text-muted-foreground text-sm">Number of Items *</Label>
              <Input
                type="number"
                min="1"
                placeholder="e.g. 50"
                value={quoteForm.number_of_items}
                onChange={(e) => setQuoteForm({ ...quoteForm, number_of_items: e.target.value })}
                className="bg-secondary border-border h-11"
                required
              />
            </div>
            <div className="space-y-2">
              <Label className="text-muted-foreground text-sm">Estimated Amount (₹) *</Label>
              <Input
                type="number"
                step="0.01"
                placeholder="e.g. 10000"
                value={quoteForm.estimated_amount}
                onChange={(e) => setQuoteForm({ ...quoteForm, estimated_amount: e.target.value })}
                className="bg-secondary border-border h-11"
                required
              />
            </div>
            <div className="sm:col-span-2 space-y-2">
              <Label className="text-muted-foreground text-sm">Notes</Label>
              <textarea
                placeholder="Add any special instructions or notes..."
                value={quoteForm.notes}
                onChange={(e) => setQuoteForm({ ...quoteForm, notes: e.target.value })}
                className="w-full bg-secondary border border-border rounded-lg px-3 py-2.5 text-sm text-foreground"
                rows={3}
              />
            </div>
          </div>
          <div className="flex gap-2 pt-4">
            <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground">
              Create Quotation
            </Button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 rounded-lg border border-border text-foreground hover:bg-secondary transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

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
