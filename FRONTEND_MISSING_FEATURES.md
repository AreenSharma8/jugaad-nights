# Frontend Missing Features & Pending Implementation

**Status**: Development Phase  
**Last Updated**: March 14, 2026  
**Priority Levels**: 🔴 Critical | 🟠 High | 🟡 Medium | 🟢 Low

---

## 📋 Overview

This document lists all features that are planned, missing, or pending implementation in the frontend. Each item includes priority, effort estimate, and implementation notes.

---

## ✅ Completed Features

- [x] React 18 + TypeScript setup
- [x] Vite dev server with HMR
- [x] Tailwind CSS + shadcn/ui components
- [x] React Router v6 client-side routing
- [x] AuthContext for state management
- [x] Login page with role selection (admin/manager)
- [x] Protected routes with auth guards
- [x] Dashboard with KPI cards
- [x] 8/9 main pages implemented (Sales, Inventory, Wastage, Party Orders, Attendance, Cashflow, Festivals, Surveys)
- [x] Responsive layout with sidebar navigation
- [x] Progressive rendering with skeleton loaders (7 pages)
- [x] Login redirect fix (March 14, 2026)
- [x] API client with Axios and interceptors
- [x] Toast notifications
- [x] Mobile-responsive design
- [x] Date range filtering
- [x] Outlet selection dropdown
- [x] User logout functionality

---

## 🔴 Critical Priority

### 1. **Purchase Orders Page Implementation**

**Status**: 🔄 Not Started  
**Route**: `/dashboard/purchase-orders`  
**Effort**: 2-3 days  
**Blocker**: Backend PO API may not be complete

**Requirements**:
- [ ] Display list of purchase orders
  - [ ] PO ID, vendor name, amount, date
  - [ ] Status filtering (Draft, Pending, Approved, Received)
  - [ ] Search functionality
- [ ] Create new PO form
  - [ ] Vendor selection
  - [ ] Item selection with quantities
  - [ ] Unit prices and totals
  - [ ] Terms & conditions
  - [ ] Approval routing
- [ ] PO detail view
  - [ ] Full PO details
  - [ ] Receive items against PO
  - [ ] Approval workflow
  - [ ] Cancel/modify options
- [ ] Vendor management
  - [ ] Vendor list and search
  - [ ] Contact information
  - [ ] Payment terms
- [ ] Progressive data loading with skeleton loaders

**Implementation Notes**:
```typescript
// src/pages/PurchaseOrders.tsx
// Skeleton structure already exists, needs completion
// Uses: GET /api/purchase-orders
// Future: POST /api/purchase-orders (create)
// Future: PATCH /api/purchase-orders/:id (update)
```

**API Endpoints Needed**:
- `GET /api/purchase-orders` - List all POs
- `GET /api/purchase-orders/:id` - PO details
- `POST /api/purchase-orders` - Create PO
- `PATCH /api/purchase-orders/:id` - Update PO
- `POST /api/purchase-orders/:id/receive` - Receive items
- `GET /api/vendors` - Vendor list
- `GET /api/purchase-orders/my-approvals` - Pending approvals

---

### 2. **React Router v6 Deprecation Warnings**

**Status**: 🔄 In Progress  
**Severity**: Warning (Non-blocking)  
**Effort**: 2-3 hours

**Issue**: Console shows two future flag warnings:
- `v7_startTransition`
- `v7_relativeSplatPath`

**Solution Required**:
- [ ] Add future flags to React Router configuration
- [ ] Update router setup in `src/App.tsx` or router config
- [ ] Test compatibility with current routes
- [ ] Verify no breaking changes

**Implementation Example**:
```typescript
const router = createBrowserRouter(routes, {
  future: {
    v7_startTransition: true,
    v7_relativeSplatPath: true,
  }
});
```

---

### 3. **Offline Functionality**

**Status**: 🔴 Not Started  
**Effort**: 4-5 days  
**Critical For**: Mobile users and unstable connections

**Requirements**:
- [ ] Service Worker setup
- [ ] Cache API data strategy
  - [ ] Cache-first for read-only data
  - [ ] Network-first for real-time data
- [ ] Offline indicators
  - [ ] Connection status in header
  - [ ] Offline banner when disconnected
- [ ] Queue writes when offline
  - [ ] Store failed requests
  - [ ] Retry when online
  - [ ] Conflict resolution
- [ ] Sync when connection restored
- [ ] Clear data option for users

**Implementation Notes**:
```typescript
// Workbox or native Service Worker
// Offline-first strategy for reports
// Queue for form submissions
// IndexedDB for larger datasets
```

---

