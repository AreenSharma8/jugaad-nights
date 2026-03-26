# Phase 2 — Users Module

Implement **Users Module**.

---

# Features

User management  
Role assignment  
Outlet assignment

---

# Database Tables

users  
roles  
permissions  
user_roles

---

# Implement

Entity models  
DTOs  
Service  
Controller  
Repository  

---

# Endpoints

GET /users  
POST /users  
GET /users/:id  
PATCH /users/:id  

---

# Validation

Use class-validator.

---

# Security

Implement RBAC checks.

---

# Automated Test

Write Jest + Supertest tests.

Test:

Create user  
Fetch users  
Update user  

Ensure API returns:

{
status: "success"
}