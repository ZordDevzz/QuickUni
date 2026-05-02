# Publish Template to Schedule Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the logic to publish weekly class templates to the actual schedule for a specific semester, respecting holidays and semester dates.

**Architecture:** A server action that retrieves semester dates, holiday dates, and weekly templates, then iterates through each day of the semester to create schedule entries.

**Tech Stack:** Drizzle ORM, Next.js Server Actions, Vitest.

---

### Task 1: Setup Test Environment

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Add test script to package.json**

- [ ] **Step 2: Run test command**

Run: `npx vitest run` (or `npm test` if script added)

- [ ] **Step 3: Commit**

### Task 2: Implement Publish Logic with TDD

**Files:**
- Create: `src/actions/schedule-publish.ts`
- Create: `src/actions/schedule-publish.test.ts`

- [ ] **Step 1: Write failing test for publish logic**
- [ ] **Step 2: Implement publishTemplateToSchedule**
- [ ] **Step 3: Verify with tests**
- [ ] **Step 4: Commit**
