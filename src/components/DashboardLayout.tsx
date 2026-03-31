import { useEffect, useState } from "react";
import { Link, useLocation, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, ShoppingCart, Package, Trash2, FileText, PartyPopper,
  Calendar, DollarSign, Users, Menu, LogOut, ChevronLeft,
  Bell, Shield
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

const navItems = [
  { title: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
  { title: "Sales & Billing", icon: ShoppingCart, path: "/dashboard/sales" },
  { title: "Inventory", icon: Package, path: "/dashboard/inventory" },
  { title: "Wastage", icon: Trash2, path: "/dashboard/wastage" },
  { title: "Purchase Orders", icon: FileText, path: "/dashboard/purchase-orders" },
  { title: "Party Orders", icon: PartyPopper, path: "/dashboard/party-orders" },
  { title: "Festival Analytics", icon: Calendar, path: "/dashboard/festivals" },
  { title: "Cashflow", icon: DollarSign, path: "/dashboard/cashflow" },
  { title: "Attendance", icon: Users, path: "/dashboard/attendance" },
];

// Role-based accessible features
const roleAccessMap: Record<string, string[]> = {
  admin: ["/dashboard", "/dashboard/sales", "/dashboard/inventory", "/dashboard/wastage", "/dashboard/purchase-orders", "/dashboard/party-orders", "/dashboard/festivals", "/dashboard/cashflow", "/dashboard/attendance"],
  staff: ["/dashboard", "/dashboard/sales", "/dashboard/inventory", "/dashboard/wastage", "/dashboard/party-orders", "/dashboard/cashflow", "/dashboard/attendance"],
  customer: ["/dashboard", "/dashboard/sales", "/dashboard/inventory", "/dashboard/party-orders"],
};

const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  // Handle logout
  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  // Get accessible nav items based on user role
  const getUserRole = () => {
    if (user?.roles?.includes("admin")) return "admin";
    if (user?.roles?.includes("staff")) return "staff";
    return "customer";
  };

  const userRole = getUserRole();
  const accessiblePaths = roleAccessMap[userRole] || roleAccessMap.customer;
  const accessibleNavItems = navItems.filter(item => accessiblePaths.includes(item.path));

  useEffect(() => {
    // Enforce role access even for direct URL navigation.
    if (location.pathname.startsWith("/dashboard") && !accessiblePaths.includes(location.pathname)) {
      navigate("/dashboard", { replace: true });
    }
  }, [accessiblePaths, location.pathname, navigate]);

  return (
    <div className="flex min-h-screen w-full bg-background">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-full bg-sidebar border-r border-sidebar-border flex flex-col transition-all duration-300",
          collapsed ? "w-[68px]" : "w-60",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-4 border-b border-sidebar-border shrink-0">
          {!collapsed && (
            <Link to="/dashboard" className="flex items-center gap-2">
              <span className="font-display text-lg font-bold text-foreground">Jugaad</span>
              <span className="font-display text-lg font-bold text-gold">Nights</span>
            </Link>
          )}
          {collapsed && (
            <span className="font-display text-xl font-bold text-gold mx-auto">JN</span>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
          {accessibleNavItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-all duration-200",
                  isActive
                    ? "bg-primary/15 text-primary font-medium"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                <item.icon className={cn("w-5 h-5 shrink-0", isActive && "text-primary")} />
                {!collapsed && <span>{item.title}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Collapse toggle (desktop) */}
        <div className="hidden lg:flex items-center justify-center py-3 border-t border-sidebar-border">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="text-muted-foreground hover:text-foreground p-1.5 rounded-md hover:bg-sidebar-accent transition-colors"
          >
            <ChevronLeft className={cn("w-4 h-4 transition-transform", collapsed && "rotate-180")} />
          </button>
        </div>

        {/* Account Options */}
        <div className="px-2 pb-4 border-t border-sidebar-border pt-3 space-y-2">
          {/* Switch Account - for testing different users */}
          <Link
            to="/login?force=true"
            className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
          >
            <Shield className="w-5 h-5 shrink-0" />
            {!collapsed && <span>Switch Account</span>}
          </Link>
          
          {/* Logout */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
          >
            <LogOut className="w-5 h-5 shrink-0" />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className={cn(
        "flex-1 flex flex-col transition-all duration-300",
        collapsed ? "lg:ml-[68px]" : "lg:ml-60"
      )}>
        {/* Top bar */}
        <header className="h-16 flex items-center justify-between px-4 lg:px-6 border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-30">
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden text-muted-foreground hover:text-foreground"
          >
            <Menu className="w-6 h-6" />
          </button>

          <div className="hidden lg:block">
            <h2 className="text-sm font-medium text-muted-foreground">
              {accessibleNavItems.find((i) => i.path === location.pathname)?.title || "Dashboard"}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <button className="relative text-muted-foreground hover:text-foreground p-2 rounded-lg hover:bg-secondary transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary" />
            </button>
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-sm font-medium text-primary" title={`${userRole.charAt(0).toUpperCase() + userRole.slice(1)}`}>
              {user?.name?.charAt(0).toUpperCase() || "A"}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
