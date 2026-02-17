import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, X, Clock } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { toast } from "sonner";

const staffList = [
  { name: "Rajesh Kumar", role: "Chef", status: "present", inTime: "09:00", outTime: "18:00" },
  { name: "Priya Sharma", role: "Server", status: "present", inTime: "09:15", outTime: "--" },
  { name: "Amit Patel", role: "Chef", status: "late", inTime: "09:45", outTime: "--" },
  { name: "Neha Singh", role: "Manager", status: "present", inTime: "08:55", outTime: "--" },
  { name: "Karan Mehta", role: "Server", status: "absent", inTime: "--", outTime: "--" },
  { name: "Sonia Gupta", role: "Cashier", status: "present", inTime: "09:02", outTime: "--" },
  { name: "Vikram Joshi", role: "Kitchen Helper", status: "absent", inTime: "--", outTime: "--" },
  { name: "Deepa Rao", role: "Server", status: "present", inTime: "09:10", outTime: "--" },
];

const monthlyData = [
  { week: "Week 1", attendance: 92, late: 5 },
  { week: "Week 2", attendance: 88, late: 8 },
  { week: "Week 3", attendance: 95, late: 3 },
  { week: "Week 4", attendance: 90, late: 6 },
];

const tt = {
  contentStyle: {
    backgroundColor: "hsl(220, 18%, 14%)",
    border: "1px solid hsl(220, 15%, 22%)",
    borderRadius: "8px",
    color: "hsl(30, 15%, 90%)",
    fontSize: "12px",
  },
};

const Attendance = () => {
  const [view, setView] = useState<"entry" | "analytics">("entry");

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-bold text-foreground">Attendance</h1>
        <div className="flex gap-1 bg-secondary rounded-lg p-1">
          {(["entry", "analytics"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium capitalize transition-colors ${
                view === v ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {v === "entry" ? "Daily Entry" : "Analytics"}
            </button>
          ))}
        </div>
      </div>

      {view === "entry" ? (
        <div className="glass-card p-5 overflow-x-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-lg font-semibold text-foreground">Today's Attendance</h3>
            <span className="text-xs text-muted-foreground">Feb 17, 2026</span>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-muted-foreground text-xs border-b border-border">
                <th className="text-left py-3 font-medium">Name</th>
                <th className="text-left py-3 font-medium">Role</th>
                <th className="text-center py-3 font-medium">Status</th>
                <th className="text-center py-3 font-medium">In Time</th>
                <th className="text-center py-3 font-medium">Out Time</th>
                <th className="text-center py-3 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {staffList.map((staff) => (
                <tr key={staff.name} className="border-b border-border/50 hover:bg-secondary/50 transition-colors">
                  <td className="py-3 text-foreground font-medium">{staff.name}</td>
                  <td className="py-3 text-muted-foreground">{staff.role}</td>
                  <td className="py-3 text-center">
                    {staff.status === "present" ? (
                      <span className="inline-flex items-center gap-1 text-xs text-success bg-success/10 px-2 py-1 rounded-full">
                        <Check className="w-3 h-3" /> Present
                      </span>
                    ) : staff.status === "late" ? (
                      <span className="inline-flex items-center gap-1 text-xs text-warning bg-warning/10 px-2 py-1 rounded-full">
                        <Clock className="w-3 h-3" /> Late
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs text-destructive bg-destructive/10 px-2 py-1 rounded-full">
                        <X className="w-3 h-3" /> Absent
                      </span>
                    )}
                  </td>
                  <td className="py-3 text-center text-muted-foreground">{staff.inTime}</td>
                  <td className="py-3 text-center text-muted-foreground">{staff.outTime}</td>
                  <td className="py-3 text-center">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs"
                      onClick={() => toast.success(`Updated ${staff.name}'s attendance`)}
                    >
                      Edit
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Avg Attendance", value: "91.2%", color: "text-success" },
              { label: "Late Arrivals", value: "5.5%", color: "text-warning" },
              { label: "Total Staff", value: "52", color: "text-foreground" },
              { label: "Overtime Hours", value: "48h", color: "text-gold" },
            ].map((stat) => (
              <div key={stat.label} className="glass-card p-4">
                <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
              </div>
            ))}
          </div>

          <div className="glass-card p-5">
            <h3 className="font-display text-lg font-semibold text-foreground mb-4">Monthly Attendance Trend</h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 22%)" />
                <XAxis dataKey="week" tick={{ fill: "hsl(220, 10%, 55%)", fontSize: 12 }} axisLine={false} />
                <YAxis tick={{ fill: "hsl(220, 10%, 55%)", fontSize: 12 }} axisLine={false} />
                <Tooltip {...tt} />
                <Bar dataKey="attendance" fill="hsl(145, 60%, 42%)" radius={[4, 4, 0, 0]} name="Attendance %" />
                <Bar dataKey="late" fill="hsl(40, 70%, 55%)" radius={[4, 4, 0, 0]} name="Late %" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};

export default Attendance;
