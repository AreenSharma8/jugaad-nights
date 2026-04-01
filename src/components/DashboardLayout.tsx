/**
 * ============================================================================
 * DASHBOARD LAYOUT COMPONENT - Main Application Shell
 * ============================================================================
 * 
 * This is the primary layout component for authenticated users in the Jugaad
 * Nights Operations Hub. It provides the structural framework for the entire
 * dashboard, including navigation, routing, and role-based access control.
 * 
 * Architecture Overview:
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ DashboardLayout (this component)                                    │
 * ├─────────────────────────────────────────────────────────────────────┤
 * │  ┌──────────────────┐  ┌────────────────────────────────────┐      │
 * │  │  SIDEBAR         │  │  MAIN CONTENT AREA                │      │
 * │  │  (Fixed/Mobile)  │  │  ┌──────────────────────────────┐ │      │
 * │  │  ┌──────────┐    │  │  │  TOP NAVIGATION BAR         │ │      │
 * │  │  │ Logo     │    │  │  │  - Breadcrumb               │ │      │
 * │  │  ├──────────┤    │  │  │  - Notifications            │ │      │
 * │  │  │ Dashboard│    │  │  │  - User Menu                │ │      │
 * │  │  │ Sales    │    │  │  ├──────────────────────────────┤ │      │
 * │  │  │ Inventory│    │  │  │                              │ │      │
 * │  │  │ Wastage  │    │  │  │  Page Content (via Outlet)  │ │      │
 * │  │  │ ...      │    │  │  │  - Dynamic route content    │ │      │
 * │  │  │          │    │  │  │  - Role-specific pages      │ │      │
 * │  │  ├──────────┤    │  │  │  - Charts & data display    │ │      │
 * │  │  │ Logout   │    │  │  │                              │ │      │
 * │  │  └──────────┘    │  │  └──────────────────────────────┘ │      │
 * │  └──────────────────┘  └────────────────────────────────────┘      │
 * └─────────────────────────────────────────────────────────────────────┘
 * 
 * Key Features:
 * 1. Responsive Sidebar Navigation
 *    - Desktop: Always visible, collapsible
 *    - Mobile: Hidden by default, slides in from left
 *    - Smooth animations and transitions
 * 
 * 2. Role-Based Access Control (RBAC)
 *    - Filters menu items based on user role
 *    - Redirects unauthorized access attempts
 *    - 3 roles: Admin, Staff, Customer
 * 
 * 3. Dynamic Page Routing
 *    - Uses React Router Outlet for nested routes
 *    - Pages receive user context via useAuth hook
 *    - Route enforcement prevents unauthorized navigation
 * 
 * 4. User Interface Elements
 *    - Top navigation bar with notifications
 *    - User avatar with role indicator
 *    - Responsive mobile menu button
 *    - Breadcrumb navigation
 * 
 * Data Flow:
 * 1. User logs in → Auth context set → User object with roles
 * 2. DashboardLayout mounted → checks user roles
 * 3. Role-based menu filtering applied
 * 4. Routes enforced → unauthorized routes redirect to /dashboard
 * 5. Page content rendered via Outlet
 * 6. User logout → clear auth context → redirect to login
 * 
 * Integration Points:
 * - useAuth hook: Get current user and logout function
 * - useNavigate: Programmatic navigation
 * - useLocation: Track current route for active menu highlighting
 * - React Router: Nested routing and Outlet
 * 
 * ============================================================================
 */

