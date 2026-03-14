# Phase 4 — Sales Module

Implement sales ingestion and analytics.

---

# Tables

orders  
order_items  
payments

---

# Features

Order ingestion  
Revenue calculations  
Sales analytics

---

# Endpoints

GET /sales  
GET /sales/trends

---

# Redis Cache

Cache dashboard metrics.

TTL = 5 minutes.

Cache key:

dashboard:{outlet_id}:{date}

---

# Automated Test

Test:

Insert orders  
Fetch sales  
Validate revenue totals