# Design Spec: Modular Test Data Seeder

**Date:** 2026-05-26  
**Status:** Approved  
**Topic:** Automating realistic test data generation for QuickUni.

## 1. Goals
- Provide a reliable way to generate a clean, realistic, and consistent set of test data for development.
- Support "Clean & Seed" workflow to reset the database state.
- **Ensure Database Integrity:** Verify schema alignment before seeding; provide an "Emergency Reset" if migrations fail.
- Target the completed modules: People & Org, and Scheduling.
- Use Faker.js for realistic names, emails, and dates.

## 2. Dependencies
- `@faker-js/faker`: For realistic data generation.
- `bcryptjs`: For hashing default passwords.
- `drizzle-orm`: For database operations.
- `tsx`: For running the scripts.

## 3. Directory Structure
```text
src/db/
├── seed.ts             # Orchestrator (Main Entry)
└── seeders/
    ├── clear.ts        # Utility to truncate all tables
    ├── system.ts       # Roles, Permissions, Admin account
    ├── org.ts          # Faculties, Departments, Rooms
    ├── people.ts       # Teachers, Students, Accounts
    ├── academic.ts     # Semesters, Courses
    └── scheduling.ts   # Course Classes, Weekly Templates
```

## 4. Database Synchronization & Seeding Order

### Step -1: Migration Check (Pre-flight)
- Attempt to synchronize the database with the current schema using `drizzle-kit push`.
- If synchronization fails (e.g., destructive changes, drift):
    - **Emergency Reset:** Execute a full database wipe-out (Drop all tables, schemas, and metadata).
    - Re-run `drizzle-kit push` to create a fresh, schema-aligned database.

### Step 0: Clear Data (`seeders/clear.ts`)
- If Step -1 was a simple sync, perform a targeted `TRUNCATE` to remove existing data while keeping the schema.
- If Step -1 was an Emergency Reset, this step is skipped as the DB is already empty.

### Step 1: System Data (`seeders/system.ts`)
- Create "Admin", "Teacher", "Student" roles.
- Create default super admin account (admin/admin).
- **Dynamic Profile Setup:**
    - Create a default `profile_schema` (e.g., "Standard University Profile").
    - Create basic `profile_field` entries (e.g., "Personal Email", "Phone", "Emergency Contact").
    - Link fields to the schema using `profile_schema_field`.

### Step 2: Organization (`seeders/org.ts`)
- Generate 3-5 Faculties.
- Generate 2-3 Departments per Faculty.
- Generate 10-15 Rooms (Classrooms, Labs) with different capacities.

### Step 3: People (`seeders/people.ts`)
- Generate 10 Teachers (assigned to Departments as `employee`).
- Generate 30 Students (assigned to Departments/Classes as `student`).
- For each person:
    - Create an `account` (username = generated, password = 'password123').
    - Create a `profile` linked to the `profile_schema` from Step 1.
    - Populate `dynamic_data` JSONB with values matching the defined `profile_field` entries.
    - Link to appropriate `systemRole`.

### Step 4: Academic (`seeders/academic.ts`)
- Create 1 "Current Semester" (e.g., Semester 1, 2025-2026).
- Create 5-10 Courses (e.g., Mathematics, Computer Science, Literature).

### Step 5: Scheduling (`seeders/scheduling.ts`)
- Create 5-8 `course_class` entries for the current semester.
- Randomly assign Teachers and Rooms to these classes.
- Generate `weekly_schedule_template` using the bitmask system for each class (ensuring no conflicts if possible, or allowing some for testing).

## 5. Implementation Details
- All seeder functions should be async and return the created IDs for downstream seeding.
- Use `faker.helpers.arrayElement` to link entities randomly.
- Use `console.log` for progress tracking.

## 6. Success Criteria
- Running `npm run db:seed` wipes the DB and populates it with realistic data.
- The Admin dashboard correctly displays the generated Faculties, Teachers, and Students.
- The Scheduling system shows populated classes and templates without schema errors.
- No foreign key violations during the process.
