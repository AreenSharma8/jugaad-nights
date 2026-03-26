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
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* Admin routes */}
      {user?.user_type === 'admin' && (
        <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>}>
          <Route index element={<AdminDashboard />} />
          <Route path="wastage" element={<AdminWastage />} />
          <Route path="inventory" element={<AdminInventory />} />
        </Route>
      )}

      {/* Staff routes */}
      {user?.user_type === 'staff' && (
        <Route path="/staff" element={<ProtectedRoute><StaffDashboard /></ProtectedRoute>}>
          <Route index element={<StaffDashboard />} />
          <Route path="wastage" element={<StaffWastage />} />
          <Route path="inventory" element={<StaffInventory />} />
        </Route>
      )}

      {/* Customer/Default dashboard routes */}
      {user?.user_type === 'customer' && (
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
      )}

      {/* Fallback redirects */}
      <Route 
        path="/" 
        element={
          user 
            ? user.user_type === 'admin' 
              ? <Navigate to="/admin" />
              : user.user_type === 'staff'
              ? <Navigate to="/staff" />
              : <Navigate to="/dashboard" />
            : <Navigate to="/login" />
        } 
      />
      
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
        <BrowserRouter>
          <RoleBasedRouter />
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
