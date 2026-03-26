# Phase 14 — Analytics & Dashboard Logic

Implement high-performance aggregation services and caching strategies for the operations dashboard.

---

# Requirements & Aggregation
* **Analytics Service:** Calculate KPIs including Daily Revenue, Top 5 Selling Items, Wastage Ratios, and Staff Attendance percentages.
* **Outlet Comparison:** Implement a specific "Admin View" that compares performance metrics across all active outlets.

---

# Caching Strategy
* **Redis Caching:** Use the `dashboard:{outlet_id}:{date}` key pattern.
* **TTL:** Set to 5 minutes to balance data freshness with database performance.

---

# Document Generation
* **ExcelJS:** Generate detailed CSV/XLSX exports for inventory audits and sales history.
* **Puppeteer:** Generate high-fidelity PDF reports for Party Order Quotations and monthly financial settlements.