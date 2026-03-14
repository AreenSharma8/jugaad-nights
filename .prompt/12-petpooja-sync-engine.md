# Phase 12 — PetPooja Sync Engine

Implement a robust, idempotent synchronization engine to pull real-time operational data from PetPooja POS.

---

# Data Persistence & Auditing
* **petpooja_sync_log:** Create a table to track `sync_type` (Order/Inventory/Menu), `status` (Success/Fail), `records_synced`, and `error_trace`.
* **JSONB Storage:** Store the raw API payload from PetPooja in a `raw_response` column before processing to allow for historical debugging.

---

# Idempotency & Reliability
* **Order Deduplication:** Implement a check against `remote_order_id` (from PetPooja) to prevent duplicate revenue logging in the `orders` table.
* **BullMQ Integration:** Offload sync tasks to background workers to prevent long-running HTTP requests from timing out.

---

# Polling Schedules (Cron)
* **Orders Sync:** Every 5 minutes.
* **Inventory Sync:** Every 30 minutes.
* **Menu/Catalog Sync:** Every hour.