### 4. **Form Validation & Error States**

**Status**: 🟠 Partial  
**Effort**: 1-2 days  
**Affects**: All form-based pages

**What's Missing**:
- [ ] Login form validation (email format, password length)
- [ ] Real-time field validation feedback
- [ ] Form-level vs field-level error handling
- [ ] Success confirmations for updates

**Pages Needing Validation**:
- [ ] Login page (email, password)
- [ ] Wastage entry form
- [ ] Party order forms
- [ ] Inventory adjustments
- [ ] Festival setup forms

**Implementation**:
```typescript
// Use react-hook-form + zod for validation
// Real-time validation on blur
// Show error messages inline
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});
```

---

## 🟠 High Priority

### 5. **User Profile & Settings Page**

**Status**: 🔄 Not Started  
**Route**: `/dashboard/profile` or `/dashboard/settings`  
**Effort**: 1-2 days

**Features**:
- [ ] User profile view
  - [ ] Name, email, contact
  - [ ] Profile picture/avatar
  - [ ] Role and outlet assignments
- [ ] Change password form
- [ ] Profile settings
  - [ ] Notification preferences
  - [ ] Language/timezone preferences
  - [ ] Data export options
- [ ] Activity log
  - [ ] Login history
  - [ ] API activity
  - [ ] Data changes

**Implementation**:
```typescript
// src/pages/Profile.tsx
// src/pages/Settings.tsx
// Call: GET /api/users/me
// Call: PATCH /api/users/me
```

---

### 6. **Advanced Filtering & Search**

**Status**: 🟠 Partial  
**Effort**: 2-3 days  
**Affects**: Sales, Inventory, Wastage, Party Orders, Attendance

**Missing Features**:
- [ ] Advanced filter UI component
  - [ ] Date range picker
  - [ ] Multi-select filters
  - [ ] Numeric range filters
- [ ] Search by multiple fields
- [ ] Save filter presets
- [ ] Filter combinations and logic (AND/OR)
- [ ] Filter by tags/categories

**Example Implementation**:
```typescript
// Advanced filter for Sales
const [filters, setFilters] = useState({
  dateRange: [startDate, endDate],
  salesType: ['online', 'offline'],
  priceRange: [min, max],
  status: 'completed'
});
```

---

### 7. **Data Export Functionality**

**Status**: 🔄 Not Started  
**Effort**: 2-3 days  
**Affects**: All data pages

**Export Formats**:
- [ ] CSV export for all data tables
- [ ] PDF reports with branding
  - [ ] Daily sales summary
  - [ ] Monthly inventory report
  - [ ] Attendance register
  - [ ] Cashflow statement
- [ ] Excel export with formatting
  - [ ] Multiple sheets
  - [ ] Formulas & formatting
  - [ ] Charts embedded

**Implementation**:
```typescript
// Use ExcelJS for Excel
// Use Puppeteer for PDF
// Native CSV via blob & download
import ExcelJS from 'exceljs';

const exportToExcel = async (data) => {
  const workbook = new ExcelJS.Workbook();
  // Create sheets and format
  await workbook.xlsx.writeFile('report.xlsx');
};
```

---

### 8. **Charts & Data Visualization**

**Status**: 🟡 Partial  
**Effort**: 2-3 days  
**Affects**: Dashboard, Sales, Festivals, Analytics

**Missing Visualizations**:
- [ ] Sales trend charts
  - [ ] Line chart: Sales over time
  - [ ] Bar chart: Online vs Offline
  - [ ] Pie chart: Sales by category
- [ ] Inventory charts
  - [ ] Stock level trends
  - [ ] Item turnover rates
  - [ ] Reorder point indicators
- [ ] Wastage analysis charts
  - [ ] Wastage by reason (pie)
  - [ ] Wastage trends (line)
  - [ ] Cost impact (bar)
- [ ] Cashflow charts
  - [ ] Daily cash position
  - [ ] Inflow/Outflow comparison
  - [ ] Running balance
- [ ] Attendance charts
  - [ ] Attendance percentage pie
  - [ ] Absence patterns heatmap

**Library**: 
```typescript
// Use Recharts or Chart.js
// Or Plotly.js for advanced charts
import { LineChart, Line, XAxis, YAxis } from 'recharts';
```

---

### 9. **Notifications & Alerts System**

**Status**: 🔄 Not Started  
**Effort**: 2-3 days

**Features**:
- [ ] In-app notifications panel
  - [ ] Real-time updates via WebSocket
  - [ ] Notification center UI
  - [ ] Mark as read/unread
- [ ] Alert types
  - [ ] Low stock alerts
  - [ ] High wastage alerts
  - [ ] Unusual sales patterns
  - [ ] Approval notifications
