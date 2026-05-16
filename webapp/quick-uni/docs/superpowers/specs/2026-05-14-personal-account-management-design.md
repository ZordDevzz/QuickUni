# Specification: Personal Account Management System

**Date:** 2026-05-14
**Status:** Draft (Awaiting Review)
**Topic:** Allow users to manage their own profiles, security settings, and UI preferences.

## 1. Executive Summary
The Personal Account Management system will provide a centralized interface for users to update their information, manage security, and personalize their experience in QuickUni. It leverages the existing Dynamic Profile system to ensure consistency across user types (Students, Employees, etc.).

## 2. Architecture & Data Flow
- **Route:** `/account` (localized as `/[locale]/account`)
- **Backend:**
    - New Server Actions in `src/actions/account.ts`.
    - Workflows in `src/services/account.ts` (if needed) or reusing `src/services/profile.ts` and `src/services/user.ts`.
- **Frontend:**
    - A multi-tab layout using Radix UI / Shadcn `Tabs`.
    - Form handling with `react-hook-form` and `zod` for validation.

## 3. Features & UI Components

### 3.1. General Layout
- Sidebar or top-level tabs for navigation within the account page.
- Responsive design for mobile access.

### 3.2. Tab 1: Personal Profile
- **Logic:**
    - Fetch user's `account` and associated `profile`.
    - Fetch the `profile_schema` and `profile_schema_field`s linked to the user's account type.
- **UI:**
    - Group fields by `ui_section` (e.g., "Basic Information", "Contact Details").
    - Each section is rendered in a `Card`.
- **Field Permissions (Logic B):**
    - All fields are editable by default.
    - **Exceptions (Read-only):** Admin-defined identity fields like "Student ID" (MSV), "Employee ID", or "Position". These will be identified by field codes or a new attribute if necessary (for now, hardcoded list of protected codes: `msv`, `employee_id`, `username`).

### 3.3. Tab 2: Security
- **Change Password Form:**
    - Fields: `currentPassword`, `newPassword`, `confirmPassword`.
    - Validation: `newPassword` must be at least 8 characters and match `confirmPassword`.
- **Account Info:**
    - Display current `username` and `email` (read-only for security, or editable with re-authentication).

### 3.4. Tab 3: Preferences
- **Theme Selection:**
    - Toggle between Light, Dark, and System modes using `next-themes`.
- **Language Selection:**
    - Switch between Vietnamese and English using `next-intl`.

## 4. Technical Specifications

### 4.1. Data Models
- Reuses `account` (from `src/db/schemas/auth.ts`) and `profile` (from `src/db/schemas/user.ts`).

### 4.2. Server Actions (`src/actions/account.ts`)
- `updatePersonalProfile(data: any)`: Updates the `dynamic_data` in the `profile` table for the logged-in user.
- `changePassword(current: string, next: string)`: Verifies current password and updates to new hash.
- `updatePreferences(prefs: any)`: Stores user preferences (can be local storage or saved to a new `user_preferences` table if persistence across devices is required - *Decision: Local storage + cookies for now as per current project pattern*).

### 4.3. Validation (`src/lib/validators/account.ts`)
- `profileUpdateSchema`: Dynamically built or generic object validation for profile fields.
- `changePasswordSchema`: Strict validation for password requirements.

## 5. Success Criteria
- Users can successfully update their editable profile fields.
- Password changes are verified and updated securely.
- UI preferences (theme/language) persist and update immediately.
- Unauthorized users cannot access or edit other users' account pages.

## 6. Implementation Checklist
- [ ] Create `src/lib/validators/account.ts`.
- [ ] Create `src/actions/account.ts`.
- [ ] Implement `src/app/[locale]/account/page.tsx` and sub-components.
- [ ] Update `UserMenu.tsx` to link to the new account page.
- [ ] Add translations to `en.json` and `vi.json`.
