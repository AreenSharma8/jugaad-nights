import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileText, Plus, Download, CheckCircle, Clock, Loader, X, Edit2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { usePartyOrders, useUpdatePartyOrderStatus, useCreatePartyOrder } from "@/hooks/useApi";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const SkeletonRow = () => (
  <tr className="border-b border-border/50 animate-pulse">
    <td className="py-4 px-2"><div className="h-4 bg-secondary rounded w-12"></div></td>
    <td className="py-4 px-2"><div className="h-4 bg-secondary rounded w-24"></div></td>
    <td className="py-4 px-2"><div className="h-4 bg-secondary rounded w-16"></div></td>
    <td className="py-4 px-2"><div className="h-8 bg-secondary rounded w-8 mx-auto"></div></td>
    <td className="py-4 px-2"><div className="h-4 bg-secondary rounded w-20 ml-auto"></div></td>
    <td className="py-4 px-2"><div className="h-4 bg-secondary rounded w-20"></div></td>
    <td className="py-4 px-2"><div className="h-4 bg-secondary rounded w-12 ml-auto"></div></td>
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
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingStatus, setEditingStatus] = useState<string>("");
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

  const quotations = Array.isArray(partyOrdersData) ? partyOrdersData.map((order: any) => {
    // Debug: Log the actual data received
    console.log('📊 Party Order Raw Data:', {
      id: order.id,
      customer_name: order.customer_name,
      total_amount: order.total_amount,
      number_of_items: order.number_of_items,
      items_array: order.items,
      items_length: order.items?.length || 0,
      full_order: order
    });

    return {
      id: order.id,
      shortId: order.id?.substring(0, 8).toUpperCase() || 'N/A',
      client: order.customer_name || order.client_name || 'N/A',
      phone: order.customer_phone || order.client_phone || 'N/A',
      event: new Date(order.event_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      items: order.items?.length || order.number_of_items || 0,
      total: parseFloat(order.total_amount) || 0,
      status: order.status?.toLowerCase() || "pending",
      notes: order.notes || '',
    };
  }) : [];

  const handleConvert = async (quotationId: string) => {
    try {
      await updateMutation.mutateAsync({ id: quotationId, status: "converted" });
      alert('Quotation converted successfully!');
    } catch (error) {
      alert('Failed to convert quotation: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const handleStatusChange = async (quotationId: string, newStatus: string) => {
    try {
      await updateMutation.mutateAsync({ id: quotationId, status: newStatus });
      setEditingId(null);
      alert('Status updated successfully!');
    } catch (error) {
      alert('Failed to update status: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const downloadPDF = (quotation: any) => {
    try {
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 15;
      let yPosition = 20;

      // Title
      pdf.setFontSize(20);
      pdf.setFont(undefined, "bold");
      pdf.text("QUOTATION", margin, yPosition);
      yPosition += 12;

      // Horizontal line
      pdf.setDrawColor(200, 200, 200);
      pdf.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 8;

      // Quotation Details
      pdf.setFontSize(11);
      pdf.setFont(undefined, "normal");

      const details = [
        { label: "Quotation ID:", value: quotation.shortId },
        { label: "Client Name:", value: quotation.client },
        { label: "Phone:", value: quotation.phone },
        { label: "Event Date:", value: quotation.event },
        { label: "Number of Items:", value: `${quotation.items}` },
        { label: "Total Amount:", value: `₹${quotation.total.toLocaleString()}` },
        { label: "Status:", value: quotation.status.toUpperCase() },
      ];

      details.forEach((detail) => {
        pdf.setFont(undefined, "bold");
        pdf.text(`${detail.label}`, margin, yPosition);
        pdf.setFont(undefined, "normal");
        pdf.text(`${detail.value}`, margin + 50, yPosition);
        yPosition += 7;
      });

      // Notes Section
      if (quotation.notes) {
        yPosition += 5;
        pdf.setDrawColor(200, 200, 200);
        pdf.line(margin, yPosition, pageWidth - margin, yPosition);
        yPosition += 8;

        pdf.setFont(undefined, "bold");
        pdf.text("Notes:", margin, yPosition);
        yPosition += 5;

        pdf.setFont(undefined, "normal");
        const notesLines = pdf.splitTextToSize(quotation.notes, pageWidth - 2 * margin);
        pdf.text(notesLines, margin, yPosition);
        yPosition += notesLines.length * 5;
      }

      // Footer
      yPosition = pageHeight - 15;
      pdf.setDrawColor(200, 200, 200);
      pdf.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 5;

      pdf.setFontSize(9);
      pdf.setFont(undefined, "normal");
      pdf.setTextColor(150, 150, 150);
      pdf.text(`Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`, margin, yPosition);
      pdf.text(`© Jugaad Nights`, pageWidth - margin - 30, yPosition);

      // Download
      pdf.save(`Quotation_${quotation.shortId}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to generate PDF. Please try again.");
    }
  };

  const pendingCount = quotations.filter(q => q.status === "pending").length;
  const convertedCount = quotations.filter(q => q.status === "converted").length;
  const totalValue = quotations.reduce((sum, q) => sum + (q.total || 0), 0);

  // Format total value for display
  const formatTotalValue = (value: number) => {
    if (!isFinite(value) || isNaN(value)) return "₹0";
    if (value >= 100000) {
      return `₹${(value / 100000).toFixed(2)}L`;
    }
    return `₹${value.toLocaleString()}`;
  };

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
                <p className="text-xl font-bold text-foreground">{formatTotalValue(totalValue)}</p>
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
              <th className="text-left py-4 px-2 font-medium">ID</th>
              <th className="text-left py-4 px-2 font-medium">Client Info</th>
              <th className="text-left py-4 px-2 font-medium">Event Date</th>
              <th className="text-center py-4 px-2 font-medium">Items</th>
              <th className="text-right py-4 px-2 font-medium">Total</th>
              <th className="text-left py-4 px-2 font-medium">Status</th>
              <th className="text-right py-4 px-2 font-medium">Actions</th>
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
                  <td className="py-4 px-2 text-foreground font-medium text-xs">{q.shortId}</td>
                  <td className="py-4 px-2">
                    <div className="text-foreground font-medium text-sm">{q.client}</div>
                    <div className="text-muted-foreground text-xs">{q.phone}</div>
                  </td>
                  <td className="py-4 px-2 text-muted-foreground">{q.event}</td>
                  <td className="py-4 px-2 text-center text-foreground font-semibold bg-primary/5 rounded">
                    <span className="inline-flex items-center justify-center min-w-8 min-h-8 rounded-full bg-primary/20 text-primary font-bold">
                      {q.items > 0 ? q.items : "0"}
                    </span>
                  </td>
                  <td className="py-4 px-2 text-right text-foreground font-medium">₹{q.total.toLocaleString()}</td>
                  <td className="py-4 px-2">
                    {editingId === q.id ? (
                      <div className="flex gap-1 items-center">
                        <select
                          value={editingStatus}
                          onChange={(e) => setEditingStatus(e.target.value)}
                          className="px-2 py-1 bg-background border border-input rounded text-xs"
                        >
                          <option value="pending">Pending</option>
                          <option value="converted">Converted</option>
                          <option value="rejected">Rejected</option>
                        </select>
                        <button
                          onClick={() => handleStatusChange(q.id, editingStatus)}
                          disabled={updateMutation.isPending}
                          className="px-2 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs font-medium disabled:opacity-50"
                        >
                          ✓
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="px-2 py-1 bg-secondary hover:bg-secondary/80 text-foreground rounded text-xs"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <span className={`inline-flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-full capitalize ${
                        q.status === "converted" ? "text-green-700 bg-green-500/20" :
                        q.status === "rejected" ? "text-red-700 bg-red-500/20" :
                        "text-yellow-700 bg-yellow-500/20"
                      }`}>
                        {q.status === "converted" ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                        {q.status}
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-2 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {editingId !== q.id && (
                        <>
                          <button
                            onClick={() => {
                              setEditingId(q.id);
                              setEditingStatus(q.status);
                            }}
                            className="px-2 py-1 bg-primary/20 hover:bg-primary/30 text-primary rounded text-xs font-medium transition-colors flex items-center gap-1 whitespace-nowrap"
                          >
                            <Edit2 className="w-3 h-3" /> Edit
                          </button>
                          {q.status === "pending" && (
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="h-7 text-xs bg-green-600/20 hover:bg-green-600/30 text-green-700 border-green-500/50 whitespace-nowrap"
                              onClick={() => handleConvert(q.id)}
                            >
                              Convert
                            </Button>
                          )}
                          <button
                            onClick={() => downloadPDF(q)}
                            className="px-2 py-1 bg-secondary hover:bg-secondary/80 text-foreground rounded text-xs font-medium transition-colors flex items-center gap-1 whitespace-nowrap"
                          >
                            <Download className="w-3 h-3" /> PDF
                          </button>
                        </>
                      )}
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
