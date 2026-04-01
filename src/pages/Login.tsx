import { useState } from "react";
import { Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Shield, Eye, EyeOff, AlertCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const Login = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { login, isLoading, error, isAuthenticated, user } = useAuth();

  const [role, setRole] = useState<"admin" | "staff" | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  /**
   * SECURITY: Only redirect to dashboard if:
   * 1. User is authenticated (verified token + valid user)
   * 2. force=true query param is NOT set (allows testing)
   * 
   * This prevents:
   * - Redirect loops (both Login and RootRoute trying to redirect)
   * - Blocking manual login attempts
   * - Forcing users to dashboard with invalid auth state
   */
  const forceShowLogin = searchParams.get('force') === 'true';
  
  if (isAuthenticated && !forceShowLogin) {
    return <Navigate to="/dashboard" replace />;
  }

  // Map role to demo email
  const getDemoEmail = () => {
    switch (role) {
      case "admin":
        return "admin@jugaadnights.com";
      case "staff":
        return "staff@jugaadnights.com";
      default:
        return "";
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast({
        title: "Validation Error",
        description: "Please enter both email and password",
        variant: "destructive",
      });
      return;
    }

    try {
      await login(email, password);
      toast({
        title: "Success",
        description: "Logged in successfully!",
      });

      // Navigate to dashboard
      navigate("/dashboard", { replace: true });
    } catch (err: any) {
      toast({
        title: "Login Failed",
        description: err.message || "Invalid credentials",
        variant: "destructive",
      });
    }
  };

  const handleDemoLogin = async (demoRole: "admin" | "staff") => {
    const demoEmail = demoRole === "admin" 
      ? "admin@jugaadnights.com" 
      : "staff@jugaadnights.com";

    try {
      await login(demoEmail, "Demo@12345");
      toast({
        title: "Success",
        description: "Logged in as demo user!",
      });

      navigate("/dashboard", { replace: true });
    } catch (err: any) {
      toast({
        title: "Login Failed",
        description: err.message || "Demo login failed",
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

        {/* Error Alert */}
        {error && (
          <div className="mb-6 glass-card border-red-500/50 bg-red-50/10 p-4 flex items-start gap-3 rounded-lg animate-fade-up">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Role Selection */}
        {!role ? (
          <div className="space-y-4 animate-fade-up" style={{ animationDelay: "0.1s" }}>
            <p className="text-center text-muted-foreground text-sm mb-6">Select your role to continue</p>
            <button
              onClick={() => setRole("admin")}
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
              onClick={() => setRole("staff")}
              className="w-full glass-card p-5 flex items-center gap-4 hover:border-yellow-500/50 transition-all duration-300 group cursor-pointer"
            >
              <div className="w-12 h-12 rounded-lg bg-yellow-500/10 flex items-center justify-center group-hover:bg-yellow-500/20 transition-colors">
                <Shield className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-foreground">Staff</p>
                <p className="text-sm text-muted-foreground">Daily operations & order entry</p>
              </div>
            </button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">New user?</span>
              </div>
            </div>

            <Button
              variant="secondary"
              onClick={() => navigate("/signup")}
              className="w-full h-11"
            >
              Create Account
            </Button>
          </div>
        ) : (
          <form onSubmit={handleLogin} className="space-y-5 animate-fade-up">
            <button
              type="button"
              onClick={() => setRole(null)}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors mb-2"
              disabled={isLoading}
            >
              ← Back to role selection
            </button>

            <div className="glass-card p-2 px-4 flex items-center gap-3 mb-6">
              {role === "admin" ? (
                <Shield className="w-4 h-4 text-primary" />
              ) : (
                <Shield className="w-4 h-4 text-yellow-600" />
              )}
              <span className="text-sm text-foreground capitalize">{role} Login</span>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-muted-foreground text-sm">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@jugaadnights.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
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
                  disabled={isLoading}
                  className="bg-secondary border-border focus:border-primary h-11 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground disabled:opacity-50"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button 
              type="submit" 
              disabled={isLoading}
              className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-medium disabled:opacity-50"
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or try demo account</span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              disabled={isLoading}
              onClick={() => handleDemoLogin(role as any)}
              className="w-full h-11 disabled:opacity-50"
            >
              {isLoading ? "Loading..." : `Login as ${role} (Demo)`}
            </Button>

            <p className="text-center text-xs text-muted-foreground mt-3 p-3 bg-secondary/50 rounded">
              <span className="font-semibold block mb-1">Demo Credentials:</span>
              <span className="block">Email: {getDemoEmail()}</span>
              <span className="block">Password: Demo@12345</span>
            </p>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">New user?</span>
              </div>
            </div>

            <Button
              type="button"
              variant="secondary"
              disabled={isLoading}
              onClick={() => navigate("/signup")}
              className="w-full h-11 disabled:opacity-50"
            >
              Create Account
            </Button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Login;
