# Design Spec: Department Management Module

**Date:** 2026-05-25  
**Status:** Draft  
**Topic:** Master-Detail Department & Major Management  

## 1. Overview
The Department Management module provides a central hub for the Academic Office to organize the university's academic structure. It uses a Master-Detail layout to manage Departments, their constituent Majors, and assigned Staff (Employees) in one place.

## 2. Goals
- Streamline academic organization management.
- Provide a unified view of Department-related data (Majors, Personnel).
- Ensure easy navigation using URL-based state management.

## 3. Architecture

### 3.1 State Management
- **Selected Department**: Managed via `?id=<uuid>` in the URL.
- **Tabs**: Managed via `?tab=<name>` or local state within the detail view.

### 3.2 Data Flow
- **Server Component**: Fetches the list of all Departments for the Master column.
- **Client Component**:
    - Listens to URL changes to fetch detail data via Server Actions.
    - Manages Dialogs for creating Departments, Majors, and assigning Staff.
- **Server Actions (`src/actions/academic.ts`)**:
    - `getDepartments()`: List all.
    - `getDepartmentDetails(id)`: Detailed object including `majors` and `employments` (joined with `employee` and `profile`).
    - `upsertDepartment(data)`: Create or Update.
    - `upsertMajor(data)`: Create or Update a major within a department.
    - `assignStaff(data)`: Link an employee to a department.

## 4. UI Design

### 4.1 Master Column (Left)
- Search bar for departments.
- Vertical list of Department Cards (Code, Name).
- "Add Department" button at the bottom or top.

### 4.2 Detail Column (Right)
Displayed when a department is selected.
- **Header**: Department Name and Actions (Edit/Delete).
- **Tabs**:
    1.  **Majors**: `DataTable` showing Major Code and Description. Action to Add/Edit Major.
    2.  **Personnel**: `DataTable` showing Staff Name, Code, and Role (from `department_employment`). Action to "Assign Staff".
    3.  **About**: Form to edit department metadata.

### 4.3 Dialogs
- `DepartmentForm`: Fields for Code, Name, Description.
- `MajorForm`: Fields for Code, Description (links to current Department).
- `StaffAssignmentForm`: Select an Employee (Combobox) and specify Role/Assign Date.

## 5. Implementation Strategy
1.  Implement Server Actions for Department/Major CRUD.
2.  Create the skeleton for the Master-Detail page.
3.  Implement the Master list component.
4.  Implement the Detail view with Tabs.
5.  Implement Assignment logic and Dialogs.

## 6. Testing Plan
- **Integrity**: Verify that deleting a department handles or prevents orphan majors/employments.
- **UI**: Ensure the URL params correctly restore the selected department on page refresh.
- **Performance**: Verify that the detail view fetches efficiently when switching between departments.
