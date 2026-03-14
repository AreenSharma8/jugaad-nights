# Phase 13 — WhatsApp Notification System

Implement an asynchronous notification layer using Redis-backed queues to provide real-time operational alerts.

---

# Features & Architecture
* **Message Queue (BullMQ):** Ensure notifications do not block the main execution thread. Use Redis to retry failed message deliveries.
* **whatsapp_message_log:** Track every message sent, including `template_name`, `recipient_phone`, and `delivery_status` (Pending/Sent/Delivered/Failed).

---

# Automated Triggers
* **Low Stock Alerts:** Automatically trigger a WhatsApp message to the manager when an item's current stock falls below the `low_stock_threshold`.
* **Daily Sales Summaries:** A nightly cron job that aggregates total sales, wastage, and cash-in-hand per outlet and sends a summary to the owner.