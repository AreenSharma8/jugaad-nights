import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, X, Clock, Loader } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { useAuth } from "@/contexts/AuthContext";
import { useAttendance, useCheckIn, useCheckOut } from "@/hooks/useApi";

const tt = {
  contentStyle: {
    backgroundColor: "hsl(220, 18%, 14%)",
    border: "1px solid hsl(220, 15%, 22%)",
    borderRadius: "8px",
    color: "hsl(30, 15%, 90%)",
    fontSize: "12px",
  },
};

const SkeletonStaffRow = () => (
  <tr className="border-b border-border/50 animate-pulse">
    <td className="py-3"><div className="h-4 bg-secondary rounded w-24"></div></td>
    <td className="py-3"><div className="h-4 bg-secondary rounded w-16"></div></td>
    <td className="py-3"><div className="h-4 bg-secondary rounded w-20 mx-auto"></div></td>
    <td className="py-3"><div className="h-4 bg-secondary rounded w-12 mx-auto"></div></td>
    <td className="py-3"><div className="h-4 bg-secondary rounded w-12 mx-auto"></div></td>
    <td className="py-3"><div className="h-4 bg-secondary roundedw-16 mx-auto"></div></td>
  </tr>
);

const StatCardSkeleton = () => (
  <div className="glass-card p-4 animate-pulse">
    <div className="h-8 bg-secondary rounded w-20 mb-1"></div>
    <div className="h-3 bg-secondary rounded w-32"></div>
  </div>
);

const Attendance = () => {
  const [view, setView] = useState<"entry" | "analytics">("entry");
  const { user } = useAuth();
  const { data: attendance, isLoading } = useAttendance(user?.outlet_id);
  const checkInMutation = useCheckIn();
  const checkOutMutation = useCheckOut();

  const staffList = attendance?.map((record: any) => ({
    name: record.staff_name,
    role: record.role,
    status: record.status === "checked_in" ? "present" : record.status === "late_check_in" ? "late" : "absent",
    inTime: record.check_in_time ? record.check_in_time.substring(11, 16) : "--",
    outTime: record.check_out_time ? record.check_out_time.substring(11, 16) : "--",
    staffId: record.staff_id,
  })) || [];

  const monthlyData = [
    { week: "Week 1", attendance: 92, late: 5 },
    { week: "Week 2", attendance: 88, late: 8 },
    { week: "Week 3", attendance: 95, late: 3 },
    { week: "Week 4", attendance: 90, late: 6 },
  ];

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
              {isLoading ? (
                <>
                  <SkeletonStaffRow />
                  <SkeletonStaffRow />
                  <SkeletonStaffRow />
                  <SkeletonStaffRow />
                </>
              ) : staffList.length > 0 ? (
                staffList.map((staff) => (
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
                        disabled={checkInMutation.isPending || checkOutMutation.isPending}
                        onClick={() => {
                          if (staff.status === "present") {
                            checkOutMutation.mutateAsync(staff.staffId);
                          } else {
                            checkInMutation.mutateAsync(staff.staffId);
                          }
                        }}
                      >
                        {staff.status === "present" ? "Check Out" : "Check In"}
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-muted-foreground">No attendance records found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {isLoading ? (
              <>
                <StatCardSkeleton />
                <StatCardSkeleton />
                <StatCardSkeleton />
                <StatCardSkeleton />
              </>
            ) : (
              <>
                <div className="glass-card p-4">
                  <p className="text-2xl font-bold text-success">91.2%</p>
                  <p className="text-xs text-muted-foreground mt-1">Avg Attendance</p>
                </div>
                <div className="glass-card p-4">
                  <p className="text-2xl font-bold text-warning">5.5%</p>
                  <p className="text-xs text-muted-foreground mt-1">Late Arrivals</p>
                </div>
                <div className="glass-card p-4">
                  <p className="text-2xl font-bold text-foreground">{staffList.length}</p>
                  <p className="text-xs text-muted-foreground mt-1">Total Staff</p>
                </div>
                <div className="glass-card p-4">
                  <p className="text-2xl font-bold text-gold">48h</p>
                  <p className="text-xs text-muted-foreground mt-1">Overtime Hours</p>
                </div>
              </>
            )}
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
