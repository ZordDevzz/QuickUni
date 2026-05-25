# Design Spec: People Management Module (Teachers & Students)

**Date:** 2026-05-25  
**Status:** Draft  
**Topic:** Unified People CRUD with Dynamic Profiles  

## 1. Overview
The People Management module allows the Academic Office to manage university personnel (Teachers/Employees) and students. It integrates the core định danh (Profile) with role-specific entities (Employee, Student) using a "Merged Form" approach and dynamic profile schemas.

## 2. Goals
- Provide a unified interface for creating and managing students and teachers.
- Support dynamic fields via "Default Profile Schemas" for each entity type.
- Ensure data integrity between `profile` and its related `employee` or `student` entity.

## 3. Architecture

### 3.1 Settings Configuration
Store default schema assignments in `system.system_setting`:
- `DEFAULT_EMPLOYEE_SCHEMA_ID`: ID of the schema used for new teachers.
- `DEFAULT_STUDENT_SCHEMA_ID`: ID of the schema used for new students.

### 3.2 Data Flow (Merged Creation)
When creating a person:
1.  **Frontend**: Fetches the default schema and its fields.
2.  **Form**: Renders fixed fields (Code, Full Name, Gender, DOB, National ID) and dynamic fields (from JSONB).
3.  **Server Action**:
    - Validates fixed fields using a static Zod schema.
    - Validates dynamic fields using the schema definition.
    - Executes a transaction to insert into `users.profile` first, then `users.employee` (or `users.student`).

### 3.3 Server Actions (`src/actions/people.ts`)
- `getPeople(type: 'employee' | 'student')`: Returns joined data (entity + profile).
- `createPerson(type, data)`: Unified transaction for creation.
- `updatePerson(type, id, data)`: Unified transaction for updates.
- `deletePerson(type, id)`: Soft-deletes both the entity and the profile.

## 4. UI Design

### 4.1 Routes
- `/academic/people/teachers`: Teacher management.
- `/academic/people/students`: Student management.

### 4.2 Components
- `PeopleClient.tsx`: Generic wrapper for the data table and dialog.
- `PersonForm.tsx`: Shared form component that handles both fixed and dynamic fields.
- `PeopleColumns.tsx`: Column definitions for the DataTable.

### 4.3 Form Structure
- **Section 1: Identity (Fixed)**
  - Code (Employee ID / Student ID)
  - Full Name
  - Gender (Enum)
  - Date of Birth
  - National ID
- **Section 2: Additional Info (Dynamic)**
  - Fields rendered based on the `profile_schema_field` configuration.

## 5. Implementation Strategy
1.  Extend `system_setting` with default schema keys (or use a migration/seed).
2.  Implement unified server actions in `src/actions/people.ts`.
3.  Create the `PersonForm` with dynamic rendering logic.
4.  Build the Teacher management page.
5.  Build the Student management page.

## 6. Testing Plan
- **Integration**: Verify that `createPerson` correctly creates both records in a transaction.
- **UI**: Ensure dynamic fields match the selected schema and are correctly saved to `dynamic_data`.
- **Validation**: Test unique constraints (Code, National ID).
