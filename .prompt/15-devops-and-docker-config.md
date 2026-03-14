# Phase 15 — DevOps & Dockerization

Finalize the containerization and environment configuration for deployment.

---

# Docker Configuration
* **Multi-Stage Dockerfile:** Use a build stage (Node + Nest CLI) and a production stage (Node Alpine) to keep image sizes small.
* **docker-compose.yml:** Orchestrate three primary services:
    1.  `backend`: The NestJS API.
    2.  `postgres`: Primary database.
    3.  `redis`: For caching and BullMQ queues.

---

# Environment Management
* **ConfigModule:** Use `@nestjs/config` with a Joi validation schema.
* **Validation:** Ensure the app fails to start if critical variables (e.g., `DB_PASSWORD`, `REDIS_URL`, `PETPOOJA_API_KEY`) are missing.