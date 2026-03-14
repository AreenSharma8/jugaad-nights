import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import Login from "./pages/Login";
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

const queryClient = new QueryClient();

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/" />;
};

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Navigate to="/login" />} />
    <Route path="/login" element={<Login />} />
    <Route path="/login/admin" element={<Login />} />
    <Route path="/login/manager" element={<Login />} />
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
    <Route path="*" element={<NotFound />} />
  </Routes>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
