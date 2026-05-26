# System Seeder Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the system data seeder to initialize basic roles, an admin account, and a standard profile schema.

**Architecture:** A modular seeder function `seedSystem` that uses Drizzle ORM to insert default system data into the database.

**Tech Stack:** Drizzle ORM, PostgreSQL, bcryptjs, TypeScript.

---

### Task 1: Create System Seeder

**Files:**
- Create: `src/db/seeders/system.ts`

- [x] **Step 1: Implement seedSystem function**
- [x] **Step 2: Verify compilation**
- [x] **Step 3: Commit**
