# Scheduling Workflow Diagrams Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a Mermaid-based swimlane flowchart illustrating the interactions between different Actors in the Scheduling system.

**Architecture:** Use Mermaid's `flowchart TD` syntax with `subgraph` blocks to represent four distinct swimlanes (Academic Admin, Instructor, QuickUni System, Student). Data flow is represented by directed edges connecting these swimlanes.

**Tech Stack:** Mermaid.js, Markdown.

---

### Task 1: Setup Diagrams Directory

**Files:**
- Create: `docs/diagrams/.gitkeep` (to ensure the directory exists and is tracked)

- [ ] **Step 1: Create the diagrams directory**

Run: `mkdir docs/diagrams`

- [ ] **Step 2: Add a .gitkeep file**

Run: `echo "" > docs/diagrams/.gitkeep`

- [ ] **Step 3: Commit**

```bash
git add docs/diagrams/.gitkeep
git commit -m "chore: setup docs/diagrams directory"
```

---

### Task 2: Implement Scheduling Workflow Diagram

**Files:**
- Create: `docs/diagrams/scheduling-actors-workflow.md`

- [ ] **Step 1: Create the Mermaid diagram file**

Write the following content to `docs/diagrams/scheduling-actors-workflow.md`:

```markdown
# Sơ đồ Luồng hệ thống Scheduling (Swimlane Flowchart)

```mermaid
flowchart TD
    %% Define Subgraphs for Actors
    subgraph Admin ["Academic Admin (Quản lý đào tạo)"]
        direction TB
        A1[Tạo Học kỳ - Semester]
        A2[Import/Tạo Courses, Classes, Rooms]
        A3[Quản lý Holidays]
        A4[Kích hoạt Auto-Generate]
        A5[Review Draft Schedule]
        A6[Điều chỉnh Manual - Drag/Drop]
        A7[Publish Lịch học]
    end

    subgraph Inst ["Instructor (Giảng viên)"]
        direction TB
        I1[Cập nhật Availability]
        I2[Đăng ký Blacklists]
        I3[Xem Lịch cá nhân]
    end

    subgraph Sys ["QuickUni System (Xử lý lõi)"]
        direction TB
        S1[Lưu trữ cấu trúc Học kỳ]
        S2[Tính toán Bitmask 15-bit]
        S3[Backtracking Solver]
        S4[Tạo Draft Schedule]
        S5[Validate Manual Changes]
    end

    subgraph Stud ["Student (Sinh viên)"]
        direction TB
        ST1[Xem Lịch học cá nhân]
    end

    %% Define Flow / Transitions
    A1 --> S1
    A2 --> S1
    I1 --> S2
    I2 --> S2
    A3 --> S2
    A4 --> S3
    S2 --> S3
    S1 --> S3
    S3 --> S4
    S4 --> A5
    A5 --> A6
    A6 --> S5
    S5 -- Valid --> A7
    S5 -- Invalid --> A6
    A7 --> I3
    A7 --> ST1

    %% Styling
    classDef admin fill:#f9f,stroke:#333,stroke-width:2px;
    classDef inst fill:#bbf,stroke:#333,stroke-width:2px;
    classDef sys fill:#dfd,stroke:#333,stroke-width:2px;
    classDef stud fill:#fdb,stroke:#333,stroke-width:2px;

    class A1,A2,A3,A4,A5,A6,A7 admin;
    class I1,I2,I3 inst;
    class S1,S2,S3,S4,S5 sys;
    class ST1 stud;
```
```

- [ ] **Step 2: Verify file creation**

Run: `ls docs/diagrams/scheduling-actors-workflow.md`
Expected: File exists.

- [ ] **Step 3: Commit**

```bash
git add docs/diagrams/scheduling-actors-workflow.md
git commit -m "docs: add scheduling actors workflow diagram"
```