- [ ] Notification preferences
  - [ ] Enable/disable alerts
  - [ ] Email notifications
  - [ ] SMS notifications (future)
- [ ] Sound/visual indicators

**Implementation**:
```typescript
// WebSocket connection
// Server-sent events (SSE)
// Redux or Zustand for notifications store
```

---

### 10. **Print Functionality**

**Status**: 🔴 Not Started  
**Effort**: 1 day  
**Affects**: Bills, Invoices, Reports

**Features**:
- [ ] Print invoices/bills
  - [ ] Formatted bill layout
  - [ ] Item details
  - [ ] Amounts and taxes
  - [ ] GST/payment info
- [ ] Print reports
  - [ ] Daily summaries
  - [ ] Attendance register
  - [ ] Inventory reports
- [ ] Print settings
  - [ ] Printer selection
  - [ ] Page orientation
  - [ ] Margins

**Implementation**:
```typescript
// Use window.print()
// Or generate PDF via Puppeteer
const handlePrint = () => {
  window.print();
};
```

---

## 🟡 Medium Priority

### 11. **Real-time Updates & Live Data**

**Status**: 🔄 Not Started  
**Effort**: 2-3 days  
**Tech**: WebSocket or Server-Sent Events

**Features**:
- [ ] Live dashboard updates
  - [ ] Real-time sales counter
  - [ ] Live cash position
  - [ ] New order notifications
- [ ] Live inventory updates
  - [ ] Stock changes from other terminals
  - [ ] Real-time reorder alerts
- [ ] Live attendance
  - [ ] Check-in/out notifications
  - [ ] Real-time presence indicator

**Implementation**:
```typescript
// Socket.io or native WebSocket
// Subscribe to relevant channels
// Update React state on message
import io from 'socket.io-client';

const socket = io('http://localhost:3000');
socket.on('sales:new', (data) => {
  setSalesData(prev => [data, ...prev]);
});
```

---

### 12. **Multi-language Support (i18n)**

**Status**: 🔄 Not Started  
**Effort**: 2-3 days  
**Languages**: English (default), Hindi (planned)

**Requirements**:
- [ ] Setup i18n library (react-i18next)
- [ ] Create translation files
  - [ ] English (en.json)
  - [ ] Hindi (hi.json)
  - [ ] Regional languages (future)
- [ ] Language selector in settings
- [ ] Date/currency formatting by locale
- [ ] Right-to-left (RTL) support for future

**Implementation**:
```typescript
import { useTranslation } from 'react-i18next';

export const MyComponent = () => {
  const { t, i18n } = useTranslation();
  
  return <h1>{t('dashboard.title')}</h1>;
};
```

---

### 13. **Theme Support (Dark Mode)**

**Status**: 🔄 Not Started  
**Effort**: 1-2 days

**Features**:
- [ ] Dark/Light theme toggle
- [ ] System preference detection
- [ ] Theme persistence in localStorage
- [ ] Smooth transitions

**Implementation**:
```typescript
// Use Tailwind dark mode
// shadcn/ui already supports theming
// Add theme provider wrapper
<ThemeProvider storageKey="theme">
  <App />
</ThemeProvider>
```

---

### 14. **Audit Trail & Activity Logs**

**Status**: 🔄 Not Started  
**Effort**: 2 days  
**Affects**: Data modifications

**Features**:
- [ ] View activity logs
- [ ] Filter by user/date/action
- [ ] See what changed (before/after)
- [ ] Undo functionality (future)
- [ ] Export audit reports

**Implementation**:
```typescript
// GET /api/audit-logs
// Show in modal or separate page
// Filter and export capability
```

---

### 15. **Bulk Operations**

**Status**: 🔄 Not Started  
**Effort**: 2 days  
**Affects**: Inventory, Sales, Attendance

**Features**:
- [ ] Checkbox multi-select
- [ ] Bulk update operations
  - [ ] Bulk mark attendance
  - [ ] Bulk inventory adjustments
  - [ ] Bulk delete with confirmation
- [ ] Confirm before bulk action

**Implementation**:
```typescript
// Add checkboxes to table rows
// Show bulk action toolbar when selected
// POST /api/bulk/action with IDs array
```

---

### 16. **Import Data Functionality**

**Status**: 🔄 Not Started  
**Effort**: 2-3 days  
**Affects**: Inventory, Party Orders, Employee data

**Features**:
- [ ] CSV file upload
- [ ] Data validation before import
- [ ] Progress indicator
- [ ] Error report generation
- [ ] Mapping field selection
- [ ] Dry-run before actual import

