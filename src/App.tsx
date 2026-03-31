import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { useAuth } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/hooks/ProtectedRoute";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import DashboardLayout from "./components/DashboardLayout";
import Dashboard from "./pages/Dashboard";
import Sales from "./pages/Sales";
import Inventory from "./pages/Inventory";
import Wastage from "./pages/Wastage";
import PurchaseOrders from "./pages/PurchaseOrders";
import PartyOrders from "./pages/PartyOrders";
import Festivals from "./pages/Festivals";
import Cashflow from "./pages/Cashflow";
import Attendance from "./pages/Attendance";
import NotFound from "./pages/NotFound";

// Admin Pages (to be created)
import AdminDashboard from "./pages/AdminDashboard";

// Staff Pages (to be created)
import StaffDashboard from "./pages/StaffDashboard";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      refetchOnMount: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

/**
 * SINGLE SOURCE OF REDIRECT TRUTH
 * 
 * Root route (`/`) is the ONLY place that decides:
 * - If authenticated → redirect to /dashboard
 * - If not authenticated → show login
 * 
 * OTHER redirect sources (Login.tsx, ProtectedRoute.tsx):
 * - Login redirects authenticated users back to /dashboard
 * - ProtectedRoute blocks unauthenticated users from /dashboard
 * 
 * This prevents redirect loops by avoiding multiple overlapping redirects
 */

// ✅ FIX: Root route component - SINGLE SOURCE OF REDIRECT TRUTH
// This is the ONLY place that handles / → /dashboard or /login redirect
// 
// Why separate from RoleBasedRouter:
// - Handles initial page load at /
// - Doesn't interfere with other route logic
// - Prevents double-redirect scenarios
const RootRoute = () => {
  const { isAuthenticated, isLoading } = useAuth();

  // Wait for auth initialization before rendering anything
  // This prevents showing login briefly then redirecting to dashboard
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  /**
   * Root redirect decision:
   * - If authenticated (verified token + user) → go to /dashboard
   * - Otherwise → show login page (don't stay at / with blank page)
   * 
   * Prevents:
   * - Showing blank page at /
   * - Redirect loops
   * - Unauthorized dashboard access
   */
  return isAuthenticated ? (
    <Navigate to="/dashboard" replace />
  ) : (
    <Login />
  );
};

const DashboardByRole = () => {
  const { user } = useAuth();

  if (user?.roles?.includes("admin")) {
    return <AdminDashboard />;
  }

  if (user?.roles?.includes("staff")) {
    return <StaffDashboard />;
  }

  return <Dashboard />;
};

// Component to handle role-based routing
// ⚠️ IMPORTANT: This router waits for auth initialization and then renders routes
// Do NOT add root (/) redirect logic here - use RootRoute component above
const RoleBasedRouter = () => {
  const { isLoading } = useAuth();

  // Wait for auth to load before rendering ANY routes
  // Prevents showing login/dashboard/404 before we know the user's auth status
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {/* 
        PUBLIC ROUTES
        Accessible without authentication
        Login.tsx handles: if authenticated → redirect to /dashboard
      */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* 
        ROLE REDIRECTS
        These are convenience redirects for old URL patterns
        Users can navigate to /dashboard based on their role using role-based access control
      */}
      <Route path="/admin" element={<Navigate to="/dashboard" replace />} />
      <Route path="/admin/wastage" element={<Navigate to="/dashboard/wastage" replace />} />
      <Route path="/admin/inventory" element={<Navigate to="/dashboard/inventory" replace />} />
      
      <Route path="/staff" element={<Navigate to="/dashboard" replace />} />
      <Route path="/staff/wastage" element={<Navigate to="/dashboard/wastage" replace />} />
      <Route path="/staff/inventory" element={<Navigate to="/dashboard/inventory" replace />} />

      {/* 
        PROTECTED ROUTES
        Wrapped in ProtectedRoute component which:
        - Waits for auth initialization (shows spinner)
        - Redirects unauthenticated users to /login
        - Checks role-based access if needed
      */}
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardByRole />} />
        <Route path="sales" element={<Sales />} />
        <Route path="inventory" element={<Inventory />} />
        <Route path="wastage" element={<Wastage />} />
        <Route path="purchase-orders" element={<PurchaseOrders />} />
        <Route path="party-orders" element={<PartyOrders />} />
        <Route path="festivals" element={<Festivals />} />
        <Route path="cashflow" element={<Cashflow />} />
        <Route path="attendance" element={<Attendance />} />
      </Route>

      {/* 
        ROOT ROUTE
        Handled by RootRoute component above
        Must be last to avoid catching all other routes
      */}
      <Route path="/" element={<RootRoute />} />
      
      {/* Not found */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <RoleBasedRouter />
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
