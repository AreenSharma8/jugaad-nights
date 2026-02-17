import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { Calendar, Star } from "lucide-react";

const festivals = [
  { name: "Diwali", date: "Nov 1", topDish: "Butter Chicken", revenue: 485000, lastYear: 420000 },
  { name: "Holi", date: "Mar 14", topDish: "Paneer Tikka", revenue: 380000, lastYear: 340000 },
  { name: "Navratri", date: "Oct 3", topDish: "Thali Special", revenue: 310000, lastYear: 290000 },
  { name: "Makar Sankranti", date: "Jan 14", topDish: "Undhiyu", revenue: 265000, lastYear: 230000 },
  { name: "Uttarayan", date: "Jan 15", topDish: "Biryani Special", revenue: 340000, lastYear: 310000 },
];

const comparisonData = [
  { dish: "Butter Chicken", thisYear: 420, lastYear: 360 },
  { dish: "Paneer Tikka", thisYear: 380, lastYear: 310 },
  { dish: "Biryani", thisYear: 350, lastYear: 290 },
  { dish: "Dal Makhani", thisYear: 280, lastYear: 260 },
  { dish: "Tandoori", thisYear: 240, lastYear: 200 },
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

const Festivals = () => {
  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold text-foreground">Festival Analytics</h1>

      {/* Festival Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {festivals.map((f) => {
          const growth = (((f.revenue - f.lastYear) / f.lastYear) * 100).toFixed(0);
          return (
            <div key={f.name} className="glass-card p-5 hover:border-gold/30 transition-colors">
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="w-4 h-4 text-gold" />
                <span className="text-xs text-muted-foreground">{f.date}</span>
              </div>
              <h3 className="font-display text-lg font-semibold text-foreground">{f.name}</h3>
              <p className="text-2xl font-bold text-foreground mt-2">₹{(f.revenue / 1000).toFixed(0)}K</p>
              <div className="flex items-center justify-between mt-3">
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Star className="w-3 h-3 text-gold" /> {f.topDish}
                </span>
                <span className="text-xs text-success font-medium">+{growth}% YoY</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* This Year vs Last Year */}
      <div className="glass-card p-5">
        <h3 className="font-display text-lg font-semibold text-foreground mb-4">Top Dishes: This Year vs Last Year</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={comparisonData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 22%)" />
            <XAxis dataKey="dish" tick={{ fill: "hsl(220, 10%, 55%)", fontSize: 12 }} axisLine={false} />
            <YAxis tick={{ fill: "hsl(220, 10%, 55%)", fontSize: 12 }} axisLine={false} />
            <Tooltip {...tt} />
            <Bar dataKey="thisYear" fill="hsl(40, 70%, 55%)" radius={[4, 4, 0, 0]} name="2026" />
            <Bar dataKey="lastYear" fill="hsl(220, 15%, 30%)" radius={[4, 4, 0, 0]} name="2025" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Festivals;