import { useEffect, useState } from "react";
import { Link, useLocation, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, ShoppingCart, Package, Trash2, FileText, PartyPopper,
  Calendar, DollarSign, Users, Menu, LogOut, ChevronLeft,
  Bell, Shield
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

/**
 * ========== NAVIGATION ITEMS ==========
 * Define all possible menu items across the application.
 * Each item contains:
 * - title: Display text in sidebar
 * - icon: Lucide icon component for visual representation
 * - path: React Router path for navigation
 * 
 * These items are filtered based on user role using roleAccessMap
 * before being displayed in the sidebar.
 * 
 * Adding New Menu Items:
 * 1. Add item to this array
 * 2. Add route to roleAccessMap for appropriate roles
 * 3. Create corresponding page/route in App.tsx
 * 4. Ensure backend API supports the endpoint
 */
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

/**
 * ========== ROLE-BASED ACCESS CONTROL MAP ==========
 * Maps user roles to accessible menu paths.
 * Implements least-privilege principle:
 * - Customers see only basic features
 * - Staff see operational features
 * - Admins see all features
 * 
 * Security Note:
 * - This is UI-level filtering only
 * - Backend API must also enforce access control
 * - Users cannot access restricted data via direct API calls
 * - Each endpoint should verify user role/permissions
 * 
 * Role Hierarchy:
 * 1. Admin: Full access to all features and data
 *    Can access: Dashboard, Sales, Inventory, Wastage, Orders, Analytics, Cashflow, Attendance
 * 
 * 2. Staff: Operational access (no admin/reports)
 *    Can access: Dashboard, Sales, Inventory, Wastage, Party Orders, Cashflow, Attendance
 *    Cannot access: Purchase Orders, Analytics, Admin features
 * 
 * 3. Customer: Limited to customer-facing features
 *    Can access: Dashboard, Sales, Inventory, Party Orders
 *    Cannot access: Wastage, Cashflow, Attendance, Admin features
 * 
 * To Restrict Access:
 * 1. Remove path from roleAccessMap for that role
 * 2. Menu item won't show for that role
 * 3. If user tries URL directly, will redirect to /dashboard
 * 4. Backend endpoint must also forbid the action
 */
const roleAccessMap: Record<string, string[]> = {
  admin: [
    "/dashboard",
    "/dashboard/sales",
    "/dashboard/inventory",
    "/dashboard/wastage",
    "/dashboard/purchase-orders",
    "/dashboard/party-orders",
    "/dashboard/festivals",
    "/dashboard/cashflow",
    "/dashboard/attendance"
  ],
  staff: [
    "/dashboard",
    "/dashboard/sales",
    "/dashboard/inventory",
    "/dashboard/wastage",
    "/dashboard/party-orders",
    "/dashboard/cashflow",
    "/dashboard/attendance"
  ],
  customer: [
    "/dashboard",
    "/dashboard/sales",
    "/dashboard/inventory",
    "/dashboard/party-orders"
  ],
};

const DashboardLayout = () => {
  // ========== STATE & HOOKS ==========
  /**
   * useAuth Hook Explanation:
   * - user: Current authenticated user object
   *   {
   *     id: string (UUID)
   *     name: string (user's full name)
   *     email: string
   *     roles: string[] (array of role strings)
   *   }
   * - logout: Function to clear auth state and remove tokens
   * 
   * Flow on mount:
   * 1. Auth context retrieves user from localStorage/JWT
   * 2. User object hydrated with current session
   * 3. User roles available for access control
   * 4. Component renders with user-specific content
   */
  const { user, logout } = useAuth();
  
  // Navigation hook for programmatic route changes
  const navigate = useNavigate();
  
  // Track sidebar collapse state (desktop only)
  // Desktop: Can collapse sidebar to save space
  // Mobile: Always full-width menu or hidden
  const [collapsed, setCollapsed] = useState(false);
  
  // Track mobile sidebar visibility
  // Mobile: Hidden by default, shown when menu button clicked
  // Desktop: Ignored (always visible)
  const [mobileOpen, setMobileOpen] = useState(false);
  
  // Current location object from React Router
  // Used to highlight active menu item and set page title
  const location = useLocation();

  /**
   * ========== HANDLE LOGOUT ==========
   * Triggered when user clicks logout button
   * 
   * Execution Flow:
   * 1. Call logout() function from useAuth hook
   *    - Clears localStorage auth tokens
   *    - Resets auth context state
   *    - Clears user object
   * 
   * 2. Navigate to '/' (login page)
   *    - replace: true prevents back button returning to dashboard
   *    - User must log in again to access dashboard
   * 
   * Security:
   * - Should also call backend endpoint to invalidate token
   * - Clears all local authentication data
   * - User cannot access dashboard URLs without re-authentication
   */
  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  /**
   * ========== DETERMINE USER ROLE ==========
   * Extracts primary role from user object
   * 
   * Role Check Priority:
   * 1. Check if 'admin' in roles array → return 'admin'
   * 2. Check if 'staff' in roles array → return 'staff'
   * 3. Default to 'customer' if no admin/staff roles
   * 
   * Note: User can have multiple roles, but we pick the
   * highest privilege role for access control.
   * 
   * @returns {string} Primary role ('admin', 'staff', or 'customer')
   */
  const getUserRole = () => {
    if (user?.roles?.includes("admin")) return "admin";
    if (user?.roles?.includes("staff")) return "staff";
    return "customer";
  };

  // Get accessible paths for current user's role
  const userRole = getUserRole();
  const accessiblePaths = roleAccessMap[userRole] || roleAccessMap.customer;
  
  // Filter nav items to only show accessible ones
  // Only items with paths in accessiblePaths will appear in sidebar
  const accessibleNavItems = navItems.filter(item => 
    accessiblePaths.includes(item.path)
  );

  /**
   * ========== ROUTE ENFORCEMENT ==========
   * Effect Hook: Prevent unauthorized route access
   * 
   * Problem:
   * User could manually type restricted URL and access unauthorized page
   * Example: /dashboard/attendance (customer shouldn't access this)
   * 
   * Solution:
   * This effect monitors route changes and:
   * 1. Checks if current path is in user's accessible paths
   * 2. If not authorized → redirect to /dashboard
   * 3. Ensures user stays within their permission scope
   * 
   * Defense Layers:
   * 1. UI: Menu items hidden based on role
   * 2. Routes: Direct URL navigation blocked by this effect
   * 3. Backend: API endpoints verify user permissions
   * 
   * Dependencies:
   * - accessiblePaths: Changes when user role changes
   * - location.pathname: Changes when route changes
   * - navigate: To perform redirect
   */
  useEffect(() => {
    // Check if current route is a dashboard route
    if (location.pathname.startsWith("/dashboard") && 
        // Check if this specific route is not in accessible paths
        !accessiblePaths.includes(location.pathname)) {
      // Redirect to safe dashboard home page
      navigate("/dashboard", { replace: true });
    }
  }, [accessiblePaths, location.pathname, navigate]);

  return (
    <div className="flex min-h-screen w-full bg-background">
      {/* ========== MOBILE OVERLAY BACKDROP ==========
          
          Purpose:
          - Provides dark overlay when mobile sidebar is open
          - Improves mobile UX by dimming background
          - Clicking overlay closes sidebar for easy dismissal
          
          Display:
          - Only shows when mobileOpen is true
          - Hidden on large screens (lg: breakpoint)
          - Has backdrop blur effect for polish
          
          Interaction:
          - Click handler closes mobile menu
          - Prevents accidental clicks on page content behind menu
      */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ========== SIDEBAR NAVIGATION PANEL ==========
          
          Responsive Sidebar with Two Modes:
          
          Desktop Mode (lg breakpoint):
          - Always visible on left side
          - Fixed position, full height
          - Can collapse/expand with button
          - Width: 240px (expanded) or 68px (collapsed)
          
          Mobile Mode:
          - Hidden by default (translate-x-full)
          - Slides in from left when mobileOpen true
          - Full screen width on mobile
          - Dismissible by clicking overlay or menu item
          
          Contents:
          1. Logo section
          2. Navigation menu (filtered by role)
          3. Collapse button (desktop only)
          4. User actions section (logout, switch account)
      */}
      <aside
        className={cn(
          // Base styles
          "fixed top-0 left-0 z-50 h-full bg-sidebar border-r border-sidebar-border flex flex-col transition-all duration-300",
          // Width changes based on collapsed state
          collapsed ? "w-[68px]" : "w-60",
          // Mobile: slide in/out animation
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* ========== LOGO SECTION ========== 
            Top of sidebar with branding
            Changes appearance based on collapsed state
        */}
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

        {/* ========== NAVIGATION MENU ========== 
            Main menu with role-filtered items
            
            Features:
            - Scrollable on overflow
            - Active route highlighting
            - Mobile menu closes on navigation
            - Icons always visible, text hides when collapsed
            
            Active State Styling:
            - Background color change
            - Text color emphasis
            - Font weight bold
            
            Inactive State:
            - Hover highlight effect
            - Icon fades in parent color
            - Smooth transitions
        */}
        <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
          {accessibleNavItems.map((item) => {
            // Check if this is the active route
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                // Close mobile menu when navigating
                onClick={() => setMobileOpen(false)}
                className={cn(
                  // Base styling
                  "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-all duration-200",
                  // Active state: highlighted
                  isActive
                    ? "bg-primary/15 text-primary font-medium"
                    : // Inactive state: normal with hover effect
                      "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                <item.icon className={cn("w-5 h-5 shrink-0", isActive && "text-primary")} />
                {/* Text only visible when sidebar not collapsed */}
                {!collapsed && <span>{item.title}</span>}
              </Link>
            );
          })}
        </nav>

        {/* ========== COLLAPSE TOGGLE BUTTON (DESKTOP ONLY) ========== 
            Allows desktop users to collapse sidebar
            
            Features:
            - Only visible on large screens (hidden lg:flex)
            - Icon rotates when collapsed
            - Smooth transition animation
            - Hidden on mobile (too much UI needed)
        */}
        <div className="hidden lg:flex items-center justify-center py-3 border-t border-sidebar-border">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="text-muted-foreground hover:text-foreground p-1.5 rounded-md hover:bg-sidebar-accent transition-colors"
            title={collapsed ? "Expand" : "Collapse"}
          >
            <ChevronLeft className={cn("w-4 h-4 transition-transform", collapsed && "rotate-180")} />
          </button>
        </div>

        {/* ========== USER ACCOUNT OPTIONS SECTION ========== 
            Bottom of sidebar with user actions
            
            Options:
            1. Switch Account: Allows testing different user roles
            2. Logout: Clear authentication and return to login
            
            Design:
            - Icon always visible
            - Text hidden when sidebar collapsed
            - Styled like nav items for consistency
            - Separate border above for visual grouping
        */}
        <div className="px-2 pb-4 border-t border-sidebar-border pt-3 space-y-2">
          {/* Switch Account Button - For Testing Different Roles */}
          <Link
            to="/login?force=true"
            className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
            title="Switch to different user account"
          >
            <Shield className="w-5 h-5 shrink-0" />
            {!collapsed && <span>Switch Account</span>}
          </Link>
          
          {/* Logout Button - Clear Auth and Exit */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
            title="Logout of application"
          >
            <LogOut className="w-5 h-5 shrink-0" />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* ========== MAIN CONTENT AREA ========== 
          Right side of layout with header and page content
          
          Adjusts left spacing based on sidebar width:
          - Collapsed: ml-[68px] (matches collapsed sidebar)
          - Expanded: ml-60 (matches expanded sidebar)
          - Mobile: Full width (sidebar is overlaid)
          
          Contains:
          1. Top Navigation Bar (sticky)
          2. Main content area (Outlet for pages)
      */}
      <div className={cn(
        "flex-1 flex flex-col transition-all duration-300",
        collapsed ? "lg:ml-[68px]" : "lg:ml-60"
      )}>
        {/* ========== TOP NAVIGATION BAR ========== 
            Header with breadcrumb, notifications, user badge
            
            Sticky Positioning:
            - Stays at top when scrolling page content
            - z-index 30 (below sidebar overlay at z-50)
            
            Contents:
            1. Mobile Menu Button (lg:hidden)
            2. Page Title/Breadcrumb (hidden mobile)
            3. Notifications Icon
            4. User Avatar Badge
            
            Responsive:
            - Mobile: Shows menu button, hides breadcrumb
            - Desktop: Shows breadcrumb, hides menu button
        */}
        <header className="h-16 flex items-center justify-between px-4 lg:px-6 border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-30">
          {/* Mobile Menu Button - Visible on small screens */}
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden text-muted-foreground hover:text-foreground"
            title="Open mobile menu"
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* Page Title/Breadcrumb - Visible on desktop */}
          <div className="hidden lg:block">
            <h2 className="text-sm font-medium text-muted-foreground">
              {accessibleNavItems.find((i) => i.path === location.pathname)?.title || "Dashboard"}
            </h2>
          </div>

          {/* Right Side: Notifications & User Menu */}
          <div className="flex items-center gap-3">
            {/* Notification Bell Icon 
                Shows unread notification indicator (red dot)
                Could be connected to real notification system
            */}
            <button 
              className="relative text-muted-foreground hover:text-foreground p-2 rounded-lg hover:bg-secondary transition-colors"
              title="View notifications"
            >
              <Bell className="w-5 h-5" />
              {/* Red dot shows unread notifications */}
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary" />
            </button>

            {/* User Avatar Badge 
                Displays first letter of user's name
                Tooltip shows role and full name
            */}
            <div 
              className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-sm font-medium text-primary"
              title={`${userRole.charAt(0).toUpperCase() + userRole.slice(1)} User: ${user?.name}`}
            >
              {user?.name?.charAt(0).toUpperCase() || "A"}
            </div>
          </div>
        </header>

        {/* ========== PAGE CONTENT AREA ========== 
            Main content outlet for nested routes
            
            How It Works:
            1. Router defines routes with DashboardLayout as parent
            2. Child routes render their components here
            3. Outlet acts as placeholder for child content
            4. Each page can use hooks like useAuth for user data
            
            Example Route Setup:
            <Route path="/dashboard" element={<DashboardLayout />}>
              <Route path="" element={<Dashboard />} />
              <Route path="sales" element={<Sales />} />
              <Route path="inventory" element={<Inventory />} />
              ... other pages
            </Route>
            
            Page Access to User Data:
            - Pages can import useAuth hook
            - Access current user via const { user } = useAuth()
            - Use user.roles for role-specific rendering
            - Access user.outlet_id for outlet-specific data
        */}
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;

