import { useState } from "react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar
} from "recharts";
import { TrendingUp, TrendingDown, DollarSign, ArrowUpRight, ArrowDownRight, Loader, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { useCashFlow, useCashFlowSummary, useAddCashFlowEntry } from "@/hooks/useApi";

const tt = {
  contentStyle: {
    backgroundColor: "hsl(220, 18%, 14%)",
    border: "1px solid hsl(220, 15%, 22%)",
    borderRadius: "8px",
    color: "hsl(30, 15%, 90%)",
    fontSize: "12px",
  },
};

const Cashflow = () => {
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const { data: cashFlowData, isLoading } = useCashFlow(user?.outlet_id);
  const { data: summaryData } = useCashFlowSummary(user?.outlet_id || "");

  const [entryForm, setEntryForm] = useState({
    entry_type: "inflow",
    amount: "",
    description: "",
    date: new Date().toISOString().split('T')[0],
  });

  const addCashFlowMutation = useAddCashFlowEntry();

  const handleSubmitEntry = (e: React.FormEvent) => {
    e.preventDefault();
    const entryData = {
      entry_type: entryForm.entry_type,
      inflow: entryForm.entry_type === 'inflow' ? parseFloat(entryForm.amount) : 0,
      outflow: entryForm.entry_type === 'outflow' ? parseFloat(entryForm.amount) : 0,
      description: entryForm.description,
      date: entryForm.date,
      outlet_id: user?.outlet_id,
    };

    addCashFlowMutation.mutateAsync(entryData).then(() => {
      setEntryForm({
        entry_type: "inflow",
        amount: "",
        description: "",
        date: new Date().toISOString().split('T')[0],
      });
      setShowForm(false);
    }).catch((error: any) => {
      console.error('Cashflow entry error:', error);
      alert('Failed to add cashflow entry: ' + (error?.message || 'Unknown error'));
    });
  };

  const dailyInflow = cashFlowData?.map((entry: any) => ({
    date: new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    inflow: entry.inflow || 0,
    outflow: entry.outflow || 0,
  })) || [];

  const summaryStats = summaryData || {
    total_inflow: 0,
    total_outflow: 0,
    net_profit: 0,
    avg_daily: 0,
  };
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-bold text-foreground">Cashflow Analytics</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-primary hover:bg-primary/90 text-primary-foreground px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex gap-1 items-center"
        >
          <Plus className="w-4 h-4" /> {showForm ? "Hide" : "New"} Entry
        </button>
      </div>

      {/* Entry Form */}
      {showForm && (
        <form onSubmit={handleSubmitEntry} className="glass-card p-5 space-y-4">
          <h3 className="font-display text-lg font-semibold text-foreground">Record Cashflow Entry</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-muted-foreground text-sm">Outlet</Label>
              <div className="w-full bg-secondary border border-border rounded-lg px-3 py-2.5 text-sm text-foreground">
                Navrangpura
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-muted-foreground text-sm">Entry Type *</Label>
              <select
                value={entryForm.entry_type}
                onChange={(e) => setEntryForm({ ...entryForm, entry_type: e.target.value })}
                className="w-full bg-secondary border border-border rounded-lg px-3 py-2.5 text-sm text-foreground"
                required
              >
                <option value="inflow">Inflow (Income)</option>
                <option value="outflow">Outflow (Expense)</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label className="text-muted-foreground text-sm">Amount (₹) *</Label>
              <Input
                type="number"
                step="0.01"
                placeholder="e.g. 5000"
                value={entryForm.amount}
                onChange={(e) => setEntryForm({ ...entryForm, amount: e.target.value })}
                className="bg-secondary border-border h-11"
                required
              />
            </div>
            <div className="space-y-2">
              <Label className="text-muted-foreground text-sm">Date *</Label>
              <Input
                type="date"
                value={entryForm.date}
                onChange={(e) => setEntryForm({ ...entryForm, date: e.target.value })}
                className="bg-secondary border-border h-11"
                required
              />
            </div>
            <div className="sm:col-span-2 space-y-2">
              <Label className="text-muted-foreground text-sm">Description *</Label>
              <input
                type="text"
                placeholder="e.g. Daily Sales / Supplier Payment"
                value={entryForm.description}
                onChange={(e) => setEntryForm({ ...entryForm, description: e.target.value })}
                className="w-full bg-secondary border border-border rounded-lg px-3 py-2.5 text-sm text-foreground"
                required
              />
            </div>
          </div>
          <div className="flex gap-2 pt-4">
            <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground">
              Save Entry
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

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: "Total Inflow", value: `₹${(summaryStats.total_inflow || 0).toLocaleString()}`, change: "+14%", up: true, icon: ArrowUpRight },
          { title: "Total Outflow", value: `₹${(summaryStats.total_outflow || 0).toLocaleString()}`, change: "+8%", up: true, icon: ArrowDownRight },
          { title: "Net Profit", value: `₹${(summaryStats.net_profit || 0).toLocaleString()}`, change: "+18%", up: true, icon: TrendingUp },
          { title: "Avg Daily", value: `₹${(summaryStats.avg_daily || 0).toLocaleString()}`, change: "-3%", up: false, icon: DollarSign },
        ].map((card) => (
          <div key={card.title} className="glass-card p-4">
            <div className="flex items-center justify-between mb-2">
              <card.icon className={`w-4 h-4 ${card.up ? "text-success" : "text-destructive"}`} />
              <span className={`text-xs font-medium ${card.up ? "text-success" : "text-destructive"}`}>{card.change}</span>
            </div>
            <p className="text-xl font-bold text-foreground">{card.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{card.title}</p>
          </div>
        ))}
      </div>

      {/* Inflow vs Outflow */}
      {dailyInflow.length > 0 && (
      <div className="glass-card p-5">
        <h3 className="font-display text-lg font-semibold text-foreground mb-4">Revenue vs Expenses</h3>
        <ResponsiveContainer width="100%" height={320}>
          <AreaChart data={dailyInflow}>
            <defs>
              <linearGradient id="inflowGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(145, 60%, 42%)" stopOpacity={0.2} />
                <stop offset="100%" stopColor="hsl(145, 60%, 42%)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="outflowGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(0, 65%, 45%)" stopOpacity={0.2} />
                <stop offset="100%" stopColor="hsl(0, 65%, 45%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 22%)" />
            <XAxis dataKey="date" tick={{ fill: "hsl(220, 10%, 55%)", fontSize: 12 }} axisLine={false} />
            <YAxis tick={{ fill: "hsl(220, 10%, 55%)", fontSize: 12 }} axisLine={false} tickFormatter={(v) => `₹${v / 1000}K`} />
            <Tooltip {...tt} formatter={(v: number) => [`₹${v.toLocaleString()}`, ""]} />
            <Area type="monotone" dataKey="inflow" stroke="hsl(145, 60%, 42%)" fill="url(#inflowGrad)" strokeWidth={2} name="Inflow" />
            <Area type="monotone" dataKey="outflow" stroke="hsl(0, 65%, 45%)" fill="url(#outflowGrad)" strokeWidth={2} name="Outflow" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      )}

      {/* Outlet Profitability - Placeholder for single outlet */}
      <div className="glass-card p-5">
        <h3 className="font-display text-lg font-semibold text-foreground mb-4">Cashflow Summary</h3>
        <p className="text-sm text-muted-foreground">Daily cashflow data for {user?.outlet_name || 'your outlet'}</p>
      </div>
    </div>
  );
};

export default Cashflow;
