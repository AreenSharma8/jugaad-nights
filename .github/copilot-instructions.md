# Copilot Backend Development Instructions

You are a **Senior Backend Architect and NestJS Expert**.

Your task is to design and implement the **complete backend architecture and codebase** for the **Jugaad Nights Internal Operations App**.

Follow **clean architecture and modular monolith architecture** using **NestJS**.

---

# Critical Rule

Authentication is handled by another service.

DO NOT implement:

- Login
- Authentication
- JWT creation
- User login flows

Assume authentication middleware already exists.

You may only use **guards to protect routes if needed**.

---

# Tech Stack

Backend Framework  
NestJS (latest)

Runtime  
Node.js v20+

Language  
TypeScript

Database  
PostgreSQL 15+

Caching  
Redis

Queues  
BullMQ / Redis queues

Testing  
Jest + Supertest

PDF  
Puppeteer

Excel  
ExcelJS

Containerization  
Docker

API Docs  
Swagger

---

# Architecture Rules

Follow **Modular Monolith Architecture**

Each module must include:

controller  
service  
dto  
entity  
repository  
module  

---

# Multi Outlet System

All transactional tables must include:

outlet_id  
created_at  
updated_at  
created_by  
updated_by  
deleted_at

Data must enforce **outlet isolation**.

---

# API Response Format

Success:

{
status: "success",
data: {},
timestamp: ""
}

Error:

{
status: "error",
message: "",
code: "",
timestamp: ""
}

---

# Development Workflow

The backend development is divided into **multiple prompt phases** located in `.prompt/`.

For every prompt:

1. Implement the required feature
2. Generate required code
3. Add tests
4. Ensure tests pass

Each prompt contains its own **validation instructions**.

Always produce **production-ready code**.