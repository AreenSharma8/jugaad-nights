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
import AdminWastage from "./pages/AdminWastage";
import AdminInventory from "./pages/AdminInventory";

// Staff Pages (to be created)
import StaffDashboard from "./pages/StaffDashboard";
import StaffWastage from "./pages/StaffWastage";
import StaffInventory from "./pages/StaffInventory";

const queryClient = new QueryClient();

// Component to handle role-based routing
const RoleBasedRouter = () => {
  const { user, isLoading, isAuthenticated } = useAuth();

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
      {/* Public routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* Redirect admin and staff to dashboard with role-based limitations */}
      <Route path="/admin" element={<Navigate to="/dashboard" replace />} />
      <Route path="/admin/wastage" element={<Navigate to="/dashboard/wastage" replace />} />
      <Route path="/admin/inventory" element={<Navigate to="/dashboard/inventory" replace />} />
      
      <Route path="/staff" element={<Navigate to="/dashboard" replace />} />
      <Route path="/staff/wastage" element={<Navigate to="/dashboard/wastage" replace />} />
      <Route path="/staff/inventory" element={<Navigate to="/dashboard/inventory" replace />} />

      {/* Customer/Default dashboard routes - Always rendered, access controlled by ProtectedRoute */}
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="sales" element={<Sales />} />
        <Route path="inventory" element={<Inventory />} />
        <Route path="wastage" element={<Wastage />} />
        <Route path="purchase-orders" element={<PurchaseOrders />} />
        <Route path="party-orders" element={<PartyOrders />} />
        <Route path="festivals" element={<Festivals />} />
        <Route path="cashflow" element={<Cashflow />} />
        <Route path="attendance" element={<Attendance />} />
      </Route>

      {/* Root route - just render login, let login handle navigation */}
      <Route path="/" element={<Login />} />
      
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