**Implementation**:
```typescript
import Papa from 'papaparse';

const handleCSVUpload = (file) => {
  Papa.parse(file, {
    header: true,
    complete: (results) => {
      // Validate and import
    }
  });
};
```

---

## 🟢 Low Priority

### 17. **Analytics & Insights Dashboard**

**Status**: 🔄 Not Started  
**Effort**: 3-5 days  
**Route**: `/dashboard/analytics`

**Features**:
- [ ] KPI trends over time
- [ ] Predictive insights
  - [ ] Sales forecasting
  - [ ] Wastage patterns
  - [ ] Inventory optimization
- [ ] Benchmarking
  - [ ] Compare outlets
  - [ ] Compare with industry averages
- [ ] Custom dashboards
  - [ ] Drag-drop widgets
  - [ ] Save layouts

---

### 18. **Mobile App (Native)**

**Status**: 🔰 Planned (Future)  
**Effort**: 4-6 weeks  
**Tech**: React Native or Flutter

**Core Features for Mobile**:
- [ ] Offline data access
- [ ] Quick check-in/checkout
- [ ] Mobile-optimized dashboards
- [ ] Camera integration (inventory photos)
- [ ] Biometric authentication
- [ ] Push notifications

---

### 19. **Advanced Reporting System**

**Status**: 🔄 Not Started  
**Effort**: 3-4 days

**Features**:
- [ ] Custom report builder
- [ ] Scheduled report generation
- [ ] Report distribution via email
- [ ] Report templates
- [ ] Interactive drill-down

---

### 20. **Help & Documentation**

**Status**: 🟡 Partial  
**Effort**: 2-3 days

**What's Needed**:
- [ ] In-app help tooltips
- [ ] Contextual documentation
- [ ] Video tutorials (future)
- [ ] FAQ section
- [ ] User guides per module

---

## 📊 Implementation Roadmap

### Phase 1 (Week 1-2) - Critical Path
1. ✅ Purchase Orders page completion
2. ✅ Form validation system
3. ✅ React Router deprecation warnings
4. ✅ Print functionality

### Phase 2 (Week 3-4) - Core Features
5. Advanced filtering & search
6. User profile & settings
7. Data export (CSV, Excel, PDF)
8. Charts & visualizations

### Phase 3 (Week 5-6) - Enhancement
9. Real-time updates (WebSocket)
10. Notifications system
11. Activity logs & audit trail
12. Bulk operations

### Phase 4 (Week 7-8) - Polish
13. i18n (Multi-language)
14. Dark mode support
15. Import data functionality
16. Mobile responsiveness polish

### Phase 5 (Future)
17. Analytics dashboard
18. Native mobile app (React Native)
19. Advanced reporting
20. Help system

---

## 🔍 Known Issues

### 1. **React Router Deprecation Warnings**
- **Status**: Minor warning
- **Impact**: No functional impact, but warnings in console
- **Fix**: Add future flags to router config

### 2. **Slow API Responses**
- **Status**: Depends on backend
- **Impact**: Skeleton loaders help perception, but actual data load time depends on API
- **Mitigation**: Implement caching, pagination, lazy loading

### 3. **No Form Validation**
- **Status**: May allow invalid submissions
- **Impact**: Backend returns 400 errors
- **Fix**: Implement client-side validation

---

## 💡 Implementation Guidelines

### Code Style
- Use TypeScript for type safety
- Follow existing component patterns
- Use shadcn/ui for UI consistency
- Implement error boundaries for new features

### Performance
- Use React.memo for expensive components
- Implement lazy loading with React.lazy
- Use suspense for async components
- Profile with React DevTools

### Testing
- Write unit tests for utilities
- Write integration tests for pages
- Test with real API if possible
- Test mobile responsiveness

### Documentation
- Add JSDoc comments for functions
- Document component props
- Include usage examples
- Update this file when adding features

---

## 📝 Submission Checklist

Before marking a feature complete:
- [ ] All requirements implemented
- [ ] No console errors or warnings
- [ ] Mobile responsive tested
- [ ] Form validation working
- [ ] API integration tested
- [ ] Error states handled
- [ ] Loading states shown (skeleton loaders)
- [ ] Accessibility checks done
- [ ] Code reviewed
- [ ] Unit tests written
- [ ] Documentation updated
- [ ] Feature tested in production build

---

**Last Updated**: March 14, 2026  
**Total Critical Items**: 5  
**Total High Priority Items**: 6  
**Total Medium Priority Items**: 5  
**Total Low Priority Items**: 4  
**Total Estimated Effort**: 12-15 weeks
