# Phase 11 — Common Infrastructure & Utilities

Implement the core `common` directory to ensure system-wide consistency, standardized API responses, and multi-outlet data integrity.

---

# Global Response Handling
Implement decorators and filters to ensure the mobile/web frontend receives predictable JSON structures.

* **TransformInterceptor:** A global interceptor to wrap all successful responses.
    * **Format:** `{ "status": "success", "data": T, "timestamp": "ISO-8601" }`
* **GlobalExceptionFilter:** A central filter to catch `HttpException` and internal system errors.
    * **Format:** `{ "status": "error", "message": string, "code": string, "timestamp": "ISO-8601" }`

---

# Multi-Outlet Isolation
Enforce strict data boundaries to ensure managers from "Outlet A" cannot view "Outlet B" data.

* **AbstractEntity:** A base class for all TypeORM entities.
    * **Columns:** `outlet_id` (UUID), `created_at`, `updated_at`, `created_by`, `updated_by`, and `deleted_at` (Soft Delete).
* **MultiOutletGuard:** A guard that extracts the `outlet_id` from the request header or user token and injects it into the request object for use in service-level queries.

---

# Security & Validation
* **Bcrypt Service:** A dedicated utility for hashing and comparing passwords for the Users Module.
* **ThrottlerModule:** Configure global rate limiting to protect endpoints from brute-force or DDoS attempts.
* **ValidationPipe:** Enable globally with `transform: true` to automatically convert plain DTO objects into class instances.