# Phase 1 — Backend Core Architecture

You are a **Senior Backend Architect**.

Create the **initial backend architecture for the Jugaad Nights Operations App**.

---

# Tasks

Create the base NestJS project structure.

Implement:

src
modules
integrations
database
common
config

Create folders for modules:

users
outlets
sales
inventory
wastage
party-orders
attendance
cashflow
analytics
reports
notifications

---

# Implement

Core utilities:

Global response interceptor  
Global exception filter  
Validation pipes  
Logging middleware  

---

# Database Setup

Configure PostgreSQL connection.

Use TypeORM.

Enable migrations.

---

# Redis Setup

Configure Redis connection.

Create Redis service.

---

# Swagger

Enable Swagger documentation.

---

# Output Required

Generate:

Folder structure  
App module  
Database configuration  
Redis configuration  
Global middleware  

---

# Automated Test

Create Jest test:

Test if:

Application bootstraps correctly  
Database connection works  
Redis connection works

Command:
npm run test