import { Clock } from "lucide-react";

const Festivals = () => {
  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold text-foreground">Festival Analytics</h1>

      <div className="glass-card p-12 text-center">
        <div className="w-16 h-16 rounded-full bg-warning/10 flex items-center justify-center mx-auto mb-4">
          <Clock className="w-8 h-8 text-warning" />
        </div>
        <h2 className="text-2xl font-semibold text-foreground mb-2">Coming Soon</h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          Festival Analytics feature is currently under development and will be available in the next update.
        </p>
      </div>
    </div>
  );
};

export default Festivals;
