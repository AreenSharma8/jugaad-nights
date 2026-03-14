import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, Store, Eye, EyeOff, AlertCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";

const Login = () => {
  const navigate = useNavigate();
  const { role: urlRole } = useParams<{ role?: string }>();
  const { login, user } = useAuth();
  const { toast } = useToast();
  
  const [role, setRole] = useState<"admin" | "manager" | null>(
    urlRole === "admin" || urlRole === "manager" ? urlRole : null
  );
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Navigate to dashboard when user is logged in
  useEffect(() => {
    if (user && user.id) {
      navigate("/dashboard", { replace: true });
    }
  }, [user, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (!email || !password) {
        setError("Please enter your email and password");
        setLoading(false);
        return;
      }

      await login(email, password);
      
      toast({
        title: "Success",
        description: "Login successful",
      });

      // Immediately navigate after login succeeds
      // The useEffect will also handle navigation when user state updates (as fallback)
      setTimeout(() => {
        navigate("/dashboard", { replace: true });
      }, 300);
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err?.message || "Login failed";
      setError(errorMessage);
      setLoading(false);
      
      toast({
        title: "Login Failed",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      }} />
      
      {/* Warm glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-[120px]" />

      <div className="relative z-10 w-full max-w-md px-6">
        {/* Logo */}
        <div className="text-center mb-10 animate-fade-up">
          <h1 className="text-4xl font-display font-bold text-foreground tracking-tight">
            Jugaad <span className="text-gold">Nights</span>
          </h1>
          <p className="text-muted-foreground mt-2 text-sm tracking-widest uppercase">
            Operations Hub
          </p>
        </div>

        {/* Role Selection */}
        {!role ? (
          <div className="space-y-4 animate-fade-up" style={{ animationDelay: "0.1s" }}>
            <p className="text-center text-muted-foreground text-sm mb-6">Select your role to continue</p>
            <button
              onClick={() => {
                setRole("admin");
                navigate("/login/admin");
              }}
              className="w-full glass-card p-5 flex items-center gap-4 hover:border-primary/50 hover:glow-primary transition-all duration-300 group cursor-pointer"
            >
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-foreground">Admin</p>
                <p className="text-sm text-muted-foreground">Full access to all outlets & analytics</p>
              </div>
            </button>
            <button
              onClick={() => {
                setRole("manager");
                navigate("/login/manager");
              }}
              className="w-full glass-card p-5 flex items-center gap-4 hover:border-gold/50 transition-all duration-300 group cursor-pointer"
            >
              <div className="w-12 h-12 rounded-lg bg-gold/10 flex items-center justify-center group-hover:bg-gold/20 transition-colors">
                <Store className="w-6 h-6 text-gold" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-foreground">Store Manager</p>
                <p className="text-sm text-muted-foreground">Outlet operations & daily entries</p>
              </div>
            </button>
          </div>
        ) : (
          <form onSubmit={handleLogin} className="space-y-5 animate-fade-up">
            <button
              type="button"
              onClick={() => {
                setRole(null);
                setError(null);
                navigate("/login");
              }}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors mb-2"
            >
              ← Back to role selection
            </button>

            <div className="glass-card p-2 px-4 flex items-center gap-3 mb-6">
              {role === "admin" ? (
                <Shield className="w-4 h-4 text-primary" />
              ) : (
                <Store className="w-4 h-4 text-gold" />
              )}
              <span className="text-sm text-foreground capitalize">{role} Login</span>
            </div>

            {error && (
              <div className="glass-card border-red-500/20 bg-red-500/5 p-3 flex items-gap-2">
                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-500">{error}</p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-muted-foreground text-sm">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@jugaadnights.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className="bg-secondary border-border focus:border-primary h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-muted-foreground text-sm">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  className="bg-secondary border-border focus:border-primary h-11 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground disabled:opacity-50"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button 
              type="submit" 
              disabled={loading}
              className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-medium disabled:opacity-50"
            >
              {loading ? "Signing In..." : "Sign In"}
            </Button>

            <p className="text-center text-xs text-muted-foreground">
              Demo credentials: admin@jugaadnights.com / password123
            </p>
          </form>
        )}
      </div>
    </div>
  );
};

export default Login;
