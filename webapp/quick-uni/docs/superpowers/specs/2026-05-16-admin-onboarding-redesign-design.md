# Specification: Admin Onboarding & Account Issuance Redesign

**Date:** 2026-05-16
**Status:** Draft (Awaiting Review)
**Topic:** Redesign the UX/UI for managing profiles and issuing accounts for Students and Staff using a Session-based Batch approach with Excel integration.

## 1. Executive Summary
The current system handles profile creation and account issuance through separate, manual, or basic bulk workflows. This redesign introduces "Onboarding Sessions" to provide a structured, safe, and efficient way for Admissions and Academic staff to onboard large groups of users (e.g., new student cohorts or monthly staff hires) via Excel.

## 2. Architecture & Data Flow

### 2.1. New Data Model: Onboarding Session
A new table in the `system` schema (or `users` schema) to track batch operations.

**`system.onboarding_session`**
- `id`: UUID (Primary Key)
- `name`: Varchar(255) - User-defined name for the session.
- `entityType`: Enum('student', 'employee')
- `schemaId`: BigInt (FK to `profile_schema`)
- `status`: Enum('draft', 'validating', 'ready', 'processing', 'completed', 'failed')
- `config`: JSONB - Stores configuration like password strategy (CCCD vs Code).
- `summary`: JSONB - Stores counts (total, success, failed) and error logs.
- `createdBy`: UUID (FK to `account`)
- `createdAt`: Timestamp
- `updatedAt`: Timestamp

### 2.2. Updated Models
- `users.profile`: Add an optional `sessionId` (FK to `onboarding_session`) to track which session created the profile.

### 2.3. Workflow Integration
Reuses and extends `src/services/onboarding.ts`:
- **Step 1 (Setup):** Generate a dynamic Excel template based on the `profile_schema_field` associated with the chosen `schemaId`.
- **Step 2 (Validation):** Parse uploaded Excel. Validate against:
    - Data types (defined in `profile_field`).
    - Required fields.
    - Uniqueness (National ID, Student/Employee Code) against existing DB records.
- **Step 3 (Execution):** Orchestrate `createProfileWorkflow` -> `linkProfileToEntity` -> `issueAccountWorkflow` in a loop/batch.

## 3. UI/UX Design (Approach 1: Onboarding Sessions)

### 3.1. Session Dashboard (`/admin/onboarding`)
- A grid/list of recent sessions.
- Visual indicators for progress and health (e.g., "K26 Batch 1: 95% Success, 5 Errors").
- "Create New Session" button to launch the Wizard.

### 3.2. The 3-Step Wizard

#### Step 1: Configuration & Template
- **Inputs:** Session Name, Entity Type, Profile Schema.
- **Action:** `Download Excel Template` button.
- **Template Logic:**
    - Fixed Columns: Full Name, Gender (dropdown), DOB, National ID (CCCD), Address, Ethnic, Religious, Entity Code (MSV/MCB).
    - Dynamic Columns: Labels from `profile_schema_field`.
    - Instructions Sheet: Guide on format (Date formats, valid options).

#### Step 2: Upload & Preview
- **Upload:** Drag-and-drop zone for `.xlsx` files.
- **Data Grid Preview:**
    - High-performance grid (e.g., TanStack Table).
    - **Validation Feedback:** Highlight cells with errors (red) or warnings (yellow).
    - **Inline Editing:** Click to fix minor errors directly in the browser.
    - **Password Fallback:** Visual indicator showing if a record will use CCCD or Code as the default password.

#### Step 3: Execution & Report
- **Real-time Progress:** 3-phase progress bar (Profiles -> Entities -> Accounts).
- **Completion:** Final summary display.
- **Action:** `Download Completion Report` - An Excel file containing the results, usernames, and default passwords for distribution.

## 4. Technical Specifications

### 4.1. Libraries
- `xlsx`: For reading and generating Excel files.
- `sonner`: For real-time toast notifications of progress.
- `lucide-react`: For iconography.

### 4.2. Server Actions (`src/actions/onboarding.ts`)
- `createSession(data)`
- `validateExcel(sessionId, file)`
- `executeSession(sessionId)`
- `getSessionProgress(sessionId)` (using a simplified polling or stream if needed, but for MVP, polling `summary` field is sufficient).

### 4.3. Security & Validation
- Default Password Logic: `profile.nationalId` ?? `entity.code`.
- All batch operations are audited in `system_audit_log`.
- Enforce that a `sessionId` can only be "Executed" once it reaches the `ready` status.

## 5. Success Criteria
- Admin can generate a custom Excel template in < 2 seconds.
- System identifies duplicate National IDs or Codes *before* execution.
- Real-time UI reflects the progress of a 100+ record batch accurately.
- Fallback password logic works correctly for records missing CCCD.

## 6. Implementation Checklist
- [ ] Add `xlsx` dependency.
- [ ] Create DB migration for `onboarding_session` and `profile.sessionId`.
- [ ] Implement Excel generation service.
- [ ] Implement Excel parsing and validation logic.
- [ ] Create Server Actions for Session management.
- [ ] Build the Wizard UI components.
- [ ] Add translations for onboarding terms.